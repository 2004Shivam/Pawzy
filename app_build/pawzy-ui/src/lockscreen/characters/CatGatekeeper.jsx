/**
 * CatGatekeeper.jsx — wraps the original neko video assets.
 * Phase 'slide': neko1.webm (walk-in, plays once then calls onSlideEnd)
 * Phase 'sleep': neko2.webm (idle loop)
 */
import { useEffect, useRef } from 'react';

const VIDEO_SLIDE = './characters/cat_gatekeeper/neko1.webm';
const VIDEO_SLEEP = './characters/cat_gatekeeper/neko2.webm';

export function CatGatekeeper({ phase, onSlideEnd }) {
  return (
    <div style={phase === 'slide' ? s.slideWrap : s.idleWrap}>
      <video
        key={phase}
        src={phase === 'slide' ? VIDEO_SLIDE : VIDEO_SLEEP}
        autoPlay
        loop={phase === 'sleep'}
        muted
        playsInline
        onEnded={phase === 'slide' ? onSlideEnd : undefined}
        style={s.video}
      />
    </div>
  );
}

const s = {
  slideWrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
    animation: 'char-slide-in 4s cubic-bezier(.22,1,.36,1) forwards',
  },
  idleWrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  video: {
    height: '100vh',
    width: 'auto',
    display: 'block',
    mixBlendMode: 'screen',
  },
};
