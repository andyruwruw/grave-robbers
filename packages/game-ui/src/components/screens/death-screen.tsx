// Packages
import React, {
  useEffect,
  useState,
} from 'react';
import { Skull } from 'lucide-react';

// Local Imports
import { formatDuration } from '../../helpers/format';

// Types
import type { DeathInfo } from '@halloween/shared/protocol/state/vitals';

/**
 * Props for the DeathScreen component.
 */
interface DeathScreenProps {
  /**
   * Who did it and how long the character lived.
   */
  death: DeathInfo;

  /**
   * Wall-clock ms when the player rises again.
   */
  respawnAt: number;

  /**
   * Darkens the screen only a quarter of the way, so the world behind
   * (and whatever did it) stays visible (/play, where the view is behind).
   */
  seeThrough?: boolean;
}

/**
 * Full-screen overlay while dead: the killer, time survived, and a
 * countdown to respawn. `seeThrough` keeps the world visible behind it.
 *
 * @param {DeathScreenProps} props - Component props.
 * @returns {React.JSX.Element} The rendered overlay.
 */
function DeathScreen({
  death,
  respawnAt,
  seeThrough = false,
}: DeathScreenProps): React.JSX.Element {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval((): void => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, Math.ceil((respawnAt - now) / 1000));

  return (
    <div className={`fixed inset-0 z-10 flex flex-col items-center justify-center gap-lg p-xl text-center ${seeThrough ? '' : 'bg-background'}`}>
      {seeThrough && <div className='absolute inset-0 -z-10 bg-background opacity-25' />}
      <Skull
        size={40}
        className='text-danger' />
      <h2 className='font-medium text-3xl text-danger'>You died</h2>
      <div className='flex flex-col gap-sm font-medium text-sm leading-relaxed text-foreground'>
        <span>Killed by {death.killer}</span>
        <span className='text-foreground-muted'>Survived {formatDuration(death.survived)}</span>
      </div>
      <span className='font-medium text-base text-foreground-subtle'>{remaining > 0 ? `Rising in ${remaining}` : 'Rising...'}</span>
    </div>
  );
}

export default DeathScreen;
