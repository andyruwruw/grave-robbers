// Packages
import { emptyGear } from '@halloween/shared/inventory/bag-items';
import { DEFAULT_GAME_SETTINGS } from '@halloween/shared/protocol/game-settings';

// Local Imports
import { TestBotSystem } from './bots/test-bot-system';
import { BuildSystem } from './building/build-system';
import { CraftSystem } from './building/craft-system';
import { ActionSystem } from './combat/action-system';
import { DamageSystem } from './combat/damage-system';
import { MeleeSystem } from './combat/melee-system';
import { TurretSystem } from './combat/turrets/turret-system';
import { GameHordeHooks } from './core/game-horde-hooks';
import { Outbox } from './core/outbox';
import { PlayerRoster } from './core/player-roster';
import { emptyInventory } from './helpers/inventory';
import { Horde } from './horde/horde';
import { BagSystem } from './inventory/bag-system';
import { DropSystem } from './inventory/drop-system';
import { HandsSystem } from './inventory/hands-system';
import { MonsterSpoilsSystem } from './inventory/monster-spoils-system';
import { PickupSystem } from './inventory/pickup-system';
import { StashSystem } from './inventory/stash-system';
import { TileJobSystem } from './jobs/tile-job-system';
import { MovementSystem } from './movement/movement-system';
import { PanicSystem } from './movement/panic-system';
import { ControlSystem } from './players/control-system';
import { JoinSystem } from './players/join-system';
import { LifeSystem } from './players/life-system';
import { PlayerTickSystem } from './players/player-tick-system';
import { ViewSystem } from './players/view-system';
import { BloodMoonSystem } from './progression/blood-moon-system';
import { LevelSystem } from './progression/level-system';
import { AimingSystem } from './ranged/aiming-system';
import { PuddleSystem } from './ranged/puddle-system';
import { RangedSystem } from './ranged/ranged-system';
import { ShotSystem } from './ranged/shot-system';
import { DEFAULT_PRESET } from './storage/config/presets';
import { loadPreset } from './storage/presets';
import { ConjureSystem } from './tv/conjure-system';
import { GameTabSystem } from './tv/game-tab-system';
import { TvHandSystem } from './tv/tv-hand-system';
import { World } from './world/world';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { Player } from './players/player';
import type { WorldSave } from './storage/types/save';

/**
 * The authoritative simulation. Knows nothing about sockets: the hub reads
 * snapshots and drains events and inventory changes after each step.
 */
export class Game {
  /**
   * Who is in the game, and what leavers keep.
   */
  readonly roster = new PlayerRoster();

  /**
   * What the hub drains after each step.
   */
  readonly outbox = new Outbox(this);

  /**
   * Players as the TV and their phones see them.
   */
  readonly views = new ViewSystem(this);

  /**
   * Putting goods into and taking them out of bags.
   */
  readonly bag = new BagSystem(this);

  /**
   * Dropping and spilling onto the ground.
   */
  readonly drops = new DropSystem(this);

  /**
   * Loot handed over and what players walk over.
   */
  readonly pickups = new PickupSystem(this);

  /**
   * Equipping and moving items between slots.
   */
  readonly hands = new HandsSystem(this);

  /**
   * Hits on players, guarding, knockback, and wear.
   */
  readonly damage = new DamageSystem(this);

  /**
   * Death, respawning, and healing.
   */
  readonly life = new LifeSystem(this);

  /**
   * The sticks, buttons, turning, and ping a phone sends.
   */
  readonly controls = new ControlSystem(this);

  /**
   * Walking, knockback, and bodies pushing apart.
   */
  readonly movement = new MovementSystem(this);

  /**
   * Running from monsters after the Panic button.
   */
  readonly panics = new PanicSystem(this);

  /**
   * Shots in flight.
   */
  readonly shots = new ShotSystem(this);

  /**
   * Potion splashes and the puddles they leave.
   */
  readonly puddles = new PuddleSystem(this);

  /**
   * Firing ranged weapons and reloading.
   */
  readonly ranged = new RangedSystem(this);

  /**
   * Crossbow lock-on and aim assist.
   */
  readonly aiming = new AimingSystem(this);

  /**
   * Swings on the facing tile.
   */
  readonly jobs = new TileJobSystem(this);

  /**
   * Melee swings and the blows they land.
   */
  readonly melee = new MeleeSystem(this);

