// Packages
import React, { useEffect, useState } from 'react';

// Local Imports
import ItemIcon from '../items/item-icon';

/**
 * Props for the NaughtyScreen component.
 */
interface NaughtyScreenProps {
  /**
   * The candy the kill cost, counted down to nothing.
   */
  candy: number;

  /**
   * Called once it has played out.
   */
  onDone: () => void;
}

/**
 * Milliseconds the candy takes to drain.
 */
const DRAIN_MS = 1400;

/**
 * Milliseconds the whole screen stays.
 */
const SHOW_MS = 3200;

/**
 * Killing another player is naughty: a huge shaking "NAUGHTY" over the
 * pad, and the candy icon with its count draining to 0. It doesn't block
 * the controls underneath.
 *
 * @param {NaughtyScreenProps} props - Component props.
 * @returns {React.JSX.Element} The rendered overlay.
 */
function NaughtyScreen({ candy, onDone }: NaughtyScreenProps): React.JSX.Element {
  const [shown, setShown] = useState(candy);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    /**
     * Drains the shown candy count along an ease-out curve, one frame at a time.
     * @param now The frame timestamp.
     */
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / DRAIN_MS);
      setShown(Math.round(candy * (1 - t) * (1 - t)));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    const done = setTimeout(onDone, SHOW_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(done);
    };
  }, [candy, onDone]);

  return (
    <div
      role='alert'
      className='naughty-fade pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center gap-lg'
      style={{ backgroundColor: 'rgba(60, 0, 0, 0.55)' }}>
      <span
        className='naughty-shake font-medium text-7xl leading-none text-danger'
        style={{ textShadow: '4px 4px 0 #000' }}>
        NAUGHTY
      </span>
      <span className='flex items-center gap-sm font-medium text-4xl text-foreground'>
        <ItemIcon
          item='res:candy'
          size={56} />
        {shown}
      </span>
    </div>
  );
}

export default NaughtyScreen;
