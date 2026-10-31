// Packages
import React from 'react';

// Local Imports
import { SORT_SIDE_LABELS } from '../../config/sorting';
import { sortKeyLabel } from '../../helpers/sorting';
import ItemIcon from '../items/item-icon';

// Types
import type { SortKey, SortSide } from '@halloween/shared/structures/sorting';
import type { SortGroup } from '../../helpers/sorting';

/**
 * Props for the SortKeyPicker component.
 */
interface SortKeyPickerProps {
  /**
   * What the player can pick, grouped (see `sortGroups`).
   */
  groups: readonly SortGroup[];

  /**
   * What goes this way now, if anything.
   */
  picked: SortKey | null;

  /**
   * Which side each thing already goes out, to mark it.
   */
  taken: ReadonlyMap<SortKey, SortSide>;

  /**
   * Picks a thing (or nothing).
   */
  onPick: (item: SortKey | null, close: boolean) => void;
}

/**
 * The list a sorter row opens: Nothing, then every thing the player knows,
 * grouped, each with its icon and name (and the side it already goes, if
 * any). A tap or click picks and closes it; a gamepad press (a click with
 * no pointer, `detail` 0) picks and leaves it open, so /play's selection
 * stays on what was picked.
 *
 * @param {SortKeyPickerProps} props - Component props.
 * @returns {React.JSX.Element} The rendered list.
 */
function SortKeyPicker({ groups, picked, taken, onPick }: SortKeyPickerProps): React.JSX.Element {
  /**
   * A button's border and fill, marked when it's the pick.
   *
   * @param on - Whether it's what goes this way.
   * @returns The classes.
   */
  const tile = (on: boolean): string => `rounded-[2px] border ${on ? 'border-brand bg-brand-muted ring-1 ring-brand' : 'border-border bg-surface active:border-brand'}`;
  return (
    <div className='flex flex-col gap-sm border-t border-border p-sm'>
      <button
        type='button'
        className={`${tile(picked === null)} px-sm py-1.5 text-[13px] text-foreground`}
        onClick={(e: React.MouseEvent): void => onPick(null, e.detail > 0)}>
        Nothing
      </button>
      {groups.map((group: SortGroup): React.JSX.Element => (
        <div
          key={group.label}
          className='flex flex-col gap-xsm'>
          <span className='text-[11px] uppercase tracking-wide text-foreground-muted'>{group.label}</span>
          <div className='grid grid-cols-3 gap-xsm'>
            {group.keys.map((key: SortKey): React.JSX.Element => {
              const side = taken.get(key);
              return (
                <button
                  key={key}
                  type='button'
                  className={`relative flex flex-col items-center gap-0.5 p-xsm ${tile(key === picked)}`}
                  onClick={(e: React.MouseEvent): void => onPick(key, e.detail > 0)}>
                  {side && <span className='absolute right-0.5 top-0.5 text-[9px] text-foreground-muted'>{SORT_SIDE_LABELS[side]}</span>}
                  <ItemIcon
                    item={key}
                    size={32} />
                  <span className='line-clamp-2 text-center text-[11px] leading-tight text-foreground'>{sortKeyLabel(key)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SortKeyPicker;
