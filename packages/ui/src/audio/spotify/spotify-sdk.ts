// Local Imports
import { SPOTIFY_SDK_URL } from '../../config/spotify';

/**
 * The SDK script load, shared by every caller.
 */
let sdk: Promise<NonNullable<Window['Spotify']>> | null = null;

/**
 * Loads the Web Playback SDK script once.
 *
 * @returns The SDK, once its script says it's ready.
 */
export function loadSpotifySdk(): Promise<NonNullable<Window['Spotify']>> {
  sdk ??= new Promise((resolve, reject): void => {
    window.onSpotifyWebPlaybackSDKReady = (): void => resolve(window.Spotify!);
    const script = document.createElement('script');
    script.src = SPOTIFY_SDK_URL;
    script.onerror = (): void => reject(new Error('Could not load the Spotify player.'));
    document.head.appendChild(script);
  });
  return sdk;
}