  /**
   * The Action button and combat timers.
   */
  readonly actions = new ActionSystem(this);

  /**
   * Turrets firing at monsters.
   */
  readonly turrets = new TurretSystem(this);

  /**
   * Monster loot and who claims it.
   */
  readonly spoils = new MonsterSpoilsSystem(this);

  /**
   * Placing structures.
   */
  readonly building = new BuildSystem(this);

  /**
   * Crafting and upgrades.
   */
  readonly crafting = new CraftSystem(this);

  /**
   * The blood moon and the calm before it.
   */
  readonly moon = new BloodMoonSystem(this);

  /**
   * The hidden player and world levels.
   */
  readonly levels = new LevelSystem(this);

  /**
   * The TV mouse's lift and light.
   */
  readonly tvHand = new TvHandSystem(this);

  /**
   * The Game tab's spawn and kill buttons.
   */
  readonly conjure = new ConjureSystem(this);

  /**
   * The Game tab's test player.
   */
  readonly testBot = new TestBotSystem(this);

  /**
   * The Game tab switches.
   */
  readonly gameTab = new GameTabSystem(this);

  /**
   * Storage chests.
   */
  readonly stash = new StashSystem(this);

  /**
   * Each player's part of a step.
   */
  readonly playerTick = new PlayerTickSystem(this);

  /**
   * Joining, resuming, and leaving.
   */
  readonly joining = new JoinSystem(this);

  /**
   * Every monster.
   */
  readonly horde = new Horde<Player>(new GameHordeHooks(this));

  /**
   * The TV's Game tab switches.
   */
  settings: GameSettings = { ...DEFAULT_GAME_SETTINGS };

  /**
   * The map and everything on it (replaced by `reset`).
   */
  world: World;

  /**
   * Steps run so far.
   */
  tick = 0;

  /**
   * Loads the world (or the default preset) and applies its spawning.
   * @param save The saved world, or null to start from the default preset.
   */
  constructor(save: WorldSave | null) {
    this.world = new World(save, save ? null : loadPreset(DEFAULT_PRESET));
    this.roster.resetSpawns(this.world.map);
    this.gameTab.configure({ spawning: !this.world.quiet });
  }

  /**
   * Replaces the world with a fresh one, on a preset's map (the default
   * one when not given) or a random one (`null`, shaped by `gen`). Players
   * keep their identity but start over at a spawn point with empty pockets.
   * @param preset The preset (default: DEFAULT_PRESET), or null for a random
   *   map.
   * @param gen How to shape a random map.
   */
  reset(preset?: string | null, gen?: MapGenSettings): void {
    this.world = new World(null, preset === null ? null : loadPreset(preset ?? DEFAULT_PRESET), gen);
    this.roster.resetSpawns(this.world.map);
    this.gameTab.configure({ spawning: !this.world.quiet });
    this.horde.clear();
    this.shots.reset();
    this.moon.reset();
    for (const p of this.roster.players.values()) {
      p.inventory = emptyInventory();
      p.bag = emptyGear();
      this.outbox.inventoryChanged.add(p.token);
      this.life.respawn(p);
    }
    for (const kept of this.roster.departed.values()) {
      kept.inventory = emptyInventory();
      kept.bag = emptyGear();
    }
  }

  /**
   * Advances the simulation by `dt` seconds.
   * @param dt Seconds since the last step.
   */
  step(dt: number): void {
    this.tick++;
    this.tvHand.checkTimeout();
    this.stash.returnSpilled();
    this.testBot.think();
    for (const p of this.roster.players.values()) {
      this.playerTick.step(p, dt);
    }
    this.turrets.fireTurrets();
    this.shots.stepShots(dt);
    this.puddles.stepPuddles(dt);
    this.moon.advanceBloodMoon(dt);
    this.levels.advanceLevels(dt);
    this.horde.step(dt, this.world, [...this.roster.players.values()], this.moon.bloodMoon());
    this.movement.separateBodies();
    const occupants = [...this.roster.players.values()].filter((p: Player): boolean => !p.dead);
    for (const g of this.world.step(dt, [...occupants, ...this.horde.bodies()])) {
      this.outbox.events.push({ t: 'grow', ...g });
    }
    for (const d of this.world.diggers.takeDug()) {
      this.outbox.events.push({ t: 'dig', ...d, done: true, health: 1 });
    }
  }
}
