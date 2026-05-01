/**
 * CharacterRegistry.js
 * Central registry of all available break-time companion characters.
 * Each entry maps a config key → { component, label, emoji, description }.
 */

import { CatGatekeeper } from './CatGatekeeper';
import { ShibaInu }      from './ShibaInu';
import { Capybara }      from './Capybara';
import { Monkey }        from './Monkey';

export const CHARACTERS = {
  cat_gatekeeper: {
    component:   CatGatekeeper,
    label:       'Neko Cat',
    emoji:       '🐱',
    description: 'The original gatekeeper',
  },
  shiba: {
    component:   ShibaInu,
    label:       'Shiba Inu',
    emoji:       '🐕',
    description: 'Fluffy & loyal',
  },
  capybara: {
    component:   Capybara,
    label:       'Capybara',
    emoji:       '🦦',
    description: 'Maximum chill energy',
  },
  monkey: {
    component:   Monkey,
    label:       'Monkey',
    emoji:       '🐒',
    description: 'Playful & curious',
  },
};

export const DEFAULT_CHARACTER = 'cat_gatekeeper';
