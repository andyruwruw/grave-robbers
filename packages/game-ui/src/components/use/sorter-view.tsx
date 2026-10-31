// Packages
import React, { useMemo, useState } from 'react';
import { SORT_SIDES, sortableKeys } from '@halloween/shared/structures/sorting';

// Local Imports
import { SORT_SIDE_ONWARD } from '../../config/sorting';
import { sortGroups } from '../../helpers/sorting';
import SortRouteRow from './sort-route-row';

// Types
import type { SorterPanel } from '@halloween/shared/protocol/state/use-panel';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { SortKey, SortSide } from '@halloween/shared/structures/sorting';
import type { SortGroup } from '../../helpers/sorting';

/**
 * Props for the SorterView component.
 */
interface SorterViewProps {
  /**
   * The open belt sorter.
   */
  panel: SorterPanel;

  /**
   * The player's skill tree, for what they can pick.
   */
  tree: TreeState;

  /**
   * Sends a thing (or nothing) out one side.
   */
  onRoute: (side: SortSide, item: SortKey | null) => void;
}

/**
 * An open belt sorter: a row per side (Up, Down, Left, Right), the forward
 * side taking everything else and each other side showing what goes out
 * it, with a picker of everything the player has unlocked
 * (`sortableKeys`). One picker is open at a time.
 *
 * @param {SorterViewProps} props - Component props.
 * @returns {React.JSX.Element} The rendered view.
 */
function SorterView({ panel, tree, onRoute }: SorterViewProps): React.JSX.Element {
  const [open, setOpen] = useState<SortSide | null>(null);
  const groups = useMemo((): SortGroup[] => sortGroups(sortableKeys(tree)), [tree]);
  const taken = useMemo((): Map<SortKey, SortSide> => {
    const map = new Map<SortKey, SortSide>();
    for (const side of SORT_SIDES) {
      const key = panel.routes[side];
      if (key) {
        map.set(key, side);
      }
    }
    return map;
  }, [panel.routes]);
  return (
    <div className='flex w-full max-w-sm flex-col gap-sm'>
      <span className='text-center text-[13px] text-foreground-muted'>
        Pick what goes out each side. Everything else rolls on {SORT_SIDE_ONWARD[panel.forward]}.
      </span>
      {SORT_SIDES.map((side: SortSide): React.JSX.Element => (
        <SortRouteRow
          key={side}
          side={side}
          forward={side === panel.forward}
          item={panel.routes[side] ?? null}
          open={open === side}
          groups={groups}
          taken={taken}
          onToggle={(): void => setOpen(open === side ? null : side)}
          onPick={(item: SortKey | null, close: boolean): void => {
            onRoute(side, item);
            if (close) {
              setOpen(null);
            }
          }} />
      ))}
    </div>
  );
}

export default SorterView;
