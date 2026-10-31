// Packages
import { damageTo } from '@halloween/shared/gear/damage-to';
import { STATUS_BLEEDING, STATUS_BURNING, hasStatus } from '@halloween/shared/monsters/monster-status';

// Local Imports
import { GameSystem } from '../../core/game-system';
import { DEATH_BLAST_KNOCKBACK } from './config/infusion-effects';
import { within } from './helpers/area-targets';

// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { MonsterDeath } from '../../horde/types/death';
import type { Player } from '../../players/player';
import type { Striking } from './types/striking';

/**
 * What infused weapons do when their wielder gets a kill, however the
 * monster died (a hit, a bleed, a burn, a blast): the ritual knife's
 * feast (doubled for a bleeding kill), kill heals and overheal, charging
 * a wail, and death blasts (see `docs/infusions.md`). The horde's `died`
 * hook calls `onDeath`; a melee strike brackets its hits with `begin` and
 * `end` so kills during it go by the swing's own stats.
 */
export class InfusionSystem extends GameSystem {
  /**
   * The melee strike landing right now, if any.
   */
  private _striking: Striking | null = null;

  /**
   * A melee strike starts landing.
   * @param p Who swings.
   * @param weapon The swing's stats.
   */
  begin(p: Player, weapon: WeaponStats): void {
    this._striking = { by: p, weapon, kills: 0, before: new Map() };
  }

  /**
   * Notes what's afflicting a monster just before the strike's blow lands
   * on it, so that blow's kill can tell whether it was already bleeding or
   * burning (the blow itself may have just set it so). `after` forgets it.
   * @param id The monster's id.
   */
  before(id: number): void {
    const s = this._striking;
    if (s && (s.weapon.bleedKillHealMult || s.weapon.deathBlast?.burningOnly)) {
      s.before.set(id, this.horde.afflictions.status(id));
    }
  }

  /**
   * The strike's own blow on a monster has landed: forgets what was
   * afflicting it before, so a later death in the same strike (a blast,
   * the chain, the slam) goes by what's afflicting it then.
   * @param id The monster's id.
   */
  after(id: number): void {
    this._striking?.before.delete(id);
  }

  /**
   * The melee strike is done.
   * @returns How many monsters it killed.
   */
  end(): number {
    const kills = this._striking?.kills ?? 0;
    this._striking = null;
    return kills;
  }

  /**
   * A monster died (the horde's `died` hook): its killer's weapon does
   * what it does on a kill. Nothing for a risen ally, or with no living
   * killer.
   * @param d The death.
   */
  onDeath(d: MonsterDeath<Player>): void {
    const p = d.killer;
    if (!p || p.dead || d.ally) {
      return;
    }
    const striking = this._striking?.by === p ? this._striking : null;
    if (striking) {
      striking.kills++;
    }
    const weapon = striking ? striking.weapon : p.weapon();
    const status = striking?.before.get(d.id) ?? d.status;
    this.feast(p, weapon, d, status, striking !== null);
    if (weapon.killHeal) {
      this._game.life.mend(p, weapon.killHeal, weapon.overheal);
    }
    if (weapon.wail && !p.wailCharged && ++p.wailKills >= weapon.wail.kills) {
      p.wailCharged = true;
      p.wailKills = 0;
    }
    this.blast(p, weapon, d, status);
  }

  /**
   * A feeding weapon's kill (the ritual knife): a blow's kill feeds, and
   * with `bleedKillHealMult` so does a bleed it opened, by that much more
   * for a monster that was bleeding.
   * @param p The killer.
   * @param weapon Their weapon's stats.
   * @param d The death.
   * @param status What was afflicting it before the killing blow.
   * @param struck Whether it died during the killer's strike.
   */
  private feast(p: Player, weapon: WeaponStats, d: MonsterDeath<Player>, status: number, struck: boolean): void {
    if (!weapon.feast) {
      return;
    }
    const mult = weapon.bleedKillHealMult;
    const bled = mult !== undefined && d.cause === 'bleed' && d.bleedBy === p;
    if ((struck && d.cause === 'hit') || bled) {
      p.feast += weapon.feast * (mult && hasStatus(status, STATUS_BLEEDING) ? mult : 1);
    }
  }

  /**
   * A death blast (Requiem Lash and Pyre, Infernal Mandate): the dead
   * monster bursts, hurting the others around it (and setting them
   * burning, with `ignite`). At most `perSecond` a second for each
   * player; Infernal Mandate's only go off for a monster that was
   * burning. Blast kills can set off more blasts.
   * @param p The killer.
   * @param weapon Their weapon's stats.
   * @param d The death.
   * @param status What was afflicting it before the killing blow.
   */
  private blast(p: Player, weapon: WeaponStats, d: MonsterDeath<Player>, status: number): void {
    const blast = weapon.deathBlast;
    if (!blast || (blast.burningOnly && !hasStatus(status, STATUS_BURNING))) {
      return;
    }
    const now = this.world.time;
    p.blastTimes = p.blastTimes.filter((t: number): boolean => now - t < 1);
    if (p.blastTimes.length >= blast.perSecond) {
      return;
    }
    p.blastTimes.push(now);
    this.outbox.events.push({ t: 'death-blast', x: Math.round(d.x * 100) / 100, y: Math.round(d.y * 100) / 100, radius: blast.radius, ignite: !!blast.ignite });
    const burn = blast.ignite ? weapon.burn : undefined;
    for (const m of within(this.horde.targets(), d.x, d.y, blast.radius)) {
      this.horde.hit(m.id, damageTo(m.kind, weapon, blast.damage), d.x, d.y, this.world, DEATH_BLAST_KNOCKBACK, { by: p, burn });
    }
  }
}
