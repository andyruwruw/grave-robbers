// Packages
import {
  Gamepad2,
  LayoutDashboard,
  Music,
} from 'lucide-react';

// Types
import type { ControlTabInfo } from '../types/control-panel';

/**
 * The control panel's tabs, in order.
 */
export const TABS: ControlTabInfo[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'music', label: 'Music', icon: Music },
  { key: 'game', label: 'Game', icon: Gamepad2 },
];
