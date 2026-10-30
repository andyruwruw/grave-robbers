// Packages
import React from 'react';
import { Crosshair } from 'lucide-react';
import { PANEL_BUTTON } from '@halloween/controls/config/styles';
import { TV_VIEWS } from '@halloween/controls/config/tv-view';
import Card from '@halloween/ui/components/ui/primitives/card';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { TvView } from '@halloween/controls/types/tv-view';

/**
 * Props for the FollowPanel component.
 */
interface FollowPanelProps {
  /**
   * Everyone in the game.
   */
  players: PlayerState[];

  /**
   * The followed player's id, or null for the whole map (a huge world's
   * spawn).
   */
  follow: string | null;

  /**
   * Follows a player, or the whole map (null).
   */
  onFollow: (id: string | null) => void;

  /**
   * Whether the world is huge (no whole-map view, so null means the spawn).
   */
  huge: boolean;

  /**
   * How much ground shows while following.
   */
  view: TvView;

  /**
   * Picks how much ground shows.
   */
  onView: (view: TvView) => void;
}

/**
 * Picks what the admin console's world view looks at: the whole map (a
 * huge world's spawn) or one player, and while following, how much ground
 * shows (the TV view presets).
 *
 * @param {FollowPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function FollowPanel({
  players,
  follow,
  onFollow,
  huge,
  view,
  onView,
}: FollowPanelProps): React.JSX.Element {
  return (
    <Card className='flex flex-col'>
      <div className='flex flex-col gap-md px-lg py-md'>
        <span className='flex items-center gap-xsm text-sm font-medium text-foreground'>
          <Crosshair size={14} />
          Follow
        </span>
        <select
          value={follow ?? ''}
          className={`${PANEL_BUTTON} appearance-none text-left`}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => onFollow(e.target.value || null)}>
          <option value=''>{huge ? 'The spawn' : 'The whole map'}</option>
          {players.map((p: PlayerState) => (
            <option
              key={p.id}
              value={p.id}>
              {p.connected ? p.name : `${p.name} (away)`}
            </option>
          ))}
        </select>
        {(follow !== null || huge) && (
          <div className='grid grid-cols-2 gap-xsm'>
            {TV_VIEWS.map(({ id, label, hint }) => (
              <button
                key={id}
                type='button'
                aria-pressed={view === id}
                className={`flex flex-col items-start rounded-md border px-sm py-xsm text-left ${view === id ? 'border-brand bg-brand-muted' : 'border-border hover:bg-muted'}`}
                onClick={(): void => onView(id)}>
                <span className='text-xs text-foreground'>{label}</span>
                <span className='text-[11px] text-foreground-subtle'>{hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default FollowPanel;
