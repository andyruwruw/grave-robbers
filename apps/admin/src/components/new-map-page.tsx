// Packages
import React, { useState } from 'react';
import RegenerateMap from '@halloween/controls/components/game/regenerate-map';
import { useMapGen } from '@halloween/controls/hooks/use-map-gen';
import TitledCard from '@halloween/controls/components/ui/titled-card';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';

/**
 * Props for the NewMapPage component.
 */
interface NewMapPageProps {
  /**
   * Saved map layouts a new world can start from.
   */
  presets: { id: string; name: string }[];

  /**
   * Starts a new world on a preset's map, or a random one (null) shaped by
   * `gen`.
   */
  onReset: (preset: string | null, gen: MapGenSettings) => void;
}

/**
 * The Map page's New Map tab: a new world on a saved Map Preset (the first by
 * default) or a random one shaped first (`RegenerateMap`).
 *
 * @param {NewMapPageProps} props - Component props.
 * @returns {React.JSX.Element} The rendered page.
 */
function NewMapPage({ presets, onReset }: NewMapPageProps): React.JSX.Element {
  const [map, setMap] = useState<string>('');
  const chosen = map || presets[0]?.id || 'random';
  const [gen, changeGen] = useMapGen();

  return (
    <TitledCard
      title='New Map'
      bodyClassName='flex flex-col gap-lg px-lg py-md'>
      <RegenerateMap
        chosen={chosen}
        onChoose={setMap}
        presets={presets}
        gen={gen}
        onGen={changeGen}
        onReset={onReset} />
    </TitledCard>
  );
}

export default NewMapPage;
