// Packages
import React, { useEffect, useState } from 'react';
import ArmoryPanel from '@halloween/game-ui/components/armory/armory-panel';
import DeathScreen from '@halloween/game-ui/components/screens/death-screen';
import WallStylePopup from '@halloween/game-ui/components/hud/wall-style-popup';
import TreePanel from '@halloween/game-ui/components/tree/tree-panel';
import { armoryOpen } from '@halloween/game-ui/helpers/armory';
import { useWallStyle } from '@halloween/game-ui/hooks/use-wall-style';

// Local Imports
import { useBlockPageGestures } from '../../hooks/use-block-page-gestures';
import { useInputSampler } from '../../hooks/use-input-sampler';
import { usePadPanels } from '../../hooks/use-pad-panels';
import Joystick from '../sticks/joystick';
import BuildControls from './build-controls';
import FightControls from './fight-controls';
import ListPanel from './list-panel';
import PadHeader from './pad-header';
import PanelTabs from './panel-tabs';
import RotatePrompt from './rotate-prompt';
import TransferMenu from './transfer-menu';
import TvPadMenu from './tv-pad-menu';

// Types
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { PadInfo } from '@halloween/shared/protocol/pads';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { Vitals } from '@halloween/shared/protocol/state/vitals';
import type { StyledWall } from '@halloween/shared/structures/wall-styles';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { PlayerCommands } from '@halloween/game-ui/session/player-commands';

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
   * What a research table in reach takes off upgrades (0 without one).
   */
  research: number;

  /**
   * The level of the anvil in reach (null without one).
   */
  anvil: number | null;

  /**
   * Health, spawn protection, and death.
   */
  vitals: Vitals;

  /**
   * Wall-clock ms of the next respawn, while dead.
   */
  respawnAt: number;

  /**
   * Why the last build failed, shown briefly.
   */
  buildError: string | null;

  /**
   * Game controllers plugged into the TV, and whether this player or
   * someone else has each.
   */
  pads: PadInfo[];

  /**
   * The last menu the held TV controller asked for (the west face button
   * the bag, north crafting, Back the tree), or USE on a research table
   * (the tree) or an anvil (the armory), opened when it changes.
   */
  padMenu: { menu: 'bag' | 'craft' | 'tree' | 'armory'; id: number } | null;

  /**
   * The last transfer code the server gave, or null.
   */
  transfer: { code: string; until: number } | null;

  /**
   * Everything the player does, sent to the server.
   */
  commands: PlayerCommands;
}

