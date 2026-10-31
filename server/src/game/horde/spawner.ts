// Packages
import { extraPerPlayer, monsterDamage, monsterHealth, spawnSpeedup } from '@halloween/shared/difficulty/horde-scaling';
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';
import {
  BASE_MONSTERS,
  DESPAWN_AFTER,
  DESPAWN_DISTANCE,
  GHOST_SPAWN_INTERVAL,
  IDLE_ZOMBIES,
  LIGHTS_PER_GHOST,
  CALM_SPAWN_GAP,
  MAX_MONSTERS,
  MONSTERS_PER_PLAYER,
  PRESSURE_RADIUS,
  SPAWN_EDGE,
  SPAWN_INTERVAL,
  SPAWN_MIN_DISTANCE,
  SPAWN_RING_MAX,
} from '@halloween/shared/monsters/spawning';
import { isTrap } from '@halloween/shared/structures/traps';

// Local Imports
import { SUMMON_CLEAR } from './config/summon';
import { monsterWalkable } from './helpers/terrain';
import { pickKind } from './helpers/spawn-mix';
import { rollTraits } from './helpers/traits';
import { HordePart } from './horde-part';
import { createMonster } from './monsters/monster-factory';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { World } from '../world/world';
import type { Monster } from './monsters/monster';
import type { Target } from './types/hooks';

/**
 * Brings monsters in: trickle and blood-moon spawning at the map edge (or
 * around players on a huge world), takes away strays on a huge world, and
 * puts summoned ones down for the Game tab.
 */
export class Spawner<P extends Target> extends HordePart<P> {
  /**
   * When the next monster may come (on a huge world, each player's own
   * clock is in `_nextNear`).
   */
  private _nextSpawnAt = 0;

  /**
   * When a walking monster last spawned anywhere (see CALM_SPAWN_GAP).
   */
  private _lastWalkerAt = -Infinity;

  /**
   * On a huge world, when the next monster may come around each player.
   */
  private readonly _nextNear = new Map<P, number>();

  /**
   * Whether the first tick's idle zombies are out.
   */
  private _started = false;

  /**
   * When the next ghost may come.
   */
  private _nextGhostAt = 0;

  /**
   * When each monster wandered out of every player's reach on a huge world
   * (see `despawnStrays`).
   */
  private readonly _strayedAt = new Map<number, number>();

  /**
   * Trickle spawning, at the pace a world event sets if one does:
   * one monster every interval while under the per-player cap, its kind
   * kept to the mix (`pickKind`; on a huge world, around each player on
   * their own, `trickleNear`),
   * and ghosts on their own clock, one per few burning lights. With nobody
   * playing, a few zombies keep wandering so the screen stays alive, and
   * that many are out from the first tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param spawning Whether monsters walk in on their own.
   * @param level The world level.
   */
  spawn(world: World, present: P[], spawning: boolean, level: number): void {
    if (!spawning) {
      return;
    }
    const time = world.time;
    const ghosts = this.roster.count('ghost');
    const walkers = this.roster.size - ghosts;

    const pace = this._horde.mods.spawning;
    const interval = (pace.interval ?? SPAWN_INTERVAL) / spawnSpeedup(level);
    const idle = present.length === 0;
    const perPlayer = (pace.perPlayer ?? MONSTERS_PER_PLAYER) + extraPerPlayer(level);
    const cap = idle ? IDLE_ZOMBIES : Math.round(Math.min(MAX_MONSTERS, BASE_MONSTERS + present.length * perPlayer) * this._horde.loadScale);
    if (!this._started) {
      this._started = true;
      for (let i = walkers; i < IDLE_ZOMBIES; i++) {
        this.spawnAtEdge('zombie', world, present, level);
      }
      this._nextSpawnAt = time + interval;
    } else if (world.map.edge === 'chasm') {
      this.trickleNear(world, present, level, interval, perPlayer);
    } else if (walkers >= cap) {
      this._nextSpawnAt = time + interval;
    } else if (time >= this._nextSpawnAt && this.calmAllows(time)) {
      this._nextSpawnAt = time + interval;
      this._lastWalkerAt = time;
      const out = [...this.roster.values()].filter((m: { kind: MonsterKind }): boolean => m.kind !== 'ghost');
      this.spawnAtEdge(idle ? 'zombie' : pickKind(level, cap, out, this.roster.count('demon'), this._horde.mods.spawnMix), world, present, level);
    }

    const burning = this._horde.light.burning();
    const ghostCap = present.length > 0 ? Math.ceil(burning / (pace.lightsPerGhost ?? LIGHTS_PER_GHOST)) : 0;
    if (ghosts >= ghostCap) {
      this._nextGhostAt = time + GHOST_SPAWN_INTERVAL;
    } else if (time >= this._nextGhostAt) {
      this._nextGhostAt = time + GHOST_SPAWN_INTERVAL;
      this.spawnAtEdge('ghost', world, present, level);
    }
  }

