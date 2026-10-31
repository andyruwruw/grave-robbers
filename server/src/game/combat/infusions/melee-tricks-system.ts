// Packages
import { damageTo } from '@halloween/shared/gear/damage-to';
import { SUPER_COMBO } from '@halloween/shared/gear/melee-rules';

// Local Imports
import { GameSystem } from '../../core/game-system';
import { INCENSE_AHEAD } from './config/infusion-effects';
import { alongLine, nearest, within } from './helpers/area-targets';

// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { Player } from '../../players/player';
import type { MonsterSpot } from './types/monster-spot';

/**
 * What an infused weapon's swing does besides its blow (see
 * `docs/infusions.md`): a charged wail, chain lightning, the ground slam
 * and fissure, the holy nova, incense, the Moonsilver one-shot, and the
 * combo finisher's heal. `MeleeSystem.strike` calls these; a swing made
 * with something other than the weapon (the hammer, a stake) does none of
 * them.
 */
export class MeleeTricksSystem extends GameSystem {
  /**
   * A charged Wailing Sickle's sweep: a shockwave all the way around,
   * harder and throwing farther. Uses up the charge.
   * @param p The player.
   * @param weapon The swing's stats.
   * @returns The sweep's stats (unchanged unless it wails).
   */
  wail(p: Player, weapon: WeaponStats): WeaponStats {
    const wail = weapon.wail;
    if (!wail || !p.wailCharged || p.swingWith) {
      return weapon;
    }
    p.wailCharged = false;
    this.outbox.events.push({ t: 'wail', x: this.round(p.x), y: this.round(p.y), radius: wail.radius });
    return { ...weapon, damage: weapon.damage * wail.mult, reach: wail.radius, arcCos: -1, line: undefined, knockback: wail.knockback };
  }

  /**
   * Whether this blow one-shots the monster (Moonsilver Saber): a listed
   * kind while the blade is charged. Starts the recharge (the blade dims
   * until `slayReadyAt`).
   * @param p The player.
   * @param weapon The swing's stats.
   * @param m The monster.
   * @returns True when it dies outright.
   */
  slays(p: Player, weapon: WeaponStats, m: MonsterSpot): boolean {
    const slay = weapon.slayEvery;
    if (!slay || p.swingWith || this.world.time < p.slayReadyAt || !slay.kinds.includes(m.kind)) {
      return false;
    }
    p.slayReadyAt = this.world.time + slay.seconds;
    return true;
  }

  /**
   * Chain lightning (Dawn's Scourge, The Seraphic Chain): from each
   * monster the blow struck, a bolt jumps on to the nearest monster not
   * hit yet within `radius`, then from that one, `targets` times.
   * @param p The player.
   * @param weapon The swing's stats.
   * @param struck The monsters the blow struck.
   * @param hit Every monster hit so far this swing (grows with each jump).
   */
  chain(p: Player, weapon: WeaponStats, struck: MonsterSpot[], hit: Set<number>): void {
    const chain = weapon.chain;
    if (!chain || p.swingWith) {
      return;
    }
    for (const from of struck) {
      const points = [{ x: this.round(from.x), y: this.round(from.y) }];
      let at: MonsterSpot = from;
      for (let i = 0; i < chain.targets; i++) {
        const next = nearest(this.horde.targets(), at.x, at.y, chain.radius, hit);
        if (!next) {
          break;
        }
        hit.add(next.id);
        this.horde.hit(next.id, damageTo(next.kind, weapon, chain.damage), at.x, at.y, this.world, 0, { stun: chain.stun, by: p });
        points.push({ x: this.round(next.x), y: this.round(next.y) });
        at = next;
      }
      if (points.length > 1) {
        this.outbox.events.push({ t: 'chain', points });
      }
    }
  }

