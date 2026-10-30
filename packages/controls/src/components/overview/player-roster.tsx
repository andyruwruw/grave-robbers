// Packages
import React, { useState } from 'react';
import { MAX_PLAYERS } from '@halloween/shared/players/roster';
import Badge from '@halloween/ui/components/ui/primitives/badge';
import Card from '@halloween/ui/components/ui/primitives/card';
import { Caption } from '@halloween/ui/components/typography/typography';

// Local Imports
import { SHORT_LIST } from '../../config/roster';
import { PING_WARN_MS } from '../../config/stats';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';

/**
 * Props for the PlayerRoster component.
 */
interface PlayerRosterProps {
  /**
   * Everyone currently in the game.
   */
  players: PlayerState[];

  /**
   * Whether the TV itself is connected to the server.
   */
  connected: boolean;

  /**
   * Each player's hidden level, by id.
   */
  levels: Record<string, number>;
}

/**
 * Who's in the graveyard, with their hidden level and dropped phones
 * marked. Shows the first few and folds the rest behind a "more" toggle.
 *
 * @param {PlayerRosterProps} props - Component props.
 * @returns {React.JSX.Element} The rendered roster.
 */
function PlayerRoster({
  players,
  connected,
  levels,
}: PlayerRosterProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? players : players.slice(0, SHORT_LIST);

  return (
    <Card className='flex flex-col'>
      <div className='flex items-center justify-between border-b border-border px-lg py-sm'>
        <span className='text-sm font-medium text-foreground'>
          Players
          <span className='ml-xsm text-foreground-subtle'>{players.length}/{MAX_PLAYERS}</span>
        </span>
        {!connected && (
          <Badge
            size='sm'
            variant='error'>
            Server offline
          </Badge>
        )}
      </div>
      {players.length === 0 ? (
        <div className='flex items-center justify-center px-lg py-md'>
          <Caption className='text-center'>No one has risen yet.</Caption>
        </div>
      ) : (
        <ul className='flex flex-col py-xsm'>
          {shown.map((p: PlayerState): React.JSX.Element => (
            <li
              key={p.id}
              className={`flex items-center gap-sm px-lg py-xsm ${p.connected ? '' : 'opacity-50'}`.trim()}>
              <span
                className='h-3 w-3 shrink-0 rounded-sm'
                style={{ backgroundColor: p.color }} />
              <span className='min-w-0 flex-1 truncate text-sm text-foreground'>{p.name}</span>
              {p.ping !== null && (
                <span
                  className={`text-xs ${p.ping > PING_WARN_MS ? 'text-danger' : 'text-foreground-subtle'}`}
                  title='Ping'>
                  {p.ping} ms
                </span>
              )}
              {levels[p.id] !== undefined && (
                <span
                  className='text-xs text-foreground-subtle'
                  title='Hidden level'>
                  Lv {levels[p.id].toFixed(1)}
                </span>
              )}
              {!p.connected && (
                <Badge
                  size='sm'
                  variant='pending'>
                  Away
                </Badge>
              )}
            </li>
          ))}
          {players.length > SHORT_LIST && (
            <li>
              <button
                type='button'
                className='px-lg py-xsm text-xs text-foreground-subtle hover:text-foreground'
                onClick={(): void => setExpanded(!expanded)}>
                {expanded ? 'Show less' : `${players.length - SHORT_LIST} more`}
              </button>
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}

export default PlayerRoster;
