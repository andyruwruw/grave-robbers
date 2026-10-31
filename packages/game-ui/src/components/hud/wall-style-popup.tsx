// Packages
import React from 'react';

// Local Imports
import ItemIcon from '../items/item-icon';

// Types
import type { StyledWall } from '@halloween/shared/structures/wall-styles';

/**
 * Props for WallStylePopup.
 */
interface WallStylePopupProps {
  /**
   * The wall being built.
   */
  wall: StyledWall;

  /**
   * Its looks, by name.
   */
  styles: string[];

  /**
   * The look picked.
   */
  style: number;

  /**
   * The heading, with how to change the look ("Type (G)", or with a
   * key icon).
   */
  title: React.ReactNode;

  /**
   * Picks a look.
   */
  onPick: (style: number) => void;

  /**
   * Where it sits on the screen (each app puts it in its own corner).
   */
  className: string;
}

/**
 * While building a wall that comes in looks: every look, each drawn as it
 * will stand with its name, the picked one outlined. Tapping or clicking
 * one picks it.
 *
 * @param {WallStylePopupProps} props - Component props.
 * @returns {React.JSX.Element} The rendered popup.
 */
function WallStylePopup({ wall, styles, style, title, onPick, className }: WallStylePopupProps): React.JSX.Element {
  return (
    <div className={`z-20 flex flex-col gap-xsm rounded-md border border-border bg-background/90 p-xsm ${className}`}>
      <span className='px-xsm font-medium text-xs text-foreground-muted'>{title}</span>
      {styles.map((name: string, i: number) => (
        <button
          key={name}
          type='button'
          aria-pressed={i === style}
          className='flex items-center gap-sm rounded-md border-2 border-transparent bg-muted py-0.5 pl-0.5 pr-sm text-left aria-pressed:border-foreground'
          onClick={(): void => onPick(i)}>
          <ItemIcon
            item={`style:${wall}:${i}`}
            size={32} />
          <span className={`font-medium text-xs ${i === style ? 'text-foreground' : 'text-foreground-muted'}`}>{name}</span>
        </button>
      ))}
    </div>
  );
}

export default WallStylePopup;
