// Packages
import {
  JUNK_WEAPONS,
  ZOMBIE_ARMED_DAMAGE,
} from '@halloween/shared/gear';
import {
  MONSTER_ARMOR_GUARD,
  armedChance,
  armorChance,
  extraPerPlayer,
  monsterDamage,
  monsterHealth,
  plateShare,
  spawnSpeedup,
  spawnWeights,
} from '@halloween/shared/levels';
import {
  BLOOD_MOON_LIGHTS_PER_GHOST,
  BASE_MONSTERS,
  BLOOD_MOON_MONSTERS_PER_PLAYER,
  BLOOD_MOON_SPAWN_INTERVAL,
  ARROW_SPEED,
  ATTACK_STYLE,
  BRUTE_MAX_HIT,
  BRUTE_WALL_DAMAGE,
  DEMON_BLINK_BEHIND,
  DEMON_BLINK_EVERY,
  DEMON_BLINK_MIN,
  DEMON_LUNGE,
  DEMON_LUNGE_TIME,
  GHOUL_LEAP,
  GHOUL_LEAP_TIME,
  MAX_DEMONS,
  POTION_SPEED,
  SPLASH_RADIUS,
  STRIKE_SLACK,
  GHOUL_CIRCLE,
  GHOUL_MIN_POUNCE,
  GHOUL_ORBIT,
  NEAR_SIGHT,
  SIGHT_CONE,
  SIGHT_SEARCH,
  WITCH_SWIPE,
  GHOST_SCARE_TIME,
  GHOST_SHOT_COOLDOWN,
  GHOST_SHOT_RANGE,
  GHOST_SNUFF_TIME,
  GHOST_SPAWN_INTERVAL,
  IDLE_ZOMBIES,
  LIGHTS_PER_GHOST,
  LIT_FRACTION,
  MAX_MONSTERS,
  MONSTERS,
  MONSTERS_PER_PLAYER,
  MONSTER_KINDS,
  MONSTER_RADIUS,
  SCARECROW_RANGE,
  SPAWN_EDGE,
  SPAWN_INTERVAL,
  SPAWN_MIN_DISTANCE,
  VAMPIRE_SMASHES,
  VAMPIRE_WALL_DAMAGE,
  ZOMBIE_WALL_DAMAGE,
  GHOST_FORGET,
  GHOST_KEEP,
  GHOST_KNOCKBACK,
  GHOST_SHOT_DAMAGE,
  GHOST_SHOT_REACH,
  GHOST_SHOT_SPEED,
  MONSTER_TREE_SLOW,
  isShadowWalker,
  isShambler,
  isZombie,
} from '@halloween/shared/monsters';
import {
  FALL_DAMAGE,
  FALL_MIN,
  KNOCKBACK_DISTANCE,
  KNOCKBACK_TIME,
  MELEE_REACH_DOWN,
  MELEE_REACH_UP,
  SPIKE_DAMAGE_PER_SECOND,
} from '@halloween/shared/players';
import { GRAVE_TILES } from '@halloween/shared/items';
import { BARBED_SLOW, CURSOR_LIGHT, EFFIGY_RADIUS, EFFIGY_SLOW, OBELISK_CURSE, OBELISK_RADIUS, PALISADE_THORNS, SOUL_CAGE_COOLDOWN, SOUL_CAGE_RADIUS, TRAP_DAMAGE, isStructure, isTrap } from '@halloween/shared/structures';
import { spikeDamage } from '@halloween/shared/tree';
import {
  LEVEL_HEIGHT,
  MAP_HEIGHT,
  MAP_WIDTH,
  PASSABLE,
  inTrunk,
  isSolidTile,
} from '@halloween/shared/world';

// Local Imports
import { moveWithCollision, walkerBlocked } from './collision';
import { findPath } from './pathing';

// Types
import type { MonsterKind } from '@halloween/shared/monsters';
import type { Tile } from '@halloween/shared/world';
import type { GameEvent, MonsterState } from '@halloween/shared/protocol';
import type { Blocked } from './collision';
import type { Step } from './pathing';
import type { ActiveLight, World } from './world';

/**
 * What the horde needs to know about a player.
 */
export interface Target {
  x: number;
  y: number;

  /**
   * Which way they face (demons step out of the shadows behind them).
   */
  facing: number;
  dead: boolean;
  connected: boolean;
  protected: boolean;

  /**
   * Radius of a carried light bright enough to keep vampires off (a hand
   * torch), or 0.
   */
  light: number;
}

/**
 * How the horde reaches back into the game.
 */
export interface HordeHooks<P extends Target> {
  /**
   * A monster hit a player from (fromX, fromY).
   */
  hurt: (p: P, amount: number, by: string, fromX: number, fromY: number, knockback?: number, slow?: number) => number;
  event: (e: GameEvent) => void;

  /**
   * A monster loosed something hostile from (x, y) along `angle`: a ghost's
   * ectoplasm, a skeleton's arrow, or a witch's potion (which bursts after
   * `land` tiles).
   */
  shoot: (x: number, y: number, angle: number, shot: HostileShot) => void;
}

/**
 * Something a monster fires at players: what it is, its damage, speed and
 * range (tiles), who it's from for the kill feed, and for a potion, where
 * it lands.
 */
export interface HostileShot {
  kind: 'ecto' | 'arrow' | 'potion';
  damage: number;
  speed: number;
  reach: number;
  by: string;
  land?: number;
}

/**
 * Server-side monster: public state plus health, its current path, and AI
 * timers (game-clock seconds).
 */
interface Monster extends Omit<MonsterState, 'health' | 'lifted'> {
  hp: number;

  /**
   * Full health and how hard it hits, both set by the world level when it
   * appeared.
   */
  maxHp: number;
  power: number;

  /**
   * When the attack it's winding up lands (null when it isn't), and who
   * it's aimed at: it keeps turning to face them until then, so its aim is
   * perfect, and only being out of reach dodges it. Hits don't interrupt
   * it.
   */
  strikeAt: number | null;
  prey: Target | null;

  /**
   * A ghoul's pounce: until when it's in the air, and whether it already
   * caught someone on the way.
   */
  leapUntil: number;
  leapHit: boolean;
  leapSpeed: number;

  /**
   * When a demon may next step through the shadows.
   */
  blinkAt: number;

  /**
   * Whether the attack winding up is a witch's broom swipe, and when she
   * may swing it next.
   */
  swiping: boolean;
  swipeAt: number;

  /**
   * Which way a ghoul circles its prey (1 or -1), until when, and how long
   * it's been running into something.
   */
  orbit: number;
  orbitUntil: number;
  path: Step[];
  repathAt: number;
  nextAttackAt: number;
  knockX: number;
  knockY: number;
  knockUntil: number;
  drainTime: number;
  scaredUntil: number;
  scaredFromX: number;
  scaredFromY: number;
  wanderUntil: number;
  wanderX: number;
  wanderY: number;
  wanderHeading: number;
  wanderIdle: boolean;
  hunting: boolean;

  /**
   * What an idle zombie is drawn toward when it picks where to shamble
   * (`ZOMBIE_LURES`), if anything, and how long it has been making no
   * headway along its wander path.
   */
  lure: 'players' | 'graves' | null;
  bumping: number;

  /**
   * This zombie's own speed multiplier, so a crowd doesn't move in step.
   */
  pace: number;
  lastSeenX: number;
  lastSeenY: number;
  lastSeenAt: number;
}

/**
 * Seconds between path searches (vampires re-plan faster, they cover
 * ground quickly).
 */
const ZOMBIE_REPATH = 0.6;
const VAMPIRE_REPATH = 0.3;

/**
 * Close enough to a path tile's center to move on to the next.
 */
const WAYPOINT_REACHED = 0.15;

/**
 * Walkers push apart when closer than this.
 */
const SEPARATION = 0.55;

/**
 * Idle ghosts drift to a random point this close, every few seconds.
 */
const WANDER_RANGE = 5;

/**
 * Fraction of full speed for an idle zombie's shamble and a vampire's
 * prowl.
 */
const SHAMBLE_PACE = 0.4;
const PROWL_PACE = 0.5;

