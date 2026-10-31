// Packages
import { Color } from 'three';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { variantOf } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { STATUS_BURNING, STATUS_GLOWING, hasStatus } from '@halloween/shared/monsters/monster-status';
import {
  CANDLE_LIGHT,
  CURSOR_LIGHT,
  LAMP_LIGHT,
  LANTERN_LIGHT,
  LOW_FUEL,
  PUMPKIN_LIGHT,
} from '@halloween/shared/structures/lights';
import { STRUCTURES, isStructure } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { PATCH_FLAMES, PATCH_LIGHT } from '../../effects/config/ground-patches';
import { ScenePart } from '../scene-part';
import {
  BLADE_LIGHT,
  BURN_FLAME,
  BURN_LIGHT,
  BURN_LIGHT_INTENSITY,
  FLAME_SHAPES,
  FLICKER_DEPTH,
  GHOST_GLOW,
  GHOST_GLOW_INTENSITY,
  PLAYER_LIGHT,
} from './config/lights';
import { flicker } from './helpers/flicker';
import { sputter } from './helpers/sputter';

// Types
import type { LightDef } from '@halloween/shared/structures/types/structures';
import type { MonsterAvatar } from '../../avatars/monsters/monster-avatar';
import type { PlayerAvatar } from '../../avatars/player/player-avatar';
import type { FlameSpot, LightSource } from '../../types/effects';
import type { StaticLight } from '../../types/terrain';
import type { LightFlash } from '../effects/types/light-flash';

/**
 * Gathers every light for a frame: the voxels' permanent lights, burning
 * structures and their flames, player lanterns and torches (and infused
 * weapons' light), ghosts, burning monsters and ground, short flashes from
 * effects, and the TV mouse's light. Structures' flames come first, so
 * burning monsters and ground only get what's left of the shared flame
 * pool (and at most their own budgets).
 */
export class LightCollector extends ScenePart {
  /**
   * Light colors, by hex.
   */
  private _colors = new Map<string, Color>();

  /**
   * Gathers every light for this frame: pumpkins, burning structures (with
   * a slow flicker each, shrinking when low on fuel), player lanterns, and
   * ghosts.
   * @param time Clock seconds.
   * @param staticLights The built chunks' permanent lights.
   * @param avatars Every player's avatar.
   * @param monsters Every monster's avatar.
   * @returns The light sources and the flames to draw.
   */
  collect(time: number, staticLights: StaticLight[], avatars: ReadonlyMap<string, PlayerAvatar>, monsters: ReadonlyMap<number, MonsterAvatar>): { sources: LightSource[]; flames: FlameSpot[] } {
    const sources: LightSource[] = [];
    const flames: FlameSpot[] = [];
    /**
     * Adds a light source for a light def.
     * @param x Tile-space x.
     * @param y Tile-space y.
     * @param def The light's def.
     * @param intensity Its brightness.
     * @param radiusScale Scales its radius.
     */
    const add = (x: number, y: number, def: LightDef, intensity: number, radiusScale = 1): void => {
      sources.push({ x, y, radius: def.radius * radiusScale, color: this.color(def.color), intensity });
    };

    staticLights.forEach((s: StaticLight): void => {
      if (this._ctx.lightsOff) {
        return;
      }
      const def = s.kind === 'lamp' ? LAMP_LIGHT : s.kind === 'candle' ? CANDLE_LIGHT : PUMPKIN_LIGHT;
      add(s.x, s.y, def, (s.kind === 'pumpkin' ? 0.8 : 1) * flicker(time, Math.floor(s.x * 31 + s.y * 17), FLICKER_DEPTH[s.kind]));
    });
    for (const { i, fuel, radius, intensity, dying } of this._ctx.lights) {
      const tile = this.map?.get(i % this._ctx.mapWidth, Math.floor(i / this._ctx.mapWidth));
      const shape = tile && isStructure(tile) ? FLAME_SHAPES[tile] : undefined;
      if (!tile || !isStructure(tile) || !STRUCTURES[tile].light) {
        continue;
      }
      const x = (i % this._ctx.mapWidth) + 0.5;
      const y = Math.floor(i / this._ctx.mapWidth) + 0.5;
      const stutter = dying === undefined ? 1 : sputter(time, i, dying);
      const strength = Math.min(1, fuel / LOW_FUEL) * stutter;
      add(x, y, { ...STRUCTURES[tile].light!, radius }, intensity * stutter * flicker(time, i, FLICKER_DEPTH.flame));
      if (shape) {
        flames.push({ x, y: y + (shape.dy ?? 0), height: this._ctx.elevation(x, y) + shape.height, size: shape.size, strength, blood: shape.blood, soul: shape.soul });
      }
    }
    for (const avatar of avatars.values()) {
      if (avatar.target.connected && !avatar.target.dead && !this._ctx.lightsOff) {
        const { x, y } = avatar.position;
        const { gear, gearInfusion } = avatar.target;
        const torch = gear.offhand === 'torch';
        const reach = torch ? variantOf('torch', gearInfusion.offhand)?.twist.lightMult ?? 1 : 1;
        add(x, y, torch ? GEAR.torch.light! : LANTERN_LIGHT, PLAYER_LIGHT * avatar.lightLevel * flicker(time, avatar.target.id.charCodeAt(0) + avatar.target.id.charCodeAt(1), FLICKER_DEPTH.lantern), reach);
        const blade = gear.weapon ? variantOf(gear.weapon, gearInfusion.weapon)?.twist.lightRadius : undefined;
        if (blade) {
          add(x, y, { radius: blade, burn: Infinity, color: BLADE_LIGHT.color }, avatar.target.dimmed ? BLADE_LIGHT.dimmed : BLADE_LIGHT.intensity);
        }
      }
    }
    this.addBurning(time, monsters, flames, add);
    this.addFlashes(time, add);
    for (const monster of monsters.values()) {
      if (monster.target.kind === 'ghost' && !this._ctx.monstersHidden) {
        const { x, y } = monster.position;
        add(x, y, GHOST_GLOW, GHOST_GLOW_INTENSITY * (monster.target.draining ? 1.6 : 1));
      }
    }
    if (this._ctx.cursorLight) {
      add(this._ctx.cursorLight.x, this._ctx.cursorLight.y, CURSOR_LIGHT, 2.6);
    }
    return { sources, flames };
  }

