// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';

// Local Imports
import { EntityWatcher } from './entity-watcher';

// Types
import type { StateMessage } from '../../types/sound';

/**
 * Sounds for players: swings and shots (with the morning star's crack as it
 * lands), getting hurt, and respawning.
 */
export class PlayerSounds extends EntityWatcher<string> {
  /**
   * Plays what each player did since the last snapshot.
   *
   * @param msg - The snapshot.
   */
  onState(msg: StateMessage): void {
    const live = new Set<string>();
    for (const p of msg.players) {
      live.add(p.id);
      const seen = this._seen.get(p.id);
      if (seen) {
        if (p.swings > seen.swings) {
          const gun = !p.drawn && (p.gear.weapon === 'musket' || p.gear.weapon === 'blood-gun');
          this._stage.play(gun ? 'gunshot' : !p.drawn && p.gear.weapon && GEAR[p.gear.weapon].weapon?.ranged ? 'shoot' : 'swing', p.x, gun ? 1 : 0.5, (gun && p.gear.weapon === 'musket' ? 0.8 : 1) * (0.92 + Math.random() * 0.16));
          if (!p.drawn && p.gear.weapon === 'morning-star') {
            const x = p.x;
            setTimeout((): void => this._stage.play('whip-crack', x, 1.2, 0.95 + Math.random() * 0.1), GEAR['morning-star'].weapon!.windup! * 1000);
          }
        }
        if (p.hurts > seen.hurts) {
          this._stage.lastHitAt = performance.now() / 1000;
          this._stage.play('hurt', p.x, 0.9, 0.92 + Math.random() * 0.16);
        }
        if (seen.dead && !p.dead) {
          this._stage.play('respawn', p.x, 0.6);
        }
      }
      this._seen.set(p.id, { swings: p.swings, hurts: p.hurts, attacks: 0, swipes: 0, dead: p.dead, hunting: false, nextVoiceAt: 0, nextGrowlAt: 0 });
    }
    this.prune(live);
  }
}
