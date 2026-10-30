// Packages
import React from 'react';
import Card from '@halloween/ui/components/ui/primitives/card';

// Local Imports
import { SWITCHES } from '../../config/game-panel';
import GameSwitch from './game-switch';
import WorldLevelRow from './world-level-row';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';

/**
 * Props for the SwitchesCard component.
 */
interface SwitchesCardProps {
  /**
   * The server's current switches.
   */
  settings: GameSettings;

  /**
   * The hidden world level right now.
   */
  worldLevel: number;

  /**
   * Changes some of the switches.
   */
  onChange: (settings: Partial<GameSettings>) => void;

  /**
   * Shows each switch's keyboard shortcut (the TV).
   */
  shortcuts: boolean;
}

/**
 * The Game tab's switches (`SWITCHES`) and the world level boost.
 *
 * @param {SwitchesCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function SwitchesCard({
  settings,
  worldLevel,
  onChange,
  shortcuts,
}: SwitchesCardProps): React.JSX.Element {
  return (
    <Card className='flex flex-col'>
      <div className='flex flex-col gap-lg px-lg py-md'>
        <div className='flex flex-col gap-xsm'>
          {SWITCHES.map((info) => (
            <GameSwitch
              key={info.key}
              info={info}
              on={settings[info.key]}
              shortcuts={shortcuts}
              onToggle={(): void => onChange({ [info.key]: !settings[info.key] })} />
          ))}
        </div>

        <WorldLevelRow
          settings={settings}
          worldLevel={worldLevel}
          onChange={onChange} />

      </div>
    </Card>
  );
}

export default SwitchesCard;
