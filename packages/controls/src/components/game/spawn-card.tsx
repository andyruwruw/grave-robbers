// Packages
import React from 'react';
import { Shuffle } from 'lucide-react';

// Local Imports
import { BUILD_SPAWNS, GEAR_SPAWNS, MONSTER_SPAWNS, OBJECT_SPAWNS } from '../../config/game-panel';
import { PANEL_BUTTON } from '../../config/styles';
import SpawnGrid from './spawn-grid';

// Types
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';

/**
 * Props for the SpawnCard component.
 */
interface SpawnCardProps {
  /**
   * Spawns one at a random spot on the map.
   */
  onSpawn: (kind: SpawnKind) => void;

  /**
   * The picked thing (picking mode), or null.
   */
  selected?: SpawnKind | null;

  /**
   * Picks a thing, or puts it down (null). When given, clicking a button
   * picks it instead of spawning it, and a Random Location button, pinned
   * to the bottom of the scrolling panel, spawns the picked one at a random
   * spot.
   */
  onSelect?: (kind: SpawnKind | null) => void;
}

/**
 * Spawn buttons for objects, monsters, gear, and buildables, each its own
 * 3D model.
 * On the TV a click spawns one at a random spot. With `onSelect` (the
 * admin console) a click picks it instead (clicking it again puts it
 * down), the page places it where the map is clicked, and Random
 * Location, greyed out until something is picked, spawns it at a random
 * spot.
 *
 * @param {SpawnCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered cards.
 */
function SpawnCard({ onSpawn, selected = null, onSelect }: SpawnCardProps): React.JSX.Element {
  /**
   * Spawns a thing, or picks it when picking.
   *
   * @param kind What was clicked.
   */
  const pick = (kind: SpawnKind): void => {
    if (onSelect) {
      onSelect(selected === kind ? null : kind);
    } else {
      onSpawn(kind);
    }
  };

  return (
    <div className='flex flex-col gap-lg'>
      <SpawnGrid
        title='Objects'
        spawns={OBJECT_SPAWNS}
        selected={selected}
        onPick={pick} />
      <SpawnGrid
        title='Monsters'
        spawns={MONSTER_SPAWNS}
        selected={selected}
        onPick={pick} />
      <SpawnGrid
        title='Gear'
        spawns={GEAR_SPAWNS}
        selected={selected}
        onPick={pick} />
      <SpawnGrid
        title='Buildables'
        spawns={BUILD_SPAWNS}
        selected={selected}
        onPick={pick} />
      {onSelect && (
        <button
          type='button'
          disabled={!selected}
          className={`${PANEL_BUTTON} sticky bottom-0 shadow-lg disabled:opacity-100 disabled:text-foreground-subtle`}
          onClick={(): void => {
            if (selected) {
              onSpawn(selected);
            }
          }}>
          <Shuffle size={14} />
          Random Location
        </button>
      )}
    </div>
  );
}

export default SpawnCard;
