// Packages
import React from 'react';

/**
 * Props for the SwitchPill component.
 */
interface SwitchPillProps {
  /**
   * Whether the switch is on.
   */
  on: boolean;
}

/**
 * The on/off pill at the end of a switch row: brand colored with the knob
 * to the right while on.
 *
 * @param {SwitchPillProps} props - Component props.
 * @returns {React.JSX.Element} The rendered pill.
 */
function SwitchPill({ on }: SwitchPillProps): React.JSX.Element {
  return (
    <span className={`flex h-5 w-9 shrink-0 items-center rounded-full border p-[2px] transition-colors ${on ? 'border-brand bg-brand' : 'border-border bg-background'}`}>
      <span className={`h-3.5 w-3.5 rounded-full transition-transform ${on ? 'translate-x-4 bg-foreground' : 'bg-foreground-muted'}`} />
    </span>
  );
}

export default SwitchPill;