  /**
   * A huge world's trickle: each player has their own spawn clock and cap
   * (see PRESSURE_RADIUS), shared with the players near them, and the mix
   * holds in the walkers around them. MAX_MONSTERS still holds overall.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param level The world level.
   * @param interval Seconds between spawns for a lone player.
   * @param perPlayer Walkers allowed per player.
   */
  private trickleNear(world: World, present: P[], level: number, interval: number, perPlayer: number): void {
    const time = world.time;
    const walkers = [...this.roster.values()].filter((m: { kind: MonsterKind }): boolean => m.kind !== 'ghost');
    for (const p of this._nextNear.keys()) {
      if (!present.includes(p)) {
        this._nextNear.delete(p);
      }
    }
    for (const p of present) {
      const near = (o: { x: number; y: number }): boolean => Math.hypot(o.x - p.x, o.y - p.y) < PRESSURE_RADIUS;
      const crowd = present.filter(near).length;
      const around = walkers.filter(near);
      const cap = Math.round((BASE_MONSTERS + crowd * perPlayer) * this._horde.loadScale);
      const wait = interval * crowd;
      const next = this._nextNear.get(p) ?? time + wait;
      if (walkers.length >= MAX_MONSTERS * this._horde.loadScale || around.length >= cap) {
        this._nextNear.set(p, time + wait);
      } else if (time >= next && this.calmAllows(time)) {
        this._nextNear.set(p, time + wait);
        this._lastWalkerAt = time;
        this.spawnNear(pickKind(level, cap, around, this.roster.count('demon'), this._horde.mods.spawnMix), world, present, level, p);
      } else {
        this._nextNear.set(p, next);
      }
    }
  }

  /**
   * Whether a walking monster may spawn now: always while a world event
   * sets the pace (a blood moon), else only CALM_SPAWN_GAP seconds after
   * the last one anywhere.
   * @param time The game clock.
   * @returns True when one may come.
   */
  private calmAllows(time: number): boolean {
    return this._horde.mods.spawning.interval !== null || time - this._lastWalkerAt >= CALM_SPAWN_GAP;
  }

  /**
   * Places a monster on a dark, open tile near the map edge, well away from
   * every player. Gives up quietly if no spot turns up.
   * @param kind What to spawn.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param level The world level.
   */
  private spawnAtEdge(kind: MonsterKind, world: World, present: P[], level: number): void {
    if (world.map.edge === 'chasm') {
      this.spawnNear(kind, world, present, level);
      return;
    }
    const walkable = monsterWalkable(world);
    for (let tries = 0; tries < 80; tries++) {
      const tx = Math.floor(Math.random() * world.map.width);
      const ty = Math.floor(Math.random() * world.map.height);
      const nearEdge = tx < SPAWN_EDGE || ty < SPAWN_EDGE || tx >= world.map.width - SPAWN_EDGE || ty >= world.map.height - SPAWN_EDGE;
      const x = tx + 0.5;
      const y = ty + 0.5;
      if (!nearEdge || !walkable(tx, ty) || isTrap(world.map.get(tx, ty)) || world.map.get(tx, ty) === 'tree' || this._horde.light.isLit(tx, ty)) {
        continue;
      }
      if (present.some((p: P): boolean => Math.hypot(p.x - x, p.y - y) < SPAWN_MIN_DISTANCE)) {
        continue;
      }
      this.add(kind, x, y, level);
      return;
    }
  }

  /**
   * A huge world's spawn: a dark, open spot SPAWN_MIN_DISTANCE to
   * SPAWN_RING_MAX tiles from a player (`around`, or a random one each try)
   * and no closer to any other. Nothing while nobody is playing.
   * @param kind What to spawn.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param level The world level.
   * @param around The player it comes for, if one.
   */
  private spawnNear(kind: MonsterKind, world: World, present: P[], level: number, around?: P): void {
    if (present.length === 0) {
      return;
    }
    const walkable = monsterWalkable(world);
    for (let tries = 0; tries < 60; tries++) {
      const p = around ?? present[Math.floor(Math.random() * present.length)];
      const angle = Math.random() * Math.PI * 2;
      const d = SPAWN_MIN_DISTANCE + Math.random() * (SPAWN_RING_MAX - SPAWN_MIN_DISTANCE);
      const tx = Math.floor(p.x + Math.cos(angle) * d);
      const ty = Math.floor(p.y + Math.sin(angle) * d);
      if (!world.map.inBounds(tx, ty) || (kind !== 'ghost' && (!walkable(tx, ty) || isTrap(world.map.get(tx, ty)) || world.map.get(tx, ty) === 'tree')) || world.map.get(tx, ty) === 'chasm' || this._horde.light.isLit(tx, ty)) {
        continue;
      }
      if (present.some((o: P): boolean => Math.hypot(o.x - (tx + 0.5), o.y - (ty + 0.5)) < SPAWN_MIN_DISTANCE)) {
        continue;
      }
      this.add(kind, tx + 0.5, ty + 0.5, level);
      return;
    }
  }

