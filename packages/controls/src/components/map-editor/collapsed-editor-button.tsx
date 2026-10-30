// Packages
import React from 'react';
import { PanelLeftOpen } from 'lucide-react';

/**
 * Props for the CollapsedEditorButton component.
 */
interface CollapsedEditorButtonProps {
  /**
   * Shows the panel again.
   */
  onShow: () => void;
}

/**
 * The button left in the corner while the map editor's panel is hidden.
 *
 * @param {CollapsedEditorButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered button.
 */
function CollapsedEditorButton({ onShow }: CollapsedEditorButtonProps): React.JSX.Element {
  return (
    <button
      type='button'
      className='absolute left-sm top-sm flex items-center gap-xsm rounded-lg border border-border bg-surface px-md py-sm text-sm font-medium text-foreground hover:bg-muted'
      onClick={onShow}>
      <PanelLeftOpen size={15} />
      Map editor
    </button>
  );
}

export default CollapsedEditorButton;
