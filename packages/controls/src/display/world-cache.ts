// Types
import type { BlendAreas } from '@halloween/shared/map-editor/blend/blend-areas';
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { WorldSnapshot } from '../types/world';

/**
 * The latest world and players a page was sent, kept outside React so a
 * renderer that mounts later (or remounts) starts from them.
 */
export class WorldCache {
  /**
   * The last world sent, or null before one arrives.
   */
  world: WorldSnapshot | null = null;

  /**
   * Everyone in the last state snapshot.
   */
  players: PlayerState[] = [];

  /**
   * The Mix settings the map remembers, for the map editor's picker.
   */
  readonly blends: { current: BlendAreas | null } = { current: null };

  /**
   * Keeps a world message.
   *
   * @param msg - The world the server sent.
   */
  rememberWorld(msg: Extract<DisplayMessage, { t: 'world' }>): void {
    this.world = { seed: msg.seed, width: msg.width, tiles: msg.tiles, levels: msg.levels, ramps: msg.ramps, view: msg.view };
    this.blends.current = msg.blends;
  }

  /**
   * Keeps the players from a state snapshot.
   *
   * @param players - Everyone in the snapshot.
   */
  rememberPlayers(players: PlayerState[]): void {
    this.players = players;
  }

  /**
   * Hands a renderer that just mounted the cached world (if any) and
   * players.
   *
   * @param renderer - The new renderer.
   */
  prime(renderer: WorldRenderer): void {
    if (this.world) {
      renderer.setWorld(this.world.seed, this.world.width, this.world.tiles, this.world.levels, this.world.ramps, this.world.view);
    }
    renderer.setPlayers(this.players);
  }
}
