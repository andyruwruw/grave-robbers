// Packages
import React, { useEffect, useRef, useState } from 'react';
import DeathScreen from '@halloween/game-ui/components/screens/death-screen';
import GeneratingScreen from '@halloween/game-ui/components/screens/generating-screen';
import NaughtyScreen from '@halloween/game-ui/components/screens/naughty-screen';
import PickupToasts from '@halloween/game-ui/components/hud/pickup-toasts';
import { useControllerSession } from '@halloween/game-ui/hooks/use-controller-session';
import WallStylePopup from '@halloween/game-ui/components/hud/wall-style-popup';
import { armoryOpen } from '@halloween/game-ui/helpers/armory';
import { useWallStyle } from '@halloween/game-ui/hooks/use-wall-style';
import { usePlayerCommands } from '@halloween/game-ui/hooks/use-player-commands';
import PerfOverlay from '@halloween/controls/components/hud/perf-overlay';
import { WorldCache } from '@halloween/controls/display/world-cache';
import WorldView from '@halloween/renderer/world/world-view';

// Local Imports
import BindingGlyph from './components/bindings/binding-glyph';
import BuildBanner from './components/hud/build-banner';
import PlayHud from './components/hud/play-hud';
import UsePromptTag from './components/hud/use-prompt-tag';
import JoinOverlay from './components/join-overlay';
import PlayMenu from './components/menu/play-menu';
import StashLayer from './components/stash-layer';
import UseLayer from './components/use-layer';
import { PAD_ACTIONS, PLAY_TOKEN_KEY } from './config/bindings';
import { MENUS, UI_HEIGHT } from './config/play';
import { keyLabel, padLabel } from './helpers/play-settings';
import { padRumble } from './helpers/rumble';
import { useBuilding } from './hooks/use-building';
import { usePlayInput } from './hooks/use-play-input';
import { usePlaySettings } from './hooks/use-play-settings';
import { usePlayView } from './hooks/use-play-view';
import { useWindowHeight } from './hooks/use-window-height';
import { SpatialNav } from './nav/spatial-nav';
import { Predictor } from './prediction/predictor';

// Types
import type { StyledWall } from '@halloween/shared/structures/wall-styles';
import type { PerfSample } from '@halloween/controls/types/stats';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type {
  Capture,
  KeyAction,
  Menu,
  PadAction,
  UsePromptShown,
} from './types/play';

/**
 * The game played on a screen of its own (`/play`) with a controller or a
 * keyboard and mouse: the graveyard up close, following this player (zoom
 * in Settings), with hearts, candy, and blood in a bar across the top. The
 * player is a controller like a phone (its own token, `PLAY_TOKEN_KEY`),
 * and the view is a display that says it's only a viewer, so it never takes
 * the TV's music (`usePlayView`). Both devices work at once; the hints follow whichever was
 * used last. The left stick or WASD walks, the right stick or the mouse
 * aims (the mouse counts once it moves after the stick), and the bound
 * buttons and keys (Settings, `PlaySettings.keys`/`pad`) hit, shield,
 * panic, and open the Bag, Craft, Armory, Skill tree, and Settings menus, each
 * covering the screen (`usePlayInput`, `PlayInputLoop`). In a menu the mouse clicks, or LB and RB switch
 * menus, the D-pad or left stick moves the selection (`SpatialNav`), A
 * presses it, and the right stick scrolls; B, Esc, or the menu's own
 * button closes it. Picking a structure in the bag closes the menu to
 * build it (`useBuilding`): aim (LB and RB turn a quarter at a time), then hit, A, or
 * right click builds, and panic (or Esc) goes back.
 * Hurts, deaths, and pickups rumble the pad (unless Controller rumble is
 * off). Menus are laid out for a phone-sized screen and scaled up to fit
 * (`UI_HEIGHT`, times the UI scale). The TPS, FPS, and server ticks overlay
 * shows in a corner when Graphics turns it on (`PerfOverlay`).
 *
 * @returns {React.JSX.Element} The rendered page.
 */
