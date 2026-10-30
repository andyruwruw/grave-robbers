// Packages
import { useRef, useState } from 'react';

/**
 * What `useFlashMessage` hands back.
 */
interface FlashMessage {
  /**
   * The message showing now, or null.
   */
  message: string | null;

  /**
   * Shows a message, restarting its timer.
   */
  flash: (msg: string) => void;
}

/**
 * A message that clears itself `ms` after it was last shown.
 *
 * @param ms - How long it stays up.
 * @returns The message and a way to show one.
 */
export function useFlashMessage(ms: number): FlashMessage {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /**
   * Shows a message and clears it once `ms` has passed.
   *
   * @param msg - The message.
   */
  const flash = (msg: string): void => {
    setMessage(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout((): void => setMessage(null), ms);
  };

  return { message, flash };
}
