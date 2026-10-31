// Packages
import { TURRETS } from '@halloween/shared/structures/turrets';

// Local Imports
import {
  BILE_SPLASH,
  BLADE_GLINT,
  CANDLE_SPARK,
  CHEST_SPLINTER,
  DIRT,
  FLAME_COLORS,
  GOLD_SPARK,
  POTION_SPLASH,
  PUMPKIN_FLESH,
  RAISE_GLOW,
  SHADOW_SMOKE,
  SMOKE,
} from '../config/effect-colors';
import { ScenePart } from '../scene-part';
import { DIRT_TOSS_DELAY, TILE_BAR_LIFT } from './config/events';
import { InfusionEventEffects } from './infusion-event-effects';

// Types
import type { GameEvent } from '@halloween/shared/protocol/game-events';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { PlayerAvatar } from '../../avatars/player/player-avatar';
import type { MonsterAvatars } from '../actors/monster-avatars';
import type { PlayerAvatars } from '../actors/player-avatars';
import type { CameraRig } from '../camera/camera-rig';
import type { TileAnimations } from '../chunks/tile-animations';
import type { WorldContext } from '../world-context';

/**
 * Plays a tick's one-off events: chips, dust and dirt, turret fire,
 * monster deaths, snuffed lights, splashes, bloaters bursting, the dead
 * rising, blinks, things growing in,
 * pickups, and smashed pumpkins and chests. A dig's dirt is tossed a beat
 * later, from a queue. The infused weapons' events go to
 * `InfusionEventEffects`.
 */
export class EventEffects extends ScenePart {
  /**
   * Shovelfuls of grave dirt waiting to be tossed (the scoop comes a beat
   * after the spade bites), in clock seconds.
   */
  private _tosses: { at: number; tx: number; ty: number; dx: number; dy: number; count: number }[] = [];

  /**
   * The infused weapons' events (chain lightning, blasts, slams, ...).
   */
  private _infusions: InfusionEventEffects;

  /**
   * Starts with nothing queued.
   * @param ctx What every part of the scene shares.
   * @param _monsters The monsters, torn apart when they die.
   * @param _tiles Things growing in.
   * @param _players The players, the nearest digger tosses the dirt.
   * @param rig The camera rig, shaken by the infused weapons' heavier hits.
   */
  constructor(ctx: WorldContext, private _monsters: MonsterAvatars, private _tiles: TileAnimations, private _players: PlayerAvatars, rig: CameraRig) {
    super(ctx);
    this._infusions = new InfusionEventEffects(ctx, rig);
  }

