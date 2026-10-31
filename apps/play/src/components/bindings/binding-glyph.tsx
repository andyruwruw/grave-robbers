// Packages
import React from 'react';
import { House, Menu, SquareStack } from 'lucide-react';

// Local Imports
import { DPAD_ARMS, FACE_COLORS, MOUSE_BUTTONS } from '../../config/binding-glyphs';
import { keyLabel, padLabel } from '../../helpers/play-settings';

// Types
import type { Binding } from '../../types/play';

/**
 * Props for BindingGlyph.
 */
interface BindingGlyphProps {
  /**
   * The key, click, or button.
   */
  binding: Binding;

  /**
   * Its height in pixels.
   */
  size?: number;
}

/**
 * A mouse with the pressed button lit.
 *
 * @param {{ which: 'left' | 'middle' | 'right'; size: number }} props - The button and height.
 * @returns {React.JSX.Element} The rendered mouse.
 */
function MouseGlyph({ which, size }: { which: 'left' | 'middle' | 'right'; size: number }): React.JSX.Element {
  return (
    <svg
      width={size * 0.75}
      height={size}
      viewBox='0 0 12 16'
      className='inline shrink-0 align-middle text-foreground'>
      {which === 'left' && (
        <path
          d='M6 1 H5 A4 4 0 0 0 1 5 V7 H6 Z'
          className='text-brand'
          fill='currentColor' />
      )}
      {which === 'right' && (
        <path
          d='M6 1 H7 A4 4 0 0 1 11 5 V7 H6 Z'
          className='text-brand'
          fill='currentColor' />
      )}
      <rect
        x='1'
        y='1'
        width='10'
        height='14'
        rx='4.5'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.2' />
      <path
        d='M1 7 H11 M6 1 V7'
        stroke='currentColor'
        strokeWidth='1.2' />
      {which === 'middle' && (
        <rect
          x='5'
          y='2.5'
          width='2'
          height='3'
          rx='1'
          className='text-brand'
          fill='currentColor' />
      )}
    </svg>
  );
}

/**
 * A D-pad cross with some arms lit.
 *
 * @param {{ lit: string[]; size: number }} props - The lit arms and height.
 * @returns {React.JSX.Element} The rendered D-pad.
 */
function DpadGlyph({ lit, size }: { lit: string[]; size: number }): React.JSX.Element {
  const arms: Record<string, string> = { up: 'M6 1 H10 V6 H6 Z', down: 'M6 10 H10 V15 H6 Z', left: 'M1 6 H6 V10 H1 Z', right: 'M10 6 H15 V10 H10 Z' };
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 16 16'
      className='inline shrink-0 align-middle text-foreground'>
      <path
        d='M6 1 H10 V6 H15 V10 H10 V15 H6 V10 H1 V6 H6 Z'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.2'
        strokeLinejoin='round' />
      {lit.map((arm: string) => (
        <path
          key={arm}
          d={arms[arm]}
          className='text-brand'
          fill='currentColor' />
      ))}
    </svg>
  );
}

/**
 * A key, click, or pad button drawn as an icon: a mouse with the pressed
 * button lit, a colored face button (A, B, X, Y), a bumper or trigger, a
 * D-pad with its arms lit, a stick, Back / Start / Home, or a keycap with
 * the key's name.
 *
 * @param {BindingGlyphProps} props - Component props.
 * @returns {React.JSX.Element} The rendered glyph.
 */
function BindingGlyph({ binding, size = 16 }: BindingGlyphProps): React.JSX.Element {
  const box = { height: size, minWidth: size, fontSize: Math.max(8, size * 0.6) };
  const cap = 'inline-flex shrink-0 items-center justify-center align-middle font-semibold leading-none';
  if ('dpad' in binding) {
    return (
      <DpadGlyph
        lit={binding.dpad === 'left-right' ? ['left', 'right'] : []}
        size={size} />
    );
  }
  if ('code' in binding) {
    const mouse = MOUSE_BUTTONS[binding.code];
    if (mouse) {
      return (
        <MouseGlyph
          which={mouse}
          size={size} />
      );
    }
    return (
      <span
        className={`${cap} rounded-sm border border-b-2 border-border bg-muted px-xsm text-foreground`}
        style={box}>
        {binding.code ? keyLabel(binding.code) : 'None'}
      </span>
    );
  }
  const b = binding.button;
  if (FACE_COLORS[b]) {
    return (
      <span
        className={`${cap} rounded-full text-background`}
        style={{ ...box, width: size, backgroundColor: FACE_COLORS[b] }}>
        {padLabel(b)}
      </span>
    );
  }
  if (DPAD_ARMS[b]) {
    return (
      <DpadGlyph
        lit={[DPAD_ARMS[b]]}
        size={size} />
    );
  }
  if (b === 4 || b === 5 || b === 6 || b === 7) {
    return (
      <span
        className={`${cap} border border-border bg-muted px-xsm text-foreground ${b < 6 ? 'rounded-b-sm rounded-t-lg' : 'rounded-b-md rounded-t-[50%]'}`}
        style={{ ...box, minWidth: size * 1.5 }}>
        {padLabel(b)}
      </span>
    );
  }
  if (b === 10 || b === 11) {
    return (
      <span
        className={`${cap} rounded-full border-2 border-foreground-muted text-foreground`}
        style={{ ...box, width: size }}>
        {b === 10 ? 'L' : 'R'}
      </span>
    );
  }
  const Icon = b === 8 ? SquareStack : b === 9 ? Menu : b === 16 ? House : null;
  return (
    <span
      className={`${cap} rounded-full border border-border bg-muted px-xsm text-foreground`}
      style={box}>
      {Icon ? <Icon size={size * 0.6} /> : padLabel(b)}
    </span>
  );
}

export default BindingGlyph;
