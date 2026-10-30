// Packages
import React from 'react';

/**
 * Props for the SidebarResizer component.
 */
interface SidebarResizerProps {
  /**
   * Starts a resize drag.
   */
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;

  /**
   * Follows a resize drag.
   */
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;

  /**
   * Ends a resize drag.
   */
  onPointerUp: () => void;
}

/**
 * The edge between the tree and its sidebar, dragged to resize it.
 *
 * @param {SidebarResizerProps} props - Component props.
 * @returns {React.JSX.Element} The rendered separator.
 */
function SidebarResizer({ onPointerDown, onPointerMove, onPointerUp }: SidebarResizerProps): React.JSX.Element {
  return (
    <div
      role='separator'
      aria-orientation='vertical'
      aria-label='Drag to resize'
      className='flex w-3 shrink-0 cursor-col-resize touch-none items-center justify-center border-l border-border'
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}>
      <span className='h-8 w-0.5 rounded-full bg-border' />
    </div>
  );
}

export default SidebarResizer;
