// Packages
import React from 'react';

/**
 * Props for the AdminDialog component.
 */
interface AdminDialogProps {
  /**
   * Closes it (back to the menu), on a click outside.
   */
  onClose: () => void;

  /**
   * The page's header, then its body.
   */
  children: React.ReactNode;
}

/**
 * A large page (the Item Catalogue, the Knowledge Tree) as a dialog over
 * the world: a see-through backdrop, and a click on it closes the dialog.
 *
 * @param {AdminDialogProps} props - Component props.
 * @returns {React.JSX.Element} The rendered dialog.
 */
function AdminDialog({ onClose, children }: AdminDialogProps): React.JSX.Element {
  return (
    <div
      className='fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-md md:p-xl'
      onPointerDown={(e: React.PointerEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}>
      <div
        role='dialog'
        aria-modal='true'
        className='flex h-full max-h-[52rem] w-full max-w-5xl flex-col gap-lg rounded-lg border border-border bg-background/90 p-lg backdrop-blur-sm'>
        {children}
      </div>
    </div>
  );
}

export default AdminDialog;
