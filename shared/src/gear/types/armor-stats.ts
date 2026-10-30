/**
 * What a piece of gear does for whoever wears or raises it. `guard`
 * multiplies damage taken (the shield only from the front). Armor also sets
 * how fast the wearer moves (1 is normal), how far hits throw them (1 is
 * normal, 0 never), and damage thrown back at monsters that hit them in
 * melee.
 */
export interface ArmorStats {
  /**
   * What it multiplies damage taken by (the shield only from the front).
   */
  guard?: number;

  /**
   * How fast the wearer moves (1 is normal).
   */
  speed?: number;

  /**
   * How far hits throw the wearer (1 is normal, 0 never).
   */
  steady?: number;

  /**
   * Damage thrown back at monsters that hit the wearer in melee.
   */
  thorns?: number;
}
