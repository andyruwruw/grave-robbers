// Types
import type { MonsterKind } from '../../monsters/monster-kinds';
import type { ShotState } from '../../protocol/state/world-state';
import type { DeathBlastTrick, FireTrailTrick, FissureTrick, IncenseTrick, ScorchTrick, SlamTrick, WailTrick } from './area-tricks';
import type { NovaTrick, OverhealTrick, RaiseTrick, SlayTrick, SprayTrick, ThrowTrick, TurnTrick } from './special-tricks';
import type { BurnTrick, ChainTrick, CurseTrick, PinTrick, PoisonTrick, SlowTrick } from './status-tricks';

/**
 * What infusions add to a weapon (see `docs/infusions.md`): the essence
 * packages' values and each variant's twist. All are optional and absent
 * on a plain weapon, so an un-infused weapon fights exactly as before.
 */
export interface InfusionTricks {
  /**
   * Multiplies damage to each listed kind (Ephemeral: skeletons;
   * Enflamed: zombies, brutes, ghouls; Silvered: vampires, ghouls). Never
   * lists ghosts (see `ghostMult`).
   */
  bane?: Partial<Record<MonsterKind, number>>;

  /**
   * Blessed: multiplies damage to vampires and demons, stacking with
   * `holy` and `blessed` up to BLESSED_CAP in all.
   */
  blessing?: number;

  /**
   * Ephemeral: ghosts take this many times GHOST_DAMAGE of each hit
   * instead of GHOST_DAMAGE (4 is full damage).
   */
  ghostMult?: number;

  /**
   * Ephemeral: what this weapon's knockback is multiplied by on ghosts,
   * in place of GHOST_KNOCKBACK.
   */
  ghostKnock?: number;

  /**
   * Enflamed: sets what it hits burning (not ghosts).
   */
  burn?: BurnTrick;

  /**
   * A chance to poison what it hits.
   */
  poison?: PoisonTrick;

  /**
   * Hexed: a chance to curse what it hits.
   */
  curse?: CurseTrick;

  /**
   * A chance to slow what it hits.
   */
  slowOnHit?: SlowTrick;

  /**
   * Hits pin what they land on.
   */
  pin?: PinTrick;

  /**
   * Hits send chain lightning on to nearby monsters.
   */
  chain?: ChainTrick;

  /**
   * Hits scorch the ground under what they land on.
   */
  scorch?: ScorchTrick;

  /**
   * Arrows leave a trail of fire.
   */
  fireTrail?: FireTrailTrick;

  /**
   * Swings leave incense.
   */
  incense?: IncenseTrick;

  /**
   * Kills charge a wail shockwave.
   */
  wail?: WailTrick;

  /**
   * Every strike is a ground slam.
   */
  slam?: SlamTrick;

  /**
   * Every few hits crack a fissure ahead.
   */
  fissure?: FissureTrick;

  /**
   * Kills burst, hurting what's around them.
   */
  deathBlast?: DeathBlastTrick;

  /**
   * Stun chance added to each hit for every other monster caught in the
   * same swing (Bonesplitter).
   */
  stunPerExtra?: number;

  /**
   * A swing that kills at least this many makes the next swing skip its
   * windup (Headsman's Axe).
   */
  multiKillSkip?: number;

  /**
   * Execution also counts cursed monsters (Doomblade): a cursed monster
   * takes the larger of this and `execute` times the damage, at any
   * health.
   */
  executeCursed?: number;

  /**
   * A cursed monster under this share of its health (0 to 1) dies
   * outright when hit (Executioner's Oath).
   */
  cursedKillBelow?: number;

  /**
   * Health the combo's last step gives back when it lands (Bishop's
   * Crozier), once per swing.
   */
  finishHeal?: number;

  /**
   * Health each kill gives back at once (Reaper's Call).
   */
  killHeal?: number;

  /**
   * What `feast` is multiplied by for a kill on a bleeding monster
   * (Bloodletter).
   */
  bleedKillHealMult?: number;

  /**
   * Healing from this weapon's kills past full becomes overheal.
   */
  overheal?: OverhealTrick;

  /**
   * What the wielder's damage is multiplied by while they have overheal
   * (Death's Harvest).
   */
  overhealDamage?: number;

  /**
   * The combo's stab step is a throw.
   */
  throwStab?: ThrowTrick;

  /**
   * The super uppercut sends out a holy nova.
   */
  nova?: NovaTrick;

  /**
   * A chance to turn bleeding monsters on the others.
   */
  turn?: TurnTrick;

  /**
   * Monsters that die bleeding rise on the wielder's side.
   */
  raise?: RaiseTrick;

  /**
   * Shots fly through walls, structures, trees, and terrain: only at a
   * full draw (`drawn`, Wraithstring) or every shot (`always`, the
   * Ephemeral Musket).
   */
  wallPass?: 'drawn' | 'always';

  /**
   * Times each shot bounces off a wall instead of stopping (Bone Choir).
   */
  bounces?: number;

  /**
   * Shots go through every monster in their line out to `reach`
   * (Ghostlock).
   */
  pierceAll?: boolean;

  /**
   * A kill banks a quick reload: the next reload takes this share of its
   * time (one banked at a time; Bone Rattler).
   */
  reloadOnKill?: number;

  /**
   * One hit kills the listed kinds outright, then recharges.
   */
  slayEvery?: SlayTrick;

  /**
   * Holding Action sprays fire instead of shooting.
   */
  spray?: SprayTrick;

  /**
   * Radius in tiles of the light it gives off while held (Moonsilver
   * Saber), if any.
   */
  lightRadius?: number;

  /**
   * What a held torch's light radius is multiplied by (the Brimstone
   * Torch; an off-hand twist, read through `variantOf`).
   */
  lightMult?: number;

  /**
   * A raised block sends back skeleton arrows, witch potions, and ghost
   * ectoplasm (the Mirror Shield; an off-hand twist, read through
   * `variantOf`).
   */
  reflect?: boolean;

  /**
   * The shot kind its shots fly as, in place of the ammo's own (fire and
   * spirit arrows, ghost bullets).
   */
  shotKind?: ShotState['kind'];
}
