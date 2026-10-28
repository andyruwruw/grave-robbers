// Packages
import React, {
  useEffect,
  useState,
} from 'react';
import { Skull } from 'lucide-react';

// Types
import type { DeathInfo } from '@halloween/shared/protocol';

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
}

/**
 * Formats seconds as m:ss.
 */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Full-screen overlay while dead: the killer, time survived, and a
 * countdown to respawn.
 *
 * @param {DeathScreenProps} props - Component props.
 * @returns {React.JSX.Element} The rendered overlay.
 */
function DeathScreen({
  death,
  respawnAt,
}: DeathScreenProps): React.JSX.Element {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval((): void => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, Math.ceil((respawnAt - now) / 1000));

  return (
    <div className='fixed inset-0 z-10 flex flex-col items-center justify-center gap-lg bg-background p-xl text-center'>
      <Skull
        size={40}
        className='text-danger' />
      <h2 className='font-pixel text-xl text-danger'>You died</h2>
      <div className='flex flex-col gap-sm font-pixel text-[10px] leading-relaxed text-foreground'>
        <span>Killed by {death.killer}</span>
        <span className='text-foreground-muted'>Survived {formatDuration(death.survived)}</span>
      </div>
      <span className='font-pixel text-xs text-foreground-subtle'>{remaining > 0 ? `Rising in ${remaining}` : 'Rising...'}</span>
    </div>
  );
}

export default DeathScreen;
