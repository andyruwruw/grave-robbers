// Local Imports
import {
  MAX_PANES,
  SPAWN_PANE,
  WHOLE_MAP,
} from '../config/tv';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { EditorState } from '@halloween/controls/types/map-editor';
import type { Pane } from '../types/panes';

/**
 * The players playing here on a huge world: connected and not followed by
 * a /play screen, up to `MAX_PANES`.
 *
 * @param players - Everyone in the snapshot.
 * @param watched - The ids /play screens follow.
 * @returns The local players.
 */
export function localPanes(players: PlayerState[], watched: string[]): PlayerState[] {
  return players.filter((p: PlayerState): boolean => p.connected && !watched.includes(p.id)).slice(0, MAX_PANES);
}

/**
 * The panes to show: the whole map on a classic map or in the editor,
 * otherwise a pane per local player, or the spawn when there are none.
 *
 * @param huge - Whether the world is huge.
 * @param editor - The map editor's state, or null while it's closed.
 * @param locals - A pane per local player.
 * @returns The panes.
 */
export function panesFor(huge: boolean, editor: EditorState | null, locals: Pane[]): Pane[] {
  return !huge || editor ? WHOLE_MAP : locals.length > 0 ? locals : SPAWN_PANE;
}
