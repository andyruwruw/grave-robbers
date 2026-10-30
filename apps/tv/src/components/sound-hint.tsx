// Packages
import React from 'react';
import { VolumeX } from 'lucide-react';

/**
 * The faded "Click for sound" hint in the corner, shown until the browser
 * lets sound play.
 *
 * @returns {React.JSX.Element} The rendered hint.
 */
function SoundHint(): React.JSX.Element {
  return (
    <div className='pointer-events-none absolute bottom-sm right-sm flex items-center gap-xsm rounded-sm px-sm py-xsm font-medium text-sm text-foreground-muted opacity-60'>
      <VolumeX size={12} />
      Click for sound
    </div>
  );
}

export default SoundHint;
