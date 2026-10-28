// Packages
import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Axe,
  Crosshair,
  Droplet,
  Flame,
  Gauge,
  Ghost,
  Heart,
  HeartCrack,
  HeartPlus,
  Hourglass,
  Lock,
  MoveHorizontal,
  Pickaxe,
  ScrollText,
  ShieldHalf,
  Skull,
  Sun,
  Swords,
  Timer,
  Wind,
} from 'lucide-react';
import {
  GEAR,
  GEAR_KINDS,
  VAMPIRE_BLOOD_RESIST,
  ammoMade,
  bagCount,
  isGearItem,
  itemLabel,
  recipeCost,
} from '@halloween/shared/gear';
import { GOODS, MATERIALS, RESOURCE_COLORS } from '@halloween/shared/items';
import {
  DIGGER_SECONDS,
  PALISADE_THORNS,
  SENTRY_COOLDOWN,
  SENTRY_DAMAGE,
  SENTRY_RANGE,
  STATIONS,
  STRUCTURES,
  STRUCTURE_KINDS,
} from '@halloween/shared/structures';
import { SPIKE_DAMAGE_PER_SECOND } from '@halloween/shared/players';
import {
  MAX_LEVEL,
  TREE_NODE,
  altarBlood,
  bellRadius,
  diggerSeconds,
  gearGuard,
  gearWear,
  levelOf,
  lightIntensity,
  lightRadius,
  recipeUnlocked,
  sentryDamage,
  spikeDamage,
  stationSeconds,
  structureHp,
  weaponStats,
} from '@halloween/shared/tree';

// Local Imports
import { itemSpinUrls } from '../../display/renderer/item-models';
import ItemIcon from './item-icon';

// Types
import type { ComponentType } from 'react';
import type {
  BagItem,
  GearKind,
  ItemKey,
  RecipeId,
} from '@halloween/shared/gear';
import type { Bundle, Goods, Inventory, Material } from '@halloween/shared/items';
import type { StructureKind } from '@halloween/shared/structures';
import type { TreeState } from '@halloween/shared/tree';

/**
 * Props for the ItemDetails component.
 */
interface ItemDetailsProps {
  /**
   * What to describe: something craftable, or anything a bag can hold.
   */
  item: RecipeId | ItemKey;

  /**
   * The very item, when it's one the player holds, to show how much use it
   * has left.
   */
  held?: BagItem | null;

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

  onClose: () => void;
}

/**
 * One stat: an icon, what it is, and how full its bar is (0 to 1).
 */
interface Stat {
  icon: ComponentType<{ size?: number }>;
  label: string;
  fill: number;
}

/**
 * Segments in a stat bar.
 */
const SEGMENTS = 10;

/**
 * Most a level-3 upgrade can raise a stat, so bars leave room to grow.
 */
const TOP = 1.6;

const WEAPONS = GEAR_KINDS.filter((k: GearKind): boolean => !!GEAR[k].weapon);
const max = (values: number[]): number => Math.max(...values);
const MAX_DAMAGE = max(WEAPONS.map((k: GearKind): number => GEAR[k].weapon!.damage)) * TOP;
const MAX_SPEED = max(WEAPONS.map((k: GearKind): number => 1 / GEAR[k].weapon!.cooldown));
const MAX_REACH = max(WEAPONS.map((k: GearKind): number => GEAR[k].weapon!.reach));
const MAX_KNOCKBACK = max(WEAPONS.map((k: GearKind): number => GEAR[k].weapon!.knockback));
const MAX_CHOP = max(WEAPONS.map((k: GearKind): number => GEAR[k].weapon!.chop));
const MAX_HITS = max(WEAPONS.map((k: GearKind): number => GEAR[k].wear)) * 1.75;
const MAX_BLOCKS = max(GEAR_KINDS.filter((k: GearKind): boolean => !!GEAR[k].guard).map((k: GearKind): number => GEAR[k].wear)) * 1.75;
const MAX_HP = max(STRUCTURE_KINDS.map((k: StructureKind): number => STRUCTURES[k].hp)) * 1.9;
const MAX_RADIUS = lightRadius(max(STRUCTURE_KINDS.map((k: StructureKind): number => STRUCTURES[k].light?.radius ?? 0)), MAX_LEVEL);
const MAX_BRIGHTNESS = lightIntensity(max(STRUCTURE_KINDS.map((k: StructureKind): number => STRUCTURES[k].light?.intensity ?? 1)), MAX_LEVEL);

