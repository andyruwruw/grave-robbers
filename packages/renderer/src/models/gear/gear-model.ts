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
  buildMorningStar,
  buildQuarterstaff,
  buildShovel,
  buildSpikedGauntlet,
  buildStick,
  buildWarhammer,
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

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { BoxFactory, GearBuilder, GearModel } from '../../types/models';

/**
 * Each gear model's builder, by kind.
 */
const GEAR_BUILDERS: Record<GearKind | 'hammer', GearBuilder> = {
  'hammer': buildHammer,
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
};

/**
 * Builds a model. Weapons and the torch extend down -y from the hand at
 * the origin (the edge or point toward +x), the shield faces out along +z
 * from the forearm, and the plate sits on the torso at body height.
 * @param kind The gear to build.
 * @param box Makes each box.
 * @returns The model.
 */
export function buildGearModel(kind: GearKind | 'hammer', box: BoxFactory): GearModel {
  return GEAR_BUILDERS[kind](box);
}
