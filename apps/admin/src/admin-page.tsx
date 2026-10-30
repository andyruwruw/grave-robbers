// Packages
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { MAP_WIDTH } from '@halloween/shared/world/dimensions';
import { DEFAULT_GAME_SETTINGS, sameGameSettings } from '@halloween/shared/protocol/game-settings';
import ControlPanel from '@halloween/controls/components/control-panel/control-panel';
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
import AdminSidebar from './components/admin-sidebar';
import AdminWorld from './components/admin-world';
import FollowPanel from './components/follow-panel';
import { useAdminCamera } from './hooks/use-admin-camera';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { TvPadEntry } from '@halloween/shared/protocol/pads';
import type { ControlTab } from '@halloween/controls/types/control-panel';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * The admin console (`/admin`): the graveyard with the TV's controls
 * beside it (Overview and Game, no music), from a laptop or a phone. The
 * world view shows the whole map or follows a picked player
 * (`FollowPanel`, with the TV view presets for how much ground;
 * `useAdminCamera`), and on a huge world asks the server for only that
 * player's surroundings. The mouse picks things up and carries a light
 * like the TV's (`useTvMouse`), the map editor opens from the Game tab,
 * and the kill feed runs over the view. Stacked on a narrow screen, side
 * by side on a wide one.
 *
 * @returns {React.JSX.Element} The rendered page.
 */
function AdminPage(): React.JSX.Element {
  const rendererRef = useRef<WorldRenderer | null>(null);
  const [cache] = useState((): WorldCache => new WorldCache());
  const { editor, changeEditor, open: openEditor, close: closeEditor } = useEditorState();
  const [tab, setTab] = useState<ControlTab>('overview');
  const { roster, offer: offerRoster } = useRoster();
  const [presets, setPresets] = useState<{ id: string; name: string }[]>([]);
  const [bloodMoon, setBloodMoon] = useState(false);
  const [pads, setPads] = useState<TvPadEntry[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const { stats, latestStats } = useStatsTicker((): { fps: number; ping: number | null } => ({ fps: rendererRef.current?.fps ?? 0, ping: pingRef.current }));
  const { kills, addFeedEvents } = useKillFeed();
  const [huge, setHuge] = useState(false);

  useEffect(() => {
    /**
     * Closes the editor on Escape.
     *
     * @param e - The key event.
     */
    const keys = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        closeEditor();
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
        case 'world':
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
        case 'state':
          break;
        default:
          return;
      }
      cache.rememberPlayers(msg.players);
      if (renderer) {
        applyState(renderer, msg);
      }
      setBloodMoon(msg.bloodMoon);
      setGameSettings((prev: GameSettings): GameSettings => (sameGameSettings(prev, msg.settings) ? prev : msg.settings));
      latestStats.current = { ...msg.stats, fps: 0, ping: null, monsters: msg.monsters.length, items: msg.items.length, bloodMoon: msg.bloodMoon };
      addFeedEvents(msg.events);
      offerRoster(msg.players);
    },
  });

  const { follow, setFollow, view, setView, aimRef } = useAdminCamera(rendererRef, huge, editor, roster, status, send);

  const interp = interpDelay(ping);
  useEffect(() => {
    rendererRef.current?.setInterpolation(interp);
  }, [interp]);

  useEditorView(editor, (f: (renderer: WorldRenderer) => void): void => {
    if (rendererRef.current) {
      f(rendererRef.current);
    }
  });

  const play = useTvMouse(rendererRef, gameSettings, send);
  const edit = useMapEditor(rendererRef, editor, cache.blends, changeEditor, send);

  return (
    <div className='fixed inset-0 flex flex-col overflow-hidden bg-background md:flex-row'>
      <AdminWorld
        mouse={editor ? edit : play}
        rendererRef={rendererRef}
        cache={cache}
        interp={interp}
        aimRef={aimRef}
        kills={kills}
        editor={editor}
        onEditorChange={changeEditor}
        onSavePreset={(name: string): void => send({ t: 'save-preset', name })}
        onCloseEditor={closeEditor} />
      <AdminSidebar>
        <FollowPanel
          players={roster}
          follow={follow}
          onFollow={setFollow}
          huge={huge}
          view={view}
          onView={setView} />
        <ControlPanel
          tab={tab}
          onTab={setTab}
          roster={roster}
          connected={status === 'open'}
          stats={stats}
          onEditMap={openEditor}
          gameSettings={gameSettings}
          bloodMoon={bloodMoon}
          presets={presets}
          pads={pads}
          send={send} />
      </AdminSidebar>
    </div>
  );
}

export default AdminPage;
