// Packages
import React from 'react';
import { X } from 'lucide-react';
import { MAT_RECIPES, ammoMade, isMatRecipe } from '@halloween/shared/crafting/material-recipes';
import { craftCost, needsAnvil, recipeParts } from '@halloween/shared/crafting/recipes';
import { GEAR, wearsOut } from '@halloween/shared/gear/gear-catalog';
import { gearLabel, gearPrefix } from '@halloween/shared/gear/infusions/helpers/gear-names';
import { itemVariant } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { WEAPON_TRICKS } from '@halloween/shared/gear/weapon-tricks';
import { bagCount } from '@halloween/shared/inventory/affordability';
import { isGearItem } from '@halloween/shared/inventory/bag-items';
import { itemBlurb } from '@halloween/shared/inventory/item-blurbs';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';
import { STATIONS } from '@halloween/shared/structures/stations';
import { TURRETS } from '@halloween/shared/structures/turrets';
import { TREE_NODE } from '@halloween/shared/skill-tree/nodes';
import { levelOf, recipeUnlocked } from '@halloween/shared/skill-tree/progress';
import { gearWear } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Local Imports
import { gearIcon } from '../../helpers/gear-icons';
import { recipeOf } from '../../helpers/recipes';
import { ammoTraits, turretTraits, weaponTraits } from '../../helpers/traits';
import { statsOf } from '../../stats/stats-of';
import GoodsRow from '../items/goods-row';
import DetailPips from './detail-pips';
import ForgeNote from './forge-note';
import SpinningModel from './spinning-model';
import StatBars from './stat-bars';
import StationFlow from './station-flow';
import TraitList from './trait-list';
import UnlockHint from './unlock-hint';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { ItemKey } from '@halloween/shared/inventory/item-keys';
import type { Goods, Inventory, Material } from '@halloween/shared/goods/goods';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { NodeId, TreeState, Unlock } from '@halloween/shared/skill-tree/types/skill-tree';
import type { TraitLine } from '../../types/traits';

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
 * Everything about an item: its name and description, its model turning slowly, its level,
 * labeled stat bars in each stat's color, its traits in words, what a
 * station turns into what, what it costs (against what's carried), and
 * what unlocks it if it's locked. For an item the player holds, how much
 * use it has left. Materials just show their name and model. It scrolls
 * when it's taller than the screen; tap outside it or its X to close.
 * `inline` draws it as a panel in place instead.
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
  const gear = held && isGearItem(held) ? held : null;
  const infusion = gear?.infusion ?? null;
  const variant = itemVariant(gear);
  const name = mystery ? '?' : gear ? gearLabel(gear) : isMatRecipe(item) ? GOODS_LABELS[item] : itemLabel(item as ItemKey);
  const prefix = gear && !mystery ? gearPrefix(gear) : null;
  /**
   * How many of a good the player has, from the wallet or the bag.
   * @param g The good.
   * @returns The count.
   */
  const have = (g: Goods): number => (g === 'candy' || g === 'blood' ? inventory[g] : bagCount(bag, g));
  const stats = recipe && !mystery ? statsOf(recipe, tree, infusion) : [];
  if (held && isGearItem(held) && wearsOut(held.kind)) {
    const left = held.wear / gearWear(held.kind, tree);
    stats.push({ icon: 'lasts', color: 'tan', label: 'Condition', fill: left });
  }
  const station = recipe?.startsWith('build:') && !mystery ? STATIONS[recipe.slice(6) as StructureKind] : undefined;
  const turret = recipe?.startsWith('build:') && !mystery ? TURRETS[recipe.slice(6) as StructureKind] : undefined;
  const weapon = recipe?.startsWith('gear:') && !mystery ? GEAR[recipe.slice(5) as GearKind].weapon : undefined;
  const trick = weapon ? WEAPON_TRICKS[recipe!.slice(5) as GearKind] : undefined;
  const key: ItemKey = isMatRecipe(item) ? `mat:${item}` : item as ItemKey;
  const traits: TraitLine[] = mystery ? [] : [
    ...(weapon ? weaponTraits(weapon, trick) : []),
    ...(turret ? turretTraits(turret) : []),
    ...(key.startsWith('mat:') ? ammoTraits(key.slice(4) as Material) : []),
  ];
  const opens = recipe && isMatRecipe(recipe) ? MAT_RECIPES[recipe].opens : undefined;
  const unlock: Unlock | null = !recipe ? null : isMatRecipe(recipe) ? (opens ? { by: 'upgrade', from: opens, level: 0 } : null) : TREE_NODE[recipe]?.unlock ?? null;
  const forged = !!recipe && !mystery && needsAnvil(recipe);
  const open = !recipe || recipeUnlocked(recipe, tree);

  return (
    <div
      className={inline ? 'flex min-h-0' : 'fixed inset-0 z-50 flex items-center justify-center p-md'}
      style={inline ? undefined : { backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onPointerDown={inline ? undefined : (e: React.PointerEvent): void => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}>
      <div className={`flex max-h-full touch-pan-y flex-col gap-md overflow-y-auto overscroll-contain rounded-[2px] border border-border bg-surface p-md ${inline ? 'scrollbar-none w-full' : ''}`}>
        <div className='flex items-start gap-sm'>
          <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
            <span className='font-medium text-sm leading-tight text-foreground'>{name}</span>
            {prefix && <span className='font-medium text-xs leading-tight text-brand'>{prefix}</span>}
          </span>
          {!inline && onClose && (
            <button
              type='button'
              aria-label='Close'
              className='-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] text-foreground-muted'
              onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>
        {!mystery && <span className='max-w-[300px] text-xs italic leading-snug text-foreground-muted'>{variant?.blurb ?? itemBlurb(key)}</span>}
        <div className='flex gap-md'>
          <div className='flex flex-col items-center gap-2'>
            <div className='p-1 sm:p-3 md:p-4'>
              <SpinningModel
                item={gear ? gearIcon(gear.kind, infusion) : item}
                size={112}
                dim={!open && !mystery}
                blur={mystery} />
            </div>
            {recipe && (recipe === 'arrows' || (!isMatRecipe(recipe) && TREE_NODE[recipe])) && <DetailPips level={levelOf(recipe === 'arrows' ? 'mat:arrows' : recipe as NodeId, tree)} />}
            {recipe && isMatRecipe(recipe) && <span className='font-medium text-sm text-foreground'>x{ammoMade(recipe)}</span>}
          </div>
          <div className='flex min-w-[170px] max-w-[260px] flex-col justify-center gap-3 text-foreground-muted'>
            <StatBars stats={stats} />
            {station && <StationFlow station={station} />}
            <TraitList traits={traits} />
            {forged && <ForgeNote anvil={anvil ?? (tree.free ? 0 : null)} />}
            {recipe && !mystery && !variant && (
              <div className='border-t border-border pt-2'>
                <GoodsRow
                  goods={craftCost(recipe, anvil)}
                  have={have}
                  parts={recipeParts(recipe)}
                  bag={bag} />
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
