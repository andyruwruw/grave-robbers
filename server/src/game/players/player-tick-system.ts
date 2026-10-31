// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { variantOf } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { SPIKE_DAMAGE_PER_SECOND } from '@halloween/shared/players/health';
import { levelOf } from '@halloween/shared/skill-tree/progress';
import { RESEARCH_RADIUS, researchDiscount } from '@halloween/shared/skill-tree/upgrade-cost';
import { lightRadius, spikeDamage } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';
import { ANVIL_RADIUS } from '@halloween/shared/structures/stations';
import { STRUCTURES } from '@halloween/shared/structures/structure-catalog';
import { TRAP_DAMAGE } from '@halloween/shared/structures/traps';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { Player } from './player';

/**
 * One player's part of each step, in order.
 */
export class PlayerTickSystem extends GameSystem {
  /**
   * One player's tick: respawning, walking, acting, what's in reach,
   * pickups, traps, and healing.
   * @param p The player.
   * @param dt Seconds since the last step.
   */
  step(p: Player, dt: number): void {
    const time = this.world.time;
    if (p.dead) {
      if (time >= p.respawnAt) {
        this._game.life.respawn(p);
      }
      return;
    }
    if (p.lifted) {
      p.moving = false;
      return;
    }
    this._game.movement.walk(p, dt, time);
    this._game.actions.tick(p, time);
    this.refresh(p);
    this._game.pickups.pickUpGround(p);
    this.trapDamage(p, dt);
    this._game.life.rest(p, dt);
    p.protected = !p.dead && time < p.protectedUntil;
  }

  /**
   * Keeps what a player holds and has in reach current: their light,
   * their block, the build pick, items underfoot, the open stash and USE
   * panel, and the stations in reach.
   * @param p The player.
   */
  private refresh(p: Player): void {
    p.light = this.carriedLight(p);
    p.blocking = p.blockHeld && p.canBlock();
    this._game.building.syncBuilding(p);
    this._game.pickups.autoGrab(p);
    this._game.stash.checkReach(p);
    this._game.use.refresh(p);
    const research = researchDiscount(this.world.structureQueries.levelNear('research-table', p.x, p.y, RESEARCH_RADIUS));
    const anvil = this.world.structureQueries.levelNear('anvil', p.x, p.y, ANVIL_RADIUS);
    if (research !== p.research || anvil !== p.anvil) {
      p.research = research;
      p.anvil = anvil;
      this.outbox.inventoryChanged.add(p.token);
    }
  }

  /**
   * How far the light a player carries reaches: a torch in the off hand
   * (farther for a Brimstone Torch, `lightMult`) or a glowing weapon (the
   * Moonsilver Saber, `lightRadius`, out while it's dimmed recharging),
   * whichever reaches farther.
   * @param p The player.
   * @returns The radius in tiles, or 0.
   */
  private carriedLight(p: Player): number {
    const offhand = p.bag.equipped.offhand;
    const torch = offhand?.kind === 'torch'
      ? lightRadius(GEAR.torch.light!.radius, levelOf('build:torch', p.tree)) * (variantOf('torch', offhand.infusion)?.twist.lightMult ?? 1)
      : 0;
    const weapon = p.weapon();
    const dimmed = !!weapon.slayEvery && this.world.time < p.slayReadyAt;
    return Math.max(torch, dimmed ? 0 : weapon.lightRadius ?? 0);
  }

  /**
   * Hurts a player standing on spikes.
   * @param p The player.
   * @param dt Seconds since the last step.
   */
  private trapDamage(p: Player, dt: number): void {
    const trap = this.world.map.get(Math.floor(p.x), Math.floor(p.y));
    if (trap === 'spikes' || trap === 'iron-spikes') {
      this._game.damage.hurt(p, spikeDamage(SPIKE_DAMAGE_PER_SECOND * TRAP_DAMAGE[trap]!, this.world.structureQueries.level(Math.floor(p.x), Math.floor(p.y))) * dt, STRUCTURES[trap].label);
    }
  }
}
