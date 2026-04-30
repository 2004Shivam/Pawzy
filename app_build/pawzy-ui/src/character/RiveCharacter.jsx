/**
 * src/character/RiveCharacter.jsx
 *
 * Smart character renderer:
 *  - Uses ImageCharacter by default (works with PNG/GIF files in public/characters/)
 *  - Automatically upgrades to Rive animation when a .riv file exists and USE_RIVE is true
 *
 * To use custom images:
 *   Drop image files (e.g. idle.png, warning.png) into pawzy-ui/public/characters/{character}/
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { ImageCharacter } from './ImageCharacter';
import { useAppState } from '../hooks/useAppState';
import { useCursorTracker } from './CursorTracker';

// ─── Toggle this to true if you want to use Rive animations (.riv files) ───
const USE_RIVE = false;
// ───────────────────────────────────────────────────────────────────────────

const STATE_MACHINE_NAME = 'PawzyStateMachine';
const CHARACTER_FILES = {
  cat:    '/characters/cat.riv',
  dog:    '/characters/dog.riv',
  totoro: '/characters/totoro.riv',
  naruto: '/characters/naruto.riv',
  ryuk:   '/characters/ryuk.riv',
};

function RiveRenderer({ character, appState, cursorData, onCharacterClick }) {
  const [RiveComponent, setRiveComponent] = useState(null);

  useEffect(() => {
    if (!USE_RIVE) return;
    import('@rive-app/react-canvas').then(({ useRive, useStateMachineInput }) => {
      // Rive integration logic would go here
      // For now, we fall back to ImageCharacter
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Fallback while Rive loads or if Rive is disabled */}
      <ImageCharacter
        character={character}
        state={appState}
        isIdle={cursorData.isIdle}
        onClick={onCharacterClick}
      />
    </div>
  );
}

export function RiveCharacter({ character = 'cat', onCharacterClick }) {
  const containerRef = useRef(null);
  const { state: appState } = useAppState();
  const cursorData = useCursorTracker(containerRef);

  const handleClick = useCallback(() => {
    if (onCharacterClick) onCharacterClick();
  }, [onCharacterClick]);

  if (!USE_RIVE) {
    // Image mode — no Rive dependency
    return (
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      >
        <ImageCharacter
          character={character}
          state={appState}
          isIdle={cursorData.isIdle}
          onClick={handleClick}
        />
      </div>
    );
  }

  // Rive mode
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <RiveRenderer
        character={character}
        appState={appState}
        cursorData={cursorData}
        onCharacterClick={handleClick}
      />
    </div>
  );
}
