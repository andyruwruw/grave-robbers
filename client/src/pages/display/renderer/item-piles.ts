// Packages
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';
import { isBuildItem, isGearItem, itemKey } from '@halloween/shared/gear';
import { GOODS, RESOURCE_COLORS } from '@halloween/shared/items';

// Local Imports
import { toWorld } from './build-graveyard';
import { GROUND_POSE, buildGearModel } from './gear-models';

// Types
import type { GearItem } from '@halloween/shared/gear';
import type { Goods, ItemState } from '@halloween/shared/items';

const UNIT_BOX = new BoxGeometry(1, 1, 1);
const MAX_PIECES = 5;
const GLINT = '#fff6d8';

/**
 * A wrapped candy, as on the phone: yellow with orange twisted ends.
 */
const CANDY_BODY = '#f5c62e';
const CANDY_ENDS = '#f07a18';

/**
 * A blood drop hovers over every blood puddle, bobbing, so it reads as
 * something to pick up: its height (tiles), bob depth, and bob rate.
 */
const DROP_HEIGHT = 0.26;
const DROP_BOB = 0.04;
const DROP_RATE = 2.4;

/**
 * Gear on the ground glints now and then so it can be found in the dark:
 * how often (radians per second) and how high above the item.
 */
const GLINT_RATE = 3;
const GLINT_HEIGHT = 0.12;

/**
 * Blood is drawn bright so a pile reads in the dark.
 */
const BLOOD_GLOW = '#c8141f';

/**
 * Eye sockets of a skull in a pile of bones, a bright edge on silver, and
 * the lighter edge of a bloodsteel ingot.
 */
const SOCKET = '#1a1210';
const SILVER_SHINE = '#f4f8fc';
const BLOODSTEEL_EDGE = '#a8243a';
const VIAL_GLASS = '#a8bcc4';

/**
 * Things on the ground: resource piles (crisscrossed logs, a neat stack of
 * boards, grey chunks of stone, iron ingots, wrapped candies, a bundle of
 * bolts, pale bones and a skull, silver nuggets, bloodsteel ingots, green
 * tonic bottles, sized by how much they hold), single pieces of gear
 * laid flat with a twinkling glint, and crates of dropped structures. A
 * pile is only rebuilt when its contents change.
 */
export class ItemPiles {
  readonly group = new Group();
  private wood = new MeshLambertMaterial({ color: RESOURCE_COLORS.wood });
  private candyBody = new MeshLambertMaterial({ color: CANDY_BODY });
  private candyEnds = new MeshLambertMaterial({ color: CANDY_ENDS });
  private bolts = new MeshLambertMaterial({ color: RESOURCE_COLORS.bolts });
  private planks = new MeshLambertMaterial({ color: RESOURCE_COLORS.planks });
  private stone = new MeshLambertMaterial({ color: RESOURCE_COLORS.stone });
  private iron = new MeshLambertMaterial({ color: RESOURCE_COLORS.iron });
  private bone = new MeshLambertMaterial({ color: RESOURCE_COLORS.bone });
  private socket = new MeshLambertMaterial({ color: SOCKET });
  private silver = new MeshLambertMaterial({ color: RESOURCE_COLORS.silver });
  private silverShine = new MeshLambertMaterial({ color: SILVER_SHINE });
  private bloodsteel = new MeshLambertMaterial({ color: RESOURCE_COLORS.bloodsteel });
  private bloodsteelEdge = new MeshLambertMaterial({ color: BLOODSTEEL_EDGE });
  private vial = new MeshLambertMaterial({ color: VIAL_GLASS });
  private tonic = new MeshBasicMaterial({ color: RESOURCE_COLORS.tonic });
  private blood = new MeshBasicMaterial({ color: BLOOD_GLOW });
  private glint = new MeshBasicMaterial({ color: GLINT, transparent: true, depthWrite: false });
  private gearMaterials = new Map<string, MeshLambertMaterial | MeshBasicMaterial>();
  private glints: { mesh: Mesh; phase: number }[] = [];
  private bobbers: { group: Group; phase: number }[] = [];
  private piles = new Map<number, { pile: Group; key: string }>();

  /**
   * @param groundHeight - Ground height at a tile-space point, so piles
   *   dropped on a hill sit on top of it.
   */
  constructor(private groundHeight: (x: number, y: number) => number) {}

