// Packages
import { VAMPIRE_BLOOD_RESIST } from '@halloween/shared/gear/damage-to';
import { GEAR, GEAR_KINDS } from '@halloween/shared/gear/gear-catalog';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';
import { STRUCTURES, STRUCTURE_KINDS } from '@halloween/shared/structures/structure-catalog';
import { TURRETS } from '@halloween/shared/structures/turrets';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { Goods } from '@halloween/shared/goods/goods';
import type { StructureKind, TurretDef } from '@halloween/shared/structures/types/structures';
import type { TraitLine } from '../types/traits';

/**
 * What a weapon does beyond its stat bars, in words.
 *
 * @param weapon The weapon's stats.
 * @param trick Its trick, if it has one (`WEAPON_TRICKS`).
 * @returns Its traits.
 */
export function weaponTraits(weapon: WeaponStats, trick?: string): TraitLine[] {
  const lines: TraitLine[] = [];
  if (trick) {
    lines.push({ icon: 'sparkle', text: trick });
  }
  if (weapon.ranged) {
    const ammo = weapon.ammo;
    lines.push(ammo === 'blood'
      ? { icon: 'crosshair', text: 'Shoots your blood', item: 'res:blood' }
      : { icon: 'crosshair', text: ammo ? `Shoots ${GOODS_LABELS[ammo].toLowerCase()}` : 'Shoots', item: ammo ? `mat:${ammo}` : undefined });
  }
  if (weapon.slays) {
    lines.push({ icon: 'skull', text: `Kills ${weapon.slays}s in one hit` });
  }
  if (weapon.holy) {
    lines.push({ icon: 'holy', text: `Holy: vampires take ${weapon.holy}x its damage` });
  }
  if (weapon.ammo === 'blood' || weapon.hpCost) {
    lines.push({ icon: 'fang', text: `Vampires take only ${Math.round(VAMPIRE_BLOOD_RESIST * 100)}% of its damage` });
  }
  if (weapon.hpCost) {
    lines.push({ icon: 'heart-crack', text: `Each swing costs ${weapon.hpCost} hp` });
  }
  if (weapon.feast) {
    lines.push({ icon: 'heart-plus', text: `Kills slowly heal ${weapon.feast} hp` });
  }
  return lines;
}

/**
 * What a turret takes and how it fights, in words.
 *
 * @param turret The turret.
 * @returns Its traits.
 */
export function turretTraits(turret: TurretDef): TraitLine[] {
  const ammo = turret.ammo;
  return [
    ammo
      ? {
        icon: 'crosshair',
        text: `1 ${GOODS_LABELS[ammo].toLowerCase()} loads ${turret.shots} ${turret.fires === 'flame' ? 'gouts' : 'shots'} (holds ${turret.most}); belts can feed it`,
        item: ammo === 'candy' || ammo === 'blood' ? `res:${ammo}` : `mat:${ammo}`,
      }
      : { icon: 'crosshair', text: 'Never needs ammo' },
    {
      icon: 'sparkle',
      text: turret.fires === 'sweep' ? 'Blades sweep round, hitting everything beside it' : turret.fires === 'flame' ? 'Burns everything in a cone and sets it alight' : turret.pierce ? `Bolts pierce ${turret.pierce} monsters` : 'Shoots the nearest monster',
    },
  ];
}

/**
 * What a kind of goods is ammo for: the weapons and turrets that shoot or
 * burn it.
 *
 * @param goods The goods.
 * @returns A trait naming them, or none if nothing uses it.
 */
export function ammoTraits(goods: Goods): TraitLine[] {
  const weapons = GEAR_KINDS.filter((k: GearKind): boolean => GEAR[k].weapon?.ammo === goods).map((k: GearKind): string => GEAR[k].label);
  const turrets = STRUCTURE_KINDS.filter((k: StructureKind): boolean => TURRETS[k]?.ammo === goods).map((k: StructureKind): string => STRUCTURES[k].label);
  const users = [...weapons, ...turrets];
  if (!users.length) {
    return [];
  }
  const list = users.length === 1 ? users[0] : `${users.slice(0, -1).join(', ')} and ${users.at(-1)}`;
  return [{ icon: 'crosshair', text: `Ammo for the ${list}` }];
}
