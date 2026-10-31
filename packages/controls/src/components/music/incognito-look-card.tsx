// Packages
import React from 'react';
import { EyeOff } from 'lucide-react';

// Local Imports
import { INCOGNITO_LOOK_RANGES } from '../../config/incognito-look';
import SectionCard from './section-card';

// Types
import type { IncognitoLook, IncognitoLookRange } from '../../types/incognito-look';

/**
 * Props for the IncognitoLookCard component.
 */
interface IncognitoLookCardProps {
  /**
   * The look behind the Incognito screen.
   */
  look: IncognitoLook;

  /**
   * Called with the full updated look.
   */
  onChange: (look: IncognitoLook) => void;
}

/**
 * Sliders for how the graveyard looks behind the Incognito screen:
 * brightness, contrast, pixelation, fog, and the fog's shade.
 *
 * @param {IncognitoLookCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function IncognitoLookCard({ look, onChange }: IncognitoLookCardProps): React.JSX.Element {
  return (
    <SectionCard
      icon={EyeOff}
      title='Incognito Look'>
      {(Object.entries(INCOGNITO_LOOK_RANGES) as [keyof IncognitoLook, IncognitoLookRange][]).map(([key, range]): React.JSX.Element => (
        <label
          key={key}
          className='flex flex-col gap-xsm'>
          <span className='flex justify-between text-xs text-foreground'>
            {range.label}
            <span className='text-foreground-subtle'>{range.readout(look[key])}</span>
          </span>
          <input
            type='range'
            min={range.min}
            max={range.max}
            step={range.step}
            value={look[key]}
            className='w-full accent-brand'
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...look, [key]: Number(e.target.value) })} />
        </label>
      ))}
    </SectionCard>
  );
}

export default IncognitoLookCard;