/**
 * The stat bars for a recipe at the player's level.
 */
function statsOf(recipe: RecipeId, tree: TreeState): Stat[] {
  if (recipe === 'bolts' || recipe === 'arrows') {
    return [];
  }
  const level = levelOf(recipe, tree);
  if (recipe.startsWith('gear:')) {
    const kind = recipe.slice(5) as GearKind;
    const def = GEAR[kind];
    if (def.weapon) {
      const w = weaponStats(kind, tree);
      return [
        { icon: Swords, label: 'Damage', fill: w.damage / MAX_DAMAGE },
        { icon: Gauge, label: 'Swing speed', fill: 1 / w.cooldown / MAX_SPEED },
        { icon: MoveHorizontal, label: 'Reach', fill: w.reach / MAX_REACH },
        { icon: Wind, label: 'Knockback', fill: w.knockback / MAX_KNOCKBACK },
        { icon: Axe, label: 'Chop and mine', fill: w.chop / MAX_CHOP },
        { icon: Hourglass, label: 'Lasts (hits)', fill: gearWear(kind, tree) / MAX_HITS },
      ];
    }
    if (def.guard) {
      return [
        { icon: ShieldHalf, label: 'Damage blocked', fill: (1 - gearGuard(kind, tree)) / 0.75 },
        { icon: Hourglass, label: 'Lasts (blocks)', fill: gearWear(kind, tree) / MAX_BLOCKS },
      ];
    }
    return [
      { icon: Sun, label: 'Light', fill: lightRadius(def.light?.radius ?? 0, level) / MAX_RADIUS },
      { icon: Flame, label: 'Brightness', fill: lightIntensity(def.light?.intensity, level) / MAX_BRIGHTNESS },
    ];
  }
  const kind = recipe.slice(6) as StructureKind;
  const def = STRUCTURES[kind];
  const stats: Stat[] = [{ icon: Heart, label: 'Toughness', fill: structureHp(kind, level) / MAX_HP }];
  if (kind === 'spikes') {
    stats.push({ icon: Swords, label: 'Damage to walkers', fill: spikeDamage(SPIKE_DAMAGE_PER_SECOND, level) / (SPIKE_DAMAGE_PER_SECOND * TOP) });
  }
  if (kind === 'palisade') {
    stats.push({ icon: Swords, label: 'Thorns', fill: PALISADE_THORNS / (SPIKE_DAMAGE_PER_SECOND * TOP) });
  }
  if (kind === 'sentry') {
    stats.push(
      { icon: Swords, label: 'Damage', fill: sentryDamage(level) / (SENTRY_DAMAGE * TOP) },
      { icon: Gauge, label: 'Fire rate', fill: 1 / SENTRY_COOLDOWN / MAX_SPEED },
      { icon: MoveHorizontal, label: 'Range', fill: SENTRY_RANGE / MAX_REACH },
    );
  }
  if (kind === 'altar') {
    stats.push({ icon: Droplet, label: 'Blood per offering', fill: altarBlood(level) / altarBlood(MAX_LEVEL) });
  }
  if (kind === 'digger') {
    stats.push({ icon: Pickaxe, label: 'Dig speed', fill: DIGGER_SECONDS / diggerSeconds(level) / 2.5 });
  }
  if (kind === 'bell') {
    stats.push({ icon: Ghost, label: 'Ghost ward', fill: bellRadius(level) / bellRadius(MAX_LEVEL) });
  }
  if (def.light) {
    const lit = def.light.burn === Infinity;
    stats.push({ icon: Sun, label: 'Light', fill: (lit ? lightRadius(def.light.radius, level) : def.light.radius) / MAX_RADIUS });
    if (lit) {
      stats.push({ icon: Flame, label: 'Brightness', fill: lightIntensity(def.light.intensity, level) / MAX_BRIGHTNESS });
    }
  }
  if (STATIONS[kind]) {
    stats.push({ icon: Timer, label: 'Work speed', fill: STATIONS[kind]!.seconds / stationSeconds(kind, level) / 2.5 });
  }
  return stats;
}

