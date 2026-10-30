/**
 * Ranged tricks. Ranged weapons spend `ammo` (bolts from the bag, or blood)
 * per shot. `draw` is seconds to pull a bow back fully (hold to draw, let
 * go to loose; a full draw hits DRAW_BONUS times as hard and looses
 * itself). `burst` is shots before a `reload` (seconds). `pellets` fly in a
 * cone `spread` radians wide. `pierce` is how many monsters a bolt goes
 * through before it stops.
 */
export interface RangedTricks {
  /**
   * Shoots instead of swinging.
   */
  ranged?: boolean;

  /**
   * What each shot spends (bolts or arrows from the bag, or blood).
   */
  ammo?: 'bolts' | 'arrows' | 'blood';

  /**
   * Chance a shot doesn't use up its ammo (the arrows' upgrades).
   */
  thrift?: number;

  /**
   * Seconds a ranged weapon takes aim before it fires (the crossbow): it
   * locks onto a monster (see `Game.lockOn`) and turns to it meanwhile.
   */
  sight?: number;

  /**
   * Seconds to pull a bow back fully (hold to draw, let go to loose; a full
   * draw hits DRAW_BONUS times as hard and looses itself).
   */
  draw?: number;

  /**
   * Shots before a reload.
   */
  burst?: number;

  /**
   * Seconds a reload takes.
   */
  reload?: number;

  /**
   * Pellets each shot fires, in a cone.
   */
  pellets?: number;

  /**
   * How wide (radians) the cone of pellets is.
   */
  spread?: number;

  /**
   * Monsters a bolt goes through before it stops.
   */
  pierce?: number;
}
