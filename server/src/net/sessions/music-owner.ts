// Local Imports
import { HubPart } from '../core/hub-part';
import { isTv } from '../helpers/session';

// Types
import type { WebSocket } from 'ws';
import type { TvStatus } from '@halloween/shared/audio/tv-control';
import type { Session } from '../types/session';

/**
 * The one TV page that plays music (the newest, unless another claims
 * it), so two open TV pages never play over each other.
 */
export class MusicOwner extends HubPart {
  /**
   * The TV page playing the music.
   */
  owner: WebSocket | null = null;

  /**
   * The TV's music, last reported, for admin pages that open later.
   */
  tvStatus: TvStatus | null = null;

  /**
   * Hands the music to one TV page and tells every TV page whether it's
   * the one.
   * @param ws The TV page, or null for none.
   */
  setMusicOwner(ws: WebSocket | null): void {
    this.owner = ws;
    for (const [other, session] of this.sessions.sockets) {
      if (isTv(session)) {
        this.sessions.send(other, { t: 'music-owner', owner: other === ws });
      }
    }
  }

  /**
   * A socket closed: if it had the music, the newest TV page left gets it.
   * @param ws The closed socket, already out of the registry.
   */
  handOff(ws: WebSocket): void {
    if (ws === this.owner) {
      const tvs = [...this.sessions.sockets].filter(([, s]: [WebSocket, Session]): boolean => isTv(s));
      this.setMusicOwner(tvs.at(-1)?.[0] ?? null);
    }
  }
}
