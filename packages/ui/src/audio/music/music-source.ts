/**
 * What plays one kind of queue item: custom songs or Spotify tracks. The
 * music player keeps one of each and asks whichever has the turn.
 */
export abstract class MusicSource {
  /**
   * Picks playback back up where it paused.
   */
  abstract resume(): void;

  /**
   * Pauses playback.
   */
  abstract pause(): void;

  /**
   * Applies the music volume.
   *
   * @param volume - 0..1, with any duck already applied.
   */
  abstract setVolume(volume: number): void;

  /**
   * Stops for good.
   */
  abstract dispose(): void;
}
