// Packages
import React from 'react';

/**
 * Props for the UseMeter component.
 */
interface UseMeterProps {
  /**
   * What's counted, on the left.
   */
  label: string;

  /**
   * A note on the right.
   */
  detail: string;

  /**
   * Slots filled (a station's batches), or null to show no slots.
   */
  filled: number | null;

  /**
   * Slots in all.
   */
  slots: number;

  /**
   * How far the current job is, 0 to 1.
   */
  progress: number;
}

/**
 * A count with its slots as pips, over a bar for the job under way (a
 * station's batch, a digger's next dig).
 *
 * @param {UseMeterProps} props - Component props.
 * @returns {React.JSX.Element} The rendered meter.
 */
function UseMeter({ label, detail, filled, slots, progress }: UseMeterProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-xsm'>
      <div className='flex items-center justify-between gap-sm text-[13px]'>
        <span className='font-medium text-foreground'>{label}</span>
        <span className='text-foreground-muted'>{detail}</span>
      </div>
      {filled !== null && (
        <div className='flex gap-1'>
          {Array.from({ length: slots }, (_: unknown, i: number) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-[2px] ${i < filled ? 'bg-brand' : 'bg-muted'}`} />
          ))}
        </div>
      )}
      <div className='h-1.5 overflow-hidden rounded-[2px] bg-muted'>
        <div
          className='h-full bg-foreground-muted transition-[width] duration-500 ease-linear'
          style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}

export default UseMeter;
