// Packages
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ChevronLeft,
  VolumeX,
} from 'lucide-react';
import { IDLE_MUSIC } from '@halloween/shared/audio';
import { DEFAULT_GAME_SETTINGS, sameGameSettings } from '@halloween/shared/protocol';

// Local Imports
import { loadMedia } from '../../audio/media';
import { MusicPlayer } from '../../audio/music-player';
import { sfx } from '../../audio/sfx';
import { AUDIO_STORAGE_KEY } from '../../config';
import { writeStorage } from '../../helpers/storage';
import { useSocket } from '../../hooks/use-socket';
import { loadAudio, SPOTIFY_RETURN } from './audio-settings';
import ControlPanel from './components/control-panel';
import IncognitoScreen from './components/incognito-screen';
import JoinPanel from './components/join-panel';
import KillFeed from './components/kill-feed';
import MapEditor from './components/map-editor';
import WorldView from './components/world-view';
import { SoundDirector } from './sound-director';
import { useMapEditor } from './use-map-editor';
import { useTvMouse } from './use-tv-mouse';

// Types
import type { BlendAreas } from '@halloween/shared/blend';
import type {
  AudioSettings,
  MusicStatus,
  TvControl,
} from '@halloween/shared/audio';
import type {
  DisplayMessage,
  GameEvent,
  GameSettings,
  MapView,
  PlayerState,
} from '@halloween/shared/protocol';
import type { ControlTab } from './components/control-panel';
import type { FeedEvent, KillEntry } from './components/kill-feed';
import type { StatsSnapshot } from './components/server-stats';
import type { WorldRenderer } from './renderer/world-renderer';
import type { EditorState } from './use-map-editor';

/**
 * How long a kill stays in the feed, in ms.
 */
const KILL_FEED_MS = 6000;

/**
 * Cheap signature of the roster, so React only re-renders the sidebar when
 * someone joins, leaves, or drops, not on every 30Hz movement snapshot.
 */
function rosterKey(players: PlayerState[]): string {
  return players.map((p: PlayerState): string => `${p.id}:${p.connected ? 1 : 0}`).join(',');
}

/**
 * TV page: the graveyard fills the screen with only a small join QR. The
 * sidebar, opened from a chevron that appears when hovering the top-right
 * corner, holds the controls (`ControlPanel`, also on `/admin`): Overview
 * (players and stats), Music, and Game (testing controls and reset). The
 * TV owns the music: it applies what the admin page asks for (relayed by
 * the server) and reports back what's playing. Snapshots go straight to the renderer and
 * the sound director, bypassing React. Browsers keep audio
 * off until someone clicks or presses a key, so a faded hint sits in the
 * corner until then. Incognito (on when the page opens; toggled from the
 * Music tab) puts a now-playing
 * screen over the live graveyard, hides the kill feed, and silences
 * the game, fading away as soon as a phone joins (or on Escape); the I key
 * toggles it. The
 * mouse can pick up players and monsters and carry a light (`useTvMouse`),
 * or, with the map editor open (from the Game tab), edit the map
 * (`useMapEditor`, `MapEditor`).
 * Clicking outside the open sidebar closes it.
 *
 * @returns {React.JSX.Element} The rendered page.
 */
