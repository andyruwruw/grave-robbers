// Types
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * Bare floor the admin's cursor can put a tree, pumpkin, chest, rock, or
 * structure on, past the usual rules: never on top of something, on
 * stairs, on the spawn, or on a grave mound.
 */
export const FREE_FLOORS: ReadonlySet<Tile> = new Set<Tile>(['grass', 'path', 'cobble', 'flagstone']);
