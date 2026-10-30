// Packages
import { Vector3 } from 'three';

/**
 * Screen pixels per rendered pixel. The scene renders at 1/PIXEL_SCALE
 * resolution and is upscaled with nearest-neighbor for the chunky look.
 */
export const PIXEL_SCALE = 3;

/**
 * Camera elevation above the horizon, in radians.
 */
export const CAMERA_ELEVATION = (55 * Math.PI) / 180;

/**
 * The map editor's top-down view: steep enough that a level's wall hides
 * only a sliver of the tile behind it. The camera eases between the two at
 * CAMERA_TILT_RATE radians a second.
 */
export const TOP_VIEW_ELEVATION = (80 * Math.PI) / 180;

/**
 * How fast the camera eases between its two elevations, in radians a
 * second (see TOP_VIEW_ELEVATION).
 */
export const CAMERA_TILT_RATE = 1.2;

/**
 * How far the camera sits from what it looks at.
 */
export const CAMERA_DISTANCE = 60;

/**
 * Where the moon (the shadow-casting light) sits relative to what it
 * shines on: the map's middle, or the followed player on /play.
 */
export const MOON_OFFSET = new Vector3(-12, 24, -10);

/**
 * A /play view's default zoom (tiles of ground top to bottom), how fast its
 * camera catches up with the player, and how far past the map's edge it may
 * look.
 */
export const FOLLOW_TALL = 20;

/**
 * How fast a follow camera catches up with the player (see FOLLOW_TALL).
 */
export const FOLLOW_EASE = 6;

/**
 * How far past the map's edge a follow camera may look, in tiles (see
 * FOLLOW_TALL).
 */
export const FOLLOW_EDGE = 2;

/**
 * Head-room above the ground plane the camera keeps in frame, in tiles.
 */
export const VIEW_MARGIN = 1.2;

/**
 * How long the screen shakes when a hit connects, in seconds.
 */
export const SHAKE_TIME = 0.16;

/**
 * How far the screen shakes when a hit connects, in world units.
 */
export const SHAKE_AMOUNT = 0.14;
