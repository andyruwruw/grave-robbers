// Packages
import { Group } from 'three';

// Local Imports
import { BONE } from '../../../config/palette';
import { DAWN, SPARK } from '../../config/blunt-palette';
import {
  HOLY_HALO,
  HOLY_WING,
  LAVA,
  LAVA_HOT,
  OBSIDIAN,
} from '../../config/essence-palette';
import { chainBeads } from '../../helpers/chain-beads';
import { featherFan } from '../../helpers/feather-fan';

// Types
import type { Mesh } from 'three';
import type { VariantId, VariantShape } from '../../types/variant-shape';
import type { VariantDecor } from '../../variant-decor';

/**
 * A group set on the Mourning Star's ball, at its middle and turned with
 * it (the ball sits in the last joint when held, and is turned by the coil
 * when flattened), so what's added to it fits the ball either way.
 * @param decor The model being decorated.
 * @returns The group, already in the head, and the ball's half width.
 */
const ballOf = (decor: VariantDecor): { g: Group; r: number } => {
  const g = new Group();
  const tip = decor.model.tip;
  if (tip) {
    g.position.copy(tip.position);
    g.quaternion.copy(tip.quaternion);
  }
  decor.head.add(g);
  return { g, r: (tip?.scale.x ?? 0.13) / 2 };
};

/**
 * Adds a box to a group.
 * @param decor The model being decorated.
 * @param g The group.
 * @param size Its size.
 * @param pos Where it sits in the group.
 * @param color Its color.
 * @param glow Whether it glows.
 * @param opacity How opaque it is.
 * @returns The box.
 */
const put = (decor: VariantDecor, g: Group, size: [number, number, number], pos: [number, number, number], color: string, glow = false, opacity = 1): Mesh => {
  const mesh = decor.box(size, pos, color, glow, opacity);
  g.add(mesh);
  return mesh;
};

/**
 * A steady random number from 0 to 1 for a seed.
 * @param seed The seed.
 * @returns The number.
 */
