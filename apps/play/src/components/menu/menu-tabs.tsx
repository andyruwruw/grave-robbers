// Packages
import React from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';
import ItemIcon from '@halloween/game-ui/components/items/item-icon';

// Local Imports
import { MENU_LABELS, MENUS } from '../../config/play';

// Types
import type { KeyAction, Menu } from '../../types/play';

/**
 * Props for MenuTabs.
 */
interface MenuTabsProps {
  /**
   * The open menu.
   */
  menu: Menu;

  /**
   * The device used last (a pad shows LB and RB).
   */
  device: 'pad' | 'keys';

  /**
   * The key or button bound to an action, by name.
   */
  bound: (a: KeyAction) => string;

  /**
   * Opens a menu, or closes it (null).
   */
  onMenu: (menu: Menu | null) => void;
}

/**
 * The menu's header: a button per menu (between LB and RB hints with a
 * pad) and Close. The selection skips it (`data-pad-skip`).
 *
 * @param {MenuTabsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered header.
 */
function MenuTabs({ menu, device, bound, onMenu }: MenuTabsProps): React.JSX.Element {
  return (
    <header
      data-pad-skip
      className='flex items-center gap-xsm border-b border-border px-md py-xsm'>
      {device === 'pad' && <span className='font-medium text-xs text-foreground-subtle'>LB</span>}
      {MENUS.map((m: Menu) => (
        <button
          key={m}
          type='button'
          aria-label={MENU_LABELS[m]}
          title={`${MENU_LABELS[m]} (${bound(m)})`}
          aria-pressed={menu === m}
          className={`flex h-9 w-9 items-center justify-center rounded-md border ${menu === m ? 'border-brand bg-brand-muted text-foreground' : 'border-border bg-muted text-foreground-muted'}`}
          onClick={(): void => onMenu(m)}>
          {m === 'settings' ? (
            <SettingsIcon size={16} />
          ) : (
            <ItemIcon
              item={`ui:${m}`}
              size={26} />
          )}
        </button>
      ))}
      {device === 'pad' && <span className='font-medium text-xs text-foreground-subtle'>RB</span>}
      <span className='flex-1' />
      <button
        type='button'
        aria-label='Close'
        title={`Close (${device === 'pad' ? 'B' : 'Esc'})`}
        className='flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted text-foreground-muted'
        onClick={(): void => onMenu(null)}>
        <X size={16} />
      </button>
    </header>
  );
}

export default MenuTabs;
