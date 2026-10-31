// Packages
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import GameSwitch from '@halloween/controls/components/game/game-switch';
import TitledCard from '@halloween/controls/components/ui/titled-card';
import { SWITCHES } from '@halloween/controls/config/game-panel';
import { PANEL_BUTTON } from '@halloween/controls/config/styles';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';

/**
 * Props for the CheatsCard component.
 */
interface CheatsCardProps {
  /**
   * The server's current switches.
   */
  settings: GameSettings;

  /**
   * Changes some of the switches.
   */
  onChange: (settings: Partial<GameSettings>) => void;
}

/**
 * The Gameplay page's Cheats section: every on/off switch (`SWITCHES`),
 * and daytime.
 *
 * @param {CheatsCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function CheatsCard({ settings, onChange }: CheatsCardProps): React.JSX.Element {
  return (
    <TitledCard title='Cheats'>
      <div className='flex flex-col gap-xsm'>
        {SWITCHES.map((info) => (
          <GameSwitch
            key={info.key}
            info={info}
            on={settings[info.key]}
            shortcuts={false}
            onToggle={(): void => onChange({ [info.key]: !settings[info.key] })} />
        ))}
      </div>
      <button
        type='button'
        aria-pressed={settings.daytime}
        className={PANEL_BUTTON}
        onClick={(): void => onChange({ daytime: !settings.daytime })}>
        {settings.daytime ? (
          <Moon size={14} />
        ) : (
          <Sun
            size={14}
            className='text-status-warning-foreground' />
        )}
        {settings.daytime ? 'Back to night' : 'Make it day'}
      </button>
    </TitledCard>
  );
}

export default CheatsCard;