  /**
   * Plays a tick's events.
   * @param events The events.
   */
  play(events: GameEvent[]): void {
    for (const e of events) {
      this._infusions.play(e);
      if (e.t === 'chips' || e.t === 'dig' || e.t === 'smash') {
        this._ctx.healthBars.hit(`t${e.tx},${e.ty}`, e.health, e.tx + 0.5, e.ty + 0.5, this._ctx.elevation(e.tx + 0.5, e.ty + 0.5), TILE_BAR_LIFT);
      }
      if (e.t === 'chips') {
        this._ctx.chips.burst(e.tx, e.ty, e.chip);
      } else if (e.t === 'dig') {
        this._ctx.chips.puff(e.tx + 0.5, e.ty + 0.75, DIRT, e.done ? 18 : 8);
        this._ctx.chips.burst(e.tx, e.ty, 'stone');
        this.tossDirt(e.tx + 0.5, e.ty + 0.5, e.done);
      } else if (e.t === 'turret' && e.fires === 'flame') {
        const def = TURRETS[this.map?.get(e.tx, e.ty) as StructureKind];
        this._ctx.chips.jet(e.tx + 0.5, e.ty + 0.5, e.angle, def?.cone ?? 0.45, def?.range ?? 3.5, FLAME_COLORS, 14);
      } else if (e.t === 'turret' && e.fires === 'sweep') {
        this._ctx.chips.whirl(e.tx + 0.5, e.ty + 0.5, TURRETS.swiper!.range, BLADE_GLINT, 12);
      } else if (e.t === 'monster-death') {
        this._monsters.kill(e.x, e.y, e.kind, e.angle);
      } else if (e.t === 'snuff') {
        this._ctx.chips.puff(e.tx + 0.5, e.ty + 0.5, SMOKE, 10);
      } else if (e.t === 'splash') {
        this._ctx.chips.puff(e.x, e.y, POTION_SPLASH, 26);
        this._ctx.gore.spatter(e.x, e.y, POTION_SPLASH, 18, null, 1.1);
        this._ctx.lightMap.darken(this._ctx.chips.group);
      } else if (e.t === 'burst') {
        this._ctx.chips.puff(e.x, e.y, BILE_SPLASH, 30);
        this._ctx.lightMap.darken(this._ctx.chips.group);
      } else if (e.t === 'raise') {
        this._ctx.chips.puff(e.x, e.y, DIRT, 16);
        this._ctx.chips.spark(e.x, e.y, RAISE_GLOW, 12);
        this._ctx.lightMap.darken(this._ctx.chips.group);
      } else if (e.t === 'blink') {
        this._ctx.chips.puff(e.fromX, e.fromY, SHADOW_SMOKE, 22);
        this._ctx.chips.puff(e.x, e.y, SHADOW_SMOKE, 22);
        this._ctx.lightMap.darken(this._ctx.chips.group);
      } else if (e.t === 'grow') {
        this._tiles.growing.set(e.ty * this._ctx.mapWidth + e.tx, { tx: e.tx, ty: e.ty, tile: e.tile, age: 0, group: null });
        this._ctx.chips.puff(e.tx + 0.5, e.ty + 0.5, DIRT, e.tile === 'pumpkin' ? 6 : 14);
      } else if (e.t === 'candy' || e.t === 'pickup') {
        this._ctx.pickups.spawn(e.t === 'candy' ? 'candy' : e.goods, e.x, e.y, this._ctx.elevation(e.x, e.y));
      } else if (e.t === 'smash' && e.tile === 'pumpkin') {
        this._ctx.chips.puff(e.tx + 0.5, e.ty + 0.5, PUMPKIN_FLESH, e.broke ? 22 : 8);
        this._ctx.gore.spatter(e.tx + 0.5, e.ty + 0.5, PUMPKIN_FLESH, e.broke ? 7 : 2, null, e.broke ? 0.9 : 0.5);
        if (e.broke) {
          this._ctx.chips.spark(e.tx + 0.5, e.ty + 0.5, CANDLE_SPARK, 8);
          this._ctx.gore.seeds(e.tx + 0.5, e.ty + 0.5, 16);
        }
      } else if (e.t === 'smash') {
        this._ctx.chips.puff(e.tx + 0.5, e.ty + 0.5, CHEST_SPLINTER, 18);
        this._ctx.chips.spark(e.tx + 0.5, e.ty + 0.5, GOLD_SPARK, 14);
      }
    }
  }

  /**
   * Tosses every queued shovelful of dirt whose moment has come.
   * @param time Clock seconds.
   */
  flushTosses(time: number): void {
    while (this._tosses.length > 0 && this._tosses[0].at <= time) {
      const toss = this._tosses.shift()!;
      this._ctx.chips.fling(toss.tx, toss.ty, toss.dx, toss.dy, DIRT, toss.count);
      this._ctx.lightMap.darken(this._ctx.chips.group);
    }
  }

  /**
   * Queues a shovelful of dirt from a grave being dug, thrown up and over
   * the shoulder of whoever is digging it (the nearest digging player), a
   * beat after the spade bites.
   * @param x Tile-space x of the grave's middle.
   * @param y Tile-space y of the grave's middle.
   * @param done Whether the grave is dug out.
   */
  private tossDirt(x: number, y: number, done: boolean): void {
    let digger: PlayerAvatar | null = null;
    let best = Infinity;
    for (const avatar of this._players.avatars.values()) {
      const d = Math.hypot(avatar.target.x - x, avatar.target.y - y);
      if (avatar.target.digging && d < best) {
        best = d;
        digger = avatar;
      }
    }
    if (!digger || best === 0) {
      return;
    }
    const dx = (digger.target.x - x) / best;
    const dy = (digger.target.y - y) / best;
    this._tosses.push({ at: this._ctx.clock.elapsedTime + DIRT_TOSS_DELAY, tx: x - dx * 0.2, ty: y - dy * 0.2, dx, dy, count: done ? 22 : 14 });
  }
}
