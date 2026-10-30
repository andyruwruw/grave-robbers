// Local Imports
import { GEAR } from '../../gear/gear-catalog';
import { WEAPON_PERKS } from '../../gear/perks/weapon-perks';
import { STEADY_SUPPLY } from '../../gear/ranged-rules';
import { ANVIL_DISCOUNT_PER_LEVEL, STATIONS } from '../../structures/stations';
import { STRUCTURES } from '../../structures/structure-catalog';
import { TURRETS } from '../../structures/turrets';
import { RESEARCH_DISCOUNT_PER_LEVEL } from '../upgrade-cost';

// Types
import type { GearKind } from '../../gear/types/gear-def';
import type { StructureKind } from '../../structures/types/structures';
import type { NodeId } from '../types/skill-tree';

/**
 * The phone's line for the next upgrade of the structures whose upgrade
 * does more than add health or light (stations, the digger and turrets
 * have their own lines in `upgradeEffect`). None of these is a station or
 * a turret, so the order they're checked in doesn't matter.
 */
export const STRUCTURE_UPGRADE_EFFECTS: Partial<Record<StructureKind, string>> = {
  'anvil': `Parts and late gear cost ${Math.round(ANVIL_DISCOUNT_PER_LEVEL * 100)}% less, +30% health`,
  'blood-fountain': 'Drains faster, wider light, +30% health',
  'research-table': `Upgrades nearby cost ${Math.round(RESEARCH_DISCOUNT_PER_LEVEL * 100)}% less, +30% health`,
  'altar': '+1 blood per offering, +30% health',
  'bell': 'Wider ward, +30% health',
  'spikes': '+30% damage and health',
  'iron-spikes': '+30% damage and health',
  'barbed-wire': '+30% damage and health',
  'effigy': 'Wider curse, +30% health',
  'obelisk': 'Wider curse, +30% health',
  'soul-cage': 'Reaches further, +30% health',
};

/**
 * One line on what the next upgrade of a node does, for the phone.
 *
 * @param id The node.
 * @returns The line of text.
 */
export function upgradeEffect(id: NodeId): string {
  if (id === 'mat:arrows') {
    return `Steady supply: +${Math.round(STEADY_SUPPLY * 100)}% chance a shot spares its arrow or bolt`;
  }
  const [kind, what] = id.split(':') as ['gear', GearKind] | ['build', StructureKind];
  if (kind === 'gear') {
    const def = GEAR[what];
    const perk = WEAPON_PERKS[what];
    if (perk) {
      return `${perk.name}: ${perk.effect}`;
    }
    return def.guard ? 'Blocks more' : 'Wider, brighter light';
  }
  if (STATIONS[what] || what === 'digger') {
    return 'Works faster';
  }
  const effect = STRUCTURE_UPGRADE_EFFECTS[what];
  if (effect) {
    return effect;
  }
  if (TURRETS[what]) {
    return '+20% damage, +30% health';
  }
  return STRUCTURES[what].light ? 'Wider, brighter light, +30% health' : '+30% health';
}
