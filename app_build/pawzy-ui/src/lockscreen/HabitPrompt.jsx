/**
 * src/lockscreen/HabitPrompt.jsx
 * Rotates through break habit prompts every 8 seconds.
 */

import { useState, useEffect } from 'react';

const PROMPTS = [
  "Drink some water 💧",
  "Stretch your neck and shoulders 🧘",
  "Look 20 feet away for 20 seconds 👀",
  "Take 5 deep breaths 🌬️",
  "Roll your wrists and ankles 🔄",
  "Stand up and walk around 🚶",
  "Blink rapidly 10 times 👁️",
  "Massage your temples gently ✋",
  "Shake out your hands 🤲",
  "Smile — you earned this break! 😊",
];

export function HabitPrompt() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % PROMPTS.length);
        setVisible(true);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      style={{
        fontSize: '1.2rem',
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        transition: 'opacity 0.5s ease',
        opacity: visible ? 1 : 0,
        fontStyle: 'italic',
        maxWidth: '460px',
        lineHeight: 1.6,
      }}
    >
      {PROMPTS[index]}
    </p>
  );
}
