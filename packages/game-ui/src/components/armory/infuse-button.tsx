// Packages
import React, { useEffect, useState } from 'react';

// Local Imports
import { INFUSE_CONFIRM_MS } from '../../config/armory';

/**
 * Props for the InfuseButton component.
 */
interface InfuseButtonProps {
  /**
   * Whether infusing works now (lit), or not (greyed out).
   */
  ready: boolean;

  /**
   * Infuses.
   */
  onInfuse: () => void;
}

/**
 * Infuse, which is for good: the first press asks "Sure?", and only a
 * second press within `INFUSE_CONFIRM_MS` infuses.
 *
 * @param {InfuseButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered button.
 */
function InfuseButton({ ready, onInfuse }: InfuseButtonProps): React.JSX.Element {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) {
      return;
    }
    const timer = setTimeout((): void => setArmed(false), INFUSE_CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [armed]);
  useEffect(() => {
    if (!ready) {
      setArmed(false);
    }
  }, [ready]);

  return (
    <button
      type='button'
      disabled={!ready}
      className={`h-8 shrink-0 rounded-[2px] border-2 px-sm font-medium text-[13px] text-foreground disabled:border-border disabled:bg-muted disabled:text-foreground-muted disabled:opacity-60 ${armed ? 'border-danger bg-muted' : 'border-brand bg-brand-muted'}`}
      onBlur={(): void => setArmed(false)}
      onClick={(): void => {
        if (armed) {
          setArmed(false);
          onInfuse();
        } else {
          setArmed(true);
        }
      }}>
      {armed ? 'Sure?' : 'Infuse'}
    </button>
  );
}

export default InfuseButton;
