/**
 * Why a phone is looking at the death screen.
 */
export interface DeathInfo {
  /**
   * Who or what did it: a player name, or e.g. "Spikes".
   */
  killer: string;

  /**
   * Seconds the character lived.
   */
  survived: number;

  /**
   * Seconds until respawn, as of sending.
   */
  respawnIn: number;
}

/**
 * Health and death state for the phone's own player.
 */
export interface Vitals {
  /**
   * Health, 0..MAX_HP.
   */
  hp: number;

  /**
   * Health lost to damage too fresh to heal yet, above `hp`.
   */
  wounded: number;

  /**
   * Health still on its way back from the ritual knife's kills (shown
   * strobing on the phone).
   */
  healing: number;

  /**
   * Under spawn protection.
   */
  protected: boolean;

  /**
   * Extra health above full from overheal (Heart Devourer, Death's
   * Harvest), shown as extra hearts. Absent or 0 for none.
   */
  overheal?: number;

  /**
   * How they died, while dead.
   */
  death: DeathInfo | null;
}
