// Packages
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { KNOCKBACK_DISTANCE } from '@halloween/shared/players/combat';

// Local Imports
import { MONSTER_FAULTS } from '../../config/server';
import { guard } from '../helpers/guard';

// Local Imports
import { Afflictions } from './afflictions';
import { Bursts } from './bursts';
import { separateWalkers } from './helpers/separate';
import { HordeContext } from './horde-context';
import { RewindBuffer } from './rewind-buffer';
import { Spawner } from './spawner';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { EventModifiers } from '@halloween/shared/world-events/types/event-effects';
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { World } from '../world/world';
import type { Monster } from './monsters/monster';
import type { HitEffects, HordeHooks, Target } from './types/hooks';

/**
 * Every monster on the map: trickle spawning (paced by world events), and the three
 * behaviors. Zombies and vampires only notice players in sight range with a
 * clear line of sight, chase them, head for where they last saw them for a
 * few seconds after losing them, and otherwise wander: zombies shamble with
 * pauses (drifting toward the graves), vampires prowl between dark spots.
 * Chasing zombies (or ones that spot a scarecrow) chew through structures
 * in the way; vampires only move through unlit tiles and wait at the edge
 * of the light. Ghosts float to burning lights (blocked by walls and
 * terrain like anything else) to snuff them unless
 * a player is standing in them. This is what the game talks to; the
 * monsters themselves are the `Monster` classes.
 */
export class Horde<P extends Target> {
  /**
   * What the horde's parts and every monster share.
   */
  private readonly _ctx: HordeContext<P>;

  /**
   * Where every monster stood at the start of each recent tick.
   */
  private readonly _rewind = new RewindBuffer();

  /**
   * Brings monsters in.
   */
  private readonly _spawner: Spawner<P>;

  /**
   * Bursts the bloaters that died.
   */
  private readonly _bursts: Bursts<P>;

  /**
   * Statuses, damage over time, turning and raising monsters, and incense,
   * for the game's infusion effects (see `Afflictions`).
   */
  readonly afflictions: Afflictions<P>;

  /**
   * Zombies and vampires leave players alone (the TV's Game tab).
   */
  passive = false;

  /**
   * The hidden world level (see `shared/src/difficulty/world-level.ts`), set by the game: how many
   * monsters come, which kinds, and how tough new ones are.
   */
  level = 0;

  /**
   * Every light counts as out (the TV's Game tab).
   */
  dark = false;

  /**
   * Monsters walk in on their own (off: only what the Game tab summons).
   */
  spawning = true;

  /**
   * Sets the share of the usual monster caps spawning fills (see
   * `HordeContext.loadScale`).
   * @param scale The share, 0 to 1.
   */
  setLoadScale(scale: number): void {
    this._ctx.loadScale = scale;
  }

  /**
   * How many times each monster's update has thrown (see MONSTER_FAULTS).
   */
  private _faults = new Map<number, number>();

  /**
   * What all damage monsters take is multiplied by (the server's
   * difficulty).
   * @param scale The multiplier.
   */
  setDealt(scale: number): void {
    this._ctx.dealt = scale;
  }

  /**
   * The monster the TV's mouse is holding, which does nothing until
   * dropped.
   */
  liftedId: number | null = null;

  /**
   * The light the TV's right mouse button carries.
   */
  cursorLight: { x: number; y: number } | null = null;

  /**
   * Sets the horde up with no monsters.
   * @param hooks How the horde reaches back into the game.
   */
  constructor(hooks: HordeHooks<P>) {
    this._ctx = new HordeContext(hooks);
    this._spawner = new Spawner(this._ctx);
    this._bursts = new Bursts(this._ctx);
    this.afflictions = new Afflictions(this._ctx);
    this._ctx.raise = (kind: MonsterKind, x: number, y: number): number | null => this._spawner.raise(kind, x, y, this.level);
  }

  /**
   * Takes every monster away at once.
   */
  clear(): void {
    this._ctx.roster.clear();
  }

  /**
   * Kills every zombie and vampire (they burst and drop what they would
   * have) and lets every ghost fade (the TV's Game tab).
   */
  killAll(): void {
    for (const m of [...this._ctx.roster.values()]) {
      if (!m.hasBody) {
        this._ctx.roster.delete(m.id);
      } else {
        this._ctx.kill(m, Math.random() * Math.PI * 2);
      }
    }
  }

  /**
   * Every monster as the server broadcasts it.
   * @returns Their states.
   */
  snapshot(): MonsterState[] {
    return [...this._ctx.roster.values()].map((m: Monster<P>): MonsterState => m.toState(this.liftedId));
  }

  /**
   * Puts a monster somewhere by hand (the TV's mouse).
   * @param id Its id.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @returns False if it's gone.
   */
  place(id: number, x: number, y: number): boolean {
    const m = this._ctx.roster.get(id);
    if (!m) {
      return false;
    }
    m.teleport(x, y);
    return true;
  }

  /**
   * Where a monster is, if it's still around.
   * @param id Its id.
   * @returns The monster, or null.
   */
  find(id: number): { x: number; y: number; kind: MonsterKind } | null {
    return this._ctx.roster.get(id) ?? null;
  }

  /**
   * Monsters a player's swing, shot, aim, blast or spray can hit, ghosts
   * included: everything but risen allies, which only other monsters hurt.
   * @returns A new list of them.
   */
  targets(): { id: number; kind: MonsterKind; x: number; y: number }[] {
    return [...this._ctx.roster.values()].filter((m: Monster<P>): boolean => !m.turned.ally);
  }

