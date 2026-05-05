/**
 * Capybara.jsx — Canvas chroma-key character.
 * Uses a double-wrapper for bulletproof flipping and slide animations.
 */
import { useEffect } from 'react';
import { useChromaKey, CANVAS_W, CANVAS_H } from './useChromaKey';

const VIDEO_ENTRY = './characters/capybara_entry_sbs.webm?v=8';
const VIDEO_IDLE  = './characters/capybara_idle_sbs.webm?v=8';

export function Capybara({ phase, onSlideEnd }) {
  const { videoRef, canvasRef, startProcessing, stopProcessing } = useChromaKey();

  useEffect(() => {
    stopProcessing();
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => startProcessing();
    video.addEventListener('play', onPlay);
    video.play().catch(err => console.error('Capybara play error:', err));

    return () => {
      video.removeEventListener('play', onPlay);
      stopProcessing();
    };
  }, [phase, startProcessing, stopProcessing]);

  return (
    <div style={phase === 'slide' ? s.slideWrap : s.idleWrap}>
      {/* INNER WRAPPER for horizontal flipping — avoids animation conflicts */}
      <div style={s.flipWrap}>
        <video
          key={phase}
          ref={videoRef}
          src={phase === 'slide' ? VIDEO_ENTRY : VIDEO_IDLE}
          loop={phase !== 'slide'}
          muted
          playsInline
          onEnded={phase === 'slide' ? onSlideEnd : undefined}
          onError={e => console.error('Capybara video error:', e.target.error)}
          style={{ display: 'none' }}
        />
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={s.canvas} />
      </div>
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
    zIndex: 100,
  },
  idleWrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 100,
  },
  flipWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    transform: 'scaleX(-1)', // BULLETPROOF FLIP
  },
  canvas: {
    height: '15vh', // 15% scale as requested
    width: 'auto',
    display: 'block',
    pointerEvents: 'none',
  },
};
