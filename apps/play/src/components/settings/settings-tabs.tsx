// Packages
import React from 'react';
import ItemIcon from '@halloween/game-ui/components/items/item-icon';

// Local Imports
import { SETTINGS_TABS } from '../../config/settings';

// Types
import type { SettingsTab } from '../../types/play';

/**
 * Props for SettingsTabs.
 */
interface SettingsTabsProps {
  /**
   * The tab showing.
   */
  tab: SettingsTab;

  /**
   * Shows a tab.
   */
  onTab: (tab: SettingsTab) => void;
}

/**
 * The Settings menu's tabs down its left side, each a 3D icon and its name.
 * They're ordinary buttons, so the controller's selection reaches them by
 * going left from the tab's content and A shows one. The picked tab is
 * styled from `aria-selected`, so its class never changes and the
 * selection's `pad-focus` class stays put.
 *
 * @param {SettingsTabsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tab list.
 */
function SettingsTabs({ tab, onTab }: SettingsTabsProps): React.JSX.Element {
  return (
    <nav
      role='tablist'
      aria-orientation='vertical'
      className='flex w-32 shrink-0 flex-col gap-xsm border-r border-border pr-sm'>
      {SETTINGS_TABS.map(({ id, label }: { id: SettingsTab; label: string }) => (
        <button
          key={id}
          type='button'
          role='tab'
          aria-selected={tab === id}
          className='flex items-center gap-sm rounded-md border border-transparent px-xsm py-1 text-left font-medium text-[13px] text-foreground-muted hover:bg-muted aria-selected:border-brand aria-selected:bg-brand-muted aria-selected:text-foreground'
          onClick={(): void => onTab(id)}>
          <ItemIcon
            item={`ui:${id}`}
            size={24} />
          {label}
        </button>
      ))}
    </nav>
  );
}

export default SettingsTabs;
