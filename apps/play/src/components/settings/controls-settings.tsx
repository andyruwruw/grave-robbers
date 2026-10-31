// Packages
import React from 'react';

// Local Imports
import {
  ACTION_LABELS,
  DEFAULT_KEYS,
  DEFAULT_PAD,
  KEY_ACTIONS,
  PAD_ACTIONS,
} from '../../config/bindings';
import BindingGlyph from '../bindings/binding-glyph';
import BindingRow from './binding-row';
import SectionHeader from './section-header';

// Types
import type {
  Capture,
  KeyAction,
  PadAction,
  PlaySettings,
} from '../../types/play';

/**
 * Props for ControlsSettings.
 */
interface ControlsSettingsProps {
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
}

/**
 * The Controls tab: what each key and controller button does. Pressing a
 * binding waits for the next key or click (for the keyboard) or button
 * (for the controller); Esc cancels, and a key already used elsewhere swaps
 * places. The sticks always walk and aim, and the mouse always aims.
 *
 * @param {ControlsSettingsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tab.
 */
function ControlsSettings({ settings, onChange, capturing, onCapture }: ControlsSettingsProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-lg'>
      <section className='flex flex-col gap-xsm'>
        <SectionHeader
          title='Keyboard and mouse'
          onReset={(): void => onChange({ ...settings, keys: { ...DEFAULT_KEYS } })} />
        <span className='font-medium text-[11px] leading-relaxed text-foreground-subtle'>The mouse aims</span>
        {KEY_ACTIONS.map((action: KeyAction) => (
          <BindingRow
            key={action}
            label={ACTION_LABELS[action]}
            value={(
              <BindingGlyph
                binding={{ code: settings.keys[action] }}
                size={18} />
            )}
            waiting={capturing?.device === 'keys' && capturing.action === action}
            onPress={(): void => onCapture({ device: 'keys', action })} />
        ))}
      </section>
      <section className='flex flex-col gap-xsm'>
        <SectionHeader
          title='Controller'
          onReset={(): void => onChange({ ...settings, pad: { ...DEFAULT_PAD } })} />
        <span className='font-medium text-[11px] leading-relaxed text-foreground-subtle'>Left stick walks, right stick aims</span>
        {PAD_ACTIONS.map((action: PadAction) => (
          <BindingRow
            key={action}
            label={ACTION_LABELS[action]}
            value={(
              <BindingGlyph
                binding={{ button: settings.pad[action] }}
                size={18} />
            )}
            waiting={capturing?.device === 'pad' && capturing.action === action}
            onPress={(): void => onCapture({ device: 'pad', action })} />
        ))}
      </section>
    </div>
  );
}

export default ControlsSettings;
