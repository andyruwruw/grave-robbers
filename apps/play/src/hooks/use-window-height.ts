// Packages
import { useEffect, useState } from 'react';

/**
 * The window's inner height, kept current as it resizes.
 *
 * @returns The height in css px.
 */
export function useWindowHeight(): number {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    /**
     * Reads the new window height.
     */
    const onResize = (): void => setHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return height;
}
