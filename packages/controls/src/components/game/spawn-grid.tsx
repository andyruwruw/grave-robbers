// Packages
import React from 'react';

// Types
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';
import type { Spawn } from '../../types/game-panel';

/**
 * Props for the SpawnGrid component.
 */
interface SpawnGridProps {
  /**
   * The line over the grid.
   */
  title: string;

  /**
   * The buttons, in order.
   */
  spawns: Spawn[];

  /**
   * Spawns one somewhere on the map.
   */
  onSpawn: (kind: SpawnKind) => void;
}

/**
 * A titled grid of spawn buttons.
 *
 * @param {SpawnGridProps} props - Component props.
 * @returns {React.JSX.Element} The rendered grid.
 */
function SpawnGrid({ title, spawns, onSpawn }: SpawnGridProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-sm'>
      <span className='text-xs text-foreground-muted'>{title}</span>
      <div className='grid grid-cols-4 gap-xsm'>
        {spawns.map(({ kind, label, icon: Icon }) => (
          <button
            key={kind}
            type='button'
            className='flex flex-col items-center gap-xsm rounded-md border border-border bg-muted py-sm text-xs text-foreground transition-colors hover:bg-background'
            onClick={(): void => onSpawn(kind)}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SpawnGrid;
