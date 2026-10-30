// Packages
import React from 'react';
import { MAX_UPGRADE_LEVEL } from '@halloween/shared/skill-tree/upgrade-cost';

/**
 * Props for the TreeLevelPips component.
 */
interface TreeLevelPipsProps {
  /**
   * How many pips are filled.
   */
  level: number;

  /**
   * The width class for the row.
   */
  width: string;
}

/**
 * Level pips: filled up to `level` of MAX_UPGRADE_LEVEL.
 *
 * @param {TreeLevelPipsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered pips.
 */
function TreeLevelPips({ level, width }: TreeLevelPipsProps): React.JSX.Element {
  return (
    <span
      className={`flex gap-0.5 ${width}`}
      aria-label={`Level ${level} of ${MAX_UPGRADE_LEVEL}`}>
      {Array.from({ length: MAX_UPGRADE_LEVEL }, (_: unknown, i: number) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-sm ${i < level ? 'bg-brand' : 'bg-border'}`} />
      ))}
    </span>
  );
}

export default TreeLevelPips;
