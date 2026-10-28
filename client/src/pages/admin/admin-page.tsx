// Packages
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { IDLE_MUSIC } from '@halloween/shared/audio';
import { DEFAULT_GAME_SETTINGS, sameGameSettings } from '@halloween/shared/protocol';

// Local Imports
import { useSocket } from '../../hooks/use-socket';
import ControlPanel from '../display/components/control-panel';

// Types
import type { TvControl, TvStatus } from '@halloween/shared/audio';
import type {
  DisplayMessage,
  GameSettings,
  PlayerState,
} from '@halloween/shared/protocol';
import type { ControlTab } from '../display/components/control-panel';
import type { StatsSnapshot } from '../display/components/server-stats';

/**
 * Set when this page load is the return from the Spotify login.
 */
const SPOTIFY_RETURN = new URLSearchParams(window.location.search).has('spotify');

/**
 * The TV's sidebar controls on a page of their own, for a phone or laptop:
 * players and stats, the TV's music (relayed to the TV through the server,
 * which plays it), and the game's testing controls and reset.
 *
 * @returns {React.JSX.Element} The rendered page.
 */
function AdminPage(): React.JSX.Element {
  const [tab, setTab] = useState<ControlTab>(SPOTIFY_RETURN ? 'music' : 'overview');
  const [roster, setRoster] = useState<PlayerState[]>([]);
  const [presets, setPresets] = useState<{ id: string; name: string }[]>([]);
  const [tv, setTv] = useState<TvStatus | null>(null);
  const [bloodMoon, setBloodMoon] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [stats, setStats] = useState<StatsSnapshot>({ tps: 0, stepMs: 0, worldLevel: 0, levels: {}, fps: null, monsters: 0, items: 0, bloodMoon: false });
  const latestStats = useRef(stats);
  const lastRosterKey = useRef('');

  useEffect(() => {
    if (SPOTIFY_RETURN) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    const timer = setInterval((): void => setStats(latestStats.current), 1000);
    return () => clearInterval(timer);
  }, []);

  const { status, send } = useSocket<DisplayMessage>({
    hello: () => ({ t: 'hello-display', admin: true }),
    onMessage: (msg: DisplayMessage): void => {
      switch (msg.t) {
        case 'display-welcome':
          setPresets(msg.presets);
          return;
        case 'tv-status':
          setTv(msg.status);
          return;
        case 'presets':
          setPresets(msg.presets);
          return;
        case 'state': {
          setBloodMoon(msg.bloodMoon);
          setGameSettings((prev: GameSettings): GameSettings => (sameGameSettings(prev, msg.settings) ? prev : msg.settings));
          latestStats.current = { ...msg.stats, fps: null, monsters: msg.monsters.length, items: msg.items.length, bloodMoon: msg.bloodMoon };
          const key = msg.players.map((p: PlayerState): string => `${p.id}:${p.connected ? 1 : 0}`).join(',');
          if (key !== lastRosterKey.current) {
            lastRosterKey.current = key;
            setRoster(msg.players);
          }
          return;
        }
        default:
      }
    },
  });

  const control = (c: TvControl): void => send({ t: 'tv-control', control: c });

  return (
    <div className='scrollbar-none fixed inset-0 overflow-y-auto bg-background'>
      <div className='mx-auto flex w-full max-w-md flex-col gap-lg p-lg'>
        <h1 className='font-pixel text-lg leading-relaxed text-foreground'>Graveyard admin</h1>
        <ControlPanel
          tab={tab}
          onTab={setTab}
          roster={roster}
          connected={status === 'open'}
          stats={stats}
          audio={tv?.audio ?? null}
          music={tv?.music ?? IDLE_MUSIC}
          onAudio={(settings): void => {
            setTv((prev: TvStatus | null): TvStatus | null => (prev ? { ...prev, audio: settings } : prev));
            control({ kind: 'audio', settings });
          }}
          onToggle={(): void => control({ kind: 'toggle' })}
          onNext={(): void => control({ kind: 'next' })}
          onRemove={(index: number, id: string): void => control({ kind: 'remove', index, id })}
          onMove={(index: number, id: string, delta: -1 | 1): void => control({ kind: 'move', index, id, delta })}
          incognito={tv?.incognito ?? false}
          onIncognito={(on: boolean): void => control({ kind: 'incognito', on })}
          gameSettings={gameSettings}
          bloodMoon={bloodMoon}
          presets={presets}
          send={send} />
      </div>
    </div>
  );
}

export default AdminPage;
