// Packages
import React from 'react';
import { MAX_HP } from '@halloween/shared/players/health';

// Local Imports
import ItemIcon from '../items/item-icon';

/**
 * Props for the Hearts component.
 */
interface HeartsProps {
  /**
   * Current health, in half-heart steps.
   */
  hp: number;

  /**
   * Health lost too recently to heal yet, shown as cracked, throbbing
   * hearts at the top end.
   */
  wounded: number;

  /**
   * Health on its way back (the ritual knife's kills), strobing just past
   * the full hearts until it's in.
   */
  healing: number;

  /**
   * Health above full from overheal (Heart Devourer, Death's Harvest),
   * shown as brass hearts after the red ones.
   */
  overheal?: number;

  /**
   * Each heart's size in pixels.
   */
  size?: number;
}

/**
 * Health as a row of hearts: full, half (dimmed), or empty outlines, with
 * the hearts fresh wounds have locked away cracked and throbbing at the
 * end, since nothing heals them until they're old enough. Health that's healing back strobes
 * red just past the full hearts. Overheal follows as brass hearts (a part
 * heart dimmed).
 *
 * @param {HeartsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered hearts.
 */
function Hearts({ hp, wounded, healing, overheal = 0, size = 16 }: HeartsProps): React.JSX.Element {
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
        const mending = fill < 1 && i < Math.ceil(hp + healing) && healing > 0;
        const icon = fill > 0 || mending ? 'ui:heart' : locked > 0 ? 'ui:heart-wound' : 'ui:heart-empty';
        return (
          <ItemIcon
            key={i}
            item={icon}
            size={size}
            className={mending ? 'heal-strobe' : [icon === 'ui:heart-wound' ? 'wound-throb' : '', (fill || locked) > 0 && (fill || locked) < 1 ? 'opacity-50' : ''].join(' ').trim()} />
        );
      })}
      {Array.from({ length: Math.ceil(Math.max(0, overheal)) }, (_: unknown, i: number) => (
        <ItemIcon
          key={`over-${i}`}
          item='ui:heart-over'
          size={size}
          className={overheal - i < 1 ? 'opacity-50' : ''} />
      ))}
    </div>
  );
}

export default Hearts;
