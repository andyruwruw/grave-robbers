// Packages
import { GATHERABLE } from '@halloween/shared/loot/gathering';
import { GRAVE_TILES } from '@halloween/shared/loot/graves';
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { PLAYER_RADIUS } from '@halloween/shared/players/movement';
import { RAISED, TURNED, canBuildOn } from '@halloween/shared/structures/placement';
import { wallStyles } from '@halloween/shared/structures/wall-styles';
import { CARDINAL_DIRS } from '@halloween/shared/world/ramps';
import { isStructure } from '@halloween/shared/structures/structure-catalog';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';
import { buildTarget, facingTile } from '@halloween/shared/world/targeting';
import { isSolidTile } from '@halloween/shared/world/tiles';

// Local Imports
import { ScenePart } from '../scene-part';

// Types
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { MonsterAvatar } from '../../avatars/monsters/monster-avatar';
import type { PlayerAvatar } from '../../avatars/player/player-avatar';
import type { PlacePreview } from '../../types/build';
import type { WorldContext } from '../world-context';

/**
 * Each player's facing-tile marker: the tile Action would work on, or,
 * while they have a structure picked, the build preview (with whatever is
 * in the way outlined).
 */
export class BuildPreview extends ScenePart {
  /**
   * Where this screen's own player aims their build (the mouse on /play),
   * or null before they aim.
   */
  private _localBuildAim: { id: string; at: { x: number; y: number } | null } | null = null;

  /**
   * Starts with no local aim.
   * @param ctx What every part of the scene shares.
   * @param _avatars Every player's avatar.
   * @param _monsters Every monster's avatar.
   */
  constructor(ctx: WorldContext, private _avatars: ReadonlyMap<string, PlayerAvatar>, private _monsters: ReadonlyMap<number, MonsterAvatar>) {
    super(ctx);
  }

  /**
   * Where this screen's own player aims their build (the mouse on /play),
   * shown at once instead of waiting for the server to echo it.
   * @param id The player's id.
   * @param at The tile-space point aimed at, or null for the facing tile.
   */
  setAim(id: string, at: { x: number; y: number } | null): void {
    this._localBuildAim = { id, at };
  }

  /**
   * Marks the facing tile when Action would do something there, or shows
   * the build preview while the player has a structure picked.
   * @param avatar The player's avatar.
   */
  show(avatar: PlayerAvatar): void {
    const p = avatar.target;
    if (!this.map) {
      avatar.showMarker(null);
      return;
    }
    const tile = facingTile(p.x, p.y, p.facing);
    const here = this.map.get(tile.tx, tile.ty);
    if (p.building) {
      const aim = this._localBuildAim?.id === p.id ? this._localBuildAim.at : p.buildAim;
      const at = buildTarget(p.x, p.y, p.facing, PLAYER_RADIUS, aim);
      const facing = p.buildFacing ?? p.facing;
      const place = this.placePreview(p.building, at.tx, at.ty);
      if (wallStyles(p.building).length > 0) {
        place.wall = { style: p.buildStyle ?? 0, beside: CARDINAL_DIRS.map(([dx, dy]: [number, number]) => this.map!.get(at.tx + dx, at.ty + dy)) };
      }
      avatar.showMarker(at, place, this.map.level(at.tx, at.ty) * LEVEL_HEIGHT, TURNED.has(p.building) ? Math.round(facing / (Math.PI / 2)) * (Math.PI / 2) : null);
      return;
    }
    avatar.showMarker(GATHERABLE[here] || GRAVE_TILES.has(here) || isStructure(here) || here === 'pumpkin' || here === 'chest' ? tile : null, null, this._ctx.elevation(tile.tx + 0.5, tile.ty + 0.5));
  }

  /**
   * Display-side copy of the server's build rules: only on the floor it
   * takes (`canBuildOn`), and anything walked into or onto needs the tile
   * clear of people, monsters (not ghosts), and items. Says what's in the
   * way, for outlining it.
   * @param kind The structure being placed.
   * @param tx Tile x.
   * @param ty Tile y.
   * @returns The preview.
   */
  private placePreview(kind: StructureKind, tx: number, ty: number): PlacePreview {
    const map = this.map!;
    const base = map.level(tx, ty) * LEVEL_HEIGHT;
    if (!canBuildOn(kind, map.get(tx, ty))) {
      const tall = isSolidTile(map.get(tx, ty));
      return { kind, valid: false, blocker: tall ? { x: tx + 0.5, y: ty + 0.5, base, w: 1, h: 1.2 } : null };
    }
    if (!isSolidTile(kind) && !RAISED.has(kind)) {
      return { kind, valid: true, blocker: null };
    }
    /**
     * Whether a round body overlaps the target tile.
     * @param x Tile-space x.
     * @param y Tile-space y.
     * @param r The body's radius.
     * @returns True when it overlaps.
     */
    const overlaps = (x: number, y: number, r: number): boolean => x + r > tx && x - r < tx + 1 && y + r > ty && y - r < ty + 1;
    /**
     * An invalid preview blocked by a body standing at a point.
     * @param x Tile-space x.
     * @param y Tile-space y.
     * @returns The preview.
     */
    const body = (x: number, y: number): PlacePreview => ({ kind, valid: false, blocker: { x, y, base: this._ctx.elevation(x, y), w: 0.7, h: 1.5 } });
    for (const { target: o } of this._avatars.values()) {
      if (!o.dead && overlaps(o.x, o.y, PLAYER_RADIUS)) {
        return body(o.x, o.y);
      }
    }
    for (const { target: m } of this._monsters.values()) {
      if (m.kind !== 'ghost' && overlaps(m.x, m.y, MONSTER_RADIUS)) {
        return body(m.x, m.y);
      }
    }
    const item = this._ctx.items.find((i: ItemState): boolean => Math.floor(i.x) === tx && Math.floor(i.y) === ty);
    if (item) {
      return { kind, valid: false, blocker: { x: item.x, y: item.y, base: this._ctx.elevation(item.x, item.y), w: 0.6, h: 0.35 } };
    }
    return { kind, valid: true, blocker: null };
  }
}
