// Packages
import { infusableKind } from '@halloween/shared/gear/infusions/helpers/infusion-paths';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Essence, Infusion, InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { IconKey, InfusedIconKey } from '../../../types/icons';

/**
 * An infused piece of gear's icon key: `gear:${kind}@${essence}${level}`
 * (the plain hammer's infusions belong to the infused hammer).
 * @param kind The gear.
 * @param infusion Its infusion.
 * @returns The key.
 */
export const infusedIconKey = (kind: GearKind, infusion: Infusion): InfusedIconKey => `gear:${infusableKind(kind)}@${infusion.essence}${infusion.level}`;

/**
 * A piece of gear's icon key: plain `gear:${kind}`, or the infused form.
 * @param item The gear (a bag item, or a kind and the infusion to show).
 * @param item.kind The gear's kind.
 * @param item.infusion Its infusion, if any.
 * @returns The key.
 */
export const gearIconKey = (item: { kind: GearKind; infusion?: Infusion | null }): IconKey => (item.infusion ? infusedIconKey(item.kind, item.infusion) : `gear:${item.kind}`);

/**
 * Reads the gear (and any infusion) a gear icon key names.
 * @param key `gear:${kind}`, the infused form, or 'hammer' or 'lantern'.
 * @returns The kind, and the infusion or null.
 */
export const parseGearIconKey = (key: string): { kind: GearKind | 'lantern'; infusion: Infusion | null } => {
  const body = key.startsWith('gear:') ? key.slice(5) : key;
  const at = body.indexOf('@');
  if (at < 0) {
    return { kind: body as GearKind | 'lantern', infusion: null };
  }
  const tag = body.slice(at + 1);
  return {
    kind: body.slice(0, at) as GearKind,
    infusion: { essence: tag.slice(0, -1) as Essence, level: Number(tag.slice(-1)) as InfusionLevel },
  };
};
