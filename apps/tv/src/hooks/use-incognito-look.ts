// Packages
import { useState } from 'react';
import { DEFAULT_INCOGNITO_LOOK, INCOGNITO_LOOK_RANGES } from '@halloween/controls/config/incognito-look';
import { INCOGNITO_LOOK_STORAGE_KEY } from '@halloween/ui/config/storage-keys';
import { readStorage, writeStorage } from '@halloween/ui/helpers/storage';

// Types
import type { IncognitoLook } from '@halloween/controls/types/incognito-look';

/**
 * The TV's saved Incognito look, each value clamped into its slider's
 * range and anything missing or unreadable filled from the defaults.
 *
 * @returns The look.
 */
function loadIncognitoLook(): IncognitoLook {
  let saved: Partial<IncognitoLook> = {};
  try {
    saved = JSON.parse(readStorage(INCOGNITO_LOOK_STORAGE_KEY) ?? '{}') as Partial<IncognitoLook>;
  } catch {
    // Unreadable: fall back to the defaults.
  }
  const look = { ...DEFAULT_INCOGNITO_LOOK };
  for (const key of Object.keys(INCOGNITO_LOOK_RANGES) as (keyof IncognitoLook)[]) {
    const value = saved[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      look[key] = Math.min(INCOGNITO_LOOK_RANGES[key].max, Math.max(INCOGNITO_LOOK_RANGES[key].min, value));
    }
  }
  return look;
}

/**
 * The look behind the Incognito screen, from the Music tab's sliders, kept
 * per browser once one moves.
 *
 * @returns The look and its setter.
 */
export function useIncognitoLook(): [IncognitoLook, (look: IncognitoLook) => void] {
  const [look, setLook] = useState<IncognitoLook>(loadIncognitoLook);
  /**
   * Sets and saves the look.
   *
   * @param next - The new look.
   */
  const change = (next: IncognitoLook): void => {
    setLook(next);
    writeStorage(INCOGNITO_LOOK_STORAGE_KEY, JSON.stringify(next));
  };
  return [look, change];
}
