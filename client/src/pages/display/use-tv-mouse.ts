// Packages
import React, { useRef } from 'react';

// Types
import type {
  ClientMessage,
  GameSettings,
  LiftTarget,
} from '@halloween/shared/protocol';
import type { WorldRenderer } from './renderer/world-renderer';

/**
 * Fewest ms between position updates sent while dragging or carrying the
 * light.
 */
const SEND_MS = 33;

/**
 * Pointer handlers for the TV's map.
 */
export interface TvMouseHandlers {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
  onWheel?: (e: React.WheelEvent<HTMLDivElement>) => void;
}

/**
 * The TV's mouse on the map, each part switched on from the Game tab: the
 * left button picks up a player or monster and drops it wherever it's let
 * go (the server finds the nearest spot it can stand), and holding the
 * right button carries a light that follows the cursor.
 *
 * @param {React.RefObject<WorldRenderer | null>} renderer - The TV's renderer, for picking.
 * @param {GameSettings} settings - The server's switches.
 * @param {(msg: ClientMessage) => void} send - Sends to the server.
 * @returns {TvMouseHandlers} Handlers for the element over the map.
 */
export function useTvMouse(
  renderer: React.RefObject<WorldRenderer | null>,
  settings: GameSettings,
  send: (msg: ClientMessage) => void,
): TvMouseHandlers {
  const lifting = useRef<LiftTarget | null>(null);
  const lighting = useRef(false);
  const lastSent = useRef(0);

  const lift = (e: React.PointerEvent<HTMLDivElement>, drop: boolean): void => {
    const { x, y } = renderer.current!.groundAt(e.clientX, e.clientY);
    send({ t: 'tv-lift', target: lifting.current!, x, y, drop });
  };

  const light = (e: React.PointerEvent<HTMLDivElement>): void => {
    send({ t: 'tv-light', at: renderer.current!.groundAt(e.clientX, e.clientY) });
  };

  const end = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (lifting.current && e.button !== 2) {
      lift(e, true);
      lifting.current = null;
    }
    if (lighting.current && (e.button === 2 || e.type === 'pointercancel')) {
      send({ t: 'tv-light', at: null });
      lighting.current = false;
    }
  };

  return {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>): void => {
      if (!renderer.current) {
        return;
      }
      if (e.button === 0 && settings.tvDrag) {
        const target = renderer.current.entityAt(e.clientX, e.clientY);
        if (target) {
          lifting.current = target;
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.style.cursor = 'grabbing';
          lift(e, false);
        }
      } else if (e.button === 2 && settings.tvLight) {
        lighting.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        light(e);
      }
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>): void => {
      if (!renderer.current) {
        return;
      }
      if (!lifting.current && !lighting.current) {
        e.currentTarget.style.cursor = settings.tvDrag && renderer.current.entityAt(e.clientX, e.clientY) ? 'grab' : '';
        return;
      }
      const now = performance.now();
      if (now - lastSent.current < SEND_MS) {
        return;
      }
      lastSent.current = now;
      if (lifting.current) {
        lift(e, false);
      }
      if (lighting.current) {
        light(e);
      }
    },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>): void => {
      if (renderer.current) {
        end(e);
      }
      e.currentTarget.style.cursor = '';
    },
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>): void => {
      if (renderer.current) {
        end(e);
      }
    },
    onContextMenu: (e: React.MouseEvent<HTMLDivElement>): void => {
      if (settings.tvLight) {
        e.preventDefault();
      }
    },
  };
}
