// Types
import type { PadPresses } from '../types/pads';
import type { Session } from '../types/session';

/**
 * A TV page: a display that's neither the admin page nor a /play view.
 * @param session The socket's session.
 * @returns Whether it's a TV page.
 */
export function isTv(session: Session): boolean {
  return session.role === 'display' && !session.admin && !session.viewer;
}

/**
 * Press counters for a pad nobody has pressed yet.
 * @returns Every counter at zero.
 */
export const emptyPresses = (): PadPresses => ({ use: 0, panic: 0, bag: 0, craft: 0, tree: 0, turnLeft: 0, turnRight: 0 });
