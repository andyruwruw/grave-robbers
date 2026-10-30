// Packages
import React from 'react';

/**
 * Props for the VolumeSlider component.
 */
interface VolumeSliderProps {
  /**
   * What the slider sets.
   */
  label: string;

  /**
   * The volume, 0 to 1.
   */
  value: number;

  /**
   * Called with the new volume, 0 to 1.
   */
  onChange: (value: number) => void;
}

/**
 * One labeled 0..100% slider.
 *
 * @param {VolumeSliderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered slider.
 */
function VolumeSlider({
  label,
  value,
  onChange,
}: VolumeSliderProps): React.JSX.Element {
  return (
    <label className='flex flex-col gap-xsm'>
      <span className='flex justify-between text-xs text-foreground'>
        {label}
        <span className='text-foreground-subtle'>{Math.round(value * 100)}%</span>
      </span>
      <input
        type='range'
        min={0}
        max={100}
        value={Math.round(value * 100)}
        className='w-full accent-brand'
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange(Number(e.target.value) / 100)} />
    </label>
  );
}

export default VolumeSlider;
