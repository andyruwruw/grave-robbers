// Packages
import React from 'react';
import { MAX_UPGRADE_LEVEL } from '@halloween/shared/skill-tree/upgrade-cost';

/**
 * Props for the DetailPips component.
 */
interface DetailPipsProps {
  /**
   * How many pips are filled.
   */
  level: number;
}

/**
 * Level pips: filled up to `level` of MAX_UPGRADE_LEVEL.
 *
 * @param {DetailPipsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered pips.
 */
function DetailPips({ level }: DetailPipsProps): React.JSX.Element {
  return (
    <span className='flex gap-0.5'>
      {Array.from({ length: MAX_UPGRADE_LEVEL }, (_, i: number) => (
        <span
          key={i}
          className={`h-1.5 w-3 ${i < level ? 'bg-brand' : 'bg-border'}`} />
      ))}
    </span>
  );
}

export default DetailPips;
