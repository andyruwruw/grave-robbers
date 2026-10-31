// Packages
import React from 'react';
import { recipeUnlocked } from '@halloween/shared/skill-tree/progress';

// Local Imports
import { ARMORY_KINDS } from '../../config/armory';
import { carriedGear } from '../../helpers/armory';
import ArmoryTile from './armory-tile';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * Props for the ArmoryGrid component.
 */
interface ArmoryGridProps {
  /**
   * What's equipped and in the bag.
   */
  gear: Gear;

  /**
   * The player's skill tree; locked weapons show as silhouettes.
   */
  tree: TreeState;

  /**
   * The weapon picked.
   */
  selected: GearKind;

  /**
   * Picks a weapon.
   */
  onSelect: (kind: GearKind) => void;
}

/**
 * Every weapon that can be infused, as square tiles in Craft list order
 * (`ARMORY_KINDS`).
 *
 * @param {ArmoryGridProps} props - Component props.
 * @returns {React.JSX.Element} The rendered grid.
 */
function ArmoryGrid({ gear, tree, selected, onSelect }: ArmoryGridProps): React.JSX.Element {
  return (
    <div className='grid w-full grid-cols-4 gap-1'>
      {ARMORY_KINDS.map((kind: GearKind) => (
        <ArmoryTile
          key={kind}
          kind={kind}
          open={recipeUnlocked(`gear:${kind}`, tree)}
          carried={kind === 'hammer' || carriedGear(gear, kind).length > 0}
          selected={selected === kind}
          onClick={(): void => onSelect(kind)} />
      ))}
    </div>
  );
}

export default ArmoryGrid;
