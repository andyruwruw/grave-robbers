// Packages
import { useRef, useState } from 'react';
import { RESOURCES } from '@halloween/shared/goods/goods';

// Local Imports
import { TOAST_MS } from '../config/session';

// Types
import type { Inventory, Resource } from '@halloween/shared/goods/goods';
import type { PickupToast } from '../types/toasts';

/**
 * What `usePickupToasts` hands back.
 */
interface PickupToastState {
  /**
   * The notes showing now.
   */
  toasts: PickupToast[];

  /**
   * Shows (or adds to) a note for each resource that went up.
   */
  bump: (before: Inventory | null, next: Inventory) => void;
}

/**
 * The "+6 candy" notes: one per resource, added to while it shows, each
 * gone `TOAST_MS` after its last bump.
 *
 * @returns The notes and a way to bump them.
 */
export function usePickupToasts(): PickupToastState {
  const [toasts, setToasts] = useState<PickupToast[]>([]);
  const toastTimers = useRef(new Map<Resource, ReturnType<typeof setTimeout>>());
  const toastId = useRef(0);

  /**
   * Bumps a note for every resource `next` has more of than `before`
   * (nothing when there's no `before`).
   *
   * @param before - The inventory last heard, or null.
   * @param next - The inventory just heard.
   */
  const bump = (before: Inventory | null, next: Inventory): void => {
    for (const r of RESOURCES) {
      const gained = before ? next[r] - before[r] : 0;
      if (gained > 0) {
        toastId.current++;
        const id = toastId.current;
        setToasts((list: PickupToast[]): PickupToast[] => {
          const shown = list.find((t: PickupToast): boolean => t.resource === r);
          return shown
            ? list.map((t: PickupToast): PickupToast => (t.resource === r ? { resource: r, amount: t.amount + gained, id } : t))
            : [...list, { resource: r, amount: gained, id }];
        });
        clearTimeout(toastTimers.current.get(r));
        toastTimers.current.set(r, setTimeout((): void => setToasts((list: PickupToast[]): PickupToast[] => list.filter((t: PickupToast): boolean => t.resource !== r)), TOAST_MS));
      }
    }
  };

  return { toasts, bump };
}
