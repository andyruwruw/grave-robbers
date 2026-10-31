// Packages
import React from 'react';
import TitledCard from '@halloween/controls/components/ui/titled-card';
import { Caption } from '@halloween/ui/components/typography/typography';

// Local Imports
import CharacterRow from './character-row';

// Types
import type { CharacterInfo } from '@halloween/shared/saves/world-slots';

/**
 * Props for the CharactersCard component.
 */
interface CharactersCardProps {
  /**
   * The characters in the world being played.
   */
  characters: CharacterInfo[];

  /**
   * Deletes a character for good.
   */
  onRelease: (id: string) => void;
}

/**
 * The Worlds page's Characters section: everyone the world being played
 * keeps (`CharacterRow` each), online or not.
 *
 * @param {CharactersCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function CharactersCard({ characters, onRelease }: CharactersCardProps): React.JSX.Element {
  return (
    <TitledCard
      title='Characters'
      aside={<span className='text-xs text-foreground-subtle'>{characters.length}</span>}
      bodyClassName='flex flex-col'>
      {characters.length === 0 ? (
        <div className='flex items-center justify-center px-lg py-md'>
          <Caption className='text-center'>No characters in this world yet.</Caption>
        </div>
      ) : (
        <ul className='flex flex-col py-xsm'>
          {characters.map((c: CharacterInfo): React.JSX.Element => (
            <CharacterRow
              key={c.id}
              character={c}
              onRelease={(): void => onRelease(c.id)} />
          ))}
        </ul>
      )}
    </TitledCard>
  );
}

export default CharactersCard;
