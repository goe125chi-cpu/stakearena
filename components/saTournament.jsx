'use client'
import { useState, useEffect } from "react";
import { db, fmt, ago, Ava, Badge, Empty, isOnline } from './saConfig';

export function TournamentScreen({ token, userId, wallet, profile, showNotif, setScreen, isAdmin }) {
  const [tab, setTab] = useState('open');
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [joining, setJoining] = useState(false);

  // Admin create form
  const [showCreate, setShowCreate] = useState(false);
  const [tName, setTName] = useState('');
  const [tFee, setTFee] = useState(1000);
  const [tSize, setTSize] = useState(8);

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'open') {
        const data = await db.get('tournaments?status=eq.open&select=*&order=created_at.desc', token);
        if (Array.isArray(data)) setTournaments(data);
      } else if (tab === 'live') {
        const data = await db.get('tournaments?status=eq.in_progress&select=*&order=started_at.desc', token);
        if (Array.isArray(data)) setTournaments(data);
      } else if (tab === 'mine') {
        const myEntries = await db.get(`tournament_players?user_id=eq.${userId}&select=tournament_id,tournaments(*)`, token);
        if (Array.isArray(myEntries)) setMyTournaments(myEntries.map(e => e.tournaments).filter(Boolean));
      } else if (tab === 'completed') {
        const data = await db.get('tournaments?status=eq.completed&select=*,profiles!tournaments_winner_id_fkey(username)&order=completed_at.desc&limit=10', token);
        if (Array.isArray(data)) setTournaments(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const joinTournament = async (t) => {
    if (!wallet || wallet.balance < t.entry_fee) { showNotif('Insufficient balance!', 'err'); return; }
    setJoining(true);
    try {
      const res = await db.rpc('join_tournament', token, { p_tournament_id: t.id, p_user_id: userId });
      if (res?.error) { showNotif(res.error, 'err'); return; }
      showNotif('🏆 Joined tournament! Good luck!');
      load();
    } catch (e) { showNotif('Failed to join', 'err'); }
    finally { setJoining(false); }
  };

  const createTournament = async () => {
    if (!tName.trim()) { showNotif('Enter tournament name', 'err'); return; }
    try {
      await db.post('tournaments', token, { name: tName, entry_fee: Number(tFee), max_players: Number(tSize), created_by: userId });
      showNotif('Tournament created! 🏆');
      setShowCreate(false);
      setTName('');
      load();
    } catch (e) { showNotif('Failed to create', 'err'); }
  };

  if (selected) {
    return <TournamentBracket token={token} userId={userId} profile={profile} tournament={selected} onBack={() => setSelected(null)} showNotif={showNotif} setScreen={setScreen} />;
  }

  return (
    <div className="page">
      <div className="pg-title">🏆 Tournaments</div>

      {isAdmin && (
        <button className="btn-p" style={{ marginBottom: 16, background: 'linear-gradient(135deg,#ffd700,#ffaa00)', color: '#07070f' }} onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? '✕ Cancel' : '➕ Create Tournament'}
        </button>
      )}

      {showCreate && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="field">
            <label className="flabel">Tournament Name</label>
            <input className="finput" placeholder="e.g. Friday Night Cup" value={tName} onChange={e => setTName(e.target.value)} />
          </div>
          <div className="field">
            <label className="flabel">Entry Fee (₦)</label>
            <input className="finput" type="number" value={tFee} onChange={e => setTFee(e.target.value)} />
          </div>
          <div className="field">
            <label className="flabel">Number of Players</label>
            <select className="finput" value={tSize} onChange={e => setTSize(e.target.value)}>
              <option value={4}>4 Players</option>
              <option value={8}>8 Players</option>
              <option value={16}>16 Players</option>
            </select>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
            Prize Pool: {fmt(tFee * tSize * 0.95)} (after 5% fee) · Winner takes all
          </div>
          <button className="btn-p" onClick={createTournament}>Create Tournament</button>
        </div>
      )}

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'open' ? 'on' : ''}`} onClick={() => setTab('open')}>Open</button>
        <button className={`tab ${tab === 'live' ? 'on' : ''}`} onClick={() => setTab('live')}>Live</button>
        <button className={`tab ${tab === 'mine' ? 'on' : ''}`} onClick={() => setTab('mine')}>Mine</button>
        <button className={`tab ${tab === 'completed' ? 'on' : ''}`} onClick={() => setTab('completed')}>Past</button>
      </div>

      {loading ? <Empty msg="Loading..." /> : (() => {
        const list = tab === 'mine' ? myTournaments : tournaments;
        if (list.length === 0) return <Empty msg={tab === 'open' ? 'No open tournaments. Check back soon!' : `No ${tab} tournaments`} />;
        return list.map(t => (
          <div key={t.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(t)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 19, fontWeight: 800 }}>{t.name}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{t.max_players} players · {fmt(t.entry_fee)} entry</div>
              </div>
              {t.status === 'open' && <Badge type="wait" label="OPEN" />}
              {t.status === 'in_progress' && <Badge type="live" label="LIVE" />}
              {t.status === 'completed' && <Badge type="done" label="ENDED" />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>PRIZE POOL</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 900, color: '#ffd700' }}>{fmt(t.entry_fee * t.max_players * 0.95)}</div>
              </div>
              {t.status === 'completed' && t.profiles && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>CHAMPION</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 800, color: '#00ff88' }}>🏆 {t.profiles.username}</div>
                </div>
              )}
              {t.status === 'open' && (
                <button className="btn-g" disabled={joining} onClick={(e) => { e.stopPropagation(); joinTournament(t); }}>
                  Join
                </button>
              )}
              {(t.status === 'in_progress' || t.status === 'mine') && (
                <button className="btn-g">View Bracket</button>
              )}
            </div>
          </div>
        ));
      })()}
    </div>
  );
}

function TournamentBracket({ token, userId, profile, tournament, onBack, showNotif, setScreen }) {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const poll = setInterval(load, 5000);
    return () => clearInterval(poll);
  }, []);

  const load = async () => {
    try {
      const [m, p] = await Promise.all([
        db.get(`tournament_matches?tournament_id=eq.${tournament.id}&select=*,p1:profiles!tournament_matches_player1_id_fkey(username),p2:profiles!tournament_matches_player2_id_fkey(username)&order=round.asc,match_number.asc`, token),
        db.get(`tournament_players?tournament_id=eq.${tournament.id}&select=*,profiles(username,last_seen)`, token),
      ]);
      if (Array.isArray(m)) setMatches(m);
      if (Array.isArray(p)) setPlayers(p);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const myMatch = matches.find(m => (m.player1_id === userId || m.player2_id === userId) && m.status !== 'completed' && !matches.some(other => other.round > m.round && (other.player1_id === userId || other.player2_id === userId)));

  const rounds = [...new Set(matches.map(m => m.round))].sort();

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← Tournaments</button>
      <div className="pg-title">{tournament.name}</div>

      <div className="gcard">
        <div className="wbal-label">Prize Pool</div>
        <div className="wbal-amt">{fmt(tournament.entry_fee * tournament.max_players * 0.95)}</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          {tournament.max_players} players · {fmt(tournament.entry_fee)} entry each
        </div>
      </div>

      {tournament.status === 'open' && (
        <div className="card">
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Registered Players ({players.length}/{tournament.max_players})</div>
          {players.map(p => (
            <div key={p.id} className="ch-row" style={{ marginBottom: 6 }}>
              <Ava s={p.profiles?.username || '?'} online={isOnline(p.profiles?.last_seen)} />
              <div className="ch-info"><div className="ch-name">{p.profiles?.username}</div></div>
            </div>
          ))}
          {players.length < tournament.max_players && (
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: 10 }}>
              Waiting for {tournament.max_players - players.length} more player(s)...
            </div>
          )}
        </div>
      )}

      {/* Your current match */}
      {myMatch && myMatch.status === 'ready' && (
        <div className="card" style={{ background: 'rgba(255,45,85,0.06)', borderColor: 'rgba(255,45,85,0.2)' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700, color: '#ff2d55', marginBottom: 8 }}>⚔️ Your Match - Round {myMatch.round}</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, marginBottom: 10 }}>
            {myMatch.p1?.username || 'TBD'} <span style={{ color: 'rgba(255,255,255,0.3)' }}>vs</span> {myMatch.p2?.username || 'TBD'}
          </div>
          <div className="roomcode-box" style={{ margin: '10px 0' }}>
            <div className="roomcode-label">Room Code</div>
            <div className="roomcode" style={{ fontSize: 24 }}>{myMatch.room_code}</div>
          </div>
          <button className="btn-p" onClick={() => showNotif('Play your match, then submit screenshot below!')}>📸 Submit Result</button>
          <TournamentSubmit token={token} userId={userId} match={myMatch} onDone={load} showNotif={showNotif} />
        </div>
      )}

      {/* Bracket display */}
      <div className="sec-hdr"><div className="sec-title">Bracket</div></div>
      {loading ? <Empty msg="Loading bracket..." /> : matches.length === 0 ? <Empty msg="Bracket will appear once tournament is full" /> : (
        rounds.map(round => (
          <div key={round} style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 8 }}>
              {round === rounds[rounds.length - 1] && matches.filter(m => m.round === round).length === 1 ? '🏆 FINAL' : `ROUND ${round}`}
            </div>
            {matches.filter(m => m.round === round).map(m => (
              <div key={m.id} className="card" style={{ padding: 12, marginBottom: 8, opacity: m.status === 'pending' ? 0.4 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: m.winner_id === m.player1_id ? 800 : 500, color: m.winner_id === m.player1_id ? '#00ff88' : '#fff' }}>
                      {m.p1?.username || 'TBD'} {m.winner_id === m.player1_id && '🏆'}
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: m.winner_id === m.player2_id ? 800 : 500, color: m.winner_id === m.player2_id ? '#00ff88' : '#fff' }}>
                      {m.p2?.username || 'TBD'} {m.winner_id === m.player2_id && '🏆'}
                    </div>
                  </div>
                  <Badge type={m.status === 'completed' ? 'done' : m.status === 'ready' ? 'wait' : 'live'} label={m.status} />
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {tournament.status === 'completed' && tournament.winner_id && (
        <div className="gcard" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800 }}>Tournament Complete!</div>
          {tournament.winner_id === userId && (
            <div style={{ color: '#00ff88', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, marginTop: 8 }}>🎉 You won {fmt(tournament.entry_fee * tournament.max_players * 0.95)}!</div>
          )}
        </div>
      )}
    </div>
  );
}

function TournamentSubmit({ token, userId, match, onDone, showNotif }) {
  const [uploading, setUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [winner, setWinner] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('matchId', match.id);
      form.append('userId', userId);
      const res = await fetch('/api/upload-screenshot', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) { setScreenshotUrl(data.url); showNotif('Screenshot uploaded!'); }
    } catch (e) { showNotif('Upload failed', 'err'); }
    finally { setUploading(false); }
  };

  const submit = async () => {
    if (!screenshotUrl) { showNotif('Upload screenshot first', 'err'); return; }
    if (!winner) { showNotif('Select winner', 'err'); return; }
    setSubmitting(true);
    try {
      const winnerId = winner === 'me' ? userId : (match.player1_id === userId ? match.player2_id : match.player1_id);
      const res = await db.rpc('submit_tournament_result', token, { p_match_id: match.id, p_winner_id: winnerId, p_screenshot_url: screenshotUrl });
      if (res?.tournament_complete) showNotif('🏆 Tournament complete!');
      else showNotif('Result submitted! Advancing winner...');
      onDone();
    } catch (e) { showNotif('Failed to submit', 'err'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: 'block', cursor: 'pointer' }}>
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        <div className={`upload-zone ${screenshotUrl ? 'done' : ''}`} style={{ padding: 16 }}>
          <div className="upload-ico" style={{ fontSize: 24 }}>{uploading ? '⏳' : screenshotUrl ? '✅' : '📸'}</div>
          <div className="upload-text" style={{ fontSize: 12 }}>{uploading ? 'Uploading...' : screenshotUrl ? 'Uploaded!' : 'Upload screenshot'}</div>
        </div>
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={() => setWinner('me')} className="card" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: 10, borderColor: winner === 'me' ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>🏆 I Won</span>
        </button>
        <button onClick={() => setWinner('opp')} className="card" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: 10, borderColor: winner === 'opp' ? 'rgba(255,45,85,0.4)' : 'rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>💔 I Lost</span>
        </button>
      </div>
      <button className="btn-p" style={{ marginTop: 8 }} disabled={submitting} onClick={submit}>{submitting ? 'Submitting...' : 'Confirm Result'}</button>
    </div>
  );
}
