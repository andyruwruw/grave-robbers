// Packages
import React, { useState } from 'react';
import { Ghost } from 'lucide-react';
import { MAX_NAME_LENGTH, PLAYER_COLORS } from '@halloween/shared/players/roster';
import Button from '@halloween/ui/components/ui/controls/button';
import TextField from '@halloween/ui/components/ui/controls/text-field';
import Card from '@halloween/ui/components/ui/primitives/card';
import {
  Body,
  PageTitle,
} from '@halloween/ui/components/typography/typography';
import { PROFILE_STORAGE_KEY } from '@halloween/ui/config/storage-keys';
import {
  readStorage,
  writeStorage,
} from '@halloween/ui/helpers/storage';

/**
 * Props for the JoinForm component.
 */
interface JoinFormProps {
  /**
   * Server-side rejection message, if the last attempt failed.
   */
  error: string | null;

  /**
   * Whether a join request is in flight.
   */
  joining: boolean;

  /**
   * Called with the trimmed name and chosen color.
   */
  onJoin: (name: string, color: string) => void;

  /**
   * The line under the title.
   */
  blurb?: string;

  /**
   * Name filled in when none is saved yet.
   */
  defaultName?: string;
}

/**
 * Last-used name and color, so returning players just tap the button.
 * @returns The saved name and color, or a blank name and a random color.
 */
function loadProfile(): { name: string; color: string } {
  try {
    const saved = JSON.parse(readStorage(PROFILE_STORAGE_KEY) ?? '{}');
    return {
      name: typeof saved.name === 'string' ? saved.name : '',
      color: PLAYER_COLORS.includes(saved.color) ? saved.color : PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
    };
  } catch {
    return { name: '', color: PLAYER_COLORS[0] };
  }
}

/**
 * Name + color picker shown before a phone has a player.
 *
 * @param {JoinFormProps} props - Component props.
 * @returns {React.JSX.Element} The rendered form.
 */
function JoinForm({
  error,
  joining,
  onJoin,
  blurb = 'Your phone is your controller. Pick a name and a color.',
  defaultName = '',
}: JoinFormProps): React.JSX.Element {
  const [profile] = useState(loadProfile);
  const [name, setName] = useState(profile.name || defaultName);
  const [color, setColor] = useState(profile.color);

  /**
   * Joins with the trimmed name and chosen color, and remembers them.
   * @param e The form submit event.
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    writeStorage(PROFILE_STORAGE_KEY, JSON.stringify({ name: trimmed, color }));
    onJoin(trimmed, color);
  };

  return (
    <Card className='p-xl'>
      <form
        className='flex flex-col gap-lg'
        onSubmit={handleSubmit}>
        <div>
          <PageTitle className='font-medium text-2xl leading-relaxed'>
            Enter the graveyard
          </PageTitle>
          <Body className='text-foreground-muted'>
            {blurb}
          </Body>
        </div>
        <TextField
          label='Name'
          value={name}
          placeholder='Spooky Steve'
          onChange={(v: string): void => setName(v.slice(0, MAX_NAME_LENGTH))}
          errorMessage={error ?? undefined} />
        <div className='flex flex-col gap-xsm'>
          <span className='text-xs font-medium text-foreground-muted'>Color</span>
          <div className='grid grid-cols-8 gap-xsm'>
            {PLAYER_COLORS.map((c: string): React.JSX.Element => (
              <button
                key={c}
                type='button'
                aria-label={`Color ${c}`}
                aria-pressed={c === color}
                className='aspect-square rounded-sm border-2 border-transparent aria-pressed:border-foreground aria-pressed:scale-110 transition-transform'
                style={{ backgroundColor: c }}
                onClick={(): void => setColor(c)} />
            ))}
          </div>
        </div>
        <Button
          type='submit'
          size='lg'
          block
          loading={joining}
          disabled={!name.trim()}
          prependInner={<Ghost size={16} />}>
          Rise from the grave
        </Button>
      </form>
    </Card>
  );
}

export default JoinForm;
