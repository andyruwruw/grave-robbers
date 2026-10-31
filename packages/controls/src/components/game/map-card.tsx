// Packages
import React from 'react';
import { Pencil } from 'lucide-react';

// Local Imports
import { PANEL_BUTTON } from '../../config/styles';
import TitledCard from '../ui/titled-card';
import TvViewPicker from './tv-view-picker';

// Types
import type { TvView } from '../../types/tv-view';

/**
 * Props for the MapCard component.
 */
interface MapCardProps {
  /**
   * Opens the map editor.
   */
  onEditMap?: () => void;

  /**
   * The TV's view preset for huge worlds (on the TV only).
   */
  tvView?: TvView;

  /**
   * Picks another view preset (on the TV only).
   */
  onTvView?: (view: TvView) => void;

  /**
   * The Regenerate Map controls.
   */
  children: React.ReactNode;
}

/**
 * The Map card: the Map Editor button and the TV view picker (both TV
 * only), then Regenerate Map.
 *
 * @param {MapCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function MapCard({
  onEditMap,
  tvView,
  onTvView,
  children,
}: MapCardProps): React.JSX.Element {
  return (
    <TitledCard
      title='Map'
      bodyClassName='flex flex-col gap-lg px-lg py-md'>
      {onEditMap && (
        <button
          type='button'
          className={PANEL_BUTTON}
          onClick={onEditMap}>
          <Pencil size={14} />
          Map Editor
        </button>
      )}
      {tvView && onTvView && (
        <TvViewPicker
          tvView={tvView}
          onTvView={onTvView} />
      )}
      {children}
    </TitledCard>
  );
}

export default MapCard;
