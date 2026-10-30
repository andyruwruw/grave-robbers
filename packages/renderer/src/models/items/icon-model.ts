// Packages
import { Group } from 'three';
import { isMatRecipe } from '@halloween/shared/crafting/material-recipes';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { buildTile } from '../../graveyard/graveyard-builder';
import { toWorld } from '../../space/world-coords';
import { buildGearModel } from '../gear/gear-model';
import { buildLantern } from '../gear/tools';
import { iconBox } from './icon-box';
import { materialModel } from './material-models';
import { resourceModel } from './resource-models';
import { uiModel } from './ui-models';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Material, Resource } from '@halloween/shared/goods/goods';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { IconKey, UiIcon } from '../../types/icons';

/**
 * Builds the model an icon shows, centered roughly on the origin.
 * @param key What the icon shows.
 * @returns The model.
 */
export function buildIconModel(key: IconKey): Group {
  const group = new Group();
  if (key.startsWith('ui:')) {
    const icon = key.slice(3) as UiIcon;
    group.add(...uiModel(icon));
    group.rotation.y = icon.startsWith('heart') ? -0.35 : icon === 'craft' ? -0.3 : icon.startsWith('hand') ? 0 : 0.15;
    return group;
  }
  if (key.startsWith('res:')) {
    group.add(...resourceModel(key.slice(4) as Resource));
    group.rotation.y = key === 'res:candy' ? 0.25 : 0;
    return group;
  }
  if (isMatRecipe(key) || key.startsWith('mat:')) {
    group.add(...materialModel(isMatRecipe(key) ? key : key.slice(4) as Material));
    group.rotation.y = 0.5;
    return group;
  }
  if (key.startsWith('build:')) {
    const kind = key.slice(6) as StructureKind;
    const map = WorldMap.filled('grass');
    const tx = Math.floor(MAP_WIDTH / 2);
    const ty = Math.floor(MAP_HEIGHT / 2);
    map.set(tx, ty, kind);
    if (kind === 'steps') {
      map.set(tx, ty - 1, 'platform');
    }
    const tile = buildTile(map, 1, tx, ty);
    const at = toWorld(tx + 0.5, ty + 0.5);
    tile.position.x -= at.x - (tx + 0.5 - MAP_WIDTH / 2);
    tile.position.z -= at.z - (ty + 0.5 - MAP_HEIGHT / 2);
    group.add(tile);
    return group;
  }
  const kind = key.startsWith('gear:') ? key.slice(5) as GearKind : key as 'hammer' | 'lantern';
  const parts = kind === 'lantern' ? buildLantern(iconBox.box) : buildGearModel(kind, iconBox.box).parts;
  const holder = new Group();
  holder.add(...parts);
  if (kind === 'shield') {
    holder.rotation.y = -0.5;
  } else if (kind !== 'lantern' && GEAR[kind].slot === 'armor') {
    holder.rotation.y = Math.PI / 2 + 0.4;
  } else if (kind !== 'lantern') {
    holder.rotation.set(0, Math.PI / 2 - 0.6, Math.PI * 0.75);
  }
  group.add(holder);
  return group;
}
