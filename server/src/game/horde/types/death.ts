// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';

/**
 * What finished a monster off: a hit landing, one of its wounds
 * (`bleed`, `burn`, `poison`, `curse`), plain damage with no hit behind
 * it (`drain`: incense, say), a trap, a risen ally's time running out
 * (`expired`), or anything else.
 */
export type DeathCause = 'hit' | 'bleed' | 'burn' | 'poison' | 'curse' | 'drain' | 'trap' | 'expired' | 'other';

/**
 * A monster's death as the game side sees it (`HordeHooks.died`), for
 * on-kill effects that must fire however it died: kill heals, death
 * blasts, Infernal Mandate's burning kills.
 */
export interface MonsterDeath<P> {
  /**
   * Its id (already gone from the horde).
   */
  id: number;

  /**
   * What it was.
   */
  kind: MonsterKind;

  /**
   * Where it died (tiles).
   */
  x: number;

  /**
   * Where it died (tiles).
   */
  y: number;

  /**
   * Who gets the kill: the hit's `by`, or whoever made the wound it died
   * of. Null when nobody is behind it (a turret, a trap); the spoils then
   * go to the nearest player as before.
   */
  killer: P | null;

  /**
   * What finished it off.
   */
  cause: DeathCause;

  /**
   * Its `MonsterState.status` bits as it died (STATUS_BURNING,
   * STATUS_BLEEDING, STATUS_CURSED, ...), from
   * `shared/src/monsters/monster-status.ts`.
   */
  status: number;

  /**
   * Who made the bleeding wound it had, if it was bleeding.
   */
  bleedBy: P | null;

  /**
   * Raised by a necromancer, or a risen ally: it leaves nothing.
   */
  raised: boolean;

  /**
   * It was a risen ally fighting on the players' side (Grave Fists), so
   * it shouldn't count as a kill.
   */
  ally: boolean;
}
