'use client'
import { useState, useEffect, useRef } from "react";
import { db, ago, Ava } from './saConfig';

export function MatchChat({ token, userId, matchId, opponentName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  const QUICK_MSGS = ['Ready?', "Let's go!", 'GG 🤝', 'Match starting now', '5 min please'];

  useEffect(() => {
    if (!matchId) return;
    loadMessages();
    const poll = setInterval(loadMessages, 4000);
    return () => clearInterval(poll);
  }, [matchId]);

  useEffect(() => {
    if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const loadMessages = async () => {
    try {
      const data = await db.get(`match_messages?challenge_id=eq.${matchId}&order=created_at.asc&limit=50`, token);
      if (Array.isArray(data)) {
        if (!open && data.length > messages.length) {
          setUnread(prev => prev + (data.length - messages.length));
        }
        setMessages(data);
      }
    } catch (e) {}
  };

  const send = async (msg) => {
    const content = msg || text;
    if (!content.trim()) return;
    setText('');
    try {
      await db.post('match_messages', token, { challenge_id: matchId, sender_id: userId, message: content.trim() });
      loadMessages();
    } catch (e) {}
  };

  const toggleOpen = () => {
    setOpen(!open);
    if (!open) setUnread(0);
  };

  return (
    <>
      {/* Chat toggle button */}
      <button onClick={toggleOpen} style={{
        position: 'fixed', bottom: 100, right: 18, zIndex: 140,
        width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,255,136,0.4)'
      }}>
        💬
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff2d55', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, height: '60vh', background: '#0c0c18',
          borderRadius: '20px 20px 0 0', zIndex: 145, display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Ava s={opponentName || '?'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 700 }}>{opponentName || 'Opponent'}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Match Chat</div>
            </div>
            <button onClick={toggleOpen} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, marginTop: 20 }}>
                No messages yet. Say hi! 👋
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} style={{
                  alignSelf: m.sender_id === userId ? 'flex-end' : 'flex-start',
                  maxWidth: '75%', background: m.sender_id === userId ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${m.sender_id === userId ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12, padding: '8px 12px'
                }}>
                  <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4 }}>{m.message}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{ago(m.created_at)}</div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick messages */}
          <div style={{ display: 'flex', gap: 6, padding: '0 16px 8px', overflowX: 'auto' }}>
            {QUICK_MSGS.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
                padding: '6px 12px', color: 'rgba(255,255,255,0.6)', fontSize: 11, whiteSpace: 'nowrap', cursor: 'pointer',
                fontFamily: "'IBM Plex Mono',monospace", flexShrink: 0
              }}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, padding: '10px 16px 16px' }}>
            <input
              className="finput"
              placeholder="Type a message..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              style={{ flex: 1 }}
            />
            <button onClick={() => send()} style={{
              background: 'linear-gradient(135deg,#00ff88,#00ccaa)', border: 'none', borderRadius: 10,
              width: 44, height: 44, fontSize: 18, cursor: 'pointer', flexShrink: 0
            }}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
