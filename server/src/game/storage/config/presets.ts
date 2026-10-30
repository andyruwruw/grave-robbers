/**
 * The preset new worlds start from unless the TV picks another (or a
 * random map): `WORLD_PRESET`, else `graveyard`. Ignored if that file is
 * missing.
 */
export const DEFAULT_PRESET = process.env.WORLD_PRESET ?? 'king-of-the-hill';
