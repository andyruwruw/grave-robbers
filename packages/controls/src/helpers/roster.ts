// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';

/**
 * Cheap signature of the roster, so React only re-renders the sidebar when
 * someone joins, leaves, drops, or their ping moves, not on every 30Hz
 * movement snapshot.
 *
 * @param {PlayerState[]} players - Everyone in the game.
 * @returns {string} The signature.
 */
export function rosterKey(players: PlayerState[]): string {
  return players.map((p: PlayerState): string => `${p.id}:${p.connected ? 1 : 0}:${Math.round((p.ping ?? -10) / 10)}`).join(',');
}
