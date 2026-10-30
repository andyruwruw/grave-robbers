// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';

/**
 * How near (tiles) a monster must be for the test player to go after it.
 */
export const FIGHT_RANGE = 5;

/**
 * How near (tiles) a monster must be for the test player to swing at it.
 */
export const STRIKE_RANGE = 1.1;

/**
 * Seconds a walk may take before the test player picks something else.
 */
export const WALK_TIME = 25;

/**
 * Seconds the test player keeps swinging at one tile.
 */
export const SWING_TIME = 10;

/**
 * Seconds without moving before a walk counts as stuck.
 */
export const STUCK_TIME = 1.5;

/**
 * Seconds between fresh paths while chasing a monster.
 */
export const CHASE_REPATH = 0.5;

/**
 * Seconds the test player ignores monsters after failing to reach one.
 */
export const CHASE_GIVE_UP = 3;

/**
 * Seconds between builds.
 */
export const BUILD_EVERY = 20;

/**
 * How far (tiles, each way) a boxed-in test player wanders.
 */
export const WANDER_RANGE = 8;

/**
 * How many random spots the test player tries before giving up on a pick.
 */
export const PICK_TRIES = 6;

/**
 * What the test player may build.
 */
export const BUILDS: StructureKind[] = ['torch', 'wood-wall', 'wood-fence', 'campfire', 'scarecrow', 'lantern', 'spikes', 'research-table', 'sawmill', 'furnace', 'palisade', 'stone-wall', 'altar', 'sifter', 'bone-wall', 'coffin', 'bell', 'bloodforge', 'sentry', 'cauldron', 'anvil', 'oven'];

/**
 * Seconds between upgrades while at a research table.
 */
export const UPGRADE_EVERY = 3;

/**
 * The four straight steps.
 */
export const SIDES: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
