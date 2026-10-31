// Packages
import {
  Bot,
  Cpu,
  Hammer,
  Hand,
  Lightbulb,
  LightbulbOff,
  Sprout,
  Swords,
  Unlock,
} from 'lucide-react';
import { GEAR, GEAR_KINDS } from '@halloween/shared/gear/gear-catalog';
import { MONSTER_KINDS } from '@halloween/shared/monsters/monster-kinds';
import { STRUCTURES, STRUCTURE_KINDS } from '@halloween/shared/structures/structure-catalog';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { GameSwitch, Spawn } from '../types/game-panel';

/**
 * The Game tab's on/off switches, in order.
 */
export const SWITCHES: GameSwitch[] = [
  { key: 'aggressive', label: 'Aggressive monsters', hint: 'Off: zombies and vampires only wander', icon: Swords, shortcut: 'A' },
  { key: 'allUnlocks', label: 'All unlocks', hint: 'Every recipe and skill tree node is open to everyone', icon: Unlock, shortcut: 'U' },
  { key: 'freeCrafting', label: 'Free crafting', hint: 'Crafting and infusing cost nothing and need no anvil', icon: Hammer, shortcut: 'F' },
  { key: 'spawning', label: 'Natural spawning', hint: 'Off: no monsters walk in, no blood moons, nothing grows back; only what you spawn', icon: Sprout },
  { key: 'testPlayer', label: 'Test player', hint: 'A bot that gathers, builds, and fights', icon: Bot, shortcut: 'T' },
  { key: 'lightsOff', label: 'Lights off', hint: 'Puts out every light on the map', icon: LightbulbOff, shortcut: 'L' },
  { key: 'tvDrag', label: 'Mouse picks up', hint: 'Drag players and monsters around the TV with the mouse', icon: Hand },
  { key: 'tvLight', label: 'Mouse light', hint: 'Hold the right mouse button on the TV to carry a light', icon: Lightbulb },
  { key: 'threads', label: 'Background threads', hint: 'Huge worlds generate on their own thread, so the game keeps playing meanwhile', icon: Cpu },
];

/**
 * The objects the Game tab can spawn (the loot is a random piece of gear).
 */
export const OBJECT_SPAWNS: Spawn[] = [
  { kind: 'tree', label: 'Tree', icon: 'tile:tree' },
  { kind: 'pumpkin', label: 'Pumpkin', icon: 'tile:pumpkin' },
  { kind: 'chest', label: 'Chest', icon: 'tile:chest' },
  { kind: 'rock', label: 'Rock', icon: 'tile:rock' },
  { kind: 'loot', label: 'Loot', icon: 'ui:bag' },
];

/**
 * The monsters the Game tab can spawn.
 */
export const MONSTER_SPAWNS: Spawn[] = MONSTER_KINDS.map((kind: MonsterKind): Spawn => ({ kind, label: kind[0].toUpperCase() + kind.slice(1), icon: `monster:${kind}` }));

/**
 * Every piece of gear the Game tab can drop on the ground (not infused-only
 * gear, which is only made by infusing).
 */
export const GEAR_SPAWNS: Spawn[] = GEAR_KINDS.filter((kind: GearKind): boolean => !GEAR[kind].infused).map((kind: GearKind): Spawn => ({ kind: `gear:${kind}`, label: GEAR[kind].label, icon: `gear:${kind}` }));

/**
 * Every structure the Game tab can build (at level 0, by no one).
 */
export const BUILD_SPAWNS: Spawn[] = STRUCTURE_KINDS.map((kind: StructureKind): Spawn => ({ kind: `build:${kind}`, label: STRUCTURES[kind].label, icon: `build:${kind}` }));
