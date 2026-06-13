'use client'
import { useState, useEffect, useCallback } from "react";
import { db, fmt, ago, Ava, Badge, Loading, Empty, CSS, initKorapayDeposit, isOnline } from './saConfig';
import { Splash, Auth, Dashboard, Challenges, MatchRoomCreate, MatchRoom, SubmitResult, Dispute } from './saScreens';
import { ReferralScreen } from './saReferral';
import OneSignalInit, { sendNotification } from './OneSignalInit';

// Email helper
const sendEmail = async (type, to, data) => {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, data })
    });
  } catch (e) { console.error('Email error:', e); }
};

function Leaderboard({ token, userId }) {
  const [board, setBoard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  useEffect(() => {
    db.get('profiles?select=id,username,wins,losses,total_earned,last_seen&order=wins.desc&limit=10', token)
      .then(data => { if (Array.isArray(data)) { setBoard(data); const i = data.findIndex(p => p.id === userId); if (i >= 0) setMyRank(i + 1); } }).catch(() => {});
  }, []);
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="page">
      <div className="pg-title">🏆 Leaderboard</div>
      {myRank && (
        <div className="card" style={{ background: 'linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,165,0,0.04))', borderColor: 'rgba(255,215,0,0.2)', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: 2 }}>YOUR RANK</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 52, fontWeight: 900, color: '#ffd700', lineHeight: 1 }}>#{myRank}</div>
        </div>
      )}
      {board.length === 0 ? <Empty msg="No players yet. Be the first!" /> :
        board.map((p, i) => {
          const wr = Math.round(p.wins / Math.max(p.wins + p.losses, 1) * 100);
          return (
            <div key={p.id} className={`lb-row ${p.id === userId ? 'me' : ''}`}>
              <div className="lb-rank" style={{ color: i < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][i] : 'rgba(255,255,255,0.3)' }}>{i < 3 ? medals[i] : `#${i + 1}`}</div>
              <Ava s={p.username} color={p.id === userId ? undefined : 'linear-gradient(135deg,#333,#555)'} online={isOnline(p.last_seen)} />
              <div style={{ flex: 1 }}>
                <div className="lb-name">{p.username}{p.id === userId ? ' (You)' : ''}</div>
                <div className="lb-rec">{p.wins}W · {p.losses}L · {wr}% WR</div>
              </div>
              <div className="lb-earn">{fmt(p.total_earned)}</div>
            </div>
          );
        })
      }
    </div>
  );
}

const BANK_ACCOUNTS = [
  { bankName: 'Opay', accountNumber: '6112501274', accountName: 'Joseph Chibunna Amadi' },
  { bankName: 'Moniepoint MFB', accountNumber: '9115910830', accountName: 'Joseph Chibunna Amadi' },
];

