// Packages
import React from 'react';
import {
  Gamepad2,
  LayoutDashboard,
  Music,
} from 'lucide-react';

// Local Imports
import GamePanel from './game-panel';
import MusicPanel from './music-panel';
import PlayerRoster from './player-roster';
import ServerStats from './server-stats';

// Types
import type { AudioSettings, MusicStatus } from '@halloween/shared/audio';
import type { MapGenSettings } from '@halloween/shared/map-gen';
import type {
  ClientMessage,
  GameSettings,
  PlayerState,
  SpawnKind,
} from '@halloween/shared/protocol';
import type { LucideIcon } from 'lucide-react';
import type { StatsSnapshot } from './server-stats';

export type ControlTab = 'overview' | 'music' | 'game';

const TABS: { key: ControlTab; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'music', label: 'Music', icon: Music },
  { key: 'game', label: 'Game', icon: Gamepad2 },
];

/**
 * Props for the ControlPanel component.
 */
interface ControlPanelProps {
  tab: ControlTab;
  onTab: (tab: ControlTab) => void;

  /**
   * Everyone in the game, and whether this page's socket is up.
   */
  roster: PlayerState[];
  connected: boolean;
  stats: StatsSnapshot;

  /**
   * The TV's music choices and what it's playing, or null while no TV has
   * reported in (the admin page before the TV opens).
   */
  audio: AudioSettings | null;
  music: MusicStatus;
  onAudio: (settings: AudioSettings) => void;
  onToggle: () => void;
  onNext: () => void;

  /**
   * Takes a song out of, or moves it in, what's up next (its index there
   * and its id).
   */
  onRemove: (index: number, id: string) => void;
  onMove: (index: number, id: string, delta: -1 | 1) => void;

  /**
   * Set on a TV page while another one plays the music: takes it back.
   */
  onClaimMusic?: () => void;
  incognito: boolean;
  onIncognito: (on: boolean) => void;

  /**
   * Opens the map editor (on the TV only).
   */
  onEditMap?: () => void;
  gameSettings: GameSettings;
  bloodMoon: boolean;
  presets: { id: string; name: string }[];

  /**
   * Sends a game command (blood moon, settings, spawns, reset) to the
   * server.
   */
  send: (msg: ClientMessage) => void;
}

/**
 * The TV's controls, shared by its sidebar and the `/admin` page: three
 * tabs, Overview (players and stats), Music, and Game (testing controls
 * and a new world).
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
  audio,
  music,
  onAudio,
  onToggle,
  onNext,
  onRemove,
  onMove,
  onClaimMusic,
  incognito,
  onIncognito,
  onEditMap,
  gameSettings,
  bloodMoon,
  presets,
  send,
}: ControlPanelProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-lg'>
      <div
        role='tablist'
        className='grid grid-cols-3 gap-xsm rounded-md border border-[var(--arw-glass-edge)] p-xsm'>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type='button'
            role='tab'
            aria-selected={tab === key}
            className={`flex min-w-0 items-center justify-center gap-xsm whitespace-nowrap rounded-sm px-sm py-xsm text-xs font-medium transition-colors ${tab === key ? 'bg-muted text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
            onClick={(): void => onTab(key)}>
            <Icon
              size={13}
              className='shrink-0' />
            {label}
          </button>
        ))}
      </div>
      {tab === 'overview' && (
        <>
          <PlayerRoster
            players={roster}
            connected={connected}
            levels={stats.levels} />
          <ServerStats stats={stats} />
        </>
      )}
      {tab === 'music' && (audio ? (
        <MusicPanel
          settings={audio}
          status={music}
          onChange={onAudio}
          onToggle={onToggle}
          onNext={onNext}
          onRemove={onRemove}
          onMove={onMove}
          onClaimMusic={onClaimMusic}
          incognito={incognito}
          onIncognito={onIncognito} />
      ) : <span className='text-xs text-foreground-muted'>Open the TV page to control its music.</span>)}
      {tab === 'game' && (
        <GamePanel
          settings={gameSettings}
          bloodMoon={bloodMoon}
          worldLevel={stats.worldLevel}
          onChange={(settings: Partial<GameSettings>): void => send({ t: 'game-settings', settings })}
          onSpawn={(kind: SpawnKind): void => send({ t: 'spawn', kind })}
          onBloodMoon={(): void => send({ t: 'force-blood-moon' })}
          onKillMonsters={(): void => send({ t: 'kill-monsters' })}
          onEditMap={onEditMap}
          presets={presets}
          onReset={(preset: string | null, gen: MapGenSettings): void => send({ t: 'reset-world', preset, gen })} />
      )}
    </div>
  );
}

export default ControlPanel;
