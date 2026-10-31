// Packages
import { GOODS, stock } from '@halloween/shared/goods/goods';
import { DIGGER_CAPACITY } from '@halloween/shared/structures/automation';
import { STASH_REACH, STATIONS } from '@halloween/shared/structures/stations';
import { isStructure } from '@halloween/shared/structures/structure-catalog';
import { diggerSeconds, stationSeconds } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';
import { SORT_SIDES, sideOf, sortableKeys } from '@halloween/shared/structures/sorting';
import { useTarget } from '@halloween/shared/world/use-target';

// Local Imports
import { GameSystem } from '../core/game-system';
import { AltarJob } from '../jobs/altar-job';
import { ChestJob } from '../jobs/chest-job';
import { TurretLoadJob } from '../jobs/turret-load-job';
import { WateringJob } from '../jobs/watering-job';

// Types
import type { Bundle } from '@halloween/shared/goods/goods';
import type { UsePanel } from '@halloween/shared/protocol/state/use-panel';
import type { SortKey, SortSide } from '@halloween/shared/structures/sorting';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Tile } from '@halloween/shared/world/tiles';
import type { TileJob } from '../jobs/tile-job';
import type { Player } from '../players/player';

/**
 * A menu USE opens on the phone.
 */
type UseMenu = 'tree' | 'armory';

/**
 * The USE button: acts on the facing tile without ever hurting it. It
 * opens a storage chest, a bone digger, or a station in a panel (kept
 * current while open and closed once the player walks off), opens the
 * tree at a research table and the armory at an anvil, and otherwise
 * relights a light, loads a turret, offers at a sleeping altar, waters a
 * sprout, or opens a chest. ACT is only for hitting and working.
 */
export class UseSystem extends GameSystem {
  /**
   * What USE does to a tile when it doesn't open a panel, tried in order.
   */
  private readonly _jobs: TileJob[] = [
    new ChestJob(this._game),
    new AltarJob(this._game),
    new TurretLoadJob(this._game),
    new WateringJob(this._game),
  ];

  /**
   * Panels that changed (null: closed), by token, waiting to be sent.
   */
  private readonly _changed = new Map<string, UsePanel | null>();

  /**
   * Menus USE opened, by token, waiting to be sent.
   */
  private readonly _menus = new Map<string, UseMenu>();

  /**
   * USE on the first thing it finds the way the player points (toward
   * `at`, the mouse on /play, or else their facing; `useTarget`), or else
   * the facing tile.
   * @param token The player's token.
   * @param at The tile-space point pointed at, or null.
   */
  use(token: string, at: { x: number; y: number } | null = null): void {
    const p = this.players.get(token);
    if (!p || p.dead) {
      return;
    }
    const { tx, ty } = useTarget(this.world.map, p.x, p.y, p.facing, at);
    const tile = this.world.map.get(tx, ty);
    if (!this.open(p, tx, ty, tile) && !this._jobs.some((job: TileJob): boolean => job.tryStrike(p, tx, ty, tile, 0))) {
      if (this.world.lights.relight(tx, ty)) {
        this.outbox.sound(p, 'refuel');
      } else {
        this.outbox.sound(p, 'error');
      }
    }
  }

  /**
   * Opens what the tile holds, if it's something USE opens.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @returns Whether USE took it.
   */
  private open(p: Player, tx: number, ty: number, tile: Tile): boolean {
    if (tile === 'stash') {
      if (this.world.structureDamage.stashAt(tx, ty)?.keeper === p.name.toLowerCase()) {
        p.stashAt = { tx, ty };
        this.outbox.stashChanged.add(p.token);
        this.outbox.sound(p, 'equip');
      } else {
        this.outbox.sound(p, 'error');
      }
      return true;
    }
    if (tile === 'research-table' || tile === 'anvil') {
      this._menus.set(p.token, tile === 'anvil' ? 'armory' : 'tree');
      this.outbox.sound(p, 'equip');
      return true;
    }
    const s = this.world.structures.get(ty * this.world.map.width + tx);
    const opens = (tile === 'digger' && s?.owner === p.id) || tile === 'sorter' || (isStructure(tile) && STATIONS[tile] !== undefined);
    if (tile === 'digger' && s?.owner !== p.id) {
      this.outbox.sound(p, 'error');
      return true;
    }
    if (!opens || !s) {
      return false;
    }
    p.usingAt = { tx, ty };
    p.usingKey = '';
    this.outbox.sound(p, 'equip');
    return true;
  }

  /**
   * Closes the open digger or station panel.
   * @param token The player's token.
   */
  close(token: string): void {
    const p = this.players.get(token);
    if (p?.usingAt) {
      p.usingAt = null;
      p.usingKey = '';
      this._changed.set(p.token, null);
    }
  }

