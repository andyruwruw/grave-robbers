/**
 * How the graveyard behind the Incognito screen looks once it has faded in
 * (`useScenicLook` on the TV eases from the TV's own settings to these).
 */
export interface IncognitoLook {
  /**
   * Overall brightness, 1 as the game is drawn.
   */
  brightness: number;

  /**
   * Overall contrast, 1 as the game is drawn.
   */
  contrast: number;

  /**
   * How much coarser the pixels get (the zoom's own pixel size times
   * this), 1 for none.
   */
  pixelation: number;

  /**
   * Ground fog thickness; past 1 is a heavier mist than the Fog setting
   * allows.
   */
  fog: number;

  /**
   * The fog's shade: under 1 darker, over 1 lighter.
   */
  fogShade: number;
}

/**
 * One Incognito look slider's range, step, and readout.
 */
export interface IncognitoLookRange {
  /**
   * Its name on the slider.
   */
  label: string;

  /**
   * The lowest value.
   */
  min: number;

  /**
   * The highest value.
   */
  max: number;

  /**
   * How far one notch moves it.
   */
  step: number;

  /**
   * The value as the slider shows it.
   */
  readout: (value: number) => string;
}
