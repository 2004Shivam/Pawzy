import { useEffect, useState } from 'react';

/**
 * src/character/ImageCharacter.jsx
 *
 * Renders an image-based character that updates based on the application state.
 * Expected file structure for images:
 * public/characters/{characterName}/{state}.png
 *
 * Supports GIFs, APNGs, and static PNGs natively.
 */

const STATE_EMOJIS = {
  idle: '😺',
  warning: '🙀',
  lock: '😾',
  break: '😸',
  happy: '🎉',
};

const STATE_GLOW = {
  idle: 'rgba(167,139,250,0.3)',
  warning: 'rgba(251,191,36,0.5)',
  lock: 'rgba(239,68,68,0.5)',
  break: 'rgba(96,165,250,0.4)',
  happy: 'rgba(52,211,153,0.5)',
};

export function ImageCharacter({ character = 'cat', state = 'idle', isIdle = false, onClick }) {
  const [bounce, setBounce] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fallback map in case the user hasn't provided an image for a specific state
  // We'll try state.png, and if it fails, maybe fall back to idle.png
  const imageSrc = `./characters/${character}/${state}.png`;

  // Bounce animation on state change
  useEffect(() => {
    setBounce(true);
    setImgError(false); // reset error on state change
    const t = setTimeout(() => setBounce(false), 600);
    return () => clearTimeout(t);
  }, [state, character]);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
    if (onClick) onClick();
  };

  const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    animation: bounce
      ? 'charBounce 0.5s ease'
      : isIdle
      ? 'charIdle 3s ease-in-out infinite'
      : 'charFloat 4s ease-in-out infinite',
    filter: `drop-shadow(0 8px 24px ${STATE_GLOW[state] || STATE_GLOW.idle})`,
    transform: clicked ? 'scale(0.88)' : 'scale(1)',
    transition: 'transform 0.15s ease, filter 0.4s ease',
  };

  const imageStyle = {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain',
  };

  return (
    <>
      <style>{`
        @keyframes charFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes charIdle {
          0%, 90%, 100% { transform: translateY(0px) rotate(0deg); }
          95% { transform: translateY(-2px) rotate(-3deg); }
        }
        @keyframes charBounce {
          0%   { transform: scale(1) translateY(0); }
          30%  { transform: scale(1.18) translateY(-10px); }
          60%  { transform: scale(0.93) translateY(0); }
          80%  { transform: scale(1.06) translateY(-4px); }
          100% { transform: scale(1) translateY(0); }
        }
      `}</style>

      <div style={containerStyle} onClick={handleClick}>
        {!imgError ? (
          <img
            src={imageSrc}
            alt={`${character} in ${state} state`}
            style={imageStyle}
            onError={(e) => {
              if (state !== 'idle') {
                e.target.src = `./characters/${character}/idle.png`;
              } else {
                setImgError(true);
              }
            }}
          />
        ) : (
          // Fallback to emoji if no images are found at all
          <div style={{ fontSize: '100px' }}>
            {STATE_EMOJIS[state] || '🐱'}
          </div>
        )}
      </div>
    </>
  );
}
