'use client'
import { useState } from "react";

const SLIDES = [
  { icon: '🎮', title: 'Welcome to StakeArena', text: "Nigeria's #1 eFootball staking platform. Challenge players, stake real money, and win big!" },
  { icon: '⚔️', title: 'Create or Join a Challenge', text: 'Set your stake amount and get a room code, or browse open challenges and join one instantly.' },
  { icon: '⚽', title: 'Play on eFootball', text: 'Use the room code to start your match on eFootball. Play fair — no live score updates needed, just focus on winning!' },
  { icon: '📸', title: 'Submit Your Result', text: 'After the match, upload a screenshot of the final score and select Win, Draw, or Lose.' },
  { icon: '💰', title: 'Get Paid Instantly', text: 'Winners receive 1.9x their stake. Draws get a full refund. Withdraw your winnings to your bank anytime!' },
];

export function Onboarding({ onFinish }) {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 24px', justifyContent: 'space-between', animation: 'fadeIn .4s ease' }}>
      <div style={{ textAlign: 'right' }}>
        <button onClick={onFinish} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, cursor: 'pointer', letterSpacing: 1 }}>SKIP</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, justifyContent: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 32 }}>{slide.icon}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 14 }}>{slide.title}</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, maxWidth: 300 }}>{slide.text}</div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? '#00ff88' : 'rgba(255,255,255,0.15)', transition: 'all .3s' }} />
          ))}
        </div>
        <button className="btn-p" onClick={() => isLast ? onFinish() : setIdx(idx + 1)}>
          {isLast ? "Let's Go! 🚀" : 'Next'}
        </button>
      </div>
    </div>
  );
}
