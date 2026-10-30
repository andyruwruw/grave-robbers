// Packages
import { extraPerPlayer, monsterDamage, monsterHealth, spawnSpeedup, spawnWeights } from '@halloween/shared/difficulty/horde-scaling';
import { MAX_DEMONS } from '@halloween/shared/monsters/kinds/demon';
import { MONSTER_KINDS } from '@halloween/shared/monsters/monster-kinds';
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';
import {
  BASE_MONSTERS,
  BLOOD_MOON_LIGHTS_PER_GHOST,
  BLOOD_MOON_MONSTERS_PER_PLAYER,
  BLOOD_MOON_SPAWN_INTERVAL,
  DESPAWN_AFTER,
  DESPAWN_DISTANCE,
  GHOST_SPAWN_INTERVAL,
  IDLE_ZOMBIES,
  LIGHTS_PER_GHOST,
  MAX_MONSTERS,
  MONSTERS_PER_PLAYER,
  SPAWN_EDGE,
  SPAWN_INTERVAL,
  SPAWN_MIN_DISTANCE,
  SPAWN_RING_MAX,
} from '@halloween/shared/monsters/spawning';
import { isTrap } from '@halloween/shared/structures/traps';

// Local Imports
import { SUMMON_CLEAR } from './config/summon';
import { monsterWalkable } from './helpers/terrain';
import { rollTraits } from './helpers/traits';
import { HordePart } from './horde-part';
import { createMonster } from './monsters/monster-factory';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { World } from '../world/world';
import type { Target } from './types/hooks';

/**
 * Brings monsters in: trickle and blood-moon spawning at the map edge (or
 * around players on a huge world), takes away strays on a huge world, and
 * puts summoned ones down for the Game tab.
 */
export class Spawner<P extends Target> extends HordePart<P> {
  /**
   * When the next zombie or vampire may come.
   */
  private _nextSpawnAt = 0;

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
   * Trickle spawning, faster and with a higher cap during a blood moon:
   * one zombie or vampire every interval while under the per-player cap,
   * and ghosts on their own clock, one per few burning lights. With nobody
   * playing, a few zombies keep wandering so the screen stays alive, and
   * that many are out from the first tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param blood Whether a blood moon is up.
   * @param spawning Whether monsters walk in on their own.
   * @param level The world level.
   */
  spawn(world: World, present: P[], blood: boolean, spawning: boolean, level: number): void {
    if (!spawning) {
      return;
    }
    const time = world.time;
    const ghosts = this.roster.count('ghost');
    const walkers = this.roster.size - ghosts;

    const interval = (blood ? BLOOD_MOON_SPAWN_INTERVAL : SPAWN_INTERVAL) / spawnSpeedup(level);
    const idle = present.length === 0;
    const perPlayer = (blood ? BLOOD_MOON_MONSTERS_PER_PLAYER : MONSTERS_PER_PLAYER) + extraPerPlayer(level);
    const cap = idle ? IDLE_ZOMBIES : Math.min(MAX_MONSTERS, Math.round(BASE_MONSTERS + present.length * perPlayer));
    if (!this._started) {
      this._started = true;
      for (let i = walkers; i < IDLE_ZOMBIES; i++) {
        this.spawnAtEdge('zombie', world, present, level);
      }
      this._nextSpawnAt = time + interval;
    } else if (walkers >= cap) {
      this._nextSpawnAt = time + interval;
    } else if (time >= this._nextSpawnAt) {
      this._nextSpawnAt = time + interval;
      const weights = spawnWeights(level);
      const total = MONSTER_KINDS.reduce((sum: number, k: MonsterKind): number => sum + weights[k], 0);
      let roll = Math.random() * total;
      let kind = idle ? 'zombie' : MONSTER_KINDS.find((k: MonsterKind): boolean => (roll -= weights[k]) < 0) ?? 'zombie';
      if (kind === 'demon' && this.roster.count('demon') >= MAX_DEMONS) {
        kind = 'zombie';
      }
      this.spawnAtEdge(kind, world, present, level);
    }

    const burning = this._horde.light.burning();
    const ghostCap = present.length > 0 ? Math.ceil(burning / (blood ? BLOOD_MOON_LIGHTS_PER_GHOST : LIGHTS_PER_GHOST)) : 0;
    if (ghosts >= ghostCap) {
      this._nextGhostAt = time + GHOST_SPAWN_INTERVAL;
    } else if (time >= this._nextGhostAt) {
      this._nextGhostAt = time + GHOST_SPAWN_INTERVAL;
      this.spawnAtEdge('ghost', world, present, level);
    }
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
   * SPAWN_RING_MAX tiles from a random player (and no closer to any
   * other). Nothing while nobody is playing.
   * @param kind What to spawn.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param level The world level.
   */
  private spawnNear(kind: MonsterKind, world: World, present: P[], level: number): void {
    if (present.length === 0) {
      return;
    }
    const walkable = monsterWalkable(world);
    for (let tries = 0; tries < 60; tries++) {
      const p = present[Math.floor(Math.random() * present.length)];
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
    const walkable = monsterWalkable(world);
    const spots: { tx: number; ty: number; d: number }[] = [];
    for (let ty = 1; ty < world.map.height - 1; ty++) {
      for (let tx = 1; tx < world.map.width - 1; tx++) {
        if (world.inView(tx, ty) && world.map.get(tx, ty) !== 'fence' && (kind === 'ghost' || (walkable(tx, ty) && !isTrap(world.map.get(tx, ty)) && world.map.get(tx, ty) !== 'tree'))) {
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
   * Makes a new monster and adds it to the roster.
   * @param kind What it is.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param level The world level.
   */
  private add(kind: MonsterKind, x: number, y: number, level: number): void {
    const id = this.roster.takeId();
    const hp = MONSTERS[kind].hp * (kind === 'ghost' ? 1 : monsterHealth(level));
    const traits = rollTraits(kind, level);
    this.roster.add(createMonster({ id, kind, x, y, hp, power: monsterDamage(level), traits }, this._horde));
  }
}
