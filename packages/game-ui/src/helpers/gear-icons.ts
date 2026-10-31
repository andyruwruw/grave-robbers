// Packages
import { gearLabel } from '@halloween/shared/gear/infusions/helpers/gear-names';
import { isGearItem } from '@halloween/shared/inventory/bag-items';
import { itemKey, itemLabel } from '@halloween/shared/inventory/item-keys';
import { gearIconKey } from '@halloween/renderer/models/gear/helpers/gear-icon-key';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { IconKey } from '@halloween/renderer/types/icons';

/**
 * The icon for a kind of gear as a variant, or plain without an infusion.
 * Every client icon of held or previewed gear goes through here.
 *
 * @param kind - The gear kind.
 * @param infusion - Its infusion, if any.
 * @returns Its icon key.
 */
export const gearIcon = (kind: GearKind, infusion?: Infusion | null): IconKey => gearIconKey({ kind, infusion });

/**
 * The icon for whatever is in a bag slot (an infused weapon shows its
 * variant).
 *
 * @param item - The bag item.
 * @returns Its icon key.
 */
export const bagItemIcon = (item: BagItem): IconKey => (isGearItem(item) ? gearIcon(item.kind, item.infusion) : itemKey(item));

/**
 * What a bag item is called (an infused weapon goes by its variant's
 * name).
 *
 * @param item - The bag item.
 * @returns Its display name.
 */
export const bagItemLabel = (item: BagItem): string => (isGearItem(item) ? gearLabel(item) : itemLabel(itemKey(item)));
