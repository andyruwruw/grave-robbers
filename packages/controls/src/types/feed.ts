// Types
import type { GameEvent } from '@halloween/shared/protocol/game-events';

/**
 * Events the feed shows.
 */
export type FeedEvent = Extract<GameEvent, { t: 'kill' | 'blueprint' | 'research' | 'infused' }>;

/**
 * One line in the feed: a kill (the killer's color is null for a trap or
 * monster), a blueprint someone dug up, a skill tree upgrade, or a piece
 * of gear someone infused at an anvil.
 */
export type KillEntry = { id: number } & FeedEvent;
