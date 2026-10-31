// Packages
import { Group } from 'three';

// Local Imports
import { BONE, EDGE, IRON } from '../../config/palette';
import {
  BLOOD,
  CHAIN,
  HOLLOW,
  HOOD,
  POISON,
} from '../config/blade-variant-palette';
import {
  ECTO,
  ECTO_PALE,
  FANG,
  HEX,
  HEX_CORD,
  KNUCKLE,
} from '../config/essence-palette';
import {
  drips,
  faceTilt,
  frame,
  skull,
  tatters,
} from '../helpers/shape-bits';

// Types
import type { Mesh } from 'three';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { VariantId, VariantShape } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * Ghostreaper: a ghostly shroud hanging in tatters off the blade's back.
 * @param decor The model being decorated.
 */
const ghostreaper = (decor: VariantDecor): void => {
  tatters(decor, decor.spread(4, 0.1).map((a: number) => decor.vec(a, -decor.width / 2 + 0.01, 0)), ECTO_PALE, true, 0.4);
};

/**
 * Wailing Sickle: the Ghostreaper's shroud, a wailing ghost face on the
 * blade's heel whose mouth stretches, and rings of its wail spreading off
 * it.
 * @param decor The model being decorated.
 */
const wailingSickle = (decor: VariantDecor): void => {
  ghostreaper(decor);
  const a = decor.gripSide * decor.length * 0.3;
  const o = -decor.width * 0.15;
  const mouths: Mesh[] = [];
  for (const side of [-1, 1]) {
    const t = side * (decor.depth / 2 + 0.005);
    decor.add(decor.vec(0.07, 0.08, 0.006), decor.vec(a, o, t), ECTO_PALE, true, 0.7);
    for (const eye of [-1, 1]) {
      decor.add(decor.vec(0.016, 0.016, 0.008), decor.vec(a + eye * 0.017, o + 0.016, t), HOLLOW);
    }
    mouths.push(decor.add(decor.vec(0.022, 0.035, 0.008), decor.vec(a, o - 0.018, t), HOLLOW));
  }
  const rings = [0, 1].map((): Group => {
    const ring = frame(decor, 0.08, 0.09, ECTO, 0.5);
    ring.position.set(...decor.vec(a, o, 0));
    decor.head.add(ring);
    return ring;
  });
  decor.animate((time: number): void => {
    for (const mouth of mouths) {
      mouth.scale.setComponent(decor.out, 0.035 * (1 + Math.max(0, Math.sin(time * 2.5)) * 0.5));
    }
    for (let i = 0; i < rings.length; i++) {
      const k = (time * 0.6 + i * 0.5) % 1;
      rings[i].scale.setScalar(0.5 + k * 1.8);
      rings[i].visible = k < 0.85;
    }
  });
};

/**
 * Reaper's Call: a skull with glowing eyes set at the blade's heel, and a
 * tolling bell hanging off its back.
 * @param decor The model being decorated.
 */
const reapersCall = (decor: VariantDecor): void => {
  const head = skull(decor.box, 0.07, BONE, HEX, true);
  head.position.set(...decor.vec(decor.gripSide * (decor.length / 2 - 0.06), -decor.width * 0.2, 0));
  decor.head.add(head);
  const bell = new Group();
  bell.position.set(...decor.vec(0, -decor.width / 2, 0));
  bell.add(
    decor.box([0.006, 0.05, 0.006], [0, -0.025, 0], HEX_CORD),
    decor.box([0.04, 0.04, 0.04], [0, -0.065, 0], CHAIN),
    decor.box([0.05, 0.012, 0.05], [0, -0.087, 0], CHAIN),
    decor.box([0.012, 0.012, 0.012], [0, -0.098, 0], HEX, true),
  );
  decor.head.add(bell);
  decor.animate((time: number): void => {
    bell.rotation.z = Math.sin(time * 2.6) * 0.4;
    bell.rotation.x = Math.sin(time * 1.9 + 0.7) * 0.15;
  });
};

/**
 * Death's Harvest: Reaper's Call's skull and bell, and stolen souls
 * spiralling up the snath to the hand, bigger while its holder is
 * overhealed.
 * @param decor The model being decorated.
 */
