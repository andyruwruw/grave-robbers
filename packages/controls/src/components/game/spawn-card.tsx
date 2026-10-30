// Packages
import React from 'react';
import Card from '@halloween/ui/components/ui/primitives/card';

// Local Imports
import { MONSTER_SPAWNS, OBJECT_SPAWNS } from '../../config/game-panel';
import SpawnGrid from './spawn-grid';

// Types
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';

/**
 * Props for the SpawnCard component.
 */
interface SpawnCardProps {
  /**
   * Spawns one somewhere on the map.
   */
  onSpawn: (kind: SpawnKind) => void;
}

/**
 * Spawn buttons for objects and for monsters.
 *
 * @param {SpawnCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function SpawnCard({ onSpawn }: SpawnCardProps): React.JSX.Element {
  return (
    <Card className='flex flex-col'>
      <div className='flex flex-col gap-lg px-lg py-md'>
        <SpawnGrid
          title='Spawn objects anywhere on the map'
          spawns={OBJECT_SPAWNS}
          onSpawn={onSpawn} />
        <SpawnGrid
          title='Spawn monsters anywhere on the map'
          spawns={MONSTER_SPAWNS}
          onSpawn={onSpawn} />
      </div>
    </Card>
  );
}

export default SpawnCard;
