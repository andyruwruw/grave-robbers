// Types
import type {
  Color,
  DataTexture,
  Group,
  Mesh,
  Vector3,
  Vector4,
} from 'three';

/**
 * One light source, in tile coordinates.
 */
export interface LightSource {
  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * How far it reaches, in tiles.
   */
  radius: number;

  /**
   * Its color.
   */
  color: Color;

  /**
   * 0..1 multiplier (flicker, fuel running out).
   */
  intensity: number;
}

/**
 * Where a flame sits and how big it is.
 */
export interface FlameSpot {
  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * World height of the flame's base.
   */
  height: number;

  /**
   * Overall size (torch is small, campfire big).
   */
  size: number;

  /**
   * 0..1, shrinks the flame as fuel runs out.
   */
  strength: number;

  /**
   * Burns crimson (an altar or blood forge) instead of orange.
   */
  blood?: boolean;

  /**
   * Burns with a ghost's cold blue-green (soul fires, ghost lamps).
   */
  soul?: boolean;
}

/**
 * Something that disturbs the fog this frame, at a tile-space point:
 * `push` (per second) shoves it out of the radius and `vx`/`vy` (tiles/s)
 * drag it along (walkers), `burn` thins it (lights), and `add` thickens it
 * (ghosts), each per second.
 */
export interface FogStamp {
  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * How far it reaches, in tiles.
   */
  radius: number;

  /**
   * Shoves fog out of the radius, per second.
   */
  push?: number;

  /**
   * Drags fog along x, in tiles per second.
   */
  vx?: number;

  /**
   * Drags fog along y, in tiles per second.
   */
  vy?: number;

  /**
   * Thins fog in place, per second.
   */
  burn?: number;

  /**
   * Thickens fog in place, per second.
   */
  add?: number;
}

/**
 * Something heavy nearby: where (world x, z) and how hard (0 is nothing,
 * 1 a footfall, more for a slam).
 */
export interface ShakeSource {
  /**
   * World-space x.
   */
  x: number;

  /**
   * World-space z.
   */
  z: number;

  /**
   * How hard it shakes.
   */
  strength: number;
}

/**
 * TV look controls, each 0..1. Stored per TV and adjusted from the sidebar.
 */
export interface StyleSettings {
  /**
   * Darken and desaturate the scene by distance from the nearest player.
   */
  focus: number;

  /**
   * Extra color saturation (the light map also brightens with this).
   */
  vibrance: number;

  /**
   * Bloom around bright things: flames, lanterns, pumpkins.
   */
  glow: number;

  /**
   * Red/blue fringing away from players; the area around them stays clear.
   */
  aberration: number;

  /**
   * Thickness of the ground fog (0 turns it off).
   */
  fog: number;
}

/**
 * The light map's uniforms, shared by every material it darkens and by
 * custom shaders (the fog) that light themselves the same way.
 */
export interface LightUniforms {
  /**
   * The light texture. Decode a texel as `level * level * LIGHT_RANGE`.
   */
  lightMap: { value: DataTexture };

  /**
   * The light off the texture's window (plain ambient).
   */
  lightOutside: { value: Vector3 };

  /**
   * The texture's window in world space: corner x, corner z, width, depth.
   */
  lightWindow: { value: Vector4 };
}

/**
 * One pooled slot for a shot in flight: a mesh per kind of shot, only the
 * one matching the shot shown.
 */
export interface ShotSlot {
  /**
   * A crossbow bolt's pale streak.
   */
  bolt: Mesh;

  /**
   * A gob of blood trailing a smear.
   */
  gob: Group;

  /**
   * A ghost's ball of ectoplasm.
   */
  ecto: Group;

  /**
   * A skeleton's arrow.
   */
  arrow: Group;

  /**
   * A witch's potion.
   */
  potion: Group;
}
