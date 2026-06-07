'use client'
import { useState, useEffect } from "react";
import { db, fmt, gc, ago, Ava, Badge, Empty, initKorapayDeposit } from './saConfig';

export function Splash() {
  return (
    <div className="splash">
      <div className="splash-logo">StakeArena</div>
      <div className="splash-sub">Play. Stake. Win.</div>
      <div className="splash-bar" />
    </div>
  );
}

export function Auth({ onAuth, loading }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ username: '', email: '', password: '' });
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="auth-logo">StakeArena</div>
        <div className="auth-tagline">Challenge. Stake. Claim Victory.</div>
      </div>
      <div className="auth-body">
        <div className="tabs">
          <button className={`tab ${mode === 'login' ? 'on' : ''}`} onClick={() => setMode('login')}>Login</button>
          <button className={`tab ${mode === 'register' ? 'on' : ''}`} onClick={() => setMode('register')}>Register</button>
        </div>
        {mode === 'register' && (
          <div className="field">
            <label className="flabel">Game Tag / Username</label>
            <input className="finput" placeholder="e.g. GoalKing_NG" value={f.username} onChange={set('username')} />
          </div>
        )}
        <div className="field">
          <label className="flabel">Email</label>
          <input className="finput" type="email" placeholder="Enter email" value={f.email} onChange={set('email')} />
        </div>
        <div className="field">
          <label className="flabel">Password</label>
          <input className="finput" type="password" placeholder="Min 6 characters" value={f.password} onChange={set('password')} />
        </div>
        <button className="btn-p" disabled={loading} onClick={() => onAuth(f.email, f.password, f.username, mode === 'register')}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login to Arena' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}

