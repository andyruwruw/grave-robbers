// Packages
import React from 'react';
import {
  LogOut,
  Minus,
  Plus,
} from 'lucide-react';

// Local Imports
import {
  ACTION_LABELS,
  DEFAULT_KEYS,
  DEFAULT_PAD,
  KEY_ACTIONS,
  MENU_SIZES,
  PAD_ACTIONS,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from '../../config/bindings';
import { SETTINGS_BUTTON } from '../../config/play';
import { keyLabel, padLabel } from '../../helpers/play-settings';
import BindingRow from './binding-row';
import SectionHeader from './section-header';

// Types
import type {
  Capture,
  KeyAction,
  MenuSize,
  PadAction,
  PlaySettings,
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
   * Removes the player from the game.
   */
  onLeave: () => void;
}

/**
 * The /play screen's own settings, in sections one above the other: View
 * (how close the camera follows, in tiles of ground top to bottom, and how
 * big the menus are), what each key and controller button does, and Leave. Pressing a binding waits for the next
 * key or click (for the keyboard) or button (for the controller); Esc
 * cancels, and a key already used elsewhere swaps places. The sticks
 * always walk and aim, and the mouse always aims.
 *
 * @param {SettingsPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function SettingsPanel({
  settings,
  onChange,
  capturing,
  onCapture,
  onLeave,
}: SettingsPanelProps): React.JSX.Element {
  /**
   * Changes the zoom by a step, kept within its range.
   *
   * @param delta - How much to add.
   */
  const zoom = (delta: number): void => onChange({ ...settings, zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, settings.zoom + delta)) });
  return (
    <div className='mx-auto flex w-full max-w-[420px] flex-col gap-lg'>
      <section className='flex flex-col gap-sm'>
        <span className='font-medium text-[13px] text-foreground-muted'>View</span>
        <div className='flex items-center gap-sm'>
          <span className='min-w-0 flex-1 font-medium text-xs text-foreground'>Zoom</span>
          <button
            type='button'
            aria-label='Zoom in'
            title='Zoom in'
            disabled={settings.zoom <= ZOOM_MIN}
            className={`${SETTINGS_BUTTON} border-border bg-muted text-foreground disabled:opacity-40`}
            onClick={(): void => zoom(-ZOOM_STEP)}>
            <Plus size={12} />
          </button>
          <span className='w-28 text-center font-medium text-[13px] text-foreground'>{settings.zoom} tiles tall</span>
          <button
            type='button'
            aria-label='Zoom out'
            title='Zoom out'
            disabled={settings.zoom >= ZOOM_MAX}
            className={`${SETTINGS_BUTTON} border-border bg-muted text-foreground disabled:opacity-40`}
            onClick={(): void => zoom(ZOOM_STEP)}>
            <Minus size={12} />
          </button>
        </div>
        <div className='flex items-center gap-sm'>
          <span className='min-w-0 flex-1 font-medium text-xs text-foreground'>Menu size</span>
          {(Object.keys(MENU_SIZES) as MenuSize[]).map((size: MenuSize) => (
            <button
              key={size}
              type='button'
              aria-pressed={settings.menuSize === size}
              className={`${SETTINGS_BUTTON} capitalize ${settings.menuSize === size ? 'border-brand bg-brand-muted text-foreground' : 'border-border bg-muted text-foreground-muted'}`}
              onClick={(): void => onChange({ ...settings, menuSize: size })}>
              {size}
            </button>
          ))}
        </div>
      </section>
      <section className='flex flex-col gap-xsm'>
        <SectionHeader
          title='Keyboard and mouse'
          onReset={(): void => onChange({ ...settings, keys: { ...DEFAULT_KEYS } })} />
        <span className='font-medium text-[11px] leading-relaxed text-foreground-subtle'>The mouse aims</span>
        {KEY_ACTIONS.map((action: KeyAction) => (
          <BindingRow
            key={action}
            label={ACTION_LABELS[action]}
            value={keyLabel(settings.keys[action])}
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
            value={padLabel(settings.pad[action])}
            waiting={capturing?.device === 'pad' && capturing.action === action}
            onPress={(): void => onCapture({ device: 'pad', action })} />
        ))}
      </section>
      <button
        type='button'
        className={`${SETTINGS_BUTTON} self-start border-border bg-muted text-status-warning-foreground`}
        onClick={onLeave}>
        <LogOut size={12} />
        Leave game
      </button>
    </div>
  );
}

export default SettingsPanel;
