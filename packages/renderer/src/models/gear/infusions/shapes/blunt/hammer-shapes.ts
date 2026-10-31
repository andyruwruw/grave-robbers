// Packages
import { Group } from 'three';

// Local Imports
import { EDGE, IRON } from '../../../config/palette';
import {
  FLESH_GREEN,
  HORN,
  QUAKE_GLOW,
  RUBBLE,
  SPARK,
  STITCH_DARK,
  STONE,
  STONE_DARK,
} from '../../config/blunt-palette';
import {
  IRON_BAND,
  LAVA,
  LAVA_HOT,
  OBSIDIAN,
  TENDON,
  TENDON_DARK,
} from '../../config/essence-palette';

// Types
import type { Mesh } from 'three';
import type { VariantId, VariantShape } from '../../types/variant-shape';
import type { VariantDecor } from '../../variant-decor';

/**
 * Where a hammer's striking face is, in its head (its edge runs along x
 * with the face toward +x).
 * @param decor The model being decorated.
 * @returns The face's x.
 */
const faceX = (decor: VariantDecor): number => {
  const tip = decor.model.tip;
  return tip ? tip.position.x + tip.scale.x / 2 : decor.size[0] / 2;
};

/**
 * A taut tendon cable from one point to another in the model, bulging and
 * thinning like a sprung coil, with its bulges throbbing.
 * @param decor The model being decorated.
 * @param from Where it starts.
 * @param to Where it ends.
 */
const tendonSpring = (decor: VariantDecor, from: [number, number, number], to: [number, number, number]): void => {
  const cable = new Group();
  cable.position.set(...from);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const long = Math.hypot(dx, dy);
  cable.rotation.z = Math.atan2(dx, -dy);
  const coils = 6;
  const bulges: Mesh[] = [];
  for (let i = 0; i < coils; i++) {
    const fat = i % 2 === 0;
    const coil = decor.box([fat ? 0.03 : 0.018, long / coils + 0.006, fat ? 0.03 : 0.018], [0, -(i + 0.5) * (long / coils), 0], fat ? TENDON : TENDON_DARK);
    cable.add(coil);
    if (fat) {
      bulges.push(coil);
    }
  }
  decor.addToModel(cable);
  decor.animate((time: number): void => {
    for (let i = 0; i < bulges.length; i++) {
      const s = 0.03 * (1 + Math.max(0, Math.sin(time * 5 - i * 1.2)) * 0.35);
      bulges[i].scale.x = s;
      bulges[i].scale.z = s;
    }
  });
};

/**
 * Monster Mash: a stitched patch of green flesh on top and bolts through
 * both sides, with sparks jumping off them.
 * @param decor The model being decorated.
 */
const monsterMash = (decor: VariantDecor): void => {
  const [, sy, sz] = decor.size;
  decor.add([0.14, 0.012, 0.11], [0, sy / 2 + 0.004, 0], FLESH_GREEN);
  decor.add([0.14, 0.016, 0.008], [0, sy / 2 + 0.006, 0], STITCH_DARK);
  for (const x of [-0.05, -0.017, 0.017, 0.05]) {
    decor.add([0.008, 0.016, 0.034], [x, sy / 2 + 0.006, 0], STITCH_DARK);
  }
  const sparks: Mesh[] = [];
  for (const side of [-1, 1]) {
    decor.add([0.03, 0.03, 0.03], [0, 0, side * (sz / 2 + 0.012)], IRON);
    decor.add([0.05, 0.05, 0.014], [0, 0, side * (sz / 2 + 0.03)], EDGE);
    sparks.push(decor.add([0.045, 0.008, 0.008], [0, 0.035, side * (sz / 2 + 0.04)], SPARK, true));
  }
  decor.animate((time: number): void => {
    for (let i = 0; i < sparks.length; i++) {
      const flick = Math.sin(time * 13 + i * 2.1) + Math.sin(time * 29 + i);
      sparks[i].visible = flick > 1.1;
      sparks[i].rotation.y = flick * 2;
    }
  });
};

