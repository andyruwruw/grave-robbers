// Packages
import { Group } from 'three';

// Local Imports
import { BLADE, EDGE, STEEL } from '../../config/palette';
import {
  BLOOD,
  CHAIN,
  HEART,
  HOLLOW,
  MOONLIGHT,
  MOONSILVER,
} from '../config/blade-variant-palette';
import {
  ECTO,
  ECTO_PALE,
  HEX,
  HEX_CORD,
  HEX_STEEL,
  HOLY_GOLD,
  HOLY_GOLD_DARK,
  HOLY_SILVER,
  IRON_BAND,
  LAVA,
  LAVA_HOT,
  MIRROR_GLINT,
  MIRROR_RIM,
  OBSIDIAN,
  OBSIDIAN_SHEEN,
} from '../config/essence-palette';
import {
  drips,
  faceTilt,
  restyleColor,
  tipSpot,
} from '../helpers/shape-bits';

// Types
import type { Mesh } from 'three';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { VariantId, VariantShape } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * Ephemeral Blade: a see-through twin of the blade that drifts off its
 * face and back.
 * @param decor The model being decorated.
 */
const ephemeralBlade = (decor: VariantDecor): void => {
  const twin = decor.add(decor.vec(decor.length * 0.9, decor.width * 0.9, 0.012), [0, 0, 0], ECTO_PALE, true, 0.22);
  decor.animate((time: number): void => {
    const k = Math.sin(time * 1.7);
    decor.place(twin, Math.sin(time * 0.9) * 0.01, k * 0.025, decor.depth / 2 + 0.012 + Math.abs(k) * 0.02);
  });
};

/**
 * Phantom Edge: three fading echoes of the blade trailing off its back,
 * rippling like an afterimage.
 * @param decor The model being decorated.
 */
const phantomEdge = (decor: VariantDecor): void => {
  const { length: l, width: w, gripSide } = decor;
  const echoes = [0, 1, 2].map((i: number): Mesh => decor.add(decor.vec(l * (0.85 - i * 0.12), w * 0.7, 0.01), [0, 0, 0], ECTO, true, 0.3 - i * 0.08));
  decor.animate((time: number): void => {
    for (let i = 0; i < echoes.length; i++) {
      decor.place(echoes[i], gripSide * (i + 1) * 0.02, -(w / 2 + 0.03 * (i + 1)) - Math.sin(time * 3 - i * 0.8) * 0.012, 0);
    }
  });
};

/**
 * Silvered Shortsword: a polished silver blade with a glint running from
 * hilt to tip now and then.
 * @param decor The model being decorated.
 */
const silveredShortsword = (decor: VariantDecor): void => {
  restyleColor(decor, [STEEL, EDGE], { color: HOLY_SILVER });
  restyleColor(decor, [BLADE], { color: MIRROR_RIM });
  const { length: l, width: w, gripSide } = decor;
  const t = decor.depth / 2 + 0.006;
  const glints = [-1, 1].map((side: number): Mesh => decor.add(decor.vec(0.03, w * 0.9, 0.004), decor.vec(0, 0, side * t), MIRROR_GLINT, true, 0.8));
  decor.animate((time: number): void => {
    const k = (time * 0.5) % 1;
    for (let i = 0; i < glints.length; i++) {
      glints[i].visible = k < 0.35;
      decor.place(glints[i], gripSide * l * (0.45 - (k / 0.35) * 0.9), 0, (i ? 1 : -1) * t);
    }
  });
};

/**
 * Moonsilver Saber: the gold blade turns to moonlit silver under a soft
 * glow, with a crescent moon on each face near the hilt; while the
 * one-shot recharges (`PlayerState.dimmed`), the glow and moons go out.
 * @param decor The model being decorated.
 */
const moonsilverSaber = (decor: VariantDecor): void => {
  restyleColor(decor, [HOLY_GOLD, HOLY_GOLD_DARK], { color: MOONSILVER });
  const { length: l, width: w, gripSide } = decor;
  const shell = decor.add(decor.vec(l * 0.95, w + 0.025, decor.depth + 0.02), [0, 0, 0], MOONLIGHT, true, 0.18);
  const moons: Mesh[] = [];
  const a0 = gripSide * (l / 2 - 0.08);
  for (const side of [-1, 1]) {
    for (const turn of [-1.3, -0.65, 0, 0.65, 1.3]) {
      moons.push(decor.add(decor.vec(0.014, 0.014, 0.005), decor.vec(a0 + Math.sin(turn) * 0.03, -Math.cos(turn) * 0.024 + 0.008, side * (decor.depth / 2 + 0.005)), MOONLIGHT, true));
    }
  }
  decor.animate((time: number, _dt: number, holder: PlayerState | null): void => {
    const lit = holder?.dimmed !== true;
    shell.visible = lit;
    for (const moon of moons) {
      moon.visible = lit;
    }
    shell.scale.setComponent(decor.out, (w + 0.025) * (1 + Math.sin(time * 2) * 0.12));
  });
};

