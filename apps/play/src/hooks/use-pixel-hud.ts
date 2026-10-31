// Packages
import React, { useEffect } from 'react';

// Local Imports
import { HUD_PIXEL_SHARE } from '../config/play';
import { collectHud, hudKey, paintHud } from '../helpers/paint-hud';

// Types
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * Draws the top bar's hearts and counts pixelated instead of as crisp
 * HTML: every frame it reads what's under the bar's `[data-hud-paint]`
 * groups (kept invisible), and when that or the pixelation changed paints
 * it onto a low-res canvas laid over the world and stretched without
 * smoothing. Its pixels are HUD_PIXEL_SHARE of the world's
 * (`WorldRenderer.pixelScale`), so it reads a little sharper than the
 * graveyard. Anything outside those groups (the ping) stays plain HTML.
 *
 * @param rendererRef - The world renderer.
 * @param rootRef - The top bar.
 */
export function usePixelHud(rendererRef: React.RefObject<WorldRenderer | null>, rootRef: React.RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', imageRendering: 'pixelated', pointerEvents: 'none' });
    const ctx = canvas.getContext('2d');
    let last = '';
    let frame = 0;
    /**
     * Repaints the HUD canvas when what it shows changed.
     */
    const tick = (): void => {
      frame = requestAnimationFrame(tick);
      const renderer = rendererRef.current;
      const root = rootRef.current;
      if (!renderer || !root || !ctx) {
        return;
      }
      if (canvas.parentElement !== renderer.container) {
        renderer.container.appendChild(canvas);
        last = '';
      }
      const pixel = Math.max(1, renderer.pixelScale * HUD_PIXEL_SHARE);
      const width = Math.max(1, Math.round(window.innerWidth / pixel));
      const height = Math.max(1, Math.round(window.innerHeight / pixel));
      const draws = collectHud(root);
      const key = `${width}x${height}|${hudKey(draws)}`;
      if (key === last) {
        return;
      }
      last = key;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      paintHud(ctx, draws, width / window.innerWidth);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      canvas.remove();
    };
  }, [rendererRef, rootRef]);
}
