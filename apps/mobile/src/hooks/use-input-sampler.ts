// Packages
import React, {
  useEffect,
  useRef,
} from 'react';

// Local Imports
import { INPUT_SEND_INTERVAL } from '@halloween/ui/config/network';

/**
 * Samples the joystick on a fixed interval and sends it only when it
 * changed, so a busy finger can't flood the socket. Resets to centered when
 * the held TV controller changes.
 *
 * @param onInput - Sends a joystick vector.
 * @param padId - The held TV controller's id, if any.
 * @returns The latest vector, for the joystick to write.
 */
export function useInputSampler(onInput: (
  x: number,
  y: number,
) => void, padId: string | undefined): React.RefObject<{ x: number; y: number }> {
  useEffect(
    () => {
      latest.current = {
        x: 0,
        y: 0,
      };
    },
    [padId],
  );
  const latest = useRef({
    x: 0,
    y: 0,
  });
  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;

  useEffect(
    () => {
      let sent = {
        x: 0,
        y: 0,
      };
      const id = setInterval(
        (): void => {
          const v = latest.current;
          if (v.x !== sent.x || v.y !== sent.y) {
            onInputRef.current(
              v.x,
              v.y,
            );
            sent = v;
          }
        },
        INPUT_SEND_INTERVAL,
      );
      return () => clearInterval(id);
    },
    [],
  );

  return latest;
}
