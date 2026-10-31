// Packages
import React from 'react';
import { gearLabel, gearPrefix } from '@halloween/shared/gear/infusions/helpers/gear-names';
import { infusableKind, variantOf } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { itemBlurb } from '@halloween/shared/inventory/item-blurbs';

// Local Imports
import { ARMORY_PREVIEW_PX } from '../../config/armory';
import { gearIcon } from '../../helpers/gear-icons';
import { statsOf } from '../../stats/stats-of';
import SpinningModel from '../item-details/spinning-model';
import StatBars from '../item-details/stat-bars';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * Props for the ArmoryPreview component.
 */
interface ArmoryPreviewProps {
  /**
   * The weapon, as the Armory lists it.
   */
  kind: GearKind;

  /**
   * The level shown, or null for the plain weapon.
   */
  preview: Infusion | null;

  /**
   * The player's skill tree, for the stat bars.
   */
  tree: TreeState;
}

/**
 * The top of the Armory's details: the shown variant's model turning
 * slowly, its name with its essence's prefix under it, what it does, and
 * its stat bars.
 *
 * @param {ArmoryPreviewProps} props - Component props.
 * @returns {React.JSX.Element} The rendered preview.
 */
function ArmoryPreview({ kind, preview, tree }: ArmoryPreviewProps): React.JSX.Element {
  const shown = preview ? infusableKind(kind) : kind;
  const item = { kind: shown, infusion: preview ?? undefined };
  const prefix = gearPrefix(item);
  return (
    <div className='flex shrink-0 gap-md'>
      <SpinningModel
        item={gearIcon(shown, preview)}
        size={ARMORY_PREVIEW_PX}
        dim={false} />
      <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
        <span className='flex flex-col gap-0.5'>
          <span className='font-medium text-sm leading-tight text-foreground'>{gearLabel(item)}</span>
          {prefix && <span className='font-medium text-xs leading-tight text-brand'>{prefix}</span>}
        </span>
        <span className='text-xs italic leading-snug text-foreground-muted'>{variantOf(shown, preview)?.blurb ?? itemBlurb(`gear:${kind}`)}</span>
        <StatBars stats={statsOf(`gear:${shown}`, tree, preview)} />
      </div>
    </div>
  );
}

export default ArmoryPreview;