  set(items: ItemState[]): void {
    const seen = new Set<number>();
    for (const item of items) {
      seen.add(item.id);
      const key = item.held ? itemKey(item.held) : GOODS.map((g: Goods): number => item[g]).join(':');
      const existing = this.piles.get(item.id);
      if (existing?.key === key) {
        continue;
      }
      if (existing) {
        this.removePile(existing.pile);
      }
      const pile = item.held && isBuildItem(item.held) ? this.buildCrate(item) : item.held && isGearItem(item.held) ? this.buildGear(item.held, item) : this.buildPile(item);
      this.group.add(pile);
      this.piles.set(item.id, { pile, key });
    }
    for (const [id, { pile }] of this.piles) {
      if (!seen.has(id)) {
        this.removePile(pile);
        this.piles.delete(id);
      }
    }
  }

  /**
   * Twinkles the glints over gear and bobs the drops over blood, each on
   * its own beat.
   */
  update(time: number): void {
    for (const { group, phase } of this.bobbers) {
      group.position.y = DROP_HEIGHT + Math.sin(time * DROP_RATE + phase) * DROP_BOB;
      group.rotation.y = time * 1.2 + phase;
    }
    for (const { mesh, phase } of this.glints) {
      const k = Math.max(0, Math.sin(time * GLINT_RATE + phase));
      const flash = k ** 6;
      mesh.visible = flash > 0.02;
      mesh.scale.setScalar(0.03 + flash * 0.05);
      (mesh.material as MeshBasicMaterial).opacity = 0.35 + flash * 0.65;
    }
  }

  dispose(): void {
    this.wood.dispose();
    this.candyBody.dispose();
    this.candyEnds.dispose();
    this.bolts.dispose();
    this.planks.dispose();
    this.stone.dispose();
    this.iron.dispose();
    [this.bone, this.socket, this.silver, this.silverShine, this.bloodsteel, this.bloodsteelEdge, this.vial].forEach((m: MeshLambertMaterial): void => m.dispose());
    this.tonic.dispose();
    this.blood.dispose();
    this.glint.dispose();
    this.gearMaterials.forEach((m): void => m.dispose());
    this.glints.forEach(({ mesh }): void => (mesh.material as MeshBasicMaterial).dispose());
  }

  private removePile(pile: Group): void {
    this.group.remove(pile);
    this.bobbers = this.bobbers.filter(({ group }): boolean => group.parent !== pile);
    this.glints = this.glints.filter(({ mesh }): boolean => {
      if (mesh.parent === pile) {
        (mesh.material as MeshBasicMaterial).dispose();
        return false;
      }
      return true;
    });
  }

  /**
   * One piece of gear lying on the ground, turned by its id so a row of
   * drops doesn't line up.
   */
  private buildGear({ kind }: GearItem, item: ItemState): Group {
    const pile = new Group();
    const { x, z } = toWorld(item.x, item.y);
    pile.position.set(x, this.groundHeight(item.x, item.y), z);
    pile.rotation.y = (item.id * 2.39996) % (Math.PI * 2);
    const model = new Group();
    model.add(...buildGearModel(kind, (size, pos, color, glow = false): Mesh => {
      const key = `${color}:${glow}`;
      let material = this.gearMaterials.get(key);
      if (!material) {
        material = glow ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
        this.gearMaterials.set(key, material);
      }
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.scale.set(...size);
      mesh.position.set(...pos);
      mesh.castShadow = true;
      return mesh;
    }).parts);
    const pose = GROUND_POSE[kind];
    model.rotation.set(pose.rx, 0, pose.rz);
    model.position.set(...pose.offset);
    model.scale.setScalar(pose.scale);
    pile.add(model);
    const glint = new Mesh(UNIT_BOX, this.glint.clone());
    glint.position.set(0.05, GLINT_HEIGHT, 0.05);
    glint.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    pile.add(glint);
    this.glints.push({ mesh: glint, phase: item.id * 1.7 });
    return pile;
  }

  /**
   * A stack of structures someone dropped: a small strapped wooden crate
   * with the same glint as gear, since it's picked up with Grab too.
   */
  private buildCrate(item: ItemState): Group {
    const pile = new Group();
    const { x, z } = toWorld(item.x, item.y);
    pile.position.set(x, this.groundHeight(item.x, item.y), z);
    pile.rotation.y = (item.id * 2.39996) % (Math.PI * 2);
    const crate = new Mesh(UNIT_BOX, this.wood);
    crate.scale.set(0.34, 0.22, 0.28);
    crate.position.y = 0.11;
    crate.castShadow = true;
    pile.add(crate);
    for (const dx of [-0.1, 0.1]) {
      const strap = new Mesh(UNIT_BOX, this.bolts);
      strap.scale.set(0.04, 0.23, 0.29);
      strap.position.set(dx, 0.11, 0);
      pile.add(strap);
    }
    const glint = new Mesh(UNIT_BOX, this.glint.clone());
    glint.position.set(0.1, 0.26, 0);
    pile.add(glint);
    this.glints.push({ mesh: glint, phase: item.id * 1.7 });
    return pile;
  }

