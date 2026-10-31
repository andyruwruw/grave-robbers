// Packages
import React, { useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { PANEL_BUTTON } from '@halloween/controls/config/styles';
import Badge from '@halloween/ui/components/ui/primitives/badge';

// Local Imports
import ConfirmPrompt from './confirm-prompt';
import { savedAgo, slotSize } from '../../helpers/world-slots';

// Types
import type { WorldSlotInfo } from '@halloween/shared/saves/world-slots';

/**
 * Props for the WorldSlotRow component.
 */
interface WorldSlotRowProps {
  /**
   * The slot.
   */
  slot: WorldSlotInfo;

  /**
   * Plays it.
   */
  onOpen: () => void;

  /**
   * Deletes it.
   */
  onDelete: () => void;
}

/**
 * One world slot: its name (with Active on the one being played), size,
 * characters, and last save, then Play and Delete on the others, each
 * asking first (`ConfirmPrompt`).
 *
 * @param {WorldSlotRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function WorldSlotRow({ slot, onOpen, onDelete }: WorldSlotRowProps): React.JSX.Element {
  const [asking, setAsking] = useState<'play' | 'delete' | null>(null);
  const characters = `${slot.characters} ${slot.characters === 1 ? 'character' : 'characters'}`;

  return (
    <li className='flex flex-col gap-sm px-lg py-sm'>
      <div className='flex flex-col gap-xsm'>
        <div className='flex items-center gap-sm'>
          <span className='min-w-0 flex-1 truncate text-sm text-foreground'>{slot.name}</span>
          {slot.active && (
            <Badge
              size='sm'
              variant='success'>
              Active
            </Badge>
          )}
        </div>
        <span className='text-xs text-foreground-subtle'>
          {slotSize(slot)}, {characters}, saved {savedAgo(slot.savedAt, Date.now())}
        </span>
      </div>
      {slot.active ? null : asking === 'play' ? (
        <ConfirmPrompt
          message='Saves and backs up this world, then plays this one. Everyone goes back to the join form.'
          confirmLabel='Play it'
          onConfirm={(): void => {
            setAsking(null);
            onOpen();
          }}
          onCancel={(): void => setAsking(null)} />
      ) : asking === 'delete' ? (
        <ConfirmPrompt
          message='Deletes this world. It is backed up first.'
          confirmLabel='Delete it'
          onConfirm={(): void => {
            setAsking(null);
            onDelete();
          }}
          onCancel={(): void => setAsking(null)} />
      ) : (
        <div className='flex gap-xsm'>
          <button
            type='button'
            className={PANEL_BUTTON}
            onClick={(): void => setAsking('play')}>
            <Play size={14} />
            Play
          </button>
          <button
            type='button'
            className={PANEL_BUTTON}
            onClick={(): void => setAsking('delete')}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export default WorldSlotRow;
