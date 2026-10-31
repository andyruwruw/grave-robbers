/**
 * Burning (Enflamed hits, scorched ground, fire trails, blasts).
 */
export const STATUS_BURNING = 1;

/**
 * Hex cursed (slowed, hurt over time, takes more from everyone).
 */
export const STATUS_CURSED = 2;

/**
 * Poisoned (Ghoul Poker).
 */
export const STATUS_POISONED = 4;

/**
 * Pinned in place (The Impaler, Hunter's Arbalest).
 */
export const STATUS_PINNED = 8;

/**
 * Slowed by a hit (Phantom Edge, Spirit Bow), not counting a curse.
 */
export const STATUS_SLOWED = 16;

/**
 * Turned on the other monsters (Plague Knuckles), or risen on the
 * players' side (Grave Fists).
 */
export const STATUS_TURNED = 32;

/**
 * Bleeding.
 */
export const STATUS_BLEEDING = 64;

/**
 * Burning and giving off light (Hell's Edge).
 */
export const STATUS_GLOWING = 128;

/**
 * Warded by a necromancer close by (takes less from hits).
 */
export const STATUS_WARDED = 256;

/**
 * Whether a monster's status has a bit set. The STATUS_ bits of
 * `MonsterState.status` say what's afflicting a monster right now, for the
 * display's tints and auras (see `docs/infusions.md`).
 *
 * @param status Its `MonsterState.status`.
 * @param bit One of the STATUS_ bits.
 * @returns True when it's set.
 */
export const hasStatus = (status: number, bit: number): boolean => (status & bit) !== 0;
