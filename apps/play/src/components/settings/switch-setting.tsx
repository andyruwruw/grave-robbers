// Packages
import React from 'react';
import VoxelSwitch from '@halloween/ui/components/ui/controls/voxel-switch';

// Local Imports
import ResetButton from './reset-button';

/**
 * Props for SwitchSetting.
 */
interface SwitchSettingProps {
  /**
   * The setting's name.
   */
  label: string;

  /**
   * Whether it's on.
   */
  on: boolean;

  /**
   * Whether it's on by default.
   */
  defaultOn: boolean;

  /**
   * Turns it on or off.
   */
  onChange: (on: boolean) => void;
}

/**
 * One on/off settings row: the whole row is the switch (so a controller's
 * A flips it), with the reset button after it.
 *
 * @param {SwitchSettingProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function SwitchSetting({ label, on, defaultOn, onChange }: SwitchSettingProps): React.JSX.Element {
  return (
    <div className='flex items-center gap-sm'>
      <button
        type='button'
        role='switch'
        aria-checked={on}
        className='flex min-w-0 flex-1 items-center gap-sm rounded-md py-1 text-left'
        onClick={(): void => onChange(!on)}>
        <span className='min-w-0 flex-1 truncate font-medium text-xs text-foreground'>{label}</span>
        <VoxelSwitch on={on} />
      </button>
      <ResetButton
        label={label}
        defaultReadout={defaultOn ? 'on' : 'off'}
        atDefault={on === defaultOn}
        onReset={(): void => onChange(defaultOn)} />
    </div>
  );
}

export default SwitchSetting;
