'use client'
import { useState, useEffect } from "react";
import { db, fmt, ago, Ava, Empty } from './saConfig';

export function ReferralScreen({ token, userId, profile, wallet, showNotif }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadReferrals(); }, []);

  const loadReferrals = async () => {
    try {
      const data = await db.get(
        `referrals?referrer_id=eq.${userId}&select=*,profiles!referrals_referred_id_fkey(username,wins,losses)&order=created_at.desc`,
        token
      );
      if (Array.isArray(data)) setReferrals(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const copyCode = () => {
    const code = profile?.referral_code || '';
    const link = `https://stakearena-sepia.vercel.app?ref=${code}`;
    if (navigator.clipboard) navigator.clipboard.writeText(link);
    setCopied(true);
    showNotif('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    const code = profile?.referral_code || '';
    const link = `https://stakearena-sepia.vercel.app?ref=${code}`;
    const text = `🎮 Join me on StakeArena — Nigeria's #1 eFootball staking platform!\n\nChallenge players, stake money, win real cash! 💰\n\nSign up with my referral link and let's play:\n👉 ${link}\n\n#StakeArena #eFootball #Nigeria`;
    if (navigator.share) {
      navigator.share({ title: 'Join StakeArena', text, url: link });
    } else {
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      showNotif('Share text copied!');
    }
  };

  const stakes = profile?.wins + profile?.losses || 0;
  const isQualified = stakes >= 5;
  const totalEarned = profile?.referral_earnings || 0;
  const activeReferrals = referrals.filter(r => r.status === 'active').length;

  return (
    <div className="page">
      <div className="pg-title">👥 Referrals</div>

      {/* Earnings Card */}
      <div className="gcard">
        <div className="wbal-label">Total Referral Earnings</div>
        <div className="wbal-amt">{fmt(totalEarned)}</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>REFERRED</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800 }}>{referrals.length}</div>
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>ACTIVE</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#00ff88' }}>{activeReferrals}</div>
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>COMMISSION</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#ffd700' }}>2%</div>
          </div>
        </div>
      </div>

      {/* Qualification Status */}
      {!isQualified && (
        <div className="card" style={{ background: 'rgba(255,165,0,0.06)', borderColor: 'rgba(255,165,0,0.2)', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700, color: '#ffaa00', marginBottom: 6 }}>
            ⚠️ Not Yet Qualified
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
            You need <span style={{ color: '#ffaa00', fontWeight: 700 }}>{5 - stakes} more staked matches</span> to earn referral commissions.<br />
            Play {5 - stakes} more games and you'll start earning 2% of every deposit your referrals make!
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, height: 6, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(90deg,#ffaa00,#ffd700)', height: '100%', width: `${Math.min((stakes / 5) * 100, 100)}%`, borderRadius: 20, transition: 'width .3s' }} />
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
              {stakes}/5 matches played
            </div>
          </div>
        </div>
      )}

      {isQualified && (
        <div className="card" style={{ background: 'rgba(0,255,136,0.06)', borderColor: 'rgba(0,255,136,0.2)', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700, color: '#00ff88', marginBottom: 4 }}>
            ✅ You're Qualified!
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            You earn 2% of every deposit your referrals make. Keep sharing!
          </div>
        </div>
      )}

      {/* Referral Code */}
      <div className="pg-sub">Your Referral Code</div>
      <div className="roomcode-box">
        <div className="roomcode-label">Share this code or link</div>
        <div className="roomcode" style={{ fontSize: 24, letterSpacing: 4 }}>{profile?.referral_code || '----'}</div>
        <div className="roomcode-copy" onClick={copyCode}>{copied ? '✓ Link Copied!' : 'tap to copy referral link'}</div>
      </div>

      {/* Share Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className="btn-p" style={{ flex: 1 }} onClick={copyCode}>📋 Copy Link</button>
        <button className="btn-p" style={{ flex: 1, background: 'linear-gradient(135deg,#25D366,#128C7E)' }} onClick={shareCode}>📤 Share</button>
      </div>

      {/* How it works */}
      <div className="card" style={{ background: 'rgba(0,204,255,0.04)', borderColor: 'rgba(0,204,255,0.15)', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>How it works</div>
        {[
          { icon: '🔗', text: 'Share your referral link with friends' },
          { icon: '👤', text: 'Friend signs up using your link' },
          { icon: '⚽', text: 'They play matches and deposit funds' },
          { icon: '💰', text: 'You earn 2% of every deposit they make — forever!' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{s.text}</span>
          </div>
        ))}
      </div>

      {/* Referrals List */}
      <div className="sec-hdr">
        <div className="sec-title">Your Referrals</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{referrals.length} total</div>
      </div>
      {loading ? <Empty msg="Loading..." /> : referrals.length === 0 ? (
        <Empty msg="No referrals yet. Share your link! 🚀" />
      ) : (
        referrals.map(r => (
          <div key={r.id} className="ch-row">
            <Ava s={r.profiles?.username || '?'} color={r.status === 'active' ? undefined : 'linear-gradient(135deg,#333,#555)'} />
            <div className="ch-info">
              <div className="ch-name">{r.profiles?.username}</div>
              <div className="ch-meta">{r.profiles?.wins || 0}W · {r.profiles?.losses || 0}L · {ago(r.created_at)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 700, color: '#00ff88' }}>{fmt(r.total_commission)}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: r.status === 'active' ? '#00ff88' : 'rgba(255,165,0,0.7)' }}>
                {r.status === 'active' ? '● ACTIVE' : '○ PENDING'}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
