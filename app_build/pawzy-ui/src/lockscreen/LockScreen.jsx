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

  const [previewRemaining, setPreviewRemaining] = useState(null);
  const [previewCharKey,   setPreviewCharKey]   = useState(null);

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

  // Handle preview mode
  useEffect(() => {
    if (window.pawzy?.on) {
      return window.pawzy.on('preview_start', ({ charKey }) => {
        setPreviewCharKey(charKey);
        setPreviewRemaining(10);
        setPhase('slide');
      });
    }
  }, []);

  // Local countdown for preview mode
  useEffect(() => {
    if (previewRemaining !== null && previewRemaining > 0) {
      const t = setTimeout(() => setPreviewRemaining(r => r - 1), 1000);
      return () => clearTimeout(t);
    } else if (previewRemaining === 0) {
      setPreviewRemaining(null);
      setPreviewCharKey(null);
    }
  }, [previewRemaining]);

  // Reset to slide phase each new actual break
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

  const isPreview = previewRemaining !== null;
  const activeRemaining = isPreview ? previewRemaining : breakRemaining;
  const activeCharKey = isPreview ? previewCharKey : charKey;

  if (activeRemaining === null) return null;

  const CharComponent = CHARACTERS[activeCharKey]?.component ?? CHARACTERS[DEFAULT_CHARACTER].component;

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
        @keyframes char-slide-in-left {
          from { transform: translateX(-100vw); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.7} }
      `}</style>

      {/* Active character — receives phase + callback */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
        <CharComponent
          phase={phase}
          onSlideEnd={() => setPhase('sleep')}
        />
      </div>

      {/* Timer block — left-centre */}
      <div style={s.timerBlock}>
        <div style={s.countdown}>{fmt(activeRemaining)}</div>
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
    background: 'transparent',
    borderRadius: '24px',
    padding: '52px 64px',
    animation: 'fadeIn .5s ease both',
    zIndex: 10,
    lineHeight: 1,
    border: 'none',
  },
  countdown: {
    fontSize: '140px',
    fontWeight: 900,
    color: '#ffffff',
    letterSpacing: '-4px',
    lineHeight: 1,
    fontFamily: 'sans-serif',
    animation: 'pulse 1s ease-in-out infinite',
    textShadow: '0 4px 24px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
  },
  prompt: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.4,
    borderTop: '2px solid rgba(255,255,255,.4)',
    paddingTop: '16px',
    textShadow: '0 2px 12px rgba(0,0,0,.9), 0 0 8px rgba(0,0,0,0.6)',
    letterSpacing: '-0.2px',
  },
};
