// Local Imports
import { GHOST_SLOW } from '../../../monsters/kinds/ghost';

// Types
import type { Essence } from '../../types/infusion';
import type { EssencePackage } from '../types/essence-package';

/**
 * What each essence brings at levels 1 and 2 (see `docs/infusions.md`):
 * every variant is its essence's package at its level plus its own twist.
 * Silver has no package (it only makes the Mirror Shield).
 */
export const ESSENCE_PACKAGES: Partial<Record<Essence, [EssencePackage, EssencePackage]>> = {
  holy: [
    { blessing: 1.75 },
    { blessing: 2.5 },
  ],
  tendons: [
    { damage: 1.12, knockback: 1.5, stun: 0.12 },
    { damage: 1.25, knockback: 2, stun: 0.22 },
  ],
  fang: [
    { haste: 1.2 },
    { haste: 1.4 },
  ],
  ecto: [
    { bane: { skeleton: 1.6 }, ghostMult: 4, ghostKnock: 1 },
    { bane: { skeleton: 2.2 }, ghostMult: 6, ghostKnock: 0.5 },
  ],
  hex: [
    { curse: { perCycleSecond: 0.35, seconds: 3, rate: 1, taken: 1.15, slow: GHOST_SLOW } },
    { curse: { perCycleSecond: 0.6, seconds: 4, rate: 1.5, taken: 1.2, slow: GHOST_SLOW } },
  ],
  brimstone: [
    { burn: { rate: 1.2, seconds: 3 }, bane: { zombie: 1.15, brute: 1.15, ghoul: 1.15 } },
    { burn: { rate: 2, seconds: 4 }, bane: { zombie: 1.35, brute: 1.35, ghoul: 1.35 } },
  ],
};