  /**
   * The ground slam (Titan's Maul, Earthshaker): every strike shakes the
   * monsters around the wielder that the blow itself didn't hit, for a
   * share of the blow, shoving them away.
   * @param p The player.
   * @param weapon The swing's stats.
   * @param hit The monsters the blow hit.
   * @param blow The blow's damage at a spot.
   */
  slam(p: Player, weapon: WeaponStats, hit: Set<number>, blow: (x: number, y: number) => number): void {
    const slam = weapon.slam;
    if (!slam || p.swingWith) {
      return;
    }
    this.outbox.events.push({ t: 'slam', x: this.round(p.x), y: this.round(p.y), radius: slam.radius });
    for (const m of within(this.horde.targets(), p.x, p.y, slam.radius)) {
      if (!hit.has(m.id)) {
        this.horde.hit(m.id, damageTo(m.kind, weapon, blow(m.x, m.y) * slam.mult), p.x, p.y, this.world, slam.knockback, { by: p });
      }
    }
  }

  /**
   * The fissure (Earthshaker): every `every`th strike that lands on a
   * monster cracks the ground straight ahead, hitting everything along
   * it for a share of the blow, launching and stunning it (a brute only
   * staggers).
   * @param p The player.
   * @param weapon The swing's stats.
   * @param blow The blow's damage at a spot.
   */
  fissure(p: Player, weapon: WeaponStats, blow: (x: number, y: number) => number): void {
    const fissure = weapon.fissure;
    if (!fissure || p.swingWith || ++p.fissureHits < fissure.every) {
      return;
    }
    p.fissureHits = 0;
    this.outbox.events.push({ t: 'fissure', x: this.round(p.x), y: this.round(p.y), angle: Math.round(p.facing * 1000) / 1000, length: fissure.length });
    for (const m of alongLine(this.horde.targets(), p.x, p.y, p.facing, fissure.length, fissure.width)) {
      this.horde.hit(m.id, damageTo(m.kind, weapon, blow(m.x, m.y) * fissure.mult), p.x, p.y, this.world, fissure.knockback, { by: p, stun: 1, stunFor: fissure.stun, bruteStagger: true });
    }
  }

  /**
   * The holy nova (Archangel's Fists): a super uppercut shoves the listed
   * kinds around the wielder away.
   * @param p The player.
   * @param weapon The swing's stats.
   */
  nova(p: Player, weapon: WeaponStats): void {
    const nova = weapon.nova;
    if (!nova || p.swingWith || p.combo !== SUPER_COMBO) {
      return;
    }
    this.outbox.events.push({ t: 'nova', x: this.round(p.x), y: this.round(p.y), radius: nova.radius });
    for (const m of within(this.horde.targets(), p.x, p.y, nova.radius)) {
      if (nova.kinds.includes(m.kind)) {
        this.horde.hit(m.id, 0, p.x, p.y, this.world, nova.knockback, { by: p });
      }
    }
  }

  /**
   * Incense (Censer Flail, Thurible of Judgment): every swing leaves a
   * cloud where it lands, among the monsters it struck, or ahead when it
   * struck none.
   * @param p The player.
   * @param weapon The swing's stats.
   * @param struck The monsters the blow struck.
   */
  incense(p: Player, weapon: WeaponStats, struck: MonsterSpot[]): void {
    if (!weapon.incense || p.swingWith) {
      return;
    }
    if (struck.length === 0) {
      const ahead = weapon.reach * INCENSE_AHEAD;
      this._game.patches.incense(p.x + Math.cos(p.facing) * ahead, p.y + Math.sin(p.facing) * ahead, p, weapon);
      return;
    }
    const x = struck.reduce((sum: number, m: MonsterSpot): number => sum + m.x, 0) / struck.length;
    const y = struck.reduce((sum: number, m: MonsterSpot): number => sum + m.y, 0) / struck.length;
    this._game.patches.incense(x, y, p, weapon);
  }

  /**
   * The combo finisher's heal (Bishop's Crozier): the last step landing on
   * a monster heals, once per swing.
   * @param p The player.
   * @param weapon The swing's stats.
   */
  finish(p: Player, weapon: WeaponStats): void {
    if (weapon.finishHeal && weapon.combo && !p.swingWith && p.combo === weapon.combo.length - 1) {
      this._game.life.mend(p, weapon.finishHeal, weapon.overheal);
    }
  }

  /**
   * A coordinate rounded for broadcasting.
   * @param v The value (tiles).
   * @returns It to hundredths.
   */
  private round(v: number): number {
    return Math.round(v * 100) / 100;
  }
}
