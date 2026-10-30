// Packages
import React from 'react';
import { Sparkles } from 'lucide-react';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';

// Local Imports
import ItemIcon from '../items/item-icon';
import Trait from './trait';

// Types
import type { TurretDef } from '@halloween/shared/structures/types/structures';

/**
 * Props for the TurretTraits component.
 */
interface TurretTraitsProps {
  /**
   * The turret's stats.
   */
  turret: TurretDef;
}

/**
 * A turret's two traits: what it loads (or that it needs nothing), and how
 * it fires.
 *
 * @param {TurretTraitsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered traits.
 */
function TurretTraits({ turret }: TurretTraitsProps): React.JSX.Element {
  return (
    <>
      <Trait>
        {turret.ammo ? (
          <>
            <ItemIcon
              item={turret.ammo === 'candy' || turret.ammo === 'blood' ? `res:${turret.ammo}` : `mat:${turret.ammo}`}
              size={18} />
            {`1 ${GOODS_LABELS[turret.ammo].toLowerCase()} loads ${turret.shots} ${turret.fires === 'flame' ? 'gouts' : 'shots'} (holds ${turret.most}); belts can feed it`}
          </>
        ) : 'Never needs ammo'}
      </Trait>
      <Trait>
        <Sparkles size={12} />
        {turret.fires === 'sweep' ? 'Blades sweep round, hitting everything beside it' : turret.fires === 'flame' ? 'Burns everything in a cone and sets it alight' : turret.pierce ? `Bolts pierce ${turret.pierce} monsters` : 'Shoots the nearest monster'}
      </Trait>
    </>
  );
}

export default TurretTraits;
