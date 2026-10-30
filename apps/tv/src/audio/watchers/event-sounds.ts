// Local Imports
import { SoundWatcher } from './sound-watcher';

// Types
import type { StateMessage } from '../../types/sound';

/**
 * Sounds for the snapshot's one-off events: chips, digging, candy and
 * pickups, unlocks, kills (which duck the music), monster deaths, splashes,
 * blinks, snuffed lights, smashes, turrets firing, and growing crops.
 */
export class EventSounds extends SoundWatcher {
  /**
   * Plays each event.
   *
   * @param msg - The snapshot.
   */
  onState(msg: StateMessage): void {
    for (const e of msg.events) {
      if (e.t === 'chips') {
        this._stage.play(e.chip === 'wood' ? 'chop' : 'mine', e.tx + 0.5, 0.6);
      } else if (e.t === 'dig') {
        this._stage.play('dig', e.tx + 0.5, 0.6);
        if (e.done) {
          this._stage.play('build', e.tx + 0.5, 0.5, 0.5);
        }
      } else if (e.t === 'candy') {
        this._stage.play('candy', e.x, 0.8);
      } else if (e.t === 'pickup') {
        this._stage.play('pickup', e.x, 0.6, 0.95 + Math.random() * 0.15);
      } else if (e.t === 'blueprint' || e.t === 'research') {
        this._stage.sfx.play('unlock', { volume: 0.8 });
      } else if (e.t === 'kill') {
        this._stage.sfx.play('death', { volume: 0.9 });
        this._stage.music.duck(0.35, 1.5);
      } else if (e.t === 'monster-death') {
        this._stage.play('monster-death', e.x, 0.8);
        this._stage.play('splat', e.x, 0.7, 0.85 + Math.random() * 0.3);
      } else if (e.t === 'splash') {
        this._stage.play('splat', e.x, 0.9, 0.8);
        this._stage.play('drink', e.x, 0.5, 1.6);
      } else if (e.t === 'blink') {
        this._stage.play('shadow-step', e.fromX, 0.7, 0.9 + Math.random() * 0.2);
        this._stage.play('shadow-step', e.x, 0.9, 0.8 + Math.random() * 0.2);
      } else if (e.t === 'snuff') {
        this._stage.play('snuff', e.tx + 0.5);
      } else if (e.t === 'smash' && e.tile === 'pumpkin') {
        this._stage.play(e.broke ? 'splat' : 'chop', e.tx + 0.5, 0.8, e.broke ? 1.3 : 1.1);
      } else if (e.t === 'smash') {
        this._stage.play('break', e.tx + 0.5);
        this._stage.play('pickup', e.tx + 0.5, 0.7);
      } else if (e.t === 'turret') {
        if (e.fires === 'shot') {
          this._stage.play('shoot', e.tx + 0.5, 0.6, 0.85);
        } else if (e.fires === 'sweep') {
          this._stage.play('swing', e.tx + 0.5, 0.7, 0.75);
        } else {
          this._stage.play('shadow-step', e.tx + 0.5, 0.5, 0.55 + Math.random() * 0.1);
        }
      } else if (e.t === 'grow' && e.tile !== 'pumpkin') {
        this._stage.play('build', e.tx + 0.5, 0.35, 0.6);
      }
    }
  }
}
