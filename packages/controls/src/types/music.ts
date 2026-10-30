/**
 * One checkbox for what to play, with the weight setting its shuffled
 * source gets, if any.
 */
export interface MusicSourceOption {
  /**
   * The audio setting the checkbox flips.
   */
  key: 'live' | 'spotify' | 'custom';

  /**
   * Its name.
   */
  label: string;

  /**
   * The line under the name.
   */
  hint: string;

  /**
   * The audio setting for how often it's picked against the other source.
   */
  weight?: 'spotifyWeight' | 'customWeight';
}
