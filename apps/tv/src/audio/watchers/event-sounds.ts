// Local Imports
import { SoundWatcher } from './sound-watcher';

// Types
import type { StateMessage } from '../../types/sound';

/**
 * Seconds between a Hellmouth's roars (it sprays in quick pulses).
 */
const ROAR_GAP = 0.3;

/**
 * Sounds for the snapshot's one-off events: chips, digging, candy and
 * pickups, unlocks, kills (which duck the music), monster deaths, splashes,
 * bloaters bursting, the dead rising, blinks, blood fountains catching monsters, snuffed lights, smashes, turrets firing, and growing crops,
 * and the infused weapons' chain lightning, blasts, wails, slams,
 * fissures, fire sprays, novas, reflects, and infusing at the anvil.
 */
export class EventSounds extends SoundWatcher {
  /**
   * When a Hellmouth last roared, in seconds.
   */
  private _roaredAt = -Infinity;

  /**
   * Plays each event.
   *
   * @param msg - The snapshot.
   * @param now - The snapshot's arrival time in seconds.
   */
  onState(msg: StateMessage, now: number): void {
    for (const e of msg.events) {
      if (e.t === 'chain') {
        this._stage.play('chain-zap', e.points[0].x, 0.7, 0.9 + Math.random() * 0.2);
      } else if (e.t === 'death-blast') {
        this._stage.play('blast', e.x, 0.8, 0.9 + Math.random() * 0.2);
      } else if (e.t === 'wail') {
        this._stage.play('wail', e.x, 0.8);
      } else if (e.t === 'slam') {
        this._stage.play('slam', e.x, 0.7, 0.9 + Math.random() * 0.2);
      } else if (e.t === 'fissure') {
        this._stage.play('fissure', e.x, 0.9);
      } else if (e.t === 'flame-spray' && now - this._roaredAt >= ROAR_GAP) {
        this._roaredAt = now;
        this._stage.play('flame-roar', e.x, 0.6, 0.9 + Math.random() * 0.2);
      } else if (e.t === 'nova') {
        this._stage.play('nova', e.x, 0.9);
      } else if (e.t === 'reflect') {
        this._stage.play('reflect', e.x, 0.8, 0.9 + Math.random() * 0.2);
      } else if (e.t === 'infused') {
        this._stage.play('infuse', e.x, 0.9);
      } else if (e.t === 'chips') {
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
      } else if (e.t === 'burst') {
        this._stage.play('bloater-burst', e.x, 1);
      } else if (e.t === 'raise') {
        this._stage.play('raise', e.x, 0.8, 0.9 + Math.random() * 0.2);
      } else if (e.t === 'blink') {
        this._stage.play('shadow-step', e.fromX, 0.7, 0.9 + Math.random() * 0.2);
        this._stage.play('shadow-step', e.x, 0.9, 0.8 + Math.random() * 0.2);
      } else if (e.t === 'catch') {
        this._stage.play('fountain-catch', e.tx + 0.5, 0.9, 0.9 + Math.random() * 0.2);
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
