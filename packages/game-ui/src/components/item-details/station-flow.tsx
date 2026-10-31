// Packages
import React from 'react';
import { GOODS } from '@halloween/shared/goods/goods';

// Local Imports
import GoodsRow from '../items/goods-row';
import StatGlyph from './stat-glyph';

// Types
import type { Station } from '@halloween/shared/structures/types/structures';

/**
 * Props for the StationFlow component.
 */
interface StationFlowProps {
  /**
   * The station.
   */
  station: Station;
}

/**
 * What a station turns into what: its input, an arrow, its output (just
 * the output for one that makes something from nothing, like a quarry).
 *
 * @param {StationFlowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered flow.
 */
function StationFlow({ station }: StationFlowProps): React.JSX.Element {
  const takes = GOODS.some((g): boolean => station.input[g] > 0);
  return (
    <div className='flex items-center gap-1.5 text-foreground'>
      {takes && <GoodsRow goods={station.input} />}
      {takes && <StatGlyph icon='arrow' />}
      <GoodsRow goods={station.output} />
    </div>
  );
}

export default StationFlow;
