// Packages
import { FOLLOW_TALL } from '@halloween/renderer/world/camera/config/camera';
import { DISPLAY_RANGES } from '@halloween/renderer/world/config/display-settings';
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
  PIXEL_SIZE_DEFAULT,
  PIXEL_SIZE_MAX,
  PIXEL_SIZE_MIN,
  PLAY_STORAGE_KEY,
  ZOOM_MAX,
  ZOOM_MIN,
} from '../config/bindings';
import {
  CAMERA_LEAD_DEFAULT,
  CAMERA_LEAD_OLD_DEFAULT,
  CAMERA_LEAD_RANGE,
  CAMERA_LEAD_SPEED_DEFAULT,
  CAMERA_LEAD_SPEED_RANGE,
  PLAY_DISPLAY_DEFAULTS,
  SFX_VOLUME_DEFAULT,
  SFX_VOLUME_RANGE,
  UI_SCALE_DEFAULT,
  UI_SCALE_MAX,
  UI_SCALE_MIN,
} from '../config/settings';

// Types
import type {
  DisplayFlag,
  DisplayNumber,
  DisplaySettings,
} from '@halloween/renderer/types/display-settings';
import type { KeyAction, PlaySettings } from '../types/play';

/**
 * A key or click as people say it ("W", "Left Shift", "Left click").
 *
 * @param code - A `KeyboardEvent.code`, or `Mouse0`..`Mouse2` ('' for
 * unbound).
 * @returns Its name ('None' when unbound).
 */
export function keyLabel(code: string): string {
  const named: Record<string, string> = { Mouse0: 'Left click', Mouse1: 'Middle click', Mouse2: 'Right click', Space: 'Space', Escape: 'Esc', ShiftLeft: 'Left Shift', ShiftRight: 'Right Shift', ControlLeft: 'Left Ctrl', ControlRight: 'Right Ctrl', AltLeft: 'Left Alt', AltRight: 'Right Alt', ArrowUp: 'Up arrow', ArrowDown: 'Down arrow', ArrowLeft: 'Left arrow', ArrowRight: 'Right arrow', Tab: 'Tab', Enter: 'Enter', Backspace: 'Backspace' };
  return code === '' ? 'None' : named[code] ?? code.replace(/^Key|^Digit|^Numpad/, '');
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
 * A saved number kept within range, or the fallback when it isn't a number.
 *
 * @param v - The saved value.
 * @param min - The smallest allowed.
 * @param max - The largest allowed.
 * @param fallback - What to use when it's missing.
 * @returns The number.
 */
export const clampSaved = (v: unknown, min: number, max: number, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback);

/**
 * The saved display settings, each number clamped into `DISPLAY_RANGES`
 * and each flag a boolean, with /play's defaults for anything missing.
 *
 * @param saved - The saved display settings, whatever shape they're in.
 * @returns The display settings.
 */
export const loadDisplay = (saved: unknown): DisplaySettings => {
  const out: DisplaySettings = { ...PLAY_DISPLAY_DEFAULTS };
  const raw = saved && typeof saved === 'object' ? (saved as Record<string, unknown>) : {};
  for (const key of Object.keys(DISPLAY_RANGES) as DisplayNumber[]) {
    const { min, max } = DISPLAY_RANGES[key];
    out[key] = clampSaved(raw[key], min, max, out[key]);
  }
  for (const key of Object.keys(out) as (keyof DisplaySettings)[]) {
    if (!(key in DISPLAY_RANGES) && typeof raw[key] === 'boolean') {
      out[key as DisplayFlag] = raw[key] as boolean;
    }
  }
  return out;
};

/**
 * A new /play screen's settings.
 *
 * @returns The defaults.
 */
export const defaultPlaySettings = (): PlaySettings => ({
  zoom: FOLLOW_TALL,
  pixelSize: PIXEL_SIZE_DEFAULT,
  uiScale: UI_SCALE_DEFAULT,
  display: { ...PLAY_DISPLAY_DEFAULTS },
  cameraLead: CAMERA_LEAD_DEFAULT,
  cameraLeadSpeed: CAMERA_LEAD_SPEED_DEFAULT,
  rumble: true,
  sfxVolume: SFX_VOLUME_DEFAULT,
  keys: { ...DEFAULT_KEYS },
  pad: { ...DEFAULT_PAD },
});

/**
 * The saved key bindings, with the default for any action saved before it
 * existed (the Armory's F), unless a saved action already took that key:
 * then the new action starts unbound rather than sharing it.
 *
 * @param saved - The saved bindings, whatever shape they're in.
 * @returns The key bindings.
 */
export const loadKeys = (saved: unknown): Record<KeyAction, string> => {
  const kept = pick(saved, KEY_ACTIONS, (v: unknown): boolean => typeof v === 'string') as Partial<Record<KeyAction, string>>;
  const taken = new Set(Object.values(kept));
  const keys = { ...DEFAULT_KEYS, ...kept };
  for (const a of KEY_ACTIONS) {
    if (!(a in kept) && taken.has(DEFAULT_KEYS[a])) {
      keys[a] = '';
    }
  }
  return keys;
};

/**
 * The saved settings, each validated and kept in range, with the defaults
 * for anything missing (so saves from before a setting existed still load;
 * an old menu size becomes its UI scale, and a save from before Camera
 * lead speed still on the old Camera lead default gets the new one).
 *
 * @returns The settings.
 */
export function loadPlaySettings(): PlaySettings {
  try {
    const saved = JSON.parse(readStorage(PLAY_STORAGE_KEY) ?? '{}');
    const oldLead = !('cameraLeadSpeed' in saved) && saved.cameraLead === CAMERA_LEAD_OLD_DEFAULT;
    const legacyScale = typeof saved.menuSize === 'string' && saved.menuSize in MENU_SIZES ? MENU_SIZES[saved.menuSize as keyof typeof MENU_SIZES] : UI_SCALE_DEFAULT;
    return {
      zoom: clampSaved(saved.zoom, ZOOM_MIN, ZOOM_MAX, FOLLOW_TALL),
      pixelSize: Math.round(clampSaved(saved.pixelSize, PIXEL_SIZE_MIN, PIXEL_SIZE_MAX, PIXEL_SIZE_DEFAULT)),
      uiScale: clampSaved(saved.uiScale, UI_SCALE_MIN, UI_SCALE_MAX, legacyScale),
      display: loadDisplay(saved.display),
      cameraLead: oldLead ? CAMERA_LEAD_DEFAULT : clampSaved(saved.cameraLead, CAMERA_LEAD_RANGE.min, CAMERA_LEAD_RANGE.max, CAMERA_LEAD_DEFAULT),
      cameraLeadSpeed: clampSaved(saved.cameraLeadSpeed, CAMERA_LEAD_SPEED_RANGE.min, CAMERA_LEAD_SPEED_RANGE.max, CAMERA_LEAD_SPEED_DEFAULT),
      rumble: typeof saved.rumble === 'boolean' ? saved.rumble : true,
      sfxVolume: clampSaved(saved.sfxVolume, SFX_VOLUME_RANGE.min, SFX_VOLUME_RANGE.max, SFX_VOLUME_DEFAULT),
      keys: loadKeys(saved.keys),
      pad: { ...DEFAULT_PAD, ...pick(saved.pad, PAD_ACTIONS, (v: unknown): boolean => Number.isInteger(v)) },
    };
  } catch {
    return defaultPlaySettings();
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
