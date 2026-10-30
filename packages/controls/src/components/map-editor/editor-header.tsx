// Packages
import React from 'react';
import { PanelLeftClose, X } from 'lucide-react';

/**
 * Props for the EditorHeader component.
 */
interface EditorHeaderProps {
  /**
   * Hides the panel (editing carries on).
   */
  onHide: () => void;

  /**
   * Closes the map editor.
   */
  onClose: () => void;
}

/**
 * The map editor's title, with hide and close buttons.
 *
 * @param {EditorHeaderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered header.
 */
function EditorHeader({ onHide, onClose }: EditorHeaderProps): React.JSX.Element {
  return (
    <div className='flex items-center justify-between'>
      <span className='text-sm font-medium text-foreground'>Map editor</span>
      <div className='flex items-center'>
        <button
          type='button'
          aria-label='Hide the map editor panel'
          title='Hide the panel (keep editing)'
          className='flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground'
          onClick={onHide}>
          <PanelLeftClose size={15} />
        </button>
        <button
          type='button'
          aria-label='Close the map editor'
          className='flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground'
          onClick={onClose}>
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export default EditorHeader;
