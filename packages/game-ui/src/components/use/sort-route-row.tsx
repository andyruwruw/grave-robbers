// Packages
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Local Imports
import { SORT_SIDE_LABELS } from '../../config/sorting';
import { sortKeyLabel } from '../../helpers/sorting';
import ItemIcon from '../items/item-icon';
import SortKeyPicker from './sort-key-picker';

// Types
import type { SortKey, SortSide } from '@halloween/shared/structures/sorting';
import type { SortGroup } from '../../helpers/sorting';

/**
 * Props for the SortRouteRow component.
 */
interface SortRouteRowProps {
  /**
   * The side this row is for.
   */
  side: SortSide;

  /**
   * Whether it's the side everything else rolls out (no picker).
   */
  forward: boolean;

  /**
   * What goes out this side, if anything.
   */
  item: SortKey | null;

  /**
   * Whether its picker is open.
   */
  open: boolean;

  /**
   * What the player can pick, grouped.
   */
  groups: readonly SortGroup[];

  /**
   * Which side each thing already goes out.
   */
  taken: ReadonlyMap<SortKey, SortSide>;

  /**
   * Opens or closes its picker.
   */
  onToggle: () => void;

  /**
   * Sends a thing (or nothing) out this side.
   */
  onPick: (item: SortKey | null, close: boolean) => void;
}

/**
 * One side of a belt sorter: the forward side says it takes everything
 * else; any other side shows what goes out it (or Nothing) and opens a
 * picker (`SortKeyPicker`) under it when pressed.
 *
 * @param {SortRouteRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function SortRouteRow({ side, forward, item, open, groups, taken, onToggle, onPick }: SortRouteRowProps): React.JSX.Element {
  const label = SORT_SIDE_LABELS[side];
  if (forward) {
    return (
      <div className='flex min-h-[48px] items-center gap-sm rounded-[2px] border border-border bg-muted px-sm'>
        <span className='w-12 font-medium text-sm text-foreground'>{label}</span>
        <span className='flex-1 text-[13px] text-foreground-muted'>Everything else</span>
      </div>
    );
  }
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <div className={`flex flex-col rounded-[2px] border bg-surface ${open ? 'border-brand' : 'border-border'}`}>
      <button
        type='button'
        className='flex min-h-[48px] items-center gap-sm px-sm text-left'
        onClick={onToggle}>
        <span className='w-12 font-medium text-sm text-foreground'>{label}</span>
        {item ? (
          <>
            <ItemIcon
              item={item}
              size={28} />
            <span className='flex-1 text-sm text-foreground'>{sortKeyLabel(item)}</span>
          </>
        ) : (
          <span className='flex-1 text-[13px] text-foreground-muted'>Nothing</span>
        )}
        <Chevron
          size={16}
          className='text-foreground-muted' />
      </button>
      {open && (
        <SortKeyPicker
          groups={groups}
          picked={item}
          taken={taken}
          onPick={onPick} />
      )}
    </div>
  );
}

export default SortRouteRow;
