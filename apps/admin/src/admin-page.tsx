// Packages
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { MAP_WIDTH } from '@halloween/shared/world/dimensions';
import { REGROWTH_TILES } from '@halloween/shared/world/regrowth';
import { DEFAULT_GAME_SETTINGS, sameGameSettings } from '@halloween/shared/protocol/game-settings';
import { DEFAULT_DISPLAY_SETTINGS } from '@halloween/renderer/world/config/display-settings';
import GeneratingScreen from '@halloween/game-ui/components/screens/generating-screen';
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
import { useSocket } from '@halloween/ui/hooks/use-socket';

// Local Imports
import AdminDialog from './components/admin-dialog';
import AdminPageBody from './components/admin-page-body';
import AdminSidebar from './components/admin-sidebar';
import AdminWorld from './components/admin-world';
import OpenPanelButton from './components/open-panel-button';
import PageHeader from './components/page-header';
import { pageInfo } from './helpers/admin-pages';
import { useAdminCamera } from './hooks/use-admin-camera';
import { useSpawnMouse } from './hooks/use-spawn-mouse';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { TvPadEntry } from '@halloween/shared/protocol/pads';
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';
import type { CharacterInfo, WorldSlotInfo } from '@halloween/shared/saves/world-slots';
import type { RegrowthTile } from '@halloween/shared/world/regrowth';
import type { WorldEventKind, WorldEventState } from '@halloween/shared/world-events/types/world-events';
import type { DisplaySettings } from '@halloween/renderer/types/display-settings';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { AdminPageId } from './types/admin-pages';

/**
 * The admin console (`/admin`): the graveyard filling the screen, with
 * the TV's controls (no music) in a see-through panel over it, from a
 * laptop or a phone. The panel holds pages opened from a main menu (Admin
 * Controls), each under a header card with its icon, title, back button,
 * and close button (`AdminPageBody`); closed, a button brings it back. The
 * Item Catalogue and Knowledge Tree open as dialogs over the world
 * instead. The world view shows the whole map or follows a picked player
 * (`FollowPanel` on Players, with the TV view presets for how much ground;
 * `useAdminCamera`), and on a huge world asks the server for only that
 * player's surroundings. The mouse picks things up and carries a light
 * like the TV's (`useTvMouse`), puts down what the Spawn page picked where
 * it's clicked (`useSpawnMouse`), or edits the map while the Map page's
 * editor tab is open. Escape goes back to the menu, and the kill feed runs
 * over the view. It holds its own display settings (the defaults, with no
 * menu to change them) for the renderer, with no player of its own, and
 * the TPS, FPS, and server ticks overlay shows when they turn it on.
 *
 * @returns {React.JSX.Element} The rendered page.
 */
