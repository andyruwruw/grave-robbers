// Packages
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

// Local Imports
import SectionCard from './section-card';
import VolumeSlider from './volume-slider';

// Types
import type { AudioSettings } from '@halloween/shared/audio/audio-settings';

/**
 * Props for the VolumeCard component.
 */
interface VolumeCardProps {
  /**
   * Saved music choices and volumes.
   */
  settings: AudioSettings;

  /**
   * Called with the full updated settings.
   */
  onChange: (settings: AudioSettings) => void;
}

/**
 * The music, ambience, and sound effect volumes.
 *
 * @param {VolumeCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function VolumeCard({ settings, onChange }: VolumeCardProps): React.JSX.Element {
  return (
    <SectionCard
      icon={SlidersHorizontal}
      title='Volume'>
      <VolumeSlider
        label='Music'
        value={settings.musicVolume}
        onChange={(musicVolume: number): void => onChange({ ...settings, musicVolume })} />
      <VolumeSlider
        label='Ambience'
        value={settings.ambienceVolume}
        onChange={(ambienceVolume: number): void => onChange({ ...settings, ambienceVolume })} />
      <VolumeSlider
        label='Sound effects'
        value={settings.sfxVolume}
        onChange={(sfxVolume: number): void => onChange({ ...settings, sfxVolume })} />
    </SectionCard>
  );
}

export default VolumeCard;
