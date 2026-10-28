// Packages
import { GEAR } from '@halloween/shared/gear';
import { MONSTERS, WITCH_SWIPE } from '@halloween/shared/monsters';
import { isStructure } from '@halloween/shared/structures';
import {
  MAP_WIDTH,
  WorldMap,
} from '@halloween/shared/world';

// Types
import type {
  DisplayMessage,
  MonsterState,
  PlayerState,
} from '@halloween/shared/protocol';
import type { MonsterKind } from '@halloween/shared/monsters';
import type { TileChange } from '@halloween/shared/world';
import type { MusicPlayer } from '../../audio/music-player';
import type { SfxEngine, SfxName } from '../../audio/sfx';

type StateMessage = Extract<DisplayMessage, { t: 'state' }>;

/**
 * How far sounds are panned at the map's left and right edges.
 */
const PAN_WIDTH = 0.8;

/**
 * Seconds between one monster's idle noises, and the minimum gap between
 * any two, so a crowd murmurs instead of droning.
 */
const VOICE_MIN = 7;
const VOICE_SPREAD = 12;
const VOICE_GAP = 1.2;

/**
 * Least time between two monsters' "spotted you" cries (a zombie's snarl,
 * a vampire's hiss), so a horde noticing someone isn't a wall of noise.
 */
const SPOT_GAP = 0.8;

/**
 * A fight, for the music: a monster within this many tiles of a living
 * player, or anyone (or anything) hit in the last few seconds.
 */
const FIGHT_RANGE = 6;
const FIGHT_LINGER = 6;

/**
 * Counters last seen for a player or monster, to spot what changed.
 */
interface Seen {
  swings: number;
  hurts: number;
  attacks: number;
  swipes: number;
  dead: boolean;
  hunting: boolean;
  nextVoiceAt: number;
  nextGrowlAt: number;
}

/**
 * One sound: its name, pitch, and volume.
 */
type Cue = [SfxName, number, number];

/**
 * A monster's voice: hurt; as an attack starts winding up (`windup`) and
 * as it lands (`strike`, after the kind's windup); a witch's broom swipe
 * the same way; spotting someone; an idle groan now and then; and, for
 * some, a growl every few seconds while hunting.
 */
interface Voice {
  hurt: Cue | null;
  windup: Cue | null;
  strike: Cue[];
  spot: Cue;
  idle: Cue;
  growl?: Cue;
}

const MONSTER_VOICES: Record<MonsterKind, Voice> = {
  zombie: { hurt: ['zombie-hurt', 0.9, 0.7], windup: ['zombie-angry', 1.15, 0.35], strike: [['bite', 1, 0.8]], spot: ['zombie-angry', 0.9, 0.75], idle: ['zombie-groan', 0.85, 0.55] },
  vampire: { hurt: ['vampire-hurt', 0.9, 0.7], windup: ['vampire-hiss', 0.9, 0.7], strike: [['bite', 1.1, 0.8]], spot: ['vampire-hiss', 0.9, 0.6], idle: ['vampire-hiss', 0.85, 0.35] },
  ghost: { hurt: null, windup: null, strike: [], spot: ['ghost-shriek', 0.9, 0.75], idle: ['ghost-moan', 0.85, 0.55] },
  brute: { hurt: ['zombie-hurt', 0.55, 0.8], windup: ['zombie-angry', 0.42, 1], strike: [['hit', 0.32, 1], ['break', 0.38, 0.9], ['zombie-angry', 0.36, 0.7]], spot: ['zombie-angry', 0.48, 0.9], idle: ['zombie-groan', 0.5, 0.6], growl: ['zombie-groan', 0.42, 0.55] },
  skeleton: { hurt: ['mine', 1.7, 0.7], windup: ['equip', 0.7, 0.8], strike: [], spot: ['chop', 2, 0.6], idle: ['chop', 2.2, 0.35] },
  witch: { hurt: ['vampire-hurt', 1.35, 0.7], windup: ['ghost-shriek', 1.4, 0.7], strike: [['swing', 1.1, 0.6]], spot: ['ghost-shriek', 1.25, 0.75], idle: ['ghost-moan', 1.6, 0.4] },
  ghoul: { hurt: ['ghoul-screech', 1.3, 0.55], windup: ['ghoul-screech', 1, 0.9], strike: [['bite', 1.3, 0.8]], spot: ['ghoul-screech', 0.9, 0.85], idle: ['ghoul-hiss', 1, 0.5], growl: ['ghoul-hiss', 0.85, 0.55] },
  demon: { hurt: ['vampire-hurt', 0.6, 0.7], windup: ['vampire-hiss', 0.55, 0.8], strike: [['bite', 0.55, 1]], spot: ['ghost-shriek', 0.6, 0.75], idle: ['vampire-hiss', 0.5, 0.4] },
};

/**
 * A witch's broom swipe: a cackle as she draws back, a heavy whoosh as it
 * sweeps.
 */
