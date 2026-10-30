// Packages
import React from 'react';
import {
  Crosshair,
  Droplet,
  HeartCrack,
  HeartPlus,
  Skull,
  Sun,
} from 'lucide-react';
import { VAMPIRE_BLOOD_RESIST } from '@halloween/shared/gear/damage-to';
import { RESOURCE_COLORS } from '@halloween/shared/goods/goods-display';

// Local Imports
import ItemIcon from '../items/item-icon';
import Trait from './trait';

// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';

/**
 * Props for the WeaponTraits component.
 */
interface WeaponTraitsProps {
  /**
   * The weapon's stats.
   */
  weapon: WeaponStats;
}

/**
 * A weapon's special traits: what it shoots, what it slays in one hit,
 * holy damage, blood, its swing's hp cost, and kills that heal.
 *
 * @param {WeaponTraitsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered traits (empty without any).
 */
function WeaponTraits({ weapon }: WeaponTraitsProps): React.JSX.Element {
  return (
    <>
      {(weapon.ranged || weapon.slays || weapon.hpCost || weapon.feast || weapon.holy || weapon.ammo === 'blood') && (
        <div className='flex flex-col gap-1'>
          {weapon.ranged && (
            <Trait>
              <Crosshair size={12} />
              Shoots
              {weapon.ammo && (
                <ItemIcon
                  item={weapon.ammo === 'blood' ? 'res:blood' : `mat:${weapon.ammo}`}
                  size={18} />
              )}
              {weapon.ammo ?? null}
            </Trait>
          )}
          {weapon.slays && (
            <Trait>
              <Skull size={12} />
              {`Kills ${weapon.slays}s in one hit`}
            </Trait>
          )}
          {!!weapon.holy && (
            <Trait>
              <Sun size={12} />
              {`Holy: ${weapon.holy}x damage to vampires`}
            </Trait>
          )}
          {(weapon.ammo === 'blood' || !!weapon.hpCost) && (
            <Trait>
              <Droplet size={12} />
              {`Vampires take only ${Math.round(VAMPIRE_BLOOD_RESIST * 100)}% of its damage`}
            </Trait>
          )}
          {!!weapon.hpCost && (
            <Trait>
              <span style={{ color: RESOURCE_COLORS.blood }}>
                <HeartCrack size={12} />
              </span>
              {`Each swing costs ${weapon.hpCost} hp`}
            </Trait>
          )}
          {!!weapon.feast && (
            <Trait>
              <span style={{ color: RESOURCE_COLORS.tonic }}>
                <HeartPlus size={12} />
              </span>
              {`Kills slowly heal ${weapon.feast} hp`}
            </Trait>
          )}
        </div>
      )}
    </>
  );
}

export default WeaponTraits;
