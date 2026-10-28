// Packages
import { randomBytes, randomUUID } from 'node:crypto';
import {
  BAG_SLOTS,
  BLOCK_SLOW,
  BOLT_SPEED,
  BUILD_STACK,
  RECIPES,
  GEAR,
  GEAR_KINDS,
  GEAR_SLOTS,
  LOOT_MIN_WEAR,
  MONSTER_LOOT_CHANCE,
  PUMPKIN_LOOT_CHANCE,
  bagCount,
  damageTo,
  canAfford,
  isBuildItem,
  isGearItem,
  isMaterialItem,
  itemKey,
  itemLabel,
  recipeCost,
  ammoMade,
  twoHanded,
} from '@halloween/shared/gear';
import {
  DIG_BLUEPRINT_CHANCE,
  ROB_BLUEPRINT_CHANCE,
  ROB_CANDY,
  ROB_GEAR_CHANCE,
  DIG_BONES,
  DIG_BONE_CHANCE,
  DIG_CANDY,
  DIG_WOOD,
  DIG_WOOD_CHANCE,
  DROP_AMOUNT,
  GATHERABLE,
  GOODS,
  GRAVE_TILES,
  MATERIALS,
  MATERIAL_STACK,
  MONSTER_BLOOD,
  MONSTER_BONES,
  RESOURCES,
  stock,
} from '@halloween/shared/items';
import { ARMOR_SCRAP, WORLD_LEVEL_BOOST_MAX, WORLD_LEVEL_FALL, WORLD_LEVEL_RISE, monsterReward, playerLevel, worldLevelTarget } from '@halloween/shared/levels';
import {
  CAMPFIRE_HEAL_PER_SECOND,
  CAMPFIRE_HEAL_RADIUS,
  BOLT_RANGE_PER_LEVEL,
  DEATH_TOLL,
  FEAST_HEAL_PER_SECOND,
  FRESH_WOUND_SECONDS,
  FALL_DAMAGE,
  FALL_MIN,
  HIGH_GROUND,
  HIGH_GROUND_BONUS,
  KNOCKBACK_DISTANCE,
  KNOCKBACK_TIME,
  MAX_HP,
  MAX_NAME_LENGTH,
  MELEE_REACH_DOWN,
  MELEE_REACH_UP,
  MAX_PLAYERS,
  PLAYER_COLORS,
  PLAYER_RADIUS,
  TREE_SLOW,
  PANIC_RANGE,
  PANIC_RETURN_SECONDS,
  PANIC_SECONDS,
  PLAYER_SPEED,
  RESPAWN_DELAY,
  SPAWN_PROTECTION,
  SPIKE_DAMAGE_PER_SECOND,
  STRIKE_DELAY,
  TONIC_HEAL,
} from '@halloween/shared/players';
import {
  ALTAR_HP_COST,
  ALTAR_RADIUS,
  BARBED_PLAYER_SLOW,
  BUILDABLE_FLOORS,
  MIRROR_RADIUS,
  RAISED,
  STRUCTURES,
  SENTRY_COOLDOWN,
  SENTRY_MAX_SHOTS,
  SENTRY_RANGE,
  SENTRY_SHOTS_PER_BLOOD,
  STRUCTURE_KINDS,
  SWING_DAMAGE,
  TRAP_DAMAGE,
  WORKING_GLOW,
  isStructure,
  isTrap,
} from '@halloween/shared/structures';
import {
  BLUEPRINTS,
  RESEARCH_RADIUS,
  TREE,
  TREE_NODE,
  altarBlood,
  gearGuard,
  gearWear,
  itemNames,
  levelOf,
  lightRadius,
  nodeUnlocked,
  recipeUnlocked,
  sentryDamage,
  spikeDamage,
  upgradeCost,
  weaponStats,
} from '@halloween/shared/tree';
import {
  BLOOD_MOON_CALM,
  BLOOD_MOON_CALM_SPREAD,
  BLOOD_MOON_DURATION,
  isMonsterKind,
  GHOST_SHOT_DAMAGE,
  GHOST_SHOT_REACH,
  GHOST_SHOT_SPEED,
  GHOST_SLOW,
  GHOST_SLOW_SECONDS,
  MONSTER_RADIUS,
  PUDDLE_DAMAGE,
  PUDDLE_SECONDS,
  SPLASH_RADIUS,
} from '@halloween/shared/monsters';
import { DEFAULT_GAME_SETTINGS, SPAWN_KINDS } from '@halloween/shared/protocol';
import {
  LEVEL_HEIGHT,
  MAP_HEIGHT,
  MAP_WIDTH,
  facingTile,
  placeTile,
  inTrunk,
  isSolidTile,
} from '@halloween/shared/world';

// Local Imports
import { moveWithCollision, walkerBlocked } from './collision';
import { findPath } from './pathing';
import { DEFAULT_PRESET, loadPreset } from './world-store';
import { Horde } from './horde';
import type { HostileShot } from './horde';
import { TestPlayer } from './test-player';
import { World } from './world';

// Types
import type { PhoneSound } from '@halloween/shared/audio';
import type {
  BagItem,
  Gear,
  GearItem,
  GearKind,
  GearSlot,
  ItemKey,
  RecipeId,
  WeaponStats,
} from '@halloween/shared/gear';
import type {
  Bundle,
  Goods,
  Inventory,
  Material,
  Resource,
} from '@halloween/shared/items';
import type { MapGenSettings } from '@halloween/shared/map-gen';
import type { MonsterKind } from '@halloween/shared/monsters';
import type {
  GameEvent,
  GameSettings,
  LiftTarget,
  MonsterState,
  PlayerIdentity,
  PlayerState,
  PuddleState,
  ShotState,
  SpawnKind,
  Vitals,
} from '@halloween/shared/protocol';
import type { Tile } from '@halloween/shared/world';
import type { StructureKind } from '@halloween/shared/structures';
import type { NodeId, TreeNode, TreeState } from '@halloween/shared/tree';
import type { BotHands } from './test-player';
import type { Step } from './pathing';
import type { WorldSave } from './world-store';

/**
 * Server-side player: public state plus the secret token, live input, what
 * they carry, and combat timers (all in game-clock seconds).
 */
interface Player extends Omit<PlayerState, 'wounded' | 'slowed'> {
  token: string;
  inputX: number;
  inputY: number;
  actionHeld: boolean;

  /**
   * The phone's Block button is held; they actually block (`blocking`)
   * while it is and they have a shield up beside a one-handed weapon.
   */
  blockHeld: boolean;
  aimX: number;
  aimY: number;
  nextActionAt: number;

  /**
   * When the swing in progress lands, or null between swings.
   */
  strikeAt: number | null;
  inventory: Inventory;
  bag: Gear;
  light: number;
  reach: ItemKey | null;

  /**
   * The bag slot whose structures are being placed, or null.
   */
  buildSlot: number | null;

  /**
   * Whether they stand by a research table, so the phone can upgrade.
   */
  research: boolean;

  /**
   * Their own skill tree, kept through death (not saved).
   */
  tree: TreeState;
  disconnectedAt: number | null;

  /**
   * Seconds their phone has been connected, toward their hidden level
   * (kept when they leave, like the tree).
   */
  onlineSeconds: number;

  /**
   * Recent damage (when, how much), which healing can't touch until it's
   * FRESH_WOUND_SECONDS old, and health still to come back from kills.
   */
  wounds: { at: number; amount: number }[];
  feast: number;
  protectedUntil: number;
  aliveSince: number;
  respawnAt: number;
  killedBy: string;
  knockX: number;
  knockY: number;
  knockUntil: number;

  /**
   * Running from monsters after the phone's Panic button: until when, and
   * the spot to walk back to afterwards.
   */
  panic: { until: number; homeX: number; homeY: number; path: Step[]; planAt: number } | null;

  /**
   * Until when a ghost's ectoplasm slows them down.
   */
  slowUntil: number;

  /**
   * Held up by the TV's mouse: frozen in place until dropped.
   */
  lifted: boolean;
  vitalsKey: string;
}

/**
 * Seconds a lift lasts without word from the TV's mouse before whatever it
 * holds is dropped where it is (the TV closed mid-drag).
 */
const LIFT_TIMEOUT = 1.5;

/**
 * A panicking player replans this often (seconds), and counts a tile this
 * many tiles from the nearest monster as safe enough.
 */
const PANIC_REPLAN = 0.4;
const PANIC_SAFE = 7;

/**
 * A bolt or gob of blood in flight: tiles of range left, and who shot it
 * (nobody for a sentry's, which never hit players).
 */
interface Shot extends ShotState {
  left: number;

  /**
   * How high it flies; it stops at ground rising above this.
   */
  height: number;
  owner: Player | null;
  damage: number;
  knockback: number;

  /**
   * Tiles per second, and whether it's a monster's (it hits players and
   * flies through monsters).
   */
  speed: number;
  hostile: boolean;

  /**
   * The weapon that fired it, for what it does to each monster (null for
   * a monster's shot).
   */
  weapon: GearKind | null;

  /**
   * A monster's shot: whose it is for the kill feed, and for a potion,
   * how far it flies before bursting (it hits nothing on the way).
   */
  by: string;
  land?: number;
}

/**
 * What a phone shows of its own player's belongings, their skill tree,
 * and whether they're close enough to a research table to upgrade it.
 */
export interface Carried {
  inventory: Inventory;
  gear: Gear;
  tree: TreeState;
  research: boolean;
}

/**
 * Result of a join attempt.
 */
type JoinResult = { ok: true; identity: PlayerIdentity } | { ok: false; error: string };

/**
 * Share of a player/monster overlap that moves the monster (the player
 * moves the rest), so players can shove zombies around.
 */
const MONSTER_SHOVE_SHARE = 0.8;

/**
 * Structures that throw stone chips when hit.
 */
const STONE_STRUCTURES: ReadonlySet<Tile> = new Set<Tile>(['stone-wall', 'furnace', 'altar', 'bloodforge', 'bone-wall', 'cauldron']);


/**
 * What a chest holds besides one piece of gear: a random amount of each
 * resource up to these, bolts only sometimes.
 */
const CHEST_WOOD = 6;
const CHEST_CANDY = 5;
const CHEST_BOLTS = 9;
const CHEST_BOLT_CHANCE = 0.5;

/**
 * Bolts move this far (tiles) per collision check, at this height above
 * the shooter's feet.
 */
const SHOT_STEP = 0.2;
const BOLT_HEIGHT = 0.55;

function emptyInventory(): Inventory {
  return { candy: 0, blood: 0 };
}

const NO_TREE: TreeState = { found: [], levels: {} };

function emptyGear(): Gear {
  return { equipped: { weapon: null, offhand: null, armor: null }, bag: Array.from({ length: BAG_SLOTS }, (): null => null) };
}

/**
 * A random, partly worn piece of gear, rarer kinds less often.
 */
function randomLoot(tree: TreeState): GearItem {
  const total = GEAR_KINDS.reduce((sum: number, k: GearKind): number => sum + GEAR[k].loot, 0);
  let roll = Math.random() * total;
  const kind = GEAR_KINDS.find((k: GearKind): boolean => (roll -= GEAR[k].loot) < 0) ?? GEAR_KINDS[0];
  return { kind, wear: Math.ceil(gearWear(kind, tree) * (LOOT_MIN_WEAR + Math.random() * (1 - LOOT_MIN_WEAR))) };
}

/**
 * A brand-new piece of gear or a single structure, as a recipe makes it.
 */
function freshItem(recipe: Exclude<RecipeId, 'bolts' | 'arrows'>, tree: TreeState): BagItem {
  const [kind, what] = recipe.split(':');
  if (kind === 'gear') {
    const gear = what as GearItem['kind'];
    return { kind: gear, wear: gearWear(gear, tree) };
  }
  return { build: what as StructureKind, count: 1 };
}

/**
 * Whether a player's hitbox at (x, y) overlaps tile (tx, ty).
 */
function overlapsTile(x: number, y: number, tx: number, ty: number): boolean {
  return x + PLAYER_RADIUS > tx && x - PLAYER_RADIUS < tx + 1 && y + PLAYER_RADIUS > ty && y - PLAYER_RADIUS < ty + 1;
}

