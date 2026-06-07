import { NextResponse } from 'next/server';

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
    const { userId, amount } = await req.json();

    // Call the pay_referral_commission function
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pay_referral_commission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ p_user_id: userId, p_deposit_amount: amount })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Referral commission error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
