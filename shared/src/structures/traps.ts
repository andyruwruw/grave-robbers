// Types
import type { StructureKind } from './types/structures';

/**
 * Ground traps: walked over, not around. Spikes and iron spikes cut
 * whoever stands in them (iron twice as hard); barbed wire barely cuts but
 * holds monsters to BARBED_SLOW of their speed (players to BARBED_PLAYER_SLOW).
 * A blood fountain is a basin that drains monsters lured into it (never
 * players), pumping out FOUNTAIN_BLOOD blood per damage it drains.
 */
export const TRAPS: ReadonlySet<StructureKind> = new Set<StructureKind>(['spikes', 'iron-spikes', 'barbed-wire', 'blood-fountain']);

/**
 * Damage a second each trap does to whoever stands in it.
 */
export const TRAP_DAMAGE: Partial<Record<StructureKind, number>> = { 'spikes': 1, 'iron-spikes': 2, 'barbed-wire': 0.25, 'blood-fountain': 0.5 };

/**
 * Blood a blood fountain pumps out per damage it drains.
 */
export const FOUNTAIN_BLOOD = 1;

/**
 * Whether a tile is a ground trap.
 *
 * @param tile Any tile.
 * @returns True for the kinds in TRAPS.
 */
export function isTrap(tile: string): tile is StructureKind {
  return TRAPS.has(tile as StructureKind);
}

/**
 * Fraction of their speed monsters in barbed wire move at.
 */
export const BARBED_SLOW = 0.4;

/**
 * Fraction of their speed players in barbed wire move at.
 */
export const BARBED_PLAYER_SLOW = 0.6;

/**
 * Damage a palisade's stakes do to a zombie each time it bites.
 */
export const PALISADE_THORNS = 1;
