// Local Imports
import { loadMedia } from '../media/media';

/**
 * The decoded mp3s from the server's media folder that replace sound
 * effect recipes (`server/media/sfx/<name>.mp3`).
 */
export class SfxOverrides {
  /**
   * Each decoded override, by sound name.
   */
  private _buffers = new Map<string, AudioBuffer>();

  /**
   * Whether the overrides were asked for already.
   */
  private _loading = false;

  /**
   * Decodes every mp3 override from the server once. Until one is ready its
   * synth recipe plays instead.
   *
   * @param ctx - The context to decode them for.
   */
  load(ctx: AudioContext): void {
    if (this._loading) {
      return;
    }
    this._loading = true;
    void loadMedia().then(({ sfx }): void => {
      for (const { name, url } of sfx) {
        fetch(url)
          .then((res: Response): Promise<ArrayBuffer> => res.arrayBuffer())
          .then((data: ArrayBuffer): Promise<AudioBuffer> => ctx.decodeAudioData(data))
          .then((buffer: AudioBuffer): void => {
            this._buffers.set(name, buffer);
          })
          .catch((err: unknown): void => console.warn(`[sfx] couldn't load ${url}`, err));
      }
    });
  }

  /**
   * The decoded override for a sound, once it's ready.
   *
   * @param name - The sound.
   * @returns Its buffer, or undefined to play the recipe.
   */
  get(name: string): AudioBuffer | undefined {
    return this._buffers.get(name);
  }
}
