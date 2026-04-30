/**
 * src/character/CursorTracker.jsx
 *
 * Tracks cursor position relative to the character window and
 * provides normalized vectors for Rive eye-tracking inputs.
 *
 * Also detects:
 *  - Cursor speed (fast → flinch)
 *  - Cursor idle time (long idle → sleep)
 *  - Cursor proximity (hover → acknowledge)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const IDLE_THRESHOLD_MS = 8000;    // 8s without movement → sleep
const FAST_SPEED_THRESHOLD = 600;  // px/s → flinch

export function useCursorTracker(charRef) {
  const [cursorState, setCursorState] = useState({
    eyeX: 0,       // -1 to 1 (left to right)
    eyeY: 0,       // -1 to 1 (up to down)
    isFast: false,
    isIdle: false,
    isHovering: false,
  });

  const lastPos = useRef({ x: 0, y: 0, t: Date.now() });
  const idleTimer = useRef(null);
  const flinchTimer = useRef(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setCursorState(prev => ({ ...prev, isIdle: false }));
    idleTimer.current = setTimeout(() => {
      setCursorState(prev => ({ ...prev, isIdle: true }));
    }, IDLE_THRESHOLD_MS);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now();
      const dt = (now - lastPos.current.t) / 1000; // seconds
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const speed = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0;

      lastPos.current = { x: e.clientX, y: e.clientY, t: now };
      resetIdleTimer();

      // Eye tracking — relative to window center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const eyeX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2)));
      const eyeY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2)));

      // Fast movement flinch
      const isFast = speed > FAST_SPEED_THRESHOLD;
      if (isFast) {
        if (flinchTimer.current) clearTimeout(flinchTimer.current);
        flinchTimer.current = setTimeout(() => {
          setCursorState(prev => ({ ...prev, isFast: false }));
        }, 300);
      }

      // Hover detection — is cursor within character bounds?
      let isHovering = false;
      if (charRef.current) {
        const rect = charRef.current.getBoundingClientRect();
        isHovering =
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top  && e.clientY <= rect.bottom;
      }

      setCursorState(prev => ({
        ...prev,
        eyeX,
        eyeY,
        isFast,
        isHovering,
      }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (flinchTimer.current) clearTimeout(flinchTimer.current);
    };
  }, [charRef, resetIdleTimer]);

  return cursorState;
}