/**
 * Most of one thing a single Craft press makes.
 */
const MAX_CRAFT = 99;

/**
 * The authoritative simulation. Knows nothing about sockets: the hub reads
 * snapshots and drains events and inventory changes after each step.
 */
export class Game {
  private players = new Map<string, Player>();
  private departed = new Map<string, Pick<Player, 'id' | 'inventory' | 'bag' | 'tree' | 'onlineSeconds'>>();
  private spawns: { x: number; y: number }[];
  private events: GameEvent[] = [];
  private inventoryChanged = new Set<string>();
  private reachChanged = new Set<string>();
  private shots: Shot[] = [];

  /**
   * Puddles witches' potions left: where, and until when (game clock).
   */
  private puddles: { id: number; x: number; y: number; at: number; until: number; by: string }[] = [];
  private nextPuddleId = 1;
  private nextShotId = 1;
  private sounds = new Map<string, PhoneSound[]>();
  private horde = new Horde<Player>({
    shoot: (x: number, y: number, angle: number, shot: HostileShot): void => {
      this.shots.push({
        id: this.nextShotId++,
        x: x + Math.cos(angle) * 0.3,
        y: y + Math.sin(angle) * 0.3,
        angle,
        kind: shot.kind,
        left: shot.reach,
        height: shot.kind === 'arrow' ? this.world.map.elevationAt(x, y) + LEVEL_HEIGHT * 0.5 : Infinity,
        owner: null,
        damage: shot.damage,
        knockback: 0,
        speed: shot.speed,
        hostile: true,
        weapon: null,
        by: shot.by,
        land: shot.land,
      });
    },
    hurt: (p: Player, amount: number, by: string, fromX: number, fromY: number, knockback?: number, slow?: number): number => {
      if (!this.hurt(p, amount, by, fromX, fromY)) {
        return 0;
      }
      this.knock(p, fromX, fromY, knockback);
      if (slow) {
        p.slowUntil = Math.max(p.slowUntil, this.world.time + slow);
      }
      const armor = p.bag.equipped.armor;
      return armor ? GEAR[armor.kind].thorns ?? 0 : 0;
    },
    event: (e: GameEvent): void => {
      this.events.push(e);
      if (e.t === 'monster-death' && Math.random() < MONSTER_LOOT_CHANCE[e.kind]) {
        this.world.addHeld(e.x, e.y, randomLoot(NO_TREE), null);
      }
      if (e.t === 'monster-death' && e.held) {
        this.world.addHeld(e.x, e.y, { kind: e.held, wear: Math.ceil(GEAR[e.held].wear * (LOOT_MIN_WEAR + Math.random() * (1 - LOOT_MIN_WEAR))) }, null);
      }
      if (e.t === 'monster-death' && MONSTER_BLOOD[e.kind] + MONSTER_BONES[e.kind] > 0) {
        const offered = this.world.nearStructure('altar', e.x, e.y, ALTAR_RADIUS) ? 2 : 1;
        const scrap = e.armor && Math.random() < ARMOR_SCRAP[e.armor] ? 1 : 0;
        const spoils = stock({ blood: Math.round(MONSTER_BLOOD[e.kind] * offered * monsterReward(this.worldLevel)), bone: MONSTER_BONES[e.kind], iron: scrap });
        const x = e.x - Math.cos(e.angle) * 0.2;
        const y = e.y - Math.sin(e.angle) * 0.2;
        if (this.killer && !this.killer.dead) {
          this.award(this.killer, spoils, x, y);
        } else {
          this.world.addItem(x, y, spoils, null);
        }
      }
    },
  });
  private bloodMoonLeft = 0;

  /**
   * The hidden world level (see `levels.ts`), in memory only.
   */
  worldLevel = 0;
  private calm = 0;
  private calmTarget = BLOOD_MOON_CALM + Math.random() * BLOOD_MOON_CALM_SPREAD;
  private testPlayer: TestPlayer | null = null;
  settings: GameSettings = { ...DEFAULT_GAME_SETTINGS };

  /**
   * Whoever's hit is landing on a monster right now, so what it drops goes
   * straight to them if it dies.
   */
  private killer: Player | null = null;

  /**
   * What the TV's mouse holds (and when it last moved it), and the light
   * its right button carries.
   */
  private liftHeld: { target: LiftTarget; at: number } | null = null;
  cursorLight: { x: number; y: number } | null = null;
  world: World;
  tick = 0;

  constructor(save: WorldSave | null) {
    this.world = new World(save, save ? null : loadPreset(DEFAULT_PRESET));
    this.spawns = this.world.map.spawnPoints();
    this.configure({ spawning: !this.world.quiet });
  }

  /**
   * Replaces the world with a fresh one, on a preset's map (the default
   * one when not given) or a random one (`null`, shaped by `gen`). Players keep their
   * identity but start over at a spawn point with empty pockets.
   */
  reset(preset?: string | null, gen?: MapGenSettings): void {
    this.world = new World(null, preset === null ? null : loadPreset(preset ?? DEFAULT_PRESET), gen);
    this.spawns = this.world.map.spawnPoints();
    this.configure({ spawning: !this.world.quiet });
    this.horde.clear();
    this.shots = [];
    this.bloodMoonLeft = 0;
    this.calm = 0;
    for (const p of this.players.values()) {
      p.inventory = emptyInventory();
      p.bag = emptyGear();
      this.inventoryChanged.add(p.token);
      this.respawn(p);
    }
    for (const kept of this.departed.values()) {
      kept.inventory = emptyInventory();
      kept.bag = emptyGear();
    }
  }

  /**
   * Creates a new player from a phone's name and color pick.
   */
  join(rawName: string, color: string): JoinResult {
    const name = rawName.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
    if (!name) {
      return { ok: false, error: 'Pick a name first.' };
    }
    if (!PLAYER_COLORS.includes(color)) {
      return { ok: false, error: 'Unknown color.' };
    }
    if (this.players.size >= MAX_PLAYERS) {
      return { ok: false, error: 'The graveyard is full.' };
    }
    const back = this.departed.get(name.toLowerCase());
    this.departed.delete(name.toLowerCase());
    const spawn = this.randomSpawn();
    const player: Player = {
      id: back?.id ?? randomUUID(),
      token: randomBytes(18).toString('base64url'),
      name,
      color,
      x: spawn.x,
      y: spawn.y,
      facing: Math.PI / 2,
      moving: false,
      connected: true,
      swings: 0,
      building: null,
      hp: MAX_HP,
      hurts: 0,
      dead: false,
      protected: true,
      gear: { weapon: null, offhand: null, armor: null },
      inputX: 0,
      inputY: 0,
      actionHeld: false,
      blockHeld: false,
      blocking: false,
      aimX: 0,
      aimY: 0,
      nextActionAt: 0,
      strikeAt: null,
      inventory: back?.inventory ?? emptyInventory(),
      bag: back?.bag ?? emptyGear(),
      light: 0,
      reach: null,
      buildSlot: null,
      research: false,
      tree: back?.tree ?? { found: [], levels: {} },
      disconnectedAt: null,
      onlineSeconds: back?.onlineSeconds ?? 0,
      wounds: [],
      feast: 0,
      protectedUntil: this.world.time + SPAWN_PROTECTION,
      aliveSince: this.world.time,
      respawnAt: 0,
      killedBy: '',
      knockX: 0,
      knockY: 0,
      knockUntil: 0,
      panic: null,
      slowUntil: 0,
      lifted: false,
      vitalsKey: '',
    };
    this.players.set(player.token, player);
    return { ok: true, identity: this.identityOf(player) };
  }

  /**
   * Reattaches a returning phone to its player, if it still exists.
   */
  resume(token: string): PlayerIdentity | null {
    const player = this.players.get(token);
    if (!player) {
      return null;
    }
    player.connected = true;
    player.disconnectedAt = null;
    return this.identityOf(player);
  }

  /**
   * Marks a player's phone as gone (put down, or the screen went off): they
   * slump where they stand, still in the game and still killable, until
   * the phone comes back or they leave.
   */
  disconnect(token: string): void {
    const player = this.players.get(token);
    if (player) {
      player.connected = false;
      player.disconnectedAt = Date.now();
      player.inputX = 0;
      player.inputY = 0;
      player.actionHeld = false;
      player.aimX = 0;
      player.aimY = 0;
    }
  }

  /**
   * Removes a player immediately (see `remove`).
   */
  leave(token: string): void {
    const player = this.players.get(token);
    if (player) {
      this.remove(player);
    }
  }

  vitalsOf(token: string): Vitals | null {
    const player = this.players.get(token);
    return player ? this.vitals(player) : null;
  }

  inventoryOf(token: string): Carried | null {
    const player = this.players.get(token);
    return player ? this.carried(player) : null;
  }

  reachOf(token: string): ItemKey | null {
    return this.players.get(token)?.reach ?? null;
  }

  /**
   * Picks up the bag item in reach (see `store`). Whatever doesn't fit
   * stays on the ground.
   */
  grab(token: string): void {
    const p = this.players.get(token);
    if (!p || p.dead) {
      return;
    }
    const { tx, ty } = facingTile(p.x, p.y, p.facing);
    const near = this.world.heldNear(p.x, p.y, tx + 0.5, ty + 0.5);
    if (!near) {
      return;
    }
    const left = this.store(p, near.held);
    if (left && (!isBuildItem(left) || (isBuildItem(near.held) && left.count === near.held.count))) {
      this.sound(p, 'error');
      return;
    }
    this.world.setHeld(near.id, left);
    this.sound(p, 'equip');
  }

  /**
   * Equips the gear in a bag slot, swapping whatever was in its slot into
   * the bag.
   */
  equip(token: string, index: number): void {
    const p = this.players.get(token);
    const item = p && !p.dead && Number.isInteger(index) ? p.bag.bag[index] : null;
    if (p && item && isBuildItem(item) && item.build === 'torch') {
      this.holdTorch(p, index);
      return;
    }
    if (!p || !item || !isGearItem(item)) {
      return;
    }
    const slot = GEAR[item.kind].slot;
    p.bag.bag[index] = p.bag.equipped[slot];
    p.bag.equipped[slot] = item;
    if (slot !== 'armor') {
      this.settleHands(p, slot);
    }
    this.stackTorches(p);
    this.inventoryChanged.add(p.token);
    this.sound(p, 'equip');
  }

  /**
   * Takes one torch off a stack in the bag into the off hand (whatever was
   * there goes into the bag).
   */
  private holdTorch(p: Player, index: number): void {
    const stack = p.bag.bag[index];
    if (!stack || !isBuildItem(stack) || stack.build !== 'torch') {
      return;
    }
    const old = p.bag.equipped.offhand;
    stack.count--;
    if (stack.count === 0) {
      p.bag.bag[index] = null;
    }
    p.bag.equipped.offhand = { kind: 'torch', wear: GEAR.torch.wear };
    if (old) {
      const left = this.store(p, old, false);
      if (left) {
        this.dropAt(p.x, p.y, left);
      }
    }
    this.settleHands(p, 'offhand');
    this.syncBuilding(p);
    this.inventoryChanged.add(p.token);
    this.sound(p, 'equip');
  }

  /**
   * A torch out of the hand goes back on a stack of torches: there's one
   * torch item, held or placed.
   */
  private stackTorches(p: Player): void {
    for (let i = 0; i < p.bag.bag.length; i++) {
      const item = p.bag.bag[i];
      if (item && isGearItem(item) && item.kind === 'torch') {
        p.bag.bag[i] = null;
        const left = this.store(p, { build: 'torch', count: 1 });
        if (left) {
          this.dropAt(p.x, p.y, left);
        }
      }
    }
  }

  /**
   * Kills every monster on the map (the TV's Game tab).
   */
  killMonsters(): void {
    this.horde.killAll();
  }

  /**
   * Starts a panic: the player runs from monsters close by for a moment,
   * then walks back.
   */
  panic(token: string): void {
    const p = this.players.get(token);
    if (p && !p.dead) {
      p.panic = { until: this.world.time + PANIC_SECONDS, homeX: p.x, homeY: p.y, path: [], planAt: 0 };
    }
  }