export function Dashboard({ profile, wallet, transactions, activeMatch, setScreen, onNav }) {
  const wr = profile ? Math.round((profile.wins / Math.max(profile.wins + profile.losses, 1)) * 100) : 0;
  const txIco = { win: '🏆', loss: '💔', deposit: '💰', withdrawal: '📤', stake: '⚔️', refund: '↩️' };
  return (
    <div className="page">
      <div className="profile-wrap">
        <Ava s={profile?.username || '?'} size="ava-lg" />
        <div>
          <div className="profile-name">{profile?.username || 'Loading...'}</div>
          <div className="profile-id">eFootball Player · StakeArena</div>
        </div>
      </div>
      <div className="gcard">
        <div className="wbal-label">Wallet Balance</div>
        <div className="wbal-amt">{fmt(wallet?.balance)}</div>
        <div className="wbal-row">
          <button className="wbal-btn wbal-dep" onClick={() => onNav('wallet')}>＋ Deposit</button>
          <button className="wbal-btn wbal-wit" onClick={() => onNav('wallet')}>↑ Withdraw</button>
        </div>
      </div>
      <div className="stats">
        <div className="stat"><div className="stat-val green">{profile?.wins || 0}</div><div className="stat-lbl">Wins</div></div>
        <div className="stat"><div className="stat-val red">{profile?.losses || 0}</div><div className="stat-lbl">Losses</div></div>
        <div className="stat"><div className="stat-val gold">{wr}%</div><div className="stat-lbl">Win Rate</div></div>
      </div>
      {activeMatch && (
        <div className="active-banner" onClick={() => setScreen('match-room')}>
          <span style={{ fontSize: 28 }}>⚽</span>
          <div className="ab-info">
            <div className="ab-title">Active Match · {fmt(activeMatch.stake_amount)}</div>
            <div className="ab-meta">Tap to open live match room</div>
          </div>
          <Badge type="live" label="LIVE" />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { icon: '⚔️', label: 'Create Challenge', s: 'create' },
          { icon: '🔍', label: 'Browse Challenges', s: 'challenges' },
          { icon: '🏆', label: 'Leaderboard', s: 'leaderboard' },
          { icon: '💳', label: 'My Wallet', s: 'wallet' },
        ].map(a => (
          <button key={a.s} className="card" style={{ cursor: 'pointer', textAlign: 'center', border: 'none', background: 'rgba(255,255,255,0.04)' }} onClick={() => setScreen(a.s)}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700 }}>{a.label}</div>
          </button>
        ))}
      </div>
      <div className="sec-hdr">
        <div className="sec-title">Recent Activity</div>
        <div className="sec-link" onClick={() => onNav('wallet')}>See all →</div>
      </div>
      {transactions.length === 0 ? <div className="card"><Empty msg="No transactions yet" /></div> : (
        <div className="card" style={{ padding: '4px 16px' }}>
          {transactions.slice(0, 4).map(tx => (
            <div key={tx.id} className="tx-row">
              <div className={`tx-ico ${tx.type}`}>{txIco[tx.type] || '💸'}</div>
              <div className="tx-info">
                <div className="tx-desc">{tx.description}</div>
                <div className="tx-time">{ago(tx.created_at)}</div>
              </div>
              <div className={`tx-amt ${tx.amount > 0 ? 'pos' : 'neg'}`}>{tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Challenges({ token, userId, wallet, profile, setScreen, setActiveMatch, showNotif, onJoin }) {
  const [tab, setTab] = useState('browse');
  const [challenges, setChallenges] = useState([]);
  const [loadingC, setLoadingC] = useState(false);
  const [stake, setStake] = useState(2000);
  const [custom, setCustom] = useState('');
  const [creating, setCreating] = useState(false);
  const presets = [1000, 2000, 5000, 10000, 20000, 50000];
  useEffect(() => { if (tab === 'browse') loadC(); }, [tab]);
  const loadC = async () => {
    setLoadingC(true);
    try {
      const data = await db.get(`challenges?status=eq.open&select=id,stake_amount,room_code,created_at,creator_id,profiles!challenges_creator_id_fkey(username)&order=created_at.desc`, token);
      setChallenges(Array.isArray(data) ? data.filter(c => c.creator_id !== userId) : []);
    } catch (e) { showNotif('Failed to load', 'err'); }
    finally { setLoadingC(false); }
  };
  const handleJoin = async (ch) => {
    if (!wallet || wallet.balance < ch.stake_amount) { showNotif('Insufficient balance!', 'err'); return; }
    await onJoin(ch); setActiveMatch(ch); setScreen('match-room');
  };
  const handleCreate = async () => {
    const amount = Number(custom) || stake;
    if (!wallet || wallet.balance < amount) { showNotif('Insufficient balance!', 'err'); return; }
    setCreating(true);
    try {
      const roomCode = gc();
      const newBal = wallet.balance - amount;
      await db.patch(`wallets?user_id=eq.${userId}`, token, { balance: newBal });
      const result = await db.post('challenges', token, { creator_id: userId, stake_amount: amount, room_code: roomCode, status: 'open' });
      await db.post('transactions', token, { user_id: userId, type: 'stake', amount: -amount, description: `Challenge created · Room ${roomCode}` });
      wallet.balance = newBal;
      const ch = Array.isArray(result) ? result[0] : result;
      setActiveMatch({ ...ch, creator_username: profile?.username });
      setScreen('match-room-create');
      showNotif('Challenge live! Share your room code.');
    } catch (e) { showNotif('Failed to create', 'err'); }
    finally { setCreating(false); }
  };
  return (
    <div className="page">
      <div className="pg-title">Challenges</div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'browse' ? 'on' : ''}`} onClick={() => setTab('browse')}>Browse</button>
        <button className={`tab ${tab === 'create' ? 'on' : ''}`} onClick={() => setTab('create')}>Create</button>
      </div>
      {tab === 'browse' && (
        <>
          <div className="sec-hdr"><div className="sec-title">Open Challenges</div><div className="sec-link" onClick={loadC}>↻ Refresh</div></div>
          {loadingC ? <Empty msg="Loading..." /> : challenges.length === 0 ? <Empty msg="No open challenges yet!" /> :
            challenges.map(ch => (
              <div key={ch.id} className="ch-row">
                <Ava s={ch.profiles?.username || '?'} />
                <div className="ch-info">
                  <div className="ch-name">{ch.profiles?.username || 'Unknown'}</div>
                  <div className="ch-meta">1v1 · {ago(ch.created_at)}</div>
                </div>
                <div className="ch-stake">{fmt(ch.stake_amount)}</div>
                <button className="btn-g" onClick={() => handleJoin(ch)}>Join</button>
              </div>
            ))
          }
        </>
      )}
      {tab === 'create' && (
        <>
          <div className="pg-sub">Set Stake Amount</div>
          <div className="stake-grid">{presets.map(p => <div key={p} className={`stake-chip ${stake === p && !custom ? 'sel' : ''}`} onClick={() => { setStake(p); setCustom(''); }}>{fmt(p)}</div>)}</div>
          <div className="field" style={{ marginTop: 8 }}>
            <label className="flabel">Custom Amount</label>
            <input className="finput" type="number" placeholder="e.g. 7500" value={custom} onChange={e => { setCustom(e.target.value); setStake(0); }} />
          </div>
          <div className="gcard" style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>YOU STAKE</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#ffd700' }}>{fmt(Number(custom) || stake)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>YOU WIN</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#00ff88' }}>{fmt((Number(custom) || stake) * 1.9)}</div>
              </div>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>* Platform takes 5% commission</div>
          </div>
          <button className="btn-p" disabled={creating} onClick={handleCreate}>{creating ? 'Creating...' : '⚔️ Create Challenge'}</button>
        </>
      )}
    </div>
  );
}

export function MatchRoomCreate({ token, activeMatch, setScreen, showNotif, setActiveMatch }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!activeMatch?.id) return;
    const poll = setInterval(async () => {
      try {
        const data = await db.get(`challenges?id=eq.${activeMatch.id}&select=status`, token);
        if (data[0]?.status === 'live') { clearInterval(poll); showNotif('Opponent joined! 🔥'); setScreen('match-room'); }
      } catch (e) {}
    }, 5000);
    return () => clearInterval(poll);
  }, [activeMatch?.id]);
  const copy = () => { if (navigator.clipboard) navigator.clipboard.writeText(activeMatch?.room_code || ''); setCopied(true); showNotif('Copied!'); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="page">
      <button className="back-btn" onClick={() => setScreen('challenges')}>← Back</button>
      <div className="pg-title">Challenge Created</div>
      <div className="roomcode-box">
        <div className="roomcode-label">Your Room Code</div>
        <div className="roomcode">{activeMatch?.room_code || '--------'}</div>
        <div className="roomcode-copy" onClick={copy}>{copied ? '✓ Copied!' : 'tap to copy'}</div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Stake</span>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, color: '#ffd700' }}>{fmt(activeMatch?.stake_amount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Status</span>
          <Badge type="wait" label="Waiting for opponent" />
        </div>
      </div>
      <div className="card" style={{ background: 'rgba(0,255,136,0.04)', borderColor: 'rgba(0,255,136,0.1)' }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.9 }}>
          📋 Share room code with opponent<br />⚽ Use code in eFootball to start<br />📸 Screenshot final score when done<br />⚠️ Disconnecting mid-game = forfeit
        </div>
      </div>
      <button className="btn-p" onClick={() => setScreen('match-room')}>▶ Open Match Room</button>
    </div>
  );
}

export function MatchRoom({ token, userId, profile, activeMatch, setScreen, showNotif }) {
  const [match, setMatch] = useState(activeMatch || {});
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);
  const isCreator = userId === match.creator_id;
  useEffect(() => { if (ended) return; const t = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(t); }, [ended]);
  useEffect(() => {
    if (!match.id) return;
    const poll = setInterval(async () => {
      try { const data = await db.get(`challenges?id=eq.${match.id}&select=*`, token); if (data[0]) setMatch(data[0]); } catch (e) {}
    }, 4000);
    return () => clearInterval(poll);
  }, [match.id]);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  const myScore = isCreator ? match.creator_score || 0 : match.opponent_score || 0;
  const oppScore = isCreator ? match.opponent_score || 0 : match.creator_score || 0;
  const oppName = isCreator ? (match.opponent_username || 'Opponent') : (match.creator_username || 'Creator');
  const updateScore = async (side, delta) => {
    const field = side === 'me' ? (isCreator ? 'creator_score' : 'opponent_score') : (isCreator ? 'opponent_score' : 'creator_score');
    const newVal = Math.max(0, (match[field] || 0) + delta);
    const update = { [field]: newVal, updated_at: new Date().toISOString() };
    setMatch(prev => ({ ...prev, ...update }));
    try { await db.patch(`challenges?id=eq.${match.id}`, token, update); } catch (e) {}
  };
  return (
    <div className="page">
      <button className="back-btn" onClick={() => setScreen('dashboard')}>← Dashboard</button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div className="pg-title" style={{ margin: 0 }}>Live Match</div>
        {!ended ? <Badge type="live" label={`${mins}:${secs}`} /> : <Badge type="done" label="FT" />}
      </div>
      <div style={{ textAlign: 'center', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#ffd700', marginBottom: 4 }}>
        Stake: {fmt(match.stake_amount)} · Win: {fmt((match.stake_amount || 0) * 1.9)}
      </div>
      <div className="match-vs">
        <div className="match-player">
          <Ava s={profile?.username || 'Me'} size="ava-lg" />
          <div className="match-pname">{profile?.username || 'You'}</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>YOU</div>
        </div>
        <div className="match-vstext">VS</div>
        <div className="match-player">
          <Ava s={oppName} size="ava-lg" color="linear-gradient(135deg,#ff6b35,#ff2d55)" />
          <div className="match-pname">{oppName}</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>OPP</div>
        </div>
      </div>
      <div className="score-box">
        <div className="score-side">
          <div className="score-num" style={{ color: myScore > oppScore ? '#00ff88' : '#fff' }}>{myScore}</div>
          <div className="score-ctrl">
            <button className="sc-btn sc-plus" onClick={() => updateScore('me', 1)} disabled={ended}>+</button>
            <button className="sc-btn sc-minus" onClick={() => updateScore('me', -1)} disabled={ended}>−</button>
          </div>
        </div>
        <div className="score-divider" />
        <div className="score-side">
          <div className="score-num" style={{ color: oppScore > myScore ? '#ff2d55' : '#fff' }}>{oppScore}</div>
          <div className="score-ctrl">
            <button className="sc-btn sc-plus" onClick={() => updateScore('opp', 1)} disabled={ended}>+</button>
            <button className="sc-btn sc-minus" onClick={() => updateScore('opp', -1)} disabled={ended}>−</button>
          </div>
        </div>
      </div>
      {!ended ? (
        <button className="btn-p" style={{ background: 'linear-gradient(135deg,#ff6b35,#ff2d55)', color: '#fff' }} onClick={() => setEnded(true)}>🏁 End Match</button>
      ) : (
        <>
          <button className="btn-p" onClick={() => setScreen('submit-result')}>📸 Submit Screenshot Result</button>
          <button className="btn-r" style={{ width: '100%', marginTop: 8 }} onClick={() => setScreen('dispute')}>⚠️ Raise Dispute</button>
        </>
      )}
    </div>
  );
}

export function SubmitResult({ token, userId, activeMatch, setScreen, showNotif, onSubmit }) {
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [winner, setWinner] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const match = activeMatch || {};
  const isCreator = userId === match.creator_id;
  const myId = isCreator ? match.creator_id : match.opponent_id;
  const oppId = isCreator ? match.opponent_id : match.creator_id;
  const myName = match.creator_username || 'You';
  const oppName = match.opponent_username || 'Opponent';

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('matchId', match.id || 'unknown');
      form.append('userId', userId);
      const res = await fetch('/api/upload-screenshot', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        setScreenshotUrl(data.url);
        setUploaded(true);
        showNotif('Screenshot uploaded! ✅');
      } else {
        showNotif('Upload failed. Try again.', 'err');
      }
    } catch (e) {
      showNotif('Upload failed. Try again.', 'err');
    } finally { setUploading(false); }
  };

  const submit = async () => {
    if (!uploaded) { showNotif('Upload screenshot first', 'err'); return; }
    if (!winner) { showNotif('Select who won', 'err'); return; }
    setSubmitting(true);
    try {
      const winnerId = winner === 'me' ? myId : oppId;
      // Save screenshot URL to challenge
      if (screenshotUrl) {
        await db.patch(`challenges?id=eq.${match.id}`, token, { screenshot_url: screenshotUrl });
      }
      const res = await db.rpc('claim_win', token, { p_challenge_id: match.id, p_winner_id: winnerId });
      if (res?.error) showNotif('Submit failed. Admin will review.', 'err');
      else showNotif(winner === 'me' ? `🏆 You won ${fmt(res.payout)}!` : 'Result submitted.');
      await onSubmit(); setScreen('dashboard');
    } catch (e) { showNotif('Result submitted. Admin will verify.'); setScreen('dashboard'); }
    finally { setSubmitting(false); }
  };
  return (
    <div className="page">
      <button className="back-btn" onClick={() => setScreen('match-room')}>← Back</button>
      <div className="pg-title">Submit Result</div>
      <div className="card">
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Room Code</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, color: '#00ff88', letterSpacing: 4 }}>{match.room_code || 'N/A'}</div>
      </div>
      <label style={{ display: 'block', cursor: 'pointer' }}>
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
        <div className={`upload-zone ${uploaded ? 'done' : ''}`}>
          <div className="upload-ico">{uploading ? '⏳' : uploaded ? '✅' : '📸'}</div>
          <div className="upload-text">
            {uploading ? 'Uploading...' : uploaded ? 'Screenshot uploaded successfully' : 'Tap to upload final score screenshot'}
          </div>
          {screenshotUrl && <img src={screenshotUrl} alt="Screenshot" style={{ width: '100%', borderRadius: 8, marginTop: 10, maxHeight: 200, objectFit: 'cover' }} />}
        </div>
      </label>
      <div className="pg-sub">Who Won?</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[{ id: 'me', label: `${myName} (Me)` }, { id: 'opp', label: oppName }].map(p => (
          <button key={p.id} className="card"
            style={{ flex: 1, cursor: 'pointer', textAlign: 'center', borderColor: winner === p.id ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.07)', background: winner === p.id ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.04)' }}
            onClick={() => setWinner(p.id)}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700 }}>{p.label}</div>
          </button>
        ))}
      </div>
      <button className="btn-p" disabled={submitting} onClick={submit}>{submitting ? 'Submitting...' : 'Submit Result'}</button>
    </div>
  );
}

export function Dispute({ token, userId, activeMatch, setScreen, showNotif }) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const match = activeMatch || {};
  const submit = async () => {
    if (!reason) { showNotif('Select a reason', 'err'); return; }
    try {
      await db.post('disputes', token, { challenge_id: match.id, raised_by: userId, reason });
      await db.patch(`challenges?id=eq.${match.id}`, token, { status: 'disputed' });
      setSubmitted(true); showNotif('Dispute filed!');
    } catch (e) { showNotif('Failed', 'err'); }
  };
  if (submitted) return (
    <div className="page">
      <div className="gcard" style={{ textAlign: 'center', padding: 40, marginTop: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Dispute Filed</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Admin will review within 24 hours.</div>
        <button className="btn-g" onClick={() => setScreen('dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
  return (
    <div className="page">
      <button className="back-btn" onClick={() => setScreen('match-room')}>← Back</button>
      <div className="pg-title">Raise Dispute</div>
      <div className="field">
        <label className="flabel">Reason</label>
        <select className="finput" value={reason} onChange={e => setReason(e.target.value)}>
          <option value="">Select a reason</option>
          <option>Opponent claims wrong score</option>
          <option>Opponent disconnected intentionally</option>
          <option>Match never started</option>
          <option>Screenshot appears edited</option>
          <option>Other</option>
        </select>
      </div>
      <button className="btn-p" onClick={submit}>Submit Dispute</button>
    </div>
  );
}
