import { useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { CHARACTERS, DEFAULT_CHARACTER } from './characters/CharacterRegistry';

const PROMPTS = [
  'Drink some water 💧',
  'Look 20 ft away for 20s 👀',
  'Take 5 deep breaths 🌬️',
  'Stretch your neck 🧘',
  'Stand up & walk around 🚶',
  'Blink rapidly 10 times 👁️',
  'Roll your wrists 🔄',
  'Smile — you earned this! 😊',
];

function fmt(secs) {
  if (secs == null || secs < 0) return '--:--';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function LockScreen() {
  const { breakRemaining } = useAppState();
  const [phase,      setPhase]      = useState('slide');
  const [promptIdx,  setPromptIdx]  = useState(0);
  const [promptVis,  setPromptVis]  = useState(true);
  const [charKey,    setCharKey]    = useState(DEFAULT_CHARACTER);

  // Load character from config on mount
  useEffect(() => {
    if (window.pawzy?.readConfig) {
      window.pawzy.readConfig().then(cfg => {
        if (cfg?.character && CHARACTERS[cfg.character]) {
          setCharKey(cfg.character);
        }
      }).catch(() => {});
    }
  }, []);

  // Reset to slide phase each new break
  useEffect(() => {
    if (breakRemaining !== null) setPhase('slide');
  }, [breakRemaining !== null]);

  // Block ALL keyboard input while the lock screen is active
  useEffect(() => {
    const swallow = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener('keydown',  swallow, true);
    window.addEventListener('keyup',    swallow, true);
    window.addEventListener('keypress', swallow, true);
    return () => {
      window.removeEventListener('keydown',  swallow, true);
      window.removeEventListener('keyup',    swallow, true);
      window.removeEventListener('keypress', swallow, true);
    };
  }, []);

  // Cycle wellness prompts
  useEffect(() => {
    const iv = setInterval(() => {
      setPromptVis(false);
      setTimeout(() => {
        setPromptIdx(i => (i + 1) % PROMPTS.length);
        setPromptVis(true);
      }, 400);
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  if (breakRemaining === null) return null;

  const CharComponent = CHARACTERS[charKey]?.component ?? CHARACTERS[DEFAULT_CHARACTER].component;

  return (
    <div style={s.root}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body, #root {
          width:100%; height:100%; overflow:hidden;
          background:transparent;
          font-family:system-ui,-apple-system,sans-serif;
        }
        @keyframes char-slide-in {
          from { transform: translateX(100vw); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.7} }
      `}</style>

      {/* Active character — receives phase + callback */}
      <CharComponent
        phase={phase}
        onSlideEnd={() => setPhase('sleep')}
      />

      {/* Timer block — left-centre */}
      <div style={s.timerBlock}>
        <div style={s.countdown}>{fmt(breakRemaining)}</div>
        <div style={s.prompt} key={promptIdx}>
          <span style={{ opacity: promptVis ? 1 : 0, transition: 'opacity .4s' }}>
            {PROMPTS[promptIdx]}
          </span>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'transparent',
  },
  timerBlock: {
    position: 'absolute',
    top: '20vh',
    left: '35%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: 'rgba(0,0,0,0.65)',
    borderRadius: '24px',
    padding: '52px 64px',
    animation: 'fadeIn .5s ease both',
    zIndex: 10,
    lineHeight: 1,
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,.08)',
  },
  countdown: {
    fontSize: '140px',
    fontWeight: 900,
    color: '#ffffff',
    letterSpacing: '-4px',
    lineHeight: 1,
    fontFamily: 'sans-serif',
    animation: 'pulse 1s ease-in-out infinite',
  },
  prompt: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.4,
    borderTop: '1px solid rgba(255,255,255,.2)',
    paddingTop: '16px',
    textShadow: '0 2px 12px rgba(0,0,0,.8)',
    letterSpacing: '-0.2px',
  },
};
