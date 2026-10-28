// Packages
import React from 'react';
import { RotateCcw } from 'lucide-react';
import {
  DEFAULT_MAP_GEN,
  MAP_GEN_RANGES,
  MAP_STRUCTURES,
} from '@halloween/shared/map-gen';

// Local Imports
import Card from '../../../components/ui/primitives/card';

// Types
import type { MapGenSettings, MapStructure } from '@halloween/shared/map-gen';

/**
 * Props for the MapGenPanel component.
 */
interface MapGenPanelProps {
  settings: MapGenSettings;
  onChange: (settings: MapGenSettings) => void;
}

/**
 * Settings for the next random map, shown while the Game tab's map picker
 * is on Random: sliders for mountains, pits, extra stairs, and how much of
 * each kind of scenery, and switches for which landmarks get built.
 *
 * @param {MapGenPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function MapGenPanel({ settings, onChange }: MapGenPanelProps): React.JSX.Element {
  const value = (key: (typeof MAP_GEN_RANGES)[number]['key'], percent?: boolean): string =>
    (percent ? `${Math.round(settings[key] * 100)}%` : String(settings[key]));

  return (
    <Card className='flex flex-col'>
      <div className='flex items-center justify-between border-b border-[var(--arw-glass-edge)] px-lg py-sm'>
        <span className='text-sm font-medium text-foreground'>Random map</span>
        <button
          type='button'
          className='flex items-center gap-xsm rounded-sm px-xsm py-0.5 text-[11px] text-foreground-muted hover:bg-muted hover:text-foreground'
          onClick={(): void => onChange({ ...DEFAULT_MAP_GEN, structures: { ...DEFAULT_MAP_GEN.structures } })}>
          <RotateCcw size={11} />
          Defaults
        </button>
      </div>
      <div className='flex flex-col gap-md px-lg py-md'>
        {MAP_GEN_RANGES.map(({ key, label, min, max, step, percent }) => (
          <label
            key={key}
            className='flex flex-col gap-xsm'>
            <span className='flex justify-between text-xs text-foreground'>
              {label}
              <span className='text-foreground-subtle'>{value(key, percent)}</span>
            </span>
            <input
              type='range'
              min={min}
              max={max}
              step={step}
              value={settings[key]}
              className='w-full accent-brand'
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...settings, [key]: Number(e.target.value) })} />
          </label>
        ))}
        <div className='flex flex-col gap-xsm'>
          {MAP_STRUCTURES.map(({ key, label }) => {
            const on = settings.structures[key];
            return (
              <button
                key={key}
                type='button'
                role='switch'
                aria-checked={on}
                className='flex items-center gap-sm rounded-md px-sm py-xsm text-left text-xs text-foreground hover:bg-muted'
                onClick={(): void => onChange({ ...settings, structures: { ...settings.structures, [key as MapStructure]: !on } })}>
                <span className='flex-1'>{label}</span>
                <span className={`flex h-5 w-9 shrink-0 items-center rounded-full border p-[2px] transition-colors ${on ? 'border-brand bg-brand' : 'border-border bg-background'}`}>
                  <span className={`h-3.5 w-3.5 rounded-full transition-transform ${on ? 'translate-x-4 bg-foreground' : 'bg-foreground-muted'}`} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default MapGenPanel;
