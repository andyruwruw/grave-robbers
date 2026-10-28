// Packages
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ArrowLeft,
  Backpack,
  Flame,
  Hammer,
  Hand,
  LogOut,
  Network,
  ShieldHalf,
  Smartphone,
} from 'lucide-react';
import { isBuildItem, itemLabel, twoHanded } from '@halloween/shared/gear';

// Local Imports
import Button from '../../../components/ui/controls/button';
import { INPUT_SEND_INTERVAL } from '../../../config';
import ActionButton from './action-button';
import DeathScreen from './death-screen';
import DirectionStick from './direction-stick';
import BagPanel from './bag-panel';
import CraftPanel from './craft-panel';
import Hearts from './hearts';
import InventoryBar from './inventory-bar';
import ItemIcon from './item-icon';
import Joystick from './joystick';
import PanicButton from './panic-button';
import TreePanel from './tree-panel';

// Types
import type {
  Gear,
  GearSlot,
  ItemKey,
  RecipeId,
} from '@halloween/shared/gear';
import type { Inventory, Resource } from '@halloween/shared/items';
import type { PlayerState, Vitals } from '@halloween/shared/protocol';
import type { NodeId, TreeState } from '@halloween/shared/tree';

/**
 * The lists that open above the toggles.
 */
type Panel = 'bag' | 'craft' | 'tree';

/**
 * Props for the ControllerPad component.
 */
interface ControllerPadProps {
  /**
   * The phone's player.
   */
  player: PlayerState;

  /**
   * What the player carries.
   */
  inventory: Inventory;

  /**
   * What's equipped and in the bag.
   */
  gear: Gear;

  /**
   * The player's skill tree.
   */
  tree: TreeState;

  /**
   * Whether the player stands by a research table, so upgrades work.
   */
  research: boolean;

  /**
   * The piece of gear Grab would pick up right now, if any.
   */
  reach: ItemKey | null;

  /**
   * Health, spawn protection, and death.
   */
  vitals: Vitals;

  /**
   * Wall-clock ms of the next respawn, while dead.
   */
  respawnAt: number;

  /**
   * Sends a joystick vector to the server.
   */
  onInput: (x: number, y: number) => void;

  /**
   * Sends Action button presses and releases.
   */
  onAction: (down: boolean) => void;

  /**
   * Raises (true) or lowers the shield.
   */
  onBlock: (down: boolean) => void;

  /**
   * Sends where the Action stick points (snapped), or (0, 0) when centered.
   */
  onAim: (x: number, y: number) => void;

  /**
   * Throws a handful of candy or blood onto the facing tile.
   */
  onDrop: (resource: Resource) => void;

  /**
   * Moves a bag item to another slot (stacking or swapping).
   */
  onMove: (from: GearSlot | number, to: GearSlot | number) => void;

  /**
   * Picks up the item in reach.
   */
  onGrab: () => void;

  /**
   * Equips the item in a bag slot.
   */
  onEquip: (bag: number) => void;

  /**
   * Drinks a tonic from a bag slot.
   */
  onDrink: (bag: number) => void;

  /**
   * Moves an equipped item back into the bag.
   */
  onUnequip: (slot: GearSlot) => void;

  /**
   * Throws a bag item onto the facing tile.
   */
  onDropGear: (from: GearSlot | number) => void;

  /**
   * Crafts `count` bolts, pieces of gear, or structures.
   */
  onCraft: (recipe: RecipeId, count: number) => void;

  /**
   * Upgrades a skill tree node with candy.
   */
  onUpgrade: (node: NodeId) => void;

  /**
   * Makes the player run from close monsters for a moment, then come back.
   */
  onPanic: () => void;

  /**
   * Picks or clears the bag slot of structures previewed on the TV.
   */
  onBuildSelect: (slot: number | null) => void;

  /**
   * Builds one of the picked structures on the facing tile.
   */
  onBuildPlace: () => void;

  /**
   * Why the last build failed, shown briefly.
   */
  buildError: string | null;

  /**
   * Removes the player from the game.
   */
  onLeave: () => void;
}

/**
 * Landscape gamepad: a top bar with hearts, candy and blood, and leave; a
 * joystick zone on the left; big Bag, Craft, and Tree buttons down the
 * middle; and on the right the Grab button (showing what it would pick up),
 * a Block button to hold up a shield (with one beside a one-handed weapon),
 * and the Action button, which give way to the bag or craft list (with a
 * Panic button) while one is open. Tapping a structure in the bag goes
 * straight to building it: the bag closes and the right side shows what's
 * being built, a Turn stick to face where it should go (the left joystick
 * still walks), Back (to the bag), and Build (and, for torches, Hold, which
 * takes one in hand instead). The skill tree opens full screen, with
 * its own Back and Panic buttons. Panic closes whatever menu is open. Joystick input is sampled on a
 * fixed interval and only sent when it changes, so a busy finger can't flood
 * the socket. Pinch zoom, double-tap zoom, and page scrolling are blocked so
 * two thumbs can't knock the page around (the panels still scroll).
 * Portrait shows a rotate prompt instead.
 *
 * @param {ControllerPadProps} props - Component props.
 * @returns {React.JSX.Element} The rendered pad.
 */
