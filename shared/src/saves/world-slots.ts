/**
 * One saved world, as the admin's Worlds page lists it.
 */
export interface WorldSlotInfo {
  /**
   * Its folder name.
   */
  id: string;

  /**
   * Its name.
   */
  name: string;

  /**
   * When it was made (ms since the epoch).
   */
  created: number;

  /**
   * When it was last saved (ms since the epoch), or 0 if never.
   */
  savedAt: number;

  /**
   * Its map's size in tiles (0 before its first save).
   */
  width: number;

  /**
   * Its map's size in tiles (0 before its first save).
   */
  height: number;

  /**
   * How many characters it keeps.
   */
  characters: number;

  /**
   * Whether it's the world being played.
   */
  active: boolean;
}

/**
 * One character in the world being played, as the admin lists them.
 */
export interface CharacterInfo {
  /**
   * Their id.
   */
  id: string;

  /**
   * Their name.
   */
  name: string;

  /**
   * Their color.
   */
  color: string;

  /**
   * Whether they're in the game now.
   */
  online: boolean;
}