/**
 * A row of goods: each one's icon (or color for candy and blood) and count,
 * dimmed where the player doesn't carry enough.
 */
function GoodsRow({ goods, have }: { goods: Bundle; have?: (g: Goods) => number }): React.JSX.Element {
  return (
    <span className='flex items-center gap-1.5'>
      {GOODS.filter((g: Goods): boolean => goods[g] > 0).map((g: Goods) => (
        <span
          key={g}
          className={`flex items-center font-pixel text-[9px] ${have && have(g) < goods[g] ? 'text-status-error-foreground' : 'text-foreground'}`}>
          <ItemIcon
            item={(MATERIALS as Goods[]).includes(g) ? `mat:${g as Material}` : `res:${g as 'candy' | 'blood'}`}
            size={26} />
          {goods[g]}
        </span>
      ))}
    </span>
  );
}

/**
 * Level pips: filled up to `level` of MAX_LEVEL.
 */
function Pips({ level }: { level: number }): React.JSX.Element {
  return (
    <span className='flex gap-0.5'>
      {Array.from({ length: MAX_LEVEL }, (_, i: number) => (
        <span
          key={i}
          className={`h-1.5 w-3 ${i < level ? 'bg-brand' : 'bg-border'}`} />
      ))}
    </span>
  );
}

/**
 * Bar color by how full it is: weak, middling, strong.
 */
function barColor(fill: number): string {
  return fill < 0.34 ? 'bg-status-error-foreground' : fill < 0.67 ? 'bg-status-warning-foreground' : 'bg-status-success-foreground';
}

/**
 * Milliseconds per frame of the spinning model.
 */
const SPIN_FRAME_MS = 90;

/**
 * The item's model turning slowly in place.
 */
function SpinningModel({ item, size, dim }: { item: RecipeId | ItemKey; size: number; dim: boolean }): React.JSX.Element {
  const key = item === 'bolts' || item === 'arrows' ? `mat:${item}` as const : item;
  const [frames] = useState((): string[] => itemSpinUrls(key));
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval((): void => setFrame((f: number): number => (f + 1) % frames.length), SPIN_FRAME_MS);
    return () => clearInterval(timer);
  }, [frames]);
  return (
    <img
      src={frames[frame]}
      alt=''
      width={size}
      height={size}
      draggable={false}
      className={`pointer-events-none [image-rendering:pixelated] ${dim ? 'opacity-40' : ''}`} />
  );
}

/**
 * A small labeled tag for a special trait.
 */
