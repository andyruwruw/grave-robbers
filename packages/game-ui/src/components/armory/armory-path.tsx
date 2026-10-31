// Packages
import React from 'react';
import { ESSENCE_MATERIAL, ESSENCE_PREFIX } from '@halloween/shared/gear/infusions/config/essences';
import { gearPrefix } from '@halloween/shared/gear/infusions/helpers/gear-names';
import { infusionCost } from '@halloween/shared/gear/infusions/helpers/infusion-cost';
import { infusableKind, pathOf } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';

// Local Imports
import { levelState } from '../../helpers/armory';
import { gearIcon } from '../../helpers/gear-icons';
import ItemIcon from '../items/item-icon';
import ArmoryLevel from './armory-level';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Essence, Infusion, InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { Variant } from '@halloween/shared/gear/infusions/types/variant';
import type { Goods, Inventory } from '@halloween/shared/goods/goods';
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { InfuseFrom } from '../../types/armory';

/**
 * Props for the ArmoryPath component.
 */
interface ArmoryPathProps {
  /**
   * The weapon, as the Armory lists it.
   */
  kind: GearKind;

  /**
   * The path's essence.
   */
  essence: Essence;

  /**
   * The level shown at the top, if any.
   */
  preview: Infusion | null;

  /**
   * Candy and blood carried.
   */
  inventory: Inventory;

  /**
   * What's equipped and in the bag.
   */
  gear: Gear;

  /**
   * The player's skill tree (free crafting infuses for nothing).
   */
  tree: TreeState;

  /**
   * The level of the anvil in reach, null without one.
   */
  anvil: number | null;

  /**
   * How much of a good the player carries.
   */
  have: (g: Goods) => number;

  /**
   * Shows a level at the top.
   */
  onPreview: (preview: Infusion) => void;

  /**
   * Infuses a piece of gear with the next level of an essence.
   */
  onInfuse: (from: InfuseFrom, essence: Essence) => void;
}

/**
 * One essence's path for a weapon: a heading with the essence and its
 * prefix, then a card for each level (`ArmoryLevel`) with its cost and
 * Infuse.
 *
 * @param {ArmoryPathProps} props - Component props.
 * @returns {React.JSX.Element | null} The rendered path, or nothing when the weapon has none.
 */
function ArmoryPath({ kind, essence, preview, inventory, gear, tree, anvil, have, onPreview, onInfuse }: ArmoryPathProps): React.JSX.Element | null {
  const shown = infusableKind(kind);
  const path = pathOf(shown, essence);
  if (!path) {
    return null;
  }
  const material = ESSENCE_MATERIAL[essence];
  return (
    <div className='flex flex-col gap-1'>
      <span className='flex items-center gap-1.5 font-medium text-xs text-foreground-muted'>
        <ItemIcon
          item={`mat:${material}`}
          size={20} />
        {GOODS_LABELS[material]}
        <span className='text-foreground-subtle'>({ESSENCE_PREFIX[essence]})</span>
      </span>
      {path.map((variant: Variant, i: number) => {
        const infusion: Infusion = { essence, level: (i + 1) as InfusionLevel };
        const cost = infusionCost(kind, essence, infusion.level, anvil)!;
        const state = levelState(gear, kind, infusion, cost, inventory, tree, anvil);
        return (
          <ArmoryLevel
            key={`${kind}-${i}`}
            icon={gearIcon(shown, infusion)}
            name={variant.name}
            prefix={gearPrefix({ kind: shown, infusion })}
            blurb={variant.blurb}
            previewed={preview?.essence === essence && preview.level === infusion.level}
            onPreview={(): void => onPreview(infusion)}
            cost={cost}
            have={have}
            state={state}
            onInfuse={(): void => {
              if (state.from !== null) {
                onInfuse(state.from, essence);
              }
            }} />
        );
      })}
    </div>
  );
}

export default ArmoryPath;
