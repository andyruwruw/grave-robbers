// Packages
import React from 'react';
import { itemIconUrl } from '@halloween/renderer/icons/item-icons';

// Types
import type { IconKey } from '@halloween/renderer/types/icons';

/**
 * Props for the ItemIcon component.
 */
interface ItemIconProps {
  /**
   * What to show.
   */
  item: IconKey;

  /**
   * Width and height in CSS pixels.
   */
  size: number;

  /**
   * Extra classes, such as dimming.
   */
  className?: string;
}

/**
 * A little 3D model of an item, drawn once with the TV's own voxel models
 * and kept as an image.
 *
 * @param {ItemIconProps} props - Component props.
 * @returns {React.JSX.Element} The rendered icon.
 */
function ItemIcon({
  item,
  size,
  className = '',
}: ItemIconProps): React.JSX.Element {
  return (
    <img
      src={itemIconUrl(item)}
      alt=''
      width={size}
      height={size}
      draggable={false}
      className={`pointer-events-none shrink-0 [image-rendering:pixelated] [-webkit-touch-callout:none] ${className}`} />
  );
}

export default ItemIcon;
