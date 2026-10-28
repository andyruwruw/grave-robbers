/**
 * localStorage key holding the phone's secret player token.
 */
export const TOKEN_STORAGE_KEY = 'graveyard.token';

/**
 * localStorage key holding the last name and color, to prefill the join form.
 */
export const PROFILE_STORAGE_KEY = 'graveyard.profile';

/**
 * localStorage key holding the TV's music source, playlist, and volumes.
 */
export const AUDIO_STORAGE_KEY = 'graveyard.audio';

/**
 * localStorage key holding the settings for the next random map.
 */
export const MAP_GEN_STORAGE_KEY = 'graveyard.mapGen';

/**
 * How often the controller sends its joystick vector, in ms.
 */
export const INPUT_SEND_INTERVAL = 33;

/**
 * Reconnect backoff bounds, in ms.
 */
export const RECONNECT_MIN_DELAY = 500;
export const RECONNECT_MAX_DELAY = 5000;