  /**
   * The monsters `targets` gives, as they stood `back` seconds ago (at
   * most REWIND_KEEP; one too new for that keeps where it is now), for
   * judging a laggy player's melee against what their screen showed.
   * @param back How far back (seconds).
   * @param now The game clock.
   * @returns Each monster's id, kind and position then.
   */
  targetsAt(back: number, now: number): { id: number; kind: MonsterKind; x: number; y: number }[] {
    return this._rewind.at(this._ctx.roster, back, now).filter((m): boolean => !this._ctx.roster.get(m.id)?.turned.ally);
  }

  /**
   * Monsters with a body: what stands on plates, crowds players, and gets
   * pushed around (not ghosts).
   * @returns A new list of them.
   */
  bodies(): { id: number; kind: MonsterKind; x: number; y: number }[] {
    return this._ctx.roster.bodies();
  }

  /**
   * Whether a solid walker overlaps tile (tx, ty), so nothing gets built on
   * top of it.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns True when one does.
   */
  occupies(tx: number, ty: number): boolean {
    return this.bodies().some((m): boolean =>
      m.x + MONSTER_RADIUS > tx && m.x - MONSTER_RADIUS < tx + 1 && m.y + MONSTER_RADIUS > ty && m.y - MONSTER_RADIUS < ty + 1);
  }

  /**
   * Moves a walker by (dx, dy) with wall collision, when a player bumps it.
   * @param id Its id.
   * @param dx How far across (tiles).
   * @param dy How far down (tiles).
   * @param world The world.
   */
  shove(id: number, dx: number, dy: number, world: World): void {
    this._ctx.roster.get(id)?.shove(dx, dy, world);
  }

  /**
   * A player's swing landed on a monster, from (fromX, fromY).
   * @param id Its id.
   * @param amount The damage.
   * @param fromX Where the hit came from (tiles).
   * @param fromY Where the hit came from (tiles).
   * @param world The world.
   * @param knockback How far it's pushed (tiles).
   * @param effects What the hit does besides damage.
   * @returns Whether it killed it.
   */
  hit(id: number, amount: number, fromX: number, fromY: number, world: World, knockback = KNOCKBACK_DISTANCE, effects: HitEffects<P> = {}): boolean {
    return this._ctx.roster.get(id)?.takeHit(amount, fromX, fromY, world, knockback, effects) ?? false;
  }

  /**
   * Advances every monster by `dt` and spawns more if there's room.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param players Every player.
   * @param mods The world events' effects.
   */
  step(dt: number, world: World, players: P[], mods: EventModifiers): void {
    const { roster, light, heat, sight, wards } = this._ctx;
    this._ctx.mods = mods;
    this._ctx.now = world.time;
    light.fit(world.map);
    heat.fit(world.map);
    this._rewind.remember(roster, world.time);
    light.update(world, players, this.dark, this.cursorLight, roster.values());
    const present = players.filter((p: P): boolean => !p.dead);
    heat.update(dt, world, present);
    const prey = this.passive ? [] : present.filter((p: P): boolean => !p.protected);
    this._spawner.spawn(world, present, this.spawning, this.level);
    this._spawner.despawnStrays(world, present);
    sight.look(world, prey);
    wards.update(world);
    wards.catchGhosts(world);

    for (const m of roster.values()) {
      m.warded = false;
    }
    for (const m of roster.values()) {
      if (m.id === this.liftedId) {
        m.moving = false;
        continue;
      }
      if (!guard(`monster ${m.kind}`, (): void => m.update(dt, world, present, prey))) {
        this.fault(m);
      }
    }
    this._bursts.update(world, prey);
    separateWalkers(world, roster);
  }

  /**
   * Counts a monster's update throwing; one that keeps throwing
   * (MONSTER_FAULTS times) is removed, so a monster in a bad state can't
   * spoil every tick.
   * @param m The monster.
   */
  private fault(m: Monster<P>): void {
    const faults = (this._faults.get(m.id) ?? 0) + 1;
    this._faults.set(m.id, faults);
    if (faults >= MONSTER_FAULTS) {
      console.error(`[guard] removed a ${m.kind} (#${m.id}) whose update kept throwing`);
      this._ctx.roster.delete(m.id);
      this._faults.delete(m.id);
    }
  }

  /**
   * Removes up to `count` monsters, the farthest from every living player
   * first (out of sight, so it doesn't look like anything vanished), to
   * lighten a tick that's running slow (`LoadGovernor`).
   * @param count How many to remove.
   * @param players Every player.
   * @returns How many it removed.
   */
  shed(count: number, players: P[]): number {
    if (count <= 0) {
      return 0;
    }
    const present = players.filter((p: P): boolean => !p.dead);
    const away = (m: Monster<P>): number => Math.min(Infinity, ...present.map((p: P): number => Math.hypot(p.x - m.x, p.y - m.y)));
    const farthest = [...this._ctx.roster.values()].filter((m: Monster<P>): boolean => m.id !== this.liftedId).sort((a: Monster<P>, b: Monster<P>): number => away(b) - away(a)).slice(0, count);
    for (const m of farthest) {
      this._ctx.roster.delete(m.id);
    }
    return farthest.length;
  }

  /**
   * Summons a monster for the TV's Game tab, as far as it can from
   * everyone in `away`.
   * @param kind What to summon.
   * @param world The world.
   * @param away Who to keep it away from.
   */
  summon(kind: MonsterKind, world: World, away: { x: number; y: number }[]): void {
    this._spawner.summon(kind, world, away, this.level);
  }

  /**
   * Summons a monster right at (x, y) for the admin's cursor, past the
   * usual rules, if the tile isn't solid.
   * @param kind What to summon.
   * @param world The world.
   * @param x Where (tiles).
   * @param y Where (tiles).
   */
  summonAt(kind: MonsterKind, world: World, x: number, y: number): void {
    this._spawner.summonAt(kind, world, x, y, this.level);
  }
}