function PlayPage(): React.JSX.Element {
  const padIndex = useRef<number | null>(null);
  const { settings, changeSettings } = usePlaySettings();
  const rumbleOn = useRef(settings.rumble);
  rumbleOn.current = settings.rumble;
  const session = useControllerSession(PLAY_TOKEN_KEY, padRumble(padIndex, rumbleOn));
  const { identity, gear, inventory, tree, research, anvil, vitals, stash, using, padMenu, send } = session;
  const commands = usePlayerCommands(send);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [capturing, setCapturing] = useState<Capture | null>(null);
  const rendererRef = useRef<WorldRenderer | null>(null);
  const [cache] = useState((): WorldCache => new WorldCache());
  const menuRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const [usePrompt, setUsePrompt] = useState<UsePromptShown | null>(null);
  const nav = useRef(new SpatialNav());
  const predictor = useRef(new Predictor());

  const playerId = identity?.player.id ?? null;
  const { viewPing, serverStats, onReady, generating } = usePlayView(cache, rendererRef, predictor.current, playerId, settings);
  const height = useWindowHeight();

  const dead = vitals.death !== null;
  useEffect(() => {
    if (padMenu) {
      setMenu(padMenu.menu);
    }
  }, [padMenu]);
  const { building, startBuilding, stopBuilding } = useBuilding(gear.bag, dead, menu, setMenu, commands);
  const wallStyle = useWallStyle(building?.build ?? null, commands);
  const armory = armoryOpen(tree, anvil);
  const menus = MENUS.filter((m: Menu): boolean => m !== 'armory' || armory);
  useEffect(() => {
    if (!armory && menu === 'armory') {
      setMenu(null);
    }
  }, [armory, menu]);

  /**
   * Panics and closes any menu.
   */
  const panic = (): void => {
    commands.panic();
    setMenu(null);
  };

  const weapon = gear.equipped.weapon;
  const { device, padName } = usePlayInput(
    { joined: identity !== null, menu, building: building !== null, stash: stash !== null, using: using !== null, dead, send, panic, stopBuilding, cycleStyle: wallStyle.cycle, menus, setMenu, settings, changeSettings, capturing, setCapturing, playerId, weapon, tree },
    { padIndex, nav: nav.current, rendererRef, predictor: predictor.current, cache, menuRef, joinRef, promptRef, setUsePrompt },
  );

  const scale = Math.max(1, height / UI_HEIGHT) * settings.uiScale;
  /**
   * The label of what an action is bound to on the device in use.
   *
   * @param a - The action.
   * @returns The key or button label.
   */
  const bound = (a: KeyAction): string => (device === 'pad' && (PAD_ACTIONS as string[]).includes(a) ? padLabel(settings.pad[a as PadAction]) : keyLabel(settings.keys[a]));
  const inWorld = identity !== null && menu === null && stash === null && using === null && !dead;

  return (
    <div className={`fixed inset-0 overflow-hidden bg-background ${inWorld ? 'cursor-crosshair' : ''}`}>
      <WorldView
        className='h-full w-full'
        onReady={onReady} />
      <UsePromptTag
        promptRef={promptRef}
        prompt={usePrompt}
        scale={scale} />
      <div
        className='fixed left-0 top-0 origin-top-left select-none [&_img]:[image-rendering:pixelated]'
        style={{ width: `${100 / scale}vw`, height: `${100 / scale}vh`, transform: `scale(${scale})` }}>
        <PerfOverlay
          display={settings.display}
          sample={(): PerfSample => ({ tps: serverStats.current?.tps ?? null, stepMs: serverStats.current?.stepMs ?? null, fps: rendererRef.current?.fps ?? null })} />
        {identity ? (
          <>
            <PlayHud
              vitals={vitals}
              ping={viewPing}
              inventory={inventory}
              showResources={settings.display.showResources}
              rendererRef={rendererRef} />
            <PickupToasts toasts={session.toasts} />
            <BuildBanner
              building={building}
              buildError={session.buildError}
              keys={{ look: settings.keys.look, rotate: settings.keys.rotate, attack: settings.keys.attack }}
              padAttack={settings.pad.attack}
              device={device} />
            {building && wallStyle.styles.length > 0 && (
              <WallStylePopup
                wall={building.build as StyledWall}
                styles={wallStyle.styles}
                style={wallStyle.style}
                title={(
                  <span className='flex items-center gap-xsm'>
                    Type
                    <BindingGlyph binding={device === 'pad' ? { dpad: 'left-right' } : { code: settings.keys.look }} />
                  </span>
                )}
                onPick={wallStyle.pick}
                className='absolute bottom-md right-md' />
            )}
            {menu !== null && (
              <PlayMenu
                menu={menu}
                onMenu={setMenu}
                menuRef={menuRef}
                device={device}
                bound={bound}
                inventory={inventory}
                gear={gear}
                tree={tree}
                research={research}
                anvil={anvil}
                buildError={session.buildError}
                commands={commands}
                onPlace={startBuilding}
                onPanic={panic}
                settings={settings}
                onSettings={changeSettings}
                capturing={capturing}
                onCapture={setCapturing}
                transfer={session.transfer}
                menus={menus} />
            )}
            {stash && (
              <StashLayer
                menuRef={menu === null ? menuRef : undefined}
                bag={gear.bag}
                stash={stash}
                commands={commands} />
            )}
            {using && (
              <UseLayer
                menuRef={menu === null && !stash ? menuRef : undefined}
                panel={using}
                bag={gear.bag}
                inventory={inventory}
                tree={tree}
                commands={commands} />
            )}
            {session.naughty && (
              <NaughtyScreen
                key={session.naughty.id}
                candy={session.naughty.candy}
                onDone={session.endNaughty} />
            )}
            {vitals.death && (
              <DeathScreen
                seeThrough
                death={vitals.death}
                respawnAt={session.respawnAt} />
            )}
          </>
        ) : (
          <JoinOverlay
            joinRef={joinRef}
            welcomed={session.welcomed}
            joinError={session.joinError}
            joining={session.joining}
            needsCode={session.needsCode}
            onJoin={session.join}
            padName={padName} />
        )}
      </div>
      {generating && <GeneratingScreen />}
    </div>
  );
}

export default PlayPage;
