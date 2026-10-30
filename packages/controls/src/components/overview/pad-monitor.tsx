// Packages
import React, {
  useEffect,
  useState,
} from 'react';

// Local Imports
import { REFRESH_MS } from '../../config/pad-monitor';
import { readPads } from '../../helpers/pad-monitor';

// Types
import type { PadReading } from '../../types/pad-monitor';

/**
 * The controllers the browser on this computer can see, each with a light
 * that comes on while it's being pressed or moved, so it's easy to tell a
 * controller that's connected but sending nothing.
 *
 * @returns {React.JSX.Element} The rendered list.
 */
function PadMonitor(): React.JSX.Element {
  const [pads, setPads] = useState(readPads);

  useEffect(() => {
    const timer = setInterval((): void => setPads(readPads()), REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className='flex flex-col gap-xsm border-t border-border pt-sm'>
      <span className='text-xs font-medium text-foreground-muted'>Seen by this computer (lights up on input)</span>
      {pads.length === 0 ? (
        <span className='text-xs text-foreground-subtle'>None yet. Press a button on a controller.</span>
      ) : pads.map((pad: PadReading) => (
        <span
          key={pad.index}
          className='flex items-center gap-sm text-xs text-foreground'>
          <span className={`h-2 w-2 shrink-0 rounded-full ${pad.active ? 'bg-status-success-foreground' : 'bg-muted'}`} />
          <span className='truncate'>{pad.name}</span>
        </span>
      ))}
    </div>
  );
}

export default PadMonitor;
