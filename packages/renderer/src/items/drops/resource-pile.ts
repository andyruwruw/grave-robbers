// Packages
import { Group, Mesh } from 'three';

// Local Imports
import { materialModel } from '../../models/items/material-models';
import { DROP_HEIGHT, MAX_PIECES, MODELED } from '../config/piles';
import { GroundDrop } from './ground-drop';

// Types
import type { Material } from '@halloween/shared/goods/goods';
import type { ItemState } from '@halloween/shared/goods/ground-items';

/**
 * A pile of resources on the ground: crisscrossed logs, a neat stack of
 * boards, grey chunks of stone, iron ingots, wrapped candies, a bundle of
 * bolts, pale bones and a skull, silver nuggets, bloodsteel ingots, green
 * tonic bottles and a pool of blood with a bobbing drop, each sized by how
 * much it holds, plus the bag model of anything without a heap of its own.
 */
export class ResourcePile extends GroundDrop {
  /**
   * Builds the pile.
   * @param item The item on the ground (holding goods).
   * @returns The drop's group.
   */
  build(item: ItemState): Group {
    const materials = this._ctx.materials;
    const pile = this.place(item);

    const logs = Math.min(Math.ceil(item.wood / 2), MAX_PIECES);
    for (let i = 0; i < logs; i++) {
      const log = new Mesh(this._unitBox, materials.wood);
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
      const body = new Mesh(this._unitBox, materials.candyBody);
      body.scale.set(0.1, 0.06, 0.07);
      candy.add(body);
      const band = new Mesh(this._unitBox, materials.candyEnds);
      band.scale.set(0.02, 0.062, 0.072);
      candy.add(band);
      for (const side of [-1, 1]) {
        const twist = new Mesh(this._unitBox, materials.candyEnds);
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
      const bolt = new Mesh(this._unitBox, materials.bolts);
      bolt.scale.set(0.3, 0.025, 0.025);
      bolt.position.set(-0.05, 0.02 + (i % 2) * 0.025, -0.12 + i * 0.05);
      bolt.rotation.y = (i - 2) * 0.12;
      pile.add(bolt);
    }

    const boards = Math.min(Math.ceil(item.planks / 2), MAX_PIECES);
    for (let i = 0; i < boards; i++) {
      const board = new Mesh(this._unitBox, materials.planks);
      board.scale.set(0.38, 0.035, 0.11);
      board.position.set(-0.04 + (i % 2) * 0.02, 0.018 + i * 0.037, 0.13);
      board.rotation.y = (i % 2 ? 0.05 : -0.04);
      board.castShadow = true;
      pile.add(board);
    }

    const chunks = Math.min(Math.ceil(item.stone / 2), MAX_PIECES);
    for (let i = 0; i < chunks; i++) {
      const chunk = new Mesh(this._unitBox, materials.stone);
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
      const ingot = new Mesh(this._unitBox, materials.iron);
      const layer = i < 3 ? 0 : 1;
      ingot.scale.set(0.07, 0.05, 0.18);
      ingot.position.set(-0.16 + (layer ? (i - 3.5) : (i - 1)) * 0.075, 0.025 + layer * 0.05, -0.08);
      ingot.castShadow = true;
      pile.add(ingot);
    }

    const bones = Math.min(item.bone, MAX_PIECES);
    for (let i = 0; i < bones; i++) {
      const bone = new Group();
      const shaft = new Mesh(this._unitBox, materials.bone);
      shaft.scale.set(0.24, 0.035, 0.035);
      bone.add(shaft);
      for (const end of [-1, 1]) {
        const knob = new Mesh(this._unitBox, materials.bone);
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
      const cranium = new Mesh(this._unitBox, materials.bone);
      cranium.scale.set(0.12, 0.1, 0.11);
      const jaw = new Mesh(this._unitBox, materials.bone);
      jaw.scale.set(0.08, 0.03, 0.07);
      jaw.position.set(0, -0.06, 0.02);
      skull.add(cranium, jaw);
      for (const side of [-1, 1]) {
        const eye = new Mesh(this._unitBox, materials.socket);
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
      const nugget = new Mesh(this._unitBox, i % 2 ? materials.silverShine : materials.silver);
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
      const bar = new Mesh(this._unitBox, i % 2 ? materials.bloodsteelEdge : materials.bloodsteel);
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
      const glass = new Mesh(this._unitBox, materials.vial);
      glass.scale.set(0.07, 0.09, 0.07);
      glass.position.set(bx, 0.045, bz);
      glass.castShadow = true;
      const brew = new Mesh(this._unitBox, materials.tonic);
      brew.scale.set(0.058, 0.07, 0.058);
      brew.position.set(bx, 0.04, bz + 0.008);
      const neck = new Mesh(this._unitBox, materials.vial);
      neck.scale.set(0.03, 0.04, 0.03);
      neck.position.set(bx, 0.11, bz);
      pile.add(glass, brew, neck);
    }

    const drops = Math.min(item.blood, MAX_PIECES);
    if (drops > 0) {
      const pool = new Mesh(this._unitBox, materials.blood);
      pool.scale.set(0.16 + drops * 0.025, 0.012, 0.12 + drops * 0.02);
      pool.position.set(0.12, 0.056, 0.12);
      pile.add(pool);
    }
    for (let i = 0; i < drops; i++) {
      const drop = new Mesh(this._unitBox, materials.blood);
      const angle = item.id * 1.3 + i * 2.1;
      drop.scale.set(0.05, 0.06, 0.05);
      drop.position.set(0.12 + Math.cos(angle) * 0.13, 0.08, 0.12 + Math.sin(angle) * 0.1);
      pile.add(drop);
    }
    if (drops > 0) {
      const hover = new Group();
      for (const [w, y] of [[0.05, 0], [0.08, 0.035], [0.07, 0.07], [0.045, 0.1], [0.022, 0.125]] as const) {
        const layer = new Mesh(this._unitBox, materials.blood);
        layer.scale.set(w, 0.035, w);
        layer.position.y = y;
        hover.add(layer);
      }
      hover.position.set(0.12, DROP_HEIGHT, 0.12);
      pile.add(hover);
      this._ctx.animations.addBobber(hover, item.id * 1.7);
    }
    MODELED.filter((m: Material): boolean => item[m] > 0).forEach((m: Material, i: number): void => {
      const heap = new Group();
      heap.add(...materialModel(m, materials.boxes.box));
      const angle = item.id * 0.8 + i * 2.2;
      heap.position.set(Math.cos(angle) * 0.14, 0, Math.sin(angle) * 0.14);
      heap.rotation.y = angle;
      pile.add(heap);
    });
    return pile;
  }
}
