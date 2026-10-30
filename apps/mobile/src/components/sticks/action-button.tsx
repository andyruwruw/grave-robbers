// Packages
import React, {
  useRef,
  useState,
} from 'react';

// Local Imports
import { AIM_DEADZONE } from '../../config/sticks';

/**
 * Props for the ActionButton component.
 */
interface ActionButtonProps {
  /**
   * Called with true on press and false on release. Holding repeats on the
   * server, so this only fires on edges.
   */
  onChange: (down: boolean) => void;

  /**
   * Called with the aim direction, snapped to one of eight, or (0, 0) when
   * the thumb is near the middle or lifts.
   */
  onAim: (x: number, y: number) => void;
}

/**
 * The big thumb button, which is also an aiming stick: press to swing the
 * way you last faced, or drag (measured from where the thumb touched down,
 * so landing off-center doesn't aim) toward a direction, behind you
 * included, to turn and swing that way. Uses pointer capture so sliding off
 * doesn't leave it stuck, and only reports aim when the snapped direction
 * changes.
 *
 * @param {ActionButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered button.
 */
function ActionButton({ onChange, onAim }: ActionButtonProps): React.JSX.Element {
  const [down, setDown] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const pointerId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0, radius: 1 });
  const lastAim = useRef(-1);

  /**
   * Moves the knob toward the thumb and sends the aim snapped to one of eight directions when it changes.
   *
   * @param clientX - The thumb's x on screen.
   * @param clientY - The thumb's y on screen.
   */
  const aim = (clientX: number, clientY: number): void => {
    const { x, y, radius } = origin.current;
    const dx = (clientX - x) / radius;
    const dy = (clientY - y) / radius;
    const len = Math.hypot(dx, dy);
    const clamp = len > 1 ? 1 / len : 1;
    setKnob({ x: dx * clamp, y: dy * clamp });
    const octant = len < AIM_DEADZONE ? -1 : (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
    if (octant !== lastAim.current) {
      lastAim.current = octant;
      const angle = (octant * Math.PI) / 4;
      onAim(octant < 0 ? 0 : Math.round(Math.cos(angle) * 1000) / 1000, octant < 0 ? 0 : Math.round(Math.sin(angle) * 1000) / 1000);
    }
  };

  /**
   * Starts the action under the first finger down and remembers where it landed.
   *
   * @param e - The pointer event.
   */
  const press = (e: React.PointerEvent<HTMLButtonElement>): void => {
    if (pointerId.current !== null) {
      return;
    }
    pointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    origin.current = { x: e.clientX, y: e.clientY, radius: rect.width / 2 };
    setDown(true);
    onChange(true);
    navigator.vibrate?.(8);
  };

  /**
   * Aims while the pressing finger slides.
   *
   * @param e - The pointer event.
   */
  const move = (e: React.PointerEvent<HTMLButtonElement>): void => {
    if (e.pointerId === pointerId.current) {
      aim(e.clientX, e.clientY);
    }
  };

  /**
   * Ends the action when the pressing finger lifts and clears any aim.
   *
   * @param e - The pointer event.
   */
  const release = (e: React.PointerEvent<HTMLButtonElement>): void => {
    if (e.pointerId !== pointerId.current) {
      return;
    }
    pointerId.current = null;
    setDown(false);
    setKnob({ x: 0, y: 0 });
    onChange(false);
    if (lastAim.current !== -1) {
      lastAim.current = -1;
      onAim(0, 0);
    }
  };

  return (
    <button
      type='button'
      aria-label='Action'
      className={`relative flex h-24 w-24 touch-none items-center justify-center rounded-full border-4 shadow-overlay transition-colors duration-75 ${down ? 'border-foreground bg-brand-hover' : 'border-border bg-brand'}`}
      onPointerDown={press}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(e: React.MouseEvent): void => e.preventDefault()}>
      <span
        className='pointer-events-none flex h-12 w-12 items-center justify-center rounded-full border-2 border-[color:color-mix(in_srgb,var(--arw-bg),transparent_45%)] bg-[color:color-mix(in_srgb,var(--arw-bg),transparent_75%)] font-medium text-base text-on-brand'
        style={{ transform: `translate(${knob.x * 28}px, ${knob.y * 28}px)` }}>
        ACT
      </span>
    </button>
  );
}

export default ActionButton;