const SWIPE_WINDUP: Cue = ['ghost-shriek', 1.6, 0.7];
const SWIPE_STRIKE: Cue = ['swing', 0.65, 0.9];

/**
 * Seconds between growls while a brute or ghoul hunts (give or take a
 * half).
 */
const GROWL_EVERY = 2.6;

/**
 * Turns the TV's game feed into sound: watches counters and flags between
 * snapshots (swings and shots, hits, bites, respawns, the blood moon), one-off events
 * (chips, kills, monster deaths, snuffed lights), and tile changes (builds
 * and breaks), panned by where on the map they happen. Monsters also groan,
 * hiss, and moan now and then. Big moments duck the music, and fights bring
 * in more of a song's parts.
 */
export class SoundDirector {
  private map: WorldMap | null = null;
  private players = new Map<string, Seen>();
  private monsters = new Map<number, Seen>();
  private bloodMoon: boolean | null = null;
  private lastVoiceAt = 0;
  private lastHitAt = -Infinity;
  private lastSpotAt = -Infinity;
  private shots = new Set<number>();

  constructor(private sfx: SfxEngine, private music: MusicPlayer) {}

  onWorld(tiles: string, levels: string, ramps?: string): void {
    this.map = WorldMap.decode(tiles, levels, ramps);
  }

  onTiles(changes: TileChange[]): void {
    if (!this.map) {
      return;
    }
    for (const c of changes) {
      const tx = c.i % MAP_WIDTH;
      const before = this.map.get(tx, Math.floor(c.i / MAP_WIDTH));
      if (isStructure(c.tile) && !isStructure(before)) {
        this.play('build', tx + 0.5);
      } else if (isStructure(before) && !isStructure(c.tile)) {
        this.play('break', tx + 0.5);
      }
    }
    this.map.apply(changes);
  }

  onState(msg: StateMessage): void {
    const now = performance.now() / 1000;
    const shots = new Set<number>();
    for (const s of msg.shots) {
      shots.add(s.id);
      if (s.kind === 'ecto' && !this.shots.has(s.id)) {
        this.play('ghost-shot', s.x, 0.8, 0.9 + Math.random() * 0.2);
      } else if (s.kind === 'arrow' && !this.shots.has(s.id)) {
        this.play('shoot', s.x, 0.7, 1.3 + Math.random() * 0.2);
      } else if (s.kind === 'potion' && !this.shots.has(s.id)) {
        this.play('swing', s.x, 0.6, 1.2);
      }
    }
    this.shots = shots;
    this.watchPlayers(msg.players);
    this.watchMonsters(msg.monsters, now);
    for (const e of msg.events) {
      if (e.t === 'chips') {
        this.play(e.chip === 'wood' ? 'chop' : 'mine', e.tx + 0.5, 0.6);
      } else if (e.t === 'dig') {
        this.play('dig', e.tx + 0.5, 0.6);
        if (e.done) {
          this.play('build', e.tx + 0.5, 0.5, 0.5);
        }
      } else if (e.t === 'candy') {
        this.play('candy', e.x, 0.8);
      } else if (e.t === 'pickup') {
        this.play('pickup', e.x, 0.6, 0.95 + Math.random() * 0.15);
      } else if (e.t === 'blueprint' || e.t === 'research') {
        this.sfx.play('unlock', { volume: 0.8 });
      } else if (e.t === 'kill') {
        this.sfx.play('death', { volume: 0.9 });
        this.music.duck(0.35, 1.5);
      } else if (e.t === 'monster-death') {
        this.play('monster-death', e.x, 0.8);
        this.play('splat', e.x, 0.7, 0.85 + Math.random() * 0.3);
      } else if (e.t === 'splash') {
        this.play('splat', e.x, 0.9, 0.8);
        this.play('drink', e.x, 0.5, 1.6);
      } else if (e.t === 'blink') {
        this.play('shadow-step', e.fromX, 0.7, 0.9 + Math.random() * 0.2);
        this.play('shadow-step', e.x, 0.9, 0.8 + Math.random() * 0.2);
      } else if (e.t === 'snuff') {
        this.play('snuff', e.tx + 0.5);
      } else if (e.t === 'smash' && e.tile === 'pumpkin') {
        this.play(e.broke ? 'splat' : 'chop', e.tx + 0.5, 0.8, e.broke ? 1.3 : 1.1);
      } else if (e.t === 'smash') {
        this.play('break', e.tx + 0.5);
        this.play('pickup', e.tx + 0.5, 0.7);
      } else if (e.t === 'grow' && e.tile !== 'pumpkin') {
        this.play('build', e.tx + 0.5, 0.35, 0.6);
      }
    }
    if (this.bloodMoon === false && msg.bloodMoon) {
      this.sfx.play('blood-moon');
      this.music.duck(0.25, 3);
    }
    this.bloodMoon = msg.bloodMoon;
    const alive = msg.players.filter((p: PlayerState): boolean => p.connected && !p.dead);
    const near = msg.monsters.some((m: MonsterState): boolean => alive.some((p: PlayerState): boolean => Math.hypot(m.x - p.x, m.y - p.y) < FIGHT_RANGE));
    this.music.setMood({
      players: msg.players.some((p: PlayerState): boolean => p.connected),
      fight: near || now - this.lastHitAt < FIGHT_LINGER,
      bloodMoon: msg.bloodMoon,
    });
  }