function DisplayPage(): React.JSX.Element {
  const rendererRef = useRef<WorldRenderer | null>(null);
  const latestPlayers = useRef<PlayerState[]>([]);
  const latestWorld = useRef<{ seed: number; tiles: string; levels: string; ramps: string; view: MapView | null } | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const editingRef = useRef(false);
  const lastEditor = useRef<EditorState>({ tool: 'raise', size: 3, label: 'Tree', tile: 'tree', scatter: 1, blend: { tree: 15, rock: 3, tombstone: 4, cross: 2, pumpkin: 1 }, flat: true, hideMonsters: true, topView: true });
  const blends = useRef<BlendAreas | null>(null);
  const changeEditor = (next: EditorState): void => {
    lastEditor.current = next;
    setEditor(next);
  };
  const lastRosterKey = useRef('');
  const [roster, setRoster] = useState<PlayerState[]>([]);
  const [lanAddress, setLanAddress] = useState<string | null>(null);
  const [presets, setPresets] = useState<{ id: string; name: string }[]>([]);
  const [kills, setKills] = useState<KillEntry[]>([]);
  const [audio, setAudio] = useState<AudioSettings>(loadAudio);
  const [sidebarOpen, setSidebarOpen] = useState(SPOTIFY_RETURN);
  const [musicStatus, setMusicStatus] = useState<MusicStatus>(IDLE_MUSIC);
  const [incognito, setIncognito] = useState(true);
  const [musicHere, setMusicHere] = useState(true);
  const connectedIds = useRef<Set<string> | null>(null);
  const [soundOn, setSoundOn] = useState(sfx.unlocked);
  const [bloodMoon, setBloodMoon] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [tab, setTab] = useState<ControlTab>(SPOTIFY_RETURN ? 'music' : 'overview');
  const [stats, setStats] = useState<StatsSnapshot>({ tps: 0, stepMs: 0, worldLevel: 0, levels: {}, fps: 0, monsters: 0, items: 0, bloodMoon: false });
  const latestStats = useRef(stats);
  const music = useRef<MusicPlayer | null>(null);
  music.current ??= new MusicPlayer(setMusicStatus);
  const director = useRef(new SoundDirector(sfx, music.current));
  const nextKillId = useRef(0);
  const killTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => killTimers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!sidebarOpen || tab !== 'overview') {
      return;
    }
    const refresh = (): void => setStats({ ...latestStats.current, fps: rendererRef.current?.fps ?? 0 });
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => clearInterval(timer);
  }, [sidebarOpen, tab]);

  useEffect(() => {
    const player = music.current!;
    const unlock = (): void => {
      player.resume();
      void sfx.unlock().then((): void => setSoundOn(true));
    };
    if (SPOTIFY_RETURN) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    music.current!.setOptions(audio);
    music.current!.setVolume(audio.musicVolume);
    writeStorage(AUDIO_STORAGE_KEY, JSON.stringify(audio));
  }, [audio]);

  useEffect(() => {
    sfx.setVolume(incognito ? 0 : audio.sfxVolume);
  }, [audio.sfxVolume, incognito]);

  useEffect(() => {
    let live = true;
    void loadMedia().then(({ ambience }): void => {
      if (live) {
        sfx.setAmbience(ambience[0] ?? null, audio.ambienceVolume);
      }
    });
    return () => {
      live = false;
    };
  }, [audio.ambienceVolume]);

  useEffect(() => {
    const keys = (e: KeyboardEvent): void => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName));
      if (e.key === 'Escape') {
        setIncognito(false);
        setEditor(null);
      } else if ((e.key === 'i' || e.key === 'I') && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && !editingRef.current) {
        setIncognito((on: boolean): boolean => !on);
      }
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, []);

  const addKill = (e: FeedEvent): void => {
    const entry: KillEntry = { id: nextKillId.current++, ...e };
    setKills((prev: KillEntry[]): KillEntry[] => [...prev, entry]);
    killTimers.current.push(setTimeout((): void => {
      setKills((prev: KillEntry[]): KillEntry[] => prev.filter((k: KillEntry): boolean => k.id !== entry.id));
    }, KILL_FEED_MS));
  };

  /**
   * Does what the admin page asked.
   */
  const applyControl = (control: TvControl): void => {
    if (control.kind === 'audio') {
      setAudio(control.settings);
    } else if (control.kind === 'toggle') {
      music.current!.toggle();
    } else if (control.kind === 'next') {
      music.current!.next();
    } else if (control.kind === 'remove') {
      music.current!.remove(control.index, control.id);
    } else if (control.kind === 'move') {
      music.current!.move(control.index, control.id, control.delta);
    } else {
      setIncognito(control.on);
    }
  };

  const { status, send } = useSocket<DisplayMessage>({
    hello: () => ({ t: 'hello-display' }),
    onMessage: (msg: DisplayMessage): void => {
      switch (msg.t) {
        case 'display-welcome':
          setLanAddress(msg.lanAddress);
          setPresets(msg.presets);
          return;
        case 'world':
          latestWorld.current = { seed: msg.seed, tiles: msg.tiles, levels: msg.levels, ramps: msg.ramps, view: msg.view };
          blends.current = msg.blends;
          rendererRef.current?.setWorld(msg.seed, msg.tiles, msg.levels, msg.ramps, msg.view);
          director.current.onWorld(msg.tiles, msg.levels, msg.ramps);
          return;
        case 'tiles':
          rendererRef.current?.applyTiles(msg.changes);
          director.current.onTiles(msg.changes);
          return;
        case 'tv-control':
          applyControl(msg.control);
          return;
        case 'tv-status':
          return;
        case 'presets':
          setPresets(msg.presets);
          return;
        case 'music-owner':
          music.current!.setEnabled(msg.owner);
          setMusicHere(msg.owner);
          return;
      }
      director.current.onState(msg);
      latestPlayers.current = msg.players;
      rendererRef.current?.setPlayers(msg.players);
      rendererRef.current?.setMonsters(msg.monsters, msg.bloodMoon);
      rendererRef.current?.setShots(msg.shots);
      rendererRef.current?.setPuddles(msg.puddles);
      setBloodMoon(msg.bloodMoon);
      setGameSettings((prev: GameSettings): GameSettings => (sameGameSettings(prev, msg.settings) ? prev : msg.settings));
      rendererRef.current?.setLightsOff(msg.settings.lightsOff);
      rendererRef.current?.setDaytime(msg.settings.daytime);
      rendererRef.current?.setCursorLight(msg.cursorLight);
      latestStats.current = { ...msg.stats, fps: 0, monsters: msg.monsters.length, items: msg.items.length, bloodMoon: msg.bloodMoon };
      rendererRef.current?.setWorldState(msg.items, msg.lights, msg.events);
      for (const e of msg.events) {
        if (e.t === 'kill' || e.t === 'blueprint' || e.t === 'research') {
          addKill(e);
        }
      }
      const connected = new Set(msg.players.filter((p: PlayerState): boolean => p.connected).map((p: PlayerState): string => p.id));
      if (connectedIds.current && [...connected].some((id: string): boolean => !connectedIds.current!.has(id))) {
        setIncognito(false);
      }
      connectedIds.current = connected;
      const key = rosterKey(msg.players);
      if (key !== lastRosterKey.current) {
        lastRosterKey.current = key;
        setRoster(msg.players);
      }
    },
  });

  useEffect(() => {
    if (status === 'open') {
      send({ t: 'tv-status', status: { audio, music: musicStatus, incognito } });
    }
  }, [status, send, audio, musicStatus, incognito]);

  useEffect(() => {
    rendererRef.current?.setFlatLight(editor?.flat ?? false);
    rendererRef.current?.setMonstersHidden(editor?.hideMonsters ?? false);
    rendererRef.current?.setTopView(editor?.topView ?? false);
    rendererRef.current?.setXray(editor !== null && (editor.tool === 'raise' || editor.tool === 'lower' || editor.tool === 'stairs'));
  }, [editor]);

  const play = useTvMouse(rendererRef, gameSettings, send);
  const edit = useMapEditor(rendererRef, editor, blends, changeEditor, send);
  const mouse = editor ? edit : play;
  editingRef.current = editor !== null;

  return (
    <div className='fixed inset-0 overflow-hidden bg-background'>
      <div
        className='h-full w-full'
        {...mouse}>
        <WorldView
          className='h-full w-full'
          onReady={(renderer: WorldRenderer | null): void => {
            rendererRef.current = renderer;
            if (renderer && latestWorld.current) {
              renderer.setWorld(latestWorld.current.seed, latestWorld.current.tiles, latestWorld.current.levels, latestWorld.current.ramps, latestWorld.current.view);
            }
            renderer?.setPlayers(latestPlayers.current);
          }} />
      </div>
      <div className={`transition-opacity duration-[1500ms] ${incognito ? 'pointer-events-none opacity-0' : ''}`}>
        <KillFeed kills={kills} />
      </div>
      {!editor && <JoinPanel lanAddress={lanAddress} />}
      {editor && (
        <MapEditor
          state={editor}
          onChange={changeEditor}
          onSave={(name: string): void => send({ t: 'save-preset', name })}
          onClose={(): void => setEditor(null)} />
      )}
      <IncognitoScreen
        on={incognito}
        status={musicStatus} />
      {!soundOn && !incognito && (
        <div className='pointer-events-none absolute bottom-sm right-sm flex items-center gap-xsm rounded-sm px-sm py-xsm font-pixel text-[10px] text-foreground-muted opacity-60'>
          <VolumeX size={12} />
          Click for sound
        </div>
      )}
      <div className='group absolute right-0 top-0 flex h-20 w-20 items-start justify-end p-sm'>
        <button
          type='button'
          aria-label='Open sidebar'
          className='rounded-md p-xsm text-foreground-muted opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100'
          onClick={(): void => setSidebarOpen(true)}>
          <ChevronLeft size={20} />
        </button>
      </div>
      {sidebarOpen && (
        <div
          className='absolute inset-0'
          onPointerDown={(): void => setSidebarOpen(false)} />
      )}
      <aside
        className={`absolute inset-y-0 right-0 scrollbar-none flex w-96 flex-col gap-lg overflow-y-auto border-l border-[var(--arw-glass-edge)] bg-[var(--arw-glass-pane)] p-lg backdrop-blur-md transition-transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!sidebarOpen}>
        <ControlPanel
          tab={tab}
          onTab={setTab}
          roster={roster}
          connected={status === 'open'}
          stats={stats}
          audio={audio}
          music={musicStatus}
          onAudio={setAudio}
          onToggle={(): void => music.current!.toggle()}
          onNext={(): void => music.current!.next()}
          onClaimMusic={musicHere ? undefined : (): void => send({ t: 'claim-music' })}
          onRemove={(index: number, id: string): void => music.current!.remove(index, id)}
          onMove={(index: number, id: string, delta: -1 | 1): void => music.current!.move(index, id, delta)}
          incognito={incognito}
          onIncognito={(on: boolean): void => {
            setIncognito(on);
            if (on) {
              setSidebarOpen(false);
            }
          }}
          onEditMap={(): void => {
            setIncognito(false);
            setSidebarOpen(false);
            setEditor(lastEditor.current);
          }}
          gameSettings={gameSettings}
          bloodMoon={bloodMoon}
          presets={presets}
          send={send} />
      </aside>
    </div>
  );
}

export default DisplayPage;
