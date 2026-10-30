// Packages
import { BoxGeometry } from 'three';
import { BOLT_SPEED } from '@halloween/shared/gear/ranged-rules';
import { GHOST_SHOT_SPEED } from '@halloween/shared/monsters/kinds/ghost';
import { ARROW_SPEED } from '@halloween/shared/monsters/kinds/skeleton';
import { POTION_SPEED } from '@halloween/shared/monsters/kinds/witch';

// Types
import type { ShotState } from '@halloween/shared/protocol/state/world-state';

/**
 * How many shots in flight can be drawn at once.
 */
export const SHOT_POOL = 24;

/**
 * A shot's height above the ground.
 */
export const SHOT_HEIGHT = 0.55;

/**
 * A crossbow bolt is a pale streak.
 */
export const SHOT_COLOR = '#f2e6c4';

/**
 * A crossbow bolt's box.
 */
export const SHOT_BOX = new BoxGeometry(0.45, 0.035, 0.035);

/**
 * A gob of blood is a glowing crimson blob.
 */
export const GOB_COLOR = '#e0182c';

/**
 * A gob of blood's box.
 */
export const GOB_BOX = new BoxGeometry(0.14, 0.12, 0.12);

/**
 * The darker smear a gob of blood trails.
 */
export const SMEAR_COLOR = '#8a0c18';

/**
 * The smear's box.
 */
export const SMEAR_BOX = new BoxGeometry(0.34, 0.06, 0.06);

/**
 * A ghost's ball of ectoplasm: a pale glowing core in a see-through halo,
 * pulsing as it drifts.
 */
export const ECTO_CORE = '#d8f4ff';

/**
 * The ectoplasm's see-through halo.
 */
export const ECTO_HALO = '#8fc8f0';

/**
 * The ectoplasm core's box.
 */
export const ECTO_CORE_BOX = new BoxGeometry(0.13, 0.13, 0.13);

/**
 * The ectoplasm halo's box.
 */
export const ECTO_HALO_BOX = new BoxGeometry(0.24, 0.24, 0.24);

/**
 * A skeleton's arrow: a dark shaft.
 */
export const ARROW_SHAFT = '#5a4028';

/**
 * The arrow's pale fletching.
 */
export const ARROW_FLETCH = '#e6e0cc';

/**
 * The arrow shaft's box.
 */
export const ARROW_BOX = new BoxGeometry(0.42, 0.025, 0.025);

/**
 * The fletching's box.
 */
export const FLETCH_BOX = new BoxGeometry(0.08, 0.05, 0.05);

/**
 * A witch's potion: a glowing flask, lobbed high and tumbling.
 */
export const POTION_GLOW = '#b04aff';

/**
 * The potion's glass neck.
 */
export const POTION_GLASS = '#e8ccff';

/**
 * The potion flask's box.
 */
export const POTION_BOX = new BoxGeometry(0.13, 0.13, 0.13);

/**
 * The potion neck's box.
 */
export const POTION_NECK_BOX = new BoxGeometry(0.05, 0.07, 0.05);

/**
 * How high a lobbed potion's arc rises.
 */
export const POTION_ARC = 1.4;

/**
 * How fast each kind of shot flies, to carry it forward between ticks.
 */
export const SHOT_SPEEDS: Record<ShotState['kind'], number> = { bolt: BOLT_SPEED, blood: BOLT_SPEED, ecto: GHOST_SHOT_SPEED, arrow: ARROW_SPEED, potion: POTION_SPEED };
