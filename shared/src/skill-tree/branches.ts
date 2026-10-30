// Types
import type { Branch } from './types/skill-tree';

/**
 * The tree's branches, in the order the phone shows them, with their names.
 */
export const BRANCHES: { id: Branch; label: string }[] = [
  { id: 'weapons', label: 'Weapons' },
  { id: 'armor', label: 'Armor' },
  { id: 'light', label: 'Light' },
  { id: 'fortifications', label: 'Fortifications' },
  { id: 'tables', label: 'Tables' },
  { id: 'processing', label: 'Processing' },
  { id: 'occult', label: 'Occult' },
];
