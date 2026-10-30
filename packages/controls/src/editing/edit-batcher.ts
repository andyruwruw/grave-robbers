// Local Imports
import { EDIT_SEND_MS } from '../config/map-editor';

// Types
import type { MapEdit } from '@halloween/shared/map-editor/map-edit';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';

/**
 * Batches map edits while dragging, so the server gets one `edit-map` at
 * most every `EDIT_SEND_MS`.
 */
export class EditBatcher {
  /**
   * Edits waiting to go.
   */
  private _queue: MapEdit[] = [];

  /**
   * When (performance.now ms) the last batch went.
   */
  private _lastSent = 0;

  /**
   * The pending send, if one is scheduled.
   */
  private _timer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Makes a batcher.
   *
   * @param _send - Sends to the server (read at send time, so it can change).
   */
  constructor(private readonly _send: (msg: ClientMessage) => void) {}

  /**
   * Sends whatever is queued now. An arrow property, since it's handed to
   * `setTimeout`.
   */
  readonly flush = (): void => {
    this._timer = null;
    if (this._queue.length > 0) {
      this._send({ t: 'edit-map', edits: this._queue });
      this._queue = [];
      this._lastSent = performance.now();
    }
  };

  /**
   * Queues an edit, sending straight away if the last batch went long
   * enough ago, or else once it has.
   *
   * @param e - The edit.
   */
  push(e: MapEdit): void {
    this._queue.push(e);
    const wait = EDIT_SEND_MS - (performance.now() - this._lastSent);
    if (wait <= 0) {
      this.flush();
    } else {
      this._timer ??= setTimeout(this.flush, wait);
    }
  }

  /**
   * Cancels a scheduled send.
   */
  dispose(): void {
    if (this._timer) {
      clearTimeout(this._timer);
    }
  }
}
