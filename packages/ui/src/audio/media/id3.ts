// Types
import type { Id3Tags } from '../../types/media';

/**
 * Decodes an ID3 text field in its declared encoding, without the trailing
 * zeros.
 *
 * @param bytes - The field's text bytes.
 * @param encoding - The ID3 encoding byte (0 latin1, 1 UTF-16, 2 UTF-16BE, 3 UTF-8).
 * @returns The trimmed text.
 */
function decode(bytes: Uint8Array, encoding: number): string {
  const label = encoding === 1 ? 'utf-16' : encoding === 2 ? 'utf-16be' : encoding === 3 ? 'utf-8' : 'latin1';
  return new TextDecoder(label).decode(bytes).replace(/\0+$/, '').trim();
}

/**
 * Index just past the zero terminator at or after `from` (two zero bytes on
 * a 16-bit boundary for UTF-16).
 *
 * @param bytes - The frame body.
 * @param from - Where the text starts.
 * @param wide - Whether the text is UTF-16.
 * @returns The index after the terminator, or the body's length without one.
 */
function pastTerminator(bytes: Uint8Array, from: number, wide: boolean): number {
  if (!wide) {
    const end = bytes.indexOf(0, from);
    return end < 0 ? bytes.length : end + 1;
  }
  for (let i = from; i + 1 < bytes.length; i += 2) {
    if (bytes[i] === 0 && bytes[i + 1] === 0) {
      return i + 2;
    }
  }
  return bytes.length;
}

/**
 * Reads the title, artist, and front picture from an mp3's ID3v2.3 or
 * v2.4 tag. Anything missing (or no tag at all) comes back null.
 *
 * @param buffer - The file's first bytes, through the end of its tag.
 * @returns What the tag says.
 */
export function readId3(buffer: ArrayBuffer): Id3Tags {
  const tags: Id3Tags = { title: null, artist: null, art: null };
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10 || bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return tags;
  }
  const version = bytes[3];
  /**
   * Reads a 4-byte syncsafe integer (7 bits per byte).
   * @param i Offset of its first byte.
   * @returns The integer.
   */
  const syncsafe = (i: number): number => (bytes[i] << 21) | (bytes[i + 1] << 14) | (bytes[i + 2] << 7) | bytes[i + 3];
  const end = Math.min(bytes.length, 10 + syncsafe(6));
  let at = 10;
  if (bytes[5] & 0x40) {
    at += version === 4 ? syncsafe(10) : 4 + ((bytes[10] << 24) | (bytes[11] << 16) | (bytes[12] << 8) | bytes[13]);
  }
  while (at + 10 <= end && bytes[at] !== 0) {
    const id = String.fromCharCode(...bytes.subarray(at, at + 4));
    const size = version === 4 ? syncsafe(at + 4) : (bytes[at + 4] << 24) | (bytes[at + 5] << 16) | (bytes[at + 6] << 8) | bytes[at + 7];
    const body = bytes.subarray(at + 10, Math.min(end, at + 10 + size));
    at += 10 + size;
    if (body.length === 0) {
      continue;
    }
    if (id === 'TIT2' || id === 'TPE1') {
      tags[id === 'TIT2' ? 'title' : 'artist'] = decode(body.subarray(1), body[0]) || null;
    } else if (id === 'APIC' && !tags.art) {
      const encoding = body[0];
      const mimeEnd = pastTerminator(body, 1, false);
      const mime = decode(body.subarray(1, mimeEnd), 0) || 'image/jpeg';
      const dataStart = pastTerminator(body, mimeEnd + 1, encoding === 1 || encoding === 2);
      tags.art = new Blob([body.slice(dataStart)], { type: mime.includes('/') ? mime : `image/${mime.toLowerCase()}` });
    }
  }
  return tags;
}
