// Packages
import {
  Bone,
  Bot,
  Box,
  Citrus,
  Droplet,
  Dumbbell,
  Flame,
  FlaskConical,
  Ghost,
  Gem,
  Hammer,
  Hand,
  Lightbulb,
  LightbulbOff,
  Mountain,
  PawPrint,
  Skull,
  Sprout,
  Swords,
  TreePine,
  Unlock,
} from 'lucide-react';

// Types
import type { GameSwitch, Spawn } from '../types/game-panel';

/**
 * The Game tab's on/off switches, in order.
 */
export const SWITCHES: GameSwitch[] = [
  { key: 'aggressive', label: 'Aggressive monsters', hint: 'Off: zombies and vampires only wander', icon: Swords, shortcut: 'A' },
  { key: 'allUnlocks', label: 'All unlocks', hint: 'Every recipe and skill tree node is open to everyone', icon: Unlock, shortcut: 'U' },
  { key: 'freeCrafting', label: 'Free crafting', hint: 'Crafting costs nothing', icon: Hammer, shortcut: 'F' },
  { key: 'spawning', label: 'Natural spawning', hint: 'Off: no monsters walk in, no blood moons, nothing grows back; only what you spawn', icon: Sprout },
  { key: 'testPlayer', label: 'Test player', hint: 'A bot that gathers, builds, and fights', icon: Bot, shortcut: 'T' },
  { key: 'lightsOff', label: 'Lights off', hint: 'Puts out every light on the map', icon: LightbulbOff, shortcut: 'L' },
  { key: 'tvDrag', label: 'Mouse picks up', hint: 'Drag players and monsters around the TV with the mouse', icon: Hand },
  { key: 'tvLight', label: 'Mouse light', hint: 'Hold the right mouse button on the TV to carry a light', icon: Lightbulb },
];

/**
 * The objects the Game tab can spawn.
 */
export const OBJECT_SPAWNS: Spawn[] = [
  { kind: 'tree', label: 'Tree', icon: TreePine },
  { kind: 'pumpkin', label: 'Pumpkin', icon: Citrus },
  { kind: 'chest', label: 'Chest', icon: Box },
  { kind: 'rock', label: 'Rock', icon: Mountain },
  { kind: 'loot', label: 'Loot', icon: Gem },
];

/**
 * The monsters the Game tab can spawn.
 */
export const MONSTER_SPAWNS: Spawn[] = [
  { kind: 'zombie', label: 'Zombie', icon: Skull },
  { kind: 'vampire', label: 'Vampire', icon: Droplet },
  { kind: 'ghost', label: 'Ghost', icon: Ghost },
  { kind: 'brute', label: 'Brute', icon: Dumbbell },
  { kind: 'skeleton', label: 'Skeleton', icon: Bone },
  { kind: 'witch', label: 'Witch', icon: FlaskConical },
  { kind: 'ghoul', label: 'Ghoul', icon: PawPrint },
  { kind: 'demon', label: 'Demon', icon: Flame },
];
