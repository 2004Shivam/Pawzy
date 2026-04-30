/**
 * src/character/CssCharacter.jsx
 *
 * A pure CSS/SVG animated cat character — fully functional placeholder
 * that works without any .riv file. Responds to all the same state props.
 *
 * States: idle | warning | lock | break | happy
 */

import { useEffect, useRef, useState } from 'react';

const STATE_COLORS = {
  idle:    { body: '#7c6f8e', accent: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
  warning: { body: '#c07a2e', accent: '#fbbf24', glow: 'rgba(251,191,36,0.5)'  },
  lock:    { body: '#7f1d1d', accent: '#ef4444', glow: 'rgba(239,68,68,0.5)'   },
  break:   { body: '#1e3a5f', accent: '#60a5fa', glow: 'rgba(96,165,250,0.4)'  },
  happy:   { body: '#1a4731', accent: '#34d399', glow: 'rgba(52,211,153,0.5)'  },
};

const STATE_EMOJIS = {
  idle:    '😺',
  warning: '🙀',
  lock:    '😾',
  break:   '😸',
  happy:   '🎉',
};

export function CssCharacter({ state = 'idle', eyeX = 0, eyeY = 0, isIdle = false, onClick }) {
  const colors = STATE_COLORS[state] || STATE_COLORS.idle;
  const [bounce, setBounce] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Bounce animation on state change
  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 600);
    return () => clearTimeout(t);
  }, [state]);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
    if (onClick) onClick();
  };

  // Clamp eye offset
  const ex = Math.max(-6, Math.min(6, eyeX * 6));
  const ey = Math.max(-4, Math.min(4, eyeY * 4));

  const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    animation: bounce
      ? 'catBounce 0.5s ease'
      : isIdle
      ? 'catIdle 3s ease-in-out infinite'
      : 'catFloat 4s ease-in-out infinite',
    filter: `drop-shadow(0 8px 24px ${colors.glow})`,
    transform: clicked ? 'scale(0.88)' : 'scale(1)',
    transition: 'transform 0.15s ease, filter 0.4s ease',
  };

  return (
    <>
      <style>{`
        @keyframes catFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes catIdle {
          0%, 90%, 100% { transform: translateY(0px) rotate(0deg); }
          95% { transform: translateY(-2px) rotate(-3deg); }
        }
        @keyframes catBounce {
          0%   { transform: scale(1) translateY(0); }
          30%  { transform: scale(1.18) translateY(-10px); }
          60%  { transform: scale(0.93) translateY(0); }
          80%  { transform: scale(1.06) translateY(-4px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes earWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes tailSwing {
          0%, 100% { transform: rotate(-20deg) scaleY(1); }
          50% { transform: rotate(20deg) scaleY(1.05); }
        }
        @keyframes pupilBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }
        @keyframes warnPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={containerStyle} onClick={handleClick}>
        <svg
          viewBox="0 0 120 120"
          width="120"
          height="120"
          style={{ overflow: 'visible' }}
        >
          {/* Glow under character */}
          <ellipse cx="60" cy="112" rx="28" ry="6"
            fill={colors.glow} opacity="0.6" />

          {/* Tail */}
          <path
            d="M 30 90 Q 10 80 15 60 Q 18 48 28 55"
            fill="none"
            stroke={colors.body}
            strokeWidth="8"
            strokeLinecap="round"
            style={{ animation: state === 'break' ? 'tailSwing 1s ease-in-out infinite' : 'tailSwing 2.5s ease-in-out infinite' }}
          />

          {/* Body */}
          <ellipse cx="60" cy="80" rx="28" ry="26"
            fill={colors.body} />

          {/* Belly spot */}
          <ellipse cx="60" cy="83" rx="16" ry="14"
            fill="rgba(255,255,255,0.15)" />

          {/* Head */}
          <circle cx="60" cy="50" r="28" fill={colors.body} />

          {/* Left ear */}
          <polygon
            points="36,28 30,10 48,24"
            fill={colors.body}
            style={{ transformOrigin: '38px 26px', animation: 'earWiggle 3s ease-in-out infinite' }}
          />
          <polygon points="37,25 33,15 45,24" fill={colors.accent} opacity="0.6" />

          {/* Right ear */}
          <polygon
            points="84,28 90,10 72,24"
            fill={colors.body}
            style={{ transformOrigin: '82px 26px', animation: 'earWiggle 3s ease-in-out infinite reverse' }}
          />
          <polygon points="83,25 87,15 75,24" fill={colors.accent} opacity="0.6" />

          {/* Left eye white */}
          <ellipse cx="48" cy="48" rx="9" ry="10" fill="rgba(255,255,255,0.92)" />
          {/* Left pupil (follows cursor) */}
          <ellipse
            cx={48 + ex}
            cy={48 + ey}
            rx="5" ry="5.5"
            fill="#1a1a2e"
            style={{ animation: 'pupilBlink 4s ease-in-out infinite' }}
          />
          {/* Left eye shine */}
          <circle cx={46 + ex} cy={45 + ey} r="2" fill="white" opacity="0.9" />

          {/* Right eye white */}
          <ellipse cx="72" cy="48" rx="9" ry="10" fill="rgba(255,255,255,0.92)" />
          {/* Right pupil */}
          <ellipse
            cx={72 + ex}
            cy={48 + ey}
            rx="5" ry="5.5"
            fill="#1a1a2e"
            style={{ animation: 'pupilBlink 4s ease-in-out 0.2s infinite' }}
          />
          <circle cx={70 + ex} cy={45 + ey} r="2" fill="white" opacity="0.9" />

          {/* Nose */}
          <polygon points="60,57 57,61 63,61" fill={colors.accent} />

          {/* Mouth */}
          {state === 'happy' || state === 'break' ? (
            <>
              <path d="M 57 62 Q 53 67 50 64" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 63 62 Q 67 67 70 64" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : state === 'warning' || state === 'lock' ? (
            <path d="M 50 67 Q 60 62 70 67" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <>
              <path d="M 57 62 Q 53 66 50 64" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 63 62 Q 67 66 70 64" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}

          {/* Whiskers */}
          <line x1="30" y1="58" x2="53" y2="61" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round" />
          <line x1="28" y1="63" x2="52" y2="63" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round" />
          <line x1="67" y1="61" x2="90" y2="58" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round" />
          <line x1="68" y1="63" x2="92" y2="63" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round" />

          {/* Paws */}
          <ellipse cx="42" cy="102" rx="10" ry="7" fill={colors.body} />
          <ellipse cx="78" cy="102" rx="10" ry="7" fill={colors.body} />

          {/* Warning pulse ring */}
          {state === 'warning' && (
            <circle cx="60" cy="50" r="34" fill="none" stroke={colors.accent}
              strokeWidth="3" opacity="0.7"
              style={{ animation: 'warnPulse 0.8s ease-in-out infinite' }} />
          )}

          {/* Lock icon badge */}
          {state === 'lock' && (
            <text x="60" y="22" textAnchor="middle" fontSize="18" style={{ userSelect: 'none' }}>🔒</text>
          )}

          {/* Happy confetti badge */}
          {state === 'happy' && (
            <text x="60" y="22" textAnchor="middle" fontSize="18" style={{ userSelect: 'none' }}>🎉</text>
          )}
        </svg>
      </div>
    </>
  );
}
