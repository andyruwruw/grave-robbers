// Packages
import React from 'react';

// Local Imports
import BindingGlyph from '../bindings/binding-glyph';

// Types
import type { UsePromptShown } from '../../types/play';

/**
 * Props for UsePromptTag.
 */
interface UsePromptTagProps {
  /**
   * The element `UsePrompt` moves and shows each frame.
   */
  promptRef: React.RefObject<HTMLDivElement | null>;

  /**
   * What it shows, or null.
   */
  prompt: UsePromptShown | null;

  /**
   * The UI scale.
   */
  scale: number;
}

/**
 * The tag over what USE would act on: the key or button's icon and what
 * it does, such as Open Sawmill. It starts hidden; `UsePrompt` places and
 * shows it every frame without re-rendering the page.
 *
 * @param {UsePromptTagProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tag.
 */
function UsePromptTag({ promptRef, prompt, scale }: UsePromptTagProps): React.JSX.Element {
  return (
    <div
      ref={promptRef}
      className='pointer-events-none fixed z-10 select-none'
      style={{ display: 'none' }}>
      {prompt && (
        <div
          className='flex origin-bottom items-center gap-xsm whitespace-nowrap rounded-md border border-border bg-background/80 px-xsm py-px'
          style={{ transform: `translate(-50%, -100%) scale(${scale})` }}>
          <BindingGlyph binding={prompt.binding} />
          <span className='font-medium text-xs leading-tight text-foreground'>{prompt.label}</span>
        </div>
      )}
    </div>
  );
}

export default UsePromptTag;
