// Packages
import React from 'react';
import { Monitor } from 'lucide-react';

// Local Imports
import { TV_PIXEL_SIZE } from '../../config/tv-pixel-size';
import SectionCard from './section-card';

/**
 * Props for the TvLookCard component.
 */
interface TvLookCardProps {
  /**
   * The largest pixel the TV's zoom may grow to, in screen pixels.
   */
  pixelSize: number;

  /**
   * Called with the new pixel size.
   */
  onPixelSize: (size: number) => void;
}

/**
 * The TV's own look outside Incognito: how pixelated the graveyard is.
 *
 * @param {TvLookCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function TvLookCard({ pixelSize, onPixelSize }: TvLookCardProps): React.JSX.Element {
  return (
    <SectionCard
      icon={Monitor}
      title='TV Look'>
      <label className='flex flex-col gap-xsm'>
        <span className='flex justify-between text-xs text-foreground'>
          Pixel Size
          <span className='text-foreground-subtle'>{pixelSize === 1 ? 'Sharp' : `${pixelSize}px`}</span>
        </span>
        <input
          type='range'
          min={TV_PIXEL_SIZE.min}
          max={TV_PIXEL_SIZE.max}
          step={TV_PIXEL_SIZE.step}
          value={pixelSize}
          className='w-full accent-brand'
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onPixelSize(Number(e.target.value))} />
      </label>
    </SectionCard>
  );
}

export default TvLookCard;
