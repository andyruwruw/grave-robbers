// Packages
import React, { useEffect, useRef } from 'react';
import { TICK_RATE } from '@halloween/shared/protocol/network';
import { useSocket } from '@halloween/ui/hooks/use-socket';
import { applyState } from '@halloween/controls/helpers/apply-state';
import { interpDelay } from '@halloween/controls/helpers/interp-delay';

// Local Imports
import { DEFAULT_PING_MS } from '../config/play';

// Types
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { WorldCache } from '@halloween/controls/display/world-cache';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { Predictor } from '../prediction/predictor';

/**
 * What `usePlayView` gives the page.
 */
export interface PlayView {
  /**
   * The viewer socket's round trip in ms, or null until the first one.
   */
  viewPing: number | null;

  /**
   * Takes the world view's renderer as it mounts (or null as it goes).
   */
  onReady: (renderer: WorldRenderer | null) => void;
}

/**
 * The /play screen's view of the world: a display socket that says it's
 * only a viewer (so it never takes the TV's music) and asks for just this
 * player's surroundings, feeding the renderer and checking the local
 * prediction against each snapshot. The camera follows the player at the
 * settings' zoom.
 *
 * @param cache - The world so far.
 * @param rendererRef - The world renderer.
 * @param predictor - The local prediction of this player.
 * @param playerId - The player's id, once joined.
 * @param zoom - Tiles of ground shown top to bottom.
 * @returns The ping and the world view's ready callback.
 */
export function usePlayView(cache: WorldCache, rendererRef: React.RefObject<WorldRenderer | null>, predictor: Predictor, playerId: string | null, zoom: number): PlayView {
  const playerIdRef = useRef<string | null>(null);
  const { ping: viewPing, pingRef: viewerPingRef, status: viewStatus, send: viewSend } = useSocket<DisplayMessage>({
    hello: () => ({ t: 'hello-display', viewer: true }),
    onMessage: (msg: DisplayMessage): void => {
      switch (msg.t) {
        case 'world':
          cache.rememberWorld(msg);
          rendererRef.current?.setWorld(msg.seed, msg.width, msg.tiles, msg.levels, msg.ramps, msg.view);
          return;
        case 'tiles':
          rendererRef.current?.applyTiles(msg.changes);
          return;
        case 'state': {
          const r = rendererRef.current;
          cache.rememberPlayers(msg.players);
          const me = msg.players.find((p: PlayerState): boolean => p.id === playerIdRef.current);
          if (me) {
            predictor.reconcile(me, performance.now() / 1000, (viewerPingRef.current ?? DEFAULT_PING_MS) / 1000 + 0.5 / TICK_RATE);
          }
          if (r) {
            applyState(r, msg);
          }
          return;
        }
        default:
      }
    },
  });

  playerIdRef.current = playerId;
  useEffect(() => {
    if (viewStatus === 'open') {
      viewSend({ t: 'watch', ids: playerId ? [playerId] : [] });
    }
  }, [viewStatus, viewSend, playerId]);
  const interp = interpDelay(viewPing);
  useEffect(() => {
    rendererRef.current?.setInterpolation(interp);
  }, [interp]);
  useEffect(() => {
    rendererRef.current?.setFollow(playerId, zoom);
  }, [playerId, zoom]);

  /**
   * Keeps the renderer, fills it from the cache, and points it at the player.
   *
   * @param renderer - The renderer, or null when it goes away.
   */
  const onReady = (renderer: WorldRenderer | null): void => {
    rendererRef.current = renderer;
    if (renderer) {
      cache.prime(renderer);
    }
    renderer?.setFollow(playerId, zoom);
    renderer?.setInterpolation(interp);
  };

  return { viewPing, onReady };
}
