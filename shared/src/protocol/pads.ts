/**
 * What a game controller plugged into the TV is doing, sent by the TV for
 * the player who claimed it whenever it changes (`panic`, `bag`, `craft`,
 * `tree`, `turnLeft`, and `turnRight` count presses of B, the west and
 * north face buttons, Back/Minus, LB, and RB since the claim; both sides
 * start them at 0).
 */
export interface PadState {
  /**
   * Left stick x, -1 to 1.
   */
  x: number;

  /**
   * Left stick y, -1 to 1.
   */
  y: number;

  /**
   * Right stick x, -1 to 1.
   */
  aimX: number;

  /**
   * Right stick y, -1 to 1.
   */
  aimY: number;

  /**
   * Action held.
   */
  act: boolean;

  /**
   * Block held.
   */
  block: boolean;

  /**
   * Presses of B since the claim (Panic).
   */
  panic: number;

  /**
   * Presses of the west face button since the claim (Bag).
   */
  bag: number;

  /**
   * Presses of the north face button since the claim (Craft).
   */
  craft: number;

  /**
   * Presses of Back/Minus since the claim (Tree).
   */
  tree: number;

  /**
   * Presses of LB since the claim.
   */
  turnLeft: number;

  /**
   * Presses of RB since the claim.
   */
  turnRight: number;
}

/**
 * A game controller plugged into a TV, as the TV's Controllers tab sees
 * it: which TV page (numbered as they connect) and who holds it.
 */
export interface TvPadEntry {
  /**
   * The controller's id on its TV.
   */
  id: string;

  /**
   * Which TV page it's plugged into (numbered as they connect).
   */
  tv: number;

  /**
   * The controller's name.
   */
  name: string;

  /**
   * Who holds it, if anyone.
   */
  player: { id: string; name: string; color: string } | null;
}

/**
 * A game controller plugged into a TV, as a phone sees it.
 */
export interface PadInfo {
  /**
   * The controller's id on its TV.
   */
  id: string;

  /**
   * The controller's name.
   */
  name: string;

  /**
   * Whether this phone's player holds it.
   */
  mine: boolean;

  /**
   * Whether someone else holds it.
   */
  taken: boolean;
}
