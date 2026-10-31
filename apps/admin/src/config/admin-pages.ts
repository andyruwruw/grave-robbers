// Packages
import {
  BookOpen,
  Gamepad2,
  Globe,
  LayoutGrid,
  Map,
  Network,
  Skull,
  Users,
} from 'lucide-react';

// Types
import type { AdminPageInfo } from '../types/admin-pages';

/**
 * The main menu's buttons, in order.
 */
export const ADMIN_PAGES: AdminPageInfo[] = [
  { id: 'players', label: 'Players', icon: Users },
  { id: 'gameplay', label: 'Gameplay', icon: Gamepad2 },
  { id: 'spawn', label: 'Spawn', icon: Skull },
  { id: 'catalogue', label: 'Item Catalogue', icon: BookOpen, wide: true },
  { id: 'tree', label: 'Knowledge Tree', icon: Network, wide: true },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'worlds', label: 'Worlds', icon: Globe },
];

/**
 * The main menu's title.
 */
export const MENU_TITLE = 'Admin Controls';

/**
 * The main menu's icon, in its header.
 */
export const MENU_ICON = LayoutGrid;
