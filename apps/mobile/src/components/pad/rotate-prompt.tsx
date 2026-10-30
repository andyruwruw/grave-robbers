// Packages
import React from 'react';
import { Smartphone } from 'lucide-react';

/**
 * The portrait overlay asking to turn the phone sideways.
 *
 * @returns {React.JSX.Element} The rendered prompt.
 */
function RotatePrompt(): React.JSX.Element {
  return (
    <div className='fixed inset-0 z-20 hidden flex-col items-center justify-center gap-md bg-background p-xl text-center portrait:flex'>
      <Smartphone
        size={40}
        className='rotate-90 text-foreground-muted' />
      <span className='font-medium text-base leading-relaxed text-foreground'>Turn your phone sideways</span>
    </div>
  );
}

export default RotatePrompt;
