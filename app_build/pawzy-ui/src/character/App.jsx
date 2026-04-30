/**
 * src/character/App.jsx — Root for the character widget window.
 *
 * Normal state: small 180×180px pixel cat in the bottom-right corner.
 * Break state:  grows to large window, plays neko1.webm (slide-in) then
 *               neko2.webm (sleeping loop) — the Cat Gatekeeper experience.
 *               Cat is fully transparent/non-blocking; user can work freely.
 */

import { useEffect, useState, useRef } from 'react';
import { AppStateProvider, useAppState } from '../hooks/useAppState';
import { RiveCharacter } from './RiveCharacter';

// ─── Cat Gatekeeper video paths (from public/characters/cat_gatekeeper/) ────
const VIDEO_SLIDE  = './characters/cat_gatekeeper/neko1.webm'; // slides in once
const VIDEO_SLEEP  = './characters/cat_gatekeeper/neko2.webm'; // loops while sleeping
// ────────────────────────────────────────────────────────────────────────────

function GatekeeperBreak() {
  const [phase, setPhase] = useState('slide'); // 'slide' | 'sleep'
  const videoRef = useRef(null);

  // When neko1 (slide-in) ends, switch to neko2 (sleeping loop)
  const handleSlideEnd = () => setPhase('sleep');

  // Reset on mount
  useEffect(() => {
    setPhase('slide');
  }, []);

  return (
    <div style={styles.videoRoot}>
      {phase === 'slide' && (
        <video
          key="slide"
          ref={videoRef}
          src={VIDEO_SLIDE}
          autoPlay
          muted
          playsInline
          onEnded={handleSlideEnd}
          style={styles.video}
        />
      )}
      {phase === 'sleep' && (
        <video
          key="sleep"
          src={VIDEO_SLEEP}
          autoPlay
          loop
          muted
          playsInline
          style={styles.video}
        />
      )}
    </div>
  );
}

function CharacterApp() {
  const { state: appState } = useAppState();
  const isBreak = appState === 'break';

  const handleCharacterClick = () => {
    if (window.pawzy) window.pawzy.sendAction('open_settings');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'transparent', overflow: 'hidden' }}>
      {isBreak ? (
        // Gatekeeper cat video — fills the (expanded) window
        <GatekeeperBreak />
      ) : (
        // Normal corner pixel cat
        <div style={styles.cornerContainer}>
          <RiveCharacter character="cat" onCharacterClick={handleCharacterClick} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <CharacterApp />
    </AppStateProvider>
  );
}

const styles = {
  videoRoot: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: 'transparent',
    // Position the cat at the bottom-right of the fullscreen transparent window
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  video: {
    // Let the video play at its natural size from the bottom-right corner
    // The rest of the transparent window is click-through
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    objectPosition: 'bottom right',
    display: 'block',
  },
};
