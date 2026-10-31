/**
 * What a weapon is infused with at an anvil: holy water (Blessed), brute
 * tendons (Hulking), ghoul fangs (Feral), ectoplasm (Ephemeral), hex
 * shards (Hexed), or brimstone (Enflamed). Silver alone infuses only the
 * shield (the Mirror Shield).
 */
export type Essence = 'ecto' | 'holy' | 'brimstone' | 'hex' | 'fang' | 'tendons' | 'silver';

/**
 * How far along its path an infusion is: 1, then 2 (the torch and the
 * shield stop at 1).
 */
export type InfusionLevel = 1 | 2;

/**
 * One item's infusion. The first one locks the item into its essence's
 * path for good; with the item's kind it names exactly one variant (see
 * `VARIANTS`).
 */
export interface Infusion {
  /**
   * The essence it was infused with (its path).
   */
  essence: Essence;

  /**
   * How far along the path it is.
   */
  level: InfusionLevel;
}
