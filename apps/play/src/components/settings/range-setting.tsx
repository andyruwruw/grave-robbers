// Packages
import React from 'react';
import {
  Minus,
  Plus,
} from 'lucide-react';
import VoxelSlider from '@halloween/ui/components/ui/controls/voxel-slider';

// Local Imports
import { SETTINGS_BUTTON } from '../../config/play';
import { sameSetting, stepSetting } from '../../helpers/settings-values';
import ResetButton from './reset-button';

/**
 * Props for the RangeSetting component.
 */
interface RangeSettingProps {
  /**
   * The setting's name.
   */
  label: string;

  /**
   * The current value.
   */
  value: number;

  /**
   * The value it starts at, which the reset button returns to.
   */
  defaultValue: number;

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
   * What a value reads as beside the slider.
   */
  readout: (value: number) => string;

  /**
   * The step down button's name, for screen readers and its tooltip.
   */
  downLabel: string;

  /**
   * The step up button's name, for screen readers and its tooltip.
   */
  upLabel: string;

  /**
   * A line under the row, if any.
   */
  note?: string;

  /**
   * Picks a new value (always within range and on a step).
   */
  onChange: (value: number) => void;
}

/**
 * One settings row with a slider for the mouse, flanked by step buttons a
 * controller's menu navigation can press (the selection skips the slider
 * itself), the value read out after, and a button that returns the setting
 * to its default.
 *
 * @param {RangeSettingProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function RangeSetting({
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  readout,
  downLabel,
  upLabel,
  note,
  onChange,
}: RangeSettingProps): React.JSX.Element {
  /**
   * Moves the value by one step, kept within range and on a step.
   *
   * @param delta - Which way, -1 or 1.
   */
  const nudge = (delta: number): void => onChange(stepSetting(value + delta * step, min, max, step));
  return (
    <div className='flex flex-col gap-[2px]'>
      <div className='flex items-center gap-sm'>
        <span className='w-24 shrink-0 font-medium text-xs text-foreground'>{label}</span>
        <button
          type='button'
          aria-label={downLabel}
          title={downLabel}
          disabled={value <= min}
          className={`${SETTINGS_BUTTON} border-border bg-muted text-foreground disabled:opacity-40`}
          onClick={(): void => nudge(-1)}>
          <Minus size={12} />
        </button>
        <VoxelSlider
          skipNav
          label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          className='flex-1'
          onChange={(v: number): void => onChange(stepSetting(v, min, max, step))} />
        <button
          type='button'
          aria-label={upLabel}
          title={upLabel}
          disabled={value >= max}
          className={`${SETTINGS_BUTTON} border-border bg-muted text-foreground disabled:opacity-40`}
          onClick={(): void => nudge(1)}>
          <Plus size={12} />
        </button>
        <span className='w-24 text-right font-medium text-[13px] text-foreground'>{readout(value)}</span>
        <ResetButton
          label={label}
          defaultReadout={readout(defaultValue)}
          atDefault={sameSetting(value, defaultValue)}
          onReset={(): void => onChange(defaultValue)} />
      </div>
      {note && (
        <div className='flex gap-sm'>
          <span className='w-24 shrink-0' />
          <span className='font-medium text-[11px] leading-relaxed text-foreground-subtle'>{note}</span>
        </div>
      )}
    </div>
  );
}

export default RangeSetting;
