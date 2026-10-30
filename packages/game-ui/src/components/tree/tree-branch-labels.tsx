// Packages
import React from 'react';

// Local Imports
import { COL } from '../../config/tree';
import { TREE_LAYOUT } from '../../tree/tree-layout';

/**
 * Each branch's name along the top of the tree, over the columns it spans.
 *
 * @returns {React.JSX.Element} The rendered labels.
 */
function TreeBranchLabels(): React.JSX.Element {
  return (
    <>
      {TREE_LAYOUT.branchSpans.map(({ label, from, to }) => (
        <span
          key={label}
          className='absolute top-0 truncate border-b border-border text-center font-medium text-[11px] leading-[12px] text-foreground-muted'
          style={{ left: from * COL + 4, width: (to - from + 1) * COL - 8 }}>
          {label}
        </span>
      ))}
    </>
  );
}

export default TreeBranchLabels;
