'use client'
import { useState, useEffect } from "react";
import { db, fmt, ago, Ava, Empty, isOnline } from './saConfig';

export function ProfileScreen({ token, userId, profile, wallet }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ type: null, count: 0 });

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    try {
      const data = await db.get(
        `challenges?or=(creator_id.eq.${userId},opponent_id.eq.${userId})&status=eq.completed&select=*,profiles!challenges_creator_id_fkey(username)&order=updated_at.desc&limit=20`,
        token
      );
      if (Array.isArray(data)) {
        setMatches(data);
        calcStreak(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const calcStreak = (data) => {
    let type = null, count = 0;
    for (const m of data) {
      const isWinner = m.winner_id === userId;
      const isDraw = !m.winner_id;
      const result = isDraw ? 'draw' : isWinner ? 'win' : 'loss';
      if (count === 0) { type = result; count = 1; }
      else if (result === type) count++;
      else break;
    }
    setStreak({ type, count });
  };

  const wins = profile?.wins || 0;
  const losses = profile?.losses || 0;
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const totalStaked = matches.reduce((s, m) => s + (m.stake_amount || 0), 0);
  const biggestWin = matches.filter(m => m.winner_id === userId).reduce((max, m) => Math.max(max, m.stake_amount * 1.9 * 0.95), 0);

  const streakColors = { win: '#00ff88', loss: '#ff2d55', draw: '#ffaa00' };
  const streakIcons = { win: '🔥', loss: '😔', draw: '🤝' };

  return (
    <div className="page">
      <div className="pg-title">📊 My Stats</div>

      {/* Profile header */}
      <div className="profile-wrap">
        <Ava s={profile?.username || '?'} size="ava-lg" online={true} />
        <div>
          <div className="profile-name">{profile?.username || 'Loading...'}</div>
          <div className="profile-id">eFootball Player · StakeArena · ● Online</div>
        </div>
      </div>

      {/* Streak Card */}
      {streak.count > 1 && (
        <div className="gcard" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 6 }}>{streakIcons[streak.type]}</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900, color: streakColors[streak.type] }}>
            {streak.count} {streak.type === 'win' ? 'WIN' : streak.type === 'loss' ? 'LOSS' : 'DRAW'} STREAK
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            {streak.type === 'win' ? "You're on fire! Keep it going 🔥" : streak.type === 'loss' ? 'Time for a comeback!' : 'Lots of close games lately'}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats">
        <div className="stat"><div className="stat-val green">{wins}</div><div className="stat-lbl">Wins</div></div>
        <div className="stat"><div className="stat-val red">{losses}</div><div className="stat-lbl">Losses</div></div>
        <div className="stat"><div className="stat-val gold">{winRate}%</div><div className="stat-lbl">Win Rate</div></div>
      </div>
      <div className="stats">
        <div className="stat"><div className="stat-val" style={{ color: '#00ccff' }}>{total}</div><div className="stat-lbl">Matches</div></div>
        <div className="stat"><div className="stat-val gold" style={{ fontSize: 16 }}>{fmt(totalStaked)}</div><div className="stat-lbl">Total Staked</div></div>
        <div className="stat"><div className="stat-val green" style={{ fontSize: 16 }}>{fmt(biggestWin)}</div><div className="stat-lbl">Biggest Win</div></div>
      </div>

      {/* Win rate bar */}
      <div className="card">
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Performance</div>
        <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ width: `${winRate}%`, background: '#00ff88' }} />
          <div style={{ width: `${100 - winRate}%`, background: '#ff2d55' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ color: '#00ff88' }}>{wins} Wins</span>
          <span style={{ color: '#ff2d55' }}>{losses} Losses</span>
        </div>
      </div>

      {/* Match History */}
      <div className="sec-hdr">
        <div className="sec-title">Match History</div>
      </div>
      {loading ? <Empty msg="Loading..." /> : matches.length === 0 ? <Empty msg="No matches played yet" /> : (
        matches.map(m => {
          const isDraw = !m.winner_id;
          const isWin = m.winner_id === userId;
          const result = isDraw ? 'draw' : isWin ? 'win' : 'loss';
          const resultLabel = { win: '🏆 WON', loss: '💔 LOST', draw: '🤝 DRAW' };
          const resultColor = { win: '#00ff88', loss: '#ff2d55', draw: '#ffaa00' };
          return (
            <div key={m.id} className="ch-row">
              <Ava s={m.profiles?.username || '?'} color={result === 'loss' ? 'linear-gradient(135deg,#ff6b35,#ff2d55)' : undefined} />
              <div className="ch-info">
                <div className="ch-name">Room {m.room_code}</div>
                <div className="ch-meta">{ago(m.updated_at)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 800, color: resultColor[result] }}>{resultLabel[result]}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#ffd700' }}>{fmt(m.stake_amount)}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
