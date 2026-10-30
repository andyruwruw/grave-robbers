// Packages
import React from 'react';

// Local Imports
import { NODE, REVEAL_SECONDS } from '../../config/tree';
import { TREE_LAYOUT } from '../../tree/tree-layout';

// Types
import type { NodeId } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Placed, Seen } from '../../types/tree';

/**
 * Props for the TreeLinks component.
 */
interface TreeLinksProps {
  /**
   * How much of each node shows.
   */
  seens: Map<NodeId, Seen>;

  /**
   * The tree's height in pixels.
   */
  height: number;
}

/**
 * The lines from each node to the node it grows from: solid when the child
 * shows, fading out toward a teaser, hidden otherwise.
 *
 * @param {TreeLinksProps} props - Component props.
 * @returns {React.JSX.Element} The rendered svg.
 */
function TreeLinks({ seens, height }: TreeLinksProps): React.JSX.Element {
  return (
    <svg
      className='pointer-events-none absolute inset-0 overflow-visible text-foreground-muted'
      width={TREE_LAYOUT.width}
      height={height}>
      {TREE_LAYOUT.placed.filter((p: Placed): boolean => p.node.unlock.by === 'upgrade').map((p: Placed) => {
        const unlock = p.node.unlock as { from: NodeId };
        const parent = TREE_LAYOUT.position.get(unlock.from)!;
        const childSeen = seens.get(p.node.id)!;
        const x1 = TREE_LAYOUT.centerX(parent.col);
        const y1 = TREE_LAYOUT.top(parent.row) + NODE;
        const x2 = TREE_LAYOUT.centerX(p.col);
        const y2 = TREE_LAYOUT.top(p.row);
        const mid = (y1 + y2) / 2;
        const teaser = childSeen === 'teaser';
        return (
          <g key={p.node.id}>
            {teaser && (
              <defs>
                <linearGradient
                  id={`fade-${p.node.id}`}
                  gradientUnits='userSpaceOnUse'
                  x1={x1}
                  y1={y1}
                  x2={x1 + (x2 - x1) * 0.7}
                  y2={mid}>
                  <stop
                    offset={0}
                    stopColor='currentColor'
                    stopOpacity={0.8} />
                  <stop
                    offset={1}
                    stopColor='currentColor'
                    stopOpacity={0} />
                </linearGradient>
              </defs>
            )}
            <path
              d={`M${x1} ${y1} V${mid} H${x2} V${y2}`}
              fill='none'
              strokeWidth={2}
              stroke={teaser ? `url(#fade-${p.node.id})` : undefined}
              className={childSeen === 'open' ? 'stroke-brand' : childSeen === 'locked' ? 'stroke-foreground-muted' : ''}
              style={{ opacity: childSeen === 'none' ? 0 : 1, transition: `opacity ${REVEAL_SECONDS}s` }} />
          </g>
        );
      })}
    </svg>
  );
}

export default TreeLinks;
