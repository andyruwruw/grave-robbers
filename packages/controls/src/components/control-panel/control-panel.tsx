// Packages
import React from 'react';

// Local Imports
import { TABS } from '../../config/control-panel';
import GamePanel from '../game/game-panel';
import MusicPanel from '../music/music-panel';
import ControllersPanel from '../overview/controllers-panel';
import PlayerRoster from '../overview/player-roster';
import ServerStats from '../overview/server-stats';
import ControlTabs from './control-tabs';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { TvPadEntry } from '@halloween/shared/protocol/pads';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';
import type { WorldEventKind } from '@halloween/shared/world-events/types/world-events';
import type { ControlTab, MusicControls } from '../../types/control-panel';
import type { StatsSnapshot } from '../../types/stats';
import type { TvView } from '../../types/tv-view';

/**
 * Props for the ControlPanel component.
 */
interface ControlPanelProps {
  /**
   * The open tab.
   */
  tab: ControlTab;

  /**
   * Opens a tab.
   */
  onTab: (tab: ControlTab) => void;

  /**
   * Everyone in the game.
   */
  roster: PlayerState[];

  /**
   * Whether this page's socket is up.
   */
  connected: boolean;

  /**
   * The Overview tab's stats.
   */
  stats: StatsSnapshot;

  /**
   * The Music tab's controls (the TV only; without them there's no Music
   * tab).
   */
  music?: MusicControls;

  /**
   * Opens the map editor.
   */
  onEditMap?: () => void;

  /**
   * Whether the Game tab shows keyboard shortcuts (the TV only).
   */
  shortcuts?: boolean;

  /**
   * Whether the Overview shows the game controllers this computer sees
   * (the TV only).
   */
  localPads?: boolean;

  /**
   * The TV's view preset for huge worlds (on the TV only).
   */
  tvView?: TvView;

  /**
   * Picks another view preset (on the TV only).
   */
  onTvView?: (view: TvView) => void;

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
   * Game controllers plugged into the TV and who holds each.
   */
  pads: TvPadEntry[];

  /**
   * Sends a game command (blood moon, settings, spawns, reset) to the
   * server.
   */
  send: (msg: ClientMessage) => void;
}

/**
 * The TV's controls, shared by its sidebar and the `/admin` console:
 * Overview (players, game controllers on the TV and who holds each, and
 * stats), Music (the TV only), and Game (testing controls and a new
 * world).
 *
 * @param {ControlPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function ControlPanel({
  tab,
  onTab,
  roster,
  connected,
  stats,
  music,
  onEditMap,
  shortcuts = false,
  localPads = false,
  tvView,
  onTvView,
  gameSettings,
  worldEvents,
  presets,
  pads,
  send,
}: ControlPanelProps): React.JSX.Element {
  const tabs = TABS.filter(({ key }): boolean => key !== 'music' || music !== undefined);
  return (
    <div className='flex flex-col gap-lg'>
      <ControlTabs
        tabs={tabs}
        tab={tab}
        onTab={onTab} />
      {tab === 'overview' && (
        <>
          <PlayerRoster
            players={roster}
            connected={connected}
            levels={stats.levels} />
          <ControllersPanel
            pads={pads}
            local={localPads} />
          <ServerStats stats={stats} />
        </>
      )}
      {tab === 'music' && music && (
        <MusicPanel
          settings={music.settings}
          status={music.status}
          onChange={music.onAudio}
          onToggle={music.onToggle}
          onNext={music.onNext}
          onRemove={music.onRemove}
          onMove={music.onMove}
          onClaimMusic={music.onClaimMusic}
          incognito={music.incognito}
          onIncognito={music.onIncognito}
          look={music.look}
          onLook={music.onLook}
          pixelSize={music.pixelSize}
          onPixelSize={music.onPixelSize} />
      )}
      {tab === 'game' && (
        <GamePanel
          settings={gameSettings}
          worldEvents={worldEvents}
          worldLevel={stats.worldLevel}
          onChange={(settings: Partial<GameSettings>): void => send({ t: 'game-settings', settings })}
          onSpawn={(kind: SpawnKind): void => send({ t: 'spawn', kind })}
          onStartEvent={(kind: WorldEventKind): void => send({ t: 'start-world-event', kind })}
          onKillMonsters={(): void => send({ t: 'kill-monsters' })}
          onEditMap={onEditMap}
          shortcuts={shortcuts}
          tvView={tvView}
          onTvView={onTvView}
          presets={presets}
          onReset={(preset: string | null, gen: MapGenSettings): void => send({ t: 'reset-world', preset, gen })} />
      )}
    </div>
  );
}

export default ControlPanel;
