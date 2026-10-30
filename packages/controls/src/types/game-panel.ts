// Types
import type { LucideIcon } from 'lucide-react';
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';

/**
 * One spawn button: what it spawns, its label, and its icon.
 */
export interface Spawn {
  /**
   * What the button spawns.
   */
  kind: SpawnKind;

  /**
   * Its label.
   */
  label: string;

  /**
   * Its icon.
   */
  icon: LucideIcon;
}

/**
 * One on/off switch in the Game tab.
 */
export interface GameSwitch {
  /**
   * The setting it flips.
   */
  key: Exclude<keyof GameSettings, 'daytime' | 'levelBoost'>;

  /**
   * Its name.
   */
  label: string;

  /**
   * The tooltip saying what it does.
   */
  hint: string;

  /**
   * Its icon.
   */
  icon: LucideIcon;

  /**
   * The TV key that flips it, if any.
   */
  shortcut?: string;
}
