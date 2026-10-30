// Packages
import { FOLLOW_TALL } from '@halloween/renderer/world/camera/config/camera';
import {
  readStorage,
  writeStorage,
} from '@halloween/ui/helpers/storage';

// Local Imports
import {
  DEFAULT_KEYS,
  DEFAULT_PAD,
  KEY_ACTIONS,
  MENU_SIZES,
  PAD_ACTIONS,
  PAD_BUTTON_NAMES,
  PLAY_STORAGE_KEY,
  ZOOM_MAX,
  ZOOM_MIN,
} from '../config/bindings';

// Types
import type { PlaySettings } from '../types/play';

/**
 * A key or click as people say it ("W", "Left Shift", "Left click").
 *
 * @param code - A `KeyboardEvent.code`, or `Mouse0`..`Mouse2`.
 * @returns Its name.
 */
export function keyLabel(code: string): string {
  const named: Record<string, string> = { Mouse0: 'Left click', Mouse1: 'Middle click', Mouse2: 'Right click', Space: 'Space', Escape: 'Esc', ShiftLeft: 'Left Shift', ShiftRight: 'Right Shift', ControlLeft: 'Left Ctrl', ControlRight: 'Right Ctrl', AltLeft: 'Left Alt', AltRight: 'Right Alt', ArrowUp: 'Up arrow', ArrowDown: 'Down arrow', ArrowLeft: 'Left arrow', ArrowRight: 'Right arrow', Tab: 'Tab', Enter: 'Enter', Backspace: 'Backspace' };
  return named[code] ?? code.replace(/^Key|^Digit|^Numpad/, '');
}

/**
 * A controller button by its Xbox name ("RT", "Back").
 *
 * @param button - A standard-mapping button index.
 * @returns Its name.
 */
export function padLabel(button: number): string {
  return PAD_BUTTON_NAMES[button] ?? `Button ${button}`;
}

/**
 * Binds `value` to `action`, swapping it with whichever action had it so
 * no two share one.
 *
 * @param map - The bindings.
 * @param action - The action to bind.
 * @param value - The key or button.
 * @returns The new bindings.
 */
export function rebind<A extends string, V>(map: Record<A, V>, action: A, value: V): Record<A, V> {
  const next = { ...map };
  const holder = (Object.keys(next) as A[]).find((a: A): boolean => next[a] === value);
  if (holder) {
    next[holder] = map[action];
  }
  next[action] = value;
  return next;
}

/**
 * The saved bindings that are still valid.
 *
 * @param saved - The saved bindings, whatever shape they're in.
 * @param actions - The actions to look for.
 * @param ok - Whether a saved value is usable.
 * @returns The usable bindings.
 */
export function pick<A extends string>(saved: unknown, actions: A[], ok: (v: unknown) => boolean): Partial<Record<A, never>> {
  const out: Partial<Record<A, never>> = {};
  if (saved && typeof saved === 'object') {
    for (const a of actions) {
      const v = (saved as Record<string, unknown>)[a];
      if (ok(v)) {
        out[a] = v as never;
      }
    }
  }
  return out;
}

/**
 * The saved settings, or the defaults.
 *
 * @returns The settings.
 */
export function loadPlaySettings(): PlaySettings {
  try {
    const saved = JSON.parse(readStorage(PLAY_STORAGE_KEY) ?? '{}');
    return {
      zoom: typeof saved.zoom === 'number' ? Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, saved.zoom)) : FOLLOW_TALL,
      menuSize: saved.menuSize in MENU_SIZES ? saved.menuSize : 'small',
      keys: { ...DEFAULT_KEYS, ...pick(saved.keys, KEY_ACTIONS, (v: unknown): boolean => typeof v === 'string') },
      pad: { ...DEFAULT_PAD, ...pick(saved.pad, PAD_ACTIONS, (v: unknown): boolean => Number.isInteger(v)) },
    };
  } catch {
    return { zoom: FOLLOW_TALL, menuSize: 'small', keys: { ...DEFAULT_KEYS }, pad: { ...DEFAULT_PAD } };
  }
}

/**
 * Saves the settings.
 *
 * @param settings - The settings.
 */
export function savePlaySettings(settings: PlaySettings): void {
  writeStorage(PLAY_STORAGE_KEY, JSON.stringify(settings));
}