/**
 * Flesh-Sprung Maul: two sprung tendon cables from the haft to the head,
 * and a lump of muscle on top that beats like a heart.
 * @param decor The model being decorated.
 */
const fleshSprungMaul = (decor: VariantDecor): void => {
  const [sx, sy, sz] = decor.size;
  const top = decor.rest.y + (sy / 2) * decor.head.scale.y;
  for (const side of [-1, 1]) {
    tendonSpring(decor, [0, -0.42, side * 0.04], [decor.rest.x + side * sx * 0.3 * decor.head.scale.x, top, side * 0.04]);
  }
  const heart = decor.add([0.09, 0.05, 0.08], [-0.02, sy / 2 + 0.02, 0], TENDON_DARK);
  for (const side of [-1, 1]) {
    decor.add([sx * 0.7, 0.012, 0.01], [0, sy * 0.15, side * (sz / 2 + 0.004)], TENDON);
  }
  decor.animate((time: number): void => {
    const beat = Math.max(0, Math.sin(time * 7)) ** 6 + Math.max(0, Math.sin(time * 7 - 0.9)) ** 6 * 0.6;
    heart.scale.set(0.09 * (1 + beat * 0.25), 0.05 * (1 + beat * 0.4), 0.08 * (1 + beat * 0.25));
  });
};

/**
 * Enflamed Hammer: a molten striking face and lava dripping off it.
 * @param decor The model being decorated.
 */
const enflamedHammer = (decor: VariantDecor): void => {
  const [, sy, sz] = decor.size;
  const x = faceX(decor);
  decor.add([0.01, sy * 0.8, sz * 0.8], [x + 0.004, 0, 0], LAVA, true);
  decor.add([0.012, sy * 0.35, sz * 0.35], [x + 0.006, 0, 0], LAVA_HOT, true);
  const drip = decor.add([0.022, 0.04, 0.022], [x - 0.02, -sy / 2, 0], LAVA, true);
  decor.animate((time: number): void => {
    const k = (time * 0.7) % 1;
    drip.scale.y = 0.02 + k * 0.05;
    drip.position.y = -sy / 2 - drip.scale.y / 2 - (k > 0.85 ? (k - 0.85) * 0.6 : 0);
  });
};

/**
 * Hellfire Hammer: curled demon horns off the back and a grated hellmouth
 * for a face, its fire breathing.
 * @param decor The model being decorated.
 */
const hellfireHammer = (decor: VariantDecor): void => {
  const [sx, sy, sz] = decor.size;
  for (const side of [-1, 1]) {
    const horn = new Group();
    horn.position.set(-sx * 0.3, sy / 2, side * sz * 0.35);
    horn.add(
      decor.box([0.045, 0.06, 0.045], [0, 0.02, 0], HORN),
      decor.box([0.036, 0.06, 0.036], [-0.02, 0.07, side * 0.01], HORN),
      decor.box([0.026, 0.05, 0.026], [-0.05, 0.11, side * 0.02], HORN),
      decor.box([0.016, 0.035, 0.016], [-0.085, 0.13, side * 0.025], LAVA_HOT, true),
    );
    horn.children[1].rotation.z = 0.4;
    horn.children[2].rotation.z = 0.8;
    horn.children[3].rotation.z = 1.2;
    decor.head.add(horn);
  }
  const x = faceX(decor);
  const core = decor.add([0.01, sy * 0.75, sz * 0.75], [x + 0.004, 0, 0], LAVA_HOT, true);
  for (const z of [-0.045, 0, 0.045]) {
    decor.add([0.016, sy * 0.85, 0.02], [x + 0.012, 0, z * (sz / 0.17)], OBSIDIAN);
  }
  decor.add([0.016, 0.02, sz * 0.85], [x + 0.012, 0, 0], OBSIDIAN);
  decor.animate((time: number): void => {
    const s = 1 + Math.sin(time * 9) * 0.08 + Math.sin(time * 23) * 0.05;
    core.scale.set(0.01, sy * 0.75 * s, sz * 0.75 * s);
  });
};

