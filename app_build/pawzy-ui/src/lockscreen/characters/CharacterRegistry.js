/**
 * CharacterRegistry.js
 * Central registry of all available break-time companion characters.
 * Each entry maps a config key → { component, label, emoji, description }.
 */

import { CatGatekeeper } from './CatGatekeeper';
import { ShibaInu }      from './ShibaInu';
import { ChillPanda }    from './ChillPanda';
import { FoxKit }        from './FoxKit';

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
  panda: {
    component:   ChillPanda,
    label:       'Chill Panda',
    emoji:       '🐼',
    description: 'Unbothered & cool',
  },
  fox: {
    component:   FoxKit,
    label:       'Fox Kit',
    emoji:       '🦊',
    description: 'Swift & stylish',
  },
};

export const DEFAULT_CHARACTER = 'cat_gatekeeper';
