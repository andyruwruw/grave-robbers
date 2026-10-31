// Packages
import { deflateSync } from 'node:zlib';

/**
 * CRC-32 of each byte value, for PNG chunk checksums.
 */
const CRC_TABLE = Array.from({ length: 256 }, (_, n: number): number => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

/**
 * The CRC-32 of some bytes.
 * @param bytes The bytes.
 * @returns Their checksum.
 */
function crc32(bytes: Buffer): number {
  let c = 0xffffffff;
  for (const b of bytes) {
    c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * One PNG chunk: length, type, data, checksum.
 * @param type The four-letter type.
 * @param data Its data.
 * @returns The chunk's bytes.
 */
function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/**
 * Encodes square RGBA pixels as a PNG.
 * @param pixels RGBA pixels, row by row from the top.
 * @param px Width and height in pixels.
 * @returns The PNG file's bytes.
 */
export function encodePng(pixels: Uint8Array, px: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(px, 0);
  header.writeUInt32BE(px, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const raw = Buffer.alloc(px * (px * 4 + 1));
  for (let y = 0; y < px; y++) {
    raw.set(pixels.subarray(y * px * 4, (y + 1) * px * 4), y * (px * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
