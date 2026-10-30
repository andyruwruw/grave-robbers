// Packages
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isMatRecipe } from '@halloween/shared/crafting/material-recipes';
import { itemSpinUrls } from '@halloween/renderer/icons/item-icons';

// Local Imports
import { SPIN_FRAME_MS } from '../../config/item-details';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { ItemKey } from '@halloween/shared/inventory/item-keys';

/**
 * Props for the SpinningModel component.
 */
interface SpinningModelProps {
  /**
   * What to show.
   */
  item: RecipeId | ItemKey;

  /**
   * Width and height in CSS pixels.
   */
  size: number;

  /**
   * Dims it (something locked).
   */
  dim: boolean;

  /**
   * Blurs it (a mystery).
   */
  blur?: boolean;
}

/**
 * The item's model turning slowly in place.
 *
 * @param {SpinningModelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered model.
 */
function SpinningModel({ item, size, dim, blur = false }: SpinningModelProps): React.JSX.Element {
  const key = isMatRecipe(item) ? `mat:${item}` as const : item;
  const frames = useMemo((): string[] => itemSpinUrls(key), [key]);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval((): void => setFrame((f: number): number => (f + 1) % frames.length), SPIN_FRAME_MS);
    return () => clearInterval(timer);
  }, [frames]);
  return (
    <img
      src={frames[frame]}
      alt=''
      width={size}
      height={size}
      draggable={false}
      className={`pointer-events-none [image-rendering:pixelated] ${dim ? 'opacity-40' : ''} ${blur ? 'blur-[10px]' : ''}`} />
  );
}

export default SpinningModel;
