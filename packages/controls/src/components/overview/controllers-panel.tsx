// Packages
import React from 'react';
import { Gamepad2 } from 'lucide-react';

// Local Imports
import TitledCard from '../ui/titled-card';
import PadMonitor from './pad-monitor';

// Types
import type { TvPadEntry } from '@halloween/shared/protocol/pads';

/**
 * Props for the ControllersPanel component.
 */
interface ControllersPanelProps {
  /**
   * Every game controller the TV pages can see, and who holds each.
   */
  pads: TvPadEntry[];

  /**
   * Shows what this page reads from its own controllers (the TV only).
   */
  local?: boolean;
}

/**
 * The Overview tab's Controllers card: each game controller plugged into a TV
 * machine, with the player who claimed it from their phone, or Free. The
 * TV number only shows when more than one TV page reports controllers.
 *
 * @param {ControllersPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function ControllersPanel({ pads, local = false }: ControllersPanelProps): React.JSX.Element {
  const tvs = new Set(pads.map((p: TvPadEntry): number => p.tv)).size;
  return (
    <TitledCard
      title='Controllers'
      bodyClassName='flex flex-col gap-sm px-lg py-md'>
      {pads.length === 0 ? (
        <span className='text-xs leading-snug text-foreground-muted'>No controllers found. Plug one into the TV computer and press any button on it.</span>
      ) : pads.map((pad: TvPadEntry) => (
        <div
          key={pad.id}
          className='flex items-center gap-sm rounded-md px-sm py-xsm'>
          <Gamepad2
            size={14}
            className='shrink-0 text-foreground-muted' />
          <span className='flex min-w-0 flex-1 flex-col'>
            <span className='truncate text-sm text-foreground'>{pad.name}</span>
            {tvs > 1 && <span className='text-xs text-foreground-subtle'>{`TV ${pad.tv}`}</span>}
          </span>
          {pad.player ? (
            <span className='flex min-w-0 items-center gap-xsm'>
              <span
                className='h-2.5 w-2.5 shrink-0 rounded-full'
                style={{ backgroundColor: pad.player.color }} />
              <span className='truncate text-sm text-foreground'>{pad.player.name}</span>
            </span>
          ) : <span className='text-xs text-foreground-subtle'>Free</span>}
        </div>
      ))}
      {local && <PadMonitor />}
      <span className='text-[11px] leading-snug text-foreground-subtle'>Players claim a controller from the controller button on their phone. Left stick walks, right stick aims, RT hits, LB blocks, B panics; the left and top face buttons and minus or back open the bag, crafting, and skill tree on their phone.</span>
    </TitledCard>
  );
}

export default ControllersPanel;
