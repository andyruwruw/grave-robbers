// Packages
import { isBuildItem } from '@halloween/shared/inventory/bag-items';
import { PLAYER_RADIUS } from '@halloween/shared/players/movement';
import { levelOf } from '@halloween/shared/skill-tree/progress';
import { RAISED, TURNED, canBuildOn } from '@halloween/shared/structures/placement';
import { buildTarget } from '@halloween/shared/world/targeting';
import { isSolidTile } from '@halloween/shared/world/tiles';

// Local Imports
import { GameSystem } from '../core/game-system';
import { overlapsTile } from './helpers/overlaps-tile';

// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Player } from '../players/player';

/**
 * Placing structures from the bag: the pick, the aim, the preview, and
 * what stands in the way.
 */
export class BuildSystem extends GameSystem {
  /**
   * Whether a player has structures picked to build (the phone's build
   * mode), so a controller's buttons place and turn instead of fighting.
   * @param token The player's token.
   * @returns True while they have a build pick.
   */
  isBuilding(token: string): boolean {
    return this.players.get(token)?.buildSlot != null;
  }

  /**
   * Aims the next structure at a tile-space point (the mouse on /play),
   * or back at the facing tile (null). See `buildTarget`.
   * @param token The player's token.
   * @param at The point (tiles), or null for the facing tile.
   */
  aimBuild(token: string, at: { x: number; y: number } | null): void {
    const p = this.players.get(token);
    if (p) {
      p.buildAim = at;
    }
  }

  /**
   * Picks (or clears) the bag slot of structures to preview on the facing
   * tile.
   * @param token The player's token.
   * @param slot The bag slot, or null to put the pick away.
   */
  selectBuild(token: string, slot: number | null): void {
    const p = this.players.get(token);
    const item = p && slot !== null && Number.isInteger(slot) ? p.bag.bag[slot] : null;
    if (p && (slot === null || (item && isBuildItem(item)))) {
      p.buildSlot = slot;
      this.syncBuilding(p);
    }
  }

  /**
   * Builds one of the picked structures on the facing tile (pushed on past
   * the builder if they'd be standing on it, see `placeTile`), taking it
   * from the bag. The pick stays while the stack lasts, so walls can be
   * laid in a row.
   * @param token The player's token.
   * @returns Why it couldn't, or null on success.
   */
  placeBuild(token: string): string | null {
    const p = this.players.get(token);
    if (!p || p.dead) {
      return null;
    }
    const stack = p.buildSlot !== null ? p.bag.bag[p.buildSlot] : null;
    if (p.buildSlot === null || !stack || !isBuildItem(stack)) {
      return 'Pick something from your bag.';
    }
    const { tx, ty } = buildTarget(p.x, p.y, p.facing, PLAYER_RADIUS, p.buildAim);
    const blocked = this.buildBlocked(stack.build, tx, ty);
    if (blocked) {
      return blocked;
    }
    stack.count--;
    if (stack.count === 0) {
      p.bag.bag[p.buildSlot] = null;
    }
    this.syncBuilding(p);
    this.outbox.inventoryChanged.add(p.token);
    this.world.structures.place(tx, ty, stack.build, levelOf(`build:${stack.build}`, p.tree), stack.build === 'stash' ? p.name.toLowerCase() : p.id);
    if (TURNED.has(stack.build)) {
      const quarter = ((Math.round((p.buildFacing ?? p.facing) / (Math.PI / 2)) % 4) + 4) % 4;
      this.world.map.setRamp(tx, ty, [0, 2, 1, 3][quarter]!);
    }
    p.protectedUntil = 0;
    p.swings++;
    this._game.actions.draw(p, 'hammer');
    this.outbox.sound(p, 'build');
    return null;
  }

  /**
   * Why a structure can't go on a tile, or null if it can: only on open
   * floor, and anything walked into or onto needs the tile clear of
   * people, monsters, and items.
   * @param kind The structure.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns Why not, or null if it can.
   */
  private buildBlocked(kind: StructureKind, tx: number, ty: number): string | null {
    if (!canBuildOn(kind, this.world.map.get(tx, ty))) {
      return kind === 'digger' ? 'A bone digger goes on a grave.' : kind === 'seeds' ? 'Plant seeds on grass.' : 'Can\'t build there.';
    }
    const solid = isSolidTile(kind) || RAISED.has(kind);
    if (solid && ([...this.players.values()].some((o: Player): boolean => !o.dead && overlapsTile(o.x, o.y, tx, ty)) || this.horde.occupies(tx, ty))) {
      return 'Someone is in the way.';
    }
    if (solid && this.world.items.hasItemOn(tx, ty)) {
      return 'Pick up the pile first.';
    }
    return null;
  }

  /**
   * Keeps the previewed structure in step with the picked bag slot, which
   * may have been emptied, dropped, or swapped.
   * @param p The player.
   */
  syncBuilding(p: Player): void {
    const item = p.buildSlot !== null ? p.bag.bag[p.buildSlot] : null;
    if (!item || !isBuildItem(item)) {
      p.buildSlot = null;
      p.buildAim = null;
      p.buildFacing = null;
    }
    p.building = item && isBuildItem(item) ? item.build : null;
  }
}
