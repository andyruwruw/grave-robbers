// Types
import type { MonsterKind } from '../../../monsters/monster-kinds';
import type { BurnTrick, CurseTrick } from '../../types/status-tricks';

/**
 * The hex curse in an essence package: like `CurseTrick`, but its chance
 * is per second of the weapon's cycle (see `curseChance`), so fast and
 * slow weapons curse about equally often.
 */
export interface CursePackage extends Omit<CurseTrick, 'chance'> {
  /**
   * Chance to curse per second of the weapon's cycle.
   */
  perCycleSecond: number;
}

/**
 * What one essence brings at one level, before a variant's twist (see
 * `ESSENCE_PACKAGES`). Multipliers apply to the weapon's stats after its
 * skill tree perk.
 */
export interface EssencePackage {
  /**
   * What damage is multiplied by (Hulking).
   */
  damage?: number;

  /**
   * What knockback is multiplied by (Hulking).
   */
  knockback?: number;

  /**
   * Stun chance added to each hit (Hulking).
   */
  stun?: number;

  /**
   * What the whole swing cycle (cooldown, windup, reload, draw) is
   * divided by (Feral).
   */
  haste?: number;

  /**
   * What damage to each listed kind is multiplied by (Ephemeral,
   * Enflamed).
   */
  bane?: Partial<Record<MonsterKind, number>>;

  /**
   * Blessed: what damage to vampires and demons is multiplied by (see
   * `WeaponStats.blessing`).
   */
  blessing?: number;

  /**
   * Ephemeral: ghosts take this many times GHOST_DAMAGE.
   */
  ghostMult?: number;

  /**
   * Ephemeral: what knockback on ghosts is multiplied by, in place of
   * GHOST_KNOCKBACK.
   */
  ghostKnock?: number;

  /**
   * Hexed: the curse.
   */
  curse?: CursePackage;

  /**
   * Enflamed: the burn.
   */
  burn?: BurnTrick;
}
