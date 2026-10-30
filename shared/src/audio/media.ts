/**
 * One bundled song from the server's media folder: an mp3 per part (or one
 * `full` mp3), played together, and its cover art if it has any.
 */
export interface MediaSong {
  /**
   * The song folder's name, unique among the songs.
   */
  id: string;

  /**
   * Each part's name and mp3 URL, played together in sync.
   */
  parts: { name: string; url: string }[];

  /**
   * The cover art's URL, if the folder has one.
   */
  art: string | null;

  /**
   * Title and artist from the song folder's `meta.json`, which win over the
   * mp3's ID3 tags (for songs tagged wrong or not at all).
   */
  title: string | null;

  /**
   * The artist from `meta.json`, if given.
   */
  artist: string | null;
}

/**
 * Everything in the server's media folder: songs, mp3s that replace
 * synthesized sound effects, and ambience loops for the TV.
 */
export interface MediaManifest {
  /**
   * Every bundled song.
   */
  songs: MediaSong[];

  /**
   * Mp3s that replace a synthesized sound effect, by the effect's name.
   */
  sfx: { name: string; url: string }[];

  /**
   * URLs of the ambience loops.
   */
  ambience: string[];
}
