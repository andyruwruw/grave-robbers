// Local Imports
import { MusicSource } from './music-source';
import { SongPlayer } from './song-player';

// Types
import type { Song } from '../../types/music';

/**
 * Plays the custom songs from the server's media folder, one `SongPlayer`
 * at a time.
 */
export class CustomSongSource extends MusicSource {
  /**
   * The song playing (or paused) now.
   */
  song: SongPlayer | null = null;

  /**
   * Loads a song as the current one, without starting it.
   *
   * @param song - The song.
   * @param target - Each part's level for the game's mood.
   * @param onEnd - Called when this song ends while still current.
   * @param onPlaying - Called as this song starts or stops while still current.
   */
  playSong(song: Song, target: (part: string) => number, onEnd: () => void, onPlaying: (playing: boolean) => void): void {
    const player = new SongPlayer(
      song,
      target,
      (): void => {
        if (this.song === player) {
          this.song = null;
          onEnd();
        }
      },
      (playing: boolean): void => {
        if (this.song === player) {
          onPlaying(playing);
        }
      },
    );
    this.song = player;
  }

  /**
   * Stops the current song and lets it go.
   */
  stop(): void {
    this.song?.stop();
    this.song = null;
  }

  /**
   * Starts or resumes the current song.
   */
  resume(): void {
    void this.song?.play();
  }

  /**
   * Pauses the current song.
   */
  pause(): void {
    this.song?.pause();
  }

  /**
   * Applies the music volume to the current song.
   *
   * @param volume - 0..1.
   */
  setVolume(volume: number): void {
    this.song?.setVolume(volume);
  }

  /**
   * Stops the current song for good.
   */
  dispose(): void {
    this.stop();
  }
}
