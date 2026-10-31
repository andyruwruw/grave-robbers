// Packages
import React, { useEffect, useRef, useState } from 'react';
import { TV_VIEWS } from '@halloween/controls/config/tv-view';

// Local Imports
import {
  HUGE_START_TALL,
  MAX_TALL_MAPS,
  MIN_TALL,
  PAN_SPEED,
  ZOOM_RATE,
} from '../config/camera';
import { useAdminPan } from './use-admin-pan';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { EditorState } from '@halloween/controls/types/map-editor';
import type { TvView } from '@halloween/controls/types/tv-view';
import type { FollowView } from '@halloween/renderer/types/camera';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { SocketStatus } from '@halloween/ui/hooks/use-socket';

/**
 * What `useAdminCamera` gives the admin page.
 */
export interface AdminCamera {
  /**
   * The followed player's id, or null for the whole map (a huge world's spawn).
   */
  follow: string | null;

  /**
   * Follows a player, or the whole map (null).
   */
  setFollow: (id: string | null) => void;

  /**
   * How much ground shows while following.
   */
  view: TvView;

  /**
   * Picks how much ground shows (dropping any wheel zoom).
   */
  setView: (view: TvView) => void;

  /**
   * Zooms by a wheel's turn (out for positive).
   */
  zoom: (deltaY: number) => void;

  /**
   * Points the camera as it should be now, with the latest values.
   */
  aimRef: React.RefObject<() => void>;
}

/**
 * The admin console's camera: the whole map, a followed player, or a free
 * point (a huge world starts on its spawn, HUGE_START_TALL tiles tall),
 * with the TV view presets or the wheel's own zoom for how much ground,
 * re-aimed as any of that changes. WASD pans whenever the view is smaller
 * than the whole map (leaving a followed player where they stand), and the
 * wheel zooms in to MIN_TALL or out as far as wanted (the renderer drops
 * detail as it goes, see `OVERVIEW_TALL`). Stops following a player who
 * leaves, and on a huge world asks the server for only the followed
 * player's surroundings.
 *
 * @param rendererRef - The world view's renderer.
 * @param huge - Whether the world is huge.
 * @param editor - The map editor's state, or null while it's closed.
 * @param roster - Everyone in the game.
 * @param status - The socket's status.
 * @param send - Sends on the socket.
 * @returns The camera's state, its controls, and the aim ref.
 */
export function useAdminCamera(
  rendererRef: React.RefObject<WorldRenderer | null>,
  huge: boolean,
  editor: EditorState | null,
  roster: PlayerState[],
  status: SocketStatus,
  send: (msg: ClientMessage) => void,
): AdminCamera {
  const [follow, setFollowing] = useState<string | null>(null);
  const [view, setPreset] = useState<TvView>('close');
  const [free, setFree] = useState<{ x: number; y: number } | null>(null);
  const [tall, setTall] = useState<number | null>(null);
  const aimRef = useRef<() => void>((): void => {});
  const panRef = useRef<(dx: number, dy: number, dt: number, fast: boolean) => void>((): void => {});

  useEffect(() => {
    setFree(null);
    setTall(huge ? HUGE_START_TALL : null);
  }, [huge]);

  /**
   * How much ground shows: the wheel's zoom, else the picked preset.
   * @returns The view.
   */
  const size = (): FollowView => tall ?? TV_VIEWS.find(({ id }): boolean => id === view)!.view;

  /**
   * Tiles tall the view is now, the whole map's height when it frames it.
   * @returns The height.
   */
  const tallNow = (): number => {
    const s = size();
    return follow || free || huge ? (typeof s === 'number' ? s : s.h) : rendererRef.current?.worldMap()?.height ?? 0;
  };

  /**
   * Points the camera at the followed player, the free point, or the whole
   * map (a huge world's spawn), unless the map editor has it framing
   * everything.
   */
  aimRef.current = (): void => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    const spawn = renderer.worldMap()?.spawnPoints()[0] ?? null;
    if (editor) {
      renderer.setFollow(null);
    } else if (follow) {
      renderer.setFollow(follow, size(), spawn);
    } else if (free || huge) {
      renderer.setFollow(null, size(), free ?? spawn);
    } else {
      renderer.setFollow(null);
    }
  };

  /**
   * One frame of WASD: moves the free point (starting from wherever the
   * camera looks, so a followed player is left behind), kept on the map.
   * Does nothing while the whole map shows.
   */
  panRef.current = (dx: number, dy: number, dt: number, fast: boolean): void => {
    const renderer = rendererRef.current;
    const map = renderer?.worldMap();
    const from = free ?? (follow || huge ? renderer?.viewCenter() : null);
    if (!map || !from) {
      return;
    }
    const step = tallNow() * PAN_SPEED * dt * (fast ? 2 : 1);
    setFollowing(null);
    setFree({ x: Math.max(0, Math.min(map.width, from.x + dx * step)), y: Math.max(0, Math.min(map.height, from.y + dy * step)) });
  };

  useAdminPan(!editor, panRef);

  useEffect(() => {
    aimRef.current();
  }, [follow, view, huge, editor, free, tall]);

  useEffect(() => {
    if (follow && !roster.some((p: PlayerState): boolean => p.id === follow)) {
      setFollowing(null);
    }
  }, [roster, follow]);

  useEffect(() => {
    if (status === 'open') {
      send({ t: 'watch', ids: huge && follow && !editor ? [follow] : [] });
    }
  }, [status, send, huge, follow, editor]);

  /**
   * Follows a player, or goes back to the whole map (a huge world's spawn),
   * dropping the free point and the wheel's zoom.
   * @param id The player, or null.
   */
  const setFollow = (id: string | null): void => {
    setFollowing(id);
    setFree(null);
    setTall(huge ? HUGE_START_TALL : null);
  };

  /**
   * Picks a preset, dropping the wheel's zoom.
   * @param next The preset.
   */
  const setView = (next: TvView): void => {
    setPreset(next);
    setTall(null);
  };

  /**
   * Zooms by a wheel's turn. From the whole map it starts a free view on
   * the map's middle, so it can zoom in (or out past the map).
   * @param deltaY The wheel's turn.
   */
  const zoom = (deltaY: number): void => {
    const map = rendererRef.current?.worldMap();
    if (!map || editor) {
      return;
    }
    if (!follow && !free && !huge) {
      setFree({ x: map.width / 2, y: map.height / 2 });
    }
    const most = Math.max(map.width, map.height) * MAX_TALL_MAPS;
    setTall(Math.max(MIN_TALL, Math.min(most, tallNow() * Math.exp(deltaY * ZOOM_RATE))));
  };

  return { follow, setFollow, view, setView, zoom, aimRef };
}
