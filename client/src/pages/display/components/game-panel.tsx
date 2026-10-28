// Packages
import React, { useState } from 'react';
import {
  Bone,
  Bot,
  Box,
  ChevronDown,
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
  Minus,
  Moon,
  Mountain,
  PawPrint,
  Pencil,
  Plus,
  Skull,
  Sprout,
  Sun,
  Swords,
  TreePine,
  Unlock,
} from 'lucide-react';

import { WORLD_LEVEL_BOOST_MAX, WORLD_LEVEL_BOOST_STEP } from '@halloween/shared/levels';
import { cleanMapGen } from '@halloween/shared/map-gen';

// Local Imports
import Card from '../../../components/ui/primitives/card';
import { MAP_GEN_STORAGE_KEY } from '../../../config';
import { readStorage, writeStorage } from '../../../helpers/storage';
import MapGenPanel from './map-gen-panel';
import { PANEL_BUTTON } from './panel-button';
import ResetWorldButton from './reset-world-button';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen';
import type { GameSettings, SpawnKind } from '@halloween/shared/protocol';
import type { LucideIcon } from 'lucide-react';

const SWITCHES: { key: Exclude<keyof GameSettings, 'daytime' | 'levelBoost'>; label: string; hint: string; icon: LucideIcon }[] = [
  { key: 'aggressive', label: 'Aggressive monsters', hint: 'Off: zombies and vampires only wander', icon: Swords },
  { key: 'allUnlocks', label: 'All unlocks', hint: 'Every recipe and skill tree node is open to everyone', icon: Unlock },
  { key: 'freeCrafting', label: 'Free crafting', hint: 'Crafting costs nothing', icon: Hammer },
  { key: 'spawning', label: 'Natural spawning', hint: 'Off: no monsters walk in, no blood moons, nothing grows back; only what you spawn', icon: Sprout },
  { key: 'testPlayer', label: 'Test player', hint: 'A bot that gathers, builds, and fights', icon: Bot },
  { key: 'lightsOff', label: 'Lights off', hint: 'Puts out every light on the map', icon: LightbulbOff },
  { key: 'tvDrag', label: 'Mouse picks up', hint: 'Drag players and monsters around the TV with the mouse', icon: Hand },
  { key: 'tvLight', label: 'Mouse light', hint: 'Hold the right mouse button on the TV to carry a light', icon: Lightbulb },
];

const SPAWNS: { kind: SpawnKind; label: string; icon: LucideIcon }[] = [
  { kind: 'tree', label: 'Tree', icon: TreePine },
  { kind: 'pumpkin', label: 'Pumpkin', icon: Citrus },
  { kind: 'chest', label: 'Chest', icon: Box },
  { kind: 'rock', label: 'Rock', icon: Mountain },
  { kind: 'loot', label: 'Loot', icon: Gem },
  { kind: 'zombie', label: 'Zombie', icon: Skull },
  { kind: 'vampire', label: 'Vampire', icon: Droplet },
  { kind: 'ghost', label: 'Ghost', icon: Ghost },
  { kind: 'brute', label: 'Brute', icon: Dumbbell },
  { kind: 'skeleton', label: 'Skeleton', icon: Bone },
  { kind: 'witch', label: 'Witch', icon: FlaskConical },
  { kind: 'ghoul', label: 'Ghoul', icon: PawPrint },
  { kind: 'demon', label: 'Demon', icon: Flame },
];

/**
 * Props for the GamePanel component.
 */
interface GamePanelProps {
  /**
   * The server's current switches.
   */
  settings: GameSettings;

  /**
   * Whether a blood moon is up right now.
   */
  bloodMoon: boolean;

  /**
   * The hidden world level right now.
   */
  worldLevel: number;
  onChange: (settings: Partial<GameSettings>) => void;
  onSpawn: (kind: SpawnKind) => void;
  onBloodMoon: () => void;

  /**
   * Kills every monster on the map.
   */
  onKillMonsters: () => void;

  /**
   * Opens the map editor on the TV (absent on the admin page).
   */
  onEditMap?: () => void;

  /**
   * Saved map layouts a new world can start from.
   */
  presets: { id: string; name: string }[];

  /**
   * Starts a new world on a preset's map, or a random one (null) shaped by
   * `gen`.
   */
  onReset: (preset: string | null, gen: MapGenSettings) => void;
}

