// Packages
import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUp,
  Eraser,
  Paintbrush,
  PanelLeftClose,
  PanelLeftOpen,
  Pipette,
  Save,
  Trees,
  X,
} from 'lucide-react';
import { BLEND_KEYS, BLEND_LABELS } from '@halloween/shared/blend';
import {
  EDIT_PALETTE,
  EDIT_SCATTER,
  EDIT_SIZE_MAX,
  EDIT_SIZE_MIN,
} from '@halloween/shared/map-edit';

// Types
import type { BlendKey } from '@halloween/shared/blend';
import type { Tile } from '@halloween/shared/world';
import type { LucideIcon } from 'lucide-react';
import type { EditTool, EditorState } from '../use-map-editor';

const VIEW: { key: 'flat' | 'hideMonsters' | 'topView'; label: string }[] = [
  { key: 'topView', label: 'Top-down view' },
  { key: 'flat', label: 'Flat lighting' },
  { key: 'hideMonsters', label: 'Hide monsters' },
];

const TOOLS: { tool: EditTool; label: string; icon: LucideIcon; hint: string }[] = [
  { tool: 'raise', label: 'Raise', icon: ArrowUp, hint: 'Click or drag: tiles at the level you start on go up one (others stay). Scroll to reach tiles hidden behind higher ground. Trees and buildings are hidden meanwhile' },
  { tool: 'lower', label: 'Lower', icon: ArrowDown, hint: 'Click or drag: tiles at the level you start on go down one (others stay). Scroll to reach tiles hidden behind higher ground. Trees and buildings are hidden meanwhile' },
  { tool: 'stairs', label: 'Stairs', icon: ChevronsUp, hint: 'The yellow flight shows the stairs you would place: point at the foot of a rise, or at the top of a wall to put them at its foot. Right click cycles the ways that work, left click places it. On stairs already there, left click deletes them and right click turns them. Scroll to reach tiles hidden behind higher ground' },
  { tool: 'paint', label: 'Paint', icon: Paintbrush, hint: 'Drag to paint the picked tile, grave, light, landmark, or structure; Fill below 100% scatters it (good for trees and graves)' },
  { tool: 'mix', label: 'Mix', icon: Trees, hint: 'Drag to spread the shares below evenly over grass and scenery (paths, paving, stairs, and buildings stay). Painting the same mix again changes nothing; graves skip spots at the edge of a drop or the foot of a rise' },
  { tool: 'pick', label: 'Pick', icon: Pipette, hint: 'Click an area to copy its mix into the Mix brush: the mix it was painted with, or else what grows there now' },
  { tool: 'erase', label: 'Erase', icon: Eraser, hint: 'Drag to clear back to grass: structures come down and anything lying on the ground goes' },
];

/**
 * Props for the MapEditor component.
 */
interface MapEditorProps {
  state: EditorState;
  onChange: (state: EditorState) => void;

  /**
   * Saves the map as it is now as a preset under this name.
   */
  onSave: (name: string) => void;
  onClose: () => void;
}

/**
 * The TV's map editor panel, down the left edge of the screen while editing:
 * a flat-lighting and hide-monsters view, tools (raise, lower, stairs,
 * paint, mix, pick, erase), brush size, how much of the brush paint fills,
 * the Mix brush's shares, the
 * palette of tiles to paint, and saving the map as a preset (an existing name is
 * replaced). Edits change the live world straight away.
 *
 * @param {MapEditorProps} props - Component props.
 * @returns {React.JSX.Element} The rendered toolbar.
 */