function Trait({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <span className='flex items-center gap-1 font-pixel text-[7px] leading-tight text-foreground'>{children}</span>;
}

/**
 * Everything about an item: its name, its model turning slowly, its level,
 * labeled stat bars colored by how strong they are, special traits, what a
 * station turns into what, what it costs (against what's carried), and
 * what unlocks it if it's locked. For an item the player holds, how much
 * use it has left. Materials just show their name and model. Tap anywhere
 * to close.
 *
 * @param {ItemDetailsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered dialog.
 */
function ItemDetails({
  item,
  held,
  tree,
  inventory,
  bag,
  onClose,
}: ItemDetailsProps): React.JSX.Element {
  const recipe: RecipeId | null = item === 'mat:bolts' ? 'bolts' : item === 'mat:arrows' ? 'arrows' : item.startsWith('mat:') ? null : item as RecipeId;
  const name = item === 'bolts' ? 'Bolts' : item === 'arrows' ? 'Arrows' : itemLabel(item as ItemKey);
  const have = (g: Goods): number => (g === 'candy' || g === 'blood' ? inventory[g] : bagCount(bag, g));
  const stats = recipe ? statsOf(recipe, tree) : [];
  if (held && isGearItem(held)) {
    const left = held.wear / gearWear(held.kind, tree);
    stats.push({ icon: Hourglass, label: 'Condition', fill: left });
  }
  const station = recipe?.startsWith('build:') ? STATIONS[recipe.slice(6) as StructureKind] : undefined;
  const weapon = recipe?.startsWith('gear:') ? GEAR[recipe.slice(5) as GearKind].weapon : undefined;
  const unlock = !recipe || recipe === 'bolts' || recipe === 'arrows' ? null : TREE_NODE[recipe]?.unlock ?? null;
  const open = !recipe || recipeUnlocked(recipe, tree);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-md'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onPointerDown={onClose}>
      <div className='flex max-h-full flex-col gap-sm overflow-y-auto rounded-[2px] border border-border bg-surface p-md'>
        <span className='font-pixel text-[10px] leading-tight text-foreground'>{name}</span>
        <div className='flex gap-md'>
          <div className='flex flex-col items-center gap-1'>
            <SpinningModel
              item={item}
              size={112}
              dim={!open} />
            {recipe && recipe !== 'bolts' && (recipe === 'arrows' || TREE_NODE[recipe]) && <Pips level={levelOf(recipe === 'arrows' ? 'mat:arrows' : recipe, tree)} />}
            {(recipe === 'bolts' || recipe === 'arrows') && <span className='font-pixel text-[9px] text-foreground'>x{ammoMade(recipe)}</span>}
          </div>
          <div className='flex min-w-[170px] flex-col justify-center gap-1.5 text-foreground-muted'>
            {stats.map(({ icon: Icon, label, fill }, i: number) => {
              const filled = Math.round(Math.max(0, Math.min(1, fill)) * SEGMENTS);
              return (
                <div
                  key={i}
                  className='flex flex-col gap-0.5'>
                  <span className='flex items-center gap-1 font-pixel text-[7px] leading-tight'>
                    <Icon size={10} />
                    {label}
                  </span>
                  <span className='flex gap-px'>
                    {Array.from({ length: SEGMENTS }, (_, s: number) => (
                      <span
                        key={s}
                        className={`h-2 w-2.5 ${s < filled ? barColor(fill) : 'bg-border'}`} />
                    ))}
                  </span>
                </div>
              );
            })}
            {weapon && (weapon.ranged || weapon.slays || weapon.hpCost || weapon.feast || weapon.holy || weapon.ammo === 'blood') && (
              <div className='flex flex-col gap-1'>
                {weapon.ranged && (
                  <Trait>
                    <Crosshair size={12} />
                    Shoots
                    {weapon.ammo && (
                      <ItemIcon
                        item={weapon.ammo === 'blood' ? 'res:blood' : `mat:${weapon.ammo}`}
                        size={18} />
                    )}
                    {weapon.ammo ?? null}
                  </Trait>
                )}
                {weapon.slays && (
                  <Trait>
                    <Skull size={12} />
                    {`Kills ${weapon.slays}s in one hit`}
                  </Trait>
                )}
                {!!weapon.holy && (
                  <Trait>
                    <Sun size={12} />
                    {`Holy: ${weapon.holy}x damage to vampires`}
                  </Trait>
                )}
                {(weapon.ammo === 'blood' || !!weapon.hpCost) && (
                  <Trait>
                    <Droplet size={12} />
                    {`Vampires take only ${Math.round(VAMPIRE_BLOOD_RESIST * 100)}% of its damage`}
                  </Trait>
                )}
                {!!weapon.hpCost && (
                  <Trait>
                    <span style={{ color: RESOURCE_COLORS.blood }}>
                      <HeartCrack size={12} />
                    </span>
                    {`Each swing costs ${weapon.hpCost} hp`}
                  </Trait>
                )}
                {!!weapon.feast && (
                  <Trait>
                    <span style={{ color: RESOURCE_COLORS.tonic }}>
                      <HeartPlus size={12} />
                    </span>
                    {`Kills slowly heal ${weapon.feast} hp`}
                  </Trait>
                )}
              </div>
            )}
            {station && (
              <div className='flex items-center gap-1 text-foreground'>
                <GoodsRow goods={station.input} />
                <ArrowRight size={14} />
                <GoodsRow goods={station.output} />
              </div>
            )}
            {recipe && (
              <div className='mt-1 border-t border-border pt-1.5'>
                <GoodsRow
                  goods={recipeCost(recipe)}
                  have={have} />
              </div>
            )}
            {!open && unlock && (
              <div className='flex items-center gap-1.5 text-foreground'>
                <Lock size={14} />
                {unlock.by === 'blueprint' && <ScrollText size={16} />}
                {unlock.by === 'upgrade' && (
                  <>
                    <ItemIcon
                      item={unlock.from}
                      size={26} />
                    <Pips level={unlock.level} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
