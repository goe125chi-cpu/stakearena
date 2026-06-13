import { NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const sendEmail = async (to, subject, html) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'StakeArena <onboarding@resend.dev>',
      to,
      subject,
      html
    })
  });
  return res.json();
};

const emailTemplates = {
  challenge_accepted: (data) => ({
    subject: '⚔️ Your Challenge Was Accepted!',
    html: `
      <div style="background:#07070f;padding:40px 20px;font-family:Arial,sans-serif;max-width:500px;margin:0 auto;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#00ff88;font-size:32px;margin:0;">StakeArena</h1>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;letter-spacing:3px;">PLAY. STAKE. WIN.</p>
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin-bottom:20px;">
          <h2 style="color:#fff;font-size:22px;margin:0 0 12px;">⚔️ Challenge Accepted!</h2>
          <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;">
            <strong style="color:#00ff88;">${data.opponentName}</strong> has accepted your challenge!
          </p>
          <div style="background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:10px;padding:16px;margin:16px 0;">
            <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0 0 4px;letter-spacing:1px;">STAKE AMOUNT</p>
            <p style="color:#ffd700;font-size:28px;font-weight:bold;margin:0;">₦${Number(data.stakeAmount).toLocaleString()}</p>
          </div>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;">Room Code: <strong style="color:#00ff88;letter-spacing:2px;">${data.roomCode}</strong></p>
        </div>
        <div style="text-align:center;">
          <a href="https://stakearena-sepia.vercel.app" style="background:linear-gradient(135deg,#00ff88,#00ccaa);color:#07070f;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
            Open Match Room →
          </a>
        </div>
        <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin-top:24px;">StakeArena · Nigeria's #1 eFootball Staking Platform</p>
      </div>
    `
  }),

  match_result: (data) => ({
    subject: data.isWinner ? '🏆 You Won! Winnings Credited!' : '💔 Match Result Submitted',
    html: `
      <div style="background:#07070f;padding:40px 20px;font-family:Arial,sans-serif;max-width:500px;margin:0 auto;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#00ff88;font-size:32px;margin:0;">StakeArena</h1>
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">${data.isWinner ? '🏆' : data.isDraw ? '🤝' : '💔'}</div>
          <h2 style="color:#fff;font-size:24px;margin:0 0 8px;">
            ${data.isWinner ? 'You Won!' : data.isDraw ? "It's a Draw!" : 'Match Over'}
          </h2>
          ${data.isWinner ? `<p style="color:#00ff88;font-size:28px;font-weight:bold;">+₦${Number(data.payout).toLocaleString()} credited!</p>` : ''}
          ${data.isDraw ? `<p style="color:#ffaa00;font-size:18px;">₦${Number(data.stakeAmount).toLocaleString()} refunded to your wallet</p>` : ''}
        </div>
        <div style="text-align:center;">
          <a href="https://stakearena-sepia.vercel.app" style="background:linear-gradient(135deg,#00ff88,#00ccaa);color:#07070f;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
            View Wallet →
          </a>
        </div>
      </div>
    `
  }),

  withdrawal_approved: (data) => ({
    subject: '✅ Withdrawal Approved!',
    html: `
      <div style="background:#07070f;padding:40px 20px;font-family:Arial,sans-serif;max-width:500px;margin:0 auto;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#00ff88;font-size:32px;margin:0;">StakeArena</h1>
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <h2 style="color:#fff;font-size:24px;margin:0 0 8px;">Withdrawal Approved!</h2>
          <p style="color:#ffd700;font-size:28px;font-weight:bold;">₦${Number(data.amount).toLocaleString()}</p>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;">Sent to ${data.bankName} · ${data.accountNumber}</p>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:12px;">Funds should arrive within 24 hours.</p>
        </div>
      </div>
    `
  }),

  welcome: (data) => ({
    subject: '🎮 Welcome to StakeArena!',
    html: `
      <div style="background:#07070f;padding:40px 20px;font-family:Arial,sans-serif;max-width:500px;margin:0 auto;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#00ff88;font-size:40px;margin:0;">StakeArena</h1>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;letter-spacing:3px;">PLAY. STAKE. WIN.</p>
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin-bottom:20px;">
          <h2 style="color:#fff;font-size:22px;margin:0 0 12px;">Welcome, ${data.username}! 🎉</h2>
          <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;">
            You're now part of Nigeria's #1 eFootball staking platform!
          </p>
          <div style="margin:20px 0;">
            ${['Fund your wallet to get started', 'Create or join a 1v1 challenge', 'Play the match on eFootball', 'Submit your result and get paid!'].map((s, i) => 
              `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <span style="background:rgba(0,255,136,0.2);color:#00ff88;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;flex-shrink:0;">${i+1}</span>
                <span style="color:rgba(255,255,255,0.7);font-size:14px;">${s}</span>
              </div>`
            ).join('')}
          </div>
        </div>
        <div style="text-align:center;">
          <a href="https://stakearena-sepia.vercel.app" style="background:linear-gradient(135deg,#00ff88,#00ccaa);color:#07070f;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
            Start Playing Now →
          </a>
        </div>
      </div>
    `
  })
};

export async function POST(req) {
  try {
    const { type, to, data } = await req.json();
    if (!type || !to) return NextResponse.json({ error: 'Missing type or email' }, { status: 400 });
    const template = emailTemplates[type];
    if (!template) return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
    const { subject, html } = template(data || {});
    const result = await sendEmail(to, subject, html);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
