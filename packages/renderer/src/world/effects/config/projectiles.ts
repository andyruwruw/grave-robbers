// Packages
import { BoxGeometry } from 'three';
import { VARIANTS } from '@halloween/shared/gear/infusions/config/variants';
import { BOLT_SPEED } from '@halloween/shared/gear/ranged-rules';
import { GHOST_SHOT_SPEED } from '@halloween/shared/monsters/kinds/ghost';
import { ARROW_SPEED } from '@halloween/shared/monsters/kinds/skeleton';
import { POTION_SPEED } from '@halloween/shared/monsters/kinds/witch';

// Types
import type { ShotState } from '@halloween/shared/protocol/state/world-state';
import type { ShotSlot } from '../../../types/effects';

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
export const SHOT_SPEEDS: Record<ShotState['kind'], number> = {
  'bolt': BOLT_SPEED,
  'blood': BOLT_SPEED,
  'ecto': GHOST_SHOT_SPEED,
  'arrow': ARROW_SPEED,
  'potion': POTION_SPEED,
  'glaive': VARIANTS.glaive!.hex![0].twist.throwStab!.speed!,
  'fire-arrow': BOLT_SPEED,
  'spirit-arrow': BOLT_SPEED,
  'ghost-bullet': BOLT_SPEED,
};

/**
 * Which slot mesh draws each kind of shot.
 */
export const SHOT_MESHES: Record<ShotState['kind'], keyof ShotSlot> = {
  'bolt': 'bolt',
  'blood': 'gob',
  'ecto': 'ecto',
  'arrow': 'arrow',
  'potion': 'potion',
  'glaive': 'glaive',
  'fire-arrow': 'fireArrow',
  'spirit-arrow': 'spiritArrow',
  'ghost-bullet': 'ghostBullet',
};

/**
 * A thrown glaive: two crossed steel blades round a glowing hex core,
 * spinning flat.
 */
export const GLAIVE_COLORS = { blade: '#c4c8d4', core: '#b04aff' };

/**
 * A glaive blade's box.
 */
export const GLAIVE_BLADE_BOX = new BoxGeometry(0.46, 0.03, 0.09);

/**
 * The glaive's core's box.
 */
export const GLAIVE_CORE_BOX = new BoxGeometry(0.1, 0.06, 0.1);

/**
 * How fast a thrown glaive spins, in radians a second.
 */
export const GLAIVE_SPIN = 22;

/**
 * A fire arrow: a burning head and a flickering tail of fire behind it.
 */
export const FIRE_ARROW_COLORS = { head: '#ffd27a', tail: '#ff6a1a', ember: '#ff4a1a' };

/**
 * A fire arrow's burning head's box.
 */
export const FIRE_HEAD_BOX = new BoxGeometry(0.1, 0.07, 0.07);

/**
 * A fire arrow's tail's box (one of two, the second smaller).
 */
export const FIRE_TAIL_BOX = new BoxGeometry(0.22, 0.06, 0.06);

/**
 * A spirit arrow: a see-through green shaft with a glowing head.
 */
export const SPIRIT_ARROW_COLORS = { shaft: '#7dffb0', head: '#e0fff0' };

/**
 * A spirit arrow's head's box.
 */
export const SPIRIT_HEAD_BOX = new BoxGeometry(0.08, 0.06, 0.06);

/**
 * A ghost bullet: a small pale core in a green see-through halo, trailing
 * a wisp.
 */
export const GHOST_BULLET_COLORS = { core: '#f0fff6', halo: '#7dffb0' };

/**
 * A ghost bullet's core's box.
 */
export const GHOST_CORE_BOX = new BoxGeometry(0.08, 0.08, 0.08);

/**
 * A ghost bullet's halo's box.
 */
export const GHOST_HALO_BOX = new BoxGeometry(0.16, 0.16, 0.16);

/**
 * A ghost bullet's trailing wisp's box.
 */
export const GHOST_WISP_BOX = new BoxGeometry(0.34, 0.05, 0.05);
