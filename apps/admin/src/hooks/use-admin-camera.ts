// Packages
import React, { useEffect, useRef, useState } from 'react';
import { TV_VIEWS } from '@halloween/controls/config/tv-view';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { EditorState } from '@halloween/controls/types/map-editor';
import type { TvView } from '@halloween/controls/types/tv-view';
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
   * Picks how much ground shows.
   */
  setView: (view: TvView) => void;

  /**
   * Points the camera as it should be now, with the latest values.
   */
  aimRef: React.RefObject<() => void>;
}

/**
 * The admin console's camera: the whole map or a followed player (with the
 * TV view presets for how much ground), re-aimed as any of that changes.
 * Stops following a player who leaves, and on a huge world asks the server
 * for only the followed player's surroundings.
 *
 * @param rendererRef - The world view's renderer.
 * @param huge - Whether the world is huge.
 * @param editor - The map editor's state, or null while it's closed.
 * @param roster - Everyone in the game.
 * @param status - The socket's status.
 * @param send - Sends on the socket.
 * @returns The camera's state and the aim ref.
 */
export function useAdminCamera(
  rendererRef: React.RefObject<WorldRenderer | null>,
  huge: boolean,
  editor: EditorState | null,
  roster: PlayerState[],
  status: SocketStatus,
  send: (msg: ClientMessage) => void,
): AdminCamera {
  const [follow, setFollow] = useState<string | null>(null);
  const [view, setView] = useState<TvView>('close');
  const aimRef = useRef<() => void>((): void => {});

  /**
   * Points the camera at the followed player, or the whole map (a huge
   * world's spawn), unless the map editor has it framing everything.
   */
  aimRef.current = (): void => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    const size = TV_VIEWS.find(({ id }): boolean => id === view)!.view;
    if (editor) {
      renderer.setFollow(null);
    } else if (follow) {
      renderer.setFollow(follow, size, renderer.worldMap()?.spawnPoints()[0] ?? null);
    } else if (huge) {
      renderer.setFollow(null, size, renderer.worldMap()?.spawnPoints()[0] ?? null);
    } else {
      renderer.setFollow(null);
    }
  };

  useEffect(() => {
    aimRef.current();
  }, [follow, view, huge, editor]);

  useEffect(() => {
    if (follow && !roster.some((p: PlayerState): boolean => p.id === follow)) {
      setFollow(null);
    }
  }, [roster, follow]);

  useEffect(() => {
    if (status === 'open') {
      send({ t: 'watch', ids: huge && follow && !editor ? [follow] : [] });
    }
  }, [status, send, huge, follow, editor]);

  return { follow, setFollow, view, setView, aimRef };
}
