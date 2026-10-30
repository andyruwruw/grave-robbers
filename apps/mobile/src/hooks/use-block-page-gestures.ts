// Packages
import { useEffect } from 'react';

/**
 * Blocks pinch zoom, double-tap zoom, and page scrolling, so two thumbs
 * can't knock the page around (panels still scroll).
 */
export function useBlockPageGestures(): void {
  useEffect(() => {
    /**
     * Cancels the event's default.
     *
     * @param e - The event.
     */
    const block = (e: Event): void => e.preventDefault();
    /**
     * Cancels a touch move made with more than one finger.
     *
     * @param e - The touch event.
     */
    const blockPinch = (e: TouchEvent): void => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const options = { passive: false };
    document.addEventListener('gesturestart', block, options);
    document.addEventListener('gesturechange', block, options);
    document.addEventListener('touchmove', blockPinch, options);
    document.addEventListener('dblclick', block, options);
    return () => {
      document.removeEventListener('gesturestart', block);
      document.removeEventListener('gesturechange', block);
      document.removeEventListener('touchmove', blockPinch);
      document.removeEventListener('dblclick', block);
    };
  }, []);
}
