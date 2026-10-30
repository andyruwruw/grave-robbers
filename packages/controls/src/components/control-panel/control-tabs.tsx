// Packages
import React from 'react';

// Types
import type { ControlTab, ControlTabInfo } from '../../types/control-panel';

/**
 * Props for the ControlTabs component.
 */
interface ControlTabsProps {
  /**
   * The tabs shown, in order.
   */
  tabs: ControlTabInfo[];

  /**
   * The open tab.
   */
  tab: ControlTab;

  /**
   * Opens a tab.
   */
  onTab: (tab: ControlTab) => void;
}

/**
 * The control panel's tab bar.
 *
 * @param {ControlTabsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tab bar.
 */
function ControlTabs({ tabs, tab, onTab }: ControlTabsProps): React.JSX.Element {
  return (
    <div
      role='tablist'
      className={`grid ${tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-xsm rounded-md border border-border p-xsm`}>
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type='button'
          role='tab'
          aria-selected={tab === key}
          className={`flex min-w-0 items-center justify-center gap-xsm whitespace-nowrap rounded-sm px-sm py-xsm text-xs font-medium transition-colors ${tab === key ? 'bg-muted text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
          onClick={(): void => onTab(key)}>
          <Icon
            size={13}
            className='shrink-0' />
          {label}
        </button>
      ))}
    </div>
  );
}

export default ControlTabs;
