// Packages
import React from 'react';
import { Hand, ShieldHalf } from 'lucide-react';
import { twoHanded } from '@halloween/shared/gear/gear-catalog';
import BuildError from '@halloween/game-ui/components/hud/build-error';

// Local Imports
import ActionButton from '../sticks/action-button';

// Types
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { PlayerCommands } from '@halloween/game-ui/session/player-commands';

/**
 * Props for FightControls.
 */
interface FightControlsProps {
  /**
   * What's equipped (Block shows beside a one-handed weapon with a shield).
   */
  gear: Gear;

  /**
   * Why the last build failed, shown briefly.
   */
  buildError: string | null;

  /**
   * The player's commands.
   */
  commands: PlayerCommands;
}

/**
 * The right side while no list is open: the last build error, the USE
 * button (opens or works what's in front without hurting it), the Block
 * button (held, with a shield and a one-handed weapon), and the Action
 * button (hits and works).
 *
 * @param {FightControlsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered controls.
 */
function FightControls({ gear, buildError, commands }: FightControlsProps): React.JSX.Element {
  return (
    <>
      <div className='flex min-h-0 flex-1 items-end justify-end'>
        <BuildError error={buildError} />
      </div>
      <div className='flex shrink-0 items-end justify-end gap-md'>
        <button
          type='button'
          aria-label='Use'
          className='mb-16 flex h-14 w-14 touch-none flex-col items-center justify-center gap-0.5 rounded-full border-2 border-border bg-muted font-medium text-xs text-foreground active:border-foreground active:bg-brand-muted'
          onPointerDown={(): void => {
            navigator.vibrate?.(10);
            commands.use();
          }}
          onContextMenu={(e: React.MouseEvent): void => e.preventDefault()}>
          <Hand size={18} />
          USE
        </button>
        {gear.equipped.offhand?.kind === 'shield' && !twoHanded(gear.equipped.weapon?.kind) && (
          <button
            type='button'
            aria-label='Block (hold)'
            className='flex h-16 w-16 touch-none flex-col items-center justify-center gap-0.5 rounded-full border-2 border-border bg-muted font-medium text-xs text-foreground active:border-foreground active:bg-brand-muted'
            onPointerDown={(e: React.PointerEvent<HTMLButtonElement>): void => {
              e.currentTarget.setPointerCapture(e.pointerId);
              navigator.vibrate?.(10);
              commands.block(true);
            }}
            onPointerUp={(): void => commands.block(false)}
            onPointerCancel={(): void => commands.block(false)}
            onContextMenu={(e: React.MouseEvent): void => e.preventDefault()}>
            <ShieldHalf size={20} />
            BLOCK
          </button>
        )}
        <ActionButton
          onChange={commands.action}
          onAim={commands.aim} />
      </div>
    </>
  );
}

export default FightControls;
