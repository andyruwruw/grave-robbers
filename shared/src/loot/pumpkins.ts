/**
 * A smashed pumpkin gives one pumpkin and a few seeds to plant. Seeds
 * (`seeds`) sprout when watered with blood (WATER_BLOOD from the pockets,
 * with a blood watering can in the bag), and the sprout grows into a
 * pumpkin when watered again, each watering at least GROW_SECONDS after
 * the last.
 */
export const PUMPKIN_SEEDS: [number, number] = [1, 2];

/**
 * Blood from the pockets each watering takes.
 */
export const WATER_BLOOD = 1;

/**
 * Least seconds between waterings of seeds or a sprout.
 */
export const GROW_SECONDS = 30;
