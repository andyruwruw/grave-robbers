// Types
import type { VampireMood } from '../types/moods';

/**
 * A vampire's pale skin.
 */
export const VAMPIRE_SKIN = '#d9d4e2';

/**
 * A vampire's dark suit.
 */
export const VAMPIRE_SUIT = '#1c1622';

/**
 * The outside of a vampire's cape.
 */
export const VAMPIRE_CAPE = '#120d16';

/**
 * The red lining of a vampire's cape and collar.
 */
export const VAMPIRE_LINING = '#8a1022';

/**
 * A vampire's slicked hair.
 */
export const VAMPIRE_HAIR = '#0b0b10';

/**
 * A vampire's glowing eyes.
 */
export const VAMPIRE_EYE = '#ff2030';

/**
 * A vampire's fangs and claws.
 */
export const VAMPIRE_FANG = '#f4f0f6';

/**
 * The medallion at a vampire's throat.
 */
export const VAMPIRE_MEDALLION = '#c9a84a';

/**
 * How likely each idle mood is. A hunting vampire stalks, claws ready.
 */
export const VAMPIRE_MOODS: [VampireMood, number][] = [['still', 0.35], ['cloak', 0.25], ['scan', 0.25], ['loom', 0.15]];

/**
 * How high an idle vampire hovers above the ground.
 */
export const VAMPIRE_HOVER = 0.04;

/**
 * How far an idle vampire bobs.
 */
export const VAMPIRE_BOB = 0.02;
