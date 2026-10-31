// Packages
import React from 'react';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { TURNED } from '@halloween/shared/structures/placement';
import { wallStyles } from '@halloween/shared/structures/wall-styles';
import BuildError from '@halloween/game-ui/components/hud/build-error';
import ItemIcon from '@halloween/game-ui/components/items/item-icon';

// Local Imports
import BindingGlyph from '../bindings/binding-glyph';

// Types
import type { BuildItem } from '@halloween/shared/inventory/bag-items';
import type { Binding } from '../../types/play';

/**
 * Props for BuildBanner.
 */
interface BuildBannerProps {
  /**
   * What's being built, if anything.
   */
  building: BuildItem | null;

  /**
   * Why the last build failed, shown briefly.
   */
  buildError: string | null;

  /**
   * The bindings it shows: the look, rotate, and attack (which builds)
   * keys, for the keyboard.
   */
  keys: { look: string; rotate: string; attack: string };

  /**
   * The attack button on a controller (it builds).
   */
  padAttack: number;

  /**
   * The device used last, which the hints name buttons for.
   */
  device: 'pad' | 'keys';
}

/**
 * One hint: what it does and the keys or buttons that do it.
 */
interface Hint {
  /**
   * What it does.
   */
  label: string;

  /**
   * What does it.
   */
  bindings: Binding[];
}

/**
 * The hints for what's being built, for the device in hand, as in Type
 * [G], Rotate [R], Build [left click], Back [Esc]: Type only for a wall
 * that comes in looks, Rotate only for what's placed facing a way.
 * @param building What's being built.
 * @param keys The keyboard's bindings.
 * @param padAttack The controller's attack button.
 * @param device The device in hand.
 * @returns The hints.
 */
function hints(building: BuildItem, keys: BuildBannerProps['keys'], padAttack: number, device: 'pad' | 'keys'): Hint[] {
  const pad = device === 'pad';
  const all: (Hint | null)[] = [
    wallStyles(building.build).length > 0 ? { label: 'Type', bindings: [pad ? { dpad: 'left-right' } : { code: keys.look }] } : null,
    TURNED.has(building.build) ? { label: 'Rotate', bindings: pad ? [{ button: 4 }, { button: 5 }] : [{ code: keys.rotate }] } : null,
    { label: 'Build', bindings: [pad ? { button: padAttack } : { code: keys.attack }] },
    { label: 'Back', bindings: [pad ? { button: 1 } : { code: 'Escape' }] },
  ];
  return all.filter((h: Hint | null): h is Hint => h !== null);
}

/**
 * The strip along the bottom of /play: while building, what's being built
 * with how to change its look, rotate, build, and go back, and the last
 * build error under it; else just the error, while it shows.
 *
 * @param {BuildBannerProps} props - Component props.
 * @returns {React.ReactNode} The rendered strip, or nothing.
 */
function BuildBanner({ building, buildError, keys, padAttack, device }: BuildBannerProps): React.ReactNode {
  return building ? (
    <div className='absolute inset-x-0 bottom-md flex flex-col items-center gap-xsm'>
      <div className='flex items-center gap-sm rounded-md border border-border bg-background/80 px-md py-xsm'>
        <ItemIcon
          item={`build:${building.build}`}
          size={32} />
        <span className='font-medium text-sm leading-tight text-foreground'>
          {itemLabel(`build:${building.build}`)}
          <span className='ml-xsm text-foreground-muted'>x{building.count}</span>
        </span>
        {hints(building, keys, padAttack, device).map((h: Hint) => (
          <span
            key={h.label}
            className='flex items-center gap-xsm font-medium text-xs text-foreground-muted'>
            {h.label}
            {h.bindings.map((b: Binding, i: number) => (
              <BindingGlyph
                key={i}
                binding={b} />
            ))}
          </span>
        ))}
      </div>
      <BuildError error={buildError} />
    </div>
  ) : buildError && (
    <div className='absolute inset-x-0 bottom-sm flex justify-center'>
      <BuildError error={buildError} />
    </div>
  );
}

export default BuildBanner;
