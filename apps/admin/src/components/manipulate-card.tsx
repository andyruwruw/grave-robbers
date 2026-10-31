// Packages
import React from 'react';
import { PackageX, Skull } from 'lucide-react';
import { WORLD_EVENTS, WORLD_EVENT_KINDS } from '@halloween/shared/world-events/world-event-catalog';
import WorldLevelRow from '@halloween/controls/components/game/world-level-row';
import TitledCard from '@halloween/controls/components/ui/titled-card';
import { PANEL_BUTTON } from '@halloween/controls/config/styles';
import { WORLD_EVENT_BUTTONS } from '@halloween/controls/config/world-events';

// Local Imports
import DifficultyRow from './difficulty-row';
import StockTargets from './stock-targets';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { RegrowthTile } from '@halloween/shared/world/regrowth';
import type { WorldEventKind } from '@halloween/shared/world-events/types/world-events';

/**
 * Props for the ManipulateCard component.
 */
interface ManipulateCardProps {
  /**
   * The server's current switches.
   */
  settings: GameSettings;

  /**
   * The hidden world level right now.
   */
  worldLevel: number;

  /**
   * The world events that are up right now.
   */
  worldEvents: WorldEventKind[];

  /**
   * Changes some of the switches (the world level boost).
   */
  onChange: (settings: Partial<GameSettings>) => void;

  /**
   * Starts a world event.
   */
  onStartEvent: (kind: WorldEventKind) => void;

  /**
   * Kills every monster on the map.
   */
  onKillMonsters: () => void;

  /**
   * Destroys every item on the ground.
   */
  onClearItems: () => void;

  /**
   * How many of each regrowing tile the map keeps growing back to.
   */
  regrowth: Record<RegrowthTile, number>;

  /**
   * How many of each the map has now.
   */
  stocked: Record<RegrowthTile, number>;

  /**
   * Sets one regrowing tile's target.
   */
  onRegrowth: (tile: RegrowthTile, target: number) => void;
}

/**
 * The Gameplay page's Manipulate section: the world level, a button per
 * world event (the blood moon), Kill all monsters, Destroy ground items,
 * and how many trees, hedges, pumpkins, chests, and rocks the world keeps
 * (`StockTargets`).
 *
 * @param {ManipulateCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function ManipulateCard({
  settings,
  worldLevel,
  worldEvents,
  onChange,
  onStartEvent,
  onKillMonsters,
  onClearItems,
  regrowth,
  stocked,
  onRegrowth,
}: ManipulateCardProps): React.JSX.Element {
  return (
    <TitledCard title='Manipulate'>
      <DifficultyRow
        settings={settings}
        onChange={onChange} />
      <WorldLevelRow
        settings={settings}
        worldLevel={worldLevel}
        onChange={onChange} />
      <div className='flex flex-col gap-sm'>
        {WORLD_EVENT_KINDS.map((kind: WorldEventKind): React.JSX.Element => {
          const { icon: Icon, color } = WORLD_EVENT_BUTTONS[kind];
          const { name } = WORLD_EVENTS[kind];
          const up = worldEvents.includes(kind);
          return (
            <button
              key={kind}
              type='button'
              disabled={up}
              className={PANEL_BUTTON}
              onClick={(): void => onStartEvent(kind)}>
              <Icon
                size={14}
                fill='currentColor'
                className={color} />
              {up ? `${name} rising` : `Summon ${name.toLowerCase()}`}
            </button>
          );
        })}
        <button
          type='button'
          className={PANEL_BUTTON}
          onClick={onKillMonsters}>
          <Skull size={14} />
          Kill all monsters
        </button>
        <button
          type='button'
          className={PANEL_BUTTON}
          onClick={onClearItems}>
          <PackageX size={14} />
          Destroy ground items
        </button>
      </div>
      <StockTargets
        targets={regrowth}
        stocked={stocked}
        onTarget={onRegrowth} />
    </TitledCard>
  );
}

export default ManipulateCard;
