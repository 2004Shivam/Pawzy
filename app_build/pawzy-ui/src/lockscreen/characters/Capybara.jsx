/**
 * Capybara.jsx — Video character implementation
 */
import { useEffect, useRef } from 'react';

const VIDEO_FILE = './characters/CapyBara.webm';

export function Capybara({ phase, onSlideEnd }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75; // Slow down for a calmer feel
    }
  }, []);

  useEffect(() => {
    if (phase === 'slide') {
      const timer = setTimeout(onSlideEnd, 4000); // 4s slide-in
      return () => clearTimeout(timer);
    }
  }, [phase, onSlideEnd]);

  return (
    <div style={phase === 'slide' ? s.slideWrap : s.idleWrap}>
      <video
        ref={videoRef}
        src={VIDEO_FILE}
        autoPlay
        loop
        muted
        playsInline
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
    animation: 'char-slide-in-left 4s cubic-bezier(.22,1,.36,1) forwards',
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
    transform: 'scaleX(-1)', // Flip Capybara so it looks inward
  },
};
