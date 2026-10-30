// Local Imports
import { ScenePart } from './scene-part';

// Types
import type { SceneParts } from './types/scene-parts';
import type { WorldContext } from './world-context';

/**
 * One frame of the TV's scene, in a fixed order: build chunks, animate
 * tiles and effects, place monsters, move the camera, place players, gather
 * lights and fog, and draw.
 */
export class FrameLoop extends ScenePart {
  /**
   * Living players' screen points this frame, for the focus effect.
   */
  private _focusPoints: { x: number; y: number }[] = [];

  /**
   * Keeps the parts it steps.
   * @param ctx What every part of the scene shares.
   * @param _parts The parts stepped each frame.
   */
  constructor(ctx: WorldContext, private _parts: SceneParts) {
    super(ctx);
  }

  /**
   * Steps and draws one frame.
   * @param dt Seconds since the last frame (at most 0.1).
   * @param time Clock seconds.
   */
  run(dt: number, time: number): void {
    const { stats, rig, chunks, scenery, tiles, events, projectiles, sky, interp, monsters, players, reticles, preview, lights, fogStamps, post } = this._parts;
    const ctx = this._ctx;
    stats.tick(time);
    if (this.map) {
      for (const c of this.map.takeChanges()) {
        chunks.markDirty(c.i);
      }
      chunks.ensure();
    }
    tiles.update(dt);
    scenery.updateTower(players.avatars);
    const w = ctx.container.clientWidth;
    const h = ctx.container.clientHeight;
    events.flushTosses(time);
    ctx.chips.update(dt);
    ctx.gore.update(dt);
    ctx.pickups.update(dt);
    ctx.altarGauges.update(ctx.lights.flatMap(({ i, fuel }) => {
      const tx = i % ctx.mapWidth;
      const ty = Math.floor(i / ctx.mapWidth);
      return this.map?.get(tx, ty) === 'altar' ? [{ tx, ty, fuel, height: ctx.elevation(tx + 0.5, ty + 0.5) }] : [];
    }), time);
    ctx.piles.update(time);
    projectiles.update(time);
    ctx.puddles.update(time, (x: number, y: number): number => ctx.elevation(x, y));
    sky.update(dt, post);
    const drawnAt = interp.drawnAt();
    monsters.update(dt, time, drawnAt);
    ctx.treeSway.update(time, monsters.quakeSources());
    ctx.healthBars.update(dt, this.camera, w, h);
    this._focusPoints.length = 0;
    rig.tilt(dt);
    const at = rig.follow.update(dt, players.avatars, rig.cameraAngle, rig.home);
    if (at) {
      ctx.lightMap.setCenter(at.x + ctx.mapWidth / 2, at.z + ctx.mapHeight / 2);
      ctx.fog.setCenter(at.x, at.z);
      sky.followMoon(at.x, at.z);
    }
    rig.applyShake(dt);
    reticles.update(time, players.avatars, monsters.monsters);
    players.update(dt, time, drawnAt, w, h, this._focusPoints, preview);
    const { sources, flames } = lights.collect(time, chunks.staticLights, players.avatars, monsters.monsters);
    ctx.lightMap.update(sources);
    ctx.flames.update(flames, time);
    ctx.fog.update(dt, fogStamps.collect(flames, chunks.staticLights, players.avatars, monsters.monsters));
    post.render(this._focusPoints);
  }
}
