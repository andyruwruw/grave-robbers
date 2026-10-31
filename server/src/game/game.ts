// Packages
import { emptyGear } from '@halloween/shared/inventory/bag-items';
import { DEFAULT_GAME_SETTINGS } from '@halloween/shared/protocol/game-settings';

// Local Imports
import { TestBotSystem } from './bots/test-bot-system';
import { guard } from './helpers/guard';
import { BuildSystem } from './building/build-system';
import { CraftSystem } from './building/craft-system';
import { ActionSystem } from './combat/action-system';
import { DamageSystem } from './combat/damage-system';
import { InfusionSystem } from './combat/infusions/infusion-system';
import { MeleeTricksSystem } from './combat/infusions/melee-tricks-system';
import { MeleeSystem } from './combat/melee-system';
import { PatchSystem } from './combat/patches/patch-system';
import { TurretSystem } from './combat/turrets/turret-system';
import { GameHordeHooks } from './core/game-horde-hooks';
import { LoadGovernor } from './core/load-governor';
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
import { UseSystem } from './inventory/use-system';
import { TileJobSystem } from './jobs/tile-job-system';
import { MovementSystem } from './movement/movement-system';
import { PanicSystem } from './movement/panic-system';
import { ControlSystem } from './players/control-system';
import { JoinSystem } from './players/join-system';
import { LifeSystem } from './players/life-system';
import { PlayerTickSystem } from './players/player-tick-system';
import { ViewSystem } from './players/view-system';
import { LevelSystem } from './progression/level-system';
import { WorldEventSystem } from './progression/world-event-system';
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
import type { LoadedSlot, MapPreset, WorldSave } from './storage/types/save';

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
   * Watches how long ticks take and lowers the monster caps (or sheds
   * monsters) when they run slow.
   */
  readonly governor = new LoadGovernor();

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
   * Scorched ground, fire trails, and incense infused weapons leave.
   */
  readonly patches = new PatchSystem(this);

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
   * Infused weapons' swing tricks (wail, chain, slam, fissure, nova,
   * incense, one-shots, the finisher's heal).
   */
  readonly meleeTricks = new MeleeTricksSystem(this);

  /**
   * What infused weapons do on a kill, however the monster died.
   */
  readonly infusions = new InfusionSystem(this);

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
   * World events (the blood moon) and the calm before each.
   */
  readonly worldEvents = new WorldEventSystem(this);

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
   * The USE button: panels and harmless actions on the facing tile.
   */
  readonly use = new UseSystem(this);

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
   * Opens a world slot: its saved world, settings, and characters (or the
   * default preset, for a new slot or none).
   * @param slot The slot as read from disk, or null.
   */
  constructor(slot: LoadedSlot | null = null) {
    this.world = new World(slot?.world ?? null, slot?.world ? null : loadPreset(DEFAULT_PRESET));
    this.settle(slot);
  }

  /**
   * Swaps in another world slot. Everyone in the game is dropped (their
   * phones go back to the join form, and the slot they were in should be
   * saved first); the slot's own characters come back as their phones
   * resume.
   * @param slot The slot as read from disk.
   */
  load(slot: LoadedSlot): void {
    this.testBot.toggle(false);
    this.roster.players.clear();
    this.horde.clear();
    this.shots.reset();
    this.patches.reset();
    this.worldEvents.reset();
    this.world = new World(slot.world, slot.world ? null : loadPreset(DEFAULT_PRESET));
    this.settle(slot);
  }

  /**
   * Everything about the world that goes in its `world.json`.
   * @returns The save.
   */
  worldSave(): WorldSave {
    return { ...this.world.save(), settings: { ...this.settings, testPlayer: false }, worldLevel: this.levels.worldLevel };
  }

  /**
   * Sets up around a newly opened world: spawn points, the slot's saved
   * characters, and its settings and world level (defaults for a new
   * world).
   * @param slot The slot it came from, or null.
   */
  private settle(slot: LoadedSlot | null): void {
    this.roster.resetSpawns(this.world.map);
    this.roster.away.clear();
    this.roster.changed.clear();
    this.roster.released.clear();
    for (const p of slot?.players ?? []) {
      this.roster.away.set(p.id, p);
    }
    for (const id of slot?.repaired ?? []) {
      this.roster.changed.add(id);
    }
    const saved = slot?.world?.save;
    this.settings.levelBoost = 0;
    this.levels.worldLevel = 0;
    this.gameTab.configure(saved ? { ...DEFAULT_GAME_SETTINGS, ...saved.settings, testPlayer: false } : { ...DEFAULT_GAME_SETTINGS, spawning: !this.world.quiet });
    this.levels.worldLevel = saved?.worldLevel ?? 0;
  }

  /**
   * Replaces the world with a fresh one, on a preset's map (the default
   * one when not given), a map already made (a huge one from its worker
   * thread), or a random one (`null`, shaped by `gen`). Players keep their
   * identity but start over at a spawn point with empty pockets.
   * @param preset The preset's id (default: DEFAULT_PRESET), a made map, or
   *   null for a random map.
   * @param gen How to shape a random map.
   */
  reset(preset?: string | MapPreset | null, gen?: MapGenSettings): void {
    const start = typeof preset === 'object' ? preset : loadPreset(preset ?? DEFAULT_PRESET);
    this.world = new World(null, start, gen);
    this.roster.resetSpawns(this.world.map);
    this.gameTab.configure({ spawning: !this.world.quiet });
    this.horde.clear();
    this.shots.reset();
    this.patches.reset();
    this.worldEvents.reset();
    for (const p of this.roster.players.values()) {
      p.inventory = emptyInventory();
      p.bag = emptyGear();
      this.outbox.inventoryChanged.add(p.token);
      this.life.respawn(p);
    }
    for (const kept of this.roster.away.values()) {
      kept.inventory = emptyInventory();
      kept.bag = emptyGear();
      kept.hp = 0;
      this.roster.changed.add(kept.id);
    }
  }

  /**
   * Advances the simulation by `dt` seconds. Each part runs guarded
   * (`guard`): one that throws is logged and skipped for this tick, and
   * everything after it still runs, so a bug can't freeze the game. The
   * load governor's monster cap share and shedding apply first.
   * @param dt Seconds since the last step.
   */
  step(dt: number): void {
    this.tick++;
    const players = [...this.roster.players.values()];
    guard('load', (): void => this.horde.setLoadScale(this.governor.scale));
    guard('shed', (): void => void this.horde.shed(this.governor.takeShed(), players));
    guard('tv hand', (): void => this.tvHand.checkTimeout());
    guard('stash spill', (): void => this.stash.returnSpilled());
    guard('test bot', (): void => this.testBot.think());
    for (const p of players) {
      guard('player tick', (): void => this.playerTick.step(p, dt));
    }
    guard('turrets', (): void => this.turrets.fireTurrets());
    guard('shots', (): void => this.shots.stepShots(dt));
    guard('puddles', (): void => this.puddles.stepPuddles(dt));
    guard('patches', (): void => this.patches.stepPatches(dt));
    guard('world events', (): void => this.worldEvents.advance(dt));
    guard('levels', (): void => this.levels.advanceLevels(dt));
    guard('horde', (): void => this.horde.step(dt, this.world, players, this.worldEvents.modifiers));
    guard('separate bodies', (): void => this.movement.separateBodies());
    guard('stash touch', (): void => this.stash.refreshTouched());
    guard('world', (): void => {
      const occupants = players.filter((p: Player): boolean => !p.dead);
      for (const g of this.world.step(dt, [...occupants, ...this.horde.bodies()])) {
        this.outbox.events.push({ t: 'grow', ...g });
      }
      for (const d of this.world.diggers.takeDug()) {
        this.outbox.events.push({ t: 'dig', ...d, done: true, health: 1 });
      }
    });
  }
}
