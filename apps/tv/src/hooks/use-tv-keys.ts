// Packages
import React, { useEffect } from 'react';

// Local Imports
import { GAME_KEYS } from '../config/tv';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';

/**
 * The TV's keyboard shortcuts: Escape leaves incognito and the map editor;
 * otherwise (not while typing, holding a modifier, or editing the map) I
 * toggles incognito, B forces a blood moon, K kills every monster, and the
 * `GAME_KEYS` letters flip their Game tab switch. Set up once; reads the
 * page's latest values through refs.
 *
 * @param sendRef - Sends on the TV socket.
 * @param settingsRef - The game settings as last sent.
 * @param editingRef - Whether the map editor is open.
 * @param setIncognito - Turns incognito on or off, or flips it.
 * @param closeEditor - Closes the map editor.
 */
export function useTvKeys(
  sendRef: React.RefObject<(msg: ClientMessage) => void>,
  settingsRef: React.RefObject<GameSettings>,
  editingRef: React.RefObject<boolean>,
  setIncognito: React.Dispatch<React.SetStateAction<boolean>>,
  closeEditor: () => void,
): void {
  useEffect(() => {
    /**
     * Handles the TV's keyboard shortcuts.
     *
     * @param e - The key event.
     */
    const keys = (e: KeyboardEvent): void => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName));
      if (e.key === 'Escape') {
        setIncognito(false);
        closeEditor();
      } else if (typing || e.ctrlKey || e.metaKey || e.altKey || editingRef.current) {
        return;
      } else if (e.key.toLowerCase() === 'i') {
        setIncognito((on: boolean): boolean => !on);
      } else if (e.key.toLowerCase() === 'b') {
        sendRef.current({ t: 'start-world-event', kind: 'blood-moon' });
      } else if (e.key.toLowerCase() === 'k') {
        sendRef.current({ t: 'kill-monsters' });
      } else if (GAME_KEYS[e.key.toLowerCase()]) {
        const key = GAME_KEYS[e.key.toLowerCase()]!;
        const on = settingsRef.current[key];
        sendRef.current({ t: 'game-settings', settings: { [key]: !on } });
      }
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, []);
}
