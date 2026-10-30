// Packages
import React from 'react';

/**
 * Props for the BuildError component.
 */
interface BuildErrorProps {
  /**
   * Why the last build failed, or null while there's nothing to say.
   */
  error: string | null;
}

/**
 * The warning line saying why a build didn't go down, while it shows.
 *
 * @param {BuildErrorProps} props - Component props.
 * @returns {React.JSX.Element | null} The rendered warning, or nothing.
 */
function BuildError({ error }: BuildErrorProps): React.JSX.Element | null {
  return error ? <span className='font-medium text-[13px] text-status-warning-foreground'>{error}</span> : null;
}

export default BuildError;
