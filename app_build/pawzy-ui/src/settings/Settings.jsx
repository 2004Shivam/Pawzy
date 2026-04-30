import React, { useState, useEffect } from 'react';

const CHARACTERS = [
  { key: 'cat_gatekeeper', emoji: '🐱', label: 'Neko Cat',    desc: 'The original gatekeeper', color: '#f97316' },
  { key: 'shiba',          emoji: '🐕', label: 'Shiba Inu',   desc: 'Fluffy & loyal',          color: '#D4773C' },
  { key: 'panda',          emoji: '🐼', label: 'Chill Panda', desc: 'Unbothered & cool',        color: '#64748b' },
  { key: 'fox',            emoji: '🦊', label: 'Fox Kit',     desc: 'Swift & stylish',          color: '#ef4444' },
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
        body { background:#0f0d1a; }
        input[type=range] { -webkit-appearance:none; appearance:none; background:transparent; width:100%; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none;
          width:20px; height:20px; border-radius:50%;
          background:#a855f7; border:2px solid #d8b4fe;
          box-shadow:0 0 8px rgba(168,85,247,.6);
          margin-top:-8px;
        }
        input[type=range]::-webkit-slider-runnable-track { height:4px; background:transparent; border-radius:2px; }
        input[type=range]:focus { outline:none; }
        button { font-family:inherit; }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>🐾</div>
        <div>
          <h1 style={s.title}>Pawzy Settings</h1>
          <p style={s.subtitle}>Customize your focus sessions</p>
        </div>
      </div>

      {/* Timer card */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>⏱ Session Timers</h2>

        <Slider
          label="Work Session"
          value={workMin}
          min={5} max={120} unit="min"
          onChange={setWorkMin}
          description="How long you work before your companion arrives for a break"
        />

        <div style={s.divider} />

        <Slider
          label="Break Duration"
          value={breakMin}
          min={1} max={30} unit="min"
          onChange={setBreakMin}
          description="How long the break lasts — you cannot skip it!"
        />
      </div>

      {/* Character picker card */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>🐾 Choose Your Companion</h2>
        <p style={s.sliderDesc}>Pick who shows up to guard your breaks</p>
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
          <p style={{ ...s.sliderDesc, marginTop: '4px' }}>Start Pawzy automatically when you log in</p>
        </div>
        <button
          onClick={() => setAutostart(a => !a)}
          style={{
            width: '52px', height: '28px', borderRadius: '14px',
            background: autostart ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'rgba(255,255,255,.1)',
            border: autostart ? '2px solid #a855f7' : '2px solid rgba(255,255,255,.2)',
            cursor: 'pointer', position: 'relative', transition: 'all .25s ease',
            boxShadow: autostart ? '0 0 12px rgba(168,85,247,.5)' : 'none',
          }}
        >
          <span style={{
            position: 'absolute', top: '3px',
            left: autostart ? '24px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', transition: 'left .25s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,.3)',
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
          <span style={s.summaryLabel}>min break</span>
        </div>
        <div style={s.summaryArrow}>→</div>
        <div style={s.summaryItem}>
          <span style={s.summaryNumber}>
            {CHARACTERS.find(c => c.key === character)?.emoji ?? '🐾'}
          </span>
          <span style={s.summaryLabel}>companion</span>
        </div>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button style={s.cancelBtn} onClick={() => window.close()}>Cancel</button>
        <button
          style={{ ...s.saveBtn, ...(saved ? s.savedBtn : {}) }}
          onClick={handleSave}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0d1a 0%, #1a1330 100%)',
    padding: '32px 28px',
    color: '#e2e8f0',
    display: 'flex', flexDirection: 'column', gap: '24px',
  },
  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', color: '#94a3b8', fontSize: '18px',
  },
  header: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: {
    fontSize: '40px',
    background: 'rgba(168,85,247,.15)', borderRadius: '16px',
    width: '60px', height: '60px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(168,85,247,.3)',
  },
  title:    { fontSize: '22px', fontWeight: 700, color: '#f1f5f9' },
  subtitle: { fontSize: '13px', color: '#94a3b8', marginTop: '2px' },
  card: {
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '20px', padding: '28px',
    display: 'flex', flexDirection: 'column', gap: '20px',
  },
  sectionTitle: {
    fontSize: '14px', fontWeight: 600, color: '#a855f7',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  sliderGroup:  { display: 'flex', flexDirection: 'column', gap: '10px' },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  sliderLabel:  { fontSize: '16px', fontWeight: 600, color: '#e2e8f0' },
  sliderValue:  { fontSize: '22px', fontWeight: 800, color: '#d8b4fe', fontVariantNumeric: 'tabular-nums' },
  sliderDesc:   { fontSize: '12px', color: '#64748b', lineHeight: 1.5 },
  sliderTrack: {
    position: 'relative', height: '4px',
    background: 'rgba(255,255,255,.1)', borderRadius: '2px',
  },
  sliderFill: {
    position: 'absolute', top: 0, left: 0, height: '100%',
    background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
    borderRadius: '2px', pointerEvents: 'none',
  },
  sliderInput: { position: 'absolute', top: '-8px', left: 0, width: '100%' },
  sliderTicks: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' },
  divider:     { height: '1px', background: 'rgba(255,255,255,.06)', margin: '0 -4px' },

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
    padding: '18px 12px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,.04)',
    border: '1.5px solid rgba(255,255,255,.1)',
    cursor: 'pointer',
    transition: 'all .2s ease',
    color: '#e2e8f0',
  },
  charCardActive: {
    background: 'rgba(255,255,255,.08)',
  },
  charEmoji: { fontSize: '36px', lineHeight: 1 },
  charLabel: { fontSize: '14px', fontWeight: 700, color: '#f1f5f9' },
  charDesc:  { fontSize: '11px', color: '#64748b', textAlign: 'center' },
  charCheck: {
    position: 'absolute', top: '8px', right: '8px',
    width: '20px', height: '20px',
    borderRadius: '50%', fontSize: '11px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800,
  },

  /* Summary */
  summary: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '20px',
    background: 'rgba(168,85,247,.08)',
    border: '1px solid rgba(168,85,247,.2)',
    borderRadius: '16px', padding: '20px',
  },
  summaryItem:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  summaryNumber: { fontSize: '28px', fontWeight: 800, color: '#d8b4fe', fontVariantNumeric: 'tabular-nums' },
  summaryLabel:  { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  summaryArrow:  { fontSize: '20px', color: '#475569' },

  /* Actions */
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '12px 24px', borderRadius: '12px',
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.1)',
    color: '#94a3b8', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
  },
  saveBtn: {
    padding: '12px 32px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700,
    cursor: 'pointer', boxShadow: '0 4px 20px rgba(168,85,247,.4)',
    transition: 'all .2s',
  },
  savedBtn: {
    background: 'linear-gradient(135deg, #059669, #10b981)',
    boxShadow: '0 4px 20px rgba(16,185,129,.4)',
  },
};
