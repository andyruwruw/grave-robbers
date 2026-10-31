// Local Imports
import { DOTS_TALL, OVERVIEW_TALL } from './chunks/config/overview';
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
    const { stats, rig, chunks, overview, scenery, tiles, events, projectiles, sky, look, interp, monsters, players, reticles, preview, lights, fogStamps, post } = this._parts;
    const ctx = this._ctx;
    stats.tick(time);
    const tall = (2 * this.camera.top) / Math.sin(rig.cameraAngle);
    const far = tall > OVERVIEW_TALL;
    const dots = tall > DOTS_TALL;
    if (this.map) {
      for (const c of this.map.takeChanges()) {
        chunks.markDirty(c.i);
      }
      if (!far) {
        chunks.ensure();
      }
    }
    this.showDetail(!far);
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
    ctx.fountainVictims.update(ctx.victims, monsters.monsters, ctx.mapWidth, (x: number, y: number): number => ctx.elevation(x, y), time);
    ctx.piles.update(time);
    projectiles.update(time);
    ctx.puddles.update(time, (x: number, y: number): number => ctx.elevation(x, y));
    ctx.patches.update(time, (x: number, y: number): number => ctx.elevation(x, y));
    ctx.bolts.update(dt);
    ctx.rings.update(dt);
    ctx.cracks.update(dt);
    look.update(dt);
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
    this.showFigures(!dots);
    overview.update(dt, far, dots, players.avatars.values(), monsters.monsters.values());
    const { sources, flames } = lights.collect(time, chunks.staticLights, players.avatars, monsters.monsters);
    ctx.lightMap.update(sources);
    ctx.flames.update(flames, time);
    ctx.fog.update(dt, fogStamps.collect(flames, chunks.staticLights, players.avatars, monsters.monsters));
    post.render(this._focusPoints);
  }

  /**
   * Draws the voxel world and the small effects on it close up, or hides
   * them all when zoomed far out (`OVERVIEW_TALL`), where the flat overview
   * map stands in and they'd be too small to see.
   * @param on Whether to draw them.
   */
  private showDetail(on: boolean): void {
    const ctx = this._ctx;
    for (const group of [this._parts.chunks.group, ctx.flames.group, ctx.piles.group, ctx.chips.group, ctx.gore.group, ctx.pickups.group, ctx.altarGauges.group, ctx.fountainVictims.group, ctx.puddles.group, ctx.fog.group, ctx.patches.group, ctx.bolts.group, ctx.rings.group, ctx.cracks.group]) {
      group.visible = on;
    }
  }

  /**
   * Hides every monster and player figure (with their trails and markers)
   * when zoomed out so far that they're dots on the overview instead
   * (`DOTS_TALL`), and brings the trails back after (the figures and
   * markers come back on their own). Name labels always stay.
   * @param on Whether to draw the figures.
   */
  private showFigures(on: boolean): void {
    for (const avatar of this._parts.players.avatars.values()) {
      avatar.trail.visible = on;
      if (!on) {
        avatar.group.visible = false;
        avatar.marker.visible = false;
        avatar.blocker.visible = false;
      }
    }
    for (const monster of this._parts.monsters.monsters.values()) {
      monster.trail.visible = on;
      if (!on) {
        monster.group.visible = false;
      }
    }
  }
}
