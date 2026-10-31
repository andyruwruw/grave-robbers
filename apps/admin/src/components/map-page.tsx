// Packages
import React from 'react';
import { Map as MapIcon, Pencil } from 'lucide-react';
import ControlTabs from '@halloween/controls/components/control-panel/control-tabs';
import TitledCard from '@halloween/controls/components/ui/titled-card';

// Local Imports
import NewMapPage from './new-map-page';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { TabInfo } from '@halloween/controls/types/control-panel';

/**
 * The Map page's tabs.
 */
type MapTab = 'new' | 'editor';

/**
 * The Map page's tab buttons.
 */
const MAP_TABS: TabInfo<MapTab>[] = [
  { key: 'new', label: 'New Map', icon: MapIcon },
  { key: 'editor', label: 'Map Editor', icon: Pencil },
];

/**
 * Props for the MapPage component.
 */
interface MapPageProps {
  /**
   * Whether the map editor is open (the Map Editor tab).
   */
  editing: boolean;

  /**
   * Opens or closes the map editor.
   */
  onEditing: (open: boolean) => void;

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
 * The admin's Map page, in two tabs: New Map (regenerate on a preset or a
 * random map) and Map Editor, whose tab is open while the editor is (over
 * the world view).
 *
 * @param {MapPageProps} props - Component props.
 * @returns {React.JSX.Element} The rendered page.
 */
function MapPage({ editing, onEditing, presets, onReset }: MapPageProps): React.JSX.Element {
  return (
    <>
      <ControlTabs
        tabs={MAP_TABS}
        tab={editing ? 'editor' : 'new'}
        onTab={(tab: MapTab): void => onEditing(tab === 'editor')} />
      {editing ? (
        <TitledCard title='Map Editor'>
          <span className='text-xs leading-snug text-foreground-muted'>The editor is open over the world view. New Map, Back, or Escape closes it.</span>
        </TitledCard>
      ) : (
        <NewMapPage
          presets={presets}
          onReset={onReset} />
      )}
    </>
  );
}

export default MapPage;
