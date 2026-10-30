// Packages
import React, { useState } from 'react';

// Local Imports
import { useMapGen } from '../../hooks/use-map-gen';
import MapCard from './map-card';
import RegenerateMap from './regenerate-map';
import SpawnCard from './spawn-card';
import SwitchesCard from './switches-card';
import WorldActions from './world-actions';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';
import type { TvView } from '../../types/tv-view';

/**
 * Props for the GamePanel component.
 */
interface GamePanelProps {
  /**
   * The server's current switches.
   */
  settings: GameSettings;

  /**
   * Whether a blood moon is up right now.
   */
  bloodMoon: boolean;

  /**
   * The hidden world level right now.
   */
  worldLevel: number;

  /**
   * Changes some of the switches.
   */
  onChange: (settings: Partial<GameSettings>) => void;

  /**
   * Spawns an object or monster somewhere on the map.
   */
  onSpawn: (kind: SpawnKind) => void;

  /**
   * Summons a blood moon.
   */
  onBloodMoon: () => void;

  /**
   * Kills every monster on the map.
   */
  onKillMonsters: () => void;

  /**
   * Opens the map editor.
   */
  onEditMap?: () => void;

  /**
   * Shows each control's keyboard shortcut (the TV).
   */
  shortcuts?: boolean;

  /**
   * The TV's view preset for huge worlds (on the TV only).
   */
  tvView?: TvView;

  /**
   * Picks another view preset (on the TV only).
   */
  onTvView?: (view: TvView) => void;

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
 * The sidebar's Game tab, testing controls: switch monster aggression,
 * the test player, the lights, and what the TV's mouse can do (pick up
 * players and monsters, carry a light), boost the world level; spawn
 * objects or monsters anywhere; summon a blood moon, switch to daytime and
 * back, and kill every monster; and a Map card with the Map Editor and
 * the TV view (how much ground each pane of a huge world shows; both TV
 * only) and Regenerate Map: a new world on a saved Map Preset (the first
 * by default) or a random one, whose mountains, pits, stairs, landmarks,
 * and scenery can be set first. On the TV each control with a keyboard
 * shortcut shows its letter.
 *
 * @param {GamePanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function GamePanel({
  settings,
  bloodMoon,
  worldLevel,
  onChange,
  onSpawn,
  onBloodMoon,
  onKillMonsters,
  onEditMap,
  shortcuts = false,
  tvView,
  onTvView,
  presets,
  onReset,
}: GamePanelProps): React.JSX.Element {
  const [map, setMap] = useState<string>('');
  const chosen = map || presets[0]?.id || 'random';
  const [gen, changeGen] = useMapGen();

  return (
    <div className='flex flex-col gap-lg'>
      <SwitchesCard
        settings={settings}
        worldLevel={worldLevel}
        onChange={onChange}
        shortcuts={shortcuts} />

      <SpawnCard onSpawn={onSpawn} />

      <WorldActions
        bloodMoon={bloodMoon}
        daytime={settings.daytime}
        shortcuts={shortcuts}
        onBloodMoon={onBloodMoon}
        onDaytime={(): void => onChange({ daytime: !settings.daytime })}
        onKillMonsters={onKillMonsters} />

      <MapCard
        onEditMap={onEditMap}
        tvView={tvView}
        onTvView={onTvView}>
        <RegenerateMap
          chosen={chosen}
          onChoose={setMap}
          presets={presets}
          gen={gen}
          onGen={changeGen}
          onReset={onReset} />
      </MapCard>
    </div>
  );
}

export default GamePanel;
