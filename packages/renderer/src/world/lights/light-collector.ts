// Packages
import { Color } from 'three';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
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
import { ScenePart } from '../scene-part';
import {
  FLAME_SHAPES,
  FLICKER_DEPTH,
  GHOST_GLOW,
  GHOST_GLOW_INTENSITY,
  PLAYER_LIGHT,
} from './config/lights';
import { flicker } from './helpers/flicker';

// Types
import type { LightDef } from '@halloween/shared/structures/types/structures';
import type { MonsterAvatar } from '../../avatars/monsters/monster-avatar';
import type { PlayerAvatar } from '../../avatars/player/player-avatar';
import type { FlameSpot, LightSource } from '../../types/effects';
import type { StaticLight } from '../../types/terrain';

/**
 * Gathers every light for a frame: the voxels' permanent lights, burning
 * structures and their flames, player lanterns and torches, ghosts, and the
 * TV mouse's light.
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
    for (const { i, fuel, radius, intensity } of this._ctx.lights) {
      const tile = this.map?.get(i % this._ctx.mapWidth, Math.floor(i / this._ctx.mapWidth));
      const shape = tile && isStructure(tile) ? FLAME_SHAPES[tile] : undefined;
      if (!tile || !isStructure(tile) || !STRUCTURES[tile].light) {
        continue;
      }
      const x = (i % this._ctx.mapWidth) + 0.5;
      const y = Math.floor(i / this._ctx.mapWidth) + 0.5;
      const strength = Math.min(1, fuel / LOW_FUEL);
      add(x, y, { ...STRUCTURES[tile].light!, radius }, intensity * flicker(time, i, FLICKER_DEPTH.flame));
      if (shape) {
        flames.push({ x, y: y + (shape.dy ?? 0), height: this._ctx.elevation(x, y) + shape.height, size: shape.size, strength, blood: shape.blood, soul: shape.soul });
      }
    }
    for (const avatar of avatars.values()) {
      if (avatar.target.connected && !avatar.target.dead && !this._ctx.lightsOff) {
        const { x, y } = avatar.position;
        add(x, y, avatar.target.gear.offhand === 'torch' ? GEAR.torch.light! : LANTERN_LIGHT, PLAYER_LIGHT * avatar.lightLevel * flicker(time, avatar.target.id.charCodeAt(0) + avatar.target.id.charCodeAt(1), FLICKER_DEPTH.lantern));
      }
    }
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
