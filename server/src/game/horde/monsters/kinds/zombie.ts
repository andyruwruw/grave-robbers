// Local Imports
import { Shambler } from '../shambler';

// Types
import type { Target } from '../../types/hooks';

/**
 * The basic shambler: everything it does is the family's.
 */
export class Zombie<P extends Target> extends Shambler<P> {}