/**
 * Bloodletter: a glowing blood groove down each face and blood dripping
 * off the point.
 * @param decor The model being decorated.
 */
const bloodletter = (decor: VariantDecor): void => {
  const t = decor.depth / 2 + 0.003;
  for (const side of [-1, 1]) {
    decor.add(decor.vec(decor.length * 0.55, 0.01, 0.004), decor.vec(decor.gripSide * decor.length * 0.05, -decor.width * 0.1, side * t), BLOOD, true);
  }
  drips(decor, tipSpot(decor), BLOOD, false);
};

/**
 * Heart Devourer: the Bloodletter's blood, and a heart skewered on the
 * blade that beats, harder and faster while its holder is overhealed.
 * @param decor The model being decorated.
 */
const heartDevourer = (decor: VariantDecor): void => {
  bloodletter(decor);
  const g = decor.gripSide;
  const heart = new Group();
  heart.position.set(...decor.vec(g * decor.length * 0.28, 0, 0));
  const point = decor.box(decor.vec(0.022, 0.022, 0.034), decor.vec(-g * 0.024, 0, 0), HEART);
  faceTilt(decor, point, Math.PI / 4);
  heart.add(
    decor.box(decor.vec(0.026, 0.026, 0.036), decor.vec(g * 0.012, -0.014, 0), HEART),
    decor.box(decor.vec(0.026, 0.026, 0.036), decor.vec(g * 0.012, 0.014, 0), HEART),
    decor.box(decor.vec(0.03, 0.044, 0.034), decor.vec(-g * 0.004, 0, 0), HEART),
    decor.box(decor.vec(0.008, 0.008, 0.038), decor.vec(g * 0.016, 0.012, 0), BLOOD, true),
    point,
  );
  decor.head.add(heart);
  decor.animate((time: number, _dt: number, holder: PlayerState | null): void => {
    const fed = (holder?.overheal ?? 0) > 0;
    const k = (time * (fed ? 2.2 : 1.2)) % 1;
    const beat = Math.exp(-(((k - 0.1) / 0.05) ** 2)) + 0.6 * Math.exp(-(((k - 0.3) / 0.05) ** 2));
    heart.scale.setScalar(1 + beat * (fed ? 0.35 : 0.18));
  });
};

/**
 * Hell's Edge: obsidian horns curling up off each end of the guard, tipped
 * in lava, and a burning stone set in the guard's middle.
 * @param decor The model being decorated.
 */
const hellsEdge = (decor: VariantDecor): void => {
  const g = decor.gripSide;
  const base = g * (decor.length / 2 - 0.02);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const seg = decor.add(decor.vec(0.06, 0.04 - i * 0.008, 0.035 - i * 0.006), decor.vec(base + g * (0.02 + i * 0.035), side * (0.15 + i * 0.03), 0), i === 2 ? LAVA_HOT : OBSIDIAN, i === 2);
      faceTilt(decor, seg, side * g * (0.5 + i * 0.35));
    }
  }
  const stone = decor.add(decor.vec(0.03, 0.03, decor.depth + 0.03), decor.vec(base, 0, 0), LAVA_HOT, true);
  decor.animate((time: number): void => {
    stone.scale.setComponent(decor.out, 0.03 * (1 + Math.sin(time * 6) * 0.15));
  });
};

/**
 * Infernal Mandate: Hell's Edge's horns, a burning seal on the blade
 * below the guard, and a crown of flame on the pommel.
 * @param decor The model being decorated.
 */
