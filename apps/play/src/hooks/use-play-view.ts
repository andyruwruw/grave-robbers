// Packages
import React, { useEffect, useRef, useState } from 'react';
import { TICK_RATE } from '@halloween/shared/protocol/network';
import { useSocket } from '@halloween/ui/hooks/use-socket';
import { applyState } from '@halloween/controls/helpers/apply-state';
import { interpDelay } from '@halloween/controls/helpers/interp-delay';

// Local Imports
import { DEFAULT_PING_MS } from '../config/play';
import { playPixelScale } from '../helpers/pixel-scale';

// Types
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { ServerStats } from '@halloween/shared/protocol/server-stats';
import type { WorldCache } from '@halloween/controls/display/world-cache';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { Predictor } from '../prediction/predictor';
import type { PlaySettings } from '../types/play';

/**
 * What `usePlayView` gives the page.
 */
export interface PlayView {
  /**
   * The viewer socket's round trip in ms, or null until the first one.
   */
  viewPing: number | null;

  /**
   * The latest snapshot's server stats (for the TPS and tick overlays),
   * written from the socket without a render.
   */
  serverStats: React.RefObject<ServerStats | null>;

  /**
   * Takes the world view's renderer as it mounts (or null as it goes).
   */
  onReady: (renderer: WorldRenderer | null) => void;

  /**
   * Whether the server is generating a new huge world (from `generating`
   * until the `world` that follows).
   */
  generating: boolean;
}

/**
 * The /play screen's view of the world: a display socket that says it's
 * only a viewer (so it never takes the TV's music) and asks for just this
 * player's surroundings, feeding the renderer and checking the local
 * prediction against each snapshot. The camera follows the player at the
 * settings' zoom, pixel size, and camera lead and its speed, and the
 * renderer draws with the settings' display settings (camera angle
 * included) with this player as its own.
 *
 * @param cache - The world so far.
 * @param rendererRef - The world renderer.
 * @param predictor - The local prediction of this player.
 * @param playerId - The player's id, once joined.
 * @param settings - The screen's settings.
 * @returns The ping, the server stats, the world view's ready callback, and whether a world is generating.
 */
export function usePlayView(cache: WorldCache, rendererRef: React.RefObject<WorldRenderer | null>, predictor: Predictor, playerId: string | null, settings: PlaySettings): PlayView {
  const { zoom, pixelSize, display, cameraLead, cameraLeadSpeed } = settings;
  const playerIdRef = useRef<string | null>(null);
  const serverStats = useRef<ServerStats | null>(null);
  const [generating, setGenerating] = useState(false);
  const { ping: viewPing, pingRef: viewerPingRef, status: viewStatus, send: viewSend } = useSocket<DisplayMessage>({
    hello: () => ({ t: 'hello-display', viewer: true }),
    onMessage: (msg: DisplayMessage): void => {
      switch (msg.t) {
        case 'generating':
          setGenerating(true);
          return;
        case 'world':
          setGenerating(false);
          cache.rememberWorld(msg);
          rendererRef.current?.setWorld(msg.seed, msg.width, msg.tiles, msg.levels, msg.ramps, msg.view);
          return;
        case 'tiles':
          rendererRef.current?.applyTiles(msg.changes);
          return;
        case 'state': {
          const r = rendererRef.current;
          cache.rememberPlayers(msg.players);
          serverStats.current = msg.stats;
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
  useEffect(() => {
    rendererRef.current?.setPixelScale(playPixelScale(zoom, pixelSize));
  }, [zoom, pixelSize]);
  useEffect(() => {
    rendererRef.current?.setDisplaySettings(display);
  }, [display]);
  useEffect(() => {
    rendererRef.current?.setLocalPlayer(playerId);
  }, [playerId]);
  useEffect(() => {
    rendererRef.current?.setFollowLead(cameraLead);
  }, [cameraLead]);
  useEffect(() => {
    rendererRef.current?.setFollowLeadSpeed(cameraLeadSpeed);
  }, [cameraLeadSpeed]);

  /**
   * Keeps the renderer, fills it from the cache, applies the display
   * settings (its camera angle among them) and this player as its own, and
   * points it at the player with room ahead of them (the Camera lead).
   *
   * @param renderer - The renderer, or null when it goes away.
   */
  const onReady = (renderer: WorldRenderer | null): void => {
    rendererRef.current = renderer;
    if (renderer) {
      cache.prime(renderer);
    }
    renderer?.setDisplaySettings(display);
    renderer?.setLocalPlayer(playerId);
    renderer?.setFollowLead(cameraLead);
    renderer?.setFollowLeadSpeed(cameraLeadSpeed);
    renderer?.setPixelScale(playPixelScale(zoom, pixelSize));
    renderer?.setFollow(playerId, zoom);
    renderer?.setInterpolation(interp);
  };

  return { viewPing, serverStats, onReady, generating };
}
