import { NextResponse } from 'next/server';

const KORAPAY_SECRET = process.env.KORAPAY_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sbAdmin = async (path, method = 'GET', data = null) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: data ? JSON.stringify(data) : null
  });
  return res.json();
};

export async function POST(req) {
  try {
    const { reference, userId, amount } = await req.json();

    // Verify payment with Korapay
    const verifyRes = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
      headers: {
        'Authorization': `Bearer ${KORAPAY_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      return NextResponse.json({ error: 'Payment not verified' }, { status: 400 });
    }

    const paidAmount = verifyData.data.amount;

    // Get current wallet balance
    const wallet = await sbAdmin(`wallets?user_id=eq.${userId}&select=balance`);
    if (!wallet[0]) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    const newBalance = Number(wallet[0].balance) + Number(paidAmount);

    // Update wallet balance
    await sbAdmin(`wallets?user_id=eq.${userId}`, 'PATCH', {
      balance: newBalance,
      updated_at: new Date().toISOString()
    });

    // Record transaction
    await sbAdmin('transactions', 'POST', {
      user_id: userId,
      type: 'deposit',
      amount: paidAmount,
      description: `Wallet top-up via Korapay · Ref: ${reference}`,
      status: 'completed'
    });

    return NextResponse.json({ success: true, newBalance, amount: paidAmount });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
