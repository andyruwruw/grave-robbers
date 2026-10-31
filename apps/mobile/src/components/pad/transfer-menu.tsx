// Packages
import React from 'react';
import TransferCode from '@halloween/game-ui/components/screens/transfer-code';

/**
 * Props for TransferMenu.
 */
interface TransferMenuProps {
  /**
   * The last transfer code the server gave, or null.
   */
  transfer: { code: string; until: number } | null;

  /**
   * Asks for a new code.
   */
  onRequest: () => void;

  /**
   * Closes the popover.
   */
  onClose: () => void;
}

/**
 * The popover under the header's move button: a transfer code to take
 * this character to another device.
 *
 * @param {TransferMenuProps} props - Component props.
 * @returns {React.JSX.Element} The rendered popover.
 */
function TransferMenu({ transfer, onRequest, onClose }: TransferMenuProps): React.JSX.Element {
  return (
    <>
      <div
        className='fixed inset-0 z-20'
        onClick={onClose} />
      <div className='absolute right-md top-12 z-30 flex w-64 flex-col gap-1 rounded-md border border-border bg-background p-sm shadow-lg'>
        <TransferCode
          transfer={transfer}
          onRequest={onRequest}
          buttonClassName='flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted px-sm py-1.5 font-medium text-[13px] text-foreground' />
      </div>
    </>
  );
}

export default TransferMenu;
