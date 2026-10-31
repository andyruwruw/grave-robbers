// Packages
import React from 'react';
import { ANVIL_DISCOUNT_PER_LEVEL } from '@halloween/shared/structures/stations';

// Local Imports
import Trait from './trait';

/**
 * Props for the ForgeNote component.
 */
interface ForgeNoteProps {
  /**
   * The level of the anvil in reach, null without one.
   */
  anvil: number | null;

  /**
   * What's done at the anvil, for the note without one ('Craft' or
   * 'Infuse').
   */
  verb?: string;
}

/**
 * For what's crafted (or infused) at an anvil: whether one is in reach,
 * and its discount.
 *
 * @param {ForgeNoteProps} props - Component props.
 * @returns {React.JSX.Element} The rendered note.
 */
function ForgeNote({ anvil, verb = 'Craft' }: ForgeNoteProps): React.JSX.Element {
  return (
    <Trait icon='anvil'>
      <span className={anvil === null ? 'text-danger' : ''}>
        {anvil === null ? `${verb} beside an anvil` : anvil > 0 ? `Anvil: ${Math.round(ANVIL_DISCOUNT_PER_LEVEL * anvil * 100)}% off` : 'Anvil in reach'}
      </span>
    </Trait>
  );
}

export default ForgeNote;
