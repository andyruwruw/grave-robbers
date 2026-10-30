/**
 * What an mp3's ID3v2 tag says about it.
 */
export interface Id3Tags {
  /**
   * The song's title (`TIT2`).
   */
  title: string | null;

  /**
   * Who made it (`TPE1`).
   */
  artist: string | null;

  /**
   * The front cover picture (`APIC`).
   */
  art: Blob | null;
}
