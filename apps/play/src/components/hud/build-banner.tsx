// Packages
import React from 'react';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import BuildError from '@halloween/game-ui/components/hud/build-error';
import ItemIcon from '@halloween/game-ui/components/items/item-icon';

// Types
import type { BuildItem } from '@halloween/shared/inventory/bag-items';

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
   * The attack binding's name (it builds).
   */
  attackLabel: string;

  /**
   * The device used last, for the back hint.
   */
  device: 'pad' | 'keys';
}

/**
 * The strip along the bottom of /play: while building, what's being built
 * with how to build and go back, and the last build error under it; else
 * just the error, while it shows.
 *
 * @param {BuildBannerProps} props - Component props.
 * @returns {React.ReactNode} The rendered strip, or nothing.
 */
function BuildBanner({ building, buildError, attackLabel, device }: BuildBannerProps): React.ReactNode {
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
        <span className='font-medium text-xs text-foreground-muted'>{`${attackLabel} build, ${device === 'pad' ? 'B' : 'Esc'} back`}</span>
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
