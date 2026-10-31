// Packages
import { infusableKind } from '@halloween/shared/gear/infusions/helpers/infusion-paths';

// Local Imports
import {
  buildBoneArmor,
  buildPlate,
  buildStoneArmor,
  buildWoodArmor,
} from './armor';
import {
  buildBattleAxe,
  buildGlaive,
  buildGreatsword,
  buildRitualKnife,
  buildScythe,
  buildShortSword,
  buildSpear,
  buildStake,
} from './blades';
import {
  buildFemur,
  buildFlail,
  buildHammer,
  buildInfusedHammer,
  buildMorningStar,
  buildQuarterstaff,
  buildShovel,
  buildSpikedGauntlet,
  buildStick,
  buildWarhammer,
  buildWrench,
} from './bludgeons';
import {
  buildShield,
  buildTorch,
} from './offhand';
import {
  buildBloodGun,
  buildBow,
  buildCrossbow,
  buildMusket,
  buildRepeatingCrossbow,
} from './ranged';
import { infuseModel } from './infusions/infuse-model';
import { buildWhipModel } from './whip';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { BoxFactory, GearBuilder, GearModel } from '../../types/models';

/**
 * Each gear model's builder, by kind.
 */
const GEAR_BUILDERS: Record<GearKind | 'hammer', GearBuilder> = {
  'hammer': buildHammer,
  'infused-hammer': buildInfusedHammer,
  'battle-axe': buildBattleAxe,
  'scythe': buildScythe,
  'spear': buildSpear,
  'stake': buildStake,
  'crossbow': buildCrossbow,
  'ritual-knife': buildRitualKnife,
  'blood-gun': buildBloodGun,
  'torch': buildTorch,
  'shield': buildShield,
  'plate': buildPlate,
  'wood-armor': buildWoodArmor,
  'bone-armor': buildBoneArmor,
  'stone-armor': buildStoneArmor,
  'stick': buildStick,
  'femur': buildFemur,
  'short-sword': buildShortSword,
  'greatsword': buildGreatsword,
  'flail': buildFlail,
  'morning-star': buildMorningStar,
  'warhammer': buildWarhammer,
  'quarterstaff': buildQuarterstaff,
  'glaive': buildGlaive,
  'spiked-gauntlet': buildSpikedGauntlet,
  'bow': buildBow,
  'repeating-crossbow': buildRepeatingCrossbow,
  'musket': buildMusket,
  'shovel': buildShovel,
  'wrench': buildWrench,
};

/**
 * Builds a model. Weapons and the torch extend down -y from the hand at
 * the origin (the edge or point toward +x), the shield faces out along +z
 * from the forearm, and the plate sits on the torso at body height. With
 * an infusion it's that variant's model (see `infuseModel`; the plain
 * hammer's infusions belong to the infused hammer).
 * @param kind The gear to build.
 * @param box Makes each box.
 * @param infusion Its infusion, if any.
 * @returns The model.
 */
export function buildGearModel(kind: GearKind | 'hammer', box: BoxFactory, infusion?: Infusion | null): GearModel {
  if (!infusion) {
    return GEAR_BUILDERS[kind](box);
  }
  const infused = infusableKind(kind);
  return infuseModel(infused, infusion, box, GEAR_BUILDERS[infused]);
}

/**
 * Builds a model to hold in hand: as `buildGearModel`, but the morning
 * star comes as its straight whip with live joints (`joints`) for the
 * avatar to bend.
 * @param kind The gear to build.
 * @param box Makes each box.
 * @param infusion Its infusion, if any.
 * @returns The model.
 */
export function buildHeldModel(kind: GearKind | 'hammer', box: BoxFactory, infusion?: Infusion | null): GearModel {
  if (kind !== 'morning-star') {
    return buildGearModel(kind, box, infusion);
  }
  return infusion ? infuseModel(kind, infusion, box, buildWhipModel) : buildWhipModel(box);
}