const deathsHarvest = (decor: VariantDecor): void => {
  reapersCall(decor);
  const haft = decor.model.haft;
  if (!haft) {
    return;
  }
  const { position: p, scale: s } = haft;
  const souls = [0, 1, 2, 3].map((): Mesh => {
    const soul = decor.box([1, 1, 1], [p.x, p.y, p.z], HEX, true, 0.85);
    decor.addToModel(soul);
    return soul;
  });
  decor.animate((time: number, _dt: number, holder: PlayerState | null): void => {
    const size = (holder?.overheal ?? 0) > 0 ? 0.032 : 0.022;
    for (let i = 0; i < souls.length; i++) {
      const k = (time * 0.35 + i / souls.length) % 1;
      const turn = time * 3 + i * 1.6;
      souls[i].position.set(p.x + Math.sin(turn) * 0.04, p.y - s.y / 2 + 0.05 + k * (s.y - 0.15), p.z + Math.cos(turn) * 0.04);
      souls[i].scale.setScalar(size * (1 - k * 0.5));
    }
  });
};

/**
 * Soulbound Glaive: a soul gem set in each face, and the bound soul
 * circling the blade with a fading tail.
 * @param decor The model being decorated.
 */
const soulboundGlaive = (decor: VariantDecor): void => {
  const { length: l, width: w, gripSide: g } = decor;
  const a = g * l * 0.22;
  for (const side of [-1, 1]) {
    const t = side * (decor.depth / 2 + 0.004);
    faceTilt(decor, decor.add(decor.vec(0.05, 0.05, 0.004), decor.vec(a, -w * 0.25, t), HEX_CORD), Math.PI / 4);
    faceTilt(decor, decor.add(decor.vec(0.032, 0.032, 0.007), decor.vec(a, -w * 0.25, t), HEX, true), Math.PI / 4);
  }
  const tail = [0.024, 0.018, 0.012].map((size: number, i: number): Mesh => decor.add([size, size, size], [0, 0, 0], HEX, true, 0.9 - i * 0.28));
  decor.animate((time: number): void => {
    for (let i = 0; i < tail.length; i++) {
      const turn = time * 2.5 - i * 0.25;
      decor.place(tail[i], Math.cos(turn) * (l / 2 + 0.04), Math.sin(turn) * (w / 2 + 0.05), 0);
    }
  });
};

/**
 * Wraith Glaive: the Soulbound's gem and soul, a shimmering spectral
 * crescent bowed off the blade's back (the arc of its throw), and dark
 * wraith cloth trailing from it.
 * @param decor The model being decorated.
 */
const wraithGlaive = (decor: VariantDecor): void => {
  soulboundGlaive(decor);
  const { length: l, width: w } = decor;
  const crescent = new Group();
  for (let j = -2; j <= 2; j++) {
    const turn = j * 0.35;
    const piece = decor.box(decor.vec(l * 0.22, 0.018, 0.01), decor.vec(Math.sin(turn) * l * 0.55, -(w / 2 + 0.02) - Math.cos(turn) * 0.06, 0), HEX, true, 0.35);
    faceTilt(decor, piece, -turn);
    crescent.add(piece);
  }
  decor.head.add(crescent);
  tatters(decor, decor.spread(3, 0.2).map((a: number) => decor.vec(a, -w / 2, 0)), HEX_CORD, false, 0.6);
  decor.animate((time: number): void => {
    crescent.scale.setComponent(decor.out, 1 + Math.sin(time * 3.2) * 0.15);
  });
};

/**
 * Ghoul Poker: a glowing film of poison on the point, poison dripping off
 * it, and a swollen poison sac lashed under the head.
 * @param decor The model being decorated.
 */
const ghoulPoker = (decor: VariantDecor): void => {
  const { length: l, width: w, depth: d, gripSide: g } = decor;
  decor.add(decor.vec(l * 0.5, w * 0.6, d + 0.01), decor.vec(-g * l * 0.22, 0, 0), POISON, true, 0.3);
  drips(decor, decor.vec(-g * l / 2, 0, 0), POISON, true);
  const sac = decor.add(decor.vec(0.05, 0.04, 0.04), decor.vec(g * (l / 2 + 0.03), w / 2 + 0.01, 0), POISON, false, 0.75);
  decor.animate((time: number): void => {
    sac.scale.setComponent(decor.out, 0.04 * (1 + Math.sin(time * 3) * 0.15));
  });
};

/**
 * The Impaler: Ghoul Poker's poison, barbs hooked back along the point, a
 * fanged crossbar below the head, and a skull skewered on the shaft.
 * @param decor The model being decorated.
 */
