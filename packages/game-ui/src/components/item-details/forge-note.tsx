// Packages
import React from 'react';
import { Anvil } from 'lucide-react';
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
}

/**
 * For what's crafted at an anvil: whether one is in reach, and its
 * discount.
 *
 * @param {ForgeNoteProps} props - Component props.
 * @returns {React.JSX.Element} The rendered note.
 */
function ForgeNote({ anvil }: ForgeNoteProps): React.JSX.Element {
  return (
    <Trait>
      <span className={anvil === null ? 'text-danger' : ''}>
        <Anvil size={12} />
      </span>
      {anvil === null ? 'Craft beside an anvil' : anvil > 0 ? `Anvil: ${Math.round(ANVIL_DISCOUNT_PER_LEVEL * anvil * 100)}% off` : 'Anvil in reach'}
    </Trait>
  );
}

export default ForgeNote;
