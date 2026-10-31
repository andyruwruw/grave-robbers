// Packages
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

// Local Imports
import { WORLD_NAME_MAX } from '../../config/worlds';

/**
 * Props for the NewWorldForm component.
 */
interface NewWorldFormProps {
  /**
   * Makes an empty slot under the trimmed name.
   */
  onCreate: (name: string) => void;
}

/**
 * Making a new world slot: its name (up to `WORLD_NAME_MAX`) and New
 * world. The slot stays empty until it's first played.
 *
 * @param {NewWorldFormProps} props - Component props.
 * @returns {React.JSX.Element} The rendered form.
 */
function NewWorldForm({ onCreate }: NewWorldFormProps): React.JSX.Element {
  const [name, setName] = useState('');

  /**
   * Makes the slot and clears the name.
   *
   * @param e The submit event.
   */
  const submit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onCreate(trimmed);
      setName('');
    }
  };

  return (
    <form
      className='flex flex-col gap-xsm border-t border-border px-lg py-sm'
      onSubmit={submit}>
      <div className='flex gap-xsm'>
        <input
          value={name}
          placeholder='World name...'
          maxLength={WORLD_NAME_MAX}
          className='h-7 min-w-0 flex-1 rounded-md border border-border bg-background px-sm text-xs text-foreground placeholder:text-foreground-subtle'
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setName(e.target.value)} />
        <button
          type='submit'
          disabled={!name.trim()}
          className='flex h-7 items-center gap-xsm rounded-md border border-border bg-muted px-sm text-xs text-foreground hover:bg-background disabled:opacity-50'>
          <Plus size={13} />
          New world
        </button>
      </div>
      <span className='text-[11px] leading-snug text-foreground-subtle'>Its map is made from the default preset the first time it is played.</span>
    </form>
  );
}

export default NewWorldForm;
