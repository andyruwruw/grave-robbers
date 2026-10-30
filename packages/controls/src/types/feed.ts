// Types
import type { GameEvent } from '@halloween/shared/protocol/game-events';

/**
 * Events the feed shows.
 */
export type FeedEvent = Extract<GameEvent, { t: 'kill' | 'blueprint' | 'research' }>;

/**
 * One line in the feed: a kill (the killer's color is null for a trap or
 * monster), a blueprint someone dug up, or a skill tree upgrade.
 */
export type KillEntry = { id: number } & FeedEvent;
