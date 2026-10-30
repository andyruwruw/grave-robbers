// Packages
import { useState } from 'react';

// Local Imports
import { loadPlaySettings, savePlaySettings } from '../helpers/play-settings';

// Types
import type { PlaySettings } from '../types/play';

/**
 * What `usePlaySettings` gives the page.
 */
export interface PlaySettingsState {
  /**
   * The screen's settings.
   */
  settings: PlaySettings;

  /**
   * Changes and saves the settings.
   */
  changeSettings: (next: PlaySettings) => void;
}

/**
 * The /play screen's settings, loaded once and saved on every change.
 *
 * @returns The settings and how to change them.
 */
export function usePlaySettings(): PlaySettingsState {
  const [settings, setSettings] = useState<PlaySettings>(loadPlaySettings);

  /**
   * Uses new settings and saves them.
   *
   * @param next - The new settings.
   */
  const changeSettings = (next: PlaySettings): void => {
    setSettings(next);
    savePlaySettings(next);
  };

  return { settings, changeSettings };
}
