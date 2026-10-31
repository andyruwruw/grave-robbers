// Packages
import React, { useState } from 'react';

// Local Imports
import AudioSettings from './audio-settings';
import ControlsSettings from './controls-settings';
import GameplaySettings from './gameplay-settings';
import GraphicsSettings from './graphics-settings';
import SettingsTabs from './settings-tabs';

// Types
import type {
  Capture,
  PlaySettings,
  SettingsTab,
} from '../../types/play';

/**
 * Props for the SettingsPanel component.
 */
interface SettingsPanelProps {
  /**
   * The current settings.
   */
  settings: PlaySettings;

  /**
   * Called with the changed settings.
   */
  onChange: (settings: PlaySettings) => void;

  /**
   * The binding waiting for its new key or button.
   */
  capturing: Capture | null;

  /**
   * Starts (or, with null, cancels) waiting for a new key or button.
   */
  onCapture: (capture: Capture | null) => void;


  /**
   * The last transfer code the server gave, or null.
   */
  transfer: { code: string; until: number } | null;

  /**
   * Asks for a new transfer code.
   */
  onTransfer: () => void;

  /**
   * Removes the player from the game.
   */
  onLeave: () => void;
}

/**
 * The /play screen's own settings: tabs down the left (Gameplay, Graphics,
 * Controls, Audio) and the picked tab's settings to the right, scrolling on
 * their own (from the top again on each tab). The controller's selection
 * moves between the two by direction like anywhere else in the menus.
 *
 * @param {SettingsPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function SettingsPanel({
  settings,
  onChange,
  capturing,
  onCapture,
  transfer,
  onTransfer,
  onLeave,
}: SettingsPanelProps): React.JSX.Element {
  const [tab, setTab] = useState<SettingsTab>('gameplay');
  return (
    <div className='flex h-full min-h-0 w-full gap-md'>
      <SettingsTabs
        tab={tab}
        onTab={setTab} />
      <div
        key={tab}
        role='tabpanel'
        className='scrollbar-none min-h-0 min-w-0 flex-1 overflow-y-auto pr-xsm'>
        {tab === 'gameplay' ? (
          <GameplaySettings
            settings={settings}
            onChange={onChange}
            transfer={transfer}
            onTransfer={onTransfer}
            onLeave={onLeave} />
        ) : tab === 'graphics' ? (
          <GraphicsSettings
            settings={settings}
            onChange={onChange} />
        ) : tab === 'controls' ? (
          <ControlsSettings
            settings={settings}
            onChange={onChange}
            capturing={capturing}
            onCapture={onCapture} />
        ) : (
          <AudioSettings
            settings={settings}
            onChange={onChange} />
        )}
      </div>
    </div>
  );
}

export default SettingsPanel;