function MapEditor({
  state,
  onChange,
  onSave,
  onClose,
}: MapEditorProps): React.JSX.Element {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const hint = TOOLS.find((t) => t.tool === state.tool)?.hint ?? '';

  if (hidden) {
    return (
      <button
        type='button'
        className='absolute left-sm top-sm flex items-center gap-xsm rounded-lg border border-[var(--arw-glass-edge)] bg-[var(--arw-glass-pane)] px-md py-sm text-sm font-medium text-foreground backdrop-blur-md hover:bg-muted'
        onClick={(): void => setHidden(false)}>
        <PanelLeftOpen size={15} />
        Map editor
      </button>
    );
  }

  return (
    <div className='absolute inset-y-sm left-sm flex w-64 flex-col gap-sm rounded-lg border border-[var(--arw-glass-edge)] bg-[var(--arw-glass-pane)] p-md backdrop-blur-md'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-foreground'>Map editor</span>
        <div className='flex items-center'>
          <button
            type='button'
            aria-label='Hide the map editor panel'
            title='Hide the panel (keep editing)'
            className='flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground'
            onClick={(): void => setHidden(true)}>
            <PanelLeftClose size={15} />
          </button>
          <button
            type='button'
            aria-label='Close the map editor'
            className='flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground'
            onClick={onClose}>
            <X size={15} />
          </button>
        </div>
      </div>
      <div className='flex flex-col gap-xsm'>
        {VIEW.map(({ key, label }) => (
          <button
            key={key}
            type='button'
            role='switch'
            aria-checked={state[key]}
            className='flex items-center gap-sm rounded-md px-xsm py-0.5 text-left text-xs text-foreground hover:bg-muted'
            onClick={(): void => onChange({ ...state, [key]: !state[key] })}>
            <span className='flex-1'>{label}</span>
            <span className={`flex h-5 w-9 shrink-0 items-center rounded-full border p-[2px] transition-colors ${state[key] ? 'border-brand bg-brand' : 'border-border bg-background'}`}>
              <span className={`h-3.5 w-3.5 rounded-full transition-transform ${state[key] ? 'translate-x-4 bg-foreground' : 'bg-foreground-muted'}`} />
            </span>
          </button>
        ))}
      </div>
      <div className='grid grid-cols-3 gap-xsm'>
        {TOOLS.map(({ tool, label, icon: Icon }) => (
          <button
            key={tool}
            type='button'
            aria-pressed={state.tool === tool}
            className={`flex flex-col items-center gap-0.5 rounded-md border px-xsm py-xsm text-[11px] transition-colors ${state.tool === tool ? 'border-brand bg-brand-muted text-foreground' : 'border-[var(--arw-glass-edge)] bg-muted text-foreground-muted hover:text-foreground'}`}
            onClick={(): void => onChange({ ...state, tool })}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
      {state.tool !== 'stairs' && (
        <label className='flex flex-col gap-xsm'>
          <span className='flex justify-between text-xs text-foreground'>
            Brush
            <span className='text-foreground-subtle'>{state.size === 1 ? '1 tile' : `${state.size} tiles across`}</span>
          </span>
          <input
            type='range'
            min={EDIT_SIZE_MIN}
            max={EDIT_SIZE_MAX}
            step={1}
            value={state.size}
            className='w-full accent-brand'
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...state, size: Number(e.target.value) })} />
        </label>
      )}
      {state.tool === 'paint' && (
        <div className='flex items-center gap-xsm'>
          <span className='text-[11px] text-foreground-subtle'>Fill</span>
          {EDIT_SCATTER.map((share: number) => (
            <button
              key={share}
              type='button'
              aria-pressed={state.scatter === share}
              className={`h-7 rounded-md border px-sm text-xs ${state.scatter === share ? 'border-brand bg-brand-muted text-foreground' : 'border-[var(--arw-glass-edge)] bg-muted text-foreground-muted hover:text-foreground'}`}
              onClick={(): void => onChange({ ...state, scatter: share })}>
              {share === 1 ? 'All' : `${Math.round(share * 100)}%`}
            </button>
          ))}
        </div>
      )}
      {state.tool === 'mix' && (
        <div className='flex flex-col gap-xsm'>
          {BLEND_KEYS.map((key: BlendKey) => {
            const value = state.blend[key] ?? 0;
            const others = BLEND_KEYS.reduce((sum: number, k: BlendKey): number => sum + (k === key ? 0 : state.blend[k] ?? 0), 0);
            return (
              <label
                key={key}
                className='flex items-center gap-sm text-xs text-foreground'>
                <span className='w-20 shrink-0'>{BLEND_LABELS[key]}</span>
                <input
                  type='range'
                  min={0}
                  max={100}
                  step={1}
                  value={value}
                  className='min-w-0 flex-1 accent-brand'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...state, blend: { ...state.blend, [key]: Math.min(Number(e.target.value), 100 - others) } })} />
                <span className='w-9 shrink-0 text-right text-foreground-subtle'>{value}%</span>
              </label>
            );
          })}
          <span className='flex justify-between text-[11px] text-foreground-subtle'>
            Bare ground
            <span>{100 - BLEND_KEYS.reduce((sum: number, k: BlendKey): number => sum + (state.blend[k] ?? 0), 0)}%</span>
          </span>
        </div>
      )}
      <span className='text-[11px] leading-snug text-foreground-subtle'>{hint}.</span>
      {state.tool === 'paint' && (
        <div className='scrollbar-thin flex min-h-0 flex-1 flex-col gap-sm overflow-y-auto pr-xsm'>
          {EDIT_PALETTE.map(({ group, tiles }) => (
            <div
              key={group}
              className='flex flex-col gap-xsm'>
              <span className='text-[10px] uppercase tracking-wide text-foreground-subtle'>{group}</span>
              <div className='flex flex-wrap gap-xsm'>
                {tiles.map(({ tile, label, mix }: { tile: Tile; label: string; mix?: Tile[] }) => (
                  <button
                    key={label}
                    type='button'
                    aria-pressed={state.label === label}
                    className={`rounded-sm border px-xsm py-0.5 text-[11px] ${state.tile === tile ? 'border-brand bg-brand-muted text-foreground' : 'border-transparent bg-muted text-foreground-muted hover:text-foreground'}`}
                    onClick={(): void => onChange({ ...state, label, tile, mix })}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className='mt-auto flex flex-col gap-xsm border-t border-[var(--arw-glass-edge)] pt-sm'>
        <div className='flex gap-xsm'>
          <input
            value={name}
            placeholder='Save as map...'
            maxLength={40}
            className='h-7 min-w-0 flex-1 rounded-md border border-[var(--arw-glass-edge)] bg-background px-sm text-xs text-foreground placeholder:text-foreground-subtle'
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setName(e.target.value);
              setSaved(null);
            }} />
          <button
            type='button'
            disabled={!name.trim()}
            className='flex h-7 items-center gap-xsm rounded-md border border-[var(--arw-glass-edge)] bg-muted px-sm text-xs text-foreground hover:bg-background disabled:opacity-50'
            onClick={(): void => {
              onSave(name.trim());
              setSaved(name.trim());
            }}>
            <Save size={13} />
            Save
          </button>
        </div>
        <span className='text-[11px] leading-snug text-foreground-subtle'>
          {saved ? `Saved as "${saved}". Pick it in the Game tab's map list for new worlds.` : 'Edits change the live world. Saving under an existing name replaces that map. Esc closes.'}
        </span>
      </div>
    </div>
  );
}

export default MapEditor;