/**
 * The sidebar's Game tab, testing controls: switch monster aggression,
 * the test player, the lights, and what the TV's mouse can do (pick up
 * players and monsters, carry a light), boost the world level, spawn
 * things or monsters anywhere,
 * and at the bottom summon a blood moon, switch to daytime and back, kill
 * every monster, and start a new world on a saved map (the first preset by
 * default) or a random one, whose mountains, pits, stairs, landmarks, and
 * scenery can be set first.
 *
 * @param {GamePanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function GamePanel({
  settings,
  bloodMoon,
  worldLevel,
  onChange,
  onSpawn,
  onBloodMoon,
  onKillMonsters,
  onEditMap,
  presets,
  onReset,
}: GamePanelProps): React.JSX.Element {
  const [map, setMap] = useState<string>('');
  const chosen = map || presets[0]?.id || 'random';
  const [gen, setGen] = useState<MapGenSettings>((): MapGenSettings => {
    try {
      return cleanMapGen(JSON.parse(readStorage(MAP_GEN_STORAGE_KEY) ?? '{}'));
    } catch {
      return cleanMapGen(null);
    }
  });
  const changeGen = (next: MapGenSettings): void => {
    setGen(next);
    writeStorage(MAP_GEN_STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div className='flex flex-col gap-lg'>
      <Card className='flex flex-col'>
        <div className='flex flex-col gap-lg px-lg py-md'>
          <div className='flex flex-col gap-xsm'>
            {SWITCHES.map(({ key, label, hint, icon: Icon }) => (
              <button
                key={key}
                type='button'
                role='switch'
                aria-checked={settings[key]}
                title={hint}
                className='flex items-center gap-sm rounded-md px-sm py-xsm text-left text-sm text-foreground hover:bg-muted'
                onClick={(): void => onChange({ [key]: !settings[key] })}>
                <Icon
                  size={14}
                  className='text-foreground-muted' />
                <span className='flex-1'>{label}</span>
                <span className={`flex h-5 w-9 shrink-0 items-center rounded-full border p-[2px] transition-colors ${settings[key] ? 'border-brand bg-brand' : 'border-border bg-background'}`}>
                  <span className={`h-3.5 w-3.5 rounded-full transition-transform ${settings[key] ? 'translate-x-4 bg-foreground' : 'bg-foreground-muted'}`} />
                </span>
              </button>
            ))}
          </div>

          <div className='flex flex-col gap-xsm'>
            <div className='flex items-center gap-sm px-sm text-sm text-foreground'>
              <span className='flex-1'>
                World level
                <span className='ml-xsm text-foreground-subtle'>{worldLevel.toFixed(1)}</span>
              </span>
              <button
                type='button'
                aria-label='Lower the world level boost'
                disabled={settings.levelBoost <= 0}
                className='flex h-7 w-7 items-center justify-center rounded-md border border-[var(--arw-glass-edge)] bg-muted text-foreground transition-colors hover:bg-background disabled:opacity-40'
                onClick={(): void => onChange({ levelBoost: Math.max(0, settings.levelBoost - WORLD_LEVEL_BOOST_STEP) })}>
                <Minus size={14} />
              </button>
              <span className='w-9 text-center text-xs text-foreground-muted'>+{settings.levelBoost}</span>
              <button
                type='button'
                aria-label='Raise the world level boost'
                disabled={settings.levelBoost >= WORLD_LEVEL_BOOST_MAX}
                className='flex h-7 w-7 items-center justify-center rounded-md border border-[var(--arw-glass-edge)] bg-muted text-foreground transition-colors hover:bg-background disabled:opacity-40'
                onClick={(): void => onChange({ levelBoost: Math.min(WORLD_LEVEL_BOOST_MAX, settings.levelBoost + WORLD_LEVEL_BOOST_STEP) })}>
                <Plus size={14} />
              </button>
            </div>
            <span className='px-sm text-[11px] leading-snug text-foreground-subtle'>Levels added on top of what the players call for: more, tougher, better armed monsters.</span>
          </div>

          <div className='flex flex-col gap-sm'>
            <span className='text-xs text-foreground-subtle'>Spawn anywhere on the map</span>
            <div className='grid grid-cols-4 gap-xsm'>
              {SPAWNS.map(({ kind, label, icon: Icon }) => (
                <button
                  key={kind}
                  type='button'
                  className='flex flex-col items-center gap-xsm rounded-md border border-[var(--arw-glass-edge)] bg-muted py-sm text-xs text-foreground transition-colors hover:bg-background'
                  onClick={(): void => onSpawn(kind)}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className='flex flex-col gap-sm'>
        <button
          type='button'
          disabled={bloodMoon}
          className={PANEL_BUTTON}
          onClick={onBloodMoon}>
          <Moon
            size={14}
            fill='currentColor'
            className='text-danger' />
          {bloodMoon ? 'Blood moon rising' : 'Summon blood moon'}
        </button>
        <button
          type='button'
          aria-pressed={settings.daytime}
          className={PANEL_BUTTON}
          onClick={(): void => onChange({ daytime: !settings.daytime })}>
          {settings.daytime ? (
            <Moon size={14} />
          ) : (
            <Sun
              size={14}
              className='text-status-warning-foreground' />
          )}
          {settings.daytime ? 'Back to night' : 'Make it day'}
        </button>
        <button
          type='button'
          className={PANEL_BUTTON}
          onClick={onKillMonsters}>
          <Skull size={14} />
          Kill all monsters
        </button>
        {onEditMap && (
          <button
            type='button'
            className={PANEL_BUTTON}
            onClick={onEditMap}>
            <Pencil size={14} />
            Edit map
          </button>
        )}
        <label className='relative flex'>
          <select
            value={chosen}
            aria-label='Map for the new world'
            className={`${PANEL_BUTTON} appearance-none pl-md pr-xl text-left`}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setMap(e.target.value)}>
            {presets.map(({ id, name }) => (
              <option
                key={id}
                value={id}>
                {`Map: ${name}`}
              </option>
            ))}
            <option value='random'>Map: Random</option>
          </select>
          <ChevronDown
            size={14}
            className='pointer-events-none absolute right-md top-1/2 -translate-y-1/2 text-foreground-muted' />
        </label>
        {chosen === 'random' && (
          <MapGenPanel
            settings={gen}
            onChange={changeGen} />
        )}
        <ResetWorldButton onReset={(): void => onReset(chosen === 'random' ? null : chosen, gen)} />
      </div>
    </div>
  );
}

export default GamePanel;
