// Packages
import React from 'react';
import TitledCard from '@halloween/controls/components/ui/titled-card';
import { Caption } from '@halloween/ui/components/typography/typography';

// Local Imports
import NewWorldForm from './new-world-form';
import WorldSlotRow from './world-slot-row';

// Types
import type { WorldSlotInfo } from '@halloween/shared/saves/world-slots';

/**
 * Props for the WorldSlotsCard component.
 */
interface WorldSlotsCardProps {
  /**
   * The saved worlds, or null until the server has sent them.
   */
  slots: WorldSlotInfo[] | null;

  /**
   * Plays a slot.
   */
  onOpen: (id: string) => void;

  /**
   * Deletes a slot.
   */
  onDelete: (id: string) => void;

  /**
   * Makes an empty slot.
   */
  onCreate: (name: string) => void;
}

/**
 * The Worlds page's list of world slots (`WorldSlotRow` each), with the
 * form for a new one under it.
 *
 * @param {WorldSlotsCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function WorldSlotsCard({
  slots,
  onOpen,
  onDelete,
  onCreate,
}: WorldSlotsCardProps): React.JSX.Element {
  return (
    <TitledCard
      title='Worlds'
      aside={slots && <span className='text-xs text-foreground-subtle'>{slots.length}</span>}
      bodyClassName='flex flex-col'>
      {slots === null ? (
        <div className='flex items-center justify-center px-lg py-md'>
          <Caption className='text-center'>Loading...</Caption>
        </div>
      ) : (
        <ul className='flex flex-col divide-y divide-border'>
          {slots.map((slot: WorldSlotInfo): React.JSX.Element => (
            <WorldSlotRow
              key={slot.id}
              slot={slot}
              onOpen={(): void => onOpen(slot.id)}
              onDelete={(): void => onDelete(slot.id)} />
          ))}
        </ul>
      )}
      <NewWorldForm onCreate={onCreate} />
    </TitledCard>
  );
}

export default WorldSlotsCard;
