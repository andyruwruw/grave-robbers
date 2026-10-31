// Packages
import React from 'react';

// Local Imports
import { statIconUrl } from '../../helpers/stat-icon-url';

// Types
import type { StatIcon } from '../../types/stat-icons';

/**
 * Props for the StatGlyph component.
 */
interface StatGlyphProps {
  /**
   * Which icon.
   */
  icon: StatIcon;

  /**
   * Width and height in CSS pixels.
   */
  size?: number;
}

/**
 * A little pre-rendered 3D icon for a stat or a trait.
 *
 * @param {StatGlyphProps} props - Component props.
 * @returns {React.JSX.Element} The rendered icon.
 */
function StatGlyph({ icon, size = 14 }: StatGlyphProps): React.JSX.Element {
  return (
    <img
      src={statIconUrl(icon)}
      alt=''
      width={size}
      height={size}
      draggable={false}
      className='pointer-events-none shrink-0 [image-rendering:pixelated]' />
  );
}

export default StatGlyph;
