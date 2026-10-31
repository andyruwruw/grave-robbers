// Packages
import { isMonsterKind } from '@halloween/shared/monsters/monster-kinds';
import { SPAWN_KINDS } from '@halloween/shared/protocol/tv-tools';
import { gearWear } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';
import { canBuildOn } from '@halloween/shared/structures/placement';

// Local Imports
import { NO_TREE } from '../config/loot';
import { FREE_FLOORS } from './config/conjure';
import { GameSystem } from '../core/game-system';
import { randomLoot } from '../helpers/loot-rolls';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { GearItem } from '@halloween/shared/inventory/bag-items';
import type { SpawnKind, SpawnTile } from '@halloween/shared/protocol/tv-tools';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Player } from '../players/player';

/**
 * The TV's Game tab and the admin's Spawn page conjuring things onto the
 * map, or killing every monster.
 */
export class ConjureSystem extends GameSystem {
  /**
   * Conjures something: a tree, pumpkin, chest, or rock, a random piece of
   * loot, a piece of gear, a monster, or a structure. Without `at` it goes
   * on a random spot by the usual rules (a monster kept a few tiles from
   * every living player); with it (the admin's cursor, tile space), right
   * there past the rules, unless that would put it on top of something.
   * Tiles and structures need bare floor (`FREE_FLOORS`), monsters and
   * gear any tile that isn't solid.
   * @param kind What to conjure.
   * @param at Where, or null for a random spot.
   */
  spawn(kind: SpawnKind, at: { x: number; y: number } | null = null): void {
    if (!SPAWN_KINDS.includes(kind)) {
      return;
    }
    const living = [...this.players.values()].filter((p: Player): boolean => !p.dead && p.connected);
    if (isMonsterKind(kind)) {
      if (at) {
        this.horde.summonAt(kind, this.world, at.x, at.y);
      } else {
        this.horde.summon(kind, this.world, living);
      }
      return;
    }
    if (kind === 'loot' || kind.startsWith('gear:')) {
      const held: GearItem = kind === 'loot' ? randomLoot(NO_TREE) : { kind: kind.slice(5) as GearKind, wear: gearWear(kind.slice(5) as GearKind, NO_TREE) };
      const spot = at ?? this.openSpot(living);
      if (spot && this.world.inView(Math.floor(spot.x), Math.floor(spot.y)) && !this.world.map.isSolid(Math.floor(spot.x), Math.floor(spot.y))) {
        this.world.items.addHeld(spot.x, spot.y, held, null);
      }
      return;
    }
    if (kind.startsWith('build:')) {
      this.build(kind.slice(6) as StructureKind, at);
      return;
    }
    const tile = kind as SpawnTile;
    let grown: { tx: number; ty: number } | null = null;
    if (at) {
      const spot = { tx: Math.floor(at.x), ty: Math.floor(at.y) };
      if (this.freeFloor(spot.tx, spot.ty)) {
        this.world.map.set(spot.tx, spot.ty, tile);
        grown = spot;
      }
    } else {
      const bodies = [...living, ...this.horde.bodies()];
      grown = this.world.growth.spawnTile(tile, (tx: number, ty: number): boolean =>
        bodies.some((o: { x: number; y: number }): boolean => Math.abs(o.x - (tx + 0.5)) < 1.2 && Math.abs(o.y - (ty + 0.5)) < 1.2));
    }
    if (grown && tile !== 'rock') {
      this.outbox.events.push({ t: 'grow', ...grown, tile });
    }
  }

  /**
   * Whether the admin's cursor can put a tile or structure here: bare
   * floor in view (`FREE_FLOORS`), whoever or whatever stands on it.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns True when it can.
   */
  private freeFloor(tx: number, ty: number): boolean {
    return this.world.inView(tx, ty) && FREE_FLOORS.has(this.world.map.get(tx, ty));
  }

  /**
   * Builds a structure at `at` (past the build rules, on bare floor or
   * where it could be built anyway), or on a random tile it can go on by
   * the rules.
   * @param kind The structure.
   * @param at Where, or null for a random spot.
   */
  private build(kind: StructureKind, at: { x: number; y: number } | null): void {
    if (at) {
      const tx = Math.floor(at.x);
      const ty = Math.floor(at.y);
      if (this.freeFloor(tx, ty) || canBuildOn(kind, this.world.map.get(tx, ty))) {
        this._game.building.conjure(kind, tx, ty, true);
      }
      return;
    }
    for (let tries = 0; tries < 400; tries++) {
      const tx = 1 + Math.floor(Math.random() * (this.world.map.width - 2));
      const ty = 1 + Math.floor(Math.random() * (this.world.map.height - 2));
      if (this._game.building.conjure(kind, tx, ty)) {
        return;
      }
    }
  }

  /**
   * The middle of a random open tile in view that no living player stands
   * on, for loot.
   * @param living The living players.
   * @returns The spot, or null after 400 tries.
   */
  private openSpot(living: Player[]): { x: number; y: number } | null {
    for (let tries = 0; tries < 400; tries++) {
      const tx = 1 + Math.floor(Math.random() * (this.world.map.width - 2));
      const ty = 1 + Math.floor(Math.random() * (this.world.map.height - 2));
      if (this.world.inView(tx, ty) && !this.world.map.isSolid(tx, ty) && !living.some((p: Player): boolean => Math.floor(p.x) === tx && Math.floor(p.y) === ty)) {
        return { x: tx + 0.5, y: ty + 0.5 };
      }
    }
    return null;
  }

  /**
   * Kills every monster on the map (the TV's Game tab).
   */
  killMonsters(): void {
    this.horde.killAll();
  }
}