function Wallet({ token, userId, wallet, onDeposit, onWithdraw }) {
  const [tab, setTab] = useState('history');
  const [txs, setTxs] = useState([]);
  const [depAmt, setDepAmt] = useState('');
  const [depRef, setDepRef] = useState('');
  const [witAmt, setWitAmt] = useState('');
  const [bank, setBank] = useState('GTBank');
  const [acct, setAcct] = useState('');
  const presets = [1000, 2000, 5000, 10000, 20000, 50000];
  const txIco = { win: '🏆', loss: '💔', deposit: '💰', withdrawal: '📤', stake: '⚔️', refund: '↩️' };
  useEffect(() => {
    if (tab === 'history') db.get(`transactions?user_id=eq.${userId}&order=created_at.desc&limit=30`, token).then(d => { if (Array.isArray(d)) setTxs(d); }).catch(() => {});
  }, [tab]);
  return (
    <div className="page">
      <div className="pg-title">💳 Wallet</div>
      <div className="gcard">
        <div className="wbal-label">Total Balance</div>
        <div className="wbal-amt">{fmt(wallet?.balance)}</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Live · synced with Supabase</div>
      </div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'deposit' ? 'on' : ''}`} onClick={() => setTab('deposit')}>Deposit</button>
        <button className={`tab ${tab === 'withdraw' ? 'on' : ''}`} onClick={() => setTab('withdraw')}>Withdraw</button>
        <button className={`tab ${tab === 'history' ? 'on' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>
      {tab === 'deposit' && (
        <>
          <div className="stake-grid">{presets.map(p => <div key={p} className={`stake-chip ${depAmt == p ? 'sel' : ''}`} onClick={() => setDepAmt(p)}>{fmt(p)}</div>)}</div>
          <div className="field" style={{ marginTop: 8 }}>
            <label className="flabel">Custom Amount</label>
            <input className="finput" type="number" placeholder="Enter amount (₦)" value={depAmt} onChange={e => setDepAmt(e.target.value)} />
          </div>

          <div className="pg-sub" style={{ marginTop: 4 }}>🏦 Choose a Bank to Transfer To</div>
          {BANK_ACCOUNTS.map((acc, i) => (
            <div key={i} className="card" style={{ background: 'rgba(0,255,136,0.06)', borderColor: 'rgba(0,255,136,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Bank Name</span>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 700 }}>{acc.bankName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Account Number</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, color: '#00ff88', fontWeight: 600 }}>{acc.accountNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Account Name</span>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700 }}>{acc.accountName}</span>
              </div>
            </div>
          ))}

          <div className="card" style={{ background: 'rgba(255,165,0,0.04)', borderColor: 'rgba(255,165,0,0.15)' }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,165,0,0.8)', lineHeight: 1.9 }}>
              1️⃣ Transfer the exact amount above to this account<br />
              2️⃣ Enter the transaction reference / sender name below<br />
              3️⃣ Tap submit — admin will verify and credit your wallet within minutes
            </div>
          </div>

          <div className="field">
            <label className="flabel">Transaction Reference / Sender Name</label>
            <input className="finput" type="text" placeholder="e.g. TRF/240601/ABC123 or your name" value={depRef} onChange={e => setDepRef(e.target.value)} />
          </div>

          <button className="btn-p" disabled={!depAmt || !depRef} onClick={() => onDeposit(depAmt, depRef)}>
            ✅ I've Made the Transfer — Submit
          </button>
        </>
      )}
      {tab === 'withdraw' && (
        <>
          <div className="field"><label className="flabel">Amount</label><input className="finput" type="number" placeholder="Enter amount" value={witAmt} onChange={e => setWitAmt(e.target.value)} /></div>
          <div className="field">
            <label className="flabel">Bank Name</label>
            <select className="finput" value={bank} onChange={e => setBank(e.target.value)}>
              {['GTBank','Access Bank','First Bank','Zenith Bank','UBA','Opay','Palmpay','Kuda'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="field"><label className="flabel">Account Number</label><input className="finput" type="number" placeholder="10-digit account number" value={acct} onChange={e => setAcct(e.target.value)} /></div>
          <button className="btn-p" disabled={!witAmt || !acct} onClick={() => onWithdraw(witAmt, bank, acct)}>Request Withdrawal</button>
        </>
      )}
      {tab === 'history' && (
        txs.length === 0 ? <Empty msg="No transactions yet" /> :
          <div className="card" style={{ padding: '4px 16px' }}>
            {txs.map(tx => (
              <div key={tx.id} className="tx-row">
                <div className={`tx-ico ${tx.type}`}>{txIco[tx.type] || '💸'}</div>
                <div className="tx-info"><div className="tx-desc">{tx.description}</div><div className="tx-time">{ago(tx.created_at)}</div></div>
                <div className={`tx-amt ${tx.amount > 0 ? 'pos' : 'neg'}`}>{tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}</div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
}

function Admin({ token, showNotif }) {
  const [tab, setTab] = useState('disputes');
  const [disputes, setDisputes] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [stats, setStats] = useState({ vol: 0, matches: 0 });
  const [recentMatches, setRecentMatches] = useState([]);
  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const [d, w, ch, pending, dep] = await Promise.all([
        db.get('disputes?status=eq.pending&select=*,profiles!disputes_raised_by_fkey(username),challenges(id,stake_amount,room_code,creator_id,opponent_id,screenshot_url,profiles!challenges_creator_id_fkey(username))&order=created_at.desc', token),
        db.get('withdrawal_requests?status=eq.pending&select=*,profiles(username)&order=created_at.desc', token),
        db.get('challenges?select=stake_amount,status', token),
        db.get('challenges?status=eq.completed&select=id,stake_amount,room_code,screenshot_url,creator_id,opponent_id,winner_id,updated_at,profiles!challenges_creator_id_fkey(username)&order=updated_at.desc&limit=10', token),
        db.get('deposit_requests?status=eq.pending&select=*,profiles(username)&order=created_at.desc', token),
      ]);
      if (Array.isArray(d)) setDisputes(d);
      if (Array.isArray(w)) setWithdrawals(w);
      if (Array.isArray(ch)) setStats({ vol: ch.reduce((s, c) => s + (c.stake_amount || 0) * 2, 0), matches: ch.length });
      if (Array.isArray(pending)) setRecentMatches(pending);
      if (Array.isArray(dep)) setDeposits(dep);
    } catch (e) {}
  };
  const resolveDispute = async (d, winnerId, winnerName) => {
    try {
      await db.rpc('admin_resolve_dispute', token, { p_dispute_id: d.id, p_challenge_id: d.challenges?.id || d.challenge_id, p_winner_id: winnerId });
      setDisputes(prev => prev.filter(x => x.id !== d.id)); showNotif(`Resolved → ${winnerName} wins 🏆`);
    } catch (e) { showNotif('Failed', 'err'); }
  };
  const approveDeposit = async (dep) => {
    try {
      const w = await db.get(`wallets?user_id=eq.${dep.user_id}&select=balance`, token);
      const newBal = (w[0]?.balance || 0) + Number(dep.amount);
      await db.patch(`wallets?user_id=eq.${dep.user_id}`, token, { balance: newBal });
      await db.post('transactions', token, { user_id: dep.user_id, type: 'deposit', amount: Number(dep.amount), description: `Wallet top-up · Bank transfer · Ref: ${dep.reference}` });
      await db.patch(`deposit_requests?id=eq.${dep.id}`, token, { status: 'approved' });
      // Pay referral commission
      try {
        await fetch('/api/pay-referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: dep.user_id, amount: Number(dep.amount) }) });
      } catch(e) {}
      setDeposits(prev => prev.filter(x => x.id !== dep.id));
      showNotif(`✅ ${fmt(dep.amount)} credited to ${dep.profiles?.username}!`);
    } catch (e) { showNotif('Failed', 'err'); }
  };

  const rejectDeposit = async (dep) => {
    try {
      await db.patch(`deposit_requests?id=eq.${dep.id}`, token, { status: 'rejected' });
      setDeposits(prev => prev.filter(x => x.id !== dep.id));
      showNotif('Deposit rejected');
    } catch (e) { showNotif('Failed', 'err'); }
  };

  const approveWd = async (wd) => {
    try {
      await db.patch(`withdrawal_requests?id=eq.${wd.id}`, token, { status: 'approved' });
      // Get user email and notify
      try {
        const userProf = await db.get(`profiles?id=eq.${wd.user_id}&select=username`, token);
        await sendEmail('withdrawal_approved', wd.profiles?.email || '', {
          amount: wd.amount, bankName: wd.bank_name, accountNumber: wd.account_number
        });
      } catch(e) {}
      setWithdrawals(prev => prev.filter(x => x.id !== wd.id)); showNotif('Approved & email sent!');
    }
    catch (e) { showNotif('Failed', 'err'); }
  };
  const rejectWd = async (wd) => {
    try {
      await db.patch(`withdrawal_requests?id=eq.${wd.id}`, token, { status: 'rejected' });
      const ownerW = await db.get(`wallets?user_id=eq.${wd.user_id}&select=balance`, token);
      if (ownerW[0]) await db.patch(`wallets?user_id=eq.${wd.user_id}`, token, { balance: ownerW[0].balance + wd.amount });
      setWithdrawals(prev => prev.filter(x => x.id !== wd.id)); showNotif('Rejected & refunded');
    } catch (e) { showNotif('Failed', 'err'); }
  };
  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div className="pg-title" style={{ margin: 0 }}>Admin Panel</div>
        <Badge type="live" label="ADMIN" />
      </div>
      <div className="stats" style={{ marginBottom: 18 }}>
        <div className="stat"><div className="stat-val gold" style={{ fontSize: 16 }}>{fmt(stats.vol)}</div><div className="stat-lbl">Volume</div></div>
        <div className="stat"><div className="stat-val green">{stats.matches}</div><div className="stat-lbl">Matches</div></div>
        <div className="stat"><div className="stat-val red">{disputes.length}</div><div className="stat-lbl">Disputes</div></div>
      </div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'deposits' ? 'on' : ''}`} onClick={() => setTab('deposits')}>Deposits ({deposits.length})</button>
        <button className={`tab ${tab === 'disputes' ? 'on' : ''}`} onClick={() => setTab('disputes')}>Disputes ({disputes.length})</button>
        <button className={`tab ${tab === 'withdrawals' ? 'on' : ''}`} onClick={() => setTab('withdrawals')}>Withdrawals</button>
      </div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'results' ? 'on' : ''}`} onClick={() => setTab('results')}>Results</button>
      </div>
      {tab === 'deposits' && (
        deposits.length === 0 ? <Empty msg="✅ No pending deposits" /> :
          deposits.map(dep => (
            <div key={dep.id} className="card" style={{ background: 'rgba(0,255,136,0.04)', borderColor: 'rgba(0,255,136,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Ava s={dep.profiles?.username || '?'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700 }}>{dep.profiles?.username}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{ago(dep.created_at)}</div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, color: '#ffd700' }}>{fmt(dep.amount)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: 1 }}>REFERENCE / SENDER</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: '#00ff88' }}>{dep.reference || 'No reference provided'}</div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,165,0,0.7)', marginBottom: 12 }}>
                ⚠️ Verify ₦{Number(dep.amount).toLocaleString()} was received in Opay (6112501274) before approving
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-g" style={{ flex: 1 }} onClick={() => approveDeposit(dep)}>✅ Verified — Credit Wallet</button>
                <button className="btn-r" style={{ flex: 1 }} onClick={() => rejectDeposit(dep)}>❌ Reject</button>
              </div>
            </div>
          ))
      )}
      {tab === 'disputes' && (disputes.length === 0 ? <Empty msg="✅ No pending disputes" /> :
        disputes.map(d => {
          const ch = d.challenges || {};
          return (
            <div key={d.id} className="disp-card">
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>⚠️ {d.reason}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Room: {ch.room_code} · Stake: {fmt(ch.stake_amount)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-g" style={{ flex: 1, fontSize: 13 }} onClick={() => resolveDispute(d, ch.creator_id, ch.profiles?.username || 'P1')}>{ch.profiles?.username || 'P1'} Wins</button>
                <button className="btn-g" style={{ flex: 1, fontSize: 13, background: 'linear-gradient(135deg,#ff6b35,#ff2d55)', color: '#fff' }} onClick={() => resolveDispute(d, ch.opponent_id, 'P2')}>P2 Wins</button>
              </div>
            </div>
          );
        })
      )}
      {tab === 'results' && (
        recentMatches.length === 0 ? <Empty msg="No completed matches yet" /> :
          recentMatches.map(m => (
            <div key={m.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700 }}>
                    {m.profiles?.username || 'Player 1'} vs Opponent
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                    Room: {m.room_code} · {ago(m.updated_at)}
                  </div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800, color: '#ffd700' }}>
                  {fmt(m.stake_amount)}
                </div>
              </div>
              {m.screenshot_url ? (
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>SUBMITTED SCREENSHOT</div>
                  <img src={m.screenshot_url} alt="Match screenshot"
                    style={{ width: '100%', borderRadius: 10, maxHeight: 220, objectFit: 'cover', border: '1px solid rgba(0,255,136,0.2)' }}
                    onClick={() => window.open(m.screenshot_url, '_blank')}
                  />
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: 'rgba(0,255,136,0.5)', marginTop: 4 }}>tap to view full size</div>
                </div>
              ) : (
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>No screenshot submitted</div>
              )}
            </div>
          ))
      )}
      {tab === 'withdrawals' && (withdrawals.length === 0 ? <Empty msg="✅ No pending withdrawals" /> :
        withdrawals.map(wd => (
          <div key={wd.id} className="card" style={{ background: 'rgba(255,215,0,0.04)', borderColor: 'rgba(255,215,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Ava s={wd.profiles?.username || '?'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700 }}>{wd.profiles?.username}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{ago(wd.created_at)}</div>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, color: '#ffd700' }}>{fmt(wd.amount)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 1 }}>PAYMENT DETAILS — SEND VIA KORAPAY</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Bank</span>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 700 }}>{wd.bank_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Account No.</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, color: '#00ff88', fontWeight: 600 }}>{wd.account_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Amount to Send</span>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 800, color: '#ffd700' }}>{fmt(wd.amount)}</span>
              </div>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,165,0,0.7)', marginBottom: 12 }}>
              ⚠️ Send payment via Korapay dashboard first, then tap Approve
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-g" style={{ flex: 1 }} onClick={() => approveWd(wd)}>✅ Sent — Approve</button>
              <button className="btn-r" style={{ flex: 1 }} onClick={() => rejectWd(wd)}>❌ Reject & Refund</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function StakeArena() {
  const [screen, setScreen] = useState('splash');
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [activeNav, setActiveNav] = useState('home');
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(false);
  const isAdmin = profile?.is_admin === true;
  const showNotif = (msg, type = 'success') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 2800); };

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('sa_session') : null;
      if (saved) {
        const { token: t, userId: u, email: e } = JSON.parse(saved);
        setToken(t); setUserId(u); setUserEmail(e);
        loadUserData(u, t).then(() => setScreen('dashboard'));
      } else { setTimeout(() => setScreen('auth'), 2600); }
    } catch { setTimeout(() => setScreen('auth'), 2600); }
  }, []);

  const loadUserData = useCallback(async (uid, tok) => {
    try {
      const [p, w, tx] = await Promise.all([
        db.get(`profiles?id=eq.${uid}&select=*`, tok),
        db.get(`wallets?user_id=eq.${uid}&select=*`, tok),
        db.get(`transactions?user_id=eq.${uid}&order=created_at.desc&limit=10`, tok),
      ]);
      if (p[0]) setProfile(p[0]);
      if (w[0]) setWallet(w[0]);
      if (Array.isArray(tx)) setTransactions(tx);
    } catch (e) { console.error(e); }
  }, []);

  // Presence heartbeat - update last_seen every 30s while app is open
  useEffect(() => {
    if (!token || !userId) return;
    const updatePresence = () => {
      db.patch(`profiles?id=eq.${userId}`, token, { last_seen: new Date().toISOString() }).catch(() => {});
    };
    updatePresence();
    const interval = setInterval(updatePresence, 30000);
    return () => clearInterval(interval);
  }, [token, userId]);

  const handleAuth = async (email, password, username, isSignUp) => {
    setLoading(true);
    try {
      const data = isSignUp ? await db.signup(email, password, username) : await db.signin(email, password);
      if (data.error || data.msg) { showNotif(data.error?.message || data.msg || 'Auth failed', 'err'); return; }
      const tok = data.access_token;
      const uid = data.user?.id;
      const em = data.user?.email;
      // Handle referral code from URL
      if (isSignUp) {
        try {
          const urlRef = new URLSearchParams(window.location.search).get('ref');
          if (urlRef) {
            const refProfiles = await db.get(`profiles?referral_code=eq.${urlRef}&select=id`, tok);
            if (refProfiles[0]) {
              await db.patch(`profiles?id=eq.${uid}`, tok, { referred_by: refProfiles[0].id });
              await fetch('/api/v1/rest', { method: 'POST' }).catch(() => {});
              // Insert referral record
              await db.post('referrals', tok, { referrer_id: refProfiles[0].id, referred_id: uid });
            }
          }
        } catch (e) { console.error('Referral setup error:', e); }
      }
      if (typeof window !== 'undefined') localStorage.setItem('sa_session', JSON.stringify({ token: tok, userId: uid, email: em }));
      setToken(tok); setUserId(uid); setUserEmail(em);
      await loadUserData(uid, tok);
      setScreen('dashboard'); setActiveNav('home');
      showNotif(isSignUp ? 'Account created! Welcome 🎉' : 'Welcome back!');
      // Send welcome email
      if (isSignUp) {
        await sendEmail('welcome', em, { username: f?.username || em.split('@')[0] });
      }
    } catch (e) { showNotif('Connection error. Try again.', 'err'); }
    finally { setLoading(false); }
  };

  const nav = (to) => {
    setActiveNav(to);
    setScreen(to === 'home' ? 'dashboard' : to);
    if (to === 'home') loadUserData(userId, token);
  };

  const handleDeposit = async (amount, reference) => {
    setLoading(true);
    try {
      await db.post('deposit_requests', token, {
        user_id: userId,
        amount: Number(amount),
        reference: reference || '',
        status: 'pending'
      });
      showNotif('Deposit submitted! Admin will verify shortly. ⏳');
    } catch (e) { showNotif('Failed to submit. Try again.', 'err'); }
    finally { setLoading(false); }
  };

  const handleWithdraw = async (amount, bank, acct) => {
    if ((wallet?.balance || 0) < Number(amount)) { showNotif('Insufficient balance!', 'err'); return; }
    setLoading(true);
    try {
      const newBal = wallet.balance - Number(amount);
      await db.patch(`wallets?user_id=eq.${userId}`, token, { balance: newBal });
      await db.post('withdrawal_requests', token, { user_id: userId, amount: Number(amount), bank_name: bank, account_number: acct });
      await db.post('transactions', token, { user_id: userId, type: 'withdrawal', amount: -Number(amount), description: `Withdrawal to ${bank}`, status: 'pending' });
      setWallet(prev => ({ ...prev, balance: newBal }));
      showNotif('Withdrawal request submitted!');
    } catch (e) { showNotif('Withdrawal failed', 'err'); }
    finally { setLoading(false); }
  };

  const handleJoinChallenge = async (ch) => {
    if (!wallet || wallet.balance < ch.stake_amount) { showNotif('Insufficient balance!', 'err'); return; }
    setLoading(true);
    try {
      const newBal = wallet.balance - ch.stake_amount;
      await db.patch(`wallets?user_id=eq.${userId}`, token, { balance: newBal });
      await db.patch(`challenges?id=eq.${ch.id}`, token, { opponent_id: userId, status: 'live' });
      await db.post('transactions', token, { user_id: userId, type: 'stake', amount: -ch.stake_amount, description: `Joined challenge · Room ${ch.room_code}` });
      setWallet(prev => ({ ...prev, balance: newBal }));
      setActiveMatch({ ...ch, opponent_id: userId });
      // Notify challenge creator
      try {
        await sendNotification([ch.creator_id], '⚔️ Challenge Accepted!', `${profile?.username} joined your challenge! Time to play. Stake: ${fmt(ch.stake_amount)}`, 'https://stakearena-sepia.vercel.app');
        // Get creator email and send email notification
        const creatorProfile = await db.get(`profiles?id=eq.${ch.creator_id}&select=id`, token);
        const creatorAuth = await db.get(`profiles?id=eq.${ch.creator_id}&select=username`, token);
        if (creatorAuth[0]) {
          await sendEmail('challenge_accepted', userEmail, {
            opponentName: profile?.username,
            stakeAmount: ch.stake_amount,
            roomCode: ch.room_code
          });
        }
      } catch(e) {}
    } catch (e) { showNotif('Failed to join', 'err'); }
    finally { setLoading(false); }
  };

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'challenges', icon: '⚔️', label: 'Challenges' },
    { id: 'leaderboard', icon: '🏆', label: 'Rankings' },
    { id: 'wallet', icon: '💳', label: 'Wallet' },
    { id: 'referral', icon: '👥', label: 'Refer' },
    ...(isAdmin ? [{ id: 'admin', icon: '🛡️', label: 'Admin' }] : []),
  ];

  const showNav = token && !['splash', 'auth'].includes(screen);
  const shared = { token, userId, profile, wallet, transactions, activeMatch, setScreen, setActiveMatch, showNotif };

  const renderScreen = () => {
    switch (screen) {
      case 'splash': return <Splash />;
      case 'auth': return <Auth onAuth={handleAuth} loading={loading} />;
      case 'dashboard': return <Dashboard {...shared} onNav={nav} />;
      case 'challenges': return <Challenges {...shared} onJoin={handleJoinChallenge} />;
      case 'create': return <Challenges {...shared} onJoin={handleJoinChallenge} />;
      case 'match-room-create': return <MatchRoomCreate {...shared} />;
      case 'match-room': return <MatchRoom {...shared} />;
      case 'submit-result': return <SubmitResult {...shared} onSubmit={() => loadUserData(userId, token)} />;
      case 'dispute': return <Dispute {...shared} />;
      case 'leaderboard': return <Leaderboard token={token} userId={userId} />;
      case 'wallet': return <Wallet {...shared} onDeposit={handleDeposit} onWithdraw={handleWithdraw} />;
      case 'referral': return <ReferralScreen token={token} userId={userId} profile={profile} wallet={wallet} showNotif={showNotif} />;
      case 'admin': return <Admin token={token} showNotif={showNotif} />;
      default: return <Dashboard {...shared} onNav={nav} />;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="sa">
        <div className="sa-grid" />
        <div className="z">
          <OneSignalInit userId={userId} />
          {loading && <Loading />}
          {notif && <div className={`notif ${notif.type === 'err' ? 'err' : ''}`}>{notif.msg}</div>}
          {showNav && (
            <div className="hdr">
              <div className="hdr-logo">StakeArena</div>
              <div className="hdr-right">
                <div className="hdr-badge">{fmt(wallet?.balance)}</div>
                <Ava s={profile?.username || '?'} online={true} />
              </div>
            </div>
          )}
          {renderScreen()}
          {showNav && (
            <div className="bnav">
              {navItems.map(n => (
                <div key={n.id} className={`ni ${activeNav === n.id ? 'on' : ''}`} onClick={() => nav(n.id)}>
                  <span className="ni-ico">{n.icon}</span>
                  <span className="ni-lbl">{n.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
