// Packages
import React from 'react';
import { Hourglass, Sparkles } from 'lucide-react';
import { MAT_RECIPES, ammoMade, isMatRecipe } from '@halloween/shared/crafting/material-recipes';
import { craftCost, needsAnvil } from '@halloween/shared/crafting/recipes';
import { GEAR, wearsOut } from '@halloween/shared/gear/gear-catalog';
import { WEAPON_TRICKS } from '@halloween/shared/gear/weapon-tricks';
import { bagCount } from '@halloween/shared/inventory/affordability';
import { isGearItem } from '@halloween/shared/inventory/bag-items';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';
import { STATIONS } from '@halloween/shared/structures/stations';
import { TURRETS } from '@halloween/shared/structures/turrets';
import { TREE_NODE } from '@halloween/shared/skill-tree/nodes';
import { levelOf, recipeUnlocked } from '@halloween/shared/skill-tree/progress';
import { gearWear } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Local Imports
import { recipeOf } from '../../helpers/recipes';
import { statsOf } from '../../stats/stats-of';
import GoodsRow from '../items/goods-row';
import DetailPips from './detail-pips';
import ForgeNote from './forge-note';
import SpinningModel from './spinning-model';
import StatBars from './stat-bars';
import StationFlow from './station-flow';
import Trait from './trait';
import TurretTraits from './turret-traits';
import UnlockHint from './unlock-hint';
import WeaponTraits from './weapon-traits';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { ItemKey } from '@halloween/shared/inventory/item-keys';
import type { Goods, Inventory } from '@halloween/shared/goods/goods';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { NodeId, TreeState, Unlock } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * Props for the ItemDetails component.
 */
interface ItemDetailsProps {
  /**
   * What to describe: something craftable, or anything a bag can hold.
   */
  item: RecipeId | ItemKey;

  /**
   * The level of the anvil in reach (null without one), for what's
   * crafted at an anvil: shown whether one's near, and its discount.
   */
  anvil?: number | null;

  /**
   * The very item, when it's one the player holds, to show how much use it
   * has left.
   */
  held?: BagItem | null;

  /**
   * Something locked in the skill tree: no name, a blurred model, and only
   * what opens it.
   */
  mystery?: boolean;

  /**
   * The player's skill tree, for levels and locks.
   */
  tree: TreeState;

  /**
   * Candy and blood carried.
   */
  inventory: Inventory;

  /**
   * The bag, for how much of each material is carried.
   */
  bag: readonly (BagItem | null)[];

  /**
   * Drawn in place as a panel (the craft page beside a TV controller)
   * instead of as a dialog over everything.
   */
  inline?: boolean;

  /**
   * Closes the dialog.
   */
  onClose?: () => void;
}

/**
 * Everything about an item: its name, its model turning slowly, its level,
 * labeled stat bars colored by how strong they are, special traits, what a
 * station turns into what, what it costs (against what's carried), and
 * what unlocks it if it's locked. For an item the player holds, how much
 * use it has left. Materials just show their name and model. Tap anywhere
 * to close; `inline` draws it as a panel in place instead.
 *
 * @param {ItemDetailsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered dialog.
 */
function ItemDetails({
  item,
  anvil = null,
  held,
  mystery = false,
  tree,
  inventory,
  bag,
  inline = false,
  onClose,
}: ItemDetailsProps): React.JSX.Element {
  const recipe: RecipeId | null = recipeOf(item);
  const name = mystery ? '?' : isMatRecipe(item) ? GOODS_LABELS[item] : itemLabel(item as ItemKey);
  /**
   * How many of a good the player has, from the wallet or the bag.
   * @param g The good.
   * @returns The count.
   */
  const have = (g: Goods): number => (g === 'candy' || g === 'blood' ? inventory[g] : bagCount(bag, g));
  const stats = recipe && !mystery ? statsOf(recipe, tree) : [];
  if (held && isGearItem(held) && wearsOut(held.kind)) {
    const left = held.wear / gearWear(held.kind, tree);
    stats.push({ icon: Hourglass, label: 'Condition', fill: left });
  }
  const station = recipe?.startsWith('build:') && !mystery ? STATIONS[recipe.slice(6) as StructureKind] : undefined;
  const turret = recipe?.startsWith('build:') && !mystery ? TURRETS[recipe.slice(6) as StructureKind] : undefined;
  const weapon = recipe?.startsWith('gear:') && !mystery ? GEAR[recipe.slice(5) as GearKind].weapon : undefined;
  const trick = weapon ? WEAPON_TRICKS[recipe!.slice(5) as GearKind] : undefined;
  const opens = recipe && isMatRecipe(recipe) ? MAT_RECIPES[recipe].opens : undefined;
  const unlock: Unlock | null = !recipe ? null : isMatRecipe(recipe) ? (opens ? { by: 'upgrade', from: opens, level: 0 } : null) : TREE_NODE[recipe]?.unlock ?? null;
  const forged = !!recipe && !mystery && needsAnvil(recipe);
  const open = !recipe || recipeUnlocked(recipe, tree);

  return (
    <div
      className={inline ? 'flex min-h-0' : 'fixed inset-0 z-50 flex items-center justify-center p-md'}
      style={inline ? undefined : { backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onPointerDown={inline ? undefined : onClose}>
      <div className={`flex max-h-full flex-col gap-sm overflow-y-auto rounded-[2px] border border-border bg-surface p-md ${inline ? 'scrollbar-none w-full' : ''}`}>
        <span className='font-medium text-sm leading-tight text-foreground'>{name}</span>
        <div className='flex gap-md'>
          <div className='flex flex-col items-center gap-1'>
            <SpinningModel
              item={item}
              size={112}
              dim={!open && !mystery}
              blur={mystery} />
            {recipe && (recipe === 'arrows' || (!isMatRecipe(recipe) && TREE_NODE[recipe])) && <DetailPips level={levelOf(recipe === 'arrows' ? 'mat:arrows' : recipe as NodeId, tree)} />}
            {recipe && isMatRecipe(recipe) && <span className='font-medium text-sm text-foreground'>x{ammoMade(recipe)}</span>}
          </div>
          <div className='flex min-w-[170px] flex-col justify-center gap-1.5 text-foreground-muted'>
            <StatBars stats={stats} />
            {weapon && <WeaponTraits weapon={weapon} />}
            {turret && <TurretTraits turret={turret} />}
            {station && <StationFlow station={station} />}
            {trick && (
              <Trait>
                <Sparkles size={12} />
                {trick}
              </Trait>
            )}
            {forged && <ForgeNote anvil={anvil} />}
            {recipe && !mystery && (
              <div className='mt-1 border-t border-border pt-1.5'>
                <GoodsRow
                  goods={craftCost(recipe, anvil)}
                  have={have} />
              </div>
            )}
            {!open && unlock && <UnlockHint unlock={unlock} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
