// Local Imports
import { PlayerKit } from './player-kit';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';

/**
 * A player's fighting state: swings, blocking, bows, crossbows, combos,
 * and what's drawn in hand (all times in game-clock seconds).
 */
export class PlayerFighter extends PlayerKit {
  /**
   * Swing counter; the display animates a swing whenever it goes up.
   */
  swings = 0;

  /**
   * Holding their shield up.
   */
  blocking = false;

  /**
   * When they can act again.
   */
  nextActionAt = 0;

  /**
   * When the swing in progress lands, or null between swings.
   */
  strikeAt: number | null = null;

  /**
   * When they started drawing a bow (null when they aren't).
   */
  drawFrom: number | null = null;

  /**
   * When a crossbow taking aim fires (null: not aiming).
   */
  aimUntil: number | null = null;

  /**
   * The monster a crossbow taking aim is locked onto.
   */
  aimTarget: number | null = null;

  /**
   * The next step of a combo.
   */
  comboNext = 0;

  /**
   * When the last combo swing was.
   */
  comboAt = 0;

  /**
   * The step the swing in progress is (-1: none).
   */
  combo = -1;

  /**
   * A gauntlet's charge from landed hits.
   */
  charge = 0;

  /**
   * When a crossbow's reload finishes (null: not reloading).
   */
  reloadUntil: number | null = null;

  /**
   * What the swing in progress is made with when it isn't the weapon (the
   * hammer for a job, a stake from the bag for a vampire).
   */
  swingWith: GearKind | null = null;

  /**
   * What's drawn in hand in place of the weapon.
   */
  drawn: GearKind | null = null;

  /**
   * Until when it stays drawn.
   */
  drawnUntil = 0;

  /**
   * Until when the job swing shows digging (a spade instead of the
   * hammer), for a grave.
   */
  digUntil = 0;

  /**
   * Until when a heavy swing slows them.
   */
  braceUntil = 0;

  /**
   * Kills toward the next wail (Wailing Sickle).
   */
  wailKills = 0;

  /**
   * The next sweep is a wail shockwave (Wailing Sickle).
   */
  wailCharged = false;

  /**
   * Landed hits toward the next fissure (Earthshaker).
   */
  fissureHits = 0;

  /**
   * The next swing skips its windup (Headsman's Axe).
   */
  skipWindup = false;

  /**
   * The latest melee swing skipped its windup (Headsman's Axe), so the TV
   * plays it at the plain pace.
   */
  quickSwing = false;

  /**
   * When a slaying blade is ready again (Moonsilver Saber); it's dimmed
   * until then.
   */
  slayReadyAt = 0;

  /**
   * When their recent death blasts went off (game clock), for the cap a
   * second.
   */
  blastTimes: number[] = [];
}
