// Packages
import React from 'react';
import VoxelSwitch from '@halloween/ui/components/ui/controls/voxel-switch';

/**
 * Props for the SwitchPill component.
 */
interface SwitchPillProps {
  /**
   * Whether the switch is on.
   */
  on: boolean;
}

/**
 * The on/off switch at the end of a sidebar switch row: the voxel switch
 * (`VoxelSwitch`), brand colored with its block to the right while on.
 *
 * @param {SwitchPillProps} props - Component props.
 * @returns {React.JSX.Element} The rendered pill.
 */
function SwitchPill({ on }: SwitchPillProps): React.JSX.Element {
  return <VoxelSwitch on={on} />;
}

export default SwitchPill;
