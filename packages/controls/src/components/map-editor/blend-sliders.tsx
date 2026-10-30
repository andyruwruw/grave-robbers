// Packages
import React from 'react';
import { BLEND_KEYS, BLEND_LABELS } from '@halloween/shared/map-editor/blend/blend';

// Types
import type { BlendKey } from '@halloween/shared/map-editor/blend/blend';
import type { EditorState } from '../../types/map-editor';

/**
 * Props for the BlendSliders component.
 */
interface BlendSlidersProps {
  /**
   * The editor's state.
   */
  state: EditorState;

  /**
   * Changes the editor's state.
   */
  onChange: (state: EditorState) => void;
}

/**
 * The Mix brush's share of each kind of scenery (together never over
 * 100%), and the bare ground left.
 *
 * @param {BlendSlidersProps} props - Component props.
 * @returns {React.JSX.Element} The rendered sliders.
 */
function BlendSliders({ state, onChange }: BlendSlidersProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-xsm'>
      {BLEND_KEYS.map((key: BlendKey) => {
        const value = state.blend[key] ?? 0;
        const others = BLEND_KEYS.reduce((sum: number, k: BlendKey): number => sum + (k === key ? 0 : state.blend[k] ?? 0), 0);
        return (
          <label
            key={key}
            className='flex items-center gap-sm text-xs text-foreground'>
            <span className='w-20 shrink-0'>{BLEND_LABELS[key]}</span>
            <input
              type='range'
              min={0}
              max={100}
              step={1}
              value={value}
              className='min-w-0 flex-1 accent-brand'
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...state, blend: { ...state.blend, [key]: Math.min(Number(e.target.value), 100 - others) } })} />
            <span className='w-9 shrink-0 text-right text-foreground-subtle'>{value}%</span>
          </label>
        );
      })}
      <span className='flex justify-between text-[11px] text-foreground-subtle'>
        Bare ground
        <span>{100 - BLEND_KEYS.reduce((sum: number, k: BlendKey): number => sum + (state.blend[k] ?? 0), 0)}%</span>
      </span>
    </div>
  );
}

export default BlendSliders;
