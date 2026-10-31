/**
 * Body colors a player can pick. Game content, not UI chrome.
 */
export const PLAYER_COLORS = [
  '#e8742a',
  '#8b3fd9',
  '#3fb950',
  '#d93f5b',
  '#3f8bd9',
  '#e8c547',
  '#e0e0e0',
  '#40c4b4',
];

/**
 * Most players allowed in at once.
 */
export const MAX_PLAYERS = 8;

/**
 * Longest allowed player name.
 */
export const MAX_NAME_LENGTH = 14;

/**
 * How many tokens of characters it played a device remembers (and offers
 * when joining under a name that has a character), newest first.
 */
export const MAX_KNOWN_TOKENS = 16;

/**
 * How many characters a transfer code has (see `TransferCodes`).
 */
export const TRANSFER_CODE_LENGTH = 6;
