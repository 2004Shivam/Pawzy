/**
 * ShibaInu.jsx — Original SVG Shiba Inu character.
 * Slides in from the right, then idles with a breathing animation.
 */
import { useEffect } from 'react';

export function ShibaInu({ phase, onSlideEnd }) {
  useEffect(() => {
    if (phase === 'slide') {
      const t = setTimeout(onSlideEnd, 4200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div style={phase === 'slide' ? s.slideWrap : s.idleWrap}>
      <style>{`
        @keyframes shiba-walk {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes shiba-breathe {
          0%,100% { transform: translateY(0px) scaleX(1); }
          50%      { transform: translateY(-6px) scaleX(1.01); }
        }
        @keyframes shiba-ear-twitch {
          0%,85%,100% { transform: rotate(0deg); }
          90%         { transform: rotate(-8deg); }
          95%         { transform: rotate(5deg); }
        }
        @keyframes shiba-tail {
          0%,100% { transform: rotate(0deg); }
          50%      { transform: rotate(12deg); }
        }
        @keyframes shiba-leg-l {
          0%,100% { transform: rotate(-15deg); }
          50%      { transform: rotate(15deg); }
        }
        @keyframes shiba-leg-r {
          0%,100% { transform: rotate(15deg); }
          50%      { transform: rotate(-15deg); }
        }
        .shiba-body { animation: ${phase === 'slide' ? 'shiba-walk .55s ease-in-out infinite' : 'shiba-breathe 3s ease-in-out infinite'}; }
        .shiba-ear-l { transform-origin: bottom center; animation: shiba-ear-twitch 4s ease-in-out infinite; }
        .shiba-ear-r { transform-origin: bottom center; animation: shiba-ear-twitch 4s ease-in-out infinite .6s; }
        .shiba-tail  { transform-origin: left bottom; animation: shiba-tail ${phase === 'slide' ? '.4s' : '1.2s'} ease-in-out infinite; }
        .shiba-leg-fl { transform-origin: top center; animation: shiba-leg-l .55s ease-in-out infinite; }
        .shiba-leg-fr { transform-origin: top center; animation: shiba-leg-r .55s ease-in-out infinite; }
        .shiba-leg-bl { transform-origin: top center; animation: shiba-leg-r .55s ease-in-out infinite .1s; }
        .shiba-leg-br { transform-origin: top center; animation: shiba-leg-l .55s ease-in-out infinite .1s; }
      `}</style>

      <svg
        className="shiba-body"
        width="320" height="420"
        viewBox="0 0 320 420"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <radialGradient id="sb-body" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#E8924A" />
            <stop offset="100%" stopColor="#C4622A" />
          </radialGradient>
          <radialGradient id="sb-cream" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#FBF0E0" />
            <stop offset="100%" stopColor="#F0D9B8" />
          </radialGradient>
          <radialGradient id="sb-head" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#EA9656" />
            <stop offset="100%" stopColor="#C8652E" />
          </radialGradient>
        </defs>

        {/* Tail */}
        <g className="shiba-tail" style={{ position: 'absolute' }}>
          <ellipse cx="252" cy="230" rx="32" ry="18" fill="url(#sb-body)" transform="rotate(-40 252 230)" />
          <ellipse cx="268" cy="210" rx="22" ry="13" fill="url(#sb-cream)" transform="rotate(-55 268 210)" />
        </g>

        {/* Body */}
        <ellipse cx="155" cy="300" rx="100" ry="110" fill="url(#sb-body)" />
        {/* Belly */}
        <ellipse cx="155" cy="330" rx="60" ry="72" fill="url(#sb-cream)" />

        {/* Back legs */}
        <g className="shiba-leg-bl">
          <rect x="90" y="370" width="30" height="55" rx="14" fill="#B85920" />
          <ellipse cx="105" cy="428" rx="20" ry="10" fill="#9A4A18" />
        </g>
        <g className="shiba-leg-br">
          <rect x="190" y="370" width="30" height="55" rx="14" fill="#B85920" />
          <ellipse cx="205" cy="428" rx="20" ry="10" fill="#9A4A18" />
        </g>

        {/* Front legs */}
        <g className="shiba-leg-fl">
          <rect x="102" y="360" width="28" height="60" rx="13" fill="#C86832" />
          <ellipse cx="116" cy="422" rx="18" ry="9" fill="#A85522" />
        </g>
        <g className="shiba-leg-fr">
          <rect x="182" y="360" width="28" height="60" rx="13" fill="#C86832" />
          <ellipse cx="196" cy="422" rx="18" ry="9" fill="#A85522" />
        </g>

        {/* Neck */}
        <ellipse cx="155" cy="205" rx="52" ry="42" fill="url(#sb-body)" />

        {/* Left ear (background) */}
        <g className="shiba-ear-l">
          <ellipse cx="102" cy="128" rx="26" ry="38" fill="#C05520" transform="rotate(-15 102 128)" />
          <ellipse cx="102" cy="130" rx="14" ry="22" fill="#FFB5A0" transform="rotate(-15 102 130)" />
        </g>
        {/* Right ear (background) */}
        <g className="shiba-ear-r">
          <ellipse cx="210" cy="128" rx="26" ry="38" fill="#C05520" transform="rotate(15 210 128)" />
          <ellipse cx="210" cy="130" rx="14" ry="22" fill="#FFB5A0" transform="rotate(15 210 130)" />
        </g>

        {/* Head */}
        <circle cx="155" cy="168" r="88" fill="url(#sb-head)" />

        {/* Forehead lighter patch */}
        <ellipse cx="155" cy="148" rx="42" ry="28" fill="#EFA86A" opacity="0.5" />

        {/* Muzzle */}
        <ellipse cx="155" cy="195" rx="48" ry="34" fill="url(#sb-cream)" />

        {/* Eyes */}
        <circle cx="124" cy="162" r="14" fill="#1a1008" />
        <circle cx="188" cy="162" r="14" fill="#1a1008" />
        {/* Eye shine */}
        <circle cx="130" cy="157" r="5" fill="white" opacity="0.9" />
        <circle cx="194" cy="157" r="5" fill="white" opacity="0.9" />
        <circle cx="118" cy="167" r="2" fill="white" opacity="0.5" />
        <circle cx="182" cy="167" r="2" fill="white" opacity="0.5" />

        {/* Nose */}
        <ellipse cx="155" cy="192" rx="16" ry="10" fill="#2a1800" />
        <ellipse cx="152" cy="189" rx="4" ry="3" fill="white" opacity="0.3" />

        {/* Mouth */}
        <path d="M 145 204 Q 155 212 165 204" fill="none" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" />

        {/* Cheek blush */}
        <ellipse cx="106" cy="182" rx="16" ry="10" fill="#FF9B7A" opacity="0.35" />
        <ellipse cx="204" cy="182" rx="16" ry="10" fill="#FF9B7A" opacity="0.35" />

        {/* Collar */}
        <rect x="118" y="238" width="75" height="18" rx="9" fill="#E63946" />
        <circle cx="155" cy="247" r="6" fill="#FFD700" />
      </svg>
    </div>
  );
}

const s = {
  slideWrap: {
    position: 'absolute',
    bottom: 0,
    right: '5%',
    animation: 'char-slide-in 4s cubic-bezier(.22,1,.36,1) forwards',
    display: 'flex',
    alignItems: 'flex-end',
  },
  idleWrap: {
    position: 'absolute',
    bottom: 0,
    right: '5%',
    display: 'flex',
    alignItems: 'flex-end',
  },
};