/**
 * Landscape gamepad: a top bar with hearts, candy and blood, and leave; a
 * joystick zone on the left; big Bag, Craft, Armory, and Tree buttons down
 * the middle; and on the right a Block button to hold up a shield (with one beside a one-handed weapon),
 * and the Action button, which give way to the bag or craft list (with a
 * Panic button) while one is open. Tapping a structure in the bag goes
 * straight to building it: the bag closes and the right side shows what's
 * being built, a Turn stick to face where it should go (the left joystick
 * still walks), Back (to the bag), and Build (and, for torches, Hold, which
 * takes one in hand instead). The skill tree and the Armory open full
 * screen, with their own Back and Panic buttons. Panic closes whatever menu is open. Joystick input is sampled on a
 * fixed interval and only sent when it changes, so a busy finger can't flood
 * the socket (`useInputSampler`). Pinch zoom, double-tap zoom, and page scrolling are blocked so
 * two thumbs can't knock the page around (the panels still scroll; `useBlockPageGestures`).
 * Portrait shows a rotate prompt instead. With game controllers plugged
 * into the TV, a controller button in the top bar lists them to claim one.
 * While one is held it walks, aims, hits, blocks, and panics, and the phone
 * is just the menus: the Bag, Craft, Armory, and Tree buttons move to the
 * far left with one of them always open (the bag first, the tree and the
 * Armory in place rather than full screen, without their headers), crafting shows the picked
 * recipe's details beside the list, the controller's face buttons switch
 * tabs (`padMenu`), and the controller button opens Release.
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
  anvil,
  vitals,
  respawnAt,
  buildError,
  pads,
  padMenu: padMenuRequest,
  transfer,
  commands,
}: ControllerPadProps): React.JSX.Element {
  const [transferMenu, setTransferMenu] = useState(false);
  const myPad = pads.find((p: PadInfo): boolean => p.mine) ?? null;
  const latest = useInputSampler(commands.input, myPad?.id);
  useBlockPageGestures();
  const { padMenu, setPadMenu, panel, setPanel, placing, setPlacing, toggle, panic, startBuilding, stopBuilding, shown, building } = usePadPanels(pads, myPad, vitals.death !== null, gear.bag, padMenuRequest, commands);
  const wallStyle = useWallStyle(building?.build ?? null, commands);
  const armory = armoryOpen(tree, anvil);
  useEffect(() => {
    if (!armory && panel === 'armory') {
      setPanel(null);
    }
  }, [armory, panel]);

  /**
   * The skill tree, full screen or (with a TV controller held) in place.
   *
   * @param embedded - Whether it sits in place, without its header.
   * @returns The tree panel.
   */
  const treePanel = (embedded: boolean): React.JSX.Element => (
    <TreePanel
      embedded={embedded}
      inventory={inventory}
      bag={gear.bag}
      tree={tree}
      research={research}
      onUpgrade={commands.upgrade}
      onBack={(): void => setPanel(null)}
      onPanic={panic} />
  );

  /**
   * The Armory, full screen or (with a TV controller held) in place.
   *
   * @param embedded - Whether it sits in place, without its header.
   * @returns The armory panel.
   */
  const armoryPanel = (embedded: boolean): React.JSX.Element => (
    <ArmoryPanel
      embedded={embedded}
      inventory={inventory}
      gear={gear}
      tree={tree}
      anvil={anvil}
      error={buildError}
      onInfuse={commands.infuse}
      onBack={(): void => setPanel(null)}
      onPanic={panic} />
  );

  /**
   * The bag or craft list.
   *
   * @param which - Which list.
   * @returns The list panel.
   */
  const listPanel = (which: 'bag' | 'craft'): React.JSX.Element => (
    <ListPanel
      which={which}
      padHeld={!!myPad}
      inventory={inventory}
      gear={gear}
      tree={tree}
      anvil={anvil}
      buildError={buildError}
      commands={commands}
      onPanic={panic}
      onPlace={startBuilding} />
  );

  const buildControls = building ? (
    <BuildControls
      building={building}
      placing={placing!}
      color={player.color}
      buildError={buildError}
      commands={commands}
      onDone={(): void => setPlacing(null)}
      onBack={stopBuilding} />
  ) : null;

  return (
    <div className='fixed inset-0 flex touch-none select-none flex-col bg-background'>
      <PadHeader
        vitals={vitals}
        inventory={inventory}
        pads={pads}
        myPad={myPad}
        padMenu={padMenu}
        onPadMenu={setPadMenu}
        transferMenu={transferMenu}
        onTransferMenu={setTransferMenu}
        onLeave={commands.leave} />
      {transferMenu && (
        <TransferMenu
          transfer={transfer}
          onRequest={commands.transferCode}
          onClose={(): void => setTransferMenu(false)} />
      )}
      {building && wallStyle.styles.length > 0 && (
        <WallStylePopup
          wall={building.build as StyledWall}
          styles={wallStyle.styles}
          style={wallStyle.style}
          title='Type'
          onPick={wallStyle.pick}
          className='absolute bottom-md left-md' />
      )}
      {padMenu && (
        <TvPadMenu
          pads={pads}
          myPad={myPad}
          onClose={(): void => setPadMenu(false)}
          onClaimPad={commands.claimPad}
          onReleasePad={commands.releasePad} />
      )}
      <div className='flex min-h-0 flex-1'>
        {myPad ? (
          <>
            <PanelTabs
              shown={shown}
              armory={armory}
              onToggle={toggle} />
            <div className='flex min-w-0 flex-1 flex-col gap-sm p-md'>
              {buildControls || (shown === 'tree' ? treePanel(true) : shown === 'armory' ? armoryPanel(true) : listPanel(shown === 'craft' ? 'craft' : 'bag'))}
            </div>
          </>
        ) : (
          <>
            <Joystick
              color={player.color}
              onChange={(x: number, y: number): void => {
                latest.current = { x, y };
              }} />
            <PanelTabs
              shown={shown}
              armory={armory}
              onToggle={toggle} />
            <div className='flex w-[46%] min-w-0 shrink-0 flex-col gap-sm p-md'>
              {panel === 'bag' || panel === 'craft' ? listPanel(panel) : buildControls || (
                <FightControls
                  gear={gear}
                  buildError={buildError}
                  commands={commands} />
              )}
            </div>
          </>
        )}
      </div>
      {!myPad && panel === 'tree' && treePanel(false)}
      {!myPad && panel === 'armory' && armoryPanel(false)}
      {vitals.death && (
        <DeathScreen
          death={vitals.death}
          respawnAt={respawnAt} />
      )}
      <RotatePrompt />
    </div>
  );
}

export default ControllerPad;
