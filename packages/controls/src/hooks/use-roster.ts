// Packages
import { useRef, useState } from 'react';

// Local Imports
import { rosterKey } from '../helpers/roster';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';

/**
 * What `useRoster` gives the page.
 */
export interface RosterState {
  /**
   * Everyone in the game, as last changed.
   */
  roster: PlayerState[];

  /**
   * Offers a snapshot's players: the roster only changes (and re-renders)
   * when its `rosterKey` does.
   */
  offer: (players: PlayerState[]) => void;
}

/**
 * The roster the sidebar shows, updated only when someone joins, leaves,
 * drops, or their ping moves.
 *
 * @returns {RosterState} The roster, and a way to offer a snapshot's players.
 */
export function useRoster(): RosterState {
  const [roster, setRoster] = useState<PlayerState[]>([]);
  const lastRosterKey = useRef('');

  /**
   * Updates the roster only when its key changes, so equal rosters don't re-render.
   * @param players The players.
   */
  const offer = (players: PlayerState[]): void => {
    const key = rosterKey(players);
    if (key !== lastRosterKey.current) {
      lastRosterKey.current = key;
      setRoster(players);
    }
  };

  return { roster, offer };
}
