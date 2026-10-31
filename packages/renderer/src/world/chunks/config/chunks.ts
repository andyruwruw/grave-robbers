// Types
import type { GrownTile } from '@halloween/shared/protocol/game-events';

/**
 * The world is built in CHUNK x CHUNK tile pieces.
 */
export const CHUNK = 16;

/**
 * A map of at most this many chunks is built whole; a bigger one only
 * around the camera.
 */
export const SMALL_MAP_CHUNKS = 24;

/**
 * Chunks within this many chunks of the view are built.
 */
export const CHUNK_LOAD_MARGIN = 1;

/**
 * Chunks past this many chunks from the view are dropped.
 */
export const CHUNK_KEEP_MARGIN = 2;

/**
 * Most chunks built in one frame.
 */
export const CHUNK_BUILDS_PER_FRAME = 2;

/**
 * Tiles more to cover tall things rising into view from below.
 */
export const VIEW_DEPTH_PAD = 4;

/**
 * Broken things fall apart into chunks no longer than this (world units).
 */
export const DEBRIS_CHUNK = 0.22;

/**
 * How long each thing takes to grow in (seconds).
 */
export const GROW_TIME: Record<GrownTile, number> = { tree: 2.6, hedge: 2, pumpkin: 1.6, chest: 1.4, tombstone: 1.8, cross: 1.8 };

/**
 * How long a dug-up gravestone takes to shudder down into the ground
 * (seconds).
 */
export const SINK_TIME = 1.4;