function AdminPage(): React.JSX.Element {
  const rendererRef = useRef<WorldRenderer | null>(null);
  const [cache] = useState((): WorldCache => new WorldCache());
  const { editor, changeEditor, open: openEditor, close: closeEditor } = useEditorState();
  const [page, setPage] = useState<AdminPageId>('menu');
  const { roster, offer: offerRoster } = useRoster();
  const [presets, setPresets] = useState<{ id: string; name: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [worldEvents, setWorldEvents] = useState<WorldEventKind[]>([]);
  const [pads, setPads] = useState<TvPadEntry[]>([]);
  const [regrowth, setRegrowth] = useState<Record<RegrowthTile, number>>({ tree: 0, hedge: 0, pumpkin: 0, chest: 0, rock: 0 });
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const { stats, latestStats } = useStatsTicker((): { fps: number; ping: number | null } => ({ fps: rendererRef.current?.fps ?? 0, ping: pingRef.current }));
  const { kills, addFeedEvents } = useKillFeed();
  const [huge, setHuge] = useState(false);
  const [display] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [panel, setPanel] = useState(true);
  const [spawnPick, setSpawnPick] = useState<SpawnKind | null>(null);
  const backRef = useRef<() => void>((): void => {});
  const [slots, setSlots] = useState<WorldSlotInfo[] | null>(null);
  const [characters, setCharacters] = useState<CharacterInfo[]>([]);

  useEffect(() => {
    /**
     * Goes back to the menu on Escape.
     *
     * @param e - The key event.
     */
    const keys = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        backRef.current();
      }
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, []);

  const { status, send, ping, pingRef } = useSocket<DisplayMessage>({
    hello: () => ({ t: 'hello-display', admin: true }),
    onMessage: (msg: DisplayMessage): void => {
      const renderer = rendererRef.current;
      switch (msg.t) {
        case 'display-welcome':
        case 'presets':
          setPresets(msg.presets);
          return;
        case 'generating':
          setGenerating(true);
          return;
        case 'world':
          setGenerating(false);
          cache.rememberWorld(msg);
          setHuge(msg.width > MAP_WIDTH);
          renderer?.setWorld(msg.seed, msg.width, msg.tiles, msg.levels, msg.ramps, msg.view);
          aimRef.current();
          return;
        case 'tiles':
          renderer?.applyTiles(msg.changes);
          return;
        case 'tv-pad-list':
          setPads(msg.pads);
          return;
        case 'world-slots':
          setSlots(msg.slots);
          setCharacters(msg.characters);
          return;
        case 'state':
          break;
        default:
          return;
      }
      cache.rememberPlayers(msg.players);
      if (renderer) {
        applyState(renderer, msg);
      }
      const events = msg.worldEvents.map((e: WorldEventState): WorldEventKind => e.kind);
      setWorldEvents((prev: WorldEventKind[]): WorldEventKind[] => (prev.join() === events.join() ? prev : events));
      setGameSettings((prev: GameSettings): GameSettings => (sameGameSettings(prev, msg.settings) ? prev : msg.settings));
      setRegrowth((prev: Record<RegrowthTile, number>): Record<RegrowthTile, number> => (REGROWTH_TILES.every((t: RegrowthTile): boolean => prev[t] === msg.regrowth[t]) ? prev : msg.regrowth));
      latestStats.current = { ...msg.stats, fps: 0, ping: null, monsters: msg.monsters.length, items: msg.items.length, worldEvents: events };
      addFeedEvents(msg.events);
      offerRoster(msg.players);
    },
  });

  const { follow, setFollow, view, setView, zoom, aimRef } = useAdminCamera(rendererRef, huge, editor, roster, status, send);

  useEffect(() => {
    if (page === 'worlds' && status === 'open') {
      send({ t: 'world-slots' });
    }
  }, [page, status, send]);

  const interp = interpDelay(ping);
  useEffect(() => {
    rendererRef.current?.setInterpolation(interp);
  }, [interp]);
  useEffect(() => {
    rendererRef.current?.setDisplaySettings(display);
  }, [display]);

  useEditorView(editor, (f: (renderer: WorldRenderer) => void): void => {
    if (rendererRef.current) {
      f(rendererRef.current);
    }
  });

  /**
   * Opens a page from the menu.
   *
   * @param next The page.
   */
  const open = (next: AdminPageId): void => {
    setPage(next);
  };

  /**
   * Goes back to the menu, closing the editor and putting down whatever
   * the Spawn page picked.
   */
  const back = (): void => {
    closeEditor();
    setSpawnPick(null);
    setPage('menu');
  };
  backRef.current = back;

  const { title, icon, wide } = pageInfo(page);
  const header = (
    <PageHeader
      title={title}
      icon={icon}
      onBack={page === 'menu' ? undefined : back}
      onClose={wide ? back : (): void => setPanel(false)} />
  );
  const body = (
    <AdminPageBody
      page={page}
      onOpen={open}
      roster={roster}
      connected={status === 'open'}
      stats={stats}
      pads={pads}
      gameSettings={gameSettings}
      worldEvents={worldEvents}
      presets={presets}
      regrowth={regrowth}
      follow={follow}
      onFollow={setFollow}
      huge={huge}
      view={view}
      onView={setView}
      spawnPick={spawnPick}
      onSpawnPick={setSpawnPick}
      editing={editor !== null}
      onEditing={(on: boolean): void => (on ? openEditor() : closeEditor())}
      slots={slots}
      characters={characters}
      send={send} />
  );

  const play = useTvMouse(rendererRef, gameSettings, send);
  const edit = useMapEditor(rendererRef, editor, cache.blends, changeEditor, send);
  const conjure = useSpawnMouse(rendererRef, spawnPick ?? 'tree', send);

  return (
    <div className='fixed inset-0 overflow-hidden bg-background'>
      <AdminWorld
        mouse={editor ? edit : spawnPick ? conjure : play}
        rendererRef={rendererRef}
        cache={cache}
        interp={interp}
        display={display}
        stats={latestStats}
        aimRef={aimRef}
        onZoom={zoom}
        kills={kills}
        editor={editor}
        onEditorChange={changeEditor}
        onSavePreset={(name: string): void => send({ t: 'save-preset', name })}
        onCloseEditor={closeEditor} />
      {wide ? (
        <AdminDialog onClose={back}>
          {header}
          {body}
        </AdminDialog>
      ) : panel ? (
        <AdminSidebar>
          {header}
          {body}
        </AdminSidebar>
      ) : (
        <OpenPanelButton onOpen={(): void => setPanel(true)} />
      )}
      {generating && <GeneratingScreen />}
    </div>
  );
}

export default AdminPage;
