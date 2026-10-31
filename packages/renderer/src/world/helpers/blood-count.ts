/**
 * How many bits of blood (splats, chips) to show for `count` at the
 * display's Blood setting: none at 0, all of them at 1.
 * @param count How many the effect makes at full blood.
 * @param blood The Blood setting, 0..1.
 * @returns How many to show.
 */
export const bloodCount = (count: number, blood: number): number => Math.round(count * blood);
