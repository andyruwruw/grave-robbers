// Packages
import { randomInt } from 'node:crypto';
import { TRANSFER_CODE_LENGTH } from '@halloween/shared/players/roster';

// Local Imports
import { TRANSFER_CODE_CHARS, TRANSFER_CODE_SECONDS } from './config/transfer';

/**
 * Short codes that move a character to another device: the phone playing
 * it shows one, and whoever types it with that name on the join form gets
 * the character. In memory only; each works once, for
 * TRANSFER_CODE_SECONDS.
 */
export class TransferCodes {
  /**
   * Live codes: whose character, and until when (ms since the epoch).
   */
  private _codes = new Map<string, { id: string; until: number }>();

  /**
   * A new code for a character (replacing any it had).
   * @param id The character's id.
   * @returns The code and when it stops working.
   */
  make(id: string): { code: string; until: number } {
    for (const [code, entry] of this._codes) {
      if (entry.id === id || entry.until < Date.now()) {
        this._codes.delete(code);
      }
    }
    let code = '';
    do {
      code = Array.from({ length: TRANSFER_CODE_LENGTH }, (): string => TRANSFER_CODE_CHARS[randomInt(TRANSFER_CODE_CHARS.length)]).join('');
    } while (this._codes.has(code));
    const until = Date.now() + TRANSFER_CODE_SECONDS * 1000;
    this._codes.set(code, { id, until });
    return { code, until };
  }

  /**
   * Uses up a code, if it's live and for this character.
   * @param code The code typed (any case, spaces ignored).
   * @param id The character it should be for.
   * @returns Whether it was.
   */
  redeem(code: string, id: string): boolean {
    const clean = code.replace(/\s+/g, '').toUpperCase();
    const entry = this._codes.get(clean);
    if (!entry || entry.id !== id || entry.until < Date.now()) {
      return false;
    }
    this._codes.delete(clean);
    return true;
  }
}
