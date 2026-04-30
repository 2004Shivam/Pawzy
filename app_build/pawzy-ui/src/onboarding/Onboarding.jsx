import React, { useState } from 'react';

const CHARACTERS = [
  { key: 'cat_gatekeeper', emoji: '🐱', label: 'Neko Cat',    color: '#f97316' },
  { key: 'shiba',          emoji: '🐕', label: 'Shiba Inu',   color: '#D4773C' },
  { key: 'panda',          emoji: '🐼', label: 'Chill Panda', color: '#64748b' },
  { key: 'fox',            emoji: '🦊', label: 'Fox Kit',     color: '#ef4444' },
];

const steps = ['welcome', 'work', 'break', 'character', 'done'];

export default function Onboarding() {
  const [step,      setStep]      = useState(0);
  const [workMin,   setWorkMin]   = useState(60);
  const [breakMin,  setBreakMin]  = useState(5);
  const [character, setCharacter] = useState('cat_gatekeeper');
  const [saving,    setSaving]    = useState(false);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));

  const handleFinish = async () => {
    setSaving(true);
    try {
      const config = await window.pawzy.readConfig();
      await window.pawzy.saveConfig({
        ...config,
        limit_seconds: workMin * 60,
        break_seconds: breakMin * 60,
        character,
        first_launch: false,
      });
      window.pawzy.sendAction('update_config', {});
      setTimeout(() => window.pawzy.closeOnboarding(), 800);
    } catch (e) {
      console.error('Onboarding save failed:', e);
    }
  };

  const selectedChar = CHARACTERS.find(c => c.key === character) ?? CHARACTERS[0];

  return (
    <div style={s.root}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0f0d1a; overflow:hidden; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes charPop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
        input[type=range] { -webkit-appearance:none; appearance:none; background:transparent; width:100%; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; width:24px; height:24px; border-radius:50%;
          background:#a855f7; border:3px solid #d8b4fe;
          box-shadow:0 0 12px rgba(168,85,247,.7); margin-top:-10px;
        }
        input[type=range]::-webkit-slider-runnable-track { height:4px; background:transparent; }
        input[type=range]:focus { outline:none; }
        button:hover { filter:brightness(1.12); }
      `}</style>

      <div style={s.orb1} />
      <div style={s.orb2} />

      <div style={s.card} key={step}>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div style={s.stepContent}>
            <div style={{ ...s.paw, animation: 'pulse 2s ease-in-out infinite' }}>🐾</div>
            <h1 style={s.bigTitle}>Meet Pawzy</h1>
            <p style={s.desc}>
              Your furry productivity guardian. Work focused, take real breaks,
              and let your companion remind you when it's time to rest.
            </p>
            <div style={s.featureList}>
              {['🕐  Tracks your screen time automatically',
                '🐾  Your companion slides in at break time',
                '⚡  Breaks are enforced — no cheating!'].map(f => (
                <div key={f} style={s.feature}>{f}</div>
              ))}
            </div>
            <button style={s.primaryBtn} onClick={next}>Get Started →</button>
          </div>
        )}

        {/* Step 1 — Work duration */}
        {step === 1 && (
          <div style={s.stepContent}>
            <div style={s.stepIcon}>⏱</div>
            <h2 style={s.stepTitle}>How long do you want to work?</h2>
            <p style={s.desc}>Your companion appears when this time is up.</p>
            <div style={s.bigNumber}>{workMin} <span style={s.unit}>minutes</span></div>
            <div style={s.sliderWrap}>
              <div style={s.track}>
                <div style={{ ...s.fill, width: `${((workMin - 1) / 119) * 100}%` }} />
                <input type="range" min={1} max={120} value={workMin}
                  onChange={e => setWorkMin(Number(e.target.value))}
                  style={s.sliderInput} />
              </div>
              <div style={s.ticks}><span>1 min</span><span>120 min</span></div>
            </div>
            <div style={s.presets}>
              {[25, 45, 60, 90].map(m => (
                <button key={m} style={{ ...s.presetBtn, ...(workMin === m ? s.presetActive : {}) }}
                  onClick={() => setWorkMin(m)}>{m}m</button>
              ))}
            </div>
            <button style={s.primaryBtn} onClick={next}>Next →</button>
          </div>
        )}

        {/* Step 2 — Break duration */}
        {step === 2 && (
          <div style={s.stepContent}>
            <div style={s.stepIcon}>☕</div>
            <h2 style={s.stepTitle}>How long should the break be?</h2>
            <p style={s.desc}>Your companion blocks the screen for this long. Step away, stretch, rest your eyes.</p>
            <div style={s.bigNumber}>{breakMin} <span style={s.unit}>minutes</span></div>
            <div style={s.sliderWrap}>
              <div style={s.track}>
                <div style={{ ...s.fill, width: `${((breakMin - 1) / 29) * 100}%` }} />
                <input type="range" min={1} max={30} value={breakMin}
                  onChange={e => setBreakMin(Number(e.target.value))}
                  style={s.sliderInput} />
              </div>
              <div style={s.ticks}><span>1 min</span><span>30 min</span></div>
            </div>
            <div style={s.presets}>
              {[5, 10, 15, 20].map(m => (
                <button key={m} style={{ ...s.presetBtn, ...(breakMin === m ? s.presetActive : {}) }}
                  onClick={() => setBreakMin(m)}>{m}m</button>
              ))}
            </div>
            <button style={s.primaryBtn} onClick={next}>Next →</button>
          </div>
        )}

        {/* Step 3 — Choose companion */}
        {step === 3 && (
          <div style={s.stepContent}>
            <div style={s.stepIcon}>🐾</div>
            <h2 style={s.stepTitle}>Choose your companion</h2>
            <p style={s.desc}>Who do you want showing up at break time?</p>
            <div style={s.charGrid}>
              {CHARACTERS.map(char => (
                <button
                  key={char.key}
                  onClick={() => setCharacter(char.key)}
                  style={{
                    ...s.charCard,
                    borderColor: character === char.key ? char.color : 'rgba(255,255,255,.1)',
                    background:  character === char.key ? `${char.color}18` : 'rgba(255,255,255,.04)',
                    boxShadow:   character === char.key ? `0 0 0 2px ${char.color}55, 0 8px 24px ${char.color}22` : 'none',
                    animation: 'charPop .3s ease both',
                  }}
                >
                  <span style={{ fontSize: '40px', lineHeight: 1 }}>{char.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{char.label}</span>
                  {character === char.key && (
                    <span style={{ ...s.checkBadge, background: char.color }}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <button style={s.primaryBtn} onClick={next}>Next →</button>
          </div>
        )}

        {/* Step 4 — All done */}
        {step === 4 && (
          <div style={s.stepContent}>
            <div style={{ fontSize: '72px', animation: 'pulse 1.5s ease-in-out infinite' }}>
              {selectedChar.emoji}
            </div>
            <h2 style={s.bigTitle}>You're all set!</h2>
            <div style={s.summaryBox}>
              {[
                ['Companion',     `${selectedChar.emoji} ${selectedChar.label}`],
                ['Work session',  `${workMin} minutes`],
                ['Break duration',`${breakMin} minutes`],
              ].map(([k, v]) => (
                <div key={k} style={s.summaryRow}>
                  <span style={s.summaryKey}>{k}</span>
                  <span style={s.summaryVal}>{v}</span>
                </div>
              ))}
            </div>
            <p style={s.desc}>Change anything anytime from the tray icon → Settings.</p>
            <button style={s.primaryBtn} onClick={handleFinish} disabled={saving}>
              {saving ? 'Starting…' : 'Start Pawzy 🐾'}
            </button>
          </div>
        )}

        {/* Progress dots */}
        <div style={s.dots}>
          {steps.map((_, i) => (
            <div key={i} style={{ ...s.dot, ...(i === step ? s.dotActive : {}) }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    width:'100vw', height:'100vh',
    background:'linear-gradient(135deg, #0f0d1a 0%, #1a1228 100%)',
    display:'flex', alignItems:'center', justifyContent:'center',
    position:'relative', overflow:'hidden',
  },
  orb1: {
    position:'absolute', top:'-80px', right:'-80px',
    width:'300px', height:'300px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(168,85,247,.25) 0%, transparent 70%)',
    pointerEvents:'none',
  },
  orb2: {
    position:'absolute', bottom:'-80px', left:'-80px',
    width:'280px', height:'280px', borderRadius:'50%',
    background:'radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)',
    pointerEvents:'none',
  },
  card: {
    width:'480px',
    background:'rgba(255,255,255,.04)',
    backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,.08)',
    borderRadius:'28px',
    padding:'44px 40px 32px',
    position:'relative',
    animation:'fadeUp .4s ease both',
    zIndex:1,
  },
  stepContent: { display:'flex', flexDirection:'column', alignItems:'center', gap:'20px', textAlign:'center' },
  paw:         { fontSize:'70px', lineHeight:1 },
  stepIcon:    { fontSize:'52px', lineHeight:1 },
  bigTitle:    { fontSize:'32px', fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.5px' },
  stepTitle:   { fontSize:'22px', fontWeight:700, color:'#e2e8f0', letterSpacing:'-0.3px' },
  desc:        { fontSize:'14px', color:'#94a3b8', lineHeight:1.7, maxWidth:'360px' },
  featureList: { display:'flex', flexDirection:'column', gap:'12px', width:'100%', textAlign:'left' },
  feature: {
    fontSize:'14px', color:'#cbd5e1',
    background:'rgba(255,255,255,.04)',
    border:'1px solid rgba(255,255,255,.07)',
    borderRadius:'12px', padding:'12px 16px',
  },
  bigNumber:   { fontSize:'64px', fontWeight:900, color:'#d8b4fe', fontVariantNumeric:'tabular-nums', lineHeight:1 },
  unit:        { fontSize:'22px', fontWeight:500, color:'#9333ea' },
  sliderWrap:  { width:'100%', display:'flex', flexDirection:'column', gap:'8px' },
  track:       { position:'relative', height:'4px', background:'rgba(255,255,255,.1)', borderRadius:'2px' },
  fill:        { position:'absolute', top:0, left:0, height:'100%', background:'linear-gradient(90deg, #7c3aed, #a855f7)', borderRadius:'2px', pointerEvents:'none' },
  sliderInput: { position:'absolute', top:'-10px', left:0, width:'100%' },
  ticks:       { display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#475569' },
  presets:     { display:'flex', gap:'10px' },
  presetBtn: {
    padding:'8px 18px', borderRadius:'10px',
    background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)',
    color:'#94a3b8', fontSize:'13px', fontWeight:600, cursor:'pointer',
  },
  presetActive: { background:'rgba(168,85,247,.2)', border:'1px solid rgba(168,85,247,.5)', color:'#d8b4fe' },
  primaryBtn: {
    width:'100%', padding:'16px',
    background:'linear-gradient(135deg, #7c3aed, #a855f7)',
    border:'none', borderRadius:'16px',
    color:'#fff', fontSize:'16px', fontWeight:700, cursor:'pointer',
    boxShadow:'0 8px 32px rgba(168,85,247,.4)', marginTop:'8px',
  },
  charGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', width:'100%' },
  charCard: {
    position:'relative',
    display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
    padding:'18px 12px', borderRadius:'16px',
    border:'1.5px solid rgba(255,255,255,.1)',
    cursor:'pointer', transition:'all .2s ease',
    fontFamily:'inherit',
  },
  checkBadge: {
    position:'absolute', top:'8px', right:'8px',
    width:'20px', height:'20px', borderRadius:'50%',
    fontSize:'11px', fontWeight:800, color:'#fff',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  summaryBox: {
    width:'100%', display:'flex', flexDirection:'column', gap:'2px',
    background:'rgba(168,85,247,.08)', border:'1px solid rgba(168,85,247,.2)',
    borderRadius:'16px', padding:'20px 24px',
  },
  summaryRow: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.06)',
  },
  summaryKey: { fontSize:'14px', color:'#94a3b8' },
  summaryVal: { fontSize:'16px', fontWeight:700, color:'#d8b4fe' },
  dots:       { display:'flex', justifyContent:'center', gap:'8px', marginTop:'28px' },
  dot:        { width:'8px', height:'8px', borderRadius:'50%', background:'rgba(255,255,255,.15)', transition:'all .3s' },
  dotActive:  { background:'#a855f7', width:'24px', borderRadius:'4px' },
};
