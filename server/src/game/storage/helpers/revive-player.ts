// Packages
import { MAX_HP } from '@halloween/shared/players/health';
import { MAX_NAME_LENGTH, PLAYER_COLORS } from '@halloween/shared/players/roster';

// Local Imports
import { PLAYER_SAVE_VERSION } from '../config/save';
import { reviveGear, reviveInventory, reviveTree } from './revive-items';
import { num } from './revive-values';

// Types
import type { RepairLog } from '../repair-log';
import type { PlayerSave } from '../types/save';
import type { Raw } from './revive-values';

/**
 * A player file, field by field: anything missing or bad falls back to its
 * default, and items, goods, or tree nodes that no longer exist are
 * dropped. A bad spot sends them to a spawn (as if dead). Null only when
 * who they are (id, token, name) is missing, since then nobody could
 * claim them.
 * @param raw The save as read (already through its upgrade steps).
 * @param log Where fixes are noted.
 * @returns The character, or null.
 */
export function revivePlayer(raw: Raw, log: RepairLog): PlayerSave | null {
  const name = typeof raw.name === 'string' ? raw.name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH) : '';
  if (typeof raw.id !== 'string' || !raw.id || typeof raw.token !== 'string' || !raw.token || !name) {
    return null;
  }
  const placed = typeof raw.x === 'number' && Number.isFinite(raw.x) && typeof raw.y === 'number' && Number.isFinite(raw.y);
  if (!placed) {
    log.note('sent to a spawn (spot missing)');
  }
  const color = typeof raw.color === 'string' && PLAYER_COLORS.includes(raw.color) ? raw.color : PLAYER_COLORS[0];
  if (color !== raw.color) {
    log.note('replaced bad color');
  }
  return {
    version: PLAYER_SAVE_VERSION,
    id: raw.id,
    token: raw.token,
    name,
    color,
    x: placed ? raw.x as number : 0,
    y: placed ? raw.y as number : 0,
    hp: placed ? num(raw.hp, MAX_HP, log, 'hp', 0, MAX_HP) : 0,
    inventory: reviveInventory(raw.inventory, log),
    bag: reviveGear(raw.bag, log),
    tree: reviveTree(raw.tree, log),
    onlineSeconds: num(raw.onlineSeconds, 0, log, 'time online', 0),
    savedAt: num(raw.savedAt, 0, log, 'saved at', 0),
  };
}
