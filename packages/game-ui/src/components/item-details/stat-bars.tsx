// Packages
import React from 'react';

// Local Imports
import { SEGMENTS } from '../../config/item-details';

// Types
import type { Stat } from '../../types/stats';

/**
 * Props for the StatBars component.
 */
interface StatBarsProps {
  /**
   * The bars to draw, in order.
   */
  stats: Stat[];
}

/**
 * Bar color by how full it is: weak, middling, strong.
 *
 * @param fill - How full the bar is, 0 to 1.
 * @returns The bar's background class.
 */
function barColor(fill: number): string {
  return fill < 0.34 ? 'bg-status-error-foreground' : fill < 0.67 ? 'bg-status-warning-foreground' : 'bg-status-success-foreground';
}

/**
 * Labeled stat bars, segmented and colored by how strong they are.
 *
 * @param {StatBarsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bars.
 */
function StatBars({ stats }: StatBarsProps): React.JSX.Element {
  return (
    <>
      {stats.map(({ icon: Icon, label, fill }, i: number) => {
        const filled = Math.round(Math.max(0, Math.min(1, fill)) * SEGMENTS);
        return (
          <div
            key={i}
            className='flex flex-col gap-0.5'>
            <span className='flex items-center gap-1.5 font-medium text-xs leading-tight'>
              <Icon size={10} />
              {label}
            </span>
            <span className='flex gap-px'>
              {Array.from({ length: SEGMENTS }, (_, s: number) => (
                <span
                  key={s}
                  className={`h-2 w-2.5 ${s < filled ? barColor(fill) : 'bg-border'}`} />
              ))}
            </span>
          </div>
        );
      })}
    </>
  );
}

export default StatBars;