/**
 * Idle zombies pick a tile SHAMBLE_REACH tiles or so away and path to it.
 * A share of them (ZOMBIE_LURES, each a chance at spawn) is drawn toward
 * where players have been lately or toward clusters of graves: LURE_CHANCE
 * of their picks go to the hottest of LURE_TRIES spots, up to LURE_REACH
 * away. Player heat fades with a PLAYER_HEAT_MEMORY second time constant;
 * grave heat (graves within GRAVE_HEAT_RADIUS) is redone every
 * GRAVE_HEAT_REFRESH seconds. A zombie making no headway for BUMP_GIVE_UP
 * seconds stops and picks somewhere else.
 */
const SHAMBLE_REACH = [3, 8] as const;
const ZOMBIE_LURES = { players: 0.3, graves: 0.3 } as const;
const LURE_CHANCE = 0.6;
const LURE_TRIES = 10;
const LURE_REACH = 14;
const PLAYER_HEAT_MEMORY = 180;
const GRAVE_HEAT_RADIUS = 3;
const GRAVE_HEAT_REFRESH = 10;
const BUMP_GIVE_UP = 0.8;

/**
 * A shambling zombie weaves side to side by up to SHAMBLE_WEAVE radians,
 * and trips about STUMBLE_RATE times a second: a short lurch at
 * STUMBLE_SPEED tiles/s, then a moment to recover.
 */
const SHAMBLE_WEAVE = 0.3;
const STUMBLE_RATE = 0.12;
const STUMBLE_SPEED = 1.6;
const STUMBLE_TIME = 0.3;

/**
 * Tiles tall enough to hide a player. Gravestones, fences, rocks, and
 * lights are low enough to see over.
 */
const OPAQUE: ReadonlySet<Tile> = new Set<Tile>([
  'crypt', 'mausoleum', 'ruin', 'statue', 'hedge', 'tower', 'wood-wall', 'stone-wall', 'palisade', 'door', 'bone-wall',
]);

/**
 * Structures that throw stone chips when chewed.
 */
const STONY: ReadonlySet<Tile> = new Set<Tile>(['stone-wall', 'furnace', 'altar', 'bloodforge', 'bone-wall', 'cauldron']);

/**
 * A ghost drains a light from this close to its center.
 */
const GHOST_HOVER = 0.5;

/**
 * Path cost of walking over spikes, so zombies prefer to go around.
 */
const SPIKE_COST = 4;

