// Types
import type { EventEffect } from './event-effects';

/**
 * Every kind of world event.
 */
export type WorldEventKind = 'blood-moon';

/**
 * A world event: how long it lasts, when it comes on its own, and the
 * effects it has on the game's systems while it's up.
 */
export interface WorldEventDef {
  /**
   * Its name, capitalized.
   */
  name: string;

  /**
   * Seconds it lasts.
   */
  duration: number;

  /**
   * Seconds its look takes to fade in (and out) on the displays.
   */
  fade: number;

  /**
   * It comes on its own after `min` to `min + spread` seconds of play
   * (the clock only runs while someone is connected and monsters spawn).
   * Without it, it only comes when summoned.
   */
  every?: { min: number; spread: number };

  /**
   * What it does to the game's systems (see `EventEffect`).
   */
  effects: EventEffect[];
}

/**
 * A world event that's up, as the server broadcasts it.
 */
export interface WorldEventState {
  /**
   * Which event.
   */
  kind: WorldEventKind;

  /**
   * Seconds until it ends.
   */
  left: number;
}

/**
 * How strongly a world event applies, 0..1: 1 on the server while it's
 * up, easing in and out on the displays.
 */
export interface EventWeight {
  /**
   * Which event.
   */
  kind: WorldEventKind;

  /**
   * How strongly, 0..1.
   */
  weight: number;
}
