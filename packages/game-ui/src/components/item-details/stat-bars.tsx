// Packages
import React from 'react';

// Local Imports
import { SEGMENTS } from '../../config/item-details';
import { statBlockUrl } from '../../helpers/stat-icon-url';
import StatGlyph from './stat-glyph';

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
 * Labeled stat bars, each a row of little pre-rendered 3D blocks filled in
 * the stat's own color (damage is always red, speed always yellow), beside
 * the stat's 3D icon.
 *
 * @param {StatBarsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bars.
 */
function StatBars({ stats }: StatBarsProps): React.JSX.Element {
  return (
    <>
      {stats.map(({ icon, color, label, fill }, i: number) => {
        const filled = Math.round(Math.max(0, Math.min(1, fill)) * SEGMENTS);
        return (
          <div
            key={i}
            className='flex flex-col gap-1'>
            <span className='flex items-center gap-1.5 font-medium text-xs leading-tight'>
              <StatGlyph icon={icon} />
              {label}
            </span>
            <span className='flex'>
              {Array.from({ length: SEGMENTS }, (_, s: number) => (
                <img
                  key={s}
                  src={statBlockUrl(s < filled ? color : null)}
                  alt=''
                  width={14}
                  height={14}
                  draggable={false}
                  className='pointer-events-none [image-rendering:pixelated]' />
              ))}
            </span>
          </div>
        );
      })}
    </>
  );
}

export default StatBars;
