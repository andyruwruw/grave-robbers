// Packages
import { Group } from 'three';

// Local Imports
import { BRASS, FLAME_CORE } from '../../config/palette';
import {
  ECTO,
  ECTO_DEEP,
  ECTO_PALE,
  FANG,
  LAVA,
  LAVA_HOT,
  OBSIDIAN,
  OBSIDIAN_SHEEN,
} from '../config/essence-palette';
import {
  HOLLOW,
  HOSE,
  PILOT,
  SULFUR,
} from '../config/ranged-palette';
import {
  findBox,
  findBoxes,
  flicker,
  putBox,
  swapBox,
} from '../helpers/model-boxes';

// Types
import type { Mesh } from 'three';
import type { VariantId, VariantShape } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * The blood gun's vial of blood.
 */
const VIAL: [number, number, number] = [0.04, 0.1, 0.04];

/**
 * The glass caps on the vial.
 */
const VIAL_CAP: [number, number, number] = [0.05, 0.02, 0.05];

/**
 * The bands round the blood gun's barrel.
 */
const GUN_BAND: [number, number, number] = [0.075, 0.03, 0.075];

/**
 * The musket's barrel.
 */
const BARREL: [number, number, number] = [0.034, 0.95, 0.034];

/**
 * The bands round the musket's stock and barrel.
 */
const MUSKET_RING: [number, number, number] = [0.05, 0.028, 0.05];

/**
 * The musket's cock (the flint's hammer).
 */
const COCK: [number, number, number] = [0.02, 0.04, 0.02];

/**
 * The musket's lock plate.
 */
const LOCK_PLATE: [number, number, number] = [0.03, 0.06, 0.025];

/**
 * The musket's trigger guard.
 */
const TRIGGER_GUARD: [number, number, number] = [0.05, 0.015, 0.04];

/**
 * The muzzle's mouth, in the head's space: the bottom of the tip box.
 * @param tip The muzzle's tip box.
 * @returns Its x, y (the mouth), and z.
 */
const mouthOf = (tip: Mesh): [number, number, number] => [tip.position.x, tip.position.y - tip.scale.y / 2, tip.position.z];

/**
 * Lays a box from one point to another in the model's space (a length of
 * hose), in the x-y plane.
 * @param decor The model being decorated.
 * @param from One end.
 * @param to The other end.
 * @param z How far out it sits.
 */
const hose = (decor: VariantDecor, from: [number, number], to: [number, number], z: number): void => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const piece = putBox(decor, [0.024, Math.hypot(dx, dy) + 0.02, 0.024], [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, z], HOSE);
  piece.rotation.z = Math.atan2(-dx, dy);
};

/**
 * The Brimstone Blunderbuss: a flared obsidian bell glowing inside, a
 * vial of lava for blood, and sulfur crystals grown on the bands.
 * @param decor The blunderbuss being decorated.
 */
const brimstoneBlunderbuss = (decor: VariantDecor): void => {
  const tip = decor.model.tip;
  if (tip) {
    const [x, y, z] = mouthOf(tip);
    decor.add([0.17, 0.035, 0.17], [x, y - 0.012, z], OBSIDIAN_SHEEN);
    const glow = decor.add([0.1, 0.006, 0.1], [x, y - 0.031, z], LAVA, true);
    decor.animate((time: number): void => {
      glow.scale.setScalar(0.1 * (0.85 + Math.sin(time * 3) * 0.15));
      glow.scale.y = 0.006;
    });
  }
  const vial = findBox(decor, VIAL);
  if (vial) {
    swapBox(decor, vial, { color: LAVA, glow: true });
  }
  for (const cap of findBoxes(decor.model.parts, VIAL_CAP)) {
    swapBox(decor, cap, { color: OBSIDIAN_SHEEN });
  }
  findBoxes([decor.head], GUN_BAND).forEach((band: Mesh, b: number): void => {
    for (let i = 0; i < 3; i++) {
      const turn = (i / 3) * Math.PI * 2 + b;
      const crystal = decor.add([0.022, 0.045, 0.022], [band.position.x + Math.cos(turn) * 0.045, band.position.y, band.position.z + Math.sin(turn) * 0.045], SULFUR);
      crystal.rotation.set(Math.sin(turn) * 0.6, 0, -Math.cos(turn) * 0.6);
    }
  });
};