  private watchPlayers(players: PlayerState[]): void {
    const live = new Set<string>();
    for (const p of players) {
      live.add(p.id);
      const seen = this.players.get(p.id);
      if (seen) {
        if (p.swings > seen.swings) {
          this.play(p.gear.weapon && GEAR[p.gear.weapon].weapon?.ranged ? 'shoot' : 'swing', p.x, 0.5, 0.9 + Math.random() * 0.2);
        }
        if (p.hurts > seen.hurts) {
          this.lastHitAt = performance.now() / 1000;
          this.play('hurt', p.x, 0.9, 0.92 + Math.random() * 0.16);
        }
        if (seen.dead && !p.dead) {
          this.play('respawn', p.x, 0.6);
        }
      }
      this.players.set(p.id, { swings: p.swings, hurts: p.hurts, attacks: 0, swipes: 0, dead: p.dead, hunting: false, nextVoiceAt: 0, nextGrowlAt: 0 });
    }
    for (const id of this.players.keys()) {
      if (!live.has(id)) {
        this.players.delete(id);
      }
    }
  }

  private watchMonsters(monsters: MonsterState[], now: number): void {
    const live = new Set<number>();
    for (const m of monsters) {
      live.add(m.id);
      const seen = this.monsters.get(m.id) ?? { swings: 0, hurts: m.hurts, attacks: m.attacks, swipes: m.swipes, dead: false, hunting: m.hunting, nextVoiceAt: now + Math.random() * VOICE_SPREAD, nextGrowlAt: now + Math.random() * GROWL_EVERY };
      if (m.hurts > seen.hurts) {
        this.lastHitAt = now;
        this.play('monster-hit', m.x, 0.8, 0.9 + Math.random() * 0.2);
        if (m.armor) {
          this.play('mine', m.x, 0.5, 1.4 + Math.random() * 0.3);
        }
        const hurt = MONSTER_VOICES[m.kind].hurt;
        if (hurt) {
          this.cue(hurt, m.x);
        }
      }
      const voice = MONSTER_VOICES[m.kind];
      if (m.attacks > seen.attacks) {
        this.attackCues(voice.windup, voice.strike, MONSTERS[m.kind].windup, m.x);
      }
      if (m.swipes > seen.swipes) {
        this.attackCues(SWIPE_WINDUP, [SWIPE_STRIKE], WITCH_SWIPE.windup, m.x);
      }
      if (m.hunting && !seen.hunting && now - this.lastSpotAt >= SPOT_GAP) {
        this.lastSpotAt = now;
        seen.nextVoiceAt = now + VOICE_MIN;
        seen.nextGrowlAt = now + GROWL_EVERY;
        this.cue(voice.spot, m.x);
      }
      seen.hunting = m.hunting;
      if (voice.growl && m.hunting && now >= seen.nextGrowlAt) {
        seen.nextGrowlAt = now + GROWL_EVERY * (0.5 + Math.random());
        this.cue(voice.growl, m.x);
      }
      if (now >= seen.nextVoiceAt && now - this.lastVoiceAt >= VOICE_GAP) {
        seen.nextVoiceAt = now + VOICE_MIN + Math.random() * VOICE_SPREAD;
        this.lastVoiceAt = now;
        this.cue(voice.idle, m.x, 0.3);
      }
      seen.hurts = m.hurts;
      seen.attacks = m.attacks;
      seen.swipes = m.swipes;
      this.monsters.set(m.id, seen);
    }
    for (const id of this.monsters.keys()) {
      if (!live.has(id)) {
        this.monsters.delete(id);
      }
    }
  }

  /**
   * A cue, its pitch nudged by up to `spread`.
   */
  private cue([name, pitch, volume]: Cue, x: number, spread = 0.15): void {
    this.play(name, x, volume, pitch + Math.random() * spread);
  }

  /**
   * An attack's sounds: one as it winds up, and the hit itself as it lands
   * `windup` seconds later.
   */
  private attackCues(windup: Cue | null, strike: Cue[], delay: number, x: number): void {
    if (windup) {
      this.cue(windup, x);
    }
    if (strike.length > 0) {
      setTimeout((): void => strike.forEach((c: Cue): void => this.cue(c, x, 0.08)), delay * 1000);
    }
  }

  /**
   * Plays a sound panned to tile column `x`.
   */
  private play(name: SfxName, x: number, volume = 1, pitch = 1): void {
    this.sfx.play(name, { volume, pitch, pan: ((x / MAP_WIDTH) * 2 - 1) * PAN_WIDTH });
  }
}
