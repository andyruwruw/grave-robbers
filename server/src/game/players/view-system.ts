// Packages
import { GEAR_SLOTS } from '@halloween/shared/gear/gear-catalog';
import { UNLIMITED } from '@halloween/shared/goods/goods';
import { MAX_HP, RESPAWN_DELAY } from '@halloween/shared/players/health';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { PlayerIdentity, PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { Vitals } from '@halloween/shared/protocol/state/vitals';
import type { Carried } from '../types/players';
import type { Player } from './player';

/**
 * How players look from outside: their public state for the TV, and what
 * each phone shows of its own player.
 */
export class ViewSystem extends GameSystem {
  /**
   * A player's vitals, by token.
   * @param token The player's token.
   * @returns Their vitals, or null for an unknown token.
   */
  vitalsOf(token: string): Vitals | null {
    const player = this.players.get(token);
    return player ? this.vitals(player) : null;
  }

  /**
   * What a player carries, by token.
   * @param token The player's token.
   * @returns What they carry, or null for an unknown token.
   */
  inventoryOf(token: string): Carried | null {
    const player = this.players.get(token);
    return player ? this.carried(player) : null;
  }

  /**
   * Public state of every player, for broadcasting.
   * @returns Every player as broadcast.
   */
  snapshot(): PlayerState[] {
    return [...this.players.values()].map((p: Player): PlayerState => this.publicState(p));
  }

  /**
   * What a player's phone shows of their belongings (candy and blood read
   * UNLIMITED while Free crafting is on).
   * @param p The player.
   * @returns What their phone shows.
   */
  carried(p: Player): Carried {
    const inventory = this._game.bag.unlimited ? { candy: UNLIMITED, blood: UNLIMITED } : { ...p.inventory };
    return { inventory, gear: structuredClone(p.bag), tree: structuredClone(this._game.gameTab.treeOf(p)), research: p.research, anvil: p.anvil };
  }

  /**
   * A player's health, wounds, healing to come, protection, overheal, and
   * death, for their phone.
   * @param p The player.
   * @returns Their vitals.
   */
  vitals(p: Player): Vitals {
    return {
      hp: Math.ceil(p.hp * 2) / 2,
      wounded: Math.ceil(p.wounded() * 2) / 2,
      healing: Math.ceil(Math.min(p.feast, MAX_HP - p.hp) * 2) / 2,
      protected: p.protected,
      ...(p.overheal > 0 ? { overheal: Math.ceil(p.overheal * 2) / 2 } : {}),
      death: p.dead
        ? { killer: p.killedBy, survived: Math.round(p.respawnAt - RESPAWN_DELAY - p.aliveSince), respawnIn: Math.max(0, p.respawnAt - this.world.time) }
        : null,
    };
  }

  /**
   * The infusion of each equipped item that has one, for broadcasting.
   * @param p The player.
   * @returns Each infused slot's infusion.
   */
  private gearInfusion(p: Player): Partial<Record<GearSlot, Infusion>> {
    const out: Partial<Record<GearSlot, Infusion>> = {};
    for (const slot of GEAR_SLOTS) {
      const infusion = p.bag.equipped[slot]?.infusion;
      if (infusion) {
        out[slot] = infusion;
      }
    }
    return out;
  }

  /**
   * A player's public state, for broadcasting.
   * @param p The player.
   * @returns Their state as broadcast.
   */
  private publicState(p: Player): PlayerState {
    const weapon = p.weapon();
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      x: Math.round(p.x * 1000) / 1000,
      y: Math.round(p.y * 1000) / 1000,
      facing: Math.round(p.facing * 1000) / 1000,
      moving: p.moving,
      lifted: p.lifted,
      slowed: this.world.time < p.slowUntil,
      connected: p.connected,
      swings: p.swings,
      building: p.building,
      buildAim: p.buildAim && { x: Math.round(p.buildAim.x * 100) / 100, y: Math.round(p.buildAim.y * 100) / 100 },
      buildFacing: p.buildFacing,
      buildStyle: p.building ? p.buildStyles[p.building] ?? 0 : 0,
      hp: Math.round(p.hp * 10) / 10,
      wounded: Math.round(p.wounded() * 10) / 10,
      hurts: p.hurts,
      dead: p.dead,
      protected: p.protected,
      blocking: p.blocking,
      drawn: this.world.time < p.drawnUntil ? p.drawn : null,
      digging: this.world.time < p.digUntil,
      ping: p.ping === null ? null : Math.round(p.ping),
      aiming: p.aimUntil !== null,
      aimTarget: p.aimTarget,
      combo: p.combo,
      charge: weapon.charge ? Math.round((p.charge / weapon.charge) * 10) / 10 : 0,
      reloading: p.reloadUntil !== null,
      gear: {
        weapon: p.bag.equipped.weapon?.kind ?? null,
        offhand: p.bag.equipped.offhand?.kind ?? null,
        armor: p.bag.equipped.armor?.kind ?? null,
      },
      gearInfusion: this.gearInfusion(p),
      ...(p.thrown ? { thrown: true } : {}),
      ...(p.overheal > 0 ? { overheal: Math.round(p.overheal * 10) / 10 } : {}),
      ...(weapon.slayEvery && this.world.time < p.slayReadyAt ? { dimmed: true } : {}),
      ...(p.quickSwing ? { quickSwing: true } : {}),
    };
  }

  /**
   * What a phone keeps to be this player.
   * @param p The player.
   * @returns Their token and public state.
   */
  identityOf(p: Player): PlayerIdentity {
    return { token: p.token, player: this.publicState(p) };
  }
}
