// Packages
import React from 'react';

// Local Imports
import {
  VOXEL_KNOB_PX,
  VOXEL_RAISED,
  VOXEL_SUNKEN,
} from './config/voxel';

/**
 * Props for the VoxelSwitch component.
 */
interface VoxelSwitchProps {
  /**
   * Whether it's on.
   */
  on: boolean;

  /**
   * Optional extra class names.
   */
  className?: string;
}

/**
 * A chunky voxel switch, drawn like a picture: a sunken socket with a
 * raised block that sits left and dull while off, and right and brand
 * colored with a lit pip while on. It only shows the state; put it inside
 * the button (`role='switch'`) that flips it.
 *
 * @param {VoxelSwitchProps} props - Component props.
 * @returns {React.JSX.Element} The rendered switch.
 */
function VoxelSwitch({ on, className = '' }: VoxelSwitchProps): React.JSX.Element {
  return (
    <span
      aria-hidden
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-[3px] border border-border bg-background px-[1px] ${VOXEL_SUNKEN} ${className}`.trim()}>
      <span
        className={`flex items-center justify-center rounded-[3px] border transition-transform duration-150 ${VOXEL_RAISED} ${on ? 'border-brand bg-brand' : 'border-border bg-muted'}`}
        style={{ width: VOXEL_KNOB_PX, height: VOXEL_KNOB_PX, transform: on ? `translateX(calc(2.75rem - ${VOXEL_KNOB_PX + 4}px))` : 'translateX(0)' }}>
        <span className={`h-[6px] w-[6px] rounded-[1px] ${on ? 'bg-foreground' : 'bg-background'}`} />
      </span>
    </span>
  );
}

export default VoxelSwitch;
