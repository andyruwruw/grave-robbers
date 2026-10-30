// Packages
import React from 'react';
import ItemIcon from '@halloween/game-ui/components/items/item-icon';

// Local Imports
import { PANEL_TABS } from '../../config/pad';

// Types
import type { Panel } from '../../types/pad';

/**
 * Props for PanelTabs.
 */
interface PanelTabsProps {
  /**
   * The list showing, if any.
   */
  shown: Panel | null;

  /**
   * Opens (or closes) a list.
   */
  onToggle: (panel: Panel) => void;
}

/**
 * The big round Bag, Craft, and Skill tree buttons.
 *
 * @param {PanelTabsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered buttons.
 */
function PanelTabs({ shown, onToggle }: PanelTabsProps): React.JSX.Element {
  return (
    <div className='flex shrink-0 flex-col items-center justify-center gap-md px-sm'>
      {PANEL_TABS.map(([key, label]) => (
        <button
          key={key}
          type='button'
          aria-label={label}
          aria-pressed={shown === key}
          className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${shown === key ? 'border-brand bg-brand-muted text-foreground' : 'border-border bg-muted text-foreground-muted'}`}
          onClick={(): void => onToggle(key)}>
          <ItemIcon
            item={`ui:${key}`}
            size={40} />
        </button>
      ))}
    </div>
  );
}

export default PanelTabs;
