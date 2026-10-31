/**
 * The world save format's version (`world.json` in a slot). A save from an
 * older version is brought up to date by `migrateWorld`; one it can't
 * read is set aside and the slot starts a new world.
 */
export const WORLD_SAVE_VERSION = 9 as const;

/**
 * The player save format's version (`players/<id>.json`).
 */
export const PLAYER_SAVE_VERSION = 1 as const;

/**
 * Tiles across and down a chunk file covers (edge chunks are smaller).
 */
export const CHUNK_SIZE = 32;

/**
 * Minutes between automatic backups of the active slot, and how many
 * backups each slot keeps (oldest go first).
 */
export const BACKUP_EVERY_MIN = 60;
export const BACKUPS_KEPT = 24;

/**
 * The slot a server makes the first time it starts.
 */
export const FIRST_SLOT_NAME = 'Main';

/**
 * Longest name a world slot can have.
 */
export const MAX_SLOT_NAME = 32;
