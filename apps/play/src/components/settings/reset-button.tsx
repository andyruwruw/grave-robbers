// Packages
import React from 'react';
import { RotateCcw } from 'lucide-react';

// Local Imports
import { SETTINGS_BUTTON } from '../../config/play';

/**
 * Props for ResetButton.
 */
interface ResetButtonProps {
  /**
   * The setting's name, for the tooltip and screen readers.
   */
  label: string;

  /**
   * What the default reads as, for the tooltip.
   */
  defaultReadout: string;

  /**
   * Whether the setting is already at its default (the button hides and
   * can't be selected).
   */
  atDefault: boolean;

  /**
   * Puts the setting back to its default.
   */
  onReset: () => void;
}

/**
 * The small button at the end of a settings row that puts that one setting
 * back to its default; invisible (but still taking its space, so rows line
 * up) and disabled while it's already there.
 *
 * @param {ResetButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered button.
 */
function ResetButton({ label, defaultReadout, atDefault, onReset }: ResetButtonProps): React.JSX.Element {
  return (
    <button
      type='button'
      aria-label={`Reset ${label}`}
      title={`Reset to ${defaultReadout}`}
      disabled={atDefault}
      className={`${SETTINGS_BUTTON} shrink-0 border-border bg-muted px-1.5 text-foreground-muted ${atDefault ? 'invisible' : ''}`}
      onClick={onReset}>
      <RotateCcw size={11} />
    </button>
  );
}

export default ResetButton;