  /**
   * On a huge world, takes away monsters that have been DESPAWN_DISTANCE
   * from every player for DESPAWN_AFTER seconds (they're nowhere near a
   * screen, and new ones come in around the players).
   * @param world The world.
   * @param present Players who aren't dead.
   */
  despawnStrays(world: World, present: P[]): void {
    if (world.map.edge !== 'chasm') {
      return;
    }
    for (const m of this.roster.values()) {
      if (present.some((p: P): boolean => Math.hypot(p.x - m.x, p.y - m.y) < DESPAWN_DISTANCE)) {
        this._strayedAt.delete(m.id);
        continue;
      }
      const since = this._strayedAt.get(m.id) ?? world.time;
      this._strayedAt.set(m.id, since);
      if (world.time - since >= DESPAWN_AFTER) {
        this.roster.delete(m.id);
        this._strayedAt.delete(m.id);
      }
    }
  }

  /**
   * Puts a monster on a random open tile of the map's view (the whole map
   * unless it's the sandbox), as far as it can from everyone in `away`: at
   * least `SUMMON_CLEAR` if there's room, else the farthest spot there is
   * (the TV's Game tab).
   * @param kind What to summon.
   * @param world The world.
   * @param away Who to keep it away from.
   * @param level The world level.
   */
  summon(kind: MonsterKind, world: World, away: { x: number; y: number }[], level: number): void {
    const fits = this.summonable(kind, world);
    const spots: { tx: number; ty: number; d: number }[] = [];
    for (let ty = 1; ty < world.map.height - 1; ty++) {
      for (let tx = 1; tx < world.map.width - 1; tx++) {
        if (fits(tx, ty)) {
          spots.push({ tx, ty, d: Math.min(Infinity, ...away.map((p: { x: number; y: number }): number => Math.hypot(p.x - (tx + 0.5), p.y - (ty + 0.5)))) });
        }
      }
    }
    const clear = spots.filter((s): boolean => s.d >= SUMMON_CLEAR);
    const far = Math.max(0, ...spots.map((s): number => s.d));
    const pick = clear.length > 0 ? clear : spots.filter((s): boolean => s.d >= far - 0.5);
    const at = pick[Math.floor(Math.random() * pick.length)];
    if (at) {
      this.add(kind, at.tx + 0.5, at.ty + 0.5, level);
    }
  }

  /**
   * Summons a monster right at (x, y) for the admin's cursor, past the
   * usual rules (lit ground, traps, players near): anywhere in view that
   * isn't solid (a ghost anywhere but the fence).
   * @param kind What to summon.
   * @param world The world.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param level The world level.
   */
  summonAt(kind: MonsterKind, world: World, x: number, y: number, level: number): void {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    if (world.inView(tx, ty) && (kind === 'ghost' ? world.map.get(tx, ty) !== 'fence' : !world.map.isSolid(tx, ty))) {
      this.add(kind, x, y, level);
    }
  }

  /**
   * Which tiles a summoned monster may appear on: in view, not a fence,
   * and (but for a ghost) walkable, not a trap, and not a tree.
   * @param kind What's summoned.
   * @param world The world.
   * @returns Whether a tile will do.
   */
  private summonable(kind: MonsterKind, world: World): (tx: number, ty: number) => boolean {
    const walkable = monsterWalkable(world);
    return (tx: number, ty: number): boolean => world.inView(tx, ty) && world.map.get(tx, ty) !== 'fence'
      && (kind === 'ghost' || (walkable(tx, ty) && !isTrap(world.map.get(tx, ty)) && world.map.get(tx, ty) !== 'tree'));
  }

  /**
   * Brings a monster up at (x, y) for a necromancer, marked as raised.
   * @param kind What it is.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param level The world level.
   * @returns Its id.
   */
  raise(kind: MonsterKind, x: number, y: number, level: number): number {
    const m = this.add(kind, x, y, level);
    m.raised = true;
    return m.id;
  }

  /**
   * Makes a new monster and adds it to the roster.
   * @param kind What it is.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param level The world level.
   * @returns The monster.
   */
  private add(kind: MonsterKind, x: number, y: number, level: number): Monster<P> {
    const id = this.roster.takeId();
    const hp = MONSTERS[kind].hp * (kind === 'ghost' ? 1 : monsterHealth(level));
    const traits = rollTraits(kind, level);
    const m = createMonster({ id, kind, x, y, hp, power: monsterDamage(level), traits }, this._horde);
    this.roster.add(m);
    return m;
  }
}
