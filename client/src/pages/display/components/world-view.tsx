// Packages
import React, {
  useEffect,
  useRef,
} from 'react';

// Local Imports
import { WorldRenderer } from '../renderer/world-renderer';

/**
 * Props for the WorldView component.
 */
interface WorldViewProps {
  /**
   * Receives the renderer once mounted (null on unmount), so the page can
   * push snapshots straight to it without re-rendering React.
   */
  onReady: (renderer: WorldRenderer | null) => void;

  /**
   * Optional extra class names.
   */
  className?: string;
}

/**
 * Mounts the three.js graveyard and the HTML name-label layer above it.
 *
 * @param {WorldViewProps} props - Component props.
 * @returns {React.JSX.Element} The rendered view.
 */
function WorldView({
  onReady,
  className = '',
}: WorldViewProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const renderer = new WorldRenderer(containerRef.current!, labelsRef.current!);
    onReadyRef.current(renderer);
    return () => {
      onReadyRef.current(null);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`.trim()}>
      <div
        ref={labelsRef}
        className='pointer-events-none absolute inset-0' />
    </div>
  );
}

export default WorldView;
