// Packages
import { buttonDown } from '@halloween/ui/input/gamepad';

/**
 * One frame's reads of the pad being played, and its buttons as they were
 * last frame (to spot taps).
 */
export class GamepadFrame {
  /**
   * The pad this frame, or null with none connected.
   */
  gp: Gamepad | null = null;

  /**
   * Each button as it was at the end of the last frame with a pad.
   */
  private readonly _prev: boolean[] = [];

  /**
   * Starts a frame with the pad being played.
   *
   * @param gp - The pad, or null.
   */
  begin(gp: Gamepad | null): void {
    this.gp = gp;
  }

  /**
   * Whether a button is held.
   *
   * @param i - The standard-mapping button.
   * @returns True while it's down.
   */
  down(i: number): boolean {
    return this.gp ? buttonDown(this.gp, i) : false;
  }

  /**
   * Whether a button went down this frame.
   *
   * @param i - The standard-mapping button.
   * @returns True on the frame it's pressed.
   */
  tap(i: number): boolean {
    return this.down(i) && !this._prev[i];
  }

  /**
   * One axis.
   *
   * @param i - The standard-mapping axis.
   * @returns Its value, 0 without a pad.
   */
  axis(i: number): number {
    return this.gp?.axes[i] ?? 0;
  }

  /**
   * The first button that went down this frame.
   *
   * @returns Its index, or -1.
   */
  firstTap(): number {
    return this.gp ? this.gp.buttons.findIndex((_: GamepadButton, i: number): boolean => this.tap(i)) : -1;
  }

  /**
   * Remembers the buttons for the next frame.
   */
  finish(): void {
    this.gp?.buttons.forEach((_: GamepadButton, i: number): void => {
      this._prev[i] = this.down(i);
    });
  }
}
