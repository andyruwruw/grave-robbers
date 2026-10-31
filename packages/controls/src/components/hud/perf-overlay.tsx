// Packages
import React from 'react';

// Local Imports
import { usePerfReadout } from '../../hooks/use-perf-readout';

// Types
import type { DisplaySettings } from '@halloween/renderer/types/display-settings';
import type { PerfSample } from '../../types/stats';

/**
 * Props for the PerfOverlay component.
 */
interface PerfOverlayProps {
  /**
   * The screen's display settings (Show TPS, Show FPS, Show server ticks).
   */
  display: DisplaySettings;

  /**
   * Reads the latest server stats and this screen's frame rate.
   */
  sample: () => PerfSample;

  /**
   * Where it sits (defaults to the bottom right corner).
   */
  className?: string;
}

/**
 * The server's ticks per second, this screen's frames per second, and the
 * server's ms per tick, in a corner, each only while its display flag is
 * on. Refreshes about once a second (`usePerfReadout`), never per snapshot.
 *
 * @param {PerfOverlayProps} props - Component props.
 * @returns {React.JSX.Element | null} The rendered overlay, or null when nothing shows.
 */
function PerfOverlay({ display, sample, className = 'bottom-sm right-sm' }: PerfOverlayProps): React.JSX.Element | null {
  const active = display.showTps || display.showFps || display.showServerTicks;
  const reading = usePerfReadout(sample, active);
  if (!active) {
    return null;
  }
  /**
   * A reading as text, or a dash before there is one.
   *
   * @param v - The number.
   * @param digits - Decimal places.
   * @returns The text.
   */
  const show = (v: number | null | undefined, digits: number): string => (v === null || v === undefined ? '-' : v.toFixed(digits));
  return (
    <div className={`pointer-events-none absolute z-20 flex flex-col items-end gap-[2px] rounded-md border border-border bg-surface px-sm py-xsm font-medium text-xs tabular-nums text-foreground opacity-90 ${className}`}>
      {display.showTps && <span>{`${show(reading?.tps, 0)} TPS`}</span>}
      {display.showFps && <span>{`${show(reading?.fps, 0)} FPS`}</span>}
      {display.showServerTicks && <span>{`${show(reading?.stepMs, 1)} ms per tick`}</span>}
    </div>
  );
}

export default PerfOverlay;
