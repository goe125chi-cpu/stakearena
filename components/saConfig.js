// ─── SUPABASE CONFIG + UTILS + CSS ───────────────────────────────────────────
export const SB = 'https://pormergmrxsomqnpzrto.supabase.co';
export const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcm1lcmdtcnhzb21xbnB6cnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTE3MTIsImV4cCI6MjA5NTQ4NzcxMn0.dZ5fZpOnFaEEK_mURe1aycxuScZxATGnsG9A0XRKG-s';
const h = (t) => ({ 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${t || KEY}`, 'Prefer': 'return=representation' });
export const db = {
  signup: (e, pw, u) => fetch(`${SB}/auth/v1/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': KEY }, body: JSON.stringify({ email: e, password: pw, data: { username: u } }) }).then(r => r.json()),
  signin: (e, pw) => fetch(`${SB}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': KEY }, body: JSON.stringify({ email: e, password: pw }) }).then(r => r.json()),
  get: (path, t) => fetch(`${SB}/rest/v1/${path}`, { headers: h(t) }).then(r => r.json()),
  post: (path, t, data) => fetch(`${SB}/rest/v1/${path}`, { method: 'POST', headers: h(t), body: JSON.stringify(data) }).then(r => r.json()),
  patch: (path, t, data) => fetch(`${SB}/rest/v1/${path}`, { method: 'PATCH', headers: h(t), body: JSON.stringify(data) }).then(r => r.json()),
  rpc: (fn, t, params) => fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: h(t), body: JSON.stringify(params) }).then(r => r.json()),
};
export const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;
export const gc = () => { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; return Array.from({ length: 8 }, () => c[Math.floor(Math.random() * c.length)]).join(''); };
export const ago = (ts) => { if (!ts) return ''; const d = (Date.now() - new Date(ts)) / 1000; if (d < 60) return 'just now'; if (d < 3600) return `${Math.floor(d / 60)}m ago`; if (d < 86400) return `${Math.floor(d / 3600)}h ago`; return `${Math.floor(d / 86400)}d ago`; };
export const Ava = ({ s = '', size = '', color = '' }) => (
  <div className={`ava ${size}`} style={color ? { background: color } : {}}>{s.slice(0, 2).toUpperCase()}</div>
);
export const Badge = ({ type, label }) => (
  <span className={`badge badge-${type}`}>{type === 'live' && <span className="badge-dot" />}{label}</span>
);
export const Loading = () => <div className="loading-overlay"><div className="loading-dots"><span /><span /><span /></div></div>;
export const Empty = ({ msg }) => <div className="empty">{msg}</div>;
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=Barlow:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#07070f;color:#fff;font-family:'Barlow',sans-serif;}
  input,button,select,textarea{font-family:'Barlow',sans-serif;}
  .sa{max-width:430px;margin:0 auto;min-height:100vh;background:#07070f;position:relative;}
  .sa-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,255,136,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.025) 1px,transparent 1px);background-size:36px 36px;pointer-events:none;z-index:0;}
  .z{position:relative;z-index:1;}
  .splash{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:12px;animation:fadeIn .6s ease;}
  .splash-logo{font-family:'Barlow Condensed',sans-serif;font-size:62px;font-weight:900;background:linear-gradient(135deg,#00ff88,#00ccff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;letter-spacing:-1px;}
  .splash-sub{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.3);text-transform:uppercase;}
  .splash-bar{width:60px;height:2px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:40px;overflow:hidden;}
  .splash-bar::after{content:'';display:block;height:100%;background:linear-gradient(90deg,#00ff88,#00ccff);animation:loadBar 2.2s ease forwards;}
  @keyframes loadBar{from{width:0}to{width:100%}}
  .auth{min-height:100vh;display:flex;flex-direction:column;animation:fadeIn .4s ease;}
  .auth-hero{background:linear-gradient(160deg,#0a1a10 0%,#07070f 70%);padding:56px 24px 40px;text-align:center;position:relative;overflow:hidden;}
  .auth-hero::before{content:'';position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:220px;height:220px;background:radial-gradient(circle,rgba(0,255,136,0.12) 0%,transparent 70%);pointer-events:none;}
  .auth-logo{font-family:'Barlow Condensed',sans-serif;font-size:48px;font-weight:900;background:linear-gradient(135deg,#00ff88,#00ccff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:6px;}
  .auth-tagline{font-size:13px;color:rgba(255,255,255,0.4);}
  .auth-body{flex:1;background:#0c0c18;border-radius:24px 24px 0 0;padding:28px 24px 40px;margin-top:-16px;}
  .tabs{display:flex;background:rgba(255,255,255,0.05);border-radius:10px;padding:4px;margin-bottom:24px;}
  .tab{flex:1;padding:10px;border-radius:7px;border:none;background:transparent;color:rgba(255,255,255,0.4);font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;cursor:pointer;text-transform:uppercase;transition:all .2s;}
  .tab.on{background:#00ff88;color:#07070f;}
  .field{margin-bottom:14px;}
  .flabel{display:block;font-size:10px;font-weight:600;letter-spacing:1.5px;color:rgba(255,255,255,0.35);text-transform:uppercase;margin-bottom:7px;font-family:'IBM Plex Mono',monospace;}
  .finput{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:13px 15px;color:#fff;font-size:15px;outline:none;transition:border-color .2s;}
  .finput:focus{border-color:rgba(0,255,136,0.5);}
  .finput::placeholder{color:rgba(255,255,255,0.2);}
  .btn-p{width:100%;background:linear-gradient(135deg,#00ff88,#00ccaa);border:none;border-radius:12px;padding:16px;color:#07070f;font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:6px;transition:opacity .2s,transform .1s;display:flex;align-items:center;justify-content:center;gap:8px;}
  .btn-p:active{opacity:.85;transform:scale(.99);}
  .btn-p:disabled{opacity:.5;cursor:not-allowed;}
  .btn-g{background:linear-gradient(135deg,#00ff88,#00ccaa);border:none;border-radius:10px;padding:12px 18px;color:#07070f;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;}
  .btn-g:active{opacity:.8;}
  .btn-r{background:rgba(255,45,85,0.12);border:1px solid rgba(255,45,85,0.25);border-radius:10px;padding:12px 16px;color:#ff2d55;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;cursor:pointer;}
  .hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:rgba(7,7,15,0.92);backdrop-filter:blur(12px);position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(255,255,255,0.05);}
  .hdr-logo{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:900;background:linear-gradient(135deg,#00ff88,#00ccff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .hdr-right{display:flex;align-items:center;gap:10px;}
  .hdr-badge{background:rgba(0,255,136,0.12);border:1px solid rgba(0,255,136,0.2);border-radius:8px;padding:6px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#00ff88;font-weight:600;}
  .ava{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#00ff88,#00ccff);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:800;color:#07070f;flex-shrink:0;}
  .ava-sm{width:28px;height:28px;font-size:10px;}
  .ava-lg{width:48px;height:48px;font-size:16px;}
  .bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:rgba(8,8,18,0.97);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.06);display:flex;padding:10px 0 18px;z-index:100;}
  .ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:4px 0;}
  .ni-ico{font-size:20px;line-height:1;}
  .ni-lbl{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.3px;color:rgba(255,255,255,0.25);text-transform:uppercase;}
  .ni.on .ni-lbl{color:#00ff88;}
  .ni.on .ni-ico{filter:drop-shadow(0 0 5px rgba(0,255,136,0.7));}
  .page{padding:18px 18px 100px;animation:slideUp .3s ease;}
  .pg-title{font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:800;letter-spacing:.5px;margin-bottom:18px;}
  .pg-sub{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;margin-bottom:14px;color:rgba(255,255,255,0.85);}
  .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px;margin-bottom:14px;}
  .gcard{background:linear-gradient(135deg,rgba(0,255,136,0.08),rgba(0,204,255,0.04));border:1px solid rgba(0,255,136,0.18);border-radius:20px;padding:22px;margin-bottom:16px;position:relative;overflow:hidden;}
  .gcard::before{content:'';position:absolute;top:-30px;right:-30px;width:100px;height:100px;background:radial-gradient(circle,rgba(0,255,136,0.15) 0%,transparent 70%);pointer-events:none;}
  .wbal-label{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:8px;}
  .wbal-amt{font-family:'Barlow Condensed',sans-serif;font-size:44px;font-weight:900;background:linear-gradient(135deg,#00ff88,#00ccff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:18px;}
  .wbal-row{display:flex;gap:10px;}
  .wbal-btn{flex:1;padding:11px;border-radius:10px;border:none;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;}
  .wbal-dep{background:linear-gradient(135deg,#00ff88,#00ccaa);color:#07070f;}
  .wbal-wit{background:rgba(255,255,255,0.08)!important;border:1px solid rgba(255,255,255,0.12)!important;color:#fff!important;}
  .stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;}
  .stat{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px 10px;text-align:center;}
  .stat-val{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:800;line-height:1;margin-bottom:4px;}
  .stat-lbl{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,0.35);text-transform:uppercase;}
  .green{color:#00ff88!important;} .red{color:#ff2d55!important;} .gold{color:#ffd700!important;}
  .ch-row{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px;margin-bottom:10px;}
  .ch-info{flex:1;}
  .ch-name{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;margin-bottom:2px;}
  .ch-meta{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(255,255,255,0.35);}
  .ch-stake{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;color:#ffd700;margin-right:10px;white-space:nowrap;}
  .tx-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
  .tx-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
  .tx-ico.win{background:rgba(0,255,136,0.12);} .tx-ico.loss{background:rgba(255,45,85,0.12);} .tx-ico.deposit{background:rgba(0,204,255,0.12);} .tx-ico.withdrawal{background:rgba(255,165,0,0.12);} .tx-ico.stake{background:rgba(255,255,255,0.06);}
  .tx-info{flex:1;}
  .tx-desc{font-size:14px;font-weight:500;margin-bottom:2px;}
  .tx-time{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(255,255,255,0.3);}
  .tx-amt{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;white-space:nowrap;}
  .tx-amt.pos{color:#00ff88;} .tx-amt.neg{color:#ff2d55;}
  .lb-row{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px;margin-bottom:10px;}
  .lb-row.me{background:rgba(0,255,136,0.07);border-color:rgba(0,255,136,0.2);}
  .lb-rank{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:900;width:28px;text-align:center;flex-shrink:0;}
  .lb-name{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;margin-bottom:2px;}
  .lb-rec{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(255,255,255,0.35);}
  .lb-earn{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:800;color:#ffd700;margin-left:auto;white-space:nowrap;}
  .match-vs{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:20px 0;}
  .match-player{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;}
  .match-pname{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;text-align:center;}
  .match-vstext{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:900;color:rgba(255,255,255,0.2);flex-shrink:0;}
  .score-box{display:flex;align-items:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;margin:16px 0;}
  .score-side{display:flex;flex-direction:column;align-items:center;flex:1;}
  .score-num{font-family:'Barlow Condensed',sans-serif;font-size:72px;font-weight:900;line-height:1;padding:16px 0;}
  .score-divider{width:1px;background:rgba(255,255,255,0.08);align-self:stretch;}
  .score-ctrl{display:flex;gap:8px;padding:10px 16px;background:rgba(255,255,255,0.03);width:100%;}
  .sc-btn{flex:1;padding:10px;border-radius:8px;border:none;font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:800;cursor:pointer;}
  .sc-plus{background:rgba(0,255,136,0.15);color:#00ff88;} .sc-minus{background:rgba(255,45,85,0.12);color:#ff2d55;}
  .sc-btn:active{transform:scale(.94);} .sc-btn:disabled{opacity:.3;cursor:not-allowed;}
  .badge{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:20px;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;}
  .badge-wait{background:rgba(255,165,0,0.12);color:#ffaa00;border:1px solid rgba(255,165,0,0.2);}
  .badge-live{background:rgba(255,45,85,0.12);color:#ff2d55;border:1px solid rgba(255,45,85,0.25);}
  .badge-done{background:rgba(0,255,136,0.1);color:#00ff88;border:1px solid rgba(0,255,136,0.2);}
  .badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse 1.4s infinite;}
  .roomcode-box{background:rgba(0,255,136,0.06);border:1px dashed rgba(0,255,136,0.3);border-radius:14px;padding:20px;text-align:center;margin:14px 0;}
  .roomcode-label{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.35);text-transform:uppercase;margin-bottom:10px;}
  .roomcode{font-family:'IBM Plex Mono',monospace;font-size:30px;font-weight:600;color:#00ff88;letter-spacing:6px;}
  .roomcode-copy{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(0,255,136,0.6);margin-top:8px;cursor:pointer;}
  .upload-zone{border:2px dashed rgba(255,255,255,0.1);border-radius:14px;padding:32px 20px;text-align:center;cursor:pointer;transition:all .2s;margin:14px 0;}
  .upload-zone:hover,.upload-zone.done{border-color:rgba(0,255,136,0.3);background:rgba(0,255,136,0.03);}
  .upload-ico{font-size:36px;margin-bottom:10px;}
  .upload-text{font-size:14px;color:rgba(255,255,255,0.4);}
  .stake-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0;}
  .stake-chip{padding:12px 8px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;cursor:pointer;text-align:center;transition:all .2s;}
  .stake-chip.sel{background:rgba(0,255,136,0.12);border-color:rgba(0,255,136,0.4);color:#00ff88;}
  .sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
  .sec-title{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;}
  .sec-link{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#00ff88;cursor:pointer;}
  .active-banner{background:linear-gradient(135deg,rgba(255,45,85,0.12),rgba(255,80,50,0.08));border:1px solid rgba(255,45,85,0.2);border-radius:14px;padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;gap:12px;cursor:pointer;}
  .ab-info{flex:1;}
  .ab-title{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;margin-bottom:3px;}
  .ab-meta{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(255,255,255,0.4);}
  .back-btn{display:flex;align-items:center;gap:6px;color:rgba(255,255,255,0.5);font-family:'IBM Plex Mono',monospace;font-size:11px;cursor:pointer;margin-bottom:18px;background:none;border:none;padding:0;}
  .profile-wrap{display:flex;align-items:center;gap:14px;padding:14px 0 20px;}
  .profile-name{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:800;margin-bottom:4px;}
  .profile-id{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:1px;}
  .disp-card{background:rgba(255,165,0,0.05);border:1px solid rgba(255,165,0,0.15);border-radius:14px;padding:16px;margin-bottom:12px;}
  .notif{position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#00ff88;color:#07070f;padding:12px 20px;border-radius:10px;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;z-index:999;white-space:nowrap;animation:slideDown .3s ease;}
  .notif.err{background:#ff2d55;color:#fff;}
  .loading-overlay{position:fixed;inset:0;background:rgba(7,7,15,0.7);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px);}
  .loading-dots{display:flex;gap:8px;}
  .loading-dots span{width:10px;height:10px;border-radius:50%;background:#00ff88;animation:dotBounce 1.2s infinite;}
  .loading-dots span:nth-child(2){animation-delay:.2s;}
  .loading-dots span:nth-child(3){animation-delay:.4s;}
  .empty{text-align:center;padding:40px 0;color:rgba(255,255,255,0.3);font-family:'IBM Plex Mono',monospace;font-size:13px;}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes dotBounce{0%,80%,100%{transform:scale(0);opacity:.5}40%{transform:scale(1);opacity:1}}
`;

// ─── KORAPAY PAYMENT ──────────────────────────────────────────────────────────
export const initKorapayDeposit = ({ amount, userId, userEmail, userName, onSuccess, onClose }) => {
  const reference = `SA_${userId.slice(0, 8)}_${Date.now()}`;

  const script = document.createElement('script');
  script.src = 'https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js';
  script.onload = () => {
    window.Korapay.initialize({
      key: process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY || '',
      reference,
      amount: Number(amount),
      currency: 'NGN',
      customer: {
        name: userName || 'StakeArena User',
        email: userEmail || 'user@stakearena.com'
      },
      notification_url: `${window.location.origin}/api/verify-payment`,
      onSuccess: async (data) => {
        try {
          const res = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: data.reference, userId, amount })
          });
          const result = await res.json();
          if (result.success) onSuccess(result.newBalance, result.amount);
        } catch (e) { console.error('Verification error:', e); }
      },
      onClose: () => { if (onClose) onClose(); }
    });
  };
  document.body.appendChild(script);
};
