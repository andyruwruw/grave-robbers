// Packages
import React, { useRef, useState } from 'react';

// Local Imports
import { TURN_STICK_DEAD_ZONE, TURN_STICK_RADIUS } from '../../config/sticks';

/**
 * Props for the DirectionStick component.
 */
interface DirectionStickProps {
  /**
   * Knob color (the player's color).
   */
  color: string;

  /**
   * Called with the direction while dragged (each axis in [-1, 1], y
   * pointing down), and (0, 0) when let go.
   */
  onAim: (x: number, y: number) => void;
}

/**
 * A small fixed stick that only turns the player (for picking which way to
 * build): drag the knob toward a direction and the player faces it; let go
 * and they keep facing that way.
 *
 * @param {DirectionStickProps} props - Component props.
 * @returns {React.JSX.Element} The rendered stick.
 */
function DirectionStick({ color, onAim }: DirectionStickProps): React.JSX.Element {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  /**
   * Moves the knob toward the thumb and sends the facing once past the dead zone.
   *
   * @param e - The pointer event.
   */
  const update = (e: React.PointerEvent): void => {
    const rect = baseRef.current!.getBoundingClientRect();
    let dx = e.clientX - (rect.left + rect.width / 2);
    let dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);
    if (dist > TURN_STICK_RADIUS) {
      dx = (dx / dist) * TURN_STICK_RADIUS;
      dy = (dy / dist) * TURN_STICK_RADIUS;
    }
    setKnob({ x: dx, y: dy });
    if (dist >= TURN_STICK_RADIUS * TURN_STICK_DEAD_ZONE) {
      onAim(dx / Math.hypot(dx, dy), dy / Math.hypot(dx, dy));
    }
  };

  /**
   * Takes the first finger down and aims at it.
   *
   * @param e - The pointer event.
   */
  const handleDown = (e: React.PointerEvent): void => {
    if (pointerId.current !== null) {
      return;
    }
    pointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    navigator.vibrate?.(10);
    update(e);
  };

  /**
   * Recenters the knob when the tracked finger lifts.
   *
   * @param e - The pointer event.
   */
  const handleUp = (e: React.PointerEvent): void => {
    if (e.pointerId !== pointerId.current) {
      return;
    }
    pointerId.current = null;
    setKnob({ x: 0, y: 0 });
    onAim(0, 0);
  };

  return (
    <div
      ref={baseRef}
      role='slider'
      aria-label='Turn to pick where to build'
      className='relative flex h-[84px] w-[84px] shrink-0 touch-none items-center justify-center rounded-full border-2 border-border bg-muted'
      onPointerDown={handleDown}
      onPointerMove={(e: React.PointerEvent): void => {
        if (e.pointerId === pointerId.current) {
          update(e);
        }
      }}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}>
      <span className='pointer-events-none absolute top-1 font-medium text-[11px] text-foreground-subtle'>TURN</span>
      <div
        className='pointer-events-none h-9 w-9 rounded-full shadow-overlay'
        style={{ backgroundColor: color, transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}

export default DirectionStick;
