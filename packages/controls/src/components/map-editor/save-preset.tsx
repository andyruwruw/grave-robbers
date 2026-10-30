// Packages
import React from 'react';
import { Save } from 'lucide-react';

/**
 * Props for the SavePreset component.
 */
interface SavePresetProps {
  /**
   * The name typed so far.
   */
  name: string;

  /**
   * The name last saved under, or null.
   */
  saved: string | null;

  /**
   * Called as the name is typed.
   */
  onName: (name: string) => void;

  /**
   * Saves under the trimmed name.
   */
  onSave: () => void;
}

/**
 * Saving the map as a preset: the name, Save, and a note saying what
 * happened (or how saving works).
 *
 * @param {SavePresetProps} props - Component props.
 * @returns {React.JSX.Element} The rendered controls.
 */
function SavePreset({
  name,
  saved,
  onName,
  onSave,
}: SavePresetProps): React.JSX.Element {
  return (
    <div className='mt-auto flex flex-col gap-xsm border-t border-border pt-sm'>
      <div className='flex gap-xsm'>
        <input
          value={name}
          placeholder='Save as map...'
          maxLength={40}
          className='h-7 min-w-0 flex-1 rounded-md border border-border bg-background px-sm text-xs text-foreground placeholder:text-foreground-subtle'
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onName(e.target.value)} />
        <button
          type='button'
          disabled={!name.trim()}
          className='flex h-7 items-center gap-xsm rounded-md border border-border bg-muted px-sm text-xs text-foreground hover:bg-background disabled:opacity-50'
          onClick={onSave}>
          <Save size={13} />
          Save
        </button>
      </div>
      <span className='text-[11px] leading-snug text-foreground-subtle'>
        {saved ? `Saved as "${saved}". Pick it in the Game tab's map list for new worlds.` : 'Edits change the live world. Saving under an existing name replaces that map. Esc closes.'}
      </span>
    </div>
  );
}

export default SavePreset;
