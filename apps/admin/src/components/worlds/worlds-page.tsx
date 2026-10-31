// Packages
import React from 'react';

// Local Imports
import CharactersCard from './characters-card';
import WorldSlotsCard from './world-slots-card';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { CharacterInfo, WorldSlotInfo } from '@halloween/shared/saves/world-slots';

/**
 * Props for the WorldsPage component.
 */
interface WorldsPageProps {
  /**
   * The saved worlds, or null until the server has sent them.
   */
  slots: WorldSlotInfo[] | null;

  /**
   * The characters in the world being played.
   */
  characters: CharacterInfo[];

  /**
   * Sends a game command to the server.
   */
  send: (msg: ClientMessage) => void;
}

/**
 * The Worlds page: the world slots (play, delete, or make one), then the
 * characters of the world being played (release one).
 *
 * @param {WorldsPageProps} props - Component props.
 * @returns {React.JSX.Element} The rendered page.
 */
function WorldsPage({ slots, characters, send }: WorldsPageProps): React.JSX.Element {
  return (
    <>
      <WorldSlotsCard
        slots={slots}
        onOpen={(id: string): void => send({ t: 'slot-open', id })}
        onDelete={(id: string): void => send({ t: 'slot-delete', id })}
        onCreate={(name: string): void => send({ t: 'slot-create', name })} />
      <CharactersCard
        characters={characters}
        onRelease={(id: string): void => send({ t: 'character-release', id })} />
    </>
  );
}

export default WorldsPage;
