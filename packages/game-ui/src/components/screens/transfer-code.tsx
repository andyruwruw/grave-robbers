// Packages
import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

/**
 * Props for the TransferCode component.
 */
interface TransferCodeProps {
  /**
   * The last code the server gave, and when it stops working (ms since the
   * epoch), or null.
   */
  transfer: { code: string; until: number } | null;

  /**
   * Asks the server for a new code.
   */
  onRequest: () => void;

  /**
   * Classes for the request button (each app styles its own).
   */
  buttonClassName: string;
}

/**
 * Moving this character to another device: a button that asks for a
 * transfer code, and the code once it comes, to type with this name on the
 * other device's join form. A code works once, for ten minutes.
 *
 * @param {TransferCodeProps} props - Component props.
 * @returns {React.JSX.Element} The rendered section.
 */
function TransferCode({ transfer, onRequest, buttonClassName }: TransferCodeProps): React.JSX.Element {
  const live = transfer !== null && transfer.until > Date.now();
  return (
    <div className='flex flex-col gap-xsm'>
      {live ? (
        <>
          <span className='select-all text-center font-mono text-2xl tracking-[0.3em] text-foreground'>{transfer.code}</span>
          <span className='text-xs leading-relaxed text-foreground-muted'>
            {`On the other device, join with this name and type this code. It works once, until ${new Date(transfer.until).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`}
          </span>
        </>
      ) : (
        <span className='text-xs leading-relaxed text-foreground-muted'>Playing on another phone or screen? Get a code to take this character with you.</span>
      )}
      <button
        type='button'
        className={buttonClassName}
        onClick={onRequest}>
        <ArrowRightLeft size={12} />
        {live ? 'New code' : 'Move to another device'}
      </button>
    </div>
  );
}

export default TransferCode;
