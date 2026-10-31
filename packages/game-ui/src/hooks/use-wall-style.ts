// Packages
import { useCallback, useEffect, useState } from 'react';
import { clampStyle, wallStyles } from '@halloween/shared/structures/wall-styles';
import { WALL_STYLE_STORAGE_KEY } from '@halloween/ui/config/storage-keys';
import { readStorage, writeStorage } from '@halloween/ui/helpers/storage';

// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { PlayerCommands } from '../session/player-commands';

/**
 * The look picked for each wall, as kept on this device.
 * @returns The looks, by wall.
 */
function readPicks(): Partial<Record<StructureKind, number>> {
  try {
    const picks = JSON.parse(readStorage(WALL_STYLE_STORAGE_KEY) ?? '{}');
    return typeof picks === 'object' && picks !== null ? picks : {};
  } catch {
    return {};
  }
}

/**
 * The look a wall being built goes down in: the one last picked for that
 * wall on this device (sent to the server whenever building one starts or
 * the pick changes), and ways to change it.
 */
export interface WallStyle {
  /**
   * The looks it comes in, by name (empty for anything else).
   */
  styles: string[];

  /**
   * The look picked.
   */
  style: number;

  /**
   * Picks a look.
   */
  pick: (style: number) => void;

  /**
   * Steps to the next (1) or previous (-1) look, round and round.
   */
  cycle: (dir: 1 | -1) => void;
}

/**
 * The look of the wall being built (see `WALL_STYLES`).
 *
 * @param {StructureKind | null} kind - What's being built, or null.
 * @param {PlayerCommands} commands - The player's commands.
 * @returns {WallStyle} The look and how to change it.
 */
export function useWallStyle(kind: StructureKind | null, commands: PlayerCommands): WallStyle {
  const styles = kind ? wallStyles(kind) : [];
  const [style, setStyle] = useState(0);

  useEffect(() => {
    if (kind && styles.length > 0) {
      const saved = clampStyle(kind, readPicks()[kind] ?? 0);
      setStyle(saved);
      commands.buildStyle(saved);
    }
  }, [kind]);

  const pick = useCallback((next: number): void => {
    if (!kind || styles.length === 0) {
      return;
    }
    const clamped = clampStyle(kind, next);
    setStyle(clamped);
    writeStorage(WALL_STYLE_STORAGE_KEY, JSON.stringify({ ...readPicks(), [kind]: clamped }));
    commands.buildStyle(clamped);
  }, [kind, styles.length, commands]);

  const cycle = useCallback((dir: 1 | -1): void => {
    if (styles.length > 0) {
      pick((style + dir + styles.length) % styles.length);
    }
  }, [style, styles.length, pick]);

  return { styles, style, pick, cycle };
}
