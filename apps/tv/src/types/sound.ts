// Types
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { SfxName } from '@halloween/ui/types/sfx';

/**
 * The TV's per-tick snapshot.
 */
export type StateMessage = Extract<DisplayMessage, { t: 'state' }>;

/**
 * Counters last seen for a player or monster, to spot what changed.
 */
export interface Seen {
  /**
   * Swings (and shots) so far.
   */
  swings: number;

  /**
   * Times hurt so far.
   */
  hurts: number;

  /**
   * Attacks started so far.
   */
  attacks: number;

  /**
   * Broom swipes started so far.
   */
  swipes: number;

  /**
   * Whether it was dead.
   */
  dead: boolean;

  /**
   * Whether it was hunting someone.
   */
  hunting: boolean;

  /**
   * When (seconds) it may next make an idle noise.
   */
  nextVoiceAt: number;

  /**
   * When (seconds) it may next growl while hunting.
   */
  nextGrowlAt: number;
}

/**
 * One sound: its name, pitch, and volume.
 */
export type Cue = [SfxName, number, number];

/**
 * A monster's voice: hurt; as an attack starts winding up (`windup`) and
 * as it lands (`strike`, after the kind's windup); a witch's broom swipe
 * the same way; spotting someone; an idle groan now and then; and, for
 * some, a growl every few seconds while hunting.
 */
export interface Voice {
  /**
   * When it's hurt.
   */
  hurt: Cue | null;

  /**
   * As an attack starts winding up.
   */
  windup: Cue | null;

  /**
   * As an attack lands.
   */
  strike: Cue[];

  /**
   * On spotting someone.
   */
  spot: Cue;

  /**
   * An idle groan now and then.
   */
  idle: Cue;

  /**
   * A growl every few seconds while hunting.
   */
  growl?: Cue;

  /**
   * Its second attack, counted by `swipes` (a witch's broom, a werewolf's
   * pounce): cues as it winds up and lands, and its windup (seconds).
   */
  swipe?: { windup: Cue; strike: Cue[]; time: number };
}
