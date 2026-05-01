import React, { useState, useEffect } from 'react';

const CHARACTERS = [
  { key: 'cat_gatekeeper', emoji: '🐱', label: 'Neko Cat',    desc: 'The original gatekeeper', color: '#f97316' },
  { key: 'shiba',          emoji: '🐕', label: 'Shiba Inu',   desc: 'Fluffy & loyal',          color: '#D4773C' },
  { key: 'capybara',       emoji: '🦦', label: 'Capybara',    desc: 'Maximum chill energy',    color: '#64748b' },
  { key: 'monkey',         emoji: '🐒', label: 'Monkey',      desc: 'Playful & curious',       color: '#ef4444' },
];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const Slider = ({ label, value, min, max, unit, onChange, description }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={s.sliderGroup}>
      <div style={s.sliderHeader}>
        <span style={s.sliderLabel}>{label}</span>
        <span style={s.sliderValue}>{value} {unit}</span>
      </div>
      {description && <p style={s.sliderDesc}>{description}</p>}
      <div style={s.sliderTrack}>
        <div style={{ ...s.sliderFill, width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={s.sliderInput}
        />
      </div>
      <div style={s.sliderTicks}>
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

const CharCard = ({ char, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      ...s.charCard,
      ...(selected ? s.charCardActive : {}),
      '--accent': char.color,
      borderColor: selected ? char.color : 'rgba(255,255,255,.1)',
      boxShadow: selected ? `0 0 0 2px ${char.color}44, 0 8px 24px ${char.color}22` : 'none',
    }}
  >
    <span style={s.charEmoji}>{char.emoji}</span>
    <span style={s.charLabel}>{char.label}</span>
    <span style={s.charDesc}>{char.desc}</span>
    {selected && (
      <span style={{ ...s.charCheck, background: char.color }}>✓</span>
    )}
  </button>
);

export default function Settings() {
  const [cfg,       setCfg]       = useState(null);
  const [workMin,   setWorkMin]   = useState(60);
  const [breakMin,  setBreakMin]  = useState(5);
  const [character, setCharacter] = useState('cat_gatekeeper');
  const [autostart, setAutostart] = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const config = await window.pawzy.readConfig();
        setCfg(config);
        setWorkMin(Math.round((config.limit_seconds || 3600) / 60));
        setBreakMin(Math.round((config.break_seconds || 300) / 60));
        if (config.character) setCharacter(config.character);
        const as = await window.pawzy.getAutostart();
        setAutostart(!!as);
      } catch (e) {
        console.error('Failed to read config:', e);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    const newCfg = {
      ...(cfg || {}),
      limit_seconds: workMin * 60,
      break_seconds: breakMin * 60,
      character,
    };
    await window.pawzy.saveConfig(newCfg);
    await window.pawzy.setAutostart(autostart);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return (
    <div style={s.root}><div style={s.loading}>Loading…</div></div>
  );

  return (
    <div style={s.root}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        input[type=range] { -webkit-appearance:none; appearance:none; background:transparent; width:100%; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none;
          width:24px; height:24px; border-radius:50%;
          background:#f97316; border:3px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,.2);
          margin-top:-10px;
        }
        input[type=range]::-webkit-slider-runnable-track { height:6px; background:transparent; border-radius:3px; }
        input[type=range]:focus { outline:none; }
        button { font-family:inherit; }
      `}</style>

      {/* Custom Title Bar */}
      <div style={s.titleBar}>
        <div style={s.dragRegion}>Pawzy Settings</div>
        <button style={s.closeBtn} onClick={() => window.close()}>×</button>
      </div>

      <div style={s.content}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logo}>🐾</div>
          <div>
            <h1 style={s.title}>Pawzy Dashboard</h1>
            <p style={s.subtitle}>Customize your workflow</p>
          </div>
        </div>

        {/* Timer card */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>⏱ Session Timers</h2>

          <Slider
            label="Work Session"
            value={workMin}
            min={1} max={120} unit="min"
            onChange={setWorkMin}
            description="How long you work before your break is enforced"
          />

          <div style={s.divider} />

          <Slider
            label="Break Duration"
            value={breakMin}
            min={1} max={30} unit="min"
            onChange={setBreakMin}
            description="How long the inescapable lock screen lasts"
          />
        </div>

        {/* Character picker card */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>🐾 Choose Your Hijacker</h2>
          <p style={s.sliderDesc}>Pick who takes over your screen</p>
          <div style={s.charGrid}>
            {CHARACTERS.map(char => (
              <CharCard
                key={char.key}
                char={char}
                selected={character === char.key}
                onClick={() => setCharacter(char.key)}
              />
            ))}
          </div>
        </div>

        {/* Autostart toggle card */}
        <div style={{ ...s.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={s.sectionTitle}>🚀 Launch on Login</h2>
            <p style={{ ...s.sliderDesc, marginTop: '4px' }}>Ensure Pawzy is always running</p>
          </div>
          <button
            onClick={() => setAutostart(a => !a)}
            style={{
              width: '56px', height: '32px', borderRadius: '16px',
              background: autostart ? '#16a34a' : '#e2e8f0',
              border: 'none',
              cursor: 'pointer', position: 'relative', transition: 'all .25s ease',
              boxShadow: autostart ? 'inset 0 2px 4px rgba(0,0,0,.1)' : 'inset 0 2px 4px rgba(0,0,0,.05)',
            }}
          >
            <span style={{
              position: 'absolute', top: '4px',
              left: autostart ? '28px' : '4px',
              width: '24px', height: '24px', borderRadius: '50%',
              background: '#fff', transition: 'left .25s ease',
              boxShadow: '0 2px 5px rgba(0,0,0,.2)',
            }} />
          </button>
        </div>

        {/* Summary row */}
        <div style={s.summary}>
          <div style={s.summaryItem}>
            <span style={s.summaryNumber}>{workMin}</span>
            <span style={s.summaryLabel}>min work</span>
          </div>
          <div style={s.summaryArrow}>→</div>
          <div style={s.summaryItem}>
            <span style={s.summaryNumber}>{breakMin}</span>
            <span style={s.summaryLabel}>min lock</span>
          </div>
          <div style={s.summaryArrow}>→</div>
          <div style={s.summaryItem}>
            <span style={s.summaryNumber}>
              {CHARACTERS.find(c => c.key === character)?.emoji ?? '🐾'}
            </span>
            <span style={s.summaryLabel}>enforcer</span>
          </div>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <div style={{ flex: 1 }}>
            <button 
              style={s.previewBtn} 
              onClick={() => window.pawzy?.testCharacter?.(character)}
              title="Preview how this character looks on your screen for 10 seconds"
            >
              👁️ Preview
            </button>
          </div>
          <button style={s.cancelBtn} onClick={() => window.close()}>Cancel</button>
          <button
            style={{ ...s.saveBtn, ...(saved ? s.savedBtn : {}) }}
            onClick={handleSave}
          >
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    height: '100vh',
    background: '#fdf8f0', // Web app warm cream
    color: '#2d1200',
    display: 'flex', flexDirection: 'column',
    borderRadius: '20px',
    overflow: 'hidden',
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
    overflowY: 'auto',
    padding: '28px 32px',
    display: 'flex', flexDirection: 'column', gap: '24px',
  },
  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: '#78716c', fontSize: '18px',
  },
  header: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: {
    fontSize: '36px',
    background: '#fff', borderRadius: '16px',
    width: '64px', height: '64px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,.06)',
  },
  title:    { fontFamily: "'Fredoka One', cursive", fontSize: '24px', color: '#f97316' },
  subtitle: { fontSize: '14px', color: '#78716c', fontWeight: 700 },
  card: {
    background: '#fff',
    borderRadius: '24px', padding: '28px',
    boxShadow: '0 10px 30px rgba(0,0,0,.04)',
    border: '2px solid #f0e8dc',
    display: 'flex', flexDirection: 'column', gap: '20px',
  },
  sectionTitle: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '15px', color: '#78716c',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  sliderGroup:  { display: 'flex', flexDirection: 'column', gap: '8px' },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  sliderLabel:  { fontSize: '16px', fontWeight: 800, color: '#2d1200' },
  sliderValue:  { fontFamily: "'Fredoka One', cursive", fontSize: '22px', color: '#f97316' },
  sliderDesc:   { fontSize: '13px', color: '#78716c', fontWeight: 600 },
  sliderTrack: {
    position: 'relative', height: '6px',
    background: '#f5f0eb', borderRadius: '3px',
    marginTop: '6px',
  },
  sliderFill: {
    position: 'absolute', top: 0, left: 0, height: '100%',
    background: 'linear-gradient(90deg, #f97316, #fbbf24)',
    borderRadius: '3px', pointerEvents: 'none',
  },
  sliderInput: { position: 'absolute', top: '-10px', left: 0, width: '100%' },
  sliderTicks: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#a8a29e', fontWeight: 700 },
  divider:     { height: '2px', background: '#f5f0eb', margin: '4px -4px' },

  /* Character picker */
  charGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  charCard: {
    position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '6px',
    padding: '16px 12px',
    borderRadius: '20px',
    background: '#fff7ed',
    border: '2px solid #ffedd5',
    cursor: 'pointer',
    transition: 'all .15s ease',
    color: '#2d1200',
  },
  charCardActive: {
    background: '#fff',
    transform: 'translateY(-2px)',
  },
  charEmoji: { fontSize: '38px', lineHeight: 1 },
  charLabel: { fontFamily: "'Fredoka One', cursive", fontSize: '15px', color: '#ea580c' },
  charDesc:  { fontSize: '12px', color: '#78716c', textAlign: 'center', fontWeight: 600 },
  charCheck: {
    position: 'absolute', top: '-6px', right: '-6px',
    width: '24px', height: '24px',
    borderRadius: '50%', fontSize: '13px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800,
    boxShadow: '0 2px 8px rgba(0,0,0,.15)',
  },

  /* Summary */
  summary: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '24px',
    background: '#fff',
    border: '2px solid #f0e8dc',
    boxShadow: '0 10px 30px rgba(0,0,0,.04)',
    borderRadius: '24px', padding: '24px',
  },
  summaryItem:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  summaryNumber: { fontFamily: "'Fredoka One', cursive", fontSize: '32px', color: '#f97316' },
  summaryLabel:  { fontSize: '12px', color: '#78716c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' },
  summaryArrow:  { fontSize: '20px', color: '#d6d3d1', fontWeight: 800 },

  /* Actions */
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: {
    padding: '14px 24px', borderRadius: '50px',
    background: '#f5f0eb',
    border: 'none',
    color: '#78716c', fontSize: '15px', fontWeight: 800, cursor: 'pointer',
  },
  previewBtn: {
    padding: '14px 24px', borderRadius: '50px',
    background: '#fffbeb',
    border: '2px solid #fde68a',
    color: '#d97706', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
    transition: 'all .2s',
  },
  saveBtn: {
    padding: '14px 32px', borderRadius: '50px',
    background: '#16a34a',
    border: 'none', color: '#fff', fontSize: '15px', fontWeight: 800,
    cursor: 'pointer', boxShadow: '0 5px 0 #15803d',
    transition: 'all .1s',
  },
  savedBtn: {
    background: '#059669',
    boxShadow: '0 2px 0 #047857',
    transform: 'translateY(3px)',
  },
};
