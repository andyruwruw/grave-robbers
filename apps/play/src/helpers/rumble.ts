// Types
import type React from 'react';
import type { Rumble } from '@halloween/game-ui/types/session';

/**
 * Rumbles the pad being played (hurts, deaths, pickups): a vibration
 * pattern's "on" parts add up to one dual rumble.
 *
 * @param padIndex - The pad being played, if any.
 * @returns Plays a rumble pattern.
 */
export function padRumble(padIndex: React.RefObject<number | null>): (pattern: Rumble) => void {
  return (pattern: Rumble): void => {
    const gp = padIndex.current !== null ? navigator.getGamepads()[padIndex.current] : null;
    const ms = Array.isArray(pattern) ? pattern.filter((_: number, i: number): boolean => i % 2 === 0).reduce((a: number, b: number): number => a + b, 0) : pattern;
    const actuator = gp?.vibrationActuator as { playEffect?: (type: string, params: object) => Promise<unknown> } | null | undefined;
    void actuator?.playEffect?.('dual-rumble', { duration: ms, strongMagnitude: 0.6, weakMagnitude: 0.4 }).catch((): void => {});
  };
}
