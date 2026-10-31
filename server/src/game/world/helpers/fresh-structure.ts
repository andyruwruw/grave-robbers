// Packages
import { lightBurn, structureHp } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';
import { STASH_SLOTS, STATIONS } from '@halloween/shared/structures/stations';
import { STRUCTURES } from '@halloween/shared/structures/structure-catalog';
import { TURRETS } from '@halloween/shared/structures/turrets';

// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Tile } from '@halloween/shared/world/tiles';
import type { StructureState } from '../types/structures';

/**
 * A just-built structure's state: full health, a light's fuel, and the
 * fields its kind needs (a station's queue, a digger's hoard, a turret's
 * ammo, a stash's slots). Also the defaults a loaded structure falls back
 * on for anything its save lacks.
 * @param kind What it is.
 * @param level Its builder's skill level for it.
 * @param floor The tile it covers.
 * @param owner Its builder's id (a coffin's or digger's owner) or name (a stash's keeper).
 * @returns Its state.
 */
export function freshStructure(kind: StructureKind, level: number, floor: Tile, owner: string | null = null): StructureState {
  return {
    hp: structureHp(kind, level),
    fuel: STRUCTURES[kind].light && !STATIONS[kind] ? lightBurn(kind) : 0,
    floor,
    level,
    ...(STATIONS[kind] ? { queue: 0, progress: 0, buffer: {} } : {}),
    ...(kind === 'digger' ? { progress: 0, hoard: {}, ...(owner ? { owner } : {}) } : {}),
    ...(TURRETS[kind] ? { ammo: 0, readyAt: 0 } : {}),
    ...(kind === 'seeds' ? { readyAt: 0 } : {}),
    ...(kind === 'coffin' && owner ? { owner } : {}),
    ...(kind === 'sorter' ? { routes: {} } : {}),
    ...(kind === 'stash' ? { stash: Array.from({ length: STASH_SLOTS }, (): null => null), keeper: owner ?? '' } : {}),
  };
}
