// Packages
import React from 'react';
import { Music } from 'lucide-react';

/**
 * Props for the SongArt component.
 */
interface SongArtProps {
  /**
   * The cover's URL, or null for the placeholder.
   */
  src: string | null;

  /**
   * Its width and height in px.
   */
  size: number;
}

/**
 * A song's cover, or a note placeholder.
 *
 * @param {SongArtProps} props - Component props.
 * @returns {React.JSX.Element} The rendered cover.
 */
function SongArt({ src, size }: SongArtProps): React.JSX.Element {
  return src ? (
    <img
      src={src}
      alt=''
      className='shrink-0 rounded-sm object-cover'
      style={{ width: size, height: size }} />
  ) : (
    <span
      className='flex shrink-0 items-center justify-center rounded-sm bg-muted text-foreground-subtle'
      style={{ width: size, height: size }}>
      <Music size={size / 2} />
    </span>
  );
}

export default SongArt;