const theImpaler = (decor: VariantDecor): void => {
  ghoulPoker(decor);
  const { length: l, width: w, gripSide: g } = decor;
  for (const side of [-1, 1]) {
    for (const a of [-g * l * 0.05, g * l * 0.15]) {
      faceTilt(decor, decor.add(decor.vec(0.05, 0.016, 0.016), decor.vec(a, side * (w / 2 + 0.015), 0), EDGE), side * g * 0.6);
    }
  }
  const bar = g * (l / 2 + 0.02);
  decor.add(decor.vec(0.025, 0.2, 0.025), decor.vec(bar, 0, 0), CHAIN);
  for (const side of [-1, 1]) {
    decor.add(decor.vec(0.04, 0.018, 0.018), decor.vec(bar - g * 0.02, side * 0.1, 0), FANG);
  }
  const haft = decor.model.haft;
  if (haft) {
    const head = skull(decor.box, 0.075, BONE, HOLLOW, false);
    head.position.set(haft.position.x, haft.position.y - haft.scale.y / 2 + 0.2, haft.position.z);
    decor.addToModel(head);
  }
};

/**
 * Bonesplitter: a bone spike jutting off the back, and a split bone
 * wedged in the edge, its two halves forked apart.
 * @param decor The model being decorated.
 */
const bonesplitter = (decor: VariantDecor): void => {
  const back = -decor.width / 2;
  decor.add(decor.vec(0.08, 0.05, 0.05), decor.vec(0, back - 0.02, 0), BONE);
  decor.add(decor.vec(0.05, 0.05, 0.035), decor.vec(0, back - 0.06, 0), BONE);
  decor.add(decor.vec(0.025, 0.035, 0.02), decor.vec(0, back - 0.1, 0), KNUCKLE);
  const front = decor.width / 2;
  for (const side of [-1, 1]) {
    faceTilt(decor, decor.add(decor.vec(0.025, 0.08, 0.03), decor.vec(side * 0.022, front + 0.03, 0), BONE), side * 0.35);
    decor.add(decor.vec(0.04, 0.03, 0.035), decor.vec(side * 0.04, front + 0.07, 0), KNUCKLE);
  }
};

/**
 * Headsman's Axe: Bonesplitter's bones, a long beard dropping below the
 * blade, blood smeared along the edge and dripping off the beard, and a
 * black hood tied round the haft.
 * @param decor The model being decorated.
 */
const headsmansAxe = (decor: VariantDecor): void => {
  bonesplitter(decor);
  const { length: l, width: w, depth: d, gripSide: g } = decor;
  const low = -g * (l / 2 + 0.05);
  decor.add(decor.vec(0.12, 0.1, d * 0.6), decor.vec(low, w / 2 - 0.08, 0), IRON);
  faceTilt(decor, decor.add(decor.vec(0.13, 0.03, d * 0.65), decor.vec(low + g * 0.01, w / 2 - 0.025, 0), EDGE), g * 0.3);
  for (const a of decor.spread(3, 0.2)) {
    decor.add(decor.vec(0.045, 0.03, d + 0.008), decor.vec(a, w / 2 - 0.01, 0), BLOOD);
  }
  drips(decor, decor.vec(low - g * 0.06, w / 2 - 0.03, 0), BLOOD, false);
  const hood = decor.wrap(0.6, 0.06, HOOD, 0.02);
  if (hood) {
    const tail = decor.box([0.035, 0.13, 0.012], [hood.position.x + hood.scale.x / 2 + 0.012, hood.position.y - 0.06, hood.position.z], HOOD);
    tail.rotation.z = 0.3;
    decor.addToModel(tail);
  }
};

/**
 * The scythe's, cursed glaive's, spear's, and battle axe's own twists, by
 * variant.
 */
export const POLEARM_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'scythe@ecto1': ghostreaper,
  'scythe@ecto2': wailingSickle,
  'scythe@hex1': reapersCall,
  'scythe@hex2': deathsHarvest,
  'glaive@hex1': soulboundGlaive,
  'glaive@hex2': wraithGlaive,
  'spear@fang1': ghoulPoker,
  'spear@fang2': theImpaler,
  'battle-axe@tendons1': bonesplitter,
  'battle-axe@tendons2': headsmansAxe,
};