  /**
   * Feeds the open station from the bag: one batch, or as many as fit.
   * @param token The player's token.
   * @param all Whether to fill it.
   */
  feed(token: string, all: boolean): void {
    const p = this.players.get(token);
    const at = p?.usingAt;
    if (!p || p.dead || !at) {
      return;
    }
    const feedOne = (): boolean => this.world.stations.feed(at.tx, at.ty, (cost: Bundle): boolean => this._game.bag.pay(p, cost));
    let fed = 0;
    while ((all || fed === 0) && feedOne()) {
      fed++;
    }
    if (fed > 0) {
      this.outbox.inventoryChanged.add(p.token);
    }
    this.outbox.sound(p, fed > 0 ? 'refuel' : 'error');
  }

  /**
   * Takes what the open bone digger dug up.
   * @param token The player's token.
   */
  collect(token: string): void {
    const p = this.players.get(token);
    const at = p?.usingAt;
    const s = at && this.world.map.get(at.tx, at.ty) === 'digger' ? this.world.structures.get(at.ty * this.world.map.width + at.tx) : undefined;
    if (!p || p.dead || !at || !s?.hoard || !GOODS.some((g): boolean => (s.hoard![g] ?? 0) > 0)) {
      if (p) {
        this.outbox.sound(p, 'error');
      }
      return;
    }
    this._game.pickups.award(p, stock(s.hoard), at.tx + 0.5, at.ty + 0.5);
    s.hoard = {};
  }

  /**
   * Sends one thing out one side of the belt sorter the player has open
   * (null clears that side). The thing must be one the player has
   * unlocked, and goes out only one side: setting it on one takes it off
   * any other. The side things roll out by default can't be set.
   * @param token The player's token.
   * @param side The side.
   * @param item The thing, or null.
   */
  route(token: string, side: SortSide, item: SortKey | null): void {
    const p = this.players.get(token);
    const at = p?.usingAt;
    const s = at && this.world.map.get(at.tx, at.ty) === 'sorter' ? this.world.structures.get(at.ty * this.world.map.width + at.tx) : undefined;
    const [dx, dy] = at ? this.world.map.turnOf(at.tx, at.ty) ?? [1, 0] : [1, 0];
    if (!p || p.dead || !s || !SORT_SIDES.includes(side) || side === sideOf(dx, dy) || (item !== null && !sortableKeys(this._game.gameTab.treeOf(p)).includes(item))) {
      if (p) {
        this.outbox.sound(p, 'error');
      }
      return;
    }
    s.routes ??= {};
    for (const other of SORT_SIDES) {
      if (item !== null && s.routes[other] === item) {
        delete s.routes[other];
      }
    }
    if (item === null) {
      delete s.routes[side];
    } else {
      s.routes[side] = item;
    }
    this.outbox.sound(p, 'equip');
  }

  /**
   * Each tick: closes the panel if the player died, walked more than
   * STASH_REACH away, or it's gone, and queues it to send when it changed.
   * @param p The player.
   */
  refresh(p: Player): void {
    if (!p.usingAt) {
      return;
    }
    const panel = p.dead || Math.hypot(p.usingAt.tx + 0.5 - p.x, p.usingAt.ty + 0.5 - p.y) > STASH_REACH ? null : this.panelAt(p.usingAt.tx, p.usingAt.ty);
    if (!panel) {
      this.close(p.token);
      return;
    }
    const key = JSON.stringify(panel);
    if (key !== p.usingKey) {
      p.usingKey = key;
      this._changed.set(p.token, panel);
    }
  }

  /**
   * The panel for a digger or station tile, as the phone shows it.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns The panel, or null if nothing USE opens is there.
   */
  private panelAt(tx: number, ty: number): UsePanel | null {
    const tile = this.world.map.get(tx, ty);
    const s = this.world.structures.get(ty * this.world.map.width + tx);
    if (!s || !isStructure(tile)) {
      return null;
    }
    const level = s.level ?? 0;
    if (tile === 'sorter') {
      const [dx, dy] = this.world.map.turnOf(tx, ty) ?? [1, 0];
      return { kind: 'sorter', forward: sideOf(dx, dy), routes: { ...s.routes } };
    }
    if (tile === 'digger') {
      const seconds = diggerSeconds(level);
      return { kind: 'digger', level, hoard: stock(s.hoard), capacity: DIGGER_CAPACITY, progress: Math.round(((s.progress ?? 0) / seconds) * 10) / 10, seconds };
    }
    const station = STATIONS[tile];
    if (!station) {
      return null;
    }
    const seconds = stationSeconds(tile as StructureKind, level);
    return { kind: 'station', station: tile, level, queue: s.queue ?? 0, max: station.queue, progress: Math.round(((s.progress ?? 0) / seconds) * 10) / 10, seconds, buffer: stock(s.buffer) };
  }

  /**
   * Returns and clears the panels that changed (null: closed).
   * @returns Each token with its panel.
   */
  takeChanges(): [string, UsePanel | null][] {
    const changes = [...this._changed];
    this._changed.clear();
    return changes;
  }

  /**
   * Returns and clears the menus USE opened.
   * @returns Each token with its menu.
   */
  takeMenus(): [string, UseMenu][] {
    const menus = [...this._menus];
    this._menus.clear();
    return menus;
  }
}
