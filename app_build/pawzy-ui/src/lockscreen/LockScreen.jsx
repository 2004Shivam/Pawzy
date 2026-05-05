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
  const [previewRemaining, setPreviewRemaining] = useState(null);
  const [previewCharKey,   setPreviewCharKey]   = useState(null);

  // Handle preview mode
  useEffect(() => {
    if (window.pawzy?.on) {
      return window.pawzy.on('preview_start', ({ charKey }) => {
        setPreviewCharKey(charKey);
        setPreviewRemaining(10);
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

  const isPreview = previewRemaining !== null;
  const activeRemaining = isPreview ? previewRemaining : breakRemaining;
  const activeCharKey = isPreview ? previewCharKey : null; // CharKey is read inside UI component

  if (activeRemaining === null) return null;

  return (
    <LockScreenUI 
      activeRemaining={activeRemaining} 
      isPreview={isPreview} 
      previewCharKey={previewCharKey}
    />
  );
}

function LockScreenUI({ activeRemaining, isPreview, previewCharKey }) {
  const [phase, setPhase] = useState('slide');
  const [promptIdx, setPromptIdx] = useState(0);
  const [promptVis, setPromptVis] = useState(true);
  const [charKey, setCharKey] = useState(DEFAULT_CHARACTER);

  // Load character from config
  useEffect(() => {
    if (window.pawzy?.readConfig) {
      window.pawzy.readConfig().then(cfg => {
        if (cfg?.character && CHARACTERS[cfg.character]) {
          setCharKey(cfg.character);
        }
      }).catch(() => {});
    }
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

  const activeCharKey = isPreview ? previewCharKey : charKey;
  const CharComponent = CHARACTERS[activeCharKey]?.component ?? CHARACTERS[DEFAULT_CHARACTER].component;
  const previewCharInfo = isPreview
    ? Object.entries(CHARACTERS).find(([k]) => k === previewCharKey)?.[1]
    : null;

  return (
    <div style={s.root}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body, #root {
          width:100%; height:100%; overflow:hidden;
          background: rgba(0,0,0,0.01);
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
        @keyframes previewPop {
          0%   { transform: translateX(-50%) scale(0.8); opacity:0; }
          60%  { transform: translateX(-50%) scale(1.05); opacity:1; }
          100% { transform: translateX(-50%) scale(1); opacity:1; }
        }
      `}</style>

      {/* Active character — receives phase + callback */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
        <CharComponent
          phase={phase}
          onSlideEnd={() => setPhase('sleep')}
        />
      </div>

      {/* PREVIEW MODE badge — only shown during preview */}
      {isPreview && (
        <div style={s.previewBadge}>
          <div style={s.previewEyeRow}>
            <span style={s.previewEyeIcon}>👁</span>
            <span style={s.previewModeLabel}>PREVIEW MODE</span>
          </div>
          {previewCharInfo && (
            <div style={s.previewCharName}>
              {previewCharInfo.emoji} {previewCharInfo.label}
            </div>
          )}
          <div style={s.previewCountdown}>
            Closing in <strong>{activeRemaining}s</strong>
          </div>
          <div style={s.previewHint}>This is just a preview — no changes saved yet</div>
        </div>
      )}

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
    background: 'rgba(0,0,0,0.01)',
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

  /* Preview badge */
  previewBadge: {
    position: 'absolute',
    top: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '2px solid rgba(251,191,36,0.6)',
    borderRadius: '20px',
    padding: '16px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    animation: 'previewPop .4s cubic-bezier(.22,1,.36,1) both',
    minWidth: '240px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.2)',
  },
  previewEyeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  previewEyeIcon: { fontSize: '18px' },
  previewModeLabel: {
    fontSize: '11px',
    fontWeight: 900,
    color: '#fbbf24',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  previewCharName: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.3px',
  },
  previewCountdown: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 600,
  },
  previewHint: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 600,
    marginTop: '2px',
  },
};