/**
 * Titan's Maul: a great stone slab for a face, broader than the head and
 * riveted at its corners, and a stone pommel to balance it.
 * @param decor The model being decorated.
 */
const titansMaul = (decor: VariantDecor): void => {
  const [, sy, sz] = decor.size;
  const x = faceX(decor);
  decor.add([0.05, sy * 1.3, sz * 1.3], [x + 0.02, 0, 0], STONE);
  decor.add([0.012, sy * 1.1, 0.012], [x + 0.046, 0, sz * 0.2], STONE_DARK);
  for (const y of [-1, 1]) {
    for (const z of [-1, 1]) {
      decor.add([0.026, 0.026, 0.026], [x + 0.045, y * sy * 0.5, z * sz * 0.5], IRON_BAND);
    }
  }
  decor.addToModel(decor.box([0.1, 0.07, 0.1], [0, 0.085, 0], STONE_DARK));
  decor.addToModel(decor.box([0.11, 0.02, 0.11], [0, 0.05, 0], IRON_BAND));
};

/**
 * Earthshaker: rock grown over the head with a glowing fissure split
 * across its face and sides, and rubble trembling in the air under it.
 * @param decor The model being decorated.
 */
const earthshaker = (decor: VariantDecor): void => {
  const [sx, sy, sz] = decor.size;
  const x = faceX(decor);
  const chunks: [number, number, number, number][] = [[-0.05, 1, 0.3, 0.3], [0.06, 1, -0.4, -0.2], [0.02, -1, 0.2, 0.5]];
  for (const [cx, up, cz, turn] of chunks) {
    const chunk = decor.add([0.08, 0.04, 0.07], [cx, up * (sy / 2 + 0.012), cz * sz], up > 0 ? STONE : STONE_DARK);
    chunk.rotation.y = turn;
  }
  const crack: [number, number, number][] = [[0.04, -0.4, 0.5], [0, 0, -0.5], [-0.04, 0.4, 0.5]];
  for (const [dy, dz, turn] of crack) {
    const seg = decor.add([0.008, sy * 0.4, 0.012], [x + 0.004, dy, dz * sz * 0.4], QUAKE_GLOW, true);
    seg.rotation.x = turn;
  }
  for (const side of [-1, 1]) {
    [-0.3, 0, 0.3].forEach((k: number, i: number): void => {
      const seg = decor.add([sx * 0.22, 0.01, 0.006], [k * sx, (i % 2 ? 1 : -1) * sy * 0.08, side * (sz / 2 + 0.003)], QUAKE_GLOW, true);
      seg.rotation.z = i % 2 ? 0.5 : -0.5;
    });
  }
  const rubble: Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    rubble.push(decor.add([0.03 - i * 0.005, 0.025, 0.028], [0, 0, 0], RUBBLE));
  }
  decor.animate((time: number): void => {
    for (let i = 0; i < rubble.length; i++) {
      const shake = Math.sin(time * 40 + i * 3) * 0.004;
      rubble[i].position.set(x - 0.06 + i * 0.05 + shake, -sy / 2 - 0.05 - Math.sin(time * 1.5 + i * 2) * 0.015, (i - 1) * sz * 0.35);
      rubble[i].rotation.y = time * (0.6 + i * 0.3);
    }
  });
};

/**
 * The infused hammer's and warhammer's own twists, by variant.
 */
export const HAMMER_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'infused-hammer@tendons1': monsterMash,
  'infused-hammer@tendons2': fleshSprungMaul,
  'infused-hammer@brimstone1': enflamedHammer,
  'infused-hammer@brimstone2': hellfireHammer,
  'warhammer@tendons1': titansMaul,
  'warhammer@tendons2': earthshaker,
};
