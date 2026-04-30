import { useEffect } from 'react';

export function ChillPanda({ phase, onSlideEnd }) {
  useEffect(() => {
    if (phase === 'slide') {
      const t = setTimeout(onSlideEnd, 4200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div style={phase === 'slide' ? s.slideWrap : s.idleWrap}>
      <style>{`
        @keyframes pd-waddle {
          0%,100% { transform: translateY(0) rotate(-2deg); }
          50%      { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes pd-breathe {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes pd-arm-l { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(12deg)} }
        @keyframes pd-arm-r { 0%,100%{transform:rotate(5deg)}  50%{transform:rotate(-12deg)} }
        @keyframes pd-zzz {
          0%   { opacity:0; transform:translate(0,0) scale(.5); }
          30%  { opacity:1; }
          100% { opacity:0; transform:translate(18px,-38px) scale(1); }
        }
        @keyframes pd-bamboo { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        .pd-body   { animation: ${phase==='slide'?'pd-waddle .6s ease-in-out infinite':'pd-breathe 3.5s ease-in-out infinite'}; }
        .pd-arm-l  { transform-origin:top right; animation:pd-arm-l .6s ease-in-out infinite; }
        .pd-arm-r  { transform-origin:top left;  animation:pd-arm-r .6s ease-in-out infinite; }
        .pd-bamboo { transform-origin:bottom center; animation:pd-bamboo 2s ease-in-out infinite; }
        .pd-z1 { animation:pd-zzz 2.5s ease-in-out infinite; }
        .pd-z2 { animation:pd-zzz 2.5s ease-in-out infinite .85s; }
        .pd-z3 { animation:pd-zzz 2.5s ease-in-out infinite 1.7s; }
      `}</style>

      <svg className="pd-body" width="320" height="430" viewBox="0 0 320 430"
           xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
        <defs>
          <radialGradient id="pd-w" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#FAFAFA"/>
            <stop offset="100%" stopColor="#E4E4E4"/>
          </radialGradient>
          <radialGradient id="pd-b" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#3a3a3a"/>
            <stop offset="100%" stopColor="#111"/>
          </radialGradient>
        </defs>

        {/* Bamboo (sleep only) */}
        {phase==='sleep' && (
          <g className="pd-bamboo">
            <rect x="255" y="170" width="16" height="220" rx="5" fill="#5a9a3a"/>
            <rect x="255" y="200" width="16" height="7" rx="3" fill="#3a7a1a"/>
            <rect x="255" y="265" width="16" height="7" rx="3" fill="#3a7a1a"/>
            <path d="M271 210 Q300 195 292 172" fill="none" stroke="#5a9a3a" strokeWidth="9" strokeLinecap="round"/>
          </g>
        )}

        {/* ZZZ (sleep only) */}
        {phase==='sleep' && <>
          <text className="pd-z1" x="198" y="95" fontSize="20" fontWeight="900" fill="#94a3b8" fontFamily="sans-serif">Z</text>
          <text className="pd-z2" x="216" y="70" fontSize="15" fontWeight="900" fill="#94a3b8" fontFamily="sans-serif">Z</text>
          <text className="pd-z3" x="230" y="52" fontSize="11" fontWeight="900" fill="#94a3b8" fontFamily="sans-serif">Z</text>
        </>}

        {/* Body */}
        <ellipse cx="155" cy="305" rx="108" ry="118" fill="url(#pd-w)"/>
        <ellipse cx="155" cy="325" rx="64" ry="74" fill="#F2F2F2"/>

        {/* Black leg patches */}
        <ellipse cx="96"  cy="382" rx="46" ry="36" fill="url(#pd-b)"/>
        <ellipse cx="216" cy="382" rx="46" ry="36" fill="url(#pd-b)"/>
        <ellipse cx="95"  cy="406" rx="34" ry="17" fill="#1a1a1a"/>
        <ellipse cx="217" cy="406" rx="34" ry="17" fill="#1a1a1a"/>

        {/* Arms */}
        <g className="pd-arm-l">
          <ellipse cx="65" cy="285" rx="36" ry="24" fill="url(#pd-b)" transform="rotate(-25 65 285)"/>
          <ellipse cx="49" cy="302" rx="20" ry="14" fill="#1a1a1a" transform="rotate(-25 49 302)"/>
        </g>
        <g className="pd-arm-r">
          <ellipse cx="247" cy="285" rx="36" ry="24" fill="url(#pd-b)" transform="rotate(25 247 285)"/>
          <ellipse cx="263" cy="302" rx="20" ry="14" fill="#1a1a1a" transform="rotate(25 263 302)"/>
        </g>

        {/* Neck */}
        <ellipse cx="155" cy="208" rx="52" ry="36" fill="url(#pd-w)"/>

        {/* Black ears */}
        <circle cx="98"  cy="112" r="36" fill="url(#pd-b)"/>
        <circle cx="214" cy="112" r="36" fill="url(#pd-b)"/>

        {/* Head */}
        <circle cx="155" cy="162" r="88" fill="url(#pd-w)"/>

        {/* Eye patches */}
        <ellipse cx="120" cy="155" rx="28" ry="24" fill="url(#pd-b)" transform="rotate(-10 120 155)"/>
        <ellipse cx="192" cy="155" rx="28" ry="24" fill="url(#pd-b)" transform="rotate(10 192 155)"/>

        {/* Sunglasses */}
        <rect x="88"  y="143" width="50" height="30" rx="11" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
        <rect x="162" y="143" width="50" height="30" rx="11" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
        <rect x="138" y="154" width="26" height="4"  rx="2"  fill="#475569"/>
        <rect x="76"  y="155" width="14" height="4"  rx="2"  fill="#475569"/>
        <rect x="212" y="155" width="14" height="4"  rx="2"  fill="#475569"/>
        <rect x="90"  y="145" width="46" height="26" rx="9"  fill="#1e3a5f" opacity="0.8"/>
        <rect x="164" y="145" width="46" height="26" rx="9"  fill="#1e3a5f" opacity="0.8"/>
        <ellipse cx="105" cy="152" rx="8" ry="5" fill="white" opacity="0.18"/>
        <ellipse cx="179" cy="152" rx="8" ry="5" fill="white" opacity="0.18"/>

        {/* Nose */}
        <ellipse cx="155" cy="195" rx="13" ry="8" fill="#1a1a1a"/>
        <ellipse cx="151" cy="192" rx="4"  ry="3" fill="white" opacity="0.28"/>

        {/* Mouth */}
        <path d="M146 207 Q155 217 164 207" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Cheeks */}
        <ellipse cx="104" cy="186" rx="16" ry="9" fill="#FFB3B3" opacity="0.3"/>
        <ellipse cx="208" cy="186" rx="16" ry="9" fill="#FFB3B3" opacity="0.3"/>
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
