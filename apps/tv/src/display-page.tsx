// Packages
import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_GAME_SETTINGS, sameGameSettings } from '@halloween/shared/protocol/game-settings';
import { useSocket } from '@halloween/ui/hooks/use-socket';
import ControlPanel from '@halloween/controls/components/control-panel/control-panel';
import KillFeed from '@halloween/controls/components/feed/kill-feed';
import MapEditor from '@halloween/controls/components/map-editor/map-editor';
import { WorldCache } from '@halloween/controls/display/world-cache';
import { applyState } from '@halloween/controls/helpers/apply-state';
import { interpDelay } from '@halloween/controls/helpers/interp-delay';
import { useEditorState } from '@halloween/controls/hooks/use-editor-state';
import { useEditorView } from '@halloween/controls/hooks/use-editor-view';
import { useKillFeed } from '@halloween/controls/hooks/use-kill-feed';
import { useMapEditor } from '@halloween/controls/hooks/use-map-editor';
import { useRoster } from '@halloween/controls/hooks/use-roster';
import { useStatsTicker } from '@halloween/controls/hooks/use-stats-ticker';
import { useTvMouse } from '@halloween/controls/hooks/use-tv-mouse';

// Local Imports
import IncognitoScreen from './components/incognito-screen';
import JoinPanel from './components/join-panel';
import PaneGrid from './components/pane-grid';
import Sidebar from './components/sidebar';
import SoundHint from './components/sound-hint';
import { SPOTIFY_RETURN } from './helpers/audio-settings';
import { usePanes } from './hooks/use-panes';
import { useTvKeys } from './hooks/use-tv-keys';
import { useTvMusic } from './hooks/use-tv-music';
import { useTvPads } from './hooks/use-tv-pads';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { TvPadEntry } from '@halloween/shared/protocol/pads';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { ControlTab } from '@halloween/controls/types/control-panel';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * TV page: the graveyard fills the screen with only a small join QR. The
 * sidebar, opened from a chevron that appears when hovering the top-right
 * corner, holds the controls (`ControlPanel`, also on `/admin`): Overview
 * (players and stats), Music, and Game (testing controls and reset). The
 * TV owns the music (`useTvMusic`): it applies what the admin page asks for (relayed by
 * the server) and reports back what's playing. Snapshots go straight to the renderer and
 * the sound director, bypassing React. Browsers keep audio
 * off until someone clicks or presses a key, so a faded hint sits in the
 * corner until then. Incognito (off when the page opens; toggled from the
 * Music tab) puts a now-playing
 * screen over the live graveyard, hides the kill feed, and silences
 * the game, fading away as soon as a phone joins (or on Escape); the I key
 * toggles it. Letter keys work the Game tab too (`useTvKeys`, `GAME_KEYS`: U all
 * unlocks, F free crafting, A aggressive monsters, T test player, L
 * lights, D day, B blood moon, K kill every monster). The
 * mouse can pick up players and monsters and carry a light (`useTvMouse`),
 * or, with the map editor open (from the Game tab), edit the map
 * (`useMapEditor`, `MapEditor`). Game controllers plugged into the TV
 * machine can be claimed from a phone (`useTvPads`). A huge world splits
 * the screen into a pane per local player (one not followed by a /play
 * screen), up to `MAX_PANES`, and asks the server for only their
 * surroundings; the mouse works the first pane (`usePanes`). How much each pane shows
 * is the Game tab's TV view preset (`saveTvView`, kept per browser).
 * Clicking outside the open sidebar closes it.
 *
 * @returns {React.JSX.Element} The rendered page.
 */
