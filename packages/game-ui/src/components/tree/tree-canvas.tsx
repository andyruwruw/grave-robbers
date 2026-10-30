// Packages
import React from 'react';

// Local Imports
import { REVEAL_SECONDS } from '../../config/tree';
import { TREE_LAYOUT } from '../../tree/tree-layout';

// Types
import type { TreePan } from '../../hooks/use-tree-pan';

/**
 * Props for the TreeCanvas component.
 */
interface TreeCanvasProps {
  /**
   * The scroll area's ref and pan handlers.
   */
  pan: TreePan;

  /**
   * Mouse and keyboard mode: the grab cursor shows.
   */
  hoverDetails: boolean;

  /**
   * The tree's height in pixels.
   */
  height: number;

  /**
   * The links, labels, nodes and hover card.
   */
  children: React.ReactNode;
}

/**
 * The tree's pannable scroll area, holding a box the tree's size that
 * grows as rows come into sight.
 *
 * @param {TreeCanvasProps} props - Component props.
 * @returns {React.JSX.Element} The rendered area.
 */
function TreeCanvas({
  pan,
  hoverDetails,
  height,
  children,
}: TreeCanvasProps): React.JSX.Element {
  return (
    <div
      ref={pan.scrollRef}
      className={`scrollbar-none min-w-0 flex-1 touch-pan-x touch-pan-y overflow-auto ${hoverDetails ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onPointerDown={pan.onPointerDown}
      onClickCapture={pan.onClickCapture}
      onWheel={pan.onWheel}>
      <div
        className='relative m-sm'
        style={{ width: TREE_LAYOUT.width, height, transition: `height ${REVEAL_SECONDS}s` }}>
        {children}
      </div>
    </div>
  );
}

export default TreeCanvas;
