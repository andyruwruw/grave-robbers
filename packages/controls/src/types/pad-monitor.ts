/**
 * One controller this computer sees.
 */
export interface PadReading {
  /**
   * The browser's gamepad index.
   */
  index: number;

  /**
   * Its name, without the vendor details.
   */
  name: string;

  /**
   * Whether a button is held or a stick moved right now.
   */
  active: boolean;
}
