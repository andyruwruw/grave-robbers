// Packages
import React from 'react';

// Local Imports
import { SFX_VOLUME_DEFAULT, SFX_VOLUME_RANGE } from '../../config/settings';
import { percent } from '../../helpers/settings-values';
import RangeSetting from './range-setting';

// Types
import type { PlaySettings } from '../../types/play';

/**
 * Props for AudioSettings.
 */
interface AudioSettingsProps {
  /**
   * The current settings.
   */
  settings: PlaySettings;

  /**
   * Called with the changed settings.
   */
  onChange: (settings: PlaySettings) => void;
}

/**
 * The Audio tab: the sound effects volume (`usePlaySettings` applies it to
 * `sfx`).
 *
 * @param {AudioSettingsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tab.
 */
function AudioSettings({ settings, onChange }: AudioSettingsProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-sm'>
      <span className='font-medium text-[13px] text-foreground-muted'>Audio</span>
      <RangeSetting
        label='Sound effects'
        value={settings.sfxVolume}
        defaultValue={SFX_VOLUME_DEFAULT}
        min={SFX_VOLUME_RANGE.min}
        max={SFX_VOLUME_RANGE.max}
        step={SFX_VOLUME_RANGE.step}
        readout={(v: number): string => percent(v, 'Muted')}
        downLabel='Quieter'
        upLabel='Louder'
        onChange={(sfxVolume: number): void => onChange({ ...settings, sfxVolume })} />
    </div>
  );
}

export default AudioSettings;