function tileOf(m: { x: number; y: number }): Step {
  return { tx: Math.floor(m.x), ty: Math.floor(m.y) };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * How close to a player the Game tab may summon a monster, in tiles.
 */
const SUMMON_CLEAR = 4;

/**
 * Every monster on the map: trickle and blood-moon spawning, and the three
 * behaviors. Zombies and vampires only notice players in sight range with a
 * clear line of sight, chase them, head for where they last saw them for a
 * few seconds after losing them, and otherwise wander: zombies shamble with
 * pauses (drifting toward the graves), vampires prowl between dark spots.
 * Chasing zombies (or ones that spot a scarecrow) chew through structures
 * in the way; vampires only move through unlit tiles and wait at the edge
 * of the light. Ghosts meander through walls to snuff burning lights unless
 * a player is standing in them.
 */
export class Horde<P extends Target> {
  private monsters = new Map<number, Monster>();
  private nextId = 1;
  private nextSpawnAt = 0;
  private started = false;
  private nextGhostAt = 0;
  private lit = new Uint8Array(MAP_WIDTH * MAP_HEIGHT);
  private playerHeat = new Float32Array(MAP_WIDTH * MAP_HEIGHT);
  private graveHeat = new Float32Array(MAP_WIDTH * MAP_HEIGHT);
  private graveHeatAt = -Infinity;
  private lights: ActiveLight[] = [];

  /**
   * This tick's sightings: for each monster, the players it can see.
   */
  private sightings = new Map<number, P[]>();

  /**
   * This tick's effigies: where, and how far their curse reaches.
   */
  private effigies: { x: number; y: number; radius: number }[] = [];
  private obelisks: { x: number; y: number; radius: number }[] = [];

  /**
   * When each soul cage (by tile index) may catch its next ghost.
   */
  private cageReady = new Map<number, number>();

  /**
   * Zombies and vampires leave players alone (the TV's Game tab).
   */
  passive = false;

  /**
   * The hidden world level (see `levels.ts`), set by the game: how many
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
   * The monster the TV's mouse is holding, which does nothing until
   * dropped, and the light the TV's right mouse button carries.
   */
  liftedId: number | null = null;
  cursorLight: { x: number; y: number } | null = null;

  constructor(private hooks: HordeHooks<P>) {}

  clear(): void {
    this.monsters.clear();
  }

  /**
   * Kills every zombie and vampire (they burst and drop what they would
   * have) and lets every ghost fade (the TV's Game tab).
   */
  killAll(): void {
    for (const m of [...this.monsters.values()]) {
      if (m.kind === 'ghost') {
        this.monsters.delete(m.id);
      } else {
        this.die(m, Math.random() * Math.PI * 2);
      }
    }
  }

  snapshot(): MonsterState[] {
    return [...this.monsters.values()].map((m: Monster): MonsterState => ({
      id: m.id,
      kind: m.kind,
      x: Math.round(m.x * 1000) / 1000,
      y: Math.round(m.y * 1000) / 1000,
      facing: Math.round(m.facing * 1000) / 1000,
      moving: m.moving,
      lifted: m.id === this.liftedId,
      held: m.held,
      hurts: m.hurts,
      armor: m.armor,
      health: Math.round(Math.max(0, m.hp / m.maxHp) * 100) / 100,
      attacks: m.attacks,
      stumbles: m.stumbles,
      hunting: m.hunting,
      draining: m.draining,
      blinks: m.blinks,
      swipes: m.swipes,
    }));
  }

  /**
   * Puts a monster somewhere by hand (the TV's mouse). Returns false if it's
   * gone.
   */
  place(id: number, x: number, y: number): boolean {
    const m = this.monsters.get(id);
    if (!m) {
      return false;
    }
    m.x = x;
    m.y = y;
    m.path = [];
    m.repathAt = 0;
    m.knockUntil = 0;
    return true;
  }

  /**
   * Where a monster is, if it's still around.
   */
  find(id: number): { x: number; y: number; kind: MonsterKind } | null {
    return this.monsters.get(id) ?? null;
  }

  /**
   * Monsters a swing or a shot can hit, ghosts included.
   */
  targets(): { id: number; kind: MonsterKind; x: number; y: number }[] {
    return [...this.monsters.values()];
  }

  /**
   * Monsters with a body: what stands on plates, crowds players, and gets
   * pushed around (not ghosts).
   */
  bodies(): { id: number; kind: MonsterKind; x: number; y: number }[] {
    return [...this.monsters.values()].filter((m: Monster): boolean => m.kind !== 'ghost');
  }

  /**
   * Whether a solid walker overlaps tile (tx, ty), so nothing gets built on
   * top of it.
   */
  occupies(tx: number, ty: number): boolean {
    return this.bodies().some((m): boolean =>
      m.x + MONSTER_RADIUS > tx && m.x - MONSTER_RADIUS < tx + 1 && m.y + MONSTER_RADIUS > ty && m.y - MONSTER_RADIUS < ty + 1);
  }

  /**
   * Moves a walker by (dx, dy) with wall collision, when a player bumps it.
   */
  shove(id: number, dx: number, dy: number, world: World): void {
    const m = this.monsters.get(id);
    if (m && m.kind !== 'ghost') {
      Object.assign(m, moveWithCollision(this.blocked(world, m), m.x, m.y, dx, dy, MONSTER_RADIUS));
    }
  }

  /**
   * A player's swing landed on a monster, from (fromX, fromY). Returns
   * whether it killed it.
   */
  hit(id: number, amount: number, fromX: number, fromY: number, world: World, knockback = KNOCKBACK_DISTANCE): boolean {
    const m = this.monsters.get(id);
    if (!m) {
      return false;
    }
    if (m.kind === 'ghost') {
      knockback *= GHOST_KNOCKBACK;
      m.hunting = true;
    }
    if (m.kind === 'brute') {
      knockback = 0;
    }
    if (this.obelisks.some((o): boolean => Math.hypot(o.x - m.x, o.y - m.y) <= o.radius)) {
      amount *= OBELISK_CURSE;
    }
    m.hp -= m.armor ? amount * MONSTER_ARMOR_GUARD[m.armor] : amount;
    m.hurts++;
    m.lastSeenX = fromX;
    m.lastSeenY = fromY;
    m.lastSeenAt = world.time;
    const dist = Math.hypot(m.x - fromX, m.y - fromY);
    if (dist > 0) {
      const speed = knockback / KNOCKBACK_TIME;
      m.knockX = ((m.x - fromX) / dist) * speed;
      m.knockY = ((m.y - fromY) / dist) * speed;
      m.knockUntil = world.time + KNOCKBACK_TIME;
    }
    if (m.hp <= 0) {
      this.die(m, Math.atan2(m.y - fromY, m.x - fromX));
      return true;
    }
    return false;
  }

  /**
   * Advances every monster by `dt` and spawns more if there's room.
   */
  step(dt: number, world: World, players: P[], bloodMoon: boolean): void {
    this.updateLit(world, players);
    const present = players.filter((p: P): boolean => !p.dead);
    this.updateHeat(dt, world, present);
    const prey = this.passive ? [] : present.filter((p: P): boolean => !p.protected);
    this.spawn(world, present, bloodMoon);
    this.look(world, prey);
    this.effigies = world.structuresOf('effigy').map(({ tx, ty }): { x: number; y: number; radius: number } => ({ x: tx + 0.5, y: ty + 0.5, radius: EFFIGY_RADIUS + 0.5 * world.structureLevel(tx, ty) }));
    this.obelisks = world.structuresOf('obelisk').map(({ tx, ty }): { x: number; y: number; radius: number } => ({ x: tx + 0.5, y: ty + 0.5, radius: OBELISK_RADIUS + 0.5 * world.structureLevel(tx, ty) }));
    this.catchGhosts(world);

    for (const m of this.monsters.values()) {
      if (m.id === this.liftedId) {
        m.moving = false;
        continue;
      }
      if (world.time < m.knockUntil) {
        const before = world.map.elevationAt(m.x, m.y);
        if (m.kind === 'ghost') {
          const x = Math.min(MAP_WIDTH - 0.5, Math.max(0.5, m.x + m.knockX * dt));
          const y = Math.min(MAP_HEIGHT - 0.5, Math.max(0.5, m.y + m.knockY * dt));
          if (world.map.get(Math.floor(x), Math.floor(y)) === 'fence') {
            m.knockUntil = 0;
          } else {
            m.x = x;
            m.y = y;
          }
        } else {
          Object.assign(m, moveWithCollision(this.blocked(world, m), m.x, m.y, m.knockX * dt, m.knockY * dt, MONSTER_RADIUS));
        }
        const drop = before - world.map.elevationAt(m.x, m.y);
        if (m.kind === 'vampire' && drop >= FALL_MIN) {
          m.hp -= FALL_DAMAGE * Math.round(drop / LEVEL_HEIGHT);
          m.hurts++;
          if (m.hp <= 0) {
            this.die(m, Math.atan2(m.knockY, m.knockX));
            continue;
          }
        }
      }
      m.moving = false;
      if (world.time < m.leapUntil) {
        this.leap(m, dt, world, prey);
      } else if (m.strikeAt !== null) {
        this.windUp(m, world, prey);
      } else if (isShambler(m.kind)) {
        this.stepZombie(m, dt, world, prey);
      } else if (isShadowWalker(m.kind)) {
        this.stepVampire(m, dt, world, prey);
      } else {
        this.stepGhost(m, dt, world, present, prey);
      }
      const trap = world.map.get(Math.floor(m.x), Math.floor(m.y));
      if (m.kind !== 'ghost' && this.monsters.has(m.id) && isTrap(trap)) {
        const before = Math.ceil(m.hp);
        m.hp -= spikeDamage(SPIKE_DAMAGE_PER_SECOND * TRAP_DAMAGE[trap]!, world.structureLevel(Math.floor(m.x), Math.floor(m.y))) * dt;
        if (Math.ceil(m.hp) !== before) {
          m.hurts++;
        }
        if (m.hp <= 0) {
          this.die(m, Math.random() * Math.PI * 2);
        }
      }
    }
    this.separate(world);
  }

  private stepZombie(m: Monster, dt: number, world: World, prey: P[]): void {
    const def = MONSTERS[m.kind];
    const p = this.perceive(m, prey, world);
    if (p && m.kind === 'witch' && distance(m, p) <= WITCH_SWIPE.reach && world.time >= m.swipeAt) {
      this.setHunting(m, true);
      this.swipe(m, p, world);
      return;
    }
    if (p && m.kind === 'ghoul' && distance(m, p) <= GHOUL_CIRCLE && !(world.time >= m.nextAttackAt && distance(m, p) <= def.range! && distance(m, p) >= GHOUL_MIN_POUNCE)) {
      this.setHunting(m, true);
      this.circle(m, p, dt, world);
      return;
    }
    if (p && def.range !== undefined && distance(m, p) <= def.range) {
      const d = distance(m, p);
      if (def.keep !== undefined && d < def.keep) {
        this.setHunting(m, true);
        this.moveToward(m, m.x - (p.x - m.x), m.y - (p.y - m.y), def.speed * m.pace * dt, world);
        m.facing = Math.atan2(p.y - m.y, p.x - m.x);
        return;
      }
      if (world.time >= m.nextAttackAt || def.keep !== undefined) {
        this.setHunting(m, true);
        this.attack(m, p, world);
        return;
      }
    }
    if (p && this.inReach(m, p, world)) {
      this.attack(m, p, world);
      return;
    }
    const scarecrow = world.structuresOf('scarecrow')
      .map((s: Step): { s: Step; d: number } => ({ s, d: Math.hypot(s.tx + 0.5 - m.x, s.ty + 0.5 - m.y) }))
      .filter(({ s, d }): boolean => d <= SCARECROW_RANGE && this.canSee(world, m.x, m.y, s.tx + 0.5, s.ty + 0.5))
      .sort((a, b): number => a.d - b.d)[0]?.s;
    const goal = scarecrow ?? (p ? tileOf(p) : this.remembered(m, world));
    this.setHunting(m, goal !== null);
    if (!goal) {
      this.shamble(m, dt, world);
      return;
    }
    if (world.time >= m.repathAt) {
      m.repathAt = world.time + ZOMBIE_REPATH * (0.8 + Math.random() * 0.4);
      const open = this.walkable(world);
      m.path = findPath({
        from: tileOf(m),
        to: goal,
        cost: (tx: number, ty: number, fx: number, fy: number): number => {
          const tile = world.map.get(tx, ty);
          if (isStructure(tile) && (isSolidTile(tile) || tile === 'door' || !world.map.canStep(fx, fy, tx, ty))) {
            return 1 + (world.structureHp(tx, ty) ?? 0) * 0.3;
          }
          if (!open(tx, ty) || !world.map.canStep(fx, fy, tx, ty)) {
            return Infinity;
          }
          return isTrap(tile) ? SPIKE_COST : tile === 'tree' ? 1 / MONSTER_TREE_SLOW : 1;
        },
        open,
        score: (tx: number, ty: number): number => Math.hypot(tx - goal.tx, ty - goal.ty),
      }) ?? [];
    }
    this.skipReached(m);
    const next = m.path[0];
    if (!next) {
      if (p) {
        this.moveToward(m, p.x, p.y, def.speed * m.pace * dt, world);
      } else if (!scarecrow && Math.hypot(m.lastSeenX - m.x, m.lastSeenY - m.y) < 1.2) {
        this.giveUp(m, world);
      }
      return;
    }
    if (this.blocked(world, m)(next.tx, next.ty)) {
      this.chew(m, next, dt, world);
      return;
    }
    this.moveToward(m, next.tx + 0.5, next.ty + 0.5, def.speed * m.pace * dt, world);
  }

  /**
   * Bites the structure on `tile`, or shuffles up to it first.
   */
  private chew(m: Monster, tile: Step, dt: number, world: World): void {
    const cx = tile.tx + 0.5;
    const cy = tile.ty + 0.5;
    m.facing = Math.atan2(cy - m.y, cx - m.x);
    if (Math.hypot(cx - m.x, cy - m.y) > 1.25) {
      this.moveToward(m, cx, cy, MONSTERS[m.kind].speed * dt, world);
      return;
    }
    if (world.time < m.nextAttackAt || world.structureHp(tile.tx, tile.ty) === null) {
      return;
    }
    const tileKind = world.map.get(tile.tx, tile.ty);
    world.damage(tile.tx, tile.ty, m.kind === 'vampire' ? VAMPIRE_WALL_DAMAGE : m.kind === 'brute' ? BRUTE_WALL_DAMAGE : ZOMBIE_WALL_DAMAGE);
    m.attacks++;
    m.nextAttackAt = world.time + MONSTERS[m.kind].cooldown;
    this.hooks.event({ t: 'chips', tx: tile.tx, ty: tile.ty, chip: STONY.has(tileKind) ? 'stone' : 'wood', health: world.health(tile.tx, tile.ty) });
    if (tileKind === 'palisade') {
      m.hp -= PALISADE_THORNS;
      m.hurts++;
      if (m.hp <= 0) {
        this.die(m, m.facing + Math.PI);
        return;
      }
    }
    if (world.structureHp(tile.tx, tile.ty) === null) {
      m.repathAt = 0;
    }
  }

  /**
   * Vampires and demons: only through the dark (see the class comment). A
   * hunting demon also steps through the shadows behind its target now
   * and then.
   */
  private stepVampire(m: Monster, dt: number, world: World, prey: P[]): void {
    const def = MONSTERS[m.kind];
    const here = tileOf(m);
    const inLight = this.isLit(here.tx, here.ty);
    const p = inLight ? null : this.perceive(m, prey, world);
    if (p && this.inReach(m, p, world)) {
      this.attack(m, p, world);
      return;
    }
    if (p && m.kind === 'demon' && distance(m, p) <= def.range! && world.time >= m.nextAttackAt) {
      this.attack(m, p, world);
      return;
    }
    if (p && m.kind === 'demon' && world.time >= m.blinkAt && distance(m, p) > DEMON_BLINK_MIN && this.shadowStep(m, p, world)) {
      return;
    }
    const goal = p ?? (this.remembered(m, world) ? { x: m.lastSeenX, y: m.lastSeenY } : null);
    this.setHunting(m, inLight || goal !== null);
    if (!inLight && !goal) {
      this.prowl(m, dt, world);
      return;
    }
    const walkable = this.walkable(world);
    const dark = (tx: number, ty: number): boolean => walkable(tx, ty) && !this.isLit(tx, ty);
    const step = (ok: (tx: number, ty: number) => boolean) => (tx: number, ty: number, fx: number, fy: number): number =>
      (ok(tx, ty) && world.map.canStep(fx, fy, tx, ty) ? (world.map.get(tx, ty) === 'tree' ? 1 / MONSTER_TREE_SLOW : 1) : Infinity);
    if (world.time >= m.repathAt) {
      m.repathAt = world.time + VAMPIRE_REPATH;
      const smash = (tx: number, ty: number, fx: number, fy: number): number =>
        (VAMPIRE_SMASHES.has(world.map.get(tx, ty)) && !this.isLit(tx, ty) && world.map.canStep(fx, fy, tx, ty)
          ? 1 + (world.structureHp(tx, ty) ?? 0) * 0.3
          : step(dark)(tx, ty, fx, fy));
      m.path = inLight || !goal
        ? findPath({ from: here, cost: step(walkable), open: walkable, accept: dark }) ?? []
        : findPath({
          from: here,
          to: tileOf(goal),
          cost: smash,
          open: dark,
          score: (tx: number, ty: number): number => Math.hypot(tx + 0.5 - goal.x, ty + 0.5 - goal.y),
        }) ?? [];
    }
    this.skipReached(m);
    const next = m.path[0];
    if (next && VAMPIRE_SMASHES.has(world.map.get(next.tx, next.ty))) {
      this.chew(m, next, dt, world);
    } else if (next) {
      this.moveToward(m, next.tx + 0.5, next.ty + 0.5, def.speed * dt, world);
    } else if (p) {
      const pt = tileOf(p);
      if (pt.tx === here.tx && pt.ty === here.ty) {
        this.moveToward(m, p.x, p.y, def.speed * dt, world);
      }
    } else if (!inLight && Math.hypot(m.lastSeenX - m.x, m.lastSeenY - m.y) < 1.2) {
      this.giveUp(m, world);
    }
  }

  private stepGhost(m: Monster, dt: number, world: World, present: P[], prey: P[]): void {
    const speed = MONSTERS.ghost.speed;
    m.draining = false;
    const target = prey.reduce<{ p: P; d: number } | null>((best, p) => {
      const d = distance(m, p);
      return d < GHOST_SHOT_RANGE && (!best || d < best.d) ? { p, d } : best;
    }, null);
    const sight = m.hunting ? GHOST_FORGET : MONSTERS.ghost.sight;
    const quarry = prey.reduce<{ p: P; d: number } | null>((best, p) => {
      const d = distance(m, p);
      return d < sight && (!best || d < best.d) ? { p, d } : best;
    }, null);
    m.hunting = quarry !== null;
    if (target && world.time >= m.nextAttackAt) {
      m.nextAttackAt = world.time + GHOST_SHOT_COOLDOWN * (0.75 + Math.random() * 0.5);
      m.attacks++;
      m.facing = Math.atan2(target.p.y - m.y, target.p.x - m.x);
      this.hooks.shoot(m.x, m.y, m.facing, { kind: 'ecto', damage: GHOST_SHOT_DAMAGE, speed: GHOST_SHOT_SPEED, reach: GHOST_SHOT_REACH, by: 'Ghost' });
    }
    const bells = world.bells();
    for (const bell of bells) {
      const d = Math.hypot(m.x - bell.x, m.y - bell.y);
      if (d < bell.radius) {
        m.drainTime = 0;
        m.scaredUntil = world.time + GHOST_SCARE_TIME;
        m.scaredFromX = bell.x;
        m.scaredFromY = bell.y;
        if (d > 0) {
          m.x = bell.x + ((m.x - bell.x) / d) * bell.radius;
          m.y = bell.y + ((m.y - bell.y) / d) * bell.radius;
        }
        return;
      }
    }
    if (world.time < m.scaredUntil) {
      const dx = m.x - m.scaredFromX;
      const dy = m.y - m.scaredFromY;
      const d = Math.hypot(dx, dy) || 1;
      this.drift(m, m.x + (dx / d), m.y + (dy / d), speed * 1.5 * dt);
      return;
    }
    if (quarry) {
      m.drainTime = 0;
      const { p, d } = quarry;
      const sway = Math.sin(world.time * 1.7 + m.id) * 1.4;
      const hold = d > 0 ? GHOST_KEEP / d : 0;
      const gx = p.x + (m.x - p.x) * hold;
      const gy = p.y + (m.y - p.y) * hold;
      if (Math.abs(d - GHOST_KEEP) > 0.4) {
        this.drift(m, gx - ((p.y - m.y) / (d || 1)) * sway, gy + ((p.x - m.x) / (d || 1)) * sway, speed * (d > GHOST_KEEP ? 1.1 : 0.6) * dt);
      }
      m.facing = Math.atan2(p.y - m.y, p.x - m.x);
      return;
    }
    let light: ActiveLight | null = null;
    let best = Infinity;
    for (const l of this.lights) {
      const d = Math.hypot(l.tx + 0.5 - m.x, l.ty + 0.5 - m.y);
      if (l.structure && d < best && !bells.some((b): boolean => Math.hypot(l.tx + 0.5 - b.x, l.ty + 0.5 - b.y) < b.radius)) {
        best = d;
        light = l;
      }
    }
    if (!light) {
      m.drainTime = 0;
      if (world.time >= m.wanderUntil || Math.hypot(m.wanderX - m.x, m.wanderY - m.y) < 0.2) {
        m.wanderUntil = world.time + 4 + Math.random() * 4;
        m.wanderX = Math.min(MAP_WIDTH - 1, Math.max(1, m.x + (Math.random() * 2 - 1) * WANDER_RANGE));
        m.wanderY = Math.min(MAP_HEIGHT - 1, Math.max(1, m.y + (Math.random() * 2 - 1) * WANDER_RANGE));
      }
      const dx = m.wanderX - m.x;
      const dy = m.wanderY - m.y;
      const d = Math.hypot(dx, dy) || 1;
      const sway = Math.sin(world.time * 1.3 + m.id) * 1.2;
      this.drift(m, m.wanderX - (dy / d) * sway, m.wanderY + (dx / d) * sway, speed * 0.5 * dt);
      return;
    }
    const lx = light.tx + 0.5;
    const ly = light.ty + 0.5;
    const guarded = present.some((p: P): boolean => Math.hypot(p.x - lx, p.y - ly) <= light.radius);
    if (best <= light.radius && guarded) {
      m.scaredUntil = world.time + GHOST_SCARE_TIME;
      m.scaredFromX = lx;
      m.scaredFromY = ly;
      m.drainTime = 0;
      return;
    }
    if (best > GHOST_HOVER) {
      m.drainTime = 0;
      const sway = best > 2 ? Math.sin(world.time * 1.3 + m.id) * 0.8 : 0;
      this.drift(m, lx - ((ly - m.y) / best) * sway, ly + ((lx - m.x) / best) * sway, speed * dt);
      return;
    }
    m.draining = true;
    m.drainTime += dt;
    if (m.drainTime >= GHOST_SNUFF_TIME) {
      m.drainTime = 0;
      world.snuff(light.tx, light.ty);
      this.hooks.event({ t: 'snuff', tx: light.tx, ty: light.ty });
    }
  }

  /**
   * Idle zombie: picks a tile a few steps off (or, if it's lured, a hot spot
   * for players or graves) and shambles there along a path at its own pace,
   * weaving a little, stops to sway in place for a few seconds once there,
   * trips and recovers now and then, and picks somewhere else if it gets
   * stuck.
   */
  private shamble(m: Monster, dt: number, world: World): void {
    const time = world.time;
    this.skipReached(m);
    if (!m.wanderIdle && m.path.length === 0) {
      m.wanderIdle = true;
      m.wanderUntil = time + 1.5 + Math.random() * 3;
      m.facing += (Math.random() - 0.5) * 1.5;
    }
    if (m.wanderIdle) {
      if (time < m.wanderUntil) {
        return;
      }
      m.path = this.wanderPath(m, world);
      m.bumping = 0;
      m.wanderIdle = m.path.length === 0;
      m.wanderUntil = time + 1;
      return;
    }
    if (Math.random() < STUMBLE_RATE * dt) {
      const angle = m.facing + (Math.random() - 0.5) * 1.4;
      m.stumbles++;
      m.knockX = Math.cos(angle) * STUMBLE_SPEED;
      m.knockY = Math.sin(angle) * STUMBLE_SPEED;
      m.knockUntil = time + STUMBLE_TIME;
      m.wanderUntil = time + 0.8 + Math.random() * 1.2;
      m.wanderIdle = true;
      return;
    }
    const next = m.path[0];
    const heading = Math.atan2(next.ty + 0.5 - m.y, next.tx + 0.5 - m.x);
    const weave = heading + Math.sin(time * 2.6 + m.id) * SHAMBLE_WEAVE;
    const step = MONSTERS[m.kind].speed * SHAMBLE_PACE * m.pace * dt;
    const fromX = m.x;
    const fromY = m.y;
    this.moveToward(m, m.x + Math.cos(weave), m.y + Math.sin(weave), step, world);
    m.facing = heading;
    m.bumping = Math.hypot(m.x - fromX, m.y - fromY) < step * 0.3 ? m.bumping + dt : 0;
    if (m.bumping > BUMP_GIVE_UP) {
      m.path = [];
    }
  }

  /**
   * Where an idle zombie heads next: a path to a random open tile a few
   * steps away, or for a lured zombie (most of the time) to the hottest of
   * a handful of spots for its lure. Empty if nothing could be found.
   */
  private wanderPath(m: Monster, world: World): Step[] {
    const open = this.walkable(world);
    const here = tileOf(m);
    const lured = m.lure !== null && Math.random() < LURE_CHANCE;
    const heat = m.lure === 'players' ? this.playerHeat : this.graveHeat;
    let goal: Step | null = null;
    let best = -Infinity;
    for (let tries = 0; tries < (lured ? LURE_TRIES : 6); tries++) {
      const angle = Math.random() * Math.PI * 2;
      const reach = lured ? 2 + Math.random() * (LURE_REACH - 2) : SHAMBLE_REACH[0] + Math.random() * (SHAMBLE_REACH[1] - SHAMBLE_REACH[0]);
      const to = { tx: Math.floor(m.x + Math.cos(angle) * reach), ty: Math.floor(m.y + Math.sin(angle) * reach) };
      if (to.tx <= 0 || to.ty <= 0 || to.tx >= MAP_WIDTH - 1 || to.ty >= MAP_HEIGHT - 1 || !open(to.tx, to.ty) || isTrap(world.map.get(to.tx, to.ty))) {
        continue;
      }
      const score = lured ? heat[to.ty * MAP_WIDTH + to.tx] + Math.random() * 1e-3 : 0;
      if (score > best) {
        best = score;
        goal = to;
        if (!lured) {
          break;
        }
      }
    }
    if (!goal || (goal.tx === here.tx && goal.ty === here.ty)) {
      return [];
    }
    const target = goal;
    return findPath({
      from: here,
      to: target,
      cost: (tx: number, ty: number, fx: number, fy: number): number => {
        const tile = world.map.get(tx, ty);
        if (!open(tx, ty) || isTrap(tile) || !world.map.canStep(fx, fy, tx, ty)) {
          return Infinity;
        }
        return tile === 'tree' ? 1 / MONSTER_TREE_SLOW : 1;
      },
      open,
      score: (tx: number, ty: number): number => Math.hypot(tx - target.tx, ty - target.ty),
    }) ?? [];
  }

  /**
   * Fades the heat players leave where they've been and adds this tick's,
   * spread a little around each, and every so often recounts the graves
   * around each tile.
   */
  private updateHeat(dt: number, world: World, present: P[]): void {
    const fade = Math.exp(-dt / PLAYER_HEAT_MEMORY);
    const heat = this.playerHeat;
    for (let i = 0; i < heat.length; i++) {
      heat[i] *= fade;
    }
    for (const p of present) {
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const x = px + dx;
          const y = py + dy;
          if (x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT) {
            heat[y * MAP_WIDTH + x] += dt / (1 + dx * dx + dy * dy);
          }
        }
      }
    }
    if (world.time - this.graveHeatAt < GRAVE_HEAT_REFRESH && world.time >= this.graveHeatAt) {
      return;
    }
    this.graveHeatAt = world.time;
    this.graveHeat.fill(0);
    const r = GRAVE_HEAT_RADIUS;
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        const tile = world.map.get(tx, ty);
        if (!GRAVE_TILES.has(tile) && tile !== 'mound') {
          continue;
        }
        for (let y = Math.max(0, ty - r); y <= Math.min(MAP_HEIGHT - 1, ty + r); y++) {
          for (let x = Math.max(0, tx - r); x <= Math.min(MAP_WIDTH - 1, tx + r); x++) {
            const d = Math.hypot(x - tx, y - ty);
            if (d <= r) {
              this.graveHeat[y * MAP_WIDTH + x] += 1 - d / (r + 1);
            }
          }
        }
      }
    }
  }

  /**
   * Idle vampire: slips from one dark spot to another a few tiles away,
   * pausing in between to look around. Never steps into light.
   */
  private prowl(m: Monster, dt: number, world: World): void {
    const time = world.time;
    this.skipReached(m);
    if (m.path.length === 0 && time >= m.wanderUntil) {
      if (Math.random() < 0.4) {
        m.wanderUntil = time + 1 + Math.random() * 2.5;
        m.facing += (Math.random() - 0.5) * 2;
      } else {
        const walkable = this.walkable(world);
        const dark = (tx: number, ty: number): boolean => walkable(tx, ty) && !this.isLit(tx, ty);
        for (let tries = 0; tries < 12 && m.path.length === 0; tries++) {
          const angle = Math.random() * Math.PI * 2;
          const reach = 4 + Math.random() * 5;
          const to = { tx: Math.floor(m.x + Math.cos(angle) * reach), ty: Math.floor(m.y + Math.sin(angle) * reach) };
          if (to.tx > 0 && to.ty > 0 && to.tx < MAP_WIDTH - 1 && to.ty < MAP_HEIGHT - 1 && dark(to.tx, to.ty)) {
            m.path = findPath({
              from: tileOf(m),
              to,
              cost: (tx: number, ty: number, fx: number, fy: number): number => (dark(tx, ty) && world.map.canStep(fx, fy, tx, ty) ? 1 : Infinity),
              open: dark,
            }) ?? [];
          }
        }
        m.wanderUntil = time + 0.5;
      }
    }
    const next = m.path[0];
    if (next) {
      this.moveToward(m, next.tx + 0.5, next.ty + 0.5, MONSTERS[m.kind].speed * PROWL_PACE * dt, world);
    }
  }

  /**
   * Works out who each monster can see this tick, searching around each
   * player: only monsters within SIGHT_SEARCH tiles are checked, and only
   * those close enough (NEAR_SIGHT any way, or their sight in front of
   * them) get a line of sight traced.
   */
  private look(world: World, prey: P[]): void {
    this.sightings.clear();
    for (const p of prey) {
      for (const m of this.monsters.values()) {
        if (m.kind === 'ghost' || Math.abs(m.x - p.x) > SIGHT_SEARCH || Math.abs(m.y - p.y) > SIGHT_SEARCH) {
          continue;
        }
        const d = distance(m, p);
        if (d > SIGHT_SEARCH) {
          continue;
        }
        const angle = Math.atan2(p.y - m.y, p.x - m.x);
        const ahead = Math.abs(Math.atan2(Math.sin(angle - m.facing), Math.cos(angle - m.facing))) <= SIGHT_CONE;
        if ((d <= NEAR_SIGHT || (ahead && d <= MONSTERS[m.kind].sight)) && this.canSee(world, m.x, m.y, p.x, p.y)) {
          const seen = this.sightings.get(m.id);
          if (seen) {
            seen.push(p);
          } else {
            this.sightings.set(m.id, [p]);
          }
        }
      }
    }
  }

  /**
   * The closest player the monster can see this tick (see `look`), or
   * null. Seeing someone refreshes where the monster last saw them.
   */
  private perceive(m: Monster, prey: P[], world: World): P | null {
    let best: P | null = null;
    let bestDist = Infinity;
    for (const p of this.sightings.get(m.id) ?? []) {
      const d = distance(m, p);
      if (d < bestDist && prey.includes(p)) {
        best = p;
        bestDist = d;
      }
    }
    if (best) {
      m.lastSeenX = best.x;
      m.lastSeenY = best.y;
      m.lastSeenAt = world.time;
    }
    return best;
  }

  /**
   * Whether nothing tall stands between two points (the tiles at either
   * end don't count, so a scarecrow or a player in a doorway can be seen).
   */
  private canSee(world: World, x0: number, y0: number, x1: number, y1: number): boolean {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.25);
    const sx = Math.floor(x0);
    const sy = Math.floor(y0);
    const ex = Math.floor(x1);
    const ey = Math.floor(y1);
    for (let i = 1; i < steps; i++) {
      const tx = Math.floor(x0 + ((x1 - x0) * i) / steps);
      const ty = Math.floor(y0 + ((y1 - y0) * i) / steps);
      if ((tx !== sx || ty !== sy) && (tx !== ex || ty !== ey) && OPAQUE.has(world.map.get(tx, ty))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Where the monster last saw (or was hit by) someone, while it still
   * remembers.
   */
  private remembered(m: Monster, world: World): Step | null {
    return world.time - m.lastSeenAt <= MONSTERS[m.kind].memory ? tileOf({ x: m.lastSeenX, y: m.lastSeenY }) : null;
  }

  /**
   * Reached the last place it saw someone and found nobody: forgets them
   * and looks around for a moment before wandering off.
   */
  private giveUp(m: Monster, world: World): void {
    m.lastSeenAt = -Infinity;
    m.wanderIdle = true;
    m.wanderUntil = world.time + 1.5 + Math.random() * 2;
    m.facing += (Math.random() - 0.5) * 2.5;
  }

  /**
   * Switching between hunting and wandering drops the old path.
   */
  private setHunting(m: Monster, hunting: boolean): void {
    if (m.hunting !== hunting) {
      m.hunting = hunting;
      m.path = [];
      m.repathAt = 0;
      m.wanderUntil = 0;
    }
  }

  /**
   * Whether a player is close enough to attack, and not too far above or
   * below (up on a platform, say).
   */
  private inReach(m: Monster, p: P, world: World): boolean {
    const rise = world.map.elevationAt(p.x, p.y) - world.map.elevationAt(m.x, m.y);
    return distance(m, p) <= MONSTERS[m.kind].reach && rise <= MELEE_REACH_UP && -rise <= MELEE_REACH_DOWN;
  }

  private attack(m: Monster, p: P, world: World): void {
    const def = MONSTERS[m.kind];
    m.facing = Math.atan2(p.y - m.y, p.x - m.x);
    m.path = [];
    m.repathAt = 0;
    if (world.time < m.nextAttackAt) {
      return;
    }
    m.nextAttackAt = world.time + def.cooldown;
    m.attacks++;
    m.strikeAt = world.time + def.windup;
    m.prey = p;
  }

  /**
   * A witch caught up close winds up a swipe of her broom.
   */
  private swipe(m: Monster, p: P, world: World): void {
    m.facing = Math.atan2(p.y - m.y, p.x - m.x);
    m.path = [];
    m.repathAt = 0;
    m.swipeAt = world.time + WITCH_SWIPE.cooldown;
    m.swipes++;
    m.swiping = true;
    m.strikeAt = world.time + WITCH_SWIPE.windup;
    m.prey = p;
  }

  /**
   * A ghoul that can't pounce yet runs circles around its prey, a few
   * tiles out, now and then switching direction (or when it bumps into
   * something).
   */
  private circle(m: Monster, p: P, dt: number, world: World): void {
    if (world.time >= m.orbitUntil || m.bumping > 0.3) {
      m.orbit = m.orbitUntil === 0 ? (Math.random() < 0.5 ? 1 : -1) : -m.orbit;
      m.orbitUntil = world.time + 1.5 + Math.random() * 2.5;
      m.bumping = 0;
    }
    const around = Math.atan2(m.y - p.y, m.x - p.x) + m.orbit * 0.8;
    const step = MONSTERS[m.kind].speed * dt;
    const fromX = m.x;
    const fromY = m.y;
    this.moveToward(m, p.x + Math.cos(around) * GHOUL_ORBIT, p.y + Math.sin(around) * GHOUL_ORBIT, step, world);
    m.bumping = Math.hypot(m.x - fromX, m.y - fromY) < step * 0.3 ? m.bumping + dt : 0;
  }

  /**
   * Holds still and keeps turning toward its target while an attack winds
   * up (until `lock` seconds before it lands, if it has one), then lets it
   * go.
   */
  private windUp(m: Monster, world: World, prey: P[]): void {
    const p = m.prey;
    const lock = MONSTERS[m.kind].lock ?? 0;
    if (p && !p.dead && (m.swiping || m.strikeAt! - world.time > lock)) {
      m.facing = Math.atan2(p.y - m.y, p.x - m.x);
    }
    if (world.time >= m.strikeAt!) {
      this.strike(m, prey, world);
    }
  }

  /**
   * An attack's windup is over: a melee hitbox lands on whoever is still in
   * reach and in front, an arrow or potion flies at its target (a potion
   * to where they stand now), or a ghoul leaps.
   */
  private strike(m: Monster, prey: P[], world: World): void {
    m.strikeAt = null;
    const def = MONSTERS[m.kind];
    const target = m.prey;
    m.prey = null;
    if (m.swiping) {
      m.swiping = false;
      for (const p of prey) {
        const angle = Math.atan2(p.y - m.y, p.x - m.x);
        const off = Math.abs(Math.atan2(Math.sin(angle - m.facing), Math.cos(angle - m.facing)));
        if (distance(m, p) <= WITCH_SWIPE.reach + STRIKE_SLACK && off <= WITCH_SWIPE.arc) {
          this.hooks.hurt(p, WITCH_SWIPE.damage * m.power, def.label, m.x, m.y, WITCH_SWIPE.knockback, WITCH_SWIPE.slow);
        }
      }
      return;
    }
    const style = ATTACK_STYLE[m.kind];
    if (style === 'melee') {
      for (const p of prey) {
        const rise = world.map.elevationAt(p.x, p.y) - world.map.elevationAt(m.x, m.y);
        const angle = Math.atan2(p.y - m.y, p.x - m.x);
        const off = Math.abs(Math.atan2(Math.sin(angle - m.facing), Math.cos(angle - m.facing)));
        if (distance(m, p) <= def.reach + STRIKE_SLACK && off <= def.arc && rise <= MELEE_REACH_UP && -rise <= MELEE_REACH_DOWN) {
          this.thorns(m, this.hooks.hurt(p, this.blow(m), def.label, m.x, m.y, def.knockback), p, world);
        }
      }
    } else if (style === 'arrow') {
      this.hooks.shoot(m.x, m.y, m.facing, { kind: 'arrow', damage: this.blow(m), speed: ARROW_SPEED, reach: def.range! + 1.5, by: def.label });
    } else if (style === 'potion') {
      const land = target ? Math.min(def.range! + 0.5, Math.max(1, distance(m, target))) : def.range!;
      this.hooks.shoot(m.x, m.y, m.facing, { kind: 'potion', damage: this.blow(m), speed: POTION_SPEED, reach: land, by: def.label, land });
    } else if (style === 'pounce') {
      m.leapUntil = world.time + GHOUL_LEAP_TIME;
      m.leapSpeed = GHOUL_LEAP / GHOUL_LEAP_TIME;
      m.leapHit = false;
    } else if (style === 'lunge') {
      const reach = target ? Math.min(DEMON_LUNGE, Math.max(0.6, distance(m, target) + 0.3)) : 1;
      m.leapUntil = world.time + DEMON_LUNGE_TIME;
      m.leapSpeed = reach / DEMON_LUNGE_TIME;
      m.leapHit = false;
    }
  }

  /**
   * A ghoul in mid-pounce or a demon mid-lunge: flies along its aim and
   * hits the first player it touches.
   */
  private leap(m: Monster, dt: number, world: World, prey: P[]): void {
    const step = m.leapSpeed * dt;
    Object.assign(m, moveWithCollision(this.blocked(world, m), m.x, m.y, Math.cos(m.facing) * step, Math.sin(m.facing) * step, MONSTER_RADIUS));
    m.moving = true;
    if (m.leapHit) {
      return;
    }
    const def = MONSTERS[m.kind];
    const p = prey.find((q: P): boolean => distance(m, q) <= def.reach);
    if (p) {
      m.leapHit = true;
      this.thorns(m, this.hooks.hurt(p, this.blow(m), def.label, m.x, m.y, def.knockback), p, world);
    }
  }

  /**
   * Bone armor bites back: a monster that hit someone wearing it takes
   * `amount`.
   */
  private thorns(m: Monster, amount: number, p: P, world: World): void {
    if (amount > 0 && this.monsters.has(m.id)) {
      this.hit(m.id, amount, p.x, p.y, world, 0);
    }
  }

  /**
   * A demon vanishes and steps out of a dark tile behind its target's back.
   * Returns false if there's no dark spot there to step into.
   */
  private shadowStep(m: Monster, p: P, world: World): boolean {
    m.blinkAt = world.time + DEMON_BLINK_EVERY * (0.67 + Math.random() * 0.67);
    const walkable = this.walkable(world);
    for (let tries = 0; tries < 10; tries++) {
      const angle = p.facing + Math.PI + (Math.random() - 0.5) * 1.6;
      const x = p.x + Math.cos(angle) * DEMON_BLINK_BEHIND * (0.85 + Math.random() * 0.3);
      const y = p.y + Math.sin(angle) * DEMON_BLINK_BEHIND * (0.85 + Math.random() * 0.3);
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (tx > 0 && ty > 0 && tx < MAP_WIDTH - 1 && ty < MAP_HEIGHT - 1 && walkable(tx, ty) && !this.isLit(tx, ty) && !this.blocked(world, { x, y })(tx, ty)) {
        this.hooks.event({ t: 'blink', fromX: m.x, fromY: m.y, x, y });
        m.x = x;
        m.y = y;
        m.facing = Math.atan2(p.y - y, p.x - x);
        m.path = [];
        m.repathAt = 0;
        m.blinks++;
        m.nextAttackAt = Math.max(m.nextAttackAt, world.time + 0.35);
        return true;
      }
    }
    return false;
  }

  /**
   * What one of a monster's hits does to a player, before armor.
   */
  private blow(m: Monster): number {
    const amount = (MONSTERS[m.kind].damage + (m.held ? ZOMBIE_ARMED_DAMAGE : 0)) * m.power;
    return m.kind === 'brute' ? Math.min(BRUTE_MAX_HIT, amount) : amount;
  }

  private skipReached(m: Monster): void {
    while (m.path.length > 0 && Math.hypot(m.path[0].tx + 0.5 - m.x, m.path[0].ty + 0.5 - m.y) < WAYPOINT_REACHED) {
      m.path.shift();
    }
  }

  private moveToward(m: Monster, x: number, y: number, step: number, world: World): void {
    const dx = x - m.x;
    const dy = y - m.y;
    const d = Math.hypot(dx, dy);
    if (d < 1e-4) {
      return;
    }
    const s = Math.min(step * (inTrunk(world.map, m.x, m.y) ? MONSTER_TREE_SLOW : 1) * this.drag(m, world), d);
    m.facing = Math.atan2(dy, dx);
    m.moving = true;
    Object.assign(m, moveWithCollision(this.blocked(world, m), m.x, m.y, (dx / d) * s, (dy / d) * s, MONSTER_RADIUS));
  }

  /**
   * How much the ground holds a walker back: barbed wire under it, and
   * the curse of any effigy close by.
   */
  private drag(m: Monster, world: World): number {
    let slow = world.map.get(Math.floor(m.x), Math.floor(m.y)) === 'barbed-wire' ? BARBED_SLOW : 1;
    if (this.effigies.some((e): boolean => Math.hypot(e.x - m.x, e.y - m.y) <= e.radius)) {
      slow *= EFFIGY_SLOW;
    }
    return slow;
  }

  /**
   * Soul cages pull in and destroy a ghost that drifts close enough, each
   * one every SOUL_CAGE_COOLDOWN seconds.
   */
  private catchGhosts(world: World): void {
    for (const { tx, ty } of world.structuresOf('soul-cage')) {
      const i = ty * MAP_WIDTH + tx;
      if (world.time < (this.cageReady.get(i) ?? 0)) {
        continue;
      }
      const reach = SOUL_CAGE_RADIUS + 0.5 * world.structureLevel(tx, ty);
      const ghost = [...this.monsters.values()].find((m: Monster): boolean => m.kind === 'ghost' && Math.hypot(m.x - (tx + 0.5), m.y - (ty + 0.5)) <= reach);
      if (ghost) {
        this.cageReady.set(i, world.time + SOUL_CAGE_COOLDOWN);
        this.die(ghost, Math.atan2(ty + 0.5 - ghost.y, tx + 0.5 - ghost.x));
      }
    }
  }

  /**
   * Ghost movement: straight through anything, kept on the map.
   */
  private drift(m: Monster, x: number, y: number, step: number): void {
    const dx = x - m.x;
    const dy = y - m.y;
    const d = Math.hypot(dx, dy);
    if (d < 1e-4) {
      return;
    }
    const s = Math.min(step, d);
    m.facing = Math.atan2(dy, dx);
    m.moving = true;
    m.x = Math.min(MAP_WIDTH - 0.5, Math.max(0.5, m.x + (dx / d) * s));
    m.y = Math.min(MAP_HEIGHT - 0.5, Math.max(0.5, m.y + (dy / d) * s));
  }

  /**
   * Nudges overlapping walkers apart so a crowd doesn't stack on one spot.
   */
  private separate(world: World): void {
    const walkers = [...this.monsters.values()].filter((m: Monster): boolean => m.kind !== 'ghost');
    for (let i = 0; i < walkers.length; i++) {
      for (let j = i + 1; j < walkers.length; j++) {
        const a = walkers[i];
        const b = walkers[j];
        const d = distance(a, b);
        if (d >= SEPARATION || d === 0) {
          continue;
        }
        const push = (SEPARATION - d) / 2;
        const nx = (b.x - a.x) / d;
        const ny = (b.y - a.y) / d;
        Object.assign(a, moveWithCollision(this.blocked(world, a), a.x, a.y, -nx * push, -ny * push, MONSTER_RADIUS));
        Object.assign(b, moveWithCollision(this.blocked(world, b), b.x, b.y, nx * push, ny * push, MONSTER_RADIUS));
      }
    }
  }

  /**
   * Trickle spawning, faster and with a higher cap during a blood moon:
   * one zombie or vampire every interval while under the per-player cap,
   * and ghosts on their own clock, one per few burning lights. With nobody
   * playing, a few zombies keep wandering so the screen stays alive, and
 * that many are out from the first tick.
   */
  private spawn(world: World, present: P[], blood: boolean): void {
    if (!this.spawning) {
      return;
    }
    const time = world.time;
    const ghosts = [...this.monsters.values()].filter((m: Monster): boolean => m.kind === 'ghost').length;
    const walkers = this.monsters.size - ghosts;

    const interval = (blood ? BLOOD_MOON_SPAWN_INTERVAL : SPAWN_INTERVAL) / spawnSpeedup(this.level);
    const idle = present.length === 0;
    const perPlayer = (blood ? BLOOD_MOON_MONSTERS_PER_PLAYER : MONSTERS_PER_PLAYER) + extraPerPlayer(this.level);
    const cap = idle ? IDLE_ZOMBIES : Math.min(MAX_MONSTERS, Math.round(BASE_MONSTERS + present.length * perPlayer));
    if (!this.started) {
      this.started = true;
      for (let i = walkers; i < IDLE_ZOMBIES; i++) {
        this.spawnAtEdge('zombie', world, present);
      }
      this.nextSpawnAt = time + interval;
    } else if (walkers >= cap) {
      this.nextSpawnAt = time + interval;
    } else if (time >= this.nextSpawnAt) {
      this.nextSpawnAt = time + interval;
      const weights = spawnWeights(this.level);
      const total = MONSTER_KINDS.reduce((sum: number, k: MonsterKind): number => sum + weights[k], 0);
      let roll = Math.random() * total;
      let kind = idle ? 'zombie' : MONSTER_KINDS.find((k: MonsterKind): boolean => (roll -= weights[k]) < 0) ?? 'zombie';
      if (kind === 'demon' && [...this.monsters.values()].filter((m: Monster): boolean => m.kind === 'demon').length >= MAX_DEMONS) {
        kind = 'zombie';
      }
      this.spawnAtEdge(kind, world, present);
    }

    const burning = this.lights.filter((l: ActiveLight): boolean => l.structure).length;
    const ghostCap = present.length > 0 ? Math.ceil(burning / (blood ? BLOOD_MOON_LIGHTS_PER_GHOST : LIGHTS_PER_GHOST)) : 0;
    if (ghosts >= ghostCap) {
      this.nextGhostAt = time + GHOST_SPAWN_INTERVAL;
    } else if (time >= this.nextGhostAt) {
      this.nextGhostAt = time + GHOST_SPAWN_INTERVAL;
      this.spawnAtEdge('ghost', world, present);
    }
  }

  /**
   * Places a monster on a dark, open tile near the map edge, well away from
   * every player. Gives up quietly if no spot turns up.
   */
  private spawnAtEdge(kind: MonsterKind, world: World, present: P[]): void {
    const walkable = this.walkable(world);
    for (let tries = 0; tries < 80; tries++) {
      const tx = Math.floor(Math.random() * MAP_WIDTH);
      const ty = Math.floor(Math.random() * MAP_HEIGHT);
      const nearEdge = tx < SPAWN_EDGE || ty < SPAWN_EDGE || tx >= MAP_WIDTH - SPAWN_EDGE || ty >= MAP_HEIGHT - SPAWN_EDGE;
      const x = tx + 0.5;
      const y = ty + 0.5;
      if (!nearEdge || !walkable(tx, ty) || isTrap(world.map.get(tx, ty)) || world.map.get(tx, ty) === 'tree' || this.isLit(tx, ty)) {
        continue;
      }
      if (present.some((p: P): boolean => Math.hypot(p.x - x, p.y - y) < SPAWN_MIN_DISTANCE)) {
        continue;
      }
      this.add(kind, x, y);
      return;
    }
  }

  /**
   * Puts a monster on a random open tile of the map's view (the whole map
   * unless it's the sandbox), as far as it can from everyone in `away`: at
   * least `SUMMON_CLEAR` if there's room, else the farthest spot there is
   * (the TV's Game tab).
   */
  summon(kind: MonsterKind, world: World, away: { x: number; y: number }[]): void {
    const walkable = this.walkable(world);
    const spots: { tx: number; ty: number; d: number }[] = [];
    for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
      for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
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
      this.add(kind, at.tx + 0.5, at.ty + 0.5);
    }
  }

  private add(kind: MonsterKind, x: number, y: number): void {
    const id = this.nextId++;
    const walker = isZombie(kind);
    const hp = MONSTERS[kind].hp * (kind === 'ghost' ? 1 : monsterHealth(this.level));
    this.monsters.set(id, {
      id,
      kind,
      x,
      y,
      facing: Math.random() * Math.PI * 2,
      moving: false,
      hurts: 0,
      attacks: 0,
      stumbles: 0,
      draining: false,
      hp,
      maxHp: hp,
      power: monsterDamage(this.level),
      strikeAt: null,
      prey: null,
      leapUntil: 0,
      leapHit: false,
      leapSpeed: 0,
      blinkAt: 0,
      blinks: 0,
      swiping: false,
      swipeAt: 0,
      swipes: 0,
      orbit: 1,
      orbitUntil: 0,
      held: walker && Math.random() < armedChance(this.level) ? JUNK_WEAPONS[Math.floor(Math.random() * JUNK_WEAPONS.length)] : null,
      armor: !walker || Math.random() >= armorChance(this.level) ? null : Math.random() < plateShare(this.level) ? 'plate' : 'helmet',
      path: [],
      repathAt: 0,
      nextAttackAt: 0,
      knockX: 0,
      knockY: 0,
      knockUntil: 0,
      drainTime: 0,
      scaredUntil: 0,
      scaredFromX: 0,
      scaredFromY: 0,
      wanderUntil: 0,
      wanderX: x,
      wanderY: y,
      wanderHeading: Math.random() * Math.PI * 2,
      wanderIdle: false,
      hunting: false,
      lure: !isShambler(kind) ? null : Math.random() < ZOMBIE_LURES.players ? 'players' : Math.random() < ZOMBIE_LURES.graves / (1 - ZOMBIE_LURES.players) ? 'graves' : null,
      bumping: 0,
      pace: 0.8 + Math.random() * 0.4,
      lastSeenX: x,
      lastSeenY: y,
      lastSeenAt: -Infinity,
    });
  }

  /**
   * Removes a monster that was killed; `angle` is the way the killing blow
   * pushed it, so the display can throw the pieces that way.
   */
  private die(m: Monster, angle: number): void {
    this.monsters.delete(m.id);
    this.hooks.event({ t: 'monster-death', x: m.x, y: m.y, kind: m.kind, angle, held: m.held, armor: m.armor });
  }

  /**
   * Marks tiles inside the bright part of any light, for vampires and
   * spawning.
   */
  private updateLit(world: World, players: P[]): void {
    this.lights = this.dark ? [] : world.activeLights();
    if (this.cursorLight) {
      this.lights.push({ tx: Math.floor(this.cursorLight.x), ty: Math.floor(this.cursorLight.y), radius: CURSOR_LIGHT.radius, structure: false });
    }
    for (const p of players) {
      if (p.light > 0 && !p.dead && !this.dark) {
        this.lights.push({ tx: Math.floor(p.x), ty: Math.floor(p.y), radius: p.light, structure: false });
      }
    }
    this.lit.fill(0);
    for (const l of this.lights) {
      const r = l.radius * LIT_FRACTION;
      for (let ty = Math.max(0, Math.floor(l.ty - r)); ty <= Math.min(MAP_HEIGHT - 1, Math.ceil(l.ty + r)); ty++) {
        for (let tx = Math.max(0, Math.floor(l.tx - r)); tx <= Math.min(MAP_WIDTH - 1, Math.ceil(l.tx + r)); tx++) {
          if (Math.hypot(tx - l.tx, ty - l.ty) <= r) {
            this.lit[ty * MAP_WIDTH + tx] = 1;
          }
        }
      }
    }
  }

  private isLit(tx: number, ty: number): boolean {
    return this.lit[ty * MAP_WIDTH + tx] === 1;
  }

  /**
   * Tiles a monster at `m` can't walk into: anything solid, doors, and
   * ground more than a step above it.
   */
  private blocked(world: World, m: { x: number; y: number }): Blocked {
    return walkerBlocked(world.map, m.x, m.y, MONSTER_RADIUS, (tx: number, ty: number): boolean => world.map.get(tx, ty) === 'door');
  }

  /**
   * Tiles monsters may path through at all (heights are checked per step).
   */
  private walkable(world: World): (tx: number, ty: number) => boolean {
    return (tx: number, ty: number): boolean => (!world.map.isSolid(tx, ty) || PASSABLE.has(world.map.get(tx, ty))) && world.map.get(tx, ty) !== 'door';
  }
}
