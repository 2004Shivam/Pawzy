/**
 * useChromaKey — Canvas-based Side-by-Side Luma Masking.
 *
 * How it works:
 *  • Plays a side-by-side video (Left: RGB, Right: Alpha Mask).
 *  • Draws the entire video frame to an offscreen canvas.
 *  • Copies the RGB pixels from the left half to the visible canvas,
 *    and uses the brightness of the right half to set the alpha channel.
 *
 * This is 100% bulletproof. It handles black fur, shadows, and dark scenes
 * perfectly because the transparency is defined by the AI-generated mask
 * on the right half of the video.
 */
import { useRef, useCallback, useEffect } from 'react';

// The final visible canvas dimensions
export const CANVAS_W = 960;
export const CANVAS_H = 540;

// The full side-by-side video dimensions
const SBS_W = 1920;
const SBS_H = 540;

export function useChromaKey() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  // Initialize offscreen canvas once
  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = SBS_W;
    offscreen.height = SBS_H;
    offscreenCanvasRef.current = offscreen;
  }, []);

  const lastTimeRef = useRef(-1);
  const lastFrameDataRef = useRef(null);

  const tick = useCallback(() => {
    if (!runningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const offscreen = offscreenCanvasRef.current;
    
    if (!video || !canvas || !offscreen) { 
      rafRef.current = requestAnimationFrame(tick); 
      return; 
    }

    // BLINK FIX: 
    // If the video is seeking (looping back) or stalled, OR if the time hasn't changed,
    // we skip drawing the NEW frame and just let the canvas keep the PREVIOUS frame.
    // This turns a "black blink" into a "1-frame freeze", which is invisible for idle animations.
    if (video.readyState < 2 || video.seeking || video.currentTime === lastTimeRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    lastTimeRef.current = video.currentTime;

    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Draw the full side-by-side video frame (1920x540)
    offCtx.drawImage(video, 0, 0, SBS_W, SBS_H);

    // Get the pixel data for the entire side-by-side frame
    const sbsData = offCtx.getImageData(0, 0, SBS_W, SBS_H).data;

    // We will build the final image data here
    const outImageData = new ImageData(CANVAS_W, CANVAS_H);
    const outData = outImageData.data;

    // Iterate over the target 960x540 canvas (left half is RGB, right half is alpha mask)
    for (let y = 0; y < CANVAS_H; y++) {
      for (let x = 0; x < CANVAS_W; x++) {
        const outIdx  = (y * CANVAS_W + x) * 4;
        const rgbIdx  = (y * SBS_W + x) * 4;
        const maskIdx = (y * SBS_W + (x + CANVAS_W)) * 4;

        let r = sbsData[rgbIdx];
        let g = sbsData[rgbIdx + 1];
        let b = sbsData[rgbIdx + 2];
        const a = sbsData[maskIdx];

        // Gentle despill: only reduce green on pixels where green dominates both R and B
        if (g > r && g > b) {
          g = (r + b) >> 1; // average of red and blue
        }

        outData[outIdx]     = r;
        outData[outIdx + 1] = g;
        outData[outIdx + 2] = b;
        outData[outIdx + 3] = a;
      }
    }

    ctx.putImageData(outImageData, 0, 0);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startProcessing = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopProcessing = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => () => stopProcessing(), [stopProcessing]);

  return { videoRef, canvasRef, startProcessing, stopProcessing };
}