function DisplayPage(): React.JSX.Element {
  const rendererRef = useRef<WorldRenderer | null>(null);
  const [cache] = useState((): WorldCache => new WorldCache());
  const { editor, changeEditor, open: openEditor, close: closeEditor } = useEditorState();
  const editingRef = useRef(false);
  const { roster, offer: offerRoster } = useRoster();
  const [lanAddress, setLanAddress] = useState<string | null>(null);
  const [presets, setPresets] = useState<{ id: string; name: string }[]>([]);
  const { kills, addFeedEvents } = useKillFeed();
  const [sidebarOpen, setSidebarOpen] = useState(SPOTIFY_RETURN);
  const [incognito, setIncognito] = useState(false);
  const connectedIds = useRef<Set<string> | null>(null);
  const [bloodMoon, setBloodMoon] = useState(false);
  const [pads, setPads] = useState<TvPadEntry[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [tab, setTab] = useState<ControlTab>(SPOTIFY_RETURN ? 'music' : 'overview');
  const { stats, latestStats } = useStatsTicker((): { fps: number; ping: number | null } => ({ fps: rendererRef.current?.fps ?? 0, ping: pingRef.current }), sidebarOpen && tab === 'overview', true);
  const { audio, musicStatus, musicHere, soundOn, director, applyControl, onOwner, buildControls } = useTvMusic(incognito, setIncognito);

  const sendRef = useRef<typeof send>((): void => {});
  const settingsRef = useRef(gameSettings);
  settingsRef.current = gameSettings;
  useTvKeys(sendRef, settingsRef, editingRef, setIncognito, closeEditor);

  const padClaims = useRef<(indices: number[]) => void>((): void => {});
  const { status, send, ping, pingRef } = useSocket<DisplayMessage>({
    hello: () => ({ t: 'hello-display' }),
    onMessage: (msg: DisplayMessage): void => {
      switch (msg.t) {
        case 'display-welcome':
          setLanAddress(msg.lanAddress);
          setPresets(msg.presets);
          return;
        case 'world':
          cache.rememberWorld(msg);
          onWorld(msg);
          director.current.onWorld(msg.width, msg.tiles, msg.levels, msg.ramps);
          return;
        case 'tiles':
          all((renderer: WorldRenderer): void => renderer.applyTiles(msg.changes));
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
        case 'tv-pad-list':
          setPads(msg.pads);
          return;
        case 'music-owner':
          onOwner(msg.owner);
          return;
        case 'pad-claims':
          padClaims.current(msg.indices);
          return;
      }
      director.current.onState(msg);
      cache.rememberPlayers(msg.players);
      all((renderer: WorldRenderer): void => applyState(renderer, msg));
      onLocals(msg);
      setBloodMoon(msg.bloodMoon);
      setGameSettings((prev: GameSettings): GameSettings => (sameGameSettings(prev, msg.settings) ? prev : msg.settings));
      latestStats.current = { ...msg.stats, fps: 0, ping: null, monsters: msg.monsters.length, items: msg.items.length, bloodMoon: msg.bloodMoon };
      addFeedEvents(msg.events);
      const connected = new Set(msg.players.filter((p: PlayerState): boolean => p.connected).map((p: PlayerState): string => p.id));
      if (connectedIds.current && [...connected].some((id: string): boolean => !connectedIds.current!.has(id))) {
        setIncognito(false);
      }
      connectedIds.current = connected;
      offerRoster(msg.players);
    },
  });
  sendRef.current = send;
  const interp = interpDelay(ping);
  useEffect(() => {
    all((renderer: WorldRenderer): void => renderer.setInterpolation(interp));
  }, [interp]);
  padClaims.current = useTvPads(status, send);

  useEffect(() => {
    if (status === 'open') {
      send({ t: 'tv-status', status: { audio, music: musicStatus, incognito } });
    }
  }, [status, send, audio, musicStatus, incognito]);

  const { renderers, all, panes, tvView, setTvView, aim, onWorld, onLocals } = usePanes(rendererRef, editor, status, send);
  useEditorView(editor, all);

  const play = useTvMouse(rendererRef, gameSettings, send);
  const edit = useMapEditor(rendererRef, editor, cache.blends, changeEditor, send);
  const mouse = editor ? edit : play;
  editingRef.current = editor !== null;

  return (
    <div className='fixed inset-0 overflow-hidden bg-background'>
      <PaneGrid
        panes={panes}
        mouse={mouse}
        renderers={renderers}
        cache={cache}
        interp={interp}
        aim={aim} />
      <div className={`transition-opacity duration-[1500ms] ${incognito ? 'pointer-events-none opacity-0' : ''}`}>
        <KillFeed kills={kills} />
      </div>
      {!editor && <JoinPanel lanAddress={lanAddress} />}
      {editor && (
        <MapEditor
          state={editor}
          onChange={changeEditor}
          onSave={(name: string): void => send({ t: 'save-preset', name })}
          onClose={closeEditor} />
      )}
      <IncognitoScreen
        on={incognito}
        status={musicStatus} />
      {!soundOn && !incognito && <SoundHint />}
      <Sidebar
        open={sidebarOpen}
        onOpen={setSidebarOpen}>
        <ControlPanel
          tab={tab}
          onTab={setTab}
          roster={roster}
          connected={status === 'open'}
          stats={stats}
          music={buildControls(send, (): void => setSidebarOpen(false))}
          shortcuts
          localPads
          onEditMap={(): void => {
            setIncognito(false);
            setSidebarOpen(false);
            openEditor();
          }}
          gameSettings={gameSettings}
          bloodMoon={bloodMoon}
          presets={presets}
          pads={pads}
          tvView={tvView}
          onTvView={setTvView}
          send={send} />
      </Sidebar>
    </div>
  );
}

export default DisplayPage;
