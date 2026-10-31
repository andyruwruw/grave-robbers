// Packages
import React from 'react';
import { Gamepad2 } from 'lucide-react';
import JoinForm from '@halloween/game-ui/components/screens/join-form';

// Local Imports
import BindingGlyph from './bindings/binding-glyph';

/**
 * Props for JoinOverlay.
 */
interface JoinOverlayProps {
  /**
   * Set to the overlay, for the selection.
   */
  joinRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Whether the server has answered the hello (the form shows then).
   */
  welcomed: boolean;

  /**
   * Why the last join failed, if it did.
   */
  joinError: string | null;

  /**
   * Whether a join is on its way.
   */
  joining: boolean;

  /**
   * Whether the name belongs to a character on another device, so the
   * form asks for its transfer code.
   */
  needsCode: boolean;

  /**
   * Joins with a name, a color, and any transfer code.
   */
  onJoin: (name: string, color: string, code: string) => void;

  /**
   * The pad being played, if any.
   */
  padName: string | null;
}

/**
 * The /play join screen over the world: the join form, and which device
 * is playing.
 *
 * @param {JoinOverlayProps} props - Component props.
 * @returns {React.JSX.Element} The rendered overlay.
 */
function JoinOverlay({ joinRef, welcomed, joinError, joining, needsCode, onJoin, padName }: JoinOverlayProps): React.JSX.Element {
  return (
    <div
      ref={joinRef}
      className='absolute inset-0 flex items-center justify-center bg-background/70 p-md'>
      <div className='flex w-full max-w-md flex-col gap-sm'>
        {welcomed && (
          <JoinForm
            error={joinError}
            joining={joining}
            needsCode={needsCode}
            onJoin={onJoin}
            defaultName='Gamer'
            blurb={(
              <>
                Pick a name and a color. With a controller,
                {' '}
                <BindingGlyph
                  binding={{ dpad: 'any' }}
                  size={14} />
                {' '}
                moves and
                {' '}
                <BindingGlyph
                  binding={{ button: 0 }}
                  size={14} />
                {' '}
                presses.
              </>
            )} />
        )}
        <span className='flex items-center justify-center gap-xsm font-medium text-xs text-foreground-muted'>
          <Gamepad2 size={12} />
          {padName ?? 'Keyboard and mouse, or press a button on a controller'}
        </span>
      </div>
    </div>
  );
}

export default JoinOverlay;
