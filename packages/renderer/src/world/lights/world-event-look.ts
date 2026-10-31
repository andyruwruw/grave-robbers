// Packages
import { resolveEffects } from '@halloween/shared/world-events/helpers/resolve-effects';
import { WORLD_EVENTS, WORLD_EVENT_KINDS } from '@halloween/shared/world-events/world-event-catalog';

// Local Imports
import { ScenePart } from '../scene-part';

// Types
import type { EventWeight, WorldEventKind } from '@halloween/shared/world-events/types/world-events';

/**
 * How world events look: each one up eases in over its `fade` (and out
 * again once it ends), and their effects, weighed by how far each has
 * come in, become the context's `look` for the sky, fog, grade, and
 * monsters to read.
 */
export class WorldEventLook extends ScenePart {
  /**
   * The events that are up, from the latest snapshot.
   */
  active: WorldEventKind[] = [];

  /**
   * How far each event has come in, 0..1.
   */
  private readonly _weights = new Map<WorldEventKind, number>(WORLD_EVENT_KINDS.map((kind: WorldEventKind): [WorldEventKind, number] => [kind, 0]));

  /**
   * Eases every event toward up or down and resolves the look.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    const weights: EventWeight[] = [];
    for (const [kind, was] of this._weights) {
      const step = dt / WORLD_EVENTS[kind].fade;
      const weight = Math.min(1, Math.max(0, was + (this.active.includes(kind) ? step : -step)));
      this._weights.set(kind, weight);
      weights.push({ kind, weight });
    }
    this._ctx.look = resolveEffects(weights);
  }
}
