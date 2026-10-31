// Local Imports
import { PLAYER_SAVE_VERSION } from '../config/save';

// Types
import type { Player } from '../../players/player';
import type { PlayerSave } from '../types/save';

/**
 * A player as their save file holds them.
 * @param p The player.
 * @returns Their save.
 */
export function playerSaveOf(p: Player): PlayerSave {
  return {
    version: PLAYER_SAVE_VERSION,
    id: p.id,
    token: p.token,
    name: p.name,
    color: p.color,
    x: p.x,
    y: p.y,
    hp: p.dead ? 0 : p.hp,
    inventory: p.inventory,
    bag: p.bag,
    tree: p.tree,
    onlineSeconds: p.onlineSeconds,
    savedAt: Date.now(),
  };
}
