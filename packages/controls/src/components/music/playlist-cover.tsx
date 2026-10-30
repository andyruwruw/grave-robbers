// Packages
import React from 'react';
import { ListMusic } from 'lucide-react';

/**
 * Props for the PlaylistCover component.
 */
interface PlaylistCoverProps {
  /**
   * The cover's URL, or null for the placeholder.
   */
  image: string | null;

  /**
   * Its width and height in px.
   */
  size: number;
}

/**
 * A playlist's cover, or a placeholder.
 *
 * @param {PlaylistCoverProps} props - Component props.
 * @returns {React.JSX.Element} The rendered cover.
 */
function PlaylistCover({ image, size }: PlaylistCoverProps): React.JSX.Element {
  return image ? (
    <img
      src={image}
      alt=''
      width={size}
      height={size}
      className='shrink-0 rounded-sm object-cover'
      style={{ width: size, height: size }} />
  ) : (
    <span
      className='flex shrink-0 items-center justify-center rounded-sm bg-muted text-foreground-subtle'
      style={{ width: size, height: size }}>
      <ListMusic size={size / 2} />
    </span>
  );
}

export default PlaylistCover;