const infernalMandate = (decor: VariantDecor): void => {
  hellsEdge(decor);
  const a = decor.gripSide * (decor.length / 2 - 0.13);
  const cores: Mesh[] = [];
  for (const side of [-1, 1]) {
    const t = side * (decor.depth / 2 + 0.004);
    faceTilt(decor, decor.add(decor.vec(0.06, 0.06, 0.006), decor.vec(a, 0, t), OBSIDIAN_SHEEN), Math.PI / 4);
    const core = decor.add(decor.vec(0.035, 0.035, 0.008), decor.vec(a, 0, t), LAVA_HOT, true);
    faceTilt(decor, core, Math.PI / 4);
    cores.push(core);
  }
  const haft = decor.model.haft;
  const top = haft ? haft.position.y + haft.scale.y / 2 + 0.085 : 0.2;
  const flames = [-1, 0, 1].map((i: number): Mesh => {
    const flame = decor.box([0.022, i === 0 ? 0.07 : 0.05, 0.022], [i * 0.024, top + (i === 0 ? 0.035 : 0.025), 0], i === 0 ? LAVA_HOT : LAVA, true);
    decor.addToModel(flame);
    return flame;
  });
  decor.animate((time: number): void => {
    const s = 0.035 * (1 + Math.sin(time * 4) * 0.2);
    for (const core of cores) {
      core.scale.setComponent(decor.along, s);
      core.scale.setComponent(decor.out, s);
    }
    for (let i = 0; i < flames.length; i++) {
      flames[i].scale.y = (i === 1 ? 0.07 : 0.05) * (1 + Math.sin(time * 17 + i * 2.1) * 0.25);
    }
  });
};

/**
 * Doomblade: a dark chain wound twice round the blade, and a padlock
 * hanging off the guard with a glowing keyhole.
 * @param decor The model being decorated.
 */
const doomblade = (decor: VariantDecor): void => {
  const { length: l, width: w, depth: d, gripSide: g } = decor;
  const links = Math.round((l * 0.6) / 0.035);
  for (let i = 0; i <= links; i++) {
    const turn = i * 0.7;
    const link = decor.add(decor.vec(0.028, 0.018, 0.018), decor.vec(g * l * 0.3 - g * i * ((l * 0.6) / links), Math.cos(turn) * (w / 2 + 0.01), Math.sin(turn) * (d / 2 + 0.012)), i % 2 ? CHAIN : IRON_BAND);
    faceTilt(decor, link, 0.5);
  }
  const lock = new Group();
  lock.position.set(...decor.vec(g * (l / 2 - 0.04), w / 2 + 0.025, 0));
  lock.add(
    decor.box([0.01, 0.045, 0.01], [0, -0.022, 0], CHAIN),
    decor.box([0.04, 0.035, 0.022], [0, -0.06, 0], CHAIN),
    decor.box([0.01, 0.014, 0.026], [0, -0.062, 0], HEX, true),
  );
  decor.head.add(lock);
  decor.animate((time: number): void => {
    lock.rotation.z = Math.sin(time * 2.2) * 0.3;
    lock.rotation.x = Math.sin(time * 1.6 + 1) * 0.2;
  });
};

/**
 * Executioner's Oath: the Doomblade's chain and lock, the point cut off
 * square like a headsman's sword with a glowing oath line across it, and
 * a hole bored near the end.
 * @param decor The model being decorated.
 */
const executionersOath = (decor: VariantDecor): void => {
  doomblade(decor);
  const { length: l, width: w, depth: d, gripSide: g } = decor;
  decor.add(decor.vec(0.05, w * 1.02, d * 1.02), decor.vec(-g * (l / 2 - 0.025), 0, 0), HEX_STEEL);
  decor.add(decor.vec(0.006, w * 1.04, d * 1.06), decor.vec(-g * (l / 2 - 0.05), 0, 0), HEX, true);
  decor.add(decor.vec(0.026, 0.026, d + 0.004), decor.vec(-g * (l / 2 - 0.1), 0, 0), HOLLOW);
  decor.add(decor.vec(0.026, 0.008, 0.004), decor.vec(-g * (l / 2 - 0.1), 0.017, d / 2 + 0.004), HEX_CORD);
};

/**
 * The short sword's, ritual knife's, and greatsword's own twists, by
 * variant.
 */
export const BLADE_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'short-sword@ecto1': ephemeralBlade,
  'short-sword@ecto2': phantomEdge,
  'short-sword@holy1': silveredShortsword,
  'short-sword@holy2': moonsilverSaber,
  'ritual-knife@hex1': bloodletter,
  'ritual-knife@hex2': heartDevourer,
  'greatsword@brimstone1': hellsEdge,
  'greatsword@brimstone2': infernalMandate,
  'greatsword@hex1': doomblade,
  'greatsword@hex2': executionersOath,
};
