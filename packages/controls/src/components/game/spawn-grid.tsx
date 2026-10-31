// Packages
import React from 'react';
import { itemIconUrl } from '@halloween/renderer/icons/item-icons';

// Local Imports
import TitledCard from '../ui/titled-card';

// Types
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';
import type { Spawn } from '../../types/game-panel';

/**
 * Props for the SpawnGrid component.
 */
interface SpawnGridProps {
  /**
   * The card's title.
   */
  title: string;

  /**
   * The buttons, in order.
   */
  spawns: Spawn[];

  /**
   * The picked one, highlighted (when picking), or null.
   */
  selected?: SpawnKind | null;

  /**
   * Called when a button is clicked.
   */
  onPick: (kind: SpawnKind) => void;
}

/**
 * A titled card of spawn buttons, each the thing's own 3D model over its
 * name.
 *
 * @param {SpawnGridProps} props - Component props.
 * @returns {React.JSX.Element} The rendered grid.
 */
function SpawnGrid({ title, spawns, selected = null, onPick }: SpawnGridProps): React.JSX.Element {
  return (
    <TitledCard
      title={title}
      bodyClassName='grid grid-cols-4 gap-xsm px-lg py-md'>
      {spawns.map(({ kind, label, icon }: Spawn) => (
        <button
          key={kind}
          type='button'
          title={label}
          aria-pressed={selected === kind}
          className={`flex min-w-0 flex-col items-center gap-xsm rounded-md border py-sm text-xs text-foreground transition-colors ${selected === kind ? 'border-brand bg-brand-muted ring-1 ring-brand' : 'border-border bg-muted hover:bg-background'}`}
          onClick={(): void => onPick(kind)}>
          <img
            src={itemIconUrl(icon)}
            alt=''
            width={32}
            height={32}
            className='h-8 w-8 [image-rendering:pixelated]' />
          <span className='w-full truncate px-xsm text-center'>{label}</span>
        </button>
      ))}
    </TitledCard>
  );
}

export default SpawnGrid;
