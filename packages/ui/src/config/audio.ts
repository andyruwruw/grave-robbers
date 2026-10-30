/**
 * Seconds a Spotify track fades out over at its end.
 */
export const FADE_OUT = 2.5;

/**
 * Seconds before a Spotify track would end that the next song starts.
 */
export const END_LEAD = 0.6;

/**
 * How often the player checks how far into a Spotify track it is, in ms.
 */
export const WATCH_MS = 200;

/**
 * How often the player reads the account's queue, in ms.
 */
export const QUEUE_POLL_MS = 4000;

/**
 * Seconds a requested Spotify track may take to start before the player
 * goes back to trusting what Spotify reports.
 */
export const PENDING_TIMEOUT = 4;

/**
 * How many upcoming songs the status lists.
 */
export const UP_NEXT = 12;

/**
 * Seconds a duck takes to come back up after its hold.
 */
export const DUCK_RELEASE = 1;

/**
 * How many steps a duck comes back up in.
 */
export const DUCK_STEPS = 10;

/**
 * Seconds the whole song takes to fade in.
 */
export const SONG_FADE_IN = 1.5;

/**
 * How fast a song part's level rises, per second.
 */
export const SONG_LEVEL_RISE = 0.7;

/**
 * How fast a song part's level falls, per second.
 */
export const SONG_LEVEL_FALL = 0.25;

/**
 * Seconds a part may drift from the first before it's pulled back in line.
 */
export const SONG_SYNC_TOLERANCE = 0.08;

/**
 * How often a song eases its parts' levels and checks their sync, in ms.
 */
export const SONG_TICK_MS = 100;

/**
 * Sound effects play this much louder than their recipes, through a
 * limiter so a pile-up doesn't clip.
 */
export const SFX_BOOST = 2.4;

/**
 * Seconds one ambience track fades into the next (at most a third of a
 * short track).
 */
export const AMBIENCE_FADE = 4;

/**
 * How often the ambience checks whether it's time to crossfade, in ms.
 */
export const AMBIENCE_TICK_MS = 200;
