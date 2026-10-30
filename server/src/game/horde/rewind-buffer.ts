// Local Imports
import { REWIND_KEEP } from './config/rewind';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { Monster } from './monsters/monster';
import type { MonsterRoster } from './monster-roster';
import type { Target } from './types/hooks';

/**
 * Where every monster stood at the start of each recent tick, so a laggy
 * player's melee can be judged against what their screen showed.
 */
export class RewindBuffer {
  /**
   * The recent ticks, oldest first.
   */
  private readonly _past: { t: number; at: Map<number, { x: number; y: number }> }[] = [];

  /**
   * Notes where every monster is at the start of a tick, keeping
   * REWIND_KEEP seconds of them.
   * @param roster Every monster.
   * @param now The game clock.
   */
  remember<P extends Target>(roster: MonsterRoster<P>, now: number): void {
    this._past.push({ t: now, at: new Map([...roster.values()].map((m: Monster<P>): [number, { x: number; y: number }] => [m.id, { x: m.x, y: m.y }])) });
    while (this._past.length > 1 && this._past[0].t < now - REWIND_KEEP) {
      this._past.shift();
    }
  }

  /**
   * Every monster as it stood `back` seconds ago (at most REWIND_KEEP;
   * one too new for that keeps where it is now).
   * @param roster Every monster.
   * @param back How far back (seconds).
   * @param now The game clock.
   * @returns Each monster's id, kind and position then.
   */
  at<P extends Target>(roster: MonsterRoster<P>, back: number, now: number): { id: number; kind: MonsterKind; x: number; y: number }[] {
    const t = now - Math.min(back, REWIND_KEEP);
    const then = [...this._past].reverse().find((s): boolean => s.t <= t) ?? this._past[0];
    return [...roster.values()].map((m: Monster<P>): { id: number; kind: MonsterKind; x: number; y: number } => {
      const was = then?.at.get(m.id);
      return { id: m.id, kind: m.kind, x: was?.x ?? m.x, y: was?.y ?? m.y };
    });
  }
}
