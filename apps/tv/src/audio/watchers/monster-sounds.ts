// Packages
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';

// Local Imports
import { MONSTER_VOICES } from '../../config/monster-voices';
import {
  GROWL_EVERY,
  SPOT_GAP,
  VOICE_GAP,
  VOICE_MIN,
  VOICE_SPREAD,
} from '../../config/sound';
import { EntityWatcher } from './entity-watcher';

// Types
import type { StateMessage } from '../../types/sound';

/**
 * Sounds for monsters: getting hurt, attacks winding up and landing, a
 * witch's swipe or a werewolf's pounce, spotting someone, growls while hunting, and an idle noise
 * now and then (spaced out across the whole horde).
 */
export class MonsterSounds extends EntityWatcher<number> {
  /**
   * When (seconds) any monster last made an idle noise.
   */
  private _lastVoiceAt = 0;

  /**
   * When (seconds) any monster last cried out on spotting someone.
   */
  private _lastSpotAt = -Infinity;

  /**
   * Plays what each monster did since the last snapshot.
   *
   * @param msg - The snapshot.
   * @param now - The snapshot's arrival time in seconds.
   */
  onState(msg: StateMessage, now: number): void {
    const live = new Set<number>();
    for (const m of msg.monsters) {
      live.add(m.id);
      const seen = this._seen.get(m.id) ?? { swings: 0, hurts: m.hurts, attacks: m.attacks, swipes: m.swipes, dead: false, hunting: m.hunting, nextVoiceAt: now + Math.random() * VOICE_SPREAD, nextGrowlAt: now + Math.random() * GROWL_EVERY };
      if (m.hurts > seen.hurts) {
        this._stage.lastHitAt = now;
        this._stage.play('monster-hit', m.x, 0.8, 0.9 + Math.random() * 0.2);
        if (m.armor) {
          this._stage.play('mine', m.x, 0.5, 1.4 + Math.random() * 0.3);
        }
        const hurt = MONSTER_VOICES[m.kind].hurt;
        if (hurt) {
          this._stage.cue(hurt, m.x);
        }
      }
      const voice = MONSTER_VOICES[m.kind];
      if (m.attacks > seen.attacks) {
        this._stage.attackCues(voice.windup, voice.strike, MONSTERS[m.kind].windup, m.x);
      }
      if (m.swipes > seen.swipes && voice.swipe) {
        this._stage.attackCues(voice.swipe.windup, voice.swipe.strike, voice.swipe.time, m.x);
      }
      if (m.hunting && !seen.hunting && now - this._lastSpotAt >= SPOT_GAP) {
        this._lastSpotAt = now;
        seen.nextVoiceAt = now + VOICE_MIN;
        seen.nextGrowlAt = now + GROWL_EVERY;
        this._stage.cue(voice.spot, m.x);
      }
      seen.hunting = m.hunting;
      if (voice.growl && m.hunting && now >= seen.nextGrowlAt) {
        seen.nextGrowlAt = now + GROWL_EVERY * (0.5 + Math.random());
        this._stage.cue(voice.growl, m.x);
      }
      if (now >= seen.nextVoiceAt && now - this._lastVoiceAt >= VOICE_GAP) {
        seen.nextVoiceAt = now + VOICE_MIN + Math.random() * VOICE_SPREAD;
        this._lastVoiceAt = now;
        this._stage.cue(voice.idle, m.x, 0.3);
      }
      seen.hurts = m.hurts;
      seen.attacks = m.attacks;
      seen.swipes = m.swipes;
      this._seen.set(m.id, seen);
    }
    this.prune(live);
  }
}
