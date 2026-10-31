// Packages
import React from 'react';

// Local Imports
import {
  VOXEL_FACE,
  VOXEL_KNOB_PX,
  VOXEL_RAISED,
  VOXEL_SUNKEN,
} from './config/voxel';

/**
 * Props for the VoxelSlider component.
 */
interface VoxelSliderProps {
  /**
   * What it sets, for screen readers.
   */
  label: string;

  /**
   * The current value.
   */
  value: number;

  /**
   * The smallest value.
   */
  min: number;

  /**
   * The largest value.
   */
  max: number;

  /**
   * How far one step goes.
   */
  step: number;

  /**
   * Leaves the slider out of keyboard focus and a controller's menu
   * navigation (when step buttons beside it do that job).
   */
  skipNav?: boolean;

  /**
   * Picks a new value.
   */
  onChange: (value: number) => void;

  /**
   * Optional extra class names.
   */
  className?: string;
}

/**
 * A chunky voxel slider: a sunken channel, a brand-colored fill up to the
 * value, and a raised block for a handle with two grip notches, drawn from
 * plain elements like a picture. A real range input lies invisibly on top,
 * so dragging, clicking, and the keyboard work as usual.
 *
 * @param {VoxelSliderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered slider.
 */
function VoxelSlider({
  label,
  value,
  min,
  max,
  step,
  skipNav = false,
  onChange,
  className = '',
}: VoxelSliderProps): React.JSX.Element {
  const share = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const at = `calc(${share} * (100% - ${VOXEL_KNOB_PX}px))`;
  return (
    <div className={`relative h-6 min-w-0 ${className}`.trim()}>
      <span className={`pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-[2px] border border-border bg-background ${VOXEL_SUNKEN}`} />
      <span
        className={`pointer-events-none absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-[2px] bg-brand ${VOXEL_FACE}`}
        style={{ width: `calc(${at} + ${VOXEL_KNOB_PX / 2}px)` }} />
      <span
        className={`pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center gap-[3px] rounded-[3px] border border-border bg-muted ${VOXEL_RAISED}`}
        style={{ left: at, width: VOXEL_KNOB_PX, height: VOXEL_KNOB_PX }}>
        <span className='h-2 w-[2px] bg-foreground-subtle' />
        <span className='h-2 w-[2px] bg-foreground-subtle' />
      </span>
      <input
        type='range'
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        tabIndex={skipNav ? -1 : undefined}
        data-pad-skip={skipNav ? true : undefined}
        className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange(Number(e.target.value))} />
    </div>
  );
}

export default VoxelSlider;
