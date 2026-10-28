// Packages
import React, {
  useRef,
  useState,
} from 'react';

/**
 * Props for the Joystick component.
 */
interface JoystickProps {
  /**
   * Knob color (the player's color).
   */
  color: string;

  /**
   * Called with the vector in [-1, 1] on each axis, y pointing down.
   */
  onChange: (x: number, y: number) => void;
}

/**
 * Knob travel radius in CSS px.
 */
const RADIUS = 64;

/**
 * Fraction of the radius ignored around the center.
 */
const DEAD_ZONE = 0.15;

/**
 * A floating virtual joystick: the base appears wherever the thumb lands,
 * so there's no need to look down at the phone to find it.
 *
 * @param {JoystickProps} props - Component props.
 * @returns {React.JSX.Element} The rendered joystick area.
 */
function Joystick({
  color,
  onChange,
}: JoystickProps): React.JSX.Element {
  const areaRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  /**
   * Pointer position relative to the joystick area.
   */
  const localPoint = (e: React.PointerEvent): { x: number; y: number } => {
    const rect = areaRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const update = (o: { x: number; y: number }, p: { x: number; y: number }): void => {
    let dx = p.x - o.x;
    let dy = p.y - o.y;
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    const mag = Math.min(dist / RADIUS, 1);
    if (mag < DEAD_ZONE) {
      onChange(0, 0);
      return;
    }
    const scaled = (mag - DEAD_ZONE) / (1 - DEAD_ZONE);
    onChange((dx / (mag * RADIUS)) * scaled, (dy / (mag * RADIUS)) * scaled);
  };

  const handleDown = (e: React.PointerEvent): void => {
    if (pointerId.current !== null) {
      return;
    }
    pointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = localPoint(e);
    setOrigin(p);
    setKnob({ x: 0, y: 0 });
    navigator.vibrate?.(10);
  };

  const handleMove = (e: React.PointerEvent): void => {
    if (e.pointerId !== pointerId.current || !origin) {
      return;
    }
    update(origin, localPoint(e));
  };

  const handleUp = (e: React.PointerEvent): void => {
    if (e.pointerId !== pointerId.current) {
      return;
    }
    pointerId.current = null;
    setOrigin(null);
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  };

  return (
    <div
      ref={areaRef}
      className='relative flex-1 touch-none overflow-hidden'
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}>
      {origin ? (
        <div
          className='pointer-events-none absolute'
          style={{ left: origin.x, top: origin.y }}>
          <div
            className='absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-border bg-[var(--arw-glass-pane)]'
            style={{ width: RADIUS * 2, height: RADIUS * 2 }} />
          <div
            className='absolute h-16 w-16 rounded-full shadow-overlay'
            style={{
              backgroundColor: color,
              transform: `translate(calc(${knob.x}px - 50%), calc(${knob.y}px - 50%))`,
            }} />
        </div>
      ) : (
        <div className='pointer-events-none absolute inset-y-0 left-xxl flex flex-col items-center justify-center gap-md'>
          <div
            className='rounded-full border-2 border-dashed border-border'
            style={{ width: RADIUS * 2, height: RADIUS * 2 }} />
          <span className='font-pixel text-[10px] text-foreground-subtle'>Drag here to move</span>
        </div>
      )}
    </div>
  );
}

export default Joystick;