  /**
   * The direction a panicking player is steered in instead of their
   * joystick. While panicking, along a path to the nearby tile furthest
   * from every monster in range (the search walks around walls, so a dead
   * end doesn't trap them); afterwards along a path back home, fleeing
   * again whenever a monster comes within three quarters of that range. Paths are
   * replanned a few times a second as monsters move. Clears the panic once
   * home or out of time.
   */
  private panicSteer(p: Player): { x: number; y: number } {
    const panic = p.panic!;
    const time = this.world.time;
    const fleeing = time < panic.until;
    const near = this.horde.bodies().filter((m): boolean => Math.hypot(p.x - m.x, p.y - m.y) < (fleeing ? PANIC_RANGE : PANIC_RANGE * 0.75));
    const home = Math.hypot(panic.homeX - p.x, panic.homeY - p.y);
    if (!fleeing && (time > panic.until + PANIC_RETURN_SECONDS || (near.length === 0 && home < 0.15))) {
      p.panic = null;
      return { x: 0, y: 0 };
    }
    if (fleeing && near.length === 0) {
      return { x: 0, y: 0 };
    }
    if (time >= panic.planAt) {
      panic.planAt = time + PANIC_REPLAN;
      const map = this.world.map;
      const gap = (tx: number, ty: number): number => Math.min(...near.map((m): number => Math.hypot(tx + 0.5 - m.x, ty + 0.5 - m.y)));
      const from = { tx: Math.floor(p.x), ty: Math.floor(p.y) };
      const options = {
        from,
        cost: (tx: number, ty: number, fx: number, fy: number): number =>
          (map.isSolid(tx, ty) || !map.canStep(fx, fy, tx, ty) ? Infinity : near.length > 0 && gap(tx, ty) < 1.2 ? 12 : 1),
        open: (tx: number, ty: number): boolean => !map.isSolid(tx, ty),
      };
      panic.path = near.length > 0
        ? findPath({ ...options, score: (tx: number, ty: number): number => -Math.min(gap(tx, ty), PANIC_SAFE) + Math.hypot(tx - from.tx, ty - from.ty) * 0.15 }) ?? []
        : findPath({ ...options, to: { tx: Math.floor(panic.homeX), ty: Math.floor(panic.homeY) } }) ?? [];
    }
    while (panic.path.length > 0 && Math.hypot(panic.path[0].tx + 0.5 - p.x, panic.path[0].ty + 0.5 - p.y) < 0.35) {
      panic.path.shift();
    }
    const target = panic.path[0] ? { x: panic.path[0].tx + 0.5, y: panic.path[0].ty + 0.5 } : near.length === 0 ? { x: panic.homeX, y: panic.homeY } : null;
    if (!target) {
      return { x: 0, y: 0 };
    }
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.01) {
      return { x: 0, y: 0 };
    }
    const speed = panic.path.length > 1 ? 1 : Math.min(1, d / (PLAYER_SPEED * 0.1));
    return { x: (dx / d) * speed, y: (dy / d) * speed };
  }

  /**
   * Drinks one tonic from a bag slot, unless there's nothing it could heal
   * (full health, or only fresh wounds).
   */
  drink(token: string, index: number): void {
    const p = this.players.get(token);
    const item = p && !p.dead && Number.isInteger(index) ? p.bag.bag[index] : null;
    if (!p || !item || !isMaterialItem(item) || item.material !== 'tonic') {
      return;
    }
    if (p.hp >= this.healCap(p)) {
      this.sound(p, 'error');
      return;
    }
    this.heal(p, TONIC_HEAL);
    item.count--;
    if (item.count === 0) {
      p.bag.bag[index] = null;
    }
    this.inventoryChanged.add(p.token);
    this.sound(p, 'drink');
  }

  /**
   * Moves an item from one slot to another (bag indexes or equipped
   * slots), as the phone's bag does when one item is picked and then
   * another slot: into an empty slot, onto a stack of the same thing (up to
   * a full stack), or swapping places. Gear only goes into its own
   * equipped slot; anything else can't be equipped.
   */
  moveItem(token: string, from: GearSlot | number, to: GearSlot | number): void {
    const p = this.players.get(token);
    const slotOf = (where: GearSlot | number): 'bag' | 'equipped' | null =>
      (typeof where === 'number' ? (Number.isInteger(where) && where >= 0 && where < p!.bag.bag.length ? 'bag' : null) : GEAR_SLOTS.includes(where) ? 'equipped' : null);
    if (!p || p.dead || from === to || !slotOf(from) || !slotOf(to)) {
      return;
    }
    const get = (where: GearSlot | number): BagItem | null => (typeof where === 'number' ? p.bag.bag[where] : p.bag.equipped[where]);
    const put = (where: GearSlot | number, item: BagItem | null): void => {
      if (typeof where === 'number') {
        p.bag.bag[where] = item;
      } else {
        p.bag.equipped[where] = item as GearItem | null;
      }
    };
    const fits = (item: BagItem | null, where: GearSlot | number): boolean =>
      typeof where === 'number' || item === null || (isGearItem(item) && GEAR[item.kind].slot === where);
    const item = get(from);
    const there = get(to);
    if (!item) {
      return;
    }
    if (to === 'offhand' && typeof from === 'number' && isBuildItem(item) && item.build === 'torch') {
      this.holdTorch(p, from);
      return;
    }
    if (there && !isGearItem(item) && !isGearItem(there) && itemKey(item) === itemKey(there)) {
      const room = (isBuildItem(there) ? BUILD_STACK : MATERIAL_STACK) - there.count;
      const moved = Math.min(room, item.count);
      if (moved <= 0) {
        this.sound(p, 'error');
        return;
      }
      there.count += moved;
      item.count -= moved;
      if (item.count === 0) {
        put(from, null);
      }
    } else if (fits(item, to) && fits(there, from)) {
      put(to, item);
      put(from, there);
      if (to === 'weapon' || to === 'offhand') {
        this.settleHands(p, to);
      } else if (from === 'weapon' || from === 'offhand') {
        this.settleHands(p, from);
      }
      this.stackTorches(p);
    } else {
      this.sound(p, 'error');
      return;
    }
    this.inventoryChanged.add(p.token);
    this.sound(p, typeof to === 'string' || typeof from === 'string' ? 'equip' : 'pickup');
  }

  /**
   * Moves an equipped piece back into the bag, if there's room.
   */
  unequip(token: string, slot: GearSlot): void {
    const p = this.players.get(token);
    const item = p && !p.dead && GEAR_SLOTS.includes(slot) ? p.bag.equipped[slot] : null;
    if (!p || !item) {
      return;
    }
    const free = p.bag.bag.indexOf(null);
    if (free < 0) {
      this.sound(p, 'error');
      return;
    }
    p.bag.bag[free] = item;
    p.bag.equipped[slot] = null;
    this.stackTorches(p);
    this.inventoryChanged.add(p.token);
    this.sound(p, 'equip');
  }

  /**
   * Throws a bag item (from a bag index or an equipped slot) onto the
   * facing tile, or at the player's feet if that tile is blocked.
   */
  dropGear(token: string, from: GearSlot | number): void {
    const p = this.players.get(token);
    if (!p || p.dead) {
      return;
    }
    let item: BagItem | null = null;
    if (typeof from === 'number' && Number.isInteger(from) && p.bag.bag[from]) {
      item = p.bag.bag[from];
      p.bag.bag[from] = null;
    } else if (typeof from === 'string' && GEAR_SLOTS.includes(from) && p.bag.equipped[from]) {
      item = p.bag.equipped[from];
      p.bag.equipped[from] = null;
    }
    if (!item) {
      return;
    }
    this.inventoryChanged.add(p.token);
    this.sound(p, 'drop');
    const { tx, ty } = facingTile(p.x, p.y, p.facing);
    const open = !this.world.map.isSolid(tx, ty);
    if (isMaterialItem(item)) {
      this.world.addItem(open ? tx + 0.5 : p.x, open ? ty + 0.5 : p.y, stock({ [item.material]: item.count }), p.id);
      return;
    }
    this.world.addHeld(open ? tx + 0.5 : p.x, open ? ty + 0.5 : p.y, item, p.id);
  }

  /**
   * Makes a bundle of bolts, a fresh piece of gear, or one structure from
   * carried materials. Gear and structures go where Grab would put them, or
   * at the player's feet when the bag is full.
   */
  craft(token: string, recipe: RecipeId, count = 1): void {
    const p = this.players.get(token);
    if (!p || p.dead || !RECIPES.includes(recipe) || !Number.isFinite(count)) {
      return;
    }
    let made = 0;
    for (; made < Math.min(MAX_CRAFT, Math.max(1, Math.floor(count))); made++) {
      if (!recipeUnlocked(recipe, this.treeOf(p)) || (!this.settings.freeCrafting && !this.pay(p, recipeCost(recipe)))) {
        break;
      }
      const item: BagItem = recipe === 'bolts' || recipe === 'arrows' ? { material: recipe, count: ammoMade(recipe) } : freshItem(recipe, p.tree);
      const left = this.store(p, item);
      if (left) {
        this.dropAt(p.x, p.y, left);
      }
    }
    this.inventoryChanged.add(p.token);
    this.sound(p, made > 0 ? 'craft' : 'error');
  }

  /**
   * Raises one of a player's skill tree nodes a level, paid for in candy
   * and blood, standing at a research table. The TV feed says who did it
   * and anything it opened up for them.
   */
  upgrade(token: string, node: NodeId): void {
    const p = this.players.get(token);
    if (!p || p.dead || !TREE_NODE[node]) {
      return;
    }
    const cost = upgradeCost(node, p.tree);
    if (!p.research || cost === null || !nodeUnlocked(node, this.treeOf(p)) || RESOURCES.some((r: Resource): boolean => p.inventory[r] < cost[r])) {
      this.sound(p, 'error');
      return;
    }
    for (const r of RESOURCES) {
      p.inventory[r] -= cost[r];
    }
    const before = TREE.filter((n: TreeNode): boolean => nodeUnlocked(n.id, p.tree));
    p.tree.levels[node] = levelOf(node, p.tree) + 1;
    const opened = TREE.filter((n: TreeNode): boolean => nodeUnlocked(n.id, p.tree) && !before.includes(n)).map((n: TreeNode): NodeId => n.id);
    this.sound(p, 'unlock');
    this.events.push({ t: 'research', finder: p.name, finderColor: p.color, label: itemLabel(node), level: levelOf(node, p.tree), opens: itemNames(opened) });
    this.inventoryChanged.add(p.token);
  }

  /**
   * Stores the latest joystick vector, snapped to the nearest of eight
   * directions (so facing, and therefore targeting, is always a clean
   * neighbor tile) and clamped to the unit circle. Tilt still sets speed.
   */
  setInput(token: string, x: number, y: number): void {
    const player = this.players.get(token);
    if (!player || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    const len = Math.min(1, Math.hypot(x, y));
    if (len === 0) {
      player.inputX = 0;
      player.inputY = 0;
      return;
    }
    const angle = Math.round(Math.atan2(y, x) / (Math.PI / 4)) * (Math.PI / 4);
    player.inputX = Math.cos(angle) * len;
    player.inputY = Math.sin(angle) * len;
  }

  setAction(token: string, down: boolean): void {
    const player = this.players.get(token);
    if (player) {
      player.actionHeld = down;
    }
  }

  setBlock(token: string, down: boolean): void {
    const player = this.players.get(token);
    if (player) {
      player.blockHeld = down;
      player.blocking = down && this.canBlock(player);
    }
  }

  /**
   * Whether a player has a shield they can raise: one in the off-hand,
   * beside a one-handed weapon.
   */
  private canBlock(p: Player): boolean {
    return !p.dead && p.bag.equipped.offhand?.kind === 'shield' && !twoHanded(p.bag.equipped.weapon?.kind);
  }

  /**
   * A shield and a two-handed weapon can't be held together: whichever
   * of them wasn't just put in hand goes back into the bag (or at the
   * player's feet if the bag is full).
   */
  private settleHands(p: Player, kept: 'weapon' | 'offhand'): void {
    if (p.bag.equipped.offhand?.kind !== 'shield' || !twoHanded(p.bag.equipped.weapon?.kind)) {
      return;
    }
    const other = kept === 'weapon' ? 'offhand' : 'weapon';
    const item = p.bag.equipped[other]!;
    p.bag.equipped[other] = null;
    const left = this.store(p, item, false);
    if (left) {
      this.dropAt(p.x, p.y, left);
    }
  }

  /**
   * Where the Action stick points, snapped to one of eight directions like
   * movement, or (0, 0) when centered. While aiming, the player faces the
   * aim instead of where they walk, so they can strike behind themselves.
   */
  setAim(token: string, x: number, y: number): void {
    const player = this.players.get(token);
    if (!player || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    if (x === 0 && y === 0) {
      player.aimX = 0;
      player.aimY = 0;
      return;
    }
    const angle = Math.round(Math.atan2(y, x) / (Math.PI / 4)) * (Math.PI / 4);
    player.aimX = Math.cos(angle);
    player.aimY = Math.sin(angle);
  }

  /**
   * Picks (or clears) the bag slot of structures to preview on the facing
   * tile.
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
   * from the bag. Returns why it couldn't, or null on success. The pick stays
   * while the stack lasts, so walls can be laid in a row.
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
    const { tx, ty } = placeTile(p.x, p.y, p.facing, PLAYER_RADIUS);
    const blocked = this.buildBlocked(stack.build, tx, ty);
    if (blocked) {
      return blocked;
    }
    stack.count--;
    if (stack.count === 0) {
      p.bag.bag[p.buildSlot] = null;
    }
    this.syncBuilding(p);
    this.inventoryChanged.add(p.token);
    this.world.place(tx, ty, stack.build, levelOf(`build:${stack.build}`, p.tree), p.id);
    p.protectedUntil = 0;
    this.sound(p, 'build');
    return null;
  }

  /**
   * Why a structure can't go on a tile, or null if it can: only on open
   * floor, and anything walked into or onto needs the tile clear of
   * people, monsters, and items.
   */
  private buildBlocked(kind: StructureKind, tx: number, ty: number): string | null {
    if (!BUILDABLE_FLOORS.has(this.world.map.get(tx, ty))) {
      return 'Can\'t build there.';
    }
    const solid = isSolidTile(kind) || RAISED.has(kind);
    if (solid && ([...this.players.values()].some((o: Player): boolean => !o.dead && overlapsTile(o.x, o.y, tx, ty)) || this.horde.occupies(tx, ty))) {
      return 'Someone is in the way.';
    }
    if (solid && this.world.hasItemOn(tx, ty)) {
      return 'Pick up the pile first.';
    }
    return null;
  }

  /**
   * Keeps the previewed structure in step with the picked bag slot, which
   * may have been emptied, dropped, or swapped.
   */
  private syncBuilding(p: Player): void {
    const item = p.buildSlot !== null ? p.bag.bag[p.buildSlot] : null;
    if (!item || !isBuildItem(item)) {
      p.buildSlot = null;
    }
    p.building = item && isBuildItem(item) ? item.build : null;
  }

  /**
   * Throws up to DROP_AMOUNT of a resource onto the facing tile, or at the
   * player's feet if that tile is blocked.
   */
  drop(token: string, resource: Resource): void {
    const p = this.players.get(token);
    if (!p || p.dead || !RESOURCES.includes(resource)) {
      return;
    }
    const amount = Math.min(DROP_AMOUNT, p.inventory[resource]);
    if (amount === 0) {
      return;
    }
    p.inventory[resource] -= amount;
    this.inventoryChanged.add(p.token);
    this.sound(p, 'drop');
    const { tx, ty } = facingTile(p.x, p.y, p.facing);
    const open = !this.world.map.isSolid(tx, ty);
    const contents = stock({ [resource]: amount });
    this.world.addItem(open ? tx + 0.5 : p.x, open ? ty + 0.5 : p.y, contents, p.id);
  }

  /**
   * Applies switches from the TV's Game tab. Turning the test player on
   * joins it like a phone would; turning it off removes it.
   */
  configure(next: Partial<GameSettings>): void {
    if (typeof next.aggressive === 'boolean') {
      this.settings.aggressive = next.aggressive;
    }
    for (const key of ['lightsOff', 'daytime', 'tvDrag', 'tvLight'] as const) {
      if (typeof next[key] === 'boolean') {
        this.settings[key] = next[key];
      }
    }
    if (typeof next.spawning === 'boolean') {
      this.settings.spawning = next.spawning;
    }
    for (const key of ['allUnlocks', 'freeCrafting'] as const) {
      if (typeof next[key] === 'boolean' && next[key] !== this.settings[key]) {
        this.settings[key] = next[key];
        for (const p of this.players.values()) {
          this.inventoryChanged.add(p.token);
        }
      }
    }
    if (typeof next.levelBoost === 'number' && Number.isFinite(next.levelBoost)) {
      const boost = Math.min(WORLD_LEVEL_BOOST_MAX, Math.max(0, Math.round(next.levelBoost)));
      this.worldLevel = Math.max(0, this.worldLevel + boost - this.settings.levelBoost);
      this.settings.levelBoost = boost;
    }
    if (!this.settings.tvDrag && this.liftHeld) {
      this.release();
    }
    if (!this.settings.tvLight) {
      this.setCursorLight(null);
    }
    if (next.testPlayer === true && !this.testPlayer) {
      const used = new Set([...this.players.values()].map((p: Player): string => p.color));
      const joined = this.join('Test Player', PLAYER_COLORS.find((c: string): boolean => !used.has(c)) ?? PLAYER_COLORS[0]);
      if (joined.ok) {
        const { token } = joined.identity;
        const hands: BotHands = {
          input: (x: number, y: number): void => this.setInput(token, x, y),
          aim: (x: number, y: number): void => this.setAim(token, x, y),
          action: (down: boolean): void => this.setAction(token, down),
          craft: (recipe: RecipeId): void => this.craft(token, recipe),
          select: (slot: number | null): void => this.selectBuild(token, slot),
          place: (): string | null => this.placeBuild(token),
          upgrade: (node: NodeId): void => this.upgrade(token, node),
        };
        this.testPlayer = new TestPlayer(token, hands);
      }
    } else if (next.testPlayer === false && this.testPlayer) {
      this.leave(this.testPlayer.token);
      this.testPlayer = null;
    }
    this.settings.testPlayer = this.testPlayer !== null;
    this.horde.passive = !this.settings.aggressive;
    this.horde.dark = this.settings.lightsOff;
    this.horde.spawning = this.settings.spawning;
    this.world.restock = this.settings.spawning;
  }

  /**
   * The TV's mouse holding a player or monster up at (x, y), or letting go
   * of it there. Dropped somewhere it can't stand (inside a wall, off the
   * map), it lands on the nearest spot that works.
   */
  lift(target: LiftTarget, x: number, y: number, drop: boolean): void {
    if (!this.settings.tvDrag || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    const held = this.liftHeld?.target;
    if (held && (held.kind !== target.kind || held.id !== target.id)) {
      this.release();
    }
    const px = Math.min(MAP_WIDTH - 0.01, Math.max(0, x));
    const py = Math.min(MAP_HEIGHT - 0.01, Math.max(0, y));
    if (target.kind === 'player') {
      const p = [...this.players.values()].find((q: Player): boolean => q.id === target.id);
      if (!p || p.dead) {
        this.liftHeld = null;
        return;
      }
      p.x = px;
      p.y = py;
      p.lifted = true;
      p.panic = null;
      p.knockUntil = 0;
    } else {
      if (!this.horde.place(target.id, px, py)) {
        this.liftHeld = null;
        this.horde.liftedId = null;
        return;
      }
      this.horde.liftedId = target.id;
    }
    this.liftHeld = { target, at: this.world.time };
    if (drop) {
      this.release();
    }
  }

  /**
   * Lets go of whatever the TV's mouse holds, landing it on the nearest
   * spot it can stand.
   */
  private release(): void {
    const held = this.liftHeld?.target;
    this.liftHeld = null;
    this.horde.liftedId = null;
    if (!held) {
      return;
    }
    if (held.kind === 'player') {
      const p = [...this.players.values()].find((q: Player): boolean => q.id === held.id);
      if (p) {
        p.lifted = false;
        Object.assign(p, this.landing(p.x, p.y, PLAYER_RADIUS, false));
      }
    } else {
      const m = this.horde.find(held.id);
      if (m) {
        const spot = this.landing(m.x, m.y, MONSTER_RADIUS, m.kind !== 'ghost');
        this.horde.place(held.id, spot.x, spot.y);
      }
    }
  }

  /**
   * The nearest place to (x, y) a walker of half-size `r` can stand: right
   * there if nothing solid overlaps it, else the closest open tile's
   * center (never a door for monsters, which can't open them).
   */
  private landing(x: number, y: number, r: number, monster: boolean): { x: number; y: number } {
    const map = this.world.map;
    const open = (tx: number, ty: number): boolean =>
      tx >= 0 && ty >= 0 && tx < MAP_WIDTH && ty < MAP_HEIGHT && !map.isSolid(tx, ty) && !(monster && map.get(tx, ty) === 'door');
    const fits = [Math.floor(x - r), Math.floor(x + r)].every((tx: number): boolean =>
      [Math.floor(y - r), Math.floor(y + r)].every((ty: number): boolean => open(tx, ty) && map.base(tx, ty) === map.base(Math.floor(x), Math.floor(y))));
    if (fits) {
      return { x, y };
    }
    let best: { x: number; y: number } | null = null;
    let bestD = Infinity;
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
        if (d < bestD && open(tx, ty)) {
          best = { x: tx + 0.5, y: ty + 0.5 };
          bestD = d;
        }
      }
    }
    return best ?? { x, y };
  }

  /**
   * Where the light carried by the TV's right mouse button is, or null once
   * it's let go.
   */
  setCursorLight(at: { x: number; y: number } | null): void {
    const ok = at && this.settings.tvLight && Number.isFinite(at.x) && Number.isFinite(at.y);
    this.cursorLight = ok ? { x: Math.min(MAP_WIDTH, Math.max(0, at.x)), y: Math.min(MAP_HEIGHT, Math.max(0, at.y)) } : null;
    this.horde.cursorLight = this.cursorLight;
  }

  /**
   * Conjures something at a random spot anywhere on the map: a tree,
   * pumpkin, chest, or rock, a piece of loot, or a monster (kept a few
   * tiles from every living player).
   */
  spawn(kind: SpawnKind): void {
    if (!SPAWN_KINDS.includes(kind)) {
      return;
    }
    const living = [...this.players.values()].filter((p: Player): boolean => !p.dead && p.connected);
    if (isMonsterKind(kind)) {
      this.horde.summon(kind, this.world, living);
      return;
    }
    if (kind === 'loot') {
      for (let tries = 0; tries < 400; tries++) {
        const tx = 1 + Math.floor(Math.random() * (MAP_WIDTH - 2));
        const ty = 1 + Math.floor(Math.random() * (MAP_HEIGHT - 2));
        if (this.world.inView(tx, ty) && !this.world.map.isSolid(tx, ty) && !living.some((p: Player): boolean => Math.floor(p.x) === tx && Math.floor(p.y) === ty)) {
          this.world.addHeld(tx + 0.5, ty + 0.5, randomLoot(NO_TREE), null);
          return;
        }
      }
      return;
    }
    const bodies = [...living, ...this.horde.bodies()];
    const at = this.world.spawnTile(kind, (tx: number, ty: number): boolean =>
      bodies.some((o: { x: number; y: number }): boolean => Math.abs(o.x - (tx + 0.5)) < 1.2 && Math.abs(o.y - (ty + 0.5)) < 1.2));
    if (at && kind !== 'rock') {
      this.events.push({ t: 'grow', ...at, tile: kind });
    }
  }

  /**
   * Advances the simulation by `dt` seconds.
   */
  step(dt: number): void {
    this.tick++;
    const now = Date.now();
    if (this.liftHeld && this.world.time - this.liftHeld.at > LIFT_TIMEOUT) {
      this.release();
    }
    if (this.testPlayer) {
      const bot = this.players.get(this.testPlayer.token)!;
      this.testPlayer.think({ x: bot.x, y: bot.y, dead: bot.dead, inventory: bot.inventory, bag: bot.bag.bag, canBuild: (kind: StructureKind): boolean => recipeUnlocked(`build:${kind}`, this.treeOf(bot)), canPay: (cost: Bundle): boolean => this.canPay(bot, cost), research: bot.research, tree: bot.tree, map: this.world.map, time: this.world.time, monsters: this.horde.bodies() });
    }
    for (const p of this.players.values()) {
      const time = this.world.time;
      if (p.dead) {
        if (time >= p.respawnAt) {
          this.respawn(p);
        }
        continue;
      }
      if (p.lifted) {
        p.moving = false;
        continue;
      }
      const steer = p.panic ? this.panicSteer(p) : { x: p.inputX, y: p.inputY };
      p.moving = steer.x !== 0 || steer.y !== 0;
      if (p.moving) {
        p.facing = Math.atan2(steer.y, steer.x);
        const armor = p.bag.equipped.armor;
        const speed = PLAYER_SPEED * (time < p.slowUntil ? GHOST_SLOW : 1) * (p.blocking ? BLOCK_SLOW : 1) * (armor ? GEAR[armor.kind].speed ?? 1 : 1) * (this.world.map.get(Math.floor(p.x), Math.floor(p.y)) === 'barbed-wire' ? BARBED_PLAYER_SLOW : 1) * (inTrunk(this.world.map, p.x, p.y) ? TREE_SLOW : 1);
        this.move(p, steer.x * speed * dt, steer.y * speed * dt);
      }
      if (p.aimX !== 0 || p.aimY !== 0) {
        p.facing = Math.atan2(p.aimY, p.aimX);
      }
      if (time < p.knockUntil) {
        const before = this.world.map.elevationAt(p.x, p.y);
        this.move(p, p.knockX * dt, p.knockY * dt);
        const drop = before - this.world.map.elevationAt(p.x, p.y);
        if (drop >= FALL_MIN) {
          this.hurt(p, FALL_DAMAGE * Math.round(drop / LEVEL_HEIGHT), 'a fall');
        }
      }
      if (p.actionHeld && time >= p.nextActionAt) {
        this.act(p);
      }
      if (p.strikeAt !== null && time >= p.strikeAt) {
        p.strikeAt = null;
        this.strike(p);
      }
      p.light = p.bag.equipped.offhand?.kind === 'torch' ? lightRadius(GEAR.torch.light!.radius, levelOf('build:torch', p.tree)) : 0;
      p.blocking = p.blockHeld && this.canBlock(p);
      const facing = facingTile(p.x, p.y, p.facing);
      this.syncBuilding(p);
      const near = this.world.heldNear(p.x, p.y, facing.tx + 0.5, facing.ty + 0.5);
      const reach = near ? itemKey(near.held) : null;
      if (reach !== p.reach) {
        p.reach = reach;
        this.reachChanged.add(p.token);
      }
      this.autoGrab(p);
      const research = this.world.nearStructure('research-table', p.x, p.y, RESEARCH_RADIUS);
      if (research !== p.research) {
        p.research = research;
        this.inventoryChanged.add(p.token);
      }
      const took = this.world.pickUp(p.id, p.x, p.y, (goods: Goods, amount: number): number => this.take(p, goods, amount));
      if (GOODS.some((g: Goods): boolean => took[g] > 0)) {
        this.inventoryChanged.add(p.token);
        this.sound(p, took.candy > 0 ? 'candy' : 'pickup');
      }
      if (took.candy > 0) {
        this.events.push({ t: 'candy', x: p.x, y: p.y, amount: took.candy });
      }
      for (const g of GOODS) {
        if (g !== 'candy' && took[g] > 0) {
          this.events.push({ t: 'pickup', x: p.x, y: p.y, goods: g });
        }
      }
      const trap = this.world.map.get(Math.floor(p.x), Math.floor(p.y));
      if (trap === 'spikes' || trap === 'iron-spikes') {
        this.hurt(p, spikeDamage(SPIKE_DAMAGE_PER_SECOND * TRAP_DAMAGE[trap]!, this.world.structureLevel(Math.floor(p.x), Math.floor(p.y))) * dt, STRUCTURES[trap].label);
      }
      this.rest(p, dt);
      p.protected = !p.dead && time < p.protectedUntil;
    }
    this.fireSentries();
    this.stepShots(dt);
    this.stepPuddles(dt);
    this.advanceBloodMoon(dt);
    this.advanceLevels(dt);
    this.horde.step(dt, this.world, [...this.players.values()], this.bloodMoon());
    this.separateBodies();
    const occupants = [...this.players.values()].filter((p: Player): boolean => !p.dead);
    for (const g of this.world.step(dt, [...occupants, ...this.horde.bodies()])) {
      this.events.push({ t: 'grow', ...g });
    }
    for (const d of this.world.takeDug()) {
      this.events.push({ t: 'chips', ...d, health: this.world.health(d.tx, d.ty) });
    }
  }

  monsters(): MonsterState[] {
    return this.horde.snapshot();
  }

  shotStates(): ShotState[] {
    return this.shots.map(({ id, x, y, angle, kind, left, land }: Shot): ShotState => ({
      id,
      x: Math.round(x * 1000) / 1000,
      y: Math.round(y * 1000) / 1000,
      angle,
      kind,
      ...(land ? { lob: Math.round(Math.min(1, Math.max(0, 1 - left / land)) * 100) / 100 } : {}),
    }));
  }

  bloodMoon(): boolean {
    return this.bloodMoonLeft > 0;
  }

  /**
   * Raises a blood moon right now and restarts the calm before the next.
   * The TV's summon button calls this too, even with nobody playing.
   */
  forceBloodMoon(): void {
    this.bloodMoonLeft = BLOOD_MOON_DURATION;
    this.calm = 0;
    this.calmTarget = BLOOD_MOON_CALM + Math.random() * BLOOD_MOON_CALM_SPREAD;
  }

  /**
   * Each player's hidden level (see `levels.ts`), by id.
   */
  playerLevels(): Record<string, number> {
    return Object.fromEntries([...this.players.values()].map((p: Player): [string, number] => [p.id, Math.round(playerLevel(p.bag, p.tree, p.onlineSeconds).total * 10) / 10]));
  }

  /**
   * Counts connected players' time online, and eases the world level
   * toward what the players online call for plus the Game tab's boost:
   * quickly up, slowly down, and not at all while nobody is connected
   * (a change to the boost moves it at once).
   */
  private advanceLevels(dt: number): void {
    const online = [...this.players.values()].filter((p: Player): boolean => p.connected);
    for (const p of online) {
      p.onlineSeconds += dt;
    }
    const players = worldLevelTarget(online.map((p: Player): number => playerLevel(p.bag, p.tree, p.onlineSeconds).total));
    const target = players === null ? null : players + this.settings.levelBoost;
    if (target !== null) {
      this.worldLevel = target > this.worldLevel
        ? Math.min(target, this.worldLevel + WORLD_LEVEL_RISE * dt)
        : Math.max(target, this.worldLevel - WORLD_LEVEL_FALL * dt);
    }
    this.horde.level = this.worldLevel;
  }

  /**
   * Counts down a blood moon in progress, or the calm before the next one,
   * which only passes while someone is connected.
   */
  private advanceBloodMoon(dt: number): void {
    if (this.bloodMoonLeft > 0) {
      this.bloodMoonLeft = Math.max(0, this.bloodMoonLeft - dt);
      return;
    }
    if (this.settings.spawning && [...this.players.values()].some((p: Player): boolean => p.connected)) {
      this.calm += dt;
      if (this.calm >= this.calmTarget) {
        this.forceBloodMoon();
      }
    }
  }

  /**
   * Public state of every player, for broadcasting.
   */
  snapshot(): PlayerState[] {
    return [...this.players.values()].map((p: Player): PlayerState => this.publicState(p));
  }

  takeEvents(): GameEvent[] {
    const events = this.events;
    this.events = [];
    return events;
  }

  /**
   * Returns and clears each phone's sounds since the last call.
   */
  takeSounds(): [string, PhoneSound[]][] {
    const sounds = [...this.sounds];
    this.sounds.clear();
    return sounds;
  }

  /**
   * Returns and clears the inventories that changed since the last call.
   */
  takeInventoryChanges(): [string, Carried][] {
    const changes = [...this.inventoryChanged].flatMap((token: string): [string, Carried][] => {
      const p = this.players.get(token);
      return p ? [[token, this.carried(p)]] : [];
    });
    this.inventoryChanged.clear();
    return changes;
  }

  /**
   * Returns and clears the phones whose grabbable gear changed.
   */
  takeReachChanges(): [string, ItemKey | null][] {
    const changes = [...this.reachChanged].flatMap((token: string): [string, ItemKey | null][] => {
      const p = this.players.get(token);
      return p ? [[token, p.reach]] : [];
    });
    this.reachChanged.clear();
    return changes;
  }

  /**
   * Returns the phones whose vitals changed visibly (a half heart,
   * protection, or death) since the last call.
   */
  takeVitalsChanges(): [string, Vitals][] {
    const changes: [string, Vitals][] = [];
    for (const p of this.players.values()) {
      const key = `${Math.ceil(p.hp * 2)}|${Math.ceil(this.wounded(p) * 2)}|${p.protected}|${p.dead}`;
      if (key !== p.vitalsKey) {
        p.vitalsKey = key;
        changes.push([p.token, this.vitals(p)]);
      }
    }
    return changes;
  }

  private carried(p: Player): Carried {
    return { inventory: { ...p.inventory }, gear: structuredClone(p.bag), tree: structuredClone(this.treeOf(p)), research: p.research };
  }

  /**
   * A player's tree with the Game tab's testing switches applied.
   */
  private treeOf(p: Player): TreeState {
    return this.settings.allUnlocks || this.settings.freeCrafting ? { ...p.tree, all: this.settings.allUnlocks, free: this.settings.freeCrafting } : p.tree;
  }

  private vitals(p: Player): Vitals {
    return {
      hp: Math.ceil(p.hp * 2) / 2,
      wounded: Math.ceil(this.wounded(p) * 2) / 2,
      protected: p.protected,
      death: p.dead
        ? { killer: p.killedBy, survived: Math.round(p.respawnAt - RESPAWN_DELAY - p.aliveSince), respawnIn: Math.max(0, p.respawnAt - this.world.time) }
        : null,
    };
  }

  private sound(p: Player, name: PhoneSound): void {
    const list = this.sounds.get(p.token);
    if (list) {
      list.push(name);
    } else {
      this.sounds.set(p.token, [name]);
    }
  }

  private move(p: Player, dx: number, dy: number): void {
    const next = moveWithCollision(walkerBlocked(this.world.map, p.x, p.y, PLAYER_RADIUS), p.x, p.y, dx, dy, PLAYER_RADIUS);
    p.x = next.x;
    p.y = next.y;
  }

  /**
   * Damages a player unless they're protected or already dead, killing
   * them at zero. Returns whether it landed.
   */
  private hurt(p: Player, amount: number, by: Player | string, fromX?: number, fromY?: number): boolean {
    if (p.dead || p.protected) {
      return false;
    }
    if (fromX !== undefined && fromY !== undefined) {
      amount = this.guard(p, amount, fromX, fromY);
    }
    const before = Math.ceil(p.hp);
    p.hp -= amount;
    const last = p.wounds.at(-1);
    if (last && this.world.time - last.at < 0.5) {
      last.amount += amount;
      last.at = this.world.time;
    } else {
      p.wounds.push({ at: this.world.time, amount });
    }
    if (Math.ceil(p.hp) !== before) {
      p.hurts++;
    }
    if (p.hp <= 0) {
      this.kill(p, by);
    }
    return true;
  }

  /**
   * Spills the player's bag where they fell (what they wear stays on
   * them), takes a share of their candy and blood for good, and starts the
   * respawn timer.
   */
  private kill(p: Player, by: Player | string): void {
    this.spill(p);
    for (const r of RESOURCES) {
      p.inventory[r] = Math.floor(p.inventory[r] * (1 - DEATH_TOLL));
    }
    p.bag.bag = emptyGear().bag;
    this.inventoryChanged.add(p.token);
    p.hp = 0;
    p.dead = true;
    p.moving = false;
    p.building = null;
    p.buildSlot = null;
    p.respawnAt = this.world.time + RESPAWN_DELAY;
    p.killedBy = typeof by === 'string' ? by : by.name;
    this.events.push({
      t: 'kill',
      killer: p.killedBy,
      killerColor: typeof by === 'string' ? null : by.color,
      victim: p.name,
      victimColor: p.color,
    });
  }

  /**
   * Brings a player back at their coffin or a random spawn: full health
   * and spawn protection.
   */
  private respawn(p: Player): void {
    Object.assign(p, this.coffinSpawn(p) ?? this.randomSpawn());
    p.hp = MAX_HP;
    p.wounds = [];
    p.feast = 0;
    p.dead = false;
    p.strikeAt = null;
    p.protected = true;
    p.protectedUntil = this.world.time + SPAWN_PROTECTION;
    p.aliveSince = this.world.time;
    p.knockUntil = 0;
    p.panic = null;
    p.slowUntil = 0;
  }

  /**
   * Mends a player resting beside a burning campfire, and pays out what
   * their kills with a feeding weapon are owed (held back by fresh wounds,
   * wasted at full health). Health comes back no other way on its own.
   */
  private rest(p: Player, dt: number): void {
    const time = this.world.time;
    p.wounds = p.wounds.filter((w): boolean => time - w.at < FRESH_WOUND_SECONDS);
    if (p.dead) {
      return;
    }
    if (this.world.nearLitCampfire(p.x, p.y, CAMPFIRE_HEAL_RADIUS)) {
      this.heal(p, CAMPFIRE_HEAL_PER_SECOND * dt);
    }
    if (p.feast > 0) {
      const due = Math.min(p.feast, FEAST_HEAL_PER_SECOND * dt);
      p.feast -= p.hp >= MAX_HP ? due : this.heal(p, due);
    }
  }

  /**
   * Damage too fresh to heal yet, never more than the health missing.
   */
  private wounded(p: Player): number {
    return Math.min(MAX_HP - p.hp, p.wounds.reduce((sum: number, w): number => sum + w.amount, 0));
  }

  /**
   * Highest a player can heal to right now.
   */
  private healCap(p: Player): number {
    return MAX_HP - this.wounded(p);
  }

  /**
   * Heals up to `amount`, never into fresh wounds. Returns how much.
   */
  private heal(p: Player, amount: number): number {
    const healed = Math.max(0, Math.min(amount, this.healCap(p) - p.hp));
    p.hp += healed;
    return healed;
  }

  /**
   * Keeps bodies from overlapping. A player and a zombie or vampire that
   * touch are pushed apart with the monster taking most of it (so walking
   * into one shoves it along); two players split it evenly. Ghosts and the
   * dead pass through.
   */
  private separateBodies(): void {
    const living = [...this.players.values()].filter((p: Player): boolean => !p.dead);
    const apart = (ax: number, ay: number, bx: number, by: number, min: number): { nx: number; ny: number; overlap: number } | null => {
      const dx = bx - ax;
      const dy = by - ay;
      const d = Math.hypot(dx, dy);
      if (d >= min) {
        return null;
      }
      const angle = d > 0 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
      return { nx: Math.cos(angle), ny: Math.sin(angle), overlap: min - d };
    };
    for (const p of living) {
      for (const m of this.horde.bodies()) {
        const hit = apart(p.x, p.y, m.x, m.y, PLAYER_RADIUS + MONSTER_RADIUS);
        if (hit) {
          this.horde.shove(m.id, hit.nx * hit.overlap * MONSTER_SHOVE_SHARE, hit.ny * hit.overlap * MONSTER_SHOVE_SHARE, this.world);
          this.move(p, -hit.nx * hit.overlap * (1 - MONSTER_SHOVE_SHARE), -hit.ny * hit.overlap * (1 - MONSTER_SHOVE_SHARE));
        }
      }
    }
    for (let i = 0; i < living.length; i++) {
      for (let j = i + 1; j < living.length; j++) {
        const a = living[i];
        const b = living[j];
        const hit = apart(a.x, a.y, b.x, b.y, PLAYER_RADIUS * 2);
        if (hit) {
          this.move(a, -hit.nx * hit.overlap / 2, -hit.ny * hit.overlap / 2);
          this.move(b, hit.nx * hit.overlap / 2, hit.ny * hit.overlap / 2);
        }
      }
    }
  }

  /**
   * Shoves a player away from (fromX, fromY).
   */
  private knock(p: Player, fromX: number, fromY: number, distance = KNOCKBACK_DISTANCE): void {
    const dist = Math.hypot(p.x - fromX, p.y - fromY);
    const armor = p.bag.equipped.armor;
    distance *= armor ? GEAR[armor.kind].steady ?? 1 : 1;
    if (dist === 0 || distance <= 0) {
      return;
    }
    const speed = distance / KNOCKBACK_TIME;
    p.knockX = ((p.x - fromX) / dist) * speed;
    p.knockY = ((p.y - fromY) / dist) * speed;
    p.knockUntil = this.world.time + KNOCKBACK_TIME;
  }

  /**
   * Every living player and monster within the weapon's reach and arc in
   * front, and not too far above or below (see MELEE_REACH_UP): one swing
   * cleaves them all.
   */
  private meleeTargets(p: Player, weapon: WeaponStats): { players: Player[]; monsters: { id: number; kind: MonsterKind; x: number; y: number }[] } {
    const fx = Math.cos(p.facing);
    const fy = Math.sin(p.facing);
    const height = this.world.map.elevationAt(p.x, p.y);
    const inArc = (x: number, y: number): boolean => {
      const dx = x - p.x;
      const dy = y - p.y;
      const dist = Math.hypot(dx, dy);
      return dist <= weapon.reach && dist > 0 && (dx * fx + dy * fy) / dist >= weapon.arcCos
        && this.world.map.elevationAt(x, y) - height <= MELEE_REACH_UP
        && height - this.world.map.elevationAt(x, y) <= MELEE_REACH_DOWN;
    };
    return {
      players: [...this.players.values()].filter((o: Player): boolean => o !== p && !o.dead && inArc(o.x, o.y)),
      monsters: this.horde.targets().filter((m): boolean => inArc(m.x, m.y)),
    };
  }

  /**
   * Extra damage for swinging down at a target well below.
   */
  private highGround(p: Player, x: number, y: number): number {
    return this.world.map.elevationAt(p.x, p.y) - this.world.map.elevationAt(x, y) >= HIGH_GROUND ? HIGH_GROUND_BONUS : 0;
  }

  private weapon(p: Player): WeaponStats {
    return weaponStats(p.bag.equipped.weapon?.kind ?? null, p.tree);
  }

  /**
   * Starts a swing (landing STRIKE_DELAY later, see `strike`) or fires a
   * ranged weapon, which does nothing without its ammo (bolts in the bag,
   * or blood). A weapon that feeds on health takes it as the swing starts
   * and won't swing on the wielder's last.
   */
  private act(p: Player): void {
    if (p.blocking) {
      return;
    }
    const weapon = this.weapon(p);
    p.nextActionAt = this.world.time + weapon.cooldown;
    if (weapon.ranged) {
      if (weapon.ammo === 'blood' ? p.inventory.blood > 0 : this.count(p, weapon.ammo ?? 'bolts') > 0) {
        p.swings++;
        this.shoot(p, weapon);
      } else {
        this.sound(p, 'error');
      }
      return;
    }
    if (weapon.hpCost) {
      if (p.hp <= weapon.hpCost) {
        this.sound(p, 'error');
        return;
      }
      p.hp -= weapon.hpCost;
      p.hurts++;
    }
    p.swings++;
    p.strikeAt = this.world.time + STRIKE_DELAY;
  }

  /**
   * A swing landing with the equipped weapon. Players and monsters in
   * front take the hit first (all of them); otherwise it hits the facing
   * tile: refuels a light that's burning low (if carrying wood), damages
   * any other structure (full lights too), smashes a pumpkin, breaks a
   * chest open, or gathers if there's room to carry it. Every landed hit
   * wears the weapon down. Hitting a player ends spawn protection.
   */
  private strike(p: Player): void {
    const weapon = this.weapon(p);
    const targets = this.meleeTargets(p, weapon);
    if (targets.players.length > 0 || targets.monsters.length > 0) {
      if (targets.players.length > 0) {
        p.protectedUntil = 0;
        p.protected = false;
      }
      for (const o of targets.players) {
        if (this.hurt(o, weapon.damage + this.highGround(p, o.x, o.y), p, p.x, p.y)) {
          this.knock(o, p.x, p.y, weapon.knockback);
        }
      }
      for (const m of targets.monsters) {
        this.killer = p;
        const killed = this.horde.hit(m.id, damageTo(m.kind, weapon, weapon.damage + this.highGround(p, m.x, m.y)), p.x, p.y, this.world, weapon.knockback);
        if (killed && weapon.feast) {
          p.feast += weapon.feast;
        }
      }
      this.killer = null;
      this.sound(p, 'hit');
      this.wear(p, 'weapon');
      return;
    }
    const { tx, ty } = facingTile(p.x, p.y, p.facing);
    const tile = this.world.map.get(tx, ty);
    if (tile === 'pumpkin') {
      const broke = this.world.hitPumpkin(tx, ty);
      if (broke && Math.random() < PUMPKIN_LOOT_CHANCE) {
        this.pocket(p, randomLoot(NO_TREE), tx + 0.5, ty + 0.5);
      }
      this.events.push({ t: 'smash', tx, ty, tile, broke, health: this.world.health(tx, ty) });
      this.sound(p, broke ? 'break' : 'hit');
      this.wear(p, 'weapon');
      return;
    }
    if (tile === 'chest') {
      this.world.openChest(tx, ty);
      this.spillChest(p, tx, ty);
      this.events.push({ t: 'smash', tx, ty, tile, broke: true, health: 0 });
      this.sound(p, 'break');
      return;
    }
    if (tile === 'altar') {
      this.offer(p, tx, ty);
      return;
    }
    if (tile === 'sentry' && p.inventory.blood > 0 && this.world.load(tx, ty, SENTRY_SHOTS_PER_BLOOD, SENTRY_MAX_SHOTS)) {
      this.pay(p, stock({ blood: 1 }));
      this.sound(p, 'refuel');
      return;
    }
    if (isStructure(tile)) {
      if (this.world.feed(tx, ty, (cost: Bundle): boolean => this.pay(p, cost))) {
        this.inventoryChanged.add(p.token);
        this.sound(p, 'refuel');
        return;
      }
      if (this.world.relight(tx, ty)) {
        this.sound(p, 'refuel');
        return;
      }
      if (STRUCTURES[tile].light && STRUCTURES[tile].light!.burn !== WORKING_GLOW) {
        this.world.damage(tx, ty, Infinity);
        this.pocket(p, { build: tile, count: 1 }, tx + 0.5, ty + 0.5);
        p.protectedUntil = 0;
        this.sound(p, 'break');
        this.events.push({ t: 'chips', tx, ty, chip: 'wood', health: 0 });
        this.wear(p, 'weapon');
        return;
      }
      this.world.damage(tx, ty, SWING_DAMAGE * weapon.chop);
      p.protectedUntil = 0;
      if (this.world.structureHp(tx, ty) === null) {
        this.pocket(p, { build: tile, count: 1 }, tx + 0.5, ty + 0.5);
      }
      const chip = STONE_STRUCTURES.has(tile) ? 'stone' : 'wood';
      this.sound(p, chip === 'stone' ? 'mine' : 'chop');
      this.events.push({ t: 'chips', tx, ty, chip, health: this.world.health(tx, ty) });
      this.wear(p, 'weapon');
      return;
    }
    if (tile === 'tombstone' || tile === 'cross') {
      this.dig(p, tx, ty, tile, weapon.chop);
      return;
    }
    if (tile === 'statue' || tile === 'crypt' || tile === 'mausoleum') {
      this.rob(p, tx, ty, tile, weapon.chop);
      return;
    }
    if (tile === 'lamp') {
      this.world.breakLamp(tx, ty);
      this.pocket(p, { build: 'lantern', count: 1 }, tx + 0.5, ty + 0.5);
      this.sound(p, 'break');
      this.events.push({ t: 'chips', tx, ty, chip: 'stone', health: 0 });
      this.wear(p, 'weapon');
      return;
    }
    const g = GATHERABLE[tile];
    if (!g) {
      return;
    }
    let broke = false;
    for (let i = 0; i < weapon.chop && !broke; i++) {
      broke = this.world.gather(tx, ty);
    }
    const resource = g.resource;
    if (broke && resource) {
      const taken = this.take(p, resource, g.amount);
      if (taken > 0) {
        this.events.push({ t: 'pickup', x: p.x, y: p.y, goods: resource });
      }
      if (taken < g.amount) {
        this.world.addItem(tx + 0.5, ty + 0.5, stock({ [resource]: g.amount - taken }), null);
      }
    }
    this.sound(p, resource === 'wood' ? 'chop' : 'mine');
    this.events.push({ t: 'chips', tx, ty, chip: resource === 'wood' ? 'wood' : 'stone', health: this.world.health(tx, ty) });
    this.wear(p, 'weapon');
  }

  /**
   * Bleeds a player on an altar: it takes some health (never their last)
   * and gives blood, more from an altar built by someone further up the
   * tree, and the altar glows for a while.
   */
  private offer(p: Player, tx: number, ty: number): void {
    if (p.hp <= ALTAR_HP_COST) {
      this.sound(p, 'error');
      return;
    }
    p.hp -= ALTAR_HP_COST;
    p.hurts++;
    const blood = altarBlood(this.world.structureLevel(tx, ty));
    this.take(p, 'blood', blood);
    this.events.push({ t: 'pickup', x: p.x, y: p.y, goods: 'blood' });
    this.world.kindle(tx, ty, WORKING_GLOW);
    this.events.push({ t: 'chips', tx, ty, chip: 'stone', health: this.world.health(tx, ty) });
    this.sound(p, 'unlock');
  }

  /**
   * Every loaded blood sentry fires at the nearest zombie or vampire in
   * range, if any.
   */
  private fireSentries(): void {
    for (const sentry of this.world.readySentries()) {
      const x = sentry.tx + 0.5;
      const y = sentry.ty + 0.5;
      let target: { x: number; y: number } | null = null;
      let best = SENTRY_RANGE;
      for (const m of this.horde.bodies()) {
        const d = Math.hypot(m.x - x, m.y - y);
        if (d < best) {
          best = d;
          target = m;
        }
      }
      if (!target) {
        continue;
      }
      sentry.fire(SENTRY_COOLDOWN);
      const angle = Math.atan2(target.y - y, target.x - x);
      this.shots.push({
        id: this.nextShotId++,
        x: x + Math.cos(angle) * 0.55,
        y: y + Math.sin(angle) * 0.55,
        angle,
        kind: 'blood',
        left: SENTRY_RANGE + 1,
        height: this.world.map.base(sentry.tx, sentry.ty) + BOLT_HEIGHT + 0.3,
        owner: null,
        damage: sentryDamage(sentry.level),
        knockback: 0.8,
        speed: BOLT_SPEED,
        weapon: 'blood-gun',
        hostile: false,
        by: 'Blood sentry',
      });
    }
  }

  /**
   * Digs at a grave, `hits` times. Once it's dug up the stone sinks away
   * and the grave gives up candy, maybe wood, maybe a piece of gear, and
   * maybe a blueprint, which unlocks a node of the digger's skill tree.
   */
  private dig(p: Player, tx: number, ty: number, tile: 'tombstone' | 'cross', hits: number): void {
    let done = false;
    for (let i = 0; i < hits && !done; i++) {
      done = this.world.dig(tx, ty);
    }
    this.events.push({ t: 'dig', tx, ty, tile, done, health: this.world.health(tx, ty) });
    this.sound(p, done ? 'break' : 'dig');
    this.wear(p, 'weapon');
    if (!done) {
      return;
    }
    const roll = ([min, max]: [number, number]): number => min + Math.floor(Math.random() * (max - min + 1));
    this.award(p, stock({
      wood: Math.random() < DIG_WOOD_CHANCE ? roll(DIG_WOOD) : 0,
      bone: Math.random() < DIG_BONE_CHANCE ? roll(DIG_BONES) : 0,
      candy: roll(DIG_CANDY),
    }), tx + 0.4, ty + 0.55);
    const missing = BLUEPRINTS.filter((id: NodeId): boolean => !p.tree.found.includes(id));
    if (missing.length > 0 && Math.random() < DIG_BLUEPRINT_CHANCE) {
      const found = missing[Math.floor(Math.random() * missing.length)];
      p.tree.found.push(found);
      this.events.push({ t: 'blueprint', finder: p.name, finderColor: p.color, label: itemLabel(found) });
      this.inventoryChanged.add(p.token);
    }
  }

  /**
   * Digs at a statue, crypt, or mausoleum. The dig that robs it spills
   * candy and bones, maybe a piece of gear, and maybe a blueprint; one
   * already robbed has nothing left for a while.
   */
  private rob(p: Player, tx: number, ty: number, tile: 'statue' | 'crypt' | 'mausoleum', hits: number): void {
    let result: 'dug' | 'done' | 'robbed' = 'dug';
    for (let i = 0; i < hits && result === 'dug'; i++) {
      result = this.world.rob(tx, ty);
    }
    if (result === 'robbed') {
      this.sound(p, 'error');
      return;
    }
    const done = result === 'done';
    this.events.push({ t: 'dig', tx, ty, tile, done, health: this.world.health(tx, ty) });
    this.sound(p, done ? 'break' : 'dig');
    this.wear(p, 'weapon');
    if (!done) {
      return;
    }
    const roll = ([min, max]: [number, number]): number => min + Math.floor(Math.random() * (max - min + 1));
    const { x, y } = this.spillSpot(p, tx, ty);
    this.award(p, stock({ candy: roll(ROB_CANDY[tile]), bone: roll(DIG_BONES) }), x, y);
    if (Math.random() < ROB_GEAR_CHANCE) {
      this.pocket(p, randomLoot(NO_TREE), x, y);
    }
    const missing = BLUEPRINTS.filter((id: NodeId): boolean => !p.tree.found.includes(id));
    if (missing.length > 0 && Math.random() < ROB_BLUEPRINT_CHANCE) {
      const found = missing[Math.floor(Math.random() * missing.length)];
      p.tree.found.push(found);
      this.events.push({ t: 'blueprint', finder: p.name, finderColor: p.color, label: itemLabel(found) });
      this.inventoryChanged.add(p.token);
    }
  }

  /**
   * Where loot from a solid tile lands: on the robber's side of it.
   */
  private spillSpot(p: Player, tx: number, ty: number): { x: number; y: number } {
    const cx = tx + 0.5;
    const cy = ty + 0.5;
    const d = Math.hypot(p.x - cx, p.y - cy) || 1;
    return { x: cx + ((p.x - cx) / d) * 0.75, y: cy + ((p.y - cy) / d) * 0.75 };
  }

  /**
   * Looses a bolt (or a gob of blood) the way the player faces, at chest
   * height. It carries further from higher up.
   */
  private shoot(p: Player, weapon: WeaponStats): void {
    const height = this.world.map.elevationAt(p.x, p.y);
    if (Math.random() >= (weapon.thrift ?? 0)) {
      this.pay(p, stock({ [weapon.ammo ?? 'bolts']: 1 }));
    }
    this.sound(p, 'shoot');
    this.wear(p, 'weapon');
    this.shots.push({
      id: this.nextShotId++,
      x: p.x + Math.cos(p.facing) * 0.4,
      y: p.y + Math.sin(p.facing) * 0.4,
      angle: p.facing,
      kind: weapon.ammo === 'blood' ? 'blood' : weapon.ammo === 'arrows' ? 'arrow' : 'bolt',
      weapon: p.bag.equipped.weapon?.kind ?? null,
      left: weapon.reach + BOLT_RANGE_PER_LEVEL * Math.max(0, height) / LEVEL_HEIGHT,
      height: height + BOLT_HEIGHT,
      owner: p,
      damage: weapon.damage,
      knockback: weapon.knockback,
      speed: BOLT_SPEED,
      hostile: false,
      by: p.name,
    });
  }

  /**
   * Flies every bolt forward in small steps; it stops at the first solid
   * tile, rise in the ground above it, monster, or player (never its
   * shooter) it meets, or at the end of its range.
   */
  private stepShots(dt: number): void {
    const mirrors = this.world.structuresOf('mirror').map(({ tx, ty }): { x: number; y: number } => ({ x: tx + 0.5, y: ty + 0.5 }));
    this.shots = this.shots.filter((s: Shot): boolean => {
      if (s.hostile && mirrors.some((m): boolean => Math.hypot(m.x - s.x, m.y - s.y) <= MIRROR_RADIUS)) {
        if (s.kind === 'potion') {
          this.events.push({ t: 'splash', x: s.x, y: s.y });
          return false;
        }
        s.hostile = false;
        s.angle += Math.PI;
        s.left = Math.max(s.left, 8);
        s.height = Infinity;
      }
      const dx = Math.cos(s.angle);
      const dy = Math.sin(s.angle);
      for (let travel = s.speed * dt; travel > 0; travel -= SHOT_STEP) {
        const step = Math.min(SHOT_STEP, travel);
        s.x += dx * step;
        s.y += dy * step;
        s.left -= step;
        if (s.kind === 'potion') {
          if (s.left <= 0) {
            this.splash(s);
            return false;
          }
          continue;
        }
        const walled = !s.hostile || s.kind === 'arrow';
        if (s.left <= 0 || (walled && (this.world.map.isSolid(Math.floor(s.x), Math.floor(s.y)) || this.world.map.base(Math.floor(s.x), Math.floor(s.y)) > s.height))) {
          return false;
        }
        const monster = !s.hostile && this.horde.targets().find((m): boolean => Math.hypot(m.x - s.x, m.y - s.y) < MONSTER_RADIUS + 0.12);
        if (monster) {
          this.killer = s.owner;
          this.horde.hit(monster.id, damageTo(monster.kind, GEAR[s.weapon ?? 'blood-gun'].weapon!, s.damage), s.x - dx, s.y - dy, this.world, s.knockback);
          this.killer = null;
          return false;
        }
        const owner = s.owner;
        const target = (owner || s.hostile) && [...this.players.values()].find((o: Player): boolean => o !== owner && !o.dead && Math.hypot(o.x - s.x, o.y - s.y) < PLAYER_RADIUS + 0.12);
        if (s.hostile && target) {
          if (this.hurt(target, s.damage, s.by, s.x - dx, s.y - dy) && s.kind === 'ecto') {
            target.slowUntil = this.world.time + GHOST_SLOW_SECONDS;
          }
          return false;
        }
        const player = owner && target;
        if (owner && player) {
          owner.protectedUntil = 0;
          if (this.hurt(player, s.damage, owner, s.x - dx, s.y - dy)) {
            this.knock(player, s.x - dx, s.y - dy, s.knockback);
          }
          return false;
        }
      }
      return true;
    });
  }

  /**
   * A witch's potion bursts: everyone within SPLASH_RADIUS takes its
   * damage, and it leaves a puddle (see `stepPuddles`).
   */
  private splash(s: Shot): void {
    this.events.push({ t: 'splash', x: s.x, y: s.y });
    this.puddles.push({ id: this.nextPuddleId++, x: s.x, y: s.y, at: this.world.time, until: this.world.time + PUDDLE_SECONDS, by: s.by });
    for (const p of this.players.values()) {
      if (!p.dead && Math.hypot(p.x - s.x, p.y - s.y) <= SPLASH_RADIUS) {
        this.hurt(p, s.damage, s.by, s.x, s.y);
      }
    }
  }

  /**
   * Witches' puddles: anyone standing in one is slowed and takes
   * PUDDLE_DAMAGE a second; they dry up after PUDDLE_SECONDS.
   */
  private stepPuddles(dt: number): void {
    const time = this.world.time;
    this.puddles = this.puddles.filter((puddle): boolean => time < puddle.until);
    for (const p of this.players.values()) {
      const puddle = !p.dead && this.puddles.find((q): boolean => Math.hypot(p.x - q.x, p.y - q.y) <= SPLASH_RADIUS);
      if (puddle) {
        p.slowUntil = Math.max(p.slowUntil, time + 0.25);
        this.hurt(p, PUDDLE_DAMAGE * dt, puddle.by);
      }
    }
  }

  puddleStates(): PuddleState[] {
    const time = this.world.time;
    return this.puddles.map(({ id, x, y, at, until }): PuddleState => ({ id, x, y, life: Math.round(((until - time) / (until - at)) * 100) / 100 }));
  }

  /**
   * Uses up some of an equipped piece (a hit, a block, or seconds of
   * burning); it breaks at zero. The phone only hears about whole units.
   */
  private wear(p: Player, slot: GearSlot, amount = 1): void {
    const item = p.bag.equipped[slot];
    if (!item) {
      return;
    }
    const before = Math.ceil(item.wear);
    item.wear -= amount;
    if (item.wear <= 0) {
      p.bag.equipped[slot] = null;
      this.sound(p, 'break');
    }
    if (Math.ceil(item.wear) !== before) {
      this.inventoryChanged.add(p.token);
    }
  }

  /**
   * Softens a hit from (fromX, fromY): a shield takes the edge off hits
   * from the front, armor off every hit. Each block wears them down.
   */
  private guard(p: Player, amount: number, fromX: number, fromY: number): number {
    if (p.blocking) {
      const dx = fromX - p.x;
      const dy = fromY - p.y;
      const d = Math.hypot(dx, dy);
      if (d === 0 || (dx * Math.cos(p.facing) + dy * Math.sin(p.facing)) / d >= 0) {
        amount *= gearGuard('shield', p.tree);
        this.wear(p, 'offhand');
      }
    }
    const armor = p.bag.equipped.armor;
    if (armor) {
      amount *= gearGuard(armor.kind, p.tree);
      this.wear(p, 'armor');
    }
    return amount;
  }

  /**
   * Puts a bag item away: gear in its slot if that's empty (unless `equip`
   * is false), otherwise the first free bag slot; structures onto stacks of
   * the same kind (up to BUILD_STACK), then free slots. Returns what didn't
   * fit, or null.
   */
  private store(p: Player, item: BagItem, equip = true): BagItem | null {
    this.inventoryChanged.add(p.token);
    if (isGearItem(item) && item.kind === 'torch') {
      item = { build: 'torch', count: 1 };
    }
    if (isMaterialItem(item)) {
      let left = item.count;
      for (const other of p.bag.bag) {
        if (left > 0 && other && isMaterialItem(other) && other.material === item.material && other.count < MATERIAL_STACK) {
          const moved = Math.min(left, MATERIAL_STACK - other.count);
          other.count += moved;
          left -= moved;
        }
      }
      for (let i = 0; i < p.bag.bag.length && left > 0; i++) {
        if (!p.bag.bag[i]) {
          const moved = Math.min(left, MATERIAL_STACK);
          p.bag.bag[i] = { material: item.material, count: moved };
          left -= moved;
        }
      }
      return left > 0 ? { material: item.material, count: left } : null;
    }
    if (isGearItem(item)) {
      const slot = GEAR[item.kind].slot;
      const clash = (slot === 'offhand' && item.kind === 'shield' && twoHanded(p.bag.equipped.weapon?.kind))
        || (slot === 'weapon' && twoHanded(item.kind) && p.bag.equipped.offhand?.kind === 'shield');
      if (equip && !p.bag.equipped[slot] && !clash) {
        p.bag.equipped[slot] = item;
        return null;
      }
      const free = p.bag.bag.indexOf(null);
      if (free < 0) {
        return item;
      }
      p.bag.bag[free] = item;
      return null;
    }
    let left = item.count;
    for (const other of p.bag.bag) {
      if (left > 0 && other && isBuildItem(other) && other.build === item.build && other.count < BUILD_STACK) {
        const moved = Math.min(left, BUILD_STACK - other.count);
        other.count += moved;
        left -= moved;
      }
    }
    for (let i = 0; i < p.bag.bag.length && left > 0; i++) {
      if (!p.bag.bag[i]) {
        const moved = Math.min(left, BUILD_STACK);
        p.bag.bag[i] = { build: item.build, count: moved };
        left -= moved;
      }
    }
    return left > 0 ? { build: item.build, count: left } : null;
  }

  /**
   * Drops a player's bag where they stand: materials as one pile, each
   * piece of gear and stack of structures scattered around it.
   */
  private spill(p: Player): void {
    const pile = stock();
    for (const item of p.bag.bag) {
      if (item && isMaterialItem(item)) {
        pile[item.material] += item.count;
      } else if (item) {
        const angle = Math.random() * Math.PI * 2;
        this.world.addHeld(p.x + Math.cos(angle) * 0.4, p.y + Math.sin(angle) * 0.4, item, null);
      }
    }
    if (GOODS.some((g: Goods): boolean => pile[g] > 0)) {
      this.world.addItem(p.x, p.y, pile, null);
    }
  }

  private count(p: Player, material: Material): number {
    return bagCount(p.bag.bag, material);
  }

  private canPay(p: Player, cost: Bundle): boolean {
    return canAfford(cost, p.inventory, p.bag.bag);
  }

  /**
   * Takes `cost` from a player, emptying bag stacks from the last slot
   * back. Returns false (taking nothing) if they can't cover it.
   */
  private pay(p: Player, cost: Bundle): boolean {
    if (!this.canPay(p, cost)) {
      return false;
    }
    for (const r of RESOURCES) {
      p.inventory[r] -= cost[r];
    }
    for (const m of MATERIALS) {
      let owed = cost[m];
      for (let i = p.bag.bag.length - 1; i >= 0 && owed > 0; i--) {
        const item = p.bag.bag[i];
        if (item && isMaterialItem(item) && item.material === m) {
          const used = Math.min(owed, item.count);
          item.count -= used;
          owed -= used;
          if (item.count === 0) {
            p.bag.bag[i] = null;
          }
        }
      }
    }
    this.syncBuilding(p);
    this.inventoryChanged.add(p.token);
    return true;
  }

  /**
   * Whether one more of a material fits in a player's bag.
   */
  private fits(p: Player, material: Material): boolean {
    return p.bag.bag.some((item: BagItem | null): boolean => !item || (isMaterialItem(item) && item.material === material && item.count < MATERIAL_STACK));
  }

  /**
   * Gives a player up to `amount` of some goods: candy and blood always
   * fit, materials as far as the bag has room. Returns how much they took.
   */
  private take(p: Player, goods: Goods, amount: number): number {
    if (goods === 'candy' || goods === 'blood') {
      p.inventory[goods] += amount;
      this.inventoryChanged.add(p.token);
      return amount;
    }
    const left = this.store(p, { material: goods, count: amount });
    return amount - (left && isMaterialItem(left) ? left.count : 0);
  }

  /**
   * Leaves a bag item on the ground: materials as a pile, anything else as
   * an item to grab.
   */
  private dropAt(x: number, y: number, item: BagItem): void {
    if (isMaterialItem(item)) {
      this.world.addItem(x, y, stock({ [item.material]: item.count }), null);
    } else {
      this.world.addHeld(x, y, item, null);
    }
  }

  /**
   * Scatters a chest's contents over its tile: a piece of gear and a pile
   * of resources.
   */
  private spillChest(p: Player, tx: number, ty: number): void {
    const roll = (most: number): number => 1 + Math.floor(Math.random() * most);
    this.award(p, stock({
      wood: roll(CHEST_WOOD),
      candy: roll(CHEST_CANDY),
      bolts: Math.random() < CHEST_BOLT_CHANCE ? roll(CHEST_BOLTS) : 0,
    }), tx + 0.35, ty + 0.5);
    this.pocket(p, randomLoot(NO_TREE), tx + 0.65, ty + 0.5);
  }

  /**
   * Puts what someone broke or found straight into their bag (never into
   * a hand), or onto the ground at (x, y) if it doesn't fit.
   */
  private pocket(p: Player, item: BagItem, x: number, y: number): void {
    const left = this.store(p, item, false);
    if (left) {
      this.world.addHeld(x, y, left, null);
    }
  }

  /**
   * Hands loot straight to whoever broke or killed what it came from (a
   * popup over them for each kind); whatever won't fit in the bag drops at
   * (x, y) as a pile.
   */
  private award(p: Player, loot: Bundle, x: number, y: number): void {
    const left = stock();
    let got = false;
    for (const g of GOODS) {
      if (loot[g] <= 0) {
        continue;
      }
      const taken = this.take(p, g, loot[g]);
      left[g] = loot[g] - taken;
      if (taken > 0) {
        got = true;
        this.events.push(g === 'candy' ? { t: 'candy', x: p.x, y: p.y, amount: taken } : { t: 'pickup', x: p.x, y: p.y, goods: g });
      }
    }
    if (got) {
      this.inventoryChanged.add(p.token);
      this.sound(p, loot.candy > 0 ? 'candy' : 'pickup');
    }
    if (GOODS.some((g: Goods): boolean => left[g] > 0)) {
      this.world.addItem(x, y, left, null);
    }
  }

  /**
   * Picks up gear and stacks of structures the player walks over, into the
   * bag (never equipped). Something they just dropped waits a moment.
   */
  private autoGrab(p: Player): void {
    for (const item of this.world.heldUnder(p.id, p.x, p.y)) {
      const left = this.store(p, item.held, false);
      if (left && (!isBuildItem(left) || !isBuildItem(item.held) || left.count === item.held.count)) {
        continue;
      }
      this.world.setHeld(item.id, left);
      this.sound(p, 'equip');
    }
  }


  /**
   * Takes a player out of the game, keeping what they carry and their
   * skill tree (and their id, so their coffin stays theirs) for when
   * someone joins again under the same name.
   */
  private remove(p: Player): void {
    this.departed.set(p.name.toLowerCase(), { id: p.id, inventory: p.inventory, bag: p.bag, tree: p.tree, onlineSeconds: p.onlineSeconds });
    this.players.delete(p.token);
  }

  /**
   * Beside the player's own coffin, if they built one and there's room
   * next to it.
   */
  private coffinSpawn(p: Player): { x: number; y: number } | null {
    const coffin = this.world.coffinOf(p.id);
    if (!coffin) {
      return null;
    }
    const sides: [number, number][] = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    const side = sides.find(([dx, dy]): boolean => !isSolidTile(this.world.map.get(coffin.tx + dx, coffin.ty + dy)) && !isTrap(this.world.map.get(coffin.tx + dx, coffin.ty + dy)));
    return side ? { x: coffin.tx + side[0] + 0.5, y: coffin.ty + side[1] + 0.5 } : null;
  }

  private randomSpawn(): { x: number; y: number } {
    const s = this.spawns[Math.floor(Math.random() * this.spawns.length)];
    return { x: s.x, y: s.y };
  }

  private publicState(p: Player): PlayerState {
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      x: Math.round(p.x * 1000) / 1000,
      y: Math.round(p.y * 1000) / 1000,
      facing: Math.round(p.facing * 1000) / 1000,
      moving: p.moving,
      lifted: p.lifted,
      slowed: this.world.time < p.slowUntil,
      connected: p.connected,
      swings: p.swings,
      building: p.building,
      hp: Math.round(p.hp * 10) / 10,
      wounded: Math.round(this.wounded(p) * 10) / 10,
      hurts: p.hurts,
      dead: p.dead,
      protected: p.protected,
      blocking: p.blocking,
      gear: {
        weapon: p.bag.equipped.weapon?.kind ?? null,
        offhand: p.bag.equipped.offhand?.kind ?? null,
        armor: p.bag.equipped.armor?.kind ?? null,
      },
    };
  }

  private identityOf(p: Player): PlayerIdentity {
    return { token: p.token, player: this.publicState(p) };
  }
}
