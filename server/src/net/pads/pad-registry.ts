// Local Imports
import { MAX_PAD_NAME, MAX_TV_PADS } from '../config/limits';
import { HubPart } from '../core/hub-part';
import { emptyPresses, isTv } from '../helpers/session';

// Types
import type { WebSocket } from 'ws';
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { PadInfo, TvPadEntry } from '@halloween/shared/protocol/pads';
import type { Pad } from '../types/pads';

/**
 * Game controllers plugged into TV pages, by id (`<tv>-<index>`), and the
 * token of the player who claimed each (its phone then only does menus).
 */
export class PadRegistry extends HubPart {
  /**
   * Every pad, by id.
   */
  private _pads = new Map<string, Pad>();

  /**
   * Each TV page's number, for pad ids.
   */
  private _tvIds = new WeakMap<WebSocket, number>();

  /**
   * The number the next TV page gets.
   */
  private _nextTvId = 1;

  /**
   * A TV page's number, given on first use.
   * @param ws The TV page.
   * @returns Its number.
   */
  tvId(ws: WebSocket): number {
    let id = this._tvIds.get(ws);
    if (id === undefined) {
      id = this._nextTvId++;
      this._tvIds.set(ws, id);
    }
    return id;
  }

  /**
   * One pad.
   * @param id The pad's id.
   * @returns The pad, if it's plugged in.
   */
  get(id: string): Pad | undefined {
    return this._pads.get(id);
  }

  /**
   * A TV page listed its pads: adds new ones, renames known ones, and
   * forgets the ones it no longer lists.
   * @param ws The TV page.
   * @param list What it listed.
   */
  sync(ws: WebSocket, list: { index: number; name: string }[]): void {
    const tv = this.tvId(ws);
    const seen = new Set<string>();
    for (const p of list.slice(0, MAX_TV_PADS)) {
      if (!p || !Number.isInteger(p.index)) {
        continue;
      }
      const id = `${tv}-${p.index}`;
      seen.add(id);
      const name = String(p.name ?? '').slice(0, MAX_PAD_NAME) || 'Controller';
      const pad = this._pads.get(id);
      if (pad) {
        pad.name = name;
      } else {
        this._pads.set(id, { tv: ws, index: p.index, name, token: null, presses: emptyPresses(), act: false });
      }
    }
    for (const [id, pad] of this._pads) {
      if (pad.tv === ws && !seen.has(id)) {
        this.dropPad(id);
      }
    }
    this.padsChanged();
  }

  /**
   * Gives a free pad to a player, letting go of any pad they had.
   * @param token The player's token.
   * @param pad The pad.
   */
  claim(token: string, pad: Pad): void {
    this.releasePads(token);
    pad.token = token;
    pad.presses = emptyPresses();
    pad.act = false;
    this.padsChanged();
  }

  /**
   * Lets go of every pad a player holds.
   * @param token The player's token.
   */
  releasePads(token: string): void {
    for (const pad of this._pads.values()) {
      if (pad.token === token) {
        this.release(pad);
      }
    }
  }

  /**
   * Whether a player holds any pad.
   * @param token The player's token.
   * @returns Whether they do.
   */
  heldBy(token: string): boolean {
    return [...this._pads.values()].some((p): boolean => p.token === token);
  }

  /**
   * A TV page closed: forgets its pads, if it had any.
   * @param ws The TV page.
   */
  dropTv(ws: WebSocket): void {
    if ([...this._pads.values()].some((p): boolean => p.tv === ws)) {
      for (const [id, pad] of this._pads) {
        if (pad.tv === ws) {
          this.dropPad(id);
        }
      }
      this.padsChanged();
    }
  }

  /**
   * Every pad as one phone sees it.
   * @param token The phone's token.
   * @returns The pads, marked mine or taken.
   */
  padList(token: string): PadInfo[] {
    return [...this._pads].map(([id, p]): PadInfo => ({ id, name: p.name, mine: p.token === token, taken: p.token !== null && p.token !== token }));
  }

  /**
   * Every pad for the displays' Controllers tab.
   * @returns The `tv-pad-list` message.
   */
  padListMessage(): DisplayMessage {
    return { t: 'tv-pad-list', pads: [...this._pads].map(([id, p]): TvPadEntry => ({ id, tv: this.tvId(p.tv), name: p.name, player: p.token ? this.game.joining.playerOf(p.token) : null })) };
  }

  /**
   * Tells every phone which pads there are and who has them, every TV
   * which of its pads to read, and every display the list for its
   * Controllers tab.
   */
  padsChanged(): void {
    this.sessions.broadcastToDisplays(this.padListMessage());
    for (const [ws, session] of this.sessions.sockets) {
      if (session.role === 'controller' && session.token) {
        this.sessions.send(ws, { t: 'pads', pads: this.padList(session.token) });
      } else if (isTv(session)) {
        this.sessions.send(ws, { t: 'pad-claims', indices: [...this._pads.values()].filter((p): boolean => p.tv === ws && p.token !== null).map((p): number => p.index) });
      }
    }
  }

  /**
   * Lets go of a claimed pad: its player stops moving and acting, and
   * slumps if their phone is gone too.
   * @param pad The pad.
   */
  private release(pad: { token: string | null }): void {
    const token = pad.token;
    if (!token) {
      return;
    }
    pad.token = null;
    this.game.controls.setInput(token, 0, 0);
    this.game.controls.setAim(token, 0, 0);
    this.game.controls.setAction(token, false);
    this.game.controls.setBlock(token, false);
    if (!this.sessions.controllers.has(token)) {
      this.game.joining.disconnect(token);
    }
  }

  /**
   * Forgets a pad that was unplugged or whose TV page closed.
   * @param id The pad's id.
   */
  private dropPad(id: string): void {
    const pad = this._pads.get(id);
    if (pad) {
      this.release(pad);
      this._pads.delete(id);
    }
  }
}