/**
 * The Hellmouth, a flamethrower: a fuel tank strapped to the barrel with
 * a lava gauge, a hose down to a narrow nozzle with a blue pilot light,
 * and a demon's maw (fangs, horns, burning eyes) round the muzzle.
 * @param decor The blunderbuss being decorated.
 */
const hellmouth = (decor: VariantDecor): void => {
  const vial = findBox(decor, VIAL);
  if (vial) {
    swapBox(decor, vial, { color: LAVA, glow: true });
  }
  const tankX = -0.1;
  const tankY = decor.rest.y + 0.06;
  putBox(decor, [0.09, 0.22, 0.09], [tankX, tankY, 0], OBSIDIAN);
  for (const side of [-1, 1]) {
    putBox(decor, [0.1, 0.025, 0.1], [tankX, tankY + side * 0.11, 0], OBSIDIAN_SHEEN);
    putBox(decor, [0.06, 0.022, 0.03], [tankX / 2, tankY + side * 0.06, 0], BRASS);
  }
  const gauge = putBox(decor, [0.008, 0.12, 0.03], [tankX - 0.046, tankY, 0], LAVA, true);
  decor.animate((time: number): void => {
    gauge.scale.y = 0.12 * (0.75 + Math.sin(time * 1.7) * 0.2);
  });
  const tip = decor.model.tip;
  if (!tip) {
    return;
  }
  const [x, y, z] = mouthOf(tip);
  const mouthY = decor.rest.y + y;
  hose(decor, [tankX, tankY - 0.11], [tankX, mouthY + 0.1], 0);
  hose(decor, [tankX, mouthY + 0.1], [decor.rest.x + x - 0.04, mouthY - 0.05], 0);
  decor.add([0.08, 0.04, 0.08], [x, y - 0.02, z], OBSIDIAN_SHEEN);
  decor.add([0.05, 0.06, 0.05], [x, y - 0.07, z], OBSIDIAN);
  decor.add([0.064, 0.016, 0.064], [x, y - 0.105, z], OBSIDIAN_SHEEN);
  flicker(decor, decor.add([0.02, 0.03, 0.02], [x, y - 0.13, z], PILOT, true), 0, 0.3);
  flicker(decor, decor.add([0.034, 0.055, 0.034], [x, y - 0.165, z], LAVA_HOT, true, 0.85), 1.7, 0.3);
  decor.add([0.016, 0.026, 0.016], [x, y - 0.16, z], FLAME_CORE, true);
  const half = tip.scale.x / 2;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      decor.add([0.02, 0.045, 0.02], [x + sx * (half - 0.015), y - 0.015, z + sz * (half - 0.015)], FANG);
    }
    const horn = decor.add([0.026, 0.08, 0.026], [x + sx * (half + 0.025), tip.position.y + 0.03, z], OBSIDIAN);
    horn.rotation.z = -sx * 0.6;
    decor.add([0.022, 0.012, 0.004], [x + sx * 0.03, tip.position.y + 0.01, z + half + 0.002], LAVA, true);
  }
};

/**
 * A ghostly muzzle: glowing see-through bands, a ring of ectoplasm at the
 * mouth, and ghost puffs drifting out of it.
 * @param decor The musket being decorated.
 */
const ghostMuzzle = (decor: VariantDecor): void => {
  for (const band of findBoxes(decor.model.parts, MUSKET_RING)) {
    swapBox(decor, band, { color: ECTO, glow: true, opacity: 0.7 });
  }
  const tip = decor.model.tip;
  if (!tip) {
    return;
  }
  const [x, y, z] = mouthOf(tip);
  decor.add([0.075, 0.016, 0.075], [x, y + 0.01, z], ECTO, true, 0.6);
  const puffs = [0, 1, 2].map((): Mesh => decor.add([0.04, 0.04, 0.04], [x, y, z], ECTO_PALE, true, 0.35));
  decor.animate((time: number): void => {
    puffs.forEach((puff: Mesh, i: number): void => {
      const k = (time * 0.6 + i / puffs.length) % 1;
      puff.position.set(x + Math.sin(time * 2 + i * 2) * 0.02 * k, y - 0.03 - k * 0.14, z + Math.cos(time * 1.7 + i) * 0.02 * k);
      puff.scale.setScalar(0.02 + 0.035 * Math.sin(Math.PI * k));
    });
  });
};

