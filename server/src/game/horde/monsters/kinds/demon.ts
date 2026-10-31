// Packages
import { DEMON_BLINK_BEHIND, DEMON_BLINK_EVERY, DEMON_BLINK_MIN, DEMON_LUNGE, DEMON_LUNGE_TIME } from '@halloween/shared/monsters/kinds/demon';

// Local Imports
import { distance } from '../../helpers/geometry';
import { monsterBlocked, monsterWalkable } from '../../helpers/terrain';
import { ShadowWalker } from '../shadow-walker';

// Types
import type { World } from '../../../world/world';
import type { Target } from '../../types/hooks';

/**
 * A demon: keeps to the dark, lunges from a distance, and now and then
 * steps through the shadows behind its target's back.
 */
export class Demon<P extends Target> extends ShadowWalker<P> {
  /**
   * When it may next step through the shadows.
   */
  blinkAt = 0;

  /**
   * Lunges at a player in range, or steps out of the shadows behind them.
   * @param p The player.
   * @param world The world.
   * @returns True when it took this tick.
   */
  protected ambush(p: P, world: World): boolean {
    if (distance(this, p) <= this.def.range! && world.time >= this.nextAttackAt) {
      this.attack(p, world);
      return true;
    }
    return world.time >= this.blinkAt && distance(this, p) > DEMON_BLINK_MIN && this.shadowStep(p, world);
  }

  /**
   * Vanishes and steps out of a dark tile behind its target's back.
   * @param p The player.
   * @param world The world.
   * @returns False if there's no dark spot there to step into.
   */
  private shadowStep(p: P, world: World): boolean {
    this.blinkAt = world.time + DEMON_BLINK_EVERY * (0.67 + Math.random() * 0.67);
    const walkable = monsterWalkable(world);
    for (let tries = 0; tries < 10; tries++) {
      const angle = p.facing + Math.PI + (Math.random() - 0.5) * 1.6;
      const x = p.x + Math.cos(angle) * DEMON_BLINK_BEHIND * (0.85 + Math.random() * 0.3);
      const y = p.y + Math.sin(angle) * DEMON_BLINK_BEHIND * (0.85 + Math.random() * 0.3);
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (tx > 0 && ty > 0 && tx < world.map.width - 1 && ty < world.map.height - 1 && walkable(tx, ty) && !this._ctx.light.isLit(tx, ty, this.id) && !monsterBlocked(world, { x, y })(tx, ty)) {
        this._ctx.hooks.event({ t: 'blink', fromX: this.x, fromY: this.y, x, y });
        this.x = x;
        this.y = y;
        this.facing = Math.atan2(p.y - y, p.x - x);
        this.path = [];
        this.repathAt = 0;
        this.blinks++;
        this.nextAttackAt = Math.max(this.nextAttackAt, world.time + 0.35);
        return true;
      }
    }
    return false;
  }

  /**
   * Its strike: a lunge along its aim, as far as its target was.
   * @param target Who it was aimed at.
   * @param prey Players monsters may go after.
   * @param world The world.
   */
  protected release(target: P | null, prey: P[], world: World): void {
    const reach = target ? Math.min(DEMON_LUNGE, Math.max(0.6, distance(this, target) + 0.3)) : 1;
    this.startLeap(world, DEMON_LUNGE_TIME, reach / DEMON_LUNGE_TIME);
  }
}
