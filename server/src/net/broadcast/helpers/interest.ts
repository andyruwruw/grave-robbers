// Packages
import { INTEREST_RADIUS } from '@halloween/shared/protocol/network';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { StateMessage } from '../types/state';

/**
 * A tick's state cut down to what's within INTEREST_RADIUS of any of the
 * watched players, for a display on a huge world.
 * @param state The full state.
 * @param centers The watched players.
 * @param width The map's width, to place lights.
 * @returns The state with only nearby monsters, shots, puddles, items and lights.
 */
export function nearInterest(state: StateMessage, centers: PlayerState[], width: number): StateMessage {
  const near = (x: number, y: number): boolean => centers.some((c): boolean => Math.abs(c.x - x) < INTEREST_RADIUS && Math.abs(c.y - y) < INTEREST_RADIUS);
  return {
    ...state,
    monsters: state.monsters.filter((m): boolean => near(m.x, m.y)),
    shots: state.shots.filter((s): boolean => near(s.x, s.y)),
    puddles: state.puddles.filter((p): boolean => near(p.x, p.y)),
    items: state.items.filter((i): boolean => near(i.x, i.y)),
    lights: state.lights.filter((l): boolean => near(l.i % width, Math.floor(l.i / width))),
  };
}
