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
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes charPop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
        input[type=range] { -webkit-appearance:none; appearance:none; background:transparent; width:100%; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; width:24px; height:24px; border-radius:50%;
          background:#f97316; border:3px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,.2); margin-top:-10px;
        }
        input[type=range]::-webkit-slider-runnable-track { height:6px; background:transparent; }
        input[type=range]:focus { outline:none; }
        button:hover { filter:brightness(1.05); }
      `}</style>

      {/* Custom Title Bar */}
      <div style={s.titleBar}>
        <div style={s.dragRegion}>Pawzy Setup</div>
        <button style={s.closeBtn} onClick={() => window.close()}>×</button>
      </div>

      <div style={s.content}>
        <div style={s.card} key={step}>

          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div style={s.stepContent}>
              <div style={{ ...s.paw, animation: 'pulse 2s ease-in-out infinite' }}>🐾</div>
              <h1 style={s.bigTitle}>Meet Pawzy</h1>
              <p style={s.desc}>
                Your uncompromising productivity enforcer. Work focused, and let your hijacker force you to rest.
              </p>
              <div style={s.featureList}>
                {['🕐  Tracks your screen time automatically',
                  '🐾  Your enforcer hijacks your screen',
                  '⚡  Breaks are forced — no skipping!'].map(f => (
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
              <p style={s.desc}>Your enforcer hijacks the screen when this time is up.</p>
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
              <p style={s.desc}>Your enforcer blocks the screen for this long. Step away, stretch, rest your eyes.</p>
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
              <h2 style={s.stepTitle}>Choose your hijacker</h2>
              <p style={s.desc}>Who do you want locking your screen at break time?</p>
              <div style={s.charGrid}>
                {CHARACTERS.map(char => (
                  <button
                    key={char.key}
                    onClick={() => setCharacter(char.key)}
                    style={{
                      ...s.charCard,
                      borderColor: character === char.key ? char.color : '#ffedd5',
                      background:  character === char.key ? '#fff' : '#fff7ed',
                      boxShadow:   character === char.key ? `0 4px 12px rgba(0,0,0,.08)` : 'none',
                      animation: 'charPop .2s ease both',
                      transform: character === char.key ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '42px', lineHeight: 1 }}>{char.emoji}</span>
                    <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '14px', color: '#ea580c' }}>{char.label}</span>
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
                  ['Enforcer',     `${selectedChar.emoji} ${selectedChar.label}`],
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
    </div>
  );
}

const s = {
  root: {
    width:'100vw', height:'100vh',
    background:'#fdf8f0', // Warm cream background
    display:'flex', flexDirection:'column',
    borderRadius: '20px',
    overflow:'hidden',
    border: '2px solid rgba(0,0,0,.1)',
    boxShadow: '0 12px 40px rgba(0,0,0,.2)',
  },
  titleBar: {
    height: '40px',
    background: '#f5efe6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottom: '1px solid rgba(0,0,0,.05)',
  },
  dragRegion: {
    WebkitAppRegion: 'drag',
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '16px',
    fontFamily: "'Fredoka One', cursive",
    fontSize: '13px',
    color: '#78716c',
  },
  closeBtn: {
    WebkitAppRegion: 'no-drag',
    background: 'transparent',
    border: 'none',
    width: '46px',
    height: '100%',
    fontSize: '20px',
    color: '#78716c',
    cursor: 'pointer',
    transition: 'background .2s',
  },
  content: {
    flex: 1,
    display:'flex', alignItems:'center', justifyContent:'center',
    position:'relative',
    padding: '20px',
  },
  card: {
    width:'100%', maxWidth: '480px',
    background:'#fff',
    border:'2px solid #f0e8dc',
    boxShadow:'0 10px 40px rgba(0,0,0,.05)',
    borderRadius:'28px',
    padding:'44px 40px 32px',
    position:'relative',
    animation:'fadeUp .4s ease both',
  },
  stepContent: { display:'flex', flexDirection:'column', alignItems:'center', gap:'20px', textAlign:'center' },
  paw:         { fontSize:'70px', lineHeight:1 },
  stepIcon:    { fontSize:'52px', lineHeight:1 },
  bigTitle:    { fontFamily: "'Fredoka One', cursive", fontSize:'36px', color:'#f97316' },
  stepTitle:   { fontFamily: "'Fredoka One', cursive", fontSize:'22px', color:'#2d1200' },
  desc:        { fontSize:'15px', color:'#78716c', lineHeight:1.6, maxWidth:'360px', fontWeight: 600 },
  featureList: { display:'flex', flexDirection:'column', gap:'12px', width:'100%', textAlign:'left', marginTop: '8px' },
  feature: {
    fontSize:'14px', color:'#5c3d28', fontWeight: 700,
    background:'#fff7ed',
    border:'2px solid #ffedd5',
    borderRadius:'16px', padding:'14px 20px',
  },
  bigNumber:   { fontFamily: "'Fredoka One', cursive", fontSize:'64px', color:'#f97316', fontVariantNumeric:'tabular-nums', lineHeight:1 },
  unit:        { fontSize:'20px', color:'#ea580c' },
  sliderWrap:  { width:'100%', display:'flex', flexDirection:'column', gap:'8px', marginTop: '10px' },
  track:       { position:'relative', height:'6px', background:'#f5f0eb', borderRadius:'3px' },
  fill:        { position:'absolute', top:0, left:0, height:'100%', background:'linear-gradient(90deg, #f97316, #fbbf24)', borderRadius:'3px', pointerEvents:'none' },
  sliderInput: { position:'absolute', top:'-10px', left:0, width:'100%' },
  ticks:       { display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#a8a29e', fontWeight: 700 },
  presets:     { display:'flex', gap:'10px', marginTop: '12px' },
  presetBtn: {
    padding:'10px 18px', borderRadius:'14px',
    background:'#f5f0eb', border:'none',
    color:'#78716c', fontSize:'14px', fontWeight:800, cursor:'pointer',
    transition: 'all .15s ease',
  },
  presetActive: { background:'#f97316', color:'#fff', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' },
  primaryBtn: {
    width:'100%', padding:'18px',
    background:'#16a34a',
    border:'none', borderRadius:'50px',
    color:'#fff', fontSize:'16px', fontWeight:800, cursor:'pointer',
    boxShadow:'0 5px 0 #15803d', marginTop:'16px',
    transition: 'transform .1s, box-shadow .1s',
  },
  charGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', width:'100%', marginTop: '8px' },
  charCard: {
    position:'relative',
    display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
    padding:'18px 12px', borderRadius:'20px',
    border:'2px solid #ffedd5',
    cursor:'pointer', transition:'all .2s ease',
  },
  checkBadge: {
    position:'absolute', top:'-6px', right:'-6px',
    width:'24px', height:'24px', borderRadius:'50%',
    fontSize:'12px', fontWeight:800, color:'#fff',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow: '0 2px 8px rgba(0,0,0,.15)',
  },
  summaryBox: {
    width:'100%', display:'flex', flexDirection:'column', gap:'4px',
    background:'#fff', border:'2px solid #f0e8dc',
    boxShadow: '0 8px 24px rgba(0,0,0,.04)',
    borderRadius:'24px', padding:'24px 28px',
    marginTop: '12px',
  },
  summaryRow: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'10px 0', borderBottom:'2px solid #f5f0eb',
  },
  summaryKey: { fontSize:'14px', color:'#78716c', fontWeight: 800 },
  summaryVal: { fontFamily: "'Fredoka One', cursive", fontSize:'16px', color:'#f97316' },
  dots:       { display:'flex', justifyContent:'center', gap:'10px', marginTop:'32px' },
  dot:        { width:'8px', height:'8px', borderRadius:'50%', background:'#f5f0eb', transition:'all .3s' },
  dotActive:  { background:'#f97316', width:'24px', borderRadius:'4px' },
};
