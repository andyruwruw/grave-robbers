// Packages
import React from 'react';
import { ArrowRight } from 'lucide-react';

// Local Imports
import GoodsRow from '../items/goods-row';

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
 * What a station turns into what: its input, an arrow, its output.
 *
 * @param {StationFlowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered flow.
 */
function StationFlow({ station }: StationFlowProps): React.JSX.Element {
  return (
    <div className='flex items-center gap-1.5 text-foreground'>
      <GoodsRow goods={station.input} />
      <ArrowRight size={14} />
      <GoodsRow goods={station.output} />
    </div>
  );
}

export default StationFlow;
