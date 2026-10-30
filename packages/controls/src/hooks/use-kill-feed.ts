// Packages
import { useEffect, useRef, useState } from 'react';

// Local Imports
import { KILL_FEED_MS } from '../config/feed';

// Types
import type { GameEvent } from '@halloween/shared/protocol/game-events';
import type { FeedEvent, KillEntry } from '../types/feed';

/**
 * What `useKillFeed` gives the page.
 */
export interface KillFeedState {
  /**
   * The lines showing now, newest last.
   */
  kills: KillEntry[];

  /**
   * Adds the kills, blueprint finds, and upgrades among a snapshot's events.
   */
  addFeedEvents: (events: GameEvent[]) => void;
}

/**
 * The kill feed's lines: each kill, blueprint find, or upgrade stays for
 * `KILL_FEED_MS`. Pending removals are cancelled on unmount.
 *
 * @returns {KillFeedState} The lines, and a way to add a snapshot's events.
 */
export function useKillFeed(): KillFeedState {
  const [kills, setKills] = useState<KillEntry[]>([]);
  const nextKillId = useRef(0);
  const killTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => killTimers.current.forEach(clearTimeout), []);

  /**
   * Shows a feed entry and removes it after its time is up.
   * @param e The event.
   */
  const addKill = (e: FeedEvent): void => {
    const entry: KillEntry = { id: nextKillId.current++, ...e };
    setKills((prev: KillEntry[]): KillEntry[] => [...prev, entry]);
    killTimers.current.push(setTimeout((): void => {
      setKills((prev: KillEntry[]): KillEntry[] => prev.filter((k: KillEntry): boolean => k.id !== entry.id));
    }, KILL_FEED_MS));
  };

  /**
   * Adds the feed-worthy events (kills, blueprints, research) to the feed.
   * @param events The tick's events.
   */
  const addFeedEvents = (events: GameEvent[]): void => {
    for (const e of events) {
      if (e.t === 'kill' || e.t === 'blueprint' || e.t === 'research') {
        addKill(e);
      }
    }
  };

  return { kills, addFeedEvents };
}
