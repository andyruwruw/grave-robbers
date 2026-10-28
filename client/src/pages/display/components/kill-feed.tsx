// Packages
import React from 'react';
import { ArrowBigUp, ScrollText, Skull } from 'lucide-react';

// Types
import type { GameEvent } from '@halloween/shared/protocol';

/**
 * Events the feed shows.
 */
export type FeedEvent = Extract<GameEvent, { t: 'kill' | 'blueprint' | 'research' }>;

/**
 * One line in the feed: a kill (the killer's color is null for a trap or
 * monster), a blueprint someone dug up, or a skill tree upgrade.
 */
export type KillEntry = { id: number } & FeedEvent;

/**
 * Props for the KillFeed component.
 */
interface KillFeedProps {
  /**
   * Recent kills and finds, newest last. The page removes entries after a few seconds.
   */
  kills: KillEntry[];
}

/**
 * Recent deaths, blueprint finds, and upgrades, over the map, so the whole
 * room sees who got who and what's newly unlocked.
 *
 * @param {KillFeedProps} props - Component props.
 * @returns {React.JSX.Element} The rendered feed.
 */
function KillFeed({ kills }: KillFeedProps): React.JSX.Element {
  return (
    <div className='pointer-events-none absolute left-md top-md flex flex-col items-start gap-xsm'>
      {kills.map((k: KillEntry) => (k.t === 'research' ? (
        <div
          key={k.id}
          className='flex items-center gap-sm rounded-md border border-border bg-surface px-sm py-1 font-pixel text-[10px]'>
          <span style={{ color: k.finderColor }}>{k.finder}</span>
          <ArrowBigUp
            size={12}
            className='text-brand' />
          <span className='text-foreground'>
            {k.label} Lv {k.level}
            {k.opens.length > 0 && <span className='text-brand'>{`, ${k.opens.join(', ')} unlocked`}</span>}
          </span>
        </div>
      ) : k.t === 'blueprint' ? (
        <div
          key={k.id}
          className='flex items-center gap-sm rounded-md border border-border bg-surface px-sm py-1 font-pixel text-[10px]'>
          <span style={{ color: k.finderColor }}>{k.finder}</span>
          <ScrollText
            size={12}
            className='text-brand' />
          <span className='text-foreground'>{k.label} unlocked</span>
        </div>
      ) : (
        <div
          key={k.id}
          className='flex items-center gap-sm rounded-md border border-border bg-surface px-sm py-1 font-pixel text-[10px]'>
          <span
            className={k.killerColor ? '' : 'text-foreground-muted'}
            style={k.killerColor ? { color: k.killerColor } : undefined}>
            {k.killer}
          </span>
          <Skull
            size={12}
            className='text-foreground-subtle' />
          <span style={{ color: k.victimColor }}>{k.victim}</span>
        </div>
      )))}
    </div>
  );
}

export default KillFeed;
