/**
 * ShibaInu.jsx — Canvas chroma-key character.
 * Video plays hidden; each frame is drawn onto a canvas in JS
 * with the black background stripped out pixel-by-pixel.
 */
import { useEffect } from 'react';
import { useChromaKey, CANVAS_W, CANVAS_H } from './useChromaKey';

const VIDEO_ENTRY = './characters/shiba_sbs.webm?v=2';
const VIDEO_IDLE  = './characters/shiba_sbs.webm?v=2';

export function ShibaInu({ phase, onSlideEnd }) {
  const { videoRef, canvasRef, startProcessing, stopProcessing } = useChromaKey();

  useEffect(() => {
    stopProcessing();
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => startProcessing();
    video.addEventListener('play', onPlay);
    video.play().catch(err => console.error('ShibaInu play error:', err));

    return () => {
      video.removeEventListener('play', onPlay);
      stopProcessing();
    };
  }, [phase, startProcessing, stopProcessing]);

  return (
    <div style={phase === 'slide' ? s.slideWrap : s.idleWrap}>
      {/* Hidden source video — decoded by browser, never shown */}
      <video
        key={phase}
        ref={videoRef}
        src={phase === 'slide' ? VIDEO_ENTRY : VIDEO_IDLE}
        loop={phase !== 'slide'}
        muted
        playsInline
        onEnded={phase === 'slide' ? onSlideEnd : undefined}
        onError={e => console.error('ShibaInu video error:', e.target.error)}
        style={{ display: 'none' }}
      />
      {/* Visible canvas — shows chroma-keyed frames */}
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={s.canvas} />
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
  canvas: {
    height: '100vh',
    width: 'auto',
    display: 'block',
    pointerEvents: 'none',
  },
};
