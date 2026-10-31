// Packages
import React from 'react';
import SpawnCard from '@halloween/controls/components/game/spawn-card';
import ControllersPanel from '@halloween/controls/components/overview/controllers-panel';
import PlayerRoster from '@halloween/controls/components/overview/player-roster';
import ServerStats from '@halloween/controls/components/overview/server-stats';

// Local Imports
import AdminMenu from './admin-menu';
import CatalogPanel from './catalog-panel';
import CheatsCard from './cheats-card';
import FollowPanel from './follow-panel';
import GivePage from './give-page';
import ManipulateCard from './manipulate-card';
import MapPage from './map-page';
import TreeViewer from './tree-viewer';
import WorldsPage from './worlds/worlds-page';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { TvPadEntry } from '@halloween/shared/protocol/pads';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';
import type { CharacterInfo, WorldSlotInfo } from '@halloween/shared/saves/world-slots';
import type { RegrowthTile } from '@halloween/shared/world/regrowth';
import type { WorldEventKind } from '@halloween/shared/world-events/types/world-events';
import type { StatsSnapshot } from '@halloween/controls/types/stats';
import type { TvView } from '@halloween/controls/types/tv-view';
import type { AdminPageId } from '../types/admin-pages';

/**
 * Props for the AdminPageBody component.
 */
interface AdminPageBodyProps {
  /**
   * The open page.
   */
  page: AdminPageId;

  /**
   * Opens a page from the main menu.
   */
  onOpen: (page: AdminPageId) => void;

  /**
   * Everyone in the game.
   */
  roster: PlayerState[];

  /**
   * Whether the socket is up.
   */
  connected: boolean;

  /**
   * The latest stats.
   */
  stats: StatsSnapshot;

  /**
   * Game controllers plugged into the TV and who holds each.
   */
  pads: TvPadEntry[];

  /**
   * The server's current switches.
   */
  gameSettings: GameSettings;

  /**
   * The world events that are up right now.
   */
  worldEvents: WorldEventKind[];

  /**
   * Saved map layouts a new world can start from.
   */
  presets: { id: string; name: string }[];

  /**
   * How many of each regrowing tile the map keeps growing back to.
   */
  regrowth: Record<RegrowthTile, number>;

  /**
   * The followed player's id, or null for the whole map.
   */
  follow: string | null;

  /**
   * Follows a player, or the whole map (null).
   */
  onFollow: (id: string | null) => void;

  /**
   * Whether the world is huge.
   */
  huge: boolean;

  /**
   * How much ground shows while following.
   */
  view: TvView;

  /**
   * Picks how much ground shows.
   */
  onView: (view: TvView) => void;

  /**
   * What the Spawn page has picked to put down, or null.
   */
  spawnPick: SpawnKind | null;

  /**
   * Picks something to put down, or nothing (null).
   */
  onSpawnPick: (kind: SpawnKind | null) => void;

  /**
   * Whether the map editor is open.
   */
  editing: boolean;

  /**
   * Opens or closes the map editor.
   */
  onEditing: (open: boolean) => void;

  /**
   * The saved worlds, or null until the server has sent them.
   */
  slots: WorldSlotInfo[] | null;

  /**
   * The characters in the world being played.
   */
  characters: CharacterInfo[];

  /**
   * Sends a game command to the server.
   */
  send: (msg: ClientMessage) => void;
}

/**
 * What an admin page holds below its header: the main menu (with the
 * server stats at the bottom); Players (the roster, Follow, the TV's game
 * controllers); Gameplay (Manipulate, then Cheats); Spawn (pick a thing,
 * then click the map or Random Location); Give (hand a player goods,
 * gear, or buildables); Map (New Map and Map Editor
 * tabs); Worlds (the world slots and the playing world's characters); and
 * the Item Catalogue and Knowledge Tree dialogs' contents.
 *
 * @param {AdminPageBodyProps} props - Component props.
 * @returns {React.JSX.Element} The rendered page.
 */
function AdminPageBody({
  page,
  onOpen,
  roster,
  connected,
  stats,
  pads,
  gameSettings,
  worldEvents,
  presets,
  regrowth,
  follow,
  onFollow,
  huge,
  view,
  onView,
  spawnPick,
  onSpawnPick,
  editing,
  onEditing,
  slots,
  characters,
  send,
}: AdminPageBodyProps): React.JSX.Element {
  /**
   * Changes some of the server's switches.
   *
   * @param settings The switches to change.
   */
  const change = (settings: Partial<GameSettings>): void => send({ t: 'game-settings', settings });

  switch (page) {
    case 'menu':
      return (
        <div className='flex flex-1 flex-col justify-between gap-lg'>
          <AdminMenu onOpen={onOpen} />
          <ServerStats stats={stats} />
        </div>
      );
    case 'players':
      return (
        <>
          <PlayerRoster
            players={roster}
            connected={connected}
            levels={stats.levels} />
          <FollowPanel
            players={roster}
            follow={follow}
            onFollow={onFollow}
            huge={huge}
            view={view}
            onView={onView} />
          <ControllersPanel pads={pads} />
        </>
      );
    case 'gameplay':
      return (
        <>
          <ManipulateCard
            settings={gameSettings}
            worldLevel={stats.worldLevel}
            worldEvents={worldEvents}
            onChange={change}
            onStartEvent={(kind: WorldEventKind): void => send({ t: 'start-world-event', kind })}
            onKillMonsters={(): void => send({ t: 'kill-monsters' })}
            onClearItems={(): void => send({ t: 'clear-items' })}
            regrowth={regrowth}
            stocked={stats.stocked}
            onRegrowth={(tile: RegrowthTile, target: number): void => send({ t: 'regrowth-target', tile, target })} />
          <CheatsCard
            settings={gameSettings}
            onChange={change} />
        </>
      );
    case 'spawn':
      return (
        <SpawnCard
          selected={spawnPick}
          onSelect={onSpawnPick}
          onSpawn={(kind: SpawnKind): void => send({ t: 'spawn', kind })} />
      );
    case 'give':
      return (
        <GivePage
          roster={roster}
          follow={follow}
          send={send} />
      );
    case 'map':
      return (
        <MapPage
          editing={editing}
          onEditing={onEditing}
          presets={presets}
          onReset={(preset: string | null, gen: MapGenSettings): void => send({ t: 'reset-world', preset, gen })} />
      );
    case 'catalogue':
      return <CatalogPanel />;
    case 'tree':
      return <TreeViewer />;
    case 'worlds':
      return (
        <WorldsPage
          slots={slots}
          characters={characters}
          send={send} />
      );
  }
}

export default AdminPageBody;
