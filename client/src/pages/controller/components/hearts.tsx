// Packages
import React from 'react';
import { Heart } from 'lucide-react';
import { MAX_HP } from '@halloween/shared/players';

const HEART_COLOR = '#e5484d';
const WOUND_COLOR = '#6e6e76';

/**
 * Props for the Hearts component.
 */
interface HeartsProps {
  /**
   * Current health, in half-heart steps.
   */
  hp: number;

  /**
   * Health lost too recently to heal yet, shown grey at the top end.
   */
  wounded: number;
}

/**
 * Health as a row of hearts: full, half (dimmed), or empty outlines, with
 * the hearts fresh wounds have locked away grey at the end, since nothing
 * heals them until they're old enough.
 *
 * @param {HeartsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered hearts.
 */
function Hearts({ hp, wounded }: HeartsProps): React.JSX.Element {
  return (
    <div
      className='flex items-center gap-0.5'
      role='meter'
      aria-label='Health'
      aria-valuemin={0}
      aria-valuemax={MAX_HP}
      aria-valuenow={hp}>
      {Array.from({ length: MAX_HP }, (_: unknown, i: number) => {
        const fill = Math.max(0, Math.min(1, hp - i));
        const locked = Math.max(0, Math.min(1, i + 1 - (MAX_HP - wounded)));
        const color = fill > 0 ? HEART_COLOR : locked > 0 ? WOUND_COLOR : null;
        return (
          <Heart
            key={i}
            size={14}
            className={!color ? 'text-foreground-subtle' : (fill || locked) < 1 ? 'opacity-50' : ''}
            style={color ? { color, fill: color } : undefined} />
        );
      })}
    </div>
  );
}

export default Hearts;
