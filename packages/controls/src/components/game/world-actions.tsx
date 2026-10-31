// Packages
import React from 'react';
import {
  Moon,
  Skull,
  Sun,
} from 'lucide-react';
import { WORLD_EVENTS, WORLD_EVENT_KINDS } from '@halloween/shared/world-events/world-event-catalog';

// Local Imports
import { PANEL_BUTTON } from '../../config/styles';
import { WORLD_EVENT_BUTTONS } from '../../config/world-events';
import Kbd from './kbd';

// Types
import type { WorldEventKind } from '@halloween/shared/world-events/types/world-events';

/**
 * Props for the WorldActions component.
 */
interface WorldActionsProps {
  /**
   * The world events that are up right now.
   */
  worldEvents: WorldEventKind[];

  /**
   * Whether it's daytime.
   */
  daytime: boolean;

  /**
   * Shows each button's keyboard shortcut (the TV).
   */
  shortcuts: boolean;

  /**
   * Starts a world event.
   */
  onStartEvent: (kind: WorldEventKind) => void;

  /**
   * Switches between day and night.
   */
  onDaytime: () => void;

  /**
   * Kills every monster on the map.
   */
  onKillMonsters: () => void;
}

/**
 * Buttons to start each world event, switch to daytime and back, and kill
 * every monster.
 *
 * @param {WorldActionsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered buttons.
 */
function WorldActions({
  worldEvents,
  daytime,
  shortcuts,
  onStartEvent,
  onDaytime,
  onKillMonsters,
}: WorldActionsProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-sm'>
      {WORLD_EVENT_KINDS.map((kind: WorldEventKind): React.JSX.Element => {
        const { icon: Icon, color, key } = WORLD_EVENT_BUTTONS[kind];
        const { name } = WORLD_EVENTS[kind];
        const up = worldEvents.includes(kind);
        return (
          <button
            key={kind}
            type='button'
            disabled={up}
            className={`${PANEL_BUTTON} relative`}
            onClick={(): void => onStartEvent(kind)}>
            <Icon
              size={14}
              fill='currentColor'
              className={color} />
            {up ? `${name} rising` : `Summon ${name.toLowerCase()}`}
            {shortcuts && <span className='absolute right-sm'><Kbd>{key}</Kbd></span>}
          </button>
        );
      })}
      <button
        type='button'
        aria-pressed={daytime}
        className={`${PANEL_BUTTON} relative`}
        onClick={onDaytime}>
        {daytime ? (
          <Moon size={14} />
        ) : (
          <Sun
            size={14}
            className='text-status-warning-foreground' />
        )}
        {daytime ? 'Back to night' : 'Make it day'}
        {shortcuts && <span className='absolute right-sm'><Kbd>D</Kbd></span>}
      </button>
      <button
        type='button'
        className={`${PANEL_BUTTON} relative`}
        onClick={onKillMonsters}>
        <Skull size={14} />
        Kill all monsters
        {shortcuts && <span className='absolute right-sm'><Kbd>K</Kbd></span>}
      </button>
    </div>
  );
}

export default WorldActions;