function ControllerPad({
  player,
  inventory,
  gear,
  tree,
  research,
  reach,
  vitals,
  respawnAt,
  onInput,
  onAction,
  onBlock,
  onAim,
  onDrop,
  onMove,
  onGrab,
  onEquip,
  onDrink,
  onUnequip,
  onDropGear,
  onCraft,
  onUpgrade,
  onPanic,
  onBuildSelect,
  onBuildPlace,
  buildError,
  onLeave,
}: ControllerPadProps): React.JSX.Element {
  const latest = useRef({ x: 0, y: 0 });
  const [panel, setPanel] = useState<Panel | null>(null);
  const [placing, setPlacing] = useState<number | null>(null);
  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;

  useEffect(() => {
    let sent = { x: 0, y: 0 };
    const id = setInterval((): void => {
      const v = latest.current;
      if (v.x !== sent.x || v.y !== sent.y) {
        onInputRef.current(v.x, v.y);
        sent = v;
      }
    }, INPUT_SEND_INTERVAL);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const block = (e: Event): void => e.preventDefault();
    const blockPinch = (e: TouchEvent): void => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const options = { passive: false };
    document.addEventListener('gesturestart', block, options);
    document.addEventListener('gesturechange', block, options);
    document.addEventListener('touchmove', blockPinch, options);
    document.addEventListener('dblclick', block, options);
    return () => {
      document.removeEventListener('gesturestart', block);
      document.removeEventListener('gesturechange', block);
      document.removeEventListener('touchmove', blockPinch);
      document.removeEventListener('dblclick', block);
    };
  }, []);

  const dead = vitals.death !== null;
  useEffect(() => {
    if (dead) {
      setPanel(null);
      setPlacing(null);
    }
  }, [dead]);

  const placingItem = placing !== null ? gear.bag[placing] : null;
  useEffect(() => {
    if (placing !== null && !(placingItem && isBuildItem(placingItem))) {
      setPlacing(null);
    }
  }, [placing, placingItem]);

  const toggle = (next: Panel): void => {
    setPanel(panel === next ? null : next);
    if (placing !== null) {
      setPlacing(null);
      onBuildSelect(null);
    }
  };

  /**
   * Panic closes whatever menu is open, so the player can see what's
   * coming.
   */
  const panic = (): void => {
    onPanic();
    setPanel(null);
    if (placing !== null) {
      setPlacing(null);
      onBuildSelect(null);
    }
  };

  const startBuilding = (slot: number): void => {
    setPlacing(slot);
    onBuildSelect(slot);
    setPanel(null);
  };

  const stopBuilding = (): void => {
    setPlacing(null);
    onBuildSelect(null);
    onAim(0, 0);
    setPanel('bag');
  };

  return (
    <div className='fixed inset-0 flex touch-none select-none flex-col bg-background'>
      <header className='flex items-center gap-md border-b border-border px-md py-sm'>
        <Hearts
          hp={vitals.hp}
          wounded={vitals.wounded} />
        <span className='flex-1' />
        <InventoryBar inventory={inventory} />
        <Button
          variant='ghost'
          size='icon'
          aria-label='Leave game'
          onClick={onLeave}>
          <LogOut size={14} />
        </Button>
      </header>
      <div className='flex min-h-0 flex-1'>
        <Joystick
          color={player.color}
          onChange={(x: number, y: number): void => {
            latest.current = { x, y };
          }} />
        <div className='flex shrink-0 flex-col items-center justify-center gap-md px-sm'>
          {([['bag', Backpack, 'Bag'], ['craft', Hammer, 'Craft'], ['tree', Network, 'Skill tree']] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              type='button'
              aria-label={label}
              aria-pressed={panel === key}
              className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${panel === key ? 'border-brand bg-brand-muted text-foreground' : 'border-border bg-muted text-foreground-muted'}`}
              onClick={(): void => toggle(key)}>
              <Icon size={26} />
            </button>
          ))}
        </div>
        <div className='flex w-[46%] min-w-0 shrink-0 flex-col gap-sm p-md'>
          {panel === 'bag' || panel === 'craft' ? (
            <>
              <div className='flex shrink-0 items-center justify-between'>
                <span className='font-pixel text-[9px] text-foreground'>{panel === 'bag' ? 'Bag' : 'Craft'}</span>
                <PanicButton onPanic={panic} />
              </div>
              <div className='scrollbar-none min-h-0 flex-1 touch-pan-y overflow-y-auto'>
                {panel === 'craft' ? (
                  <CraftPanel
                    inventory={inventory}
                    gear={gear}
                    tree={tree}
                    onCraft={onCraft} />
                ) : (
                  <BagPanel
                    gear={gear}
                    inventory={inventory}
                    tree={tree}
                    onEquip={onEquip}
                    onDrink={onDrink}
                    onUnequip={onUnequip}
                    onMove={onMove}
                    onDropItem={onDropGear}
                    onDropResource={onDrop}
                    onPlace={startBuilding} />
                )}
              </div>
              {buildError && <span className='font-pixel text-[8px] text-status-warning-foreground'>{buildError}</span>}
            </>
          ) : placingItem && isBuildItem(placingItem) ? (
            <>
              <div className='flex min-h-0 flex-1 flex-col items-end justify-center gap-sm'>
                <div className='flex items-center gap-sm'>
                  <ItemIcon
                    item={`build:${placingItem.build}`}
                    size={40} />
                  <span className='font-pixel text-[9px] leading-tight text-foreground'>
                    {itemLabel(`build:${placingItem.build}`)}
                    <span className='ml-xsm text-foreground-muted'>x{placingItem.count}</span>
                  </span>
                </div>
                {buildError && <span className='font-pixel text-[8px] text-status-warning-foreground'>{buildError}</span>}
              </div>
              <div className='flex shrink-0 items-end justify-end gap-md'>
                <DirectionStick
                  color={player.color}
                  onAim={onAim} />
                {placingItem.build === 'torch' && (
                  <button
                    type='button'
                    aria-label='Hold a torch'
                    className='flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-border bg-muted font-pixel text-[7px] text-foreground'
                    onClick={(): void => {
                      onEquip(placing!);
                      setPlacing(null);
                      onBuildSelect(null);
                      onAim(0, 0);
                    }}>
                    <Flame size={20} />
                    HOLD
                  </button>
                )}
                <button
                  type='button'
                  aria-label='Back to the bag'
                  className='flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-border bg-muted font-pixel text-[7px] text-foreground-muted'
                  onClick={stopBuilding}>
                  <ArrowLeft size={20} />
                  BACK
                </button>
                <button
                  type='button'
                  aria-label='Build'
                  className='flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-foreground bg-brand-muted font-pixel text-[8px] text-foreground'
                  onClick={onBuildPlace}>
                  <Hammer size={24} />
                  BUILD
                </button>
              </div>
            </>
          ) : (
            <>
              <div className='flex min-h-0 flex-1 items-end justify-end'>
                {buildError && <span className='font-pixel text-[8px] text-status-warning-foreground'>{buildError}</span>}
              </div>
              <div className='flex shrink-0 items-end justify-end gap-md'>
                {gear.equipped.offhand?.kind === 'shield' && !twoHanded(gear.equipped.weapon?.kind) && (
                  <button
                    type='button'
                    aria-label='Block (hold)'
                    className='flex h-16 w-16 touch-none flex-col items-center justify-center gap-0.5 rounded-full border-2 border-border bg-muted font-pixel text-[7px] text-foreground active:border-foreground active:bg-brand-muted'
                    onPointerDown={(e: React.PointerEvent<HTMLButtonElement>): void => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      navigator.vibrate?.(10);
                      onBlock(true);
                    }}
                    onPointerUp={(): void => onBlock(false)}
                    onPointerCancel={(): void => onBlock(false)}
                    onContextMenu={(e: React.MouseEvent): void => e.preventDefault()}>
                    <ShieldHalf size={20} />
                    BLOCK
                  </button>
                )}
                <button
                  type='button'
                  aria-label={reach ? 'Grab' : 'Nothing to grab'}
                  disabled={!reach}
                  className={`flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 font-pixel text-[7px] transition-colors ${reach ? 'border-foreground bg-brand-muted text-foreground' : 'border-border bg-muted text-foreground-muted opacity-60'}`}
                  onClick={onGrab}>
                  {reach ? (
                    <ItemIcon
                      item={reach}
                      size={26} />
                  ) : <Hand size={20} />}
                  GRAB
                </button>
                <ActionButton
                  onChange={onAction}
                  onAim={onAim} />
              </div>
            </>
          )}
        </div>
      </div>
      {panel === 'tree' && (
        <TreePanel
          inventory={inventory}
          bag={gear.bag}
          tree={tree}
          research={research}
          onUpgrade={onUpgrade}
          onBack={(): void => setPanel(null)}
          onPanic={panic} />
      )}
      {vitals.death && (
        <DeathScreen
          death={vitals.death}
          respawnAt={respawnAt} />
      )}
      <div className='fixed inset-0 z-20 hidden flex-col items-center justify-center gap-md bg-background p-xl text-center portrait:flex'>
        <Smartphone
          size={40}
          className='rotate-90 text-foreground-muted' />
        <span className='font-pixel text-xs leading-relaxed text-foreground'>Turn your phone sideways</span>
      </div>
    </div>
  );
}

export default ControllerPad;
