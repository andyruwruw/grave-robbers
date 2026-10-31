// Packages
import React from 'react';
import WorldView from '@halloween/renderer/world/world-view';

// Types
import type { WorldCache } from '@halloween/controls/display/world-cache';
import type { DisplaySettings } from '@halloween/renderer/types/display-settings';
import type { TvMouseHandlers } from '@halloween/controls/types/mouse';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { Pane } from '../types/panes';

/**
 * Props for PaneGrid.
 */
interface PaneGridProps {
  /**
   * The panes to show.
   */
  panes: Pane[];

  /**
   * The mouse handlers, on the first pane.
   */
  mouse: TvMouseHandlers;

  /**
   * Each pane's renderer, by pane key, kept as panes mount and unmount.
   */
  renderers: React.RefObject<Map<string, WorldRenderer>>;

  /**
   * The world so far, for a new pane's renderer.
   */
  cache: WorldCache;

  /**
   * The interpolation delay for a new pane's renderer.
   */
  interp: number;

  /**
   * The TV's display settings, for a new pane's renderer.
   */
  display: DisplaySettings;

  /**
   * Points a pane's camera at its player, the spawn, or the whole map.
   */
  aim: (key: string, renderer: WorldRenderer) => void;
}

/**
 * The TV's panes in a grid (two columns from two panes, two rows from
 * three), each a world view, with the followed player's name when there's
 * more than one.
 *
 * @param {PaneGridProps} props - The panes and what their renderers need.
 * @returns {React.JSX.Element} The rendered grid.
 */
function PaneGrid({ panes, mouse, renderers, cache, interp, display, aim }: PaneGridProps): React.JSX.Element {
  return (
    <div className={`grid h-full w-full gap-[2px] bg-black ${panes.length > 1 ? 'grid-cols-2' : ''} ${panes.length > 2 ? 'grid-rows-2' : ''}`}>
      {panes.map((pane: Pane, index: number) => (
        <div
          key={pane.key}
          className='relative min-h-0 min-w-0'
          {...(index === 0 ? mouse : {})}>
          <WorldView
            className='h-full w-full'
            onReady={(renderer: WorldRenderer | null): void => {
              if (!renderer) {
                renderers.current.delete(pane.key);
                return;
              }
              renderers.current.set(pane.key, renderer);
              cache.prime(renderer);
              renderer.setInterpolation(interp);
              renderer.setDisplaySettings(display);
              renderer.setLocalPlayer(null);
              aim(pane.key, renderer);
            }} />
          {panes.length > 1 && (
            <div className='pointer-events-none absolute left-sm top-sm rounded-sm bg-black/50 px-sm py-xsm font-medium text-base text-foreground'>
              {pane.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PaneGrid;
