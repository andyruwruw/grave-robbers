// Packages
import { isMonsterKind } from '@halloween/shared/monsters/monster-kinds';
import { GIVE_GEAR_MAX, GIVE_KINDS, GIVE_MAX, SPAWN_KINDS } from '@halloween/shared/protocol/tv-tools';
import { gearWear } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';
import { canBuildOn } from '@halloween/shared/structures/placement';

// Local Imports
import { freshItem } from '../building/helpers/fresh-item';
import { NO_TREE } from '../config/loot';
import { FREE_FLOORS } from './config/conjure';
import { GameSystem } from '../core/game-system';
import { randomLoot } from '../helpers/loot-rolls';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Material, Resource } from '@halloween/shared/goods/goods';
import type { BagItem, GearItem } from '@halloween/shared/inventory/bag-items';
import type { CraftKey } from '@halloween/shared/inventory/item-keys';
import type { GiveKind, SpawnKind, SpawnTile } from '@halloween/shared/protocol/tv-tools';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Player } from '../players/player';

/**
 * The TV's Game tab and the admin's Spawn page conjuring things onto the
 * map, or killing every monster, and the admin's Give page handing
 * players things.
 */
export class ConjureSystem extends GameSystem {
  /**
   * Gives a player (by public id) up to GIVE_MAX of something (GIVE_GEAR_MAX
   * of gear): candy and
   * blood always fit, everything else goes into the bag (gear made with
   * their tree, as if crafted), and what doesn't fit drops at their feet.
   * @param id The player's public id.
   * @param kind What to give.
   * @param count How many.
   */
  give(id: string, kind: GiveKind, count: number): void {
    const p = [...this.players.values()].find((other: Player): boolean => other.id === id);
    if (!p || !GIVE_KINDS.includes(kind) || !Number.isInteger(count) || count < 1) {
      return;
    }
    const n = Math.min(count, kind.startsWith('gear:') ? GIVE_GEAR_MAX : GIVE_MAX);
    const items: BagItem[] = kind.startsWith('res:')
      ? []
      : kind.startsWith('mat:')
        ? [{ material: kind.slice(4) as Material, count: n }]
        : kind.startsWith('build:')
          ? [{ build: kind.slice(6) as StructureKind, count: n }]
          : Array.from({ length: n }, (): BagItem => freshItem(kind as CraftKey, p.tree));
    if (kind.startsWith('res:')) {
      this._game.bag.take(p, kind.slice(4) as Resource, n);
    }
    for (const item of items) {
      const left = this._game.bag.store(p, item, false);
      if (left) {
        this._game.drops.dropAt(p.x, p.y, left);
      }
    }
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, 'pickup');
  }

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
