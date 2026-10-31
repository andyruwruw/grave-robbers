// Packages
import { Vector3 } from 'three';

/**
 * Screen pixels per rendered pixel. The scene renders at 1/PIXEL_SCALE
 * resolution and is upscaled with nearest-neighbor for the chunky look.
 */
export const PIXEL_SCALE = 3;

/**
 * The camera half-height (world units) at which pixels are PIXEL_SCALE
 * screen pixels: about the TV framing a whole classic map. Zoomed in past
 * it (a /play view, a TV pane following a player) each rendered pixel
 * grows by the same factor, rounded to whole screen pixels, so pixels stay
 * the same size in the world instead of getting finer.
 */
export const PIXEL_REFERENCE_HALF_HEIGHT = 16;

/**
 * The largest a pixel grows when zoomed in, in screen pixels, unless a view
 * sets its own size (`WorldRenderer.setPixelScale`; /play does).
 */
export const DEFAULT_PIXEL_LIMIT = 4;

/**
 * Camera elevation above the horizon, in radians: the TV's and admin's.
 * A view can pick another (`WorldRenderer.setCameraElevation`).
 */
export const CAMERA_ELEVATION = (55 * Math.PI) / 180;

/**
 * The map editor's top-down view: steep enough that a level's wall hides
 * only a sliver of the tile behind it. The camera eases between the two at
 * CAMERA_TILT_RATE radians a second.
 */
export const TOP_VIEW_ELEVATION = (80 * Math.PI) / 180;

/**
 * /play's elevation: a little lower than the TV's, so the follow view
 * looks more across the ground and less straight down.
 */
export const PLAY_ELEVATION = (47 * Math.PI) / 180;

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
 * How fast a follow camera's lead (see `CameraFollow.leadShare`) swings
 * round to a new facing by default: much slower than the follow, so a
 * quick turn of the aim doesn't whip the view about (/play's Camera lead
 * speed changes it, `CameraFollow.leadEase`).
 */
export const LEAD_EASE = 1.25;

/**
 * /play's lead: how far ahead of the player the camera sits, as a share of
 * half the ground in view, so there's always more room in front than
 * behind.
 */
export const PLAY_FOLLOW_LEAD = 0.1;

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

/**
 * The camera's usual near and far clipping distances. Zoomed far out
 * (the admin's view), they widen so the whole view still draws.
 */
export const NEAR = 1;
export const FAR = 200;

/**
 * Extra depth kept in the clipping range past the ground the camera sees,
 * for what stands up off it.
 */
export const VIEW_DEPTH_SLACK = 20;
