// Packages
import React, { useEffect, useRef, useState } from 'react';
import { MAP_WIDTH } from '@halloween/shared/world/dimensions';
import { TV_VIEWS } from '@halloween/controls/config/tv-view';
import { loadTvView, saveTvView } from '@halloween/controls/helpers/tv-view';

// Local Imports
import { localPanes, panesFor } from '../helpers/panes';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { EditorState } from '@halloween/controls/types/map-editor';
import type { TvView } from '@halloween/controls/types/tv-view';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { SocketStatus } from '@halloween/ui/hooks/use-socket';
import type { Pane } from '../types/panes';
import type { StateMessage } from '../types/sound';

/**
 * What `usePanes` gives the TV page.
 */
export interface TvPanes {
  /**
   * Each pane's renderer, by pane key.
   */
  renderers: React.RefObject<Map<string, WorldRenderer>>;

  /**
   * Runs a function on every pane's renderer.
   */
  all: (f: (renderer: WorldRenderer) => void) => void;

  /**
   * The panes to show.
   */
  panes: Pane[];

  /**
   * The Game tab's TV view preset.
   */
  tvView: TvView;

  /**
   * Picks the TV view preset.
   */
  setTvView: (view: TvView) => void;

  /**
   * Points a pane's camera at its player, the spawn, or the whole map.
   */
  aim: (key: string, renderer: WorldRenderer) => void;

  /**
   * Takes a new world: whether it's huge, and every renderer's map.
   */
  onWorld: (msg: Extract<DisplayMessage, { t: 'world' }>) => void;

  /**
   * Takes a snapshot's local players on a huge world.
   */
  onLocals: (msg: StateMessage) => void;
}

/**
 * The TV's panes: one for the whole map on a classic map (or in the
 * editor), or, on a huge world, one per local player (the spawn when there
 * are none). Keeps each pane's renderer aimed, `rendererRef` on the first
 * pane, and the server told which players the panes follow.
 *
 * @param rendererRef - Set to the first pane's renderer (the mouse works it).
 * @param editor - The map editor's state, or null while it's closed.
 * @param status - The TV socket's status.
 * @param send - Sends on the TV socket.
 * @returns The panes and ways to update them.
 */
export function usePanes(rendererRef: React.RefObject<WorldRenderer | null>, editor: EditorState | null, status: SocketStatus, send: (msg: ClientMessage) => void): TvPanes {
  const renderers = useRef(new Map<string, WorldRenderer>());
  /**
   * Runs a function on every pane's renderer.
   *
   * @param f - What to run.
   */
  const all = (f: (renderer: WorldRenderer) => void): void => renderers.current.forEach(f);
  const [huge, setHuge] = useState(false);
  const hugeRef = useRef(false);
  const [locals, setLocals] = useState<Pane[]>([]);
  const [tvView, setTvView] = useState<TvView>(loadTvView);
  const tvViewRef = useRef(tvView);
  tvViewRef.current = tvView;
  const localsKey = useRef('');

  /**
   * Points a pane's renderer at what that pane follows.
   *
   * @param key - The pane's key.
   * @param renderer - The pane's renderer.
   */
  const aim = (key: string, renderer: WorldRenderer): void => {
    const pane = panesRef.current.find((p: Pane): boolean => p.key === key);
    if (!pane || pane.id === null) {
      renderer.setFollow(null);
    } else {
      renderer.setFollow(pane.id || null, TV_VIEWS.find(({ id }): boolean => id === tvViewRef.current)!.view, renderer.worldMap()?.spawnPoints()[0] ?? null);
    }
  };

  /**
   * Loads a new world into every pane.
   *
   * @param msg - The world message.
   */
  const onWorld = (msg: Extract<DisplayMessage, { t: 'world' }>): void => {
    hugeRef.current = msg.width > MAP_WIDTH;
    setHuge(hugeRef.current);
    renderers.current.forEach((renderer: WorldRenderer, key: string): void => {
      renderer.setWorld(msg.seed, msg.width, msg.tiles, msg.levels, msg.ramps, msg.view);
      aim(key, renderer);
    });
  };

  /**
   * Updates the local player panes when the players here change on a huge map.
   *
   * @param msg - The state message.
   */
  const onLocals = (msg: StateMessage): void => {
    const here = hugeRef.current ? localPanes(msg.players, msg.watched) : [];
    const hereKey = here.map((p: PlayerState): string => `${p.id}:${p.name}`).join(',');
    if (hereKey !== localsKey.current) {
      localsKey.current = hereKey;
      setLocals(here.map((p: PlayerState): Pane => ({ key: p.id, id: p.id, name: p.name })));
    }
  };

  const panes = panesFor(huge, editor, locals);
  const panesKey = panes.map((pane: Pane): string => pane.key).join(',');
  const panesRef = useRef(panes);
  panesRef.current = panes;

  useEffect(() => {
    rendererRef.current = renderers.current.get(panesRef.current[0]!.key) ?? null;
    renderers.current.forEach((renderer: WorldRenderer, key: string): void => aim(key, renderer));
    if (status === 'open') {
      send({ t: 'watch', ids: panesRef.current.flatMap((pane: Pane): string[] => (pane.id ? [pane.id] : [])) });
    }
  }, [panesKey, status, send]);

  useEffect(() => {
    saveTvView(tvView);
    renderers.current.forEach((renderer: WorldRenderer, key: string): void => aim(key, renderer));
  }, [tvView]);

  return { renderers, all, panes, tvView, setTvView, aim, onWorld, onLocals };
}
