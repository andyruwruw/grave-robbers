// Packages
import { useState } from 'react';
import { TV_PIXEL_SIZE } from '@halloween/controls/config/tv-pixel-size';
import { TV_PIXEL_SIZE_STORAGE_KEY } from '@halloween/ui/config/storage-keys';
import { readStorage, writeStorage } from '@halloween/ui/helpers/storage';

/**
 * Reads the saved pixel size, clamped to the slider, or the default.
 *
 * @returns The pixel size.
 */
function loadPixelSize(): number {
  const saved = Number(readStorage(TV_PIXEL_SIZE_STORAGE_KEY));
  return Number.isFinite(saved) && saved > 0 ? Math.min(TV_PIXEL_SIZE.max, Math.max(TV_PIXEL_SIZE.min, Math.round(saved))) : TV_PIXEL_SIZE.default;
}

/**
 * The TV's pixel size (the Music tab's TV Look card), kept per browser.
 *
 * @returns The pixel size and a setter that saves it.
 */
export function useTvPixelSize(): [number, (size: number) => void] {
  const [size, setSize] = useState<number>(loadPixelSize);
  const change = (next: number): void => {
    setSize(next);
    writeStorage(TV_PIXEL_SIZE_STORAGE_KEY, String(next));
  };
  return [size, change];
}
