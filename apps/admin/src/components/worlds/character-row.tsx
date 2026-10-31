// Packages
import React, { useState } from 'react';
import { UserX } from 'lucide-react';

// Local Imports
import ConfirmPrompt from './confirm-prompt';

// Types
import type { CharacterInfo } from '@halloween/shared/saves/world-slots';

/**
 * Props for the CharacterRow component.
 */
interface CharacterRowProps {
  /**
   * The character.
   */
  character: CharacterInfo;

  /**
   * Deletes them for good.
   */
  onRelease: () => void;
}

/**
 * One character in the world being played: their color, name, and an
 * online dot, with Release, which asks first (`ConfirmPrompt`).
 *
 * @param {CharacterRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function CharacterRow({ character, onRelease }: CharacterRowProps): React.JSX.Element {
  const [asking, setAsking] = useState(false);

  return (
    <li className='flex flex-col gap-sm px-lg py-xsm'>
      <div className='flex items-center gap-sm'>
        <span
          className='h-3 w-3 shrink-0 rounded-sm'
          style={{ backgroundColor: character.color }} />
        <span className='min-w-0 flex-1 truncate text-sm text-foreground'>{character.name}</span>
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${character.online ? 'bg-status-success-foreground' : 'bg-muted'}`}
          title={character.online ? 'Online' : 'Offline'} />
        {!asking && (
          <button
            type='button'
            className='flex h-7 items-center gap-xsm rounded-md border border-border bg-muted px-sm text-xs text-foreground hover:bg-background'
            onClick={(): void => setAsking(true)}>
            <UserX size={13} />
            Release
          </button>
        )}
      </div>
      {asking && (
        <ConfirmPrompt
          message={`Deletes ${character.name} for good and frees the name.${character.online ? ' Their phone goes back to the join form.' : ''}`}
          confirmLabel='Release'
          onConfirm={(): void => {
            setAsking(false);
            onRelease();
          }}
          onCancel={(): void => setAsking(false)} />
      )}
    </li>
  );
}

export default CharacterRow;
