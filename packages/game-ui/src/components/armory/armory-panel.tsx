// Packages
import React from 'react';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { pathsFor } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { bagCount } from '@halloween/shared/inventory/affordability';
import { itemBlurb } from '@halloween/shared/inventory/item-blurbs';

// Local Imports
import { gearIcon } from '../../helpers/gear-icons';
import { useArmorySelection } from '../../hooks/use-armory-selection';
import BuildError from '../hud/build-error';
import ForgeNote from '../item-details/forge-note';
import ArmoryGrid from './armory-grid';
import ArmoryHeader from './armory-header';
import ArmoryLevel from './armory-level';
import ArmoryPath from './armory-path';
import ArmoryPreview from './armory-preview';

// Types
import type { Essence } from '@halloween/shared/gear/types/infusion';
import type { Goods, Inventory } from '@halloween/shared/goods/goods';
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { InfuseFrom } from '../../types/armory';

/**
 * Props for the ArmoryPanel component.
 */
interface ArmoryPanelProps {
  /**
   * Candy and blood carried.
   */
  inventory: Inventory;

  /**
   * What's equipped and in the bag: what can be infused, and the essence
   * stacks that pay for it.
   */
  gear: Gear;

  /**
   * The player's skill tree; weapons it hasn't unlocked show as
   * silhouettes.
   */
  tree: TreeState;

  /**
   * The level of the anvil in reach (null without one): infusing only
   * happens beside one, for less the better it is.
   */
  anvil: number | null;

  /**
   * Why the last infusion (or build) failed, shown briefly under the
   * details.
   */
  error?: string | null;

  /**
   * Infuses a piece of gear with the next level of an essence.
   */
  onInfuse: (from: InfuseFrom, essence: Essence) => void;

  /**
   * Drawn in place inside a host's layout (the phone with a TV controller
   * held, /play's menu) instead of full screen with its own header.
   */
  embedded?: boolean;

  /**
   * Closes the full-screen Armory.
   */
  onBack?: () => void;

  /**
   * Makes the player run from monsters close by (the full-screen header's
   * Panic).
   */
  onPanic?: () => void;
}

/**
 * The Armory, for browsing and making weapon infusions (see
 * `docs/infusions.md`): a grid of every weapon with a path, locked ones as
 * silhouettes, beside the picked weapon's details in their own scroll.
 * The details show the shown variant's model turning, its name, prefix,
 * words, and stat bars, then whether an anvil is in reach, the plain
 * weapon, and each essence's path with a card per level: its model, name,
 * what it does, and its cost against what's carried. Tapping a card shows
 * it at the top. Infuse lights up beside an anvil while the weapon (or
 * the level before) is held or in the bag and the cost is carried; the
 * hammer everyone has can always take its first level. Without `embedded`
 * it covers the screen with Back and Panic.
 *
 * @param {ArmoryPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function ArmoryPanel({
  inventory,
  gear,
  tree,
  anvil,
  error = null,
  onInfuse,
  embedded = false,
  onBack,
  onPanic,
}: ArmoryPanelProps): React.JSX.Element {
  const { kind, preview, select, setPreview } = useArmorySelection(gear);
  /**
   * How many of a good the player has, from the wallet or the bag.
   *
   * @param g - The good.
   * @returns The count.
   */
  const have = (g: Goods): number => (g === 'candy' || g === 'blood' ? inventory[g] : bagCount(gear.bag, g));

  const body = (
    <div className={`flex min-h-0 w-full flex-1 gap-md ${embedded ? '' : 'p-md'}`}>
      <div className='scrollbar-none flex min-h-0 w-[min(220px,38%)] shrink-0 touch-pan-y flex-col overflow-y-auto'>
        <ArmoryGrid
          gear={gear}
          tree={tree}
          selected={kind}
          onSelect={select} />
      </div>
      <div className='scrollbar-none flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col gap-sm overflow-y-auto'>
        <ArmoryPreview
          kind={kind}
          preview={preview}
          tree={tree} />
        <ForgeNote
          anvil={anvil}
          verb='Infuse' />
        <ArmoryLevel
          icon={gearIcon(kind)}
          name={GEAR[kind].label}
          prefix={null}
          blurb={itemBlurb(`gear:${kind}`)}
          previewed={preview === null}
          onPreview={(): void => setPreview(null)} />
        {pathsFor(kind).map((essence: Essence) => (
          <ArmoryPath
            key={essence}
            kind={kind}
            essence={essence}
            preview={preview}
            inventory={inventory}
            gear={gear}
            tree={tree}
            anvil={anvil}
            have={have}
            onPreview={setPreview}
            onInfuse={onInfuse} />
        ))}
        <BuildError error={error} />
      </div>
    </div>
  );

  if (embedded) {
    return body;
  }
  return (
    <div className='fixed inset-0 z-10 flex flex-col bg-background'>
      <ArmoryHeader
        onBack={(): void => onBack?.()}
        onPanic={(): void => onPanic?.()} />
      {body}
    </div>
  );
}

export default ArmoryPanel;
