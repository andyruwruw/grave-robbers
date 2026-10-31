// Packages
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';

// Local Imports
import { UNIT_BOX } from '../avatars/config/avatar';
import { createMonsterAvatar } from '../avatars/monsters/create-monster-avatar';
import { BLOOD_POOL, FOUNTAIN_GLOW } from '../graveyard/config/palette/props';
import { toWorld } from '../space/world-coords';
import {
  BOB_HEIGHT,
  BOB_SPEED,
  BOB_TILT,
  HEAD_SCALE,
  HEAD_SINK,
  HEAD_Z,
  POOL_Y,
} from './config/fountain-victims';

// Types
import type { VictimState } from '@halloween/shared/protocol/state/world-state';
import type { MonsterAvatar } from '../avatars/monsters/monster-avatar';
import type { LightMap } from '../lighting/light-map';

/**
 * A size or position: x, y, z.
 */
type Vec3 = [number, number, number];

/**
 * One fountain's catch on the TV: the blood filling its basin and the
 * victim's head floating in it.
 */
interface Catch {
  /**
   * The caught monster's id.
   */
  id: number;

  /**
   * The avatar the head was taken from (disposed with it).
   */
  avatar: MonsterAvatar;

  /**
   * The blood and the head, placed on the fountain.
   */
  root: Group;

  /**
   * Holds the head, bobbed each frame.
   */
  float: Group;

  /**
   * Where in its bob it starts.
   */
  phase: number;
}

/**
 * Blood fountains' victims: a fountain's basin stays dry (see
 * `BloodFountainPainter`) until it catches a monster, then fills with
 * blood and the victim's own head (built like its avatar's) bobs in it.
 */
export class FountainVictims {
  /**
   * Every fountain's blood and head.
   */
  readonly group = new Group();

  /**
   * Each fountain's catch, by tile index.
   */
  private _catches = new Map<number, Catch>();

  /**
   * The blood's material, made with the first catch.
   */
  private _blood: MeshLambertMaterial | null = null;

  /**
   * The blood's glow, made with the first catch.
   */
  private _glow: MeshBasicMaterial | null = null;

  /**
   * Keeps the light map that darkens the blood and heads.
   * @param _lightMap The scene's light map.
   */
  constructor(private readonly _lightMap: LightMap) {}

  /**
   * Shows each victim's head in its fountain (only while its monster is
   * still around), drops the rest, and bobs the heads.
   * @param victims Every fountain's victim.
   * @param monsters Every monster's avatar, by id.
   * @param mapWidth The map's width, to place fountains.
   * @param elevation The ground height at a tile-space point.
   * @param time Seconds since the renderer started.
   */
  update(victims: VictimState[], monsters: Map<number, MonsterAvatar>, mapWidth: number, elevation: (x: number, y: number) => number, time: number): void {
    const seen = new Set<number>();
    for (const { i, id } of victims) {
      const monster = monsters.get(id);
      if (!monster) {
        continue;
      }
      seen.add(i);
      let caught = this._catches.get(i);
      if (caught && caught.id !== id) {
        this.drop(i, caught);
        caught = undefined;
      }
      if (!caught) {
        const tx = i % mapWidth;
        const ty = Math.floor(i / mapWidth);
        caught = this.build(monster, tx, ty, elevation(tx + 0.5, ty + 0.5), i);
        this._catches.set(i, caught);
      }
      const t = time * BOB_SPEED + caught.phase;
      caught.float.position.y = POOL_Y - HEAD_SINK + Math.sin(t) * BOB_HEIGHT;
      caught.float.rotation.set(Math.sin(t * 0.7) * BOB_TILT, -Math.PI / 2 + Math.sin(t * 0.45) * BOB_TILT * 2, Math.cos(t) * BOB_TILT * 0.5);
    }
    for (const [i, caught] of this._catches) {
      if (!seen.has(i)) {
        this.drop(i, caught);
      }
    }
  }

  /**
   * Frees every head and the blood's materials.
   */
  dispose(): void {
    for (const [i, caught] of this._catches) {
      this.drop(i, caught);
    }
    this._blood?.dispose();
    this._glow?.dispose();
  }

  /**
   * Fills a fountain with blood and floats a head built like the
   * monster's avatar in it.
   * @param monster The victim's avatar.
   * @param tx The fountain's tile column.
   * @param ty The fountain's tile row.
   * @param height The ground height there.
   * @param i The fountain's tile index (seeds its bob).
   * @returns The catch.
   */
  private build(monster: MonsterAvatar, tx: number, ty: number, height: number, i: number): Catch {
    const { x, z } = toWorld(tx + 0.5, ty + 0.5);
    const root = new Group();
    root.position.set(x, height, z);
    const blood = this._blood ?? (this._blood = new MeshLambertMaterial({ color: BLOOD_POOL }));
    const glow = this._glow ?? (this._glow = new MeshBasicMaterial({ color: FOUNTAIN_GLOW }));
    const pieces: [Vec3, Vec3, MeshLambertMaterial | MeshBasicMaterial][] = [
      [[0.7, 0.02, 0.7], [0, POOL_Y, 0], blood],
      [[0.3, 0.005, 0.3], [0, POOL_Y + 0.015, 0], glow],
      [[0.24, 0.02, 0.24], [0, 1.1, 0], blood],
      [[0.03, 0.18, 0.03], [0.13, 0.9, 0], glow],
    ];
    for (const [size, pos, material] of pieces) {
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.scale.set(...size);
      mesh.position.set(...pos);
      root.add(mesh);
    }
    const avatar = createMonsterAvatar({ ...monster.target, x: 0, y: 0, facing: 0, held: null, lifted: false });
    const head = avatar.head;
    head.position.set(0, 0, 0);
    head.rotation.set(0, 0, 0);
    const float = new Group();
    float.position.z = HEAD_Z;
    float.scale.setScalar(HEAD_SCALE);
    float.add(head);
    root.add(float);
    this._lightMap.darken(root);
    this.group.add(root);
    return { id: monster.target.id, avatar, root, float, phase: i * 1.7 };
  }

  /**
   * Takes a fountain's blood and head away.
   * @param i The fountain's tile index.
   * @param caught Its catch.
   */
  private drop(i: number, caught: Catch): void {
    this.group.remove(caught.root);
    caught.avatar.dispose();
    this._catches.delete(i);
  }
}
