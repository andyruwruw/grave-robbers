// Packages
import React from 'react';

// Local Imports
import ItemIcon from '../items/item-icon';
import DetailPips from './detail-pips';
import StatGlyph from './stat-glyph';

// Types
import type { Unlock } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * Props for the UnlockHint component.
 */
interface UnlockHintProps {
  /**
   * What opens the locked item.
   */
  unlock: Unlock;
}

/**
 * What opens something locked: a lock, then a blueprint, or the node to
 * upgrade and how far.
 *
 * @param {UnlockHintProps} props - Component props.
 * @returns {React.JSX.Element} The rendered hint.
 */
function UnlockHint({ unlock }: UnlockHintProps): React.JSX.Element {
  return (
    <div className='flex items-center gap-1.5 text-foreground'>
      <StatGlyph
        icon='lock'
        size={16} />
      {unlock.by === 'blueprint' && (
        <StatGlyph
          icon='scroll'
          size={18} />
      )}
      {unlock.by === 'upgrade' && (
        <>
          <ItemIcon
            item={unlock.from}
            size={26} />
          <DetailPips level={unlock.level} />
        </>
      )}
    </div>
  );
}

export default UnlockHint;
