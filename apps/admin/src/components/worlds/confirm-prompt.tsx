// Packages
import React from 'react';
import { X } from 'lucide-react';
import { PANEL_BUTTON } from '@halloween/controls/config/styles';

/**
 * Props for the ConfirmPrompt component.
 */
interface ConfirmPromptProps {
  /**
   * What happens if it goes ahead.
   */
  message: string;

  /**
   * The go-ahead button's label.
   */
  confirmLabel: string;

  /**
   * Goes ahead.
   */
  onConfirm: () => void;

  /**
   * Backs out.
   */
  onCancel: () => void;
}

/**
 * The second step of a confirm-gated button, in its place: what it will
 * do, a red go-ahead button, and Cancel.
 *
 * @param {ConfirmPromptProps} props - Component props.
 * @returns {React.JSX.Element} The rendered prompt.
 */
function ConfirmPrompt({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmPromptProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-xsm'>
      <span className='text-xs leading-snug text-foreground'>{message}</span>
      <div className='flex gap-xsm'>
        <button
          type='button'
          className={`${PANEL_BUTTON} border-danger text-danger`}
          onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button
          type='button'
          className={PANEL_BUTTON}
          onClick={onCancel}>
          <X size={14} />
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ConfirmPrompt;
