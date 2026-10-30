/**
 * Testing switches from the TV's Game tab.
 */
export interface GameSettings {
  /**
   * Zombies and vampires hunt players (off: they only wander).
   */
  aggressive: boolean;

  /**
   * A server-run player that gathers, builds, and fights on its own.
   */
  testPlayer: boolean;

  /**
   * Every light is out: pumpkins, lamps, torches, campfires, lanterns.
   */
  lightsOff: boolean;

  /**
   * Broad daylight on the TV (just how it looks; monsters act the same).
   */
  daytime: boolean;

  /**
   * The TV's mouse can pick up players and monsters and drop them
   * anywhere.
   */
  tvDrag: boolean;

  /**
   * Holding the TV's right mouse button carries a light around.
   */
  tvLight: boolean;

  /**
   * Levels the Game tab adds to the world level on top of what the
   * players call for (0 to WORLD_LEVEL_BOOST_MAX).
   */
  levelBoost: number;

  /**
   * Testing: every recipe and skill tree node is open to everyone (All
   * unlocks), and crafting costs nothing (Free crafting).
   */
  allUnlocks: boolean;

  /**
   * Testing: crafting costs nothing (Free crafting).
   */
  freeCrafting: boolean;

  /**
   * Things come on their own: monsters walk in (and a few wander with
   * nobody playing), blood moons rise, and trees, pumpkins, and chests grow
   * back. Off (the sandbox), only what the Game tab spawns shows up.
   */
  spawning: boolean;
}

/**
 * The switches a server starts with (key order is what `sameGameSettings`
 * compares).
 */
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  aggressive: true,
  testPlayer: false,
  lightsOff: false,
  daytime: false,
  tvDrag: true,
  tvLight: true,
  levelBoost: 0,
  allUnlocks: false,
  freeCrafting: false,
  spawning: true,
};

/**
 * Whether two sets of switches match, so pages only re-render on a change.
 *
 * @param a One set.
 * @param b The other.
 * @returns True when every switch matches.
 */
export function sameGameSettings(a: GameSettings, b: GameSettings): boolean {
  return (Object.keys(DEFAULT_GAME_SETTINGS) as (keyof GameSettings)[]).every((key): boolean => a[key] === b[key]);
}
