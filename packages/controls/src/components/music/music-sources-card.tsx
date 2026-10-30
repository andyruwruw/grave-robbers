// Packages
import React from 'react';
import { Check, Music } from 'lucide-react';

// Local Imports
import { SOURCES } from '../../config/music';
import SectionCard from './section-card';

// Types
import type { AudioSettings } from '@halloween/shared/audio/audio-settings';

/**
 * Props for the MusicSourcesCard component.
 */
interface MusicSourcesCardProps {
  /**
   * Saved music choices.
   */
  settings: AudioSettings;

  /**
   * Called with the full updated settings.
   */
  onChange: (settings: AudioSettings) => void;
}

/**
 * What to play: the Spotify account's queue first, a Spotify playlist,
 * the custom songs, in any mix, with a slider under each shuffled source
 * (while both are on) for how often it's picked against the other.
 *
 * @param {MusicSourcesCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function MusicSourcesCard({ settings, onChange }: MusicSourcesCardProps): React.JSX.Element {
  const weights = settings.spotify && settings.custom ? settings.spotifyWeight + settings.customWeight : null;

  return (
    <SectionCard
      icon={Music}
      title='Music'>
      {SOURCES.map(({ key, label, hint, weight }) => (
        <div
          key={key}
          className='flex flex-col gap-xsm'>
          <label className='flex cursor-pointer items-start gap-sm'>
            <input
              type='checkbox'
              className='peer sr-only'
              checked={settings[key]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...settings, [key]: e.target.checked })} />
            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border peer-focus-visible:ring-1 peer-focus-visible:ring-brand ${settings[key] ? 'border-brand bg-brand text-background' : 'border-border bg-muted'}`}>
              {settings[key] && <Check size={12} />}
            </span>
            <span className='flex flex-col'>
              <span className='text-xs text-foreground'>{label}</span>
              <span className='text-[11px] leading-snug text-foreground-subtle'>{hint}</span>
            </span>
          </label>
          {weight && weights !== null && (
            <label className='ml-6 flex items-center gap-sm'>
              <input
                type='range'
                min={0}
                max={100}
                aria-label={`How often: ${label}`}
                value={Math.round(settings[weight] * 100)}
                className='min-w-0 flex-1 accent-brand'
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...settings, [weight]: Number(e.target.value) / 100 })} />
              <span className='w-20 shrink-0 text-right text-[11px] text-foreground-subtle'>
                {weights > 0 ? Math.round((settings[weight] / weights) * 100) : 50}% of songs
              </span>
            </label>
          )}
        </div>
      ))}
    </SectionCard>
  );
}

export default MusicSourcesCard;
