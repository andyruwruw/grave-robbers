// Packages
import { sfx } from '@halloween/ui/audio/sfx/sfx';

/**
 * What the keyboard and mouse listeners ask of the page.
 */
export interface KeyboardMouseHooks {
  /**
   * Takes the key or click as a new binding if one is waiting for it.
   */
  bindKey: (code: string) => boolean;

  /**
   * The keyboard or mouse was used.
   */
  onDevice: () => void;

  /**
   * Whether the player has joined.
   */
  isJoined: () => boolean;

  /**
   * The keys bound to actions.
   */
  boundKeys: () => string[];
}

/**
 * Keys and mouse buttons held, ones pressed since the last frame, and
 * where the mouse last was (and when), for the input loop. Keys are
 * `KeyboardEvent.code`s, clicks `Mouse0`..`Mouse2`.
 */
export class KeyboardMouse {
  /**
   * Held keys and buttons.
   */
  readonly down = new Set<string>();

  /**
   * Keys and buttons pressed since the last frame (not key repeats).
   */
  readonly taps = new Set<string>();

  /**
   * Where the mouse last was and when, if it has moved.
   */
  mouse: { x: number; y: number; at: number } | null = null;

  /**
   * Removes the listeners, once attached.
   */
  private _detach: () => void = (): void => {};

  /**
   * Listens on the window.
   *
   * @param hooks - What the listeners ask of the page.
   */
  attach(hooks: KeyboardMouseHooks): void {
    /**
     * Whether an event comes from a text field.
     *
     * @param e - The event.
     * @returns True when typing in a field.
     */
    const typing = (e: Event): boolean => e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    /**
     * Records a key or button going down.
     *
     * @param code - The key or mouse button code.
     * @param repeat - Whether it's a key repeat (not a new tap).
     */
    const press = (code: string, repeat: boolean): void => {
      if (!repeat) {
        this.taps.add(code);
      }
      this.down.add(code);
      hooks.onDevice();
    };
    /**
     * Binds the key when rebinding, else records it unless typing.
     *
     * @param e - The key event.
     */
    const onKeyDown = (e: KeyboardEvent): void => {
      if (hooks.bindKey(e.code)) {
        e.preventDefault();
        return;
      }
      if (typing(e) && e.code !== 'Escape') {
        return;
      }
      void sfx.unlock();
      press(e.code, e.repeat);
      if (hooks.isJoined() && (hooks.boundKeys().includes(e.code) || e.code === 'Escape')) {
        e.preventDefault();
      }
    };
    /**
     * Releases the key.
     *
     * @param e - The key event.
     */
    const onKeyUp = (e: KeyboardEvent): void => {
      this.down.delete(e.code);
    };
    /**
     * Binds the button when rebinding, else records it.
     *
     * @param e - The mouse event.
     */
    const onMouseDown = (e: MouseEvent): void => {
      if (hooks.bindKey(`Mouse${e.button}`)) {
        e.preventDefault();
        return;
      }
      void sfx.unlock();
      press(`Mouse${e.button}`, false);
    };
    /**
     * Releases the button.
     *
     * @param e - The mouse event.
     */
    const onMouseUp = (e: MouseEvent): void => {
      this.down.delete(`Mouse${e.button}`);
    };
    /**
     * Remembers where the mouse is and when it moved.
     *
     * @param e - The mouse event.
     */
    const onMouseMove = (e: MouseEvent): void => {
      this.mouse = { x: e.clientX, y: e.clientY, at: performance.now() };
      hooks.onDevice();
    };
    /**
     * Releases everything when the window loses focus.
     */
    const onBlur = (): void => {
      this.down.clear();
    };
    /**
     * Stops the right-click menu while joined.
     *
     * @param e - The mouse event.
     */
    const onContextMenu = (e: MouseEvent): void => {
      if (hooks.isJoined()) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('blur', onBlur);
    window.addEventListener('contextmenu', onContextMenu);
    this._detach = (): void => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }

  /**
   * Stops listening.
   */
  detach(): void {
    this._detach();
  }
}