  /**
   * Flames on burning monsters (and light off the ones burning with Hell's
   * Edge's fire), then on burning ground (with a dim glow), each up to
   * its budget.
   * @param time Clock seconds.
   * @param monsters Every monster's avatar.
   * @param flames The frame's flames so far.
   * @param add Adds a light source.
   */
  private addBurning(time: number, monsters: ReadonlyMap<number, MonsterAvatar>, flames: FlameSpot[], add: (x: number, y: number, def: LightDef, intensity: number, radiusScale?: number) => void): void {
    let burning = 0;
    for (const monster of monsters.values()) {
      const { status, id } = monster.target;
      if (this._ctx.monstersHidden || !hasStatus(status, STATUS_BURNING | STATUS_GLOWING)) {
        continue;
      }
      const { x, y } = monster.position;
      if (burning++ < BURN_FLAME.budget) {
        flames.push({ x, y, height: monster.group.position.y + BURN_FLAME.lift, size: BURN_FLAME.size, strength: BURN_FLAME.strength });
      }
      if (hasStatus(status, STATUS_GLOWING) && !this._ctx.lightsOff) {
        add(x, y, BURN_LIGHT, BURN_LIGHT_INTENSITY * flicker(time, id, FLICKER_DEPTH.flame));
      }
    }
    let ground = 0;
    for (const p of this._ctx.patches.patches) {
      if (p.kind === 'incense' || ground >= Math.max(PATCH_FLAMES.budget, PATCH_LIGHT.budget)) {
        continue;
      }
      if (ground < PATCH_FLAMES.budget) {
        flames.push({ x: p.x, y: p.y, height: this._ctx.elevation(p.x, p.y), size: p.radius * 2 * PATCH_FLAMES.size, strength: PATCH_FLAMES.strength * Math.min(1, p.life * 4) });
      }
      if (ground < PATCH_LIGHT.budget && !this._ctx.lightsOff) {
        add(p.x, p.y, { radius: p.radius * PATCH_LIGHT.reach, burn: Infinity, color: PATCH_LIGHT.color }, PATCH_LIGHT.intensity * Math.min(1, p.life * 4) * flicker(time, p.id, FLICKER_DEPTH.flame));
      }
      ground++;
    }
  }

  /**
   * Lights the effects' short flashes, fading each out over its life, and
   * drops the ones that are done.
   * @param time Clock seconds.
   * @param add Adds a light source.
   */
  private addFlashes(time: number, add: (x: number, y: number, def: LightDef, intensity: number) => void): void {
    this._ctx.flashes = this._ctx.flashes.filter((f: LightFlash): boolean => time - f.at < f.life);
    for (const f of this._ctx.flashes) {
      add(f.x, f.y, { radius: f.radius, burn: Infinity, color: f.color }, f.intensity * (1 - (time - f.at) / f.life));
    }
  }

  /**
   * A light color, made once per hex.
   * @param hex The color.
   * @returns The shared Color.
   */
  private color(hex: string): Color {
    let c = this._colors.get(hex);
    if (!c) {
      c = new Color(hex);
      this._colors.set(hex, c);
    }
    return c;
  }
}