/**
 * The Ephemeral Musket: a half-there see-through barrel and a ghostly
 * muzzle.
 * @param decor The musket being decorated.
 */
const ephemeralMusket = (decor: VariantDecor): void => {
  const barrel = findBox(decor, BARREL);
  if (barrel) {
    swapBox(decor, barrel, { color: ECTO_DEEP, opacity: 0.55 });
  }
  ghostMuzzle(decor);
};

/**
 * The Ghostlock: a ghostly muzzle, a little bobbing ghost for the lock's
 * cock, green ghost-fire in the pan, and a spectral padlock swinging from
 * the trigger guard.
 * @param decor The musket being decorated.
 */
const ghostlock = (decor: VariantDecor): void => {
  ghostMuzzle(decor);
  const cock = findBox(decor, COCK);
  if (cock) {
    cock.visible = false;
    const ghost = new Group();
    ghost.position.set(cock.position.x + 0.01, cock.position.y + 0.015, cock.position.z);
    ghost.add(
      decor.box([0.04, 0.04, 0.035], [0, 0, 0], ECTO_PALE, true, 0.8),
      decor.box([0.026, 0.03, 0.026], [0, -0.03, 0], ECTO_PALE, true, 0.55),
      decor.box([0.004, 0.01, 0.008], [0.021, 0.005, -0.009], HOLLOW),
      decor.box([0.004, 0.01, 0.008], [0.021, 0.005, 0.009], HOLLOW),
    );
    decor.addToModel(ghost);
    const rest = ghost.position.y;
    decor.animate((time: number): void => {
      ghost.position.y = rest + Math.sin(time * 3) * 0.008;
      ghost.rotation.y = Math.sin(time * 1.4) * 0.3;
    });
  }
  const plate = findBox(decor, LOCK_PLATE);
  if (plate) {
    flicker(decor, putBox(decor, [0.02, 0.035, 0.02], [plate.position.x + 0.005, plate.position.y - 0.045, plate.position.z], ECTO, true), 0.8, 0.3);
  }
  const guard = findBox(decor, TRIGGER_GUARD);
  if (!guard) {
    return;
  }
  const lock = new Group();
  lock.position.set(guard.position.x, guard.position.y - 0.008, guard.position.z);
  lock.add(
    decor.box([0.008, 0.02, 0.008], [0, -0.012, 0], ECTO_PALE, true, 0.7),
    decor.box([0.008, 0.02, 0.008], [0, -0.03, 0], ECTO_PALE, true, 0.7),
    decor.box([0.034, 0.007, 0.008], [0, -0.042, 0], ECTO, true, 0.8),
    decor.box([0.007, 0.022, 0.007], [-0.014, -0.054, 0], ECTO, true, 0.8),
    decor.box([0.007, 0.022, 0.007], [0.014, -0.054, 0], ECTO, true, 0.8),
    decor.box([0.045, 0.04, 0.022], [0, -0.082, 0], ECTO_DEEP, false, 0.75),
    decor.box([0.008, 0.014, 0.004], [0, -0.084, 0.012], HOLLOW),
  );
  decor.addToModel(lock);
  decor.animate((time: number): void => {
    lock.rotation.z = Math.sin(time * 2.2) * 0.35;
    lock.rotation.x = Math.sin(time * 1.6 + 1) * 0.2;
  });
};

/**
 * The blunderbuss's (blood gun's) and musket's variants: a sulfurous
 * flared bell (Brimstone Blunderbuss), a demon-mouthed flamethrower with
 * a tank and nozzle (Hellmouth), a half-there barrel (Ephemeral Musket),
 * and a haunted lock (Ghostlock).
 */
export const GUN_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'blood-gun@brimstone1': brimstoneBlunderbuss,
  'blood-gun@brimstone2': hellmouth,
  'musket@ecto1': ephemeralMusket,
  'musket@ecto2': ghostlock,
};
