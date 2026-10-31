// Local Imports
import { FOLLOW_TALL } from './camera/config/camera';
import { EditCursor } from './editor/edit-cursor';
import { rampDir, stairsOptions } from './editor/helpers/stairs-options';
import { StairsGhost } from './editor/stairs-ghost';
import { ScreenPicker } from './picking/screen-picker';
import { WorldScene } from './world-scene';

// Types
import type { DisplaySettings } from '../types/display-settings';
import type { LiftTarget } from '@halloween/shared/protocol/tv-tools';
import type { Tile } from '@halloween/shared/world/tiles';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { FollowView } from '../types/camera';

/**
 * The TV's scene with its input layer: the TV mouse (picking players,
 * monsters, and ground), the map editor (brush ring, stairs preview, x-ray,
 * top-down view, flat light), and /play (following a player, prediction,
 * interpolation, build aim). It extends `WorldScene` because the scene is
 * what a screen would embed without any of this input.
 */
export class WorldRenderer extends WorldScene {
  /**
   * Turns screen points into map points.
   */
  private _picker = new ScreenPicker(this._ctx);

  /**
   * The map editor's brush outline.
   */
  private _editCursor = new EditCursor(this._ctx);

  /**
   * The map editor's stairs preview.
   */
  private _stairsGhost = new StairsGhost(this._ctx);

  /**
   * Frames drawn per second, over the last second.
   * @returns The frame rate.
   */
  get fps(): number {
    return this._parts.stats.fps;
  }

  /**
   * The map editor's flat lighting: broad daylight with no blood moon, no
   * matter the game's own settings.
   * @param on Whether it's on.
   */
  setFlatLight(on: boolean): void {
    this._parts.sky.flat = on;
  }

  /**
   * The map editor's x-ray for shaping the land: trees, structures, and
   * landmarks are left out (ground, cliffs, stairs, and the fence stay), so
   * every tile can be seen and clicked.
   * @param on Whether it's on.
   */
  setXray(on: boolean): void {
    if (on === this._ctx.xray) {
      return;
    }
    this._ctx.xray = on;
    if (this._ctx.map) {
      this._parts.chunks.rebuild();
    }
    this._parts.scenery.setXray(on);
  }

  /**
   * Hides monsters and their shots (the map editor's view).
   * @param hidden Whether they're hidden.
   */
  setMonstersHidden(hidden: boolean): void {
    this._ctx.monstersHidden = hidden;
  }

  /**
   * The terrain level of a tile, for the map editor.
   * @param tx Tile x.
   * @param ty Tile y.
   * @returns The level.
   */
  levelAt(tx: number, ty: number): number {
    return this._ctx.map?.level(tx, ty) ?? 0;
  }

  /**
   * Rings the tiles the map editor's round brush covers (`size` tiles
   * across, around a tile), drawn over everything, or hides it (null).
   * @param c The brush's tile and size, or null.
   */
  setEditCursor(c: { tx: number; ty: number; size: number } | null): void {
    this._editCursor.set(c);
  }

  /**
   * The light the TV's right mouse button carries, or null.
   * @param at The tile-space point, or null.
   */
  setCursorLight(at: { x: number; y: number } | null): void {
    this._ctx.cursorLight = at;
  }

  /**
   * The map point (in tiles) under a screen point, on the ground there.
   * @param clientX Screen x.
   * @param clientY Screen y.
   * @returns The tile-space point.
   */
  groundAt(clientX: number, clientY: number): { x: number; y: number } {
    return this._picker.groundAt(clientX, clientY);
  }

  /**
   * Where a map point (in tiles), `lift` above the ground there, shows on
   * screen, for /play's USE prompt.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param lift Height above the ground, in world units.
   * @returns The screen point.
   */
  screenOf(x: number, y: number, lift: number): { x: number; y: number } {
    return this._picker.screenOf(x, y, lift);
  }

  /**
   * Where the map editor's stairs could go for a pointed-at tile (see
   * `stairsOptions`).
   * @param tx Tile x pointed at.
   * @param ty Tile y pointed at.
   * @returns The places stairs could go, each with the way they'd climb.
   */
  stairsOptions(tx: number, ty: number): { tx: number; ty: number; dir: number }[] {
    return stairsOptions(this._ctx.map, this._ctx.mapWidth, this._ctx.mapHeight, tx, ty);
  }

  /**
   * The way (an index into RAMP_DIRS) the stairs on a tile climb, or null.
   * @param tx Tile x.
   * @param ty Tile y.
   * @returns The way, or null.
   */
  rampDir(tx: number, ty: number): number | null {
    return rampDir(this._ctx.map, tx, ty);
  }

  /**
   * Shows the stairs the map editor would place on a tile, climbing `dir`
   * if they can, else whichever way the game would pick, or hides them
   * (null).
   * @param g The tile and the way to climb, or null.
   * @returns Which way the shown stairs climb (null when nothing there is
   *   higher).
   */
  setStairsGhost(g: { tx: number; ty: number; dir: number | null } | null): number | null {
    return this._stairsGhost.show(g);
  }

  /**
   * The tiles under a screen point for the map editor, nearest first (see
   * `ScreenPicker.pickTiles`).
   * @param clientX Screen x.
   * @param clientY Screen y.
   * @returns The tiles, with the tile-space point the ray met each at.
   */
  pickTiles(clientX: number, clientY: number): { tx: number; ty: number; x: number; y: number }[] {
    return this._picker.pickTiles(clientX, clientY);
  }