  private buildPile(item: ItemState): Group {
    const pile = new Group();
    const { x, z } = toWorld(item.x, item.y);
    pile.position.set(x, this.groundHeight(item.x, item.y), z);

    const logs = Math.min(Math.ceil(item.wood / 2), MAX_PIECES);
    for (let i = 0; i < logs; i++) {
      const log = new Mesh(UNIT_BOX, this.wood);
      const layer = Math.floor(i / 2);
      const across = layer % 2 === 1;
      const offset = (i % 2 === 0 ? -0.06 : 0.06);
      log.scale.set(across ? 0.09 : 0.36, 0.09, across ? 0.36 : 0.09);
      log.position.set(across ? offset : 0, 0.045 + layer * 0.09, across ? 0 : offset);
      log.castShadow = true;
      pile.add(log);
    }

    const candies = Math.min(Math.ceil(item.candy / 2), MAX_PIECES);
    for (let i = 0; i < candies; i++) {
      const candy = new Group();
      const body = new Mesh(UNIT_BOX, this.candyBody);
      body.scale.set(0.1, 0.06, 0.07);
      candy.add(body);
      const band = new Mesh(UNIT_BOX, this.candyEnds);
      band.scale.set(0.02, 0.062, 0.072);
      candy.add(band);
      for (const side of [-1, 1]) {
        const twist = new Mesh(UNIT_BOX, this.candyEnds);
        twist.scale.set(0.04, 0.04, 0.08);
        twist.position.x = side * 0.07;
        candy.add(twist);
      }
      const angle = (i / MAX_PIECES) * Math.PI * 2;
      candy.position.set(Math.cos(angle) * 0.15 + 0.06, 0.03 + (i === 0 ? 0.06 : 0), Math.sin(angle) * 0.15);
      candy.rotation.y = angle * 1.7;
      pile.add(candy);
    }

    const bolts = Math.min(Math.ceil(item.bolts / 3), MAX_PIECES);
    for (let i = 0; i < bolts; i++) {
      const bolt = new Mesh(UNIT_BOX, this.bolts);
      bolt.scale.set(0.3, 0.025, 0.025);
      bolt.position.set(-0.05, 0.02 + (i % 2) * 0.025, -0.12 + i * 0.05);
      bolt.rotation.y = (i - 2) * 0.12;
      pile.add(bolt);
    }

    const boards = Math.min(Math.ceil(item.planks / 2), MAX_PIECES);
    for (let i = 0; i < boards; i++) {
      const board = new Mesh(UNIT_BOX, this.planks);
      board.scale.set(0.38, 0.035, 0.11);
      board.position.set(-0.04 + (i % 2) * 0.02, 0.018 + i * 0.037, 0.13);
      board.rotation.y = (i % 2 ? 0.05 : -0.04);
      board.castShadow = true;
      pile.add(board);
    }

    const chunks = Math.min(Math.ceil(item.stone / 2), MAX_PIECES);
    for (let i = 0; i < chunks; i++) {
      const chunk = new Mesh(UNIT_BOX, this.stone);
      const s = 0.09 + ((item.id + i * 7) % 3) * 0.02;
      const angle = (i / MAX_PIECES) * Math.PI * 2 + item.id;
      chunk.scale.set(s, s * 0.8, s);
      chunk.position.set(0.1 + Math.cos(angle) * 0.08, s * 0.4 + (i === MAX_PIECES - 1 ? 0.06 : 0), -0.1 + Math.sin(angle) * 0.08);
      chunk.rotation.set(0, angle * 1.3, (i % 2) * 0.3);
      chunk.castShadow = true;
      pile.add(chunk);
    }

    const ingots = Math.min(item.iron, MAX_PIECES);
    for (let i = 0; i < ingots; i++) {
      const ingot = new Mesh(UNIT_BOX, this.iron);
      const layer = i < 3 ? 0 : 1;
      ingot.scale.set(0.07, 0.05, 0.18);
      ingot.position.set(-0.16 + (layer ? (i - 3.5) : (i - 1)) * 0.075, 0.025 + layer * 0.05, -0.08);
      ingot.castShadow = true;
      pile.add(ingot);
    }

    const bones = Math.min(item.bone, MAX_PIECES);
    for (let i = 0; i < bones; i++) {
      const bone = new Group();
      const shaft = new Mesh(UNIT_BOX, this.bone);
      shaft.scale.set(0.24, 0.035, 0.035);
      bone.add(shaft);
      for (const end of [-1, 1]) {
        const knob = new Mesh(UNIT_BOX, this.bone);
        knob.scale.set(0.045, 0.05, 0.075);
        knob.position.x = end * 0.12;
        bone.add(knob);
      }
      bone.position.set(-0.12 + (i % 2) * 0.03, 0.025 + Math.floor(i / 2) * 0.035, 0.08 + (i % 3) * 0.04);
      bone.rotation.y = item.id + i * 1.9;
      bone.castShadow = true;
      pile.add(bone);
    }
    if (item.bone >= 3) {
      const skull = new Group();
      const cranium = new Mesh(UNIT_BOX, this.bone);
      cranium.scale.set(0.12, 0.1, 0.11);
      const jaw = new Mesh(UNIT_BOX, this.bone);
      jaw.scale.set(0.08, 0.03, 0.07);
      jaw.position.set(0, -0.06, 0.02);
      skull.add(cranium, jaw);
      for (const side of [-1, 1]) {
        const eye = new Mesh(UNIT_BOX, this.socket);
        eye.scale.set(0.03, 0.028, 0.01);
        eye.position.set(side * 0.027, 0, 0.056);
        skull.add(eye);
      }
      skull.position.set(-0.04, 0.085, 0.16);
      skull.rotation.y = (item.id % 5) * 0.3 - 0.6;
      pile.add(skull);
    }

    const nuggets = Math.min(item.silver, MAX_PIECES);
    for (let i = 0; i < nuggets; i++) {
      const nugget = new Mesh(UNIT_BOX, i % 2 ? this.silverShine : this.silver);
      const s = 0.05 + ((item.id + i * 5) % 3) * 0.012;
      const angle = (i / MAX_PIECES) * Math.PI * 2 + item.id * 0.7;
      nugget.scale.set(s * 1.3, s * 0.8, s);
      nugget.position.set(0.04 + Math.cos(angle) * 0.07, s * 0.4 + (i === MAX_PIECES - 1 ? 0.04 : 0), -0.17 + Math.sin(angle) * 0.05);
      nugget.rotation.y = angle * 1.7;
      nugget.castShadow = true;
      pile.add(nugget);
    }

    const bars = Math.min(item.bloodsteel, MAX_PIECES);
    for (let i = 0; i < bars; i++) {
      const bar = new Mesh(UNIT_BOX, i % 2 ? this.bloodsteelEdge : this.bloodsteel);
      const layer = i < 3 ? 0 : 1;
      bar.scale.set(0.07, 0.05, 0.18);
      bar.position.set(0.2 + (layer ? (i - 3.5) : (i - 1)) * 0.075, 0.025 + layer * 0.05, 0.02);
      bar.castShadow = true;
      pile.add(bar);
    }

    const bottles = Math.min(item.tonic, MAX_PIECES);
    for (let i = 0; i < bottles; i++) {
      const angle = (i / MAX_PIECES) * Math.PI * 2 + item.id * 0.9;
      const bx = -0.16 + Math.cos(angle) * 0.08;
      const bz = 0.02 + Math.sin(angle) * 0.07;
      const glass = new Mesh(UNIT_BOX, this.vial);
      glass.scale.set(0.07, 0.09, 0.07);
      glass.position.set(bx, 0.045, bz);
      glass.castShadow = true;
      const brew = new Mesh(UNIT_BOX, this.tonic);
      brew.scale.set(0.058, 0.07, 0.058);
      brew.position.set(bx, 0.04, bz + 0.008);
      const neck = new Mesh(UNIT_BOX, this.vial);
      neck.scale.set(0.03, 0.04, 0.03);
      neck.position.set(bx, 0.11, bz);
      pile.add(glass, brew, neck);
    }

    const drops = Math.min(item.blood, MAX_PIECES);
    if (drops > 0) {
      const pool = new Mesh(UNIT_BOX, this.blood);
      pool.scale.set(0.16 + drops * 0.025, 0.012, 0.12 + drops * 0.02);
      pool.position.set(0.12, 0.006, 0.12);
      pile.add(pool);
    }
    for (let i = 0; i < drops; i++) {
      const drop = new Mesh(UNIT_BOX, this.blood);
      const angle = item.id * 1.3 + i * 2.1;
      drop.scale.set(0.05, 0.06, 0.05);
      drop.position.set(0.12 + Math.cos(angle) * 0.13, 0.03, 0.12 + Math.sin(angle) * 0.1);
      pile.add(drop);
    }
    if (drops > 0) {
      const hover = new Group();
      for (const [w, y] of [[0.05, 0], [0.08, 0.035], [0.07, 0.07], [0.045, 0.1], [0.022, 0.125]] as const) {
        const layer = new Mesh(UNIT_BOX, this.blood);
        layer.scale.set(w, 0.035, w);
        layer.position.y = y;
        hover.add(layer);
      }
      hover.position.set(0.12, DROP_HEIGHT, 0.12);
      pile.add(hover);
      this.bobbers.push({ group: hover, phase: item.id * 1.7 });
    }
    return pile;
  }
}
