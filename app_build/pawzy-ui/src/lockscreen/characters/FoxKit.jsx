import { useEffect } from 'react';

export function FoxKit({ phase, onSlideEnd }) {
  useEffect(() => {
    if (phase === 'slide') {
      const t = setTimeout(onSlideEnd, 4200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div style={phase === 'slide' ? s.slideWrap : s.idleWrap}>
      <style>{`
        @keyframes fx-trot {
          0%,100% { transform: translateY(0) rotate(-1deg); }
          50%      { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes fx-breathe {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes fx-tail {
          0%,100% { transform: rotate(-8deg); }
          50%      { transform: rotate(18deg); }
        }
        @keyframes fx-ear-l { 0%,80%,100%{transform:rotate(0)} 85%{transform:rotate(-10deg)} 92%{transform:rotate(6deg)} }
        @keyframes fx-ear-r { 0%,80%,100%{transform:rotate(0)} 85%{transform:rotate(10deg)}  92%{transform:rotate(-6deg)} }
        @keyframes fx-leg-f { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(18deg)} }
        @keyframes fx-leg-b { 0%,100%{transform:rotate(18deg)}  50%{transform:rotate(-18deg)} }
        @keyframes fx-star {
          0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)}
        }
        .fx-body   { animation: ${phase==='slide'?'fx-trot .5s ease-in-out infinite':'fx-breathe 3s ease-in-out infinite'}; }
        .fx-tail   { transform-origin: left bottom; animation: fx-tail ${phase==='slide'?'.4s':'1.4s'} ease-in-out infinite; }
        .fx-ear-l  { transform-origin: bottom center; animation: fx-ear-l 3.5s ease-in-out infinite; }
        .fx-ear-r  { transform-origin: bottom center; animation: fx-ear-r 3.5s ease-in-out infinite .5s; }
        .fx-leg-fl { transform-origin: top center; animation: fx-leg-f .5s ease-in-out infinite; }
        .fx-leg-fr { transform-origin: top center; animation: fx-leg-b .5s ease-in-out infinite; }
        .fx-leg-bl { transform-origin: top center; animation: fx-leg-b .5s ease-in-out infinite .05s; }
        .fx-leg-br { transform-origin: top center; animation: fx-leg-f .5s ease-in-out infinite .05s; }
        .fx-star1  { animation: fx-star 2s ease-in-out infinite; }
        .fx-star2  { animation: fx-star 2s ease-in-out infinite .65s; }
        .fx-star3  { animation: fx-star 2s ease-in-out infinite 1.3s; }
      `}</style>

      <svg className="fx-body" width="360" height="460" viewBox="0 0 360 460"
           xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
        <defs>
          <radialGradient id="fx-orange" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#F07830"/>
            <stop offset="100%" stopColor="#C8501A"/>
          </radialGradient>
          <radialGradient id="fx-cream" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#FDF3E7"/>
            <stop offset="100%" stopColor="#EDD9B8"/>
          </radialGradient>
          <radialGradient id="fx-dark" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#2a1800"/>
            <stop offset="100%" stopColor="#120a00"/>
          </radialGradient>
        </defs>

        {/* Sleep stars */}
        {phase==='sleep' && <>
          <text className="fx-star1" x="240" y="88"  fontSize="18" fill="#fbbf24" fontFamily="sans-serif">✦</text>
          <text className="fx-star2" x="264" y="62"  fontSize="13" fill="#fbbf24" fontFamily="sans-serif">✦</text>
          <text className="fx-star3" x="220" y="60"  fontSize="10" fill="#fbbf24" fontFamily="sans-serif">✦</text>
        </>}

        {/* Fluffy tail */}
        <g className="fx-tail">
          {/* Main tail */}
          <ellipse cx="272" cy="310" rx="58" ry="28" fill="url(#fx-orange)" transform="rotate(-35 272 310)"/>
          <ellipse cx="292" cy="278" rx="46" ry="22" fill="url(#fx-orange)" transform="rotate(-55 292 278)"/>
          <ellipse cx="298" cy="252" rx="34" ry="18" fill="url(#fx-orange)" transform="rotate(-70 298 252)"/>
          {/* White tip */}
          <ellipse cx="296" cy="236" rx="24" ry="16" fill="url(#fx-cream)" transform="rotate(-80 296 236)"/>
        </g>

        {/* Body */}
        <ellipse cx="168" cy="298" rx="88" ry="108" fill="url(#fx-orange)"/>
        {/* Chest cream patch */}
        <ellipse cx="168" cy="320" rx="52" ry="70" fill="url(#fx-cream)"/>

        {/* Black legs */}
        <g className="fx-leg-bl">
          <rect x="106" y="368" width="26" height="60" rx="12" fill="#1a1008"/>
          <ellipse cx="119" cy="430" rx="18" ry="9" fill="#0f0804"/>
        </g>
        <g className="fx-leg-br">
          <rect x="196" y="368" width="26" height="60" rx="12" fill="#1a1008"/>
          <ellipse cx="209" cy="430" rx="18" ry="9" fill="#0f0804"/>
        </g>
        <g className="fx-leg-fl">
          <rect x="114" y="358" width="24" height="58" rx="11" fill="#221408"/>
          <ellipse cx="126" cy="418" rx="16" ry="8" fill="#1a1008"/>
        </g>
        <g className="fx-leg-fr">
          <rect x="190" y="358" width="24" height="58" rx="11" fill="#221408"/>
          <ellipse cx="202" cy="418" rx="16" ry="8" fill="#1a1008"/>
        </g>

        {/* Neck */}
        <ellipse cx="168" cy="208" rx="48" ry="40" fill="url(#fx-orange)"/>

        {/* Left ear */}
        <g className="fx-ear-l">
          <ellipse cx="110" cy="116" rx="28" ry="42" fill="url(#fx-orange)" transform="rotate(-18 110 116)"/>
          <ellipse cx="110" cy="118" rx="14" ry="26" fill="#FFB5A0" transform="rotate(-18 110 118)"/>
          {/* Black ear tip */}
          <ellipse cx="104" cy="90"  rx="14" ry="16" fill="url(#fx-dark)" transform="rotate(-18 104 90)"/>
        </g>
        {/* Right ear */}
        <g className="fx-ear-r">
          <ellipse cx="228" cy="116" rx="28" ry="42" fill="url(#fx-orange)" transform="rotate(18 228 116)"/>
          <ellipse cx="228" cy="118" rx="14" ry="26" fill="#FFB5A0" transform="rotate(18 228 118)"/>
          <ellipse cx="234" cy="90"  rx="14" ry="16" fill="url(#fx-dark)" transform="rotate(18 234 90)"/>
        </g>

        {/* Head */}
        <circle cx="168" cy="170" r="84" fill="url(#fx-orange)"/>

        {/* White face mask */}
        <ellipse cx="168" cy="185" rx="56" ry="52" fill="url(#fx-cream)"/>

        {/* Black eye markings */}
        <ellipse cx="132" cy="162" rx="22" ry="16" fill="url(#fx-dark)" transform="rotate(-8 132 162)"/>
        <ellipse cx="206" cy="162" rx="22" ry="16" fill="url(#fx-dark)" transform="rotate(8 206 162)"/>

        {/* Eyes */}
        <circle cx="132" cy="162" r="11" fill="#1a0800"/>
        <circle cx="206" cy="162" r="11" fill="#1a0800"/>
        {/* Eye shine */}
        <circle cx="137" cy="157" r="4"  fill="white" opacity="0.9"/>
        <circle cx="211" cy="157" r="4"  fill="white" opacity="0.9"/>
        <circle cx="128" cy="165" r="2"  fill="white" opacity="0.5"/>
        <circle cx="202" cy="165" r="2"  fill="white" opacity="0.5"/>
        {/* Amber iris */}
        <circle cx="132" cy="162" r="7"  fill="#D4700A" opacity="0.6"/>
        <circle cx="206" cy="162" r="7"  fill="#D4700A" opacity="0.6"/>

        {/* Nose */}
        <ellipse cx="168" cy="196" rx="12" ry="8" fill="#1a0808"/>
        <ellipse cx="165" cy="193" rx="3"  ry="2" fill="white" opacity="0.3"/>

        {/* Mouth */}
        <path d="M159 207 Q168 215 177 207" fill="none" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>

        {/* Cheek blush */}
        <ellipse cx="116" cy="184" rx="14" ry="8" fill="#FF9060" opacity="0.3"/>
        <ellipse cx="222" cy="184" rx="14" ry="8" fill="#FF9060" opacity="0.3"/>
      </svg>
    </div>
  );
}

const s = {
  slideWrap: {
    position:'absolute', bottom:0, right:'5%',
    animation:'char-slide-in 4s cubic-bezier(.22,1,.36,1) forwards',
    display:'flex', alignItems:'flex-end',
  },
  idleWrap: {
    position:'absolute', bottom:0, right:'5%',
    display:'flex', alignItems:'flex-end',
  },
};
