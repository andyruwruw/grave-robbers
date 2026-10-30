// Local Imports
import { ScenePart } from '../scene-part';

// Types
import type { MonsterAvatar } from '../../avatars/monsters/monster-avatar';
import type { PlayerAvatar } from '../../avatars/player/player-avatar';
import type { FlameSpot, FogStamp } from '../../types/effects';
import type { StaticLight } from '../../types/terrain';

/**
 * Gathers what disturbs the fog each frame, into one reused list.
 */
export class FogStampCollector extends ScenePart {
  /**
   * The list, refilled every frame.
   */
  private _fogStamps: FogStamp[] = [];

  /**
   * What disturbs the fog this frame: players shove it aside and drag it
   * along as they walk, walking monsters do the same more gently, ghosts
   * trail mist, and lights thin it.
   * @param flames This frame's flames.
   * @param staticLights The built chunks' permanent lights.
   * @param avatars Every player's avatar.
   * @param monsters Every monster's avatar.
   * @returns The stamps (the same list every frame).
   */
  collect(flames: FlameSpot[], staticLights: StaticLight[], avatars: ReadonlyMap<string, PlayerAvatar>, monsters: ReadonlyMap<number, MonsterAvatar>): FogStamp[] {
    const stamps = this._fogStamps;
    stamps.length = 0;
    for (const avatar of avatars.values()) {
      const p = avatar.target;
      if (p.connected && !p.dead) {
        const drag = p.moving ? 1.5 : 0;
        stamps.push({ ...avatar.position, radius: 2.6, push: 2.5, vx: Math.cos(p.facing) * drag, vy: Math.sin(p.facing) * drag });
      }
    }
    for (const monster of monsters.values()) {
      const m = monster.target;
      if (m.kind === 'ghost') {
        stamps.push({ ...monster.position, radius: 1.1, add: 0.8 });
      } else if (m.moving) {
        stamps.push({ ...monster.position, radius: 0.9, push: 1.2, vx: Math.cos(m.facing) * 0.8, vy: Math.sin(m.facing) * 0.8 });
      }
    }
    for (const s of staticLights) {
      stamps.push({ x: s.x, y: s.y, radius: s.kind === 'lamp' ? 1.4 : 1, burn: 0.25 });
    }
    for (const f of flames) {
      stamps.push({ x: f.x, y: f.y, radius: 1 + f.size * 1.2, burn: 0.5 * f.strength });
    }
    if (this._ctx.cursorLight) {
      stamps.push({ ...this._ctx.cursorLight, radius: 3, burn: 0.5 });
    }
    return stamps;
  }
}
