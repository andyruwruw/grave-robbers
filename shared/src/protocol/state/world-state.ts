// Types
import type { MonsterKind } from '../../monsters/monster-kinds';

/**
 * Something shot in flight: a crossbow bolt, or a gob of blood from a
 * blunderbuss or a sentry.
 */
export interface ShotState {
  /**
   * Unique id among the shots.
   */
  id: number;

  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * Direction of travel in radians.
   */
  angle: number;

  /**
   * A crossbow bolt, a gob of blood (blunderbuss or sentry), a ghost's
   * ball of ectoplasm, a skeleton's arrow, a witch's potion, or an
   * infused weapon's: a thrown glaive (Soulbound and Wraith Glaive), a
   * fire arrow (Flame and Pyre Bow), a spirit arrow (Spirit Bow,
   * Wraithstring), or a ghost bullet (Ephemeral Musket, Ghostlock).
   */
  kind: 'bolt' | 'blood' | 'ecto' | 'arrow' | 'potion' | 'glaive' | 'fire-arrow' | 'spirit-arrow' | 'ghost-bullet';

  /**
   * How far through its flight a lobbed potion is, 0 to 1 (for its arc).
   */
  lob?: number;
}

/**
 * A puddle a witch's potion left: where, and how much of its life is
 * left (1 fresh to 0 gone).
 */
export interface PuddleState {
  /**
   * Unique id among the puddles.
   */
  id: number;

  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * How much of its life is left, 1 fresh to 0 gone.
   */
  life: number;

  /**
   * A bloater's bile (green) rather than a witch's potion (purple).
   */
  bile: boolean;
}

/**
 * A patch of ground an infused weapon left (see `docs/infusions.md`):
 * scorched ground (Hellfire Hammer), a fire trail (Pyre Bow), or incense
 * (Censer Flail, Thurible of Judgment).
 */
export interface PatchState {
  /**
   * Unique id among the patches.
   */
  id: number;

  /**
   * What it is.
   */
  kind: 'scorch' | 'fire' | 'incense';

  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * Its radius in tiles.
   */
  radius: number;

  /**
   * How much of its life is left, 1 fresh to 0 gone.
   */
  life: number;
}

/**
 * A burning torch or campfire.
 */
export interface LightState {
  /**
   * Row-major tile index.
   */
  i: number;

  /**
   * Seconds of glow left, capped at LOW_FUEL (ALTAR_AWAKE_SECONDS for an
   * altar; a light burns for good, so only stations and altars ever run
   * low).
   */
  fuel: number;

  /**
   * How far (tiles) and how bright it shines, with its builder's upgrades.
   */
  radius: number;

  /**
   * How bright it shines at its middle.
   */
  intensity: number;

  /**
   * How much of its sputter is left (1 to 0) while a world event's
   * blackout is putting it out.
   */
  dying?: number;
}

/**
 * A monster a blood fountain has caught: the TV hides its body and floats
 * its head in the basin's blood.
 */
export interface VictimState {
  /**
   * The fountain's row-major tile index.
   */
  i: number;

  /**
   * The caught monster's id.
   */
  id: number;

  /**
   * The caught monster's kind.
   */
  kind: MonsterKind;
}