const hash = (seed: number): number => {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * Little bolts of lightning crackling round the ball, jumping to a new
 * spot several times a second.
 * @param decor The model being decorated.
 * @param count How many bolts.
 * @param color Their color.
 */
const crackle = (decor: VariantDecor, count: number, color: string): void => {
  const { g, r } = ballOf(decor);
  const bolts: Mesh[] = [];
  for (let i = 0; i < count; i++) {
    bolts.push(put(decor, g, [0.05, 0.008, 0.008], [0, 0, 0], color, true));
  }
  const far = r + 0.05;
  decor.animate((time: number): void => {
    for (let i = 0; i < bolts.length; i++) {
      const step = Math.floor(time * 11 + i * 0.37) + i * 101;
      const turn = hash(step) * Math.PI * 2;
      const rise = hash(step + 0.5) * 2 - 1;
      const flat = far * Math.sqrt(1 - rise * rise);
      bolts[i].visible = hash(step + 0.25) > 0.35;
      bolts[i].position.set(Math.cos(turn) * flat, rise * far, Math.sin(turn) * flat);
      bolts[i].rotation.set(turn, hash(step + 0.75) * 3, rise * 2);
    }
  });
};

/**
 * A skull on both faces of the ball, its sockets glowing with lava that
 * swells and fades.
 * @param decor The model being decorated.
 */
const skulls = (decor: VariantDecor): void => {
  const { g, r } = ballOf(decor);
  const eyes: Mesh[] = [];
  for (const side of [-1, 1]) {
    const z = side * (r + 0.004);
    put(decor, g, [0.1, 0.075, 0.008], [0, 0.012, z], BONE);
    put(decor, g, [0.07, 0.03, 0.008], [0, -0.04, z], BONE);
    for (const x of [-0.03, -0.012, 0.012, 0.03]) {
      put(decor, g, [0.006, 0.022, 0.01], [x, -0.04, z], OBSIDIAN);
    }
    for (const x of [-0.026, 0.026]) {
      eyes.push(put(decor, g, [0.026, 0.022, 0.006], [x, 0.016, z + side * 0.004], LAVA, true));
    }
  }
  decor.animate((time: number): void => {
    const s = 1 + Math.sin(time * 3) * 0.2;
    for (const eye of eyes) {
      eye.scale.set(0.026 * s, 0.022 * s, 0.006);
    }
  });
};

/**
 * Dawn's Scourge: the ball a little sun, with pale gold rays between its
 * spikes, a soft glow round it, and lightning crackling off it.
 * @param decor The model being decorated.
 */
const dawnsScourge = (decor: VariantDecor): void => {
  const { g, r } = ballOf(decor);
  for (const turn of [Math.PI / 4, -Math.PI / 4]) {
    put(decor, g, [r * 2.6, 0.014, 0.014], [0, 0, 0], DAWN, true).rotation.z = turn;
    put(decor, g, [0.014, 0.014, r * 2.6], [0, 0, 0], DAWN, true).rotation.x = turn;
  }
  const glow = put(decor, g, [r * 2.4, r * 2.4, r * 2.4], [0, 0, 0], DAWN, true, 0.2);
  decor.animate((time: number): void => {
    glow.scale.setScalar(r * 2.4 * (1 + Math.sin(time * 2.2) * 0.08));
  });
  crackle(decor, 3, SPARK);
};

/**
 * The Seraphic Chain: six small wings round the ball (a seraph's three
 * pairs), a glowing bead on every other link, and more lightning.
 * @param decor The model being decorated.
 */
const seraphicChain = (decor: VariantDecor): void => {
  const { g, r } = ballOf(decor);
  for (const [lift, tilt] of [[0.035, -0.35], [0, -1.35], [-0.035, -2.4]]) {
    for (const side of [-1, 1]) {
      const wing = featherFan(decor.box, 3, 0.09, HOLY_WING);
      const turn = new Group();
      turn.position.set(side * (r - 0.01), lift, 0);
      turn.rotation.y = side > 0 ? 0 : Math.PI;
      wing.rotation.z = tilt;
      turn.add(wing);
      g.add(turn);
    }
  }
  chainBeads(decor, 2, 0.032, HOLY_HALO, true);
  crackle(decor, 4, HOLY_HALO);
};

/**
 * Requiem Lash: a skull set in the ball, and a ring of righteous fire
 * turning round it.
 * @param decor The model being decorated.
 */
const requiemLash = (decor: VariantDecor): void => {
  skulls(decor);
  const { g, r } = ballOf(decor);
  const ring = new Group();
  const far = r + 0.045;
  for (let i = 0; i < 8; i++) {
    const turn = (i / 8) * Math.PI * 2;
    const seg = decor.box([0.045, 0.012, 0.012], [Math.cos(turn) * far, 0, Math.sin(turn) * far], i % 2 ? LAVA : LAVA_HOT, true);
    seg.rotation.y = Math.PI / 2 - turn;
    ring.add(seg);
  }
  g.add(ring);
  decor.animate((time: number): void => {
    ring.rotation.y = time * 1.6;
  });
};

/**
 * Requiem Pyre: the skull wreathed in flame tongues licking out round it,
 * and the chain smouldering, an ember on every other link.
 * @param decor The model being decorated.
 */
const requiemPyre = (decor: VariantDecor): void => {
  skulls(decor);
  const { g, r } = ballOf(decor);
  const tongues: Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const turn = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const tongue = put(decor, g, [0.035, 0.07, 0.035], [Math.cos(turn) * (r + 0.02), 0.03, Math.sin(turn) * (r + 0.02)], i % 2 ? LAVA : LAVA_HOT, true);
    tongue.rotation.y = -turn;
    tongues.push(tongue);
  }
  chainBeads(decor, 2, 0.028, LAVA, true);
  decor.animate((time: number): void => {
    for (let i = 0; i < tongues.length; i++) {
      const s = 1 + Math.sin(time * 17 + i * 2.1) * 0.25 + Math.sin(time * 31 + i) * 0.1;
      tongues[i].scale.set(0.035 * (2 - s), 0.07 * s, 0.035 * (2 - s));
      tongues[i].position.y = 0.03 + (s - 1) * 0.03;
    }
  });
};

/**
 * The Mourning Star's own twists, by variant. Each works on both builds:
 * the whip in hand (the ball in its last joint) and flattened for the
 * ground and icons.
 */
export const MOURNING_STAR_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'morning-star@holy1': dawnsScourge,
  'morning-star@holy2': seraphicChain,
  'morning-star@brimstone1': requiemLash,
  'morning-star@brimstone2': requiemPyre,
};
