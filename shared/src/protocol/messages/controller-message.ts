// Types
import type { PhoneSound } from '../../audio/phone-sounds';
import type { Inventory } from '../../goods/goods';
import type { BagItem, Gear } from '../../inventory/bag-items';
import type { TreeState } from '../../skill-tree/types/skill-tree';
import type { PadInfo } from '../pads';
import type { PlayerIdentity } from '../state/player-state';
import type { Vitals } from '../state/vitals';

/**
 * Messages the server sends to a controller.
 */
export type ControllerMessage =
  /**
   * The player a resumed token belongs to, or null to join fresh.
   */
  | { t: 'controller-welcome'; identity: PlayerIdentity | null }
  /**
   * Joined the game.
   */
  | { t: 'joined'; identity: PlayerIdentity }
  /**
   * Joining failed, and why.
   */
  | { t: 'join-error'; error: string }
  /**
   * Everything carried, the skill tree, and the research and anvil levels in
   * reach.
   */
  | { t: 'inventory'; inventory: Inventory; gear: Gear; tree: TreeState; research: number; anvil: number | null }
  /**
   * Why a structure can't be placed.
   */
  | { t: 'build-error'; error: string }
  /**
   * Health and death state.
   */
  | { t: 'vitals'; vitals: Vitals }
  /**
   * Sounds for the phone to play.
   */
  | { t: 'sounds'; names: PhoneSound[] }
  /**
   * This player just killed another player, and the candy they have now.
   */
  | { t: 'naughty'; candy: number }
  /**
   * The open storage chest's slots, or null once it's closed.
   */
  | { t: 'stash'; items: (BagItem | null)[] | null }
  /**
   * The game controllers plugged into TVs.
   */
  | { t: 'pads'; pads: PadInfo[] }
  /**
   * A claimed controller opened one of the phone's panels.
   */
  | { t: 'pad-menu'; menu: 'bag' | 'craft' | 'tree' }
  /**
   * Left the game.
   */
  | { t: 'left' };
