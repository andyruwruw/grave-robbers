// Packages
import React, {
  useEffect,
  useState,
} from 'react';
import { Loader2 } from 'lucide-react';

// Local Imports
import { GENERATING_STEPS, GENERATING_STEP_MS } from '../../config/generating';

/**
 * A popup over a dimmed screen while the server generates a huge world
 * (from its `generating` message until the `world` that follows): a
 * spinner, and a line of what it's up to that changes every
 * GENERATING_STEP_MS.
 *
 * @returns {React.JSX.Element} The rendered popup.
 */
function GeneratingScreen(): React.JSX.Element {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval((): void => setStep((s: number): number => (s + 1) % GENERATING_STEPS.length), GENERATING_STEP_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role='alertdialog'
      aria-live='polite'
      aria-label='Generating world'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-md backdrop-blur-sm'>
      <div className='flex w-full max-w-xs flex-col items-center gap-md rounded-lg border border-border bg-background/90 px-xl py-lg text-center shadow-lg'>
        <Loader2
          size={32}
          className='animate-spin text-brand' />
        <div className='flex flex-col gap-xsm'>
          <span className='font-medium text-lg text-foreground'>Generating world</span>
          <span className='text-sm text-foreground-muted'>{GENERATING_STEPS[step]}...</span>
        </div>
        <span className='text-xs text-foreground-subtle'>A huge world takes a few seconds.</span>
      </div>
    </div>
  );
}

export default GeneratingScreen;