  /**
   * The map as this screen has it (tile changes applied), for the map
   * editor's picker and /play's prediction.
   * @returns The map, or null before a world arrives.
   */
  worldMap(): WorldMap | null {
    return this._ctx.map;
  }

  /**
   * What's on a tile, for the map editor.
   * @param tx Tile x.
   * @param ty Tile y.
   * @returns The tile, or null before a world arrives.
   */
  tileKind(tx: number, ty: number): Tile | null {
    return this._ctx.map?.get(tx, ty) ?? null;
  }

  /**
   * The living player or monster drawn closest to a screen point, if one is
   * close enough to grab.
   * @param clientX Screen x.
   * @param clientY Screen y.
   * @returns What to grab, or null.
   */
  entityAt(clientX: number, clientY: number): LiftTarget | null {
    return this._picker.entityAt(clientX, clientY, this._parts.players.avatars, this._parts.monsters.monsters);
  }

  /**
   * The map editor's top-down view (the camera tilts over to it and back).
   * @param on Whether it's on.
   */
  setTopView(on: boolean): void {
    this._parts.rig.topView = on;
  }

  /**
   * Fixes how many screen pixels each rendered pixel takes (1 is no
   * pixelation), or null to grow pixels with the zoom like the TV does.
   * Takes effect next frame.
   * @param scale The pixel size, or null.
   */
  setPixelScale(scale: number | null): void {
    this._pixelOverride = scale === null ? null : Math.max(1, Math.round(scale));
  }

  /**
   * Coarsens the zoom's own pixel size by `boost` (1 for none), for the
   * TV's scenic Incognito look. Ignored while a pixel size is fixed.
   * @param boost The multiplier.
   */
  setPixelBoost(boost: number): void {
    this._pixelBoost = boost;
  }

  /**
   * Applies a display's settings (see `DisplaySettings`): brightness,
   * camera angle, glow, aberration, fog, screen shake, blood, pickups,
   * names, and health bars. The overlay flags (TPS, FPS, server ticks) are
   * the app's to draw.
   * @param settings The settings.
   */
  setDisplaySettings(settings: DisplaySettings): void {
    this._parts.display.apply(settings);
  }

  /**
   * Which player is this screen's own (for Show my name and Show my health
   * bar), or null on a screen with none (the TV).
   * @param id The player's id, or null.
   */
  setLocalPlayer(id: string | null): void {
    this._ctx.localPlayer = id;
  }

  /**
   * How far ahead of the followed player the camera looks, as a share of
   * half the ground in view, toward where they face (0 centers them; /play
   * uses PLAY_FOLLOW_LEAD).
   * @param share The lead.
   */
  setFollowLead(share: number): void {
    this._parts.rig.follow.leadShare = share;
  }

  /**
   * How fast the camera's lead swings round when the followed player turns
   * (LEAD_EASE by default).
   * @param ease The rate, per second.
   */
  setFollowLeadSpeed(ease: number): void {
    this._parts.rig.follow.leadEase = ease;
  }

  /**
   * How far past the map's edge a following camera may look, in halves of
   * the ground in view (0, the default, stops it at the edge).
   * @param halves The overscroll.
   */
  setFollowOverscroll(halves: number): void {
    this._parts.rig.follow.overscroll = halves;
  }

  /**
   * The elevation this view rests at, in radians above the horizon (the TV
   * uses CAMERA_ELEVATION; /play sits lower, PLAY_ELEVATION). Takes effect
   * at once.
   * @param angle The elevation.
   */
  setCameraElevation(angle: number): void {
    this._parts.rig.setElevation(angle);
  }

  /**
   * Follows one player up close (a /play view, or a pane of the TV's split
   * screen): `view` is how much ground shows (`FollowView`). With no
   * player (or while theirs is missing) it looks at tile point `at`
   * instead. Null and no point frames the whole map again.
   * @param id The player followed, or null.
   * @param view How much ground shows.
   * @param at A tile point to look at while there's no player.
   */
  setFollow(id: string | null, view: FollowView = FOLLOW_TALL, at: { x: number; y: number } | null = null): void {
    this._parts.rig.setFollow(id, view, at);
  }

  /**
   * The tile point a following camera is looking at now, or null while it
   * frames the whole map.
   * @returns The point, in tiles.
   */
  viewCenter(): { x: number; y: number } | null {
    const at = this._parts.rig.follow.at;
    return at ? { x: at.x + this._ctx.mapWidth / 2, y: at.z + this._ctx.mapHeight / 2 } : null;
  }

  /**
   * Where this screen's own player aims their build (the mouse on /play),
   * shown at once instead of waiting for the server to echo it.
   * @param id The player's id.
   * @param at The tile-space point aimed at, or null for the facing tile.
   */
  setBuildAim(id: string, at: { x: number; y: number } | null): void {
    this._parts.preview.setAim(id, at);
  }

  /**
   * Draws a player (this screen's own, on /play) where its prediction puts
   * it rather than where the server last said, or stops with null.
   * @param predicted The predicted player, or null.
   */
  setPredicted(predicted: { id: string; x: number; y: number; facing: number; moving: boolean } | null): void {
    this._parts.players.predicted = predicted;
  }

  /**
   * Starts a player's swing now, before the server says so (/play's
   * instant attacks).
   * @param id The player's id.
   */
  predictSwing(id: string): void {
    this._parts.players.predictSwing(id);
  }

  /**
   * Draws everyone `delay` seconds in the past, blended between snapshots,
   * for a smooth picture over a jittery connection; 0 goes back to easing
   * toward the latest snapshot.
   * @param delay Seconds in the past.
   */
  setInterpolation(delay: number): void {
    this._parts.interp.delay = delay;
  }
}
