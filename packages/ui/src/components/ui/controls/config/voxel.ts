/**
 * A raised voxel block: a lit top edge, a shaded bottom edge, and a hard
 * drop shadow, all mixed from theme tokens so it follows the theme.
 */
export const VOXEL_RAISED = 'shadow-[inset_0_2px_0_color-mix(in_srgb,var(--arw-text-1)_35%,transparent),inset_0_-3px_0_color-mix(in_srgb,var(--arw-bg)_55%,transparent),0_2px_0_color-mix(in_srgb,var(--arw-bg)_80%,transparent)]';

/**
 * A raised block's face without the drop shadow (a fill sitting inside a
 * channel).
 */
export const VOXEL_FACE = 'shadow-[inset_0_2px_0_color-mix(in_srgb,var(--arw-text-1)_30%,transparent),inset_0_-2px_0_color-mix(in_srgb,var(--arw-bg)_45%,transparent)]';

/**
 * A sunken voxel channel: shaded along its top inside edge, catching a
 * little light along the bottom.
 */
export const VOXEL_SUNKEN = 'shadow-[inset_0_3px_0_color-mix(in_srgb,var(--arw-bg)_75%,transparent),inset_0_-1px_0_color-mix(in_srgb,var(--arw-text-1)_12%,transparent)]';

/**
 * The size of a slider's handle and a switch's knob, in pixels.
 */
export const VOXEL_KNOB_PX = 20;
