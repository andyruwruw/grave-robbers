// Packages
import React from 'react';
import { ChevronDown } from 'lucide-react';

// Local Imports
import { PANEL_BUTTON } from '../../config/styles';
import MapGenPanel from './map-gen-panel';
import ResetWorldButton from './reset-world-button';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';

/**
 * Props for the RegenerateMap component.
 */
interface RegenerateMapProps {
  /**
   * The picked preset's id, or 'random'.
   */
  chosen: string;

  /**
   * Picks a preset (or 'random').
   */
  onChoose: (map: string) => void;

  /**
   * Saved map layouts a new world can start from.
   */
  presets: { id: string; name: string }[];

  /**
   * The next random map's settings.
   */
  gen: MapGenSettings;

  /**
   * Changes the next random map's settings.
   */
  onGen: (next: MapGenSettings) => void;

  /**
   * Starts a new world on a preset's map, or a random one (null) shaped by
   * `gen`.
   */
  onReset: (preset: string | null, gen: MapGenSettings) => void;
}

/**
 * Regenerate Map: a new world on a saved Map Preset or a random one, whose
 * settings show while Random is picked.
 *
 * @param {RegenerateMapProps} props - Component props.
 * @returns {React.JSX.Element} The rendered controls.
 */
function RegenerateMap({
  chosen,
  onChoose,
  presets,
  gen,
  onGen,
  onReset,
}: RegenerateMapProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-sm'>
      <span className='text-xs font-medium text-foreground'>Regenerate Map</span>
      <label className='flex flex-col gap-xsm'>
        <span className='text-xs text-foreground-muted'>Map Preset</span>
        <span className='relative flex'>
          <select
            value={chosen}
            className={`${PANEL_BUTTON} appearance-none pl-md pr-xl text-left`}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => onChoose(e.target.value)}>
            {presets.map(({ id, name }) => (
              <option
                key={id}
                value={id}>
                {name}
              </option>
            ))}
            <option value='random'>Random</option>
          </select>
          <ChevronDown
            size={14}
            className='pointer-events-none absolute right-md top-1/2 -translate-y-1/2 text-foreground-muted' />
        </span>
      </label>
      {chosen === 'random' && (
        <MapGenPanel
          settings={gen}
          onChange={onGen} />
      )}
      <ResetWorldButton onReset={(): void => onReset(chosen === 'random' ? null : chosen, gen)} />
    </div>
  );
}

export default RegenerateMap;
