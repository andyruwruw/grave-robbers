// Packages
import { Group, Mesh, MeshBasicMaterial } from 'three';

// Local Imports
import {
  ARROW_BOX,
  ARROW_FLETCH,
  ARROW_SHAFT,
  ECTO_CORE,
  ECTO_CORE_BOX,
  ECTO_HALO,
  ECTO_HALO_BOX,
  FLETCH_BOX,
  GOB_BOX,
  GOB_COLOR,
  POTION_BOX,
  POTION_GLASS,
  POTION_GLOW,
  POTION_NECK_BOX,
  SHOT_BOX,
  SHOT_COLOR,
  SMEAR_BOX,
  SMEAR_COLOR,
} from './config/projectiles';

// Types
import type { ShotSlot } from '../../types/effects';

/**
 * The materials every shot in flight is drawn with, and the meshes of one
 * pooled shot slot.
 */
export class ProjectileMaterials {
  /**
   * A crossbow bolt's pale streak.
   */
  readonly shot = new MeshBasicMaterial({ color: SHOT_COLOR });

  /**
   * A gob of blood.
   */
  readonly gob = new MeshBasicMaterial({ color: GOB_COLOR });

  /**
   * The darker smear a gob of blood trails.
   */
  readonly smear = new MeshBasicMaterial({ color: SMEAR_COLOR });

  /**
   * An arrow's dark shaft.
   */
  readonly arrow = new MeshBasicMaterial({ color: ARROW_SHAFT });

  /**
   * An arrow's pale fletching.
   */
  readonly fletch = new MeshBasicMaterial({ color: ARROW_FLETCH });

  /**
   * A potion's glowing flask.
   */
  readonly potionGlow = new MeshBasicMaterial({ color: POTION_GLOW });

  /**
   * A potion's glass neck.
   */
  readonly potionGlass = new MeshBasicMaterial({ color: POTION_GLASS });

  /**
   * Ectoplasm's pale glowing core.
   */
  readonly ectoCore = new MeshBasicMaterial({ color: ECTO_CORE });

  /**
   * Ectoplasm's see-through halo.
   */
  readonly ectoHalo = new MeshBasicMaterial({ color: ECTO_HALO, transparent: true, opacity: 0.35, depthWrite: false });

  /**
   * Builds one hidden shot slot: a bolt, a gob with its smear, a ball of
   * ectoplasm, an arrow, and a potion.
   * @returns The slot's meshes.
   */
  buildSlot(): ShotSlot {
    const bolt = new Mesh(SHOT_BOX, this.shot);
    const gob = new Group();
    const smear = new Mesh(SMEAR_BOX, this.smear);
    smear.position.x = -0.16;
    gob.add(new Mesh(GOB_BOX, this.gob), smear);
    const ecto = new Group();
    ecto.add(new Mesh(ECTO_CORE_BOX, this.ectoCore), new Mesh(ECTO_HALO_BOX, this.ectoHalo));
    const arrow = new Group();
    const fletch = new Mesh(FLETCH_BOX, this.fletch);
    fletch.position.x = -0.19;
    arrow.add(new Mesh(ARROW_BOX, this.arrow), fletch);
    const potion = new Group();
    const neck = new Mesh(POTION_NECK_BOX, this.potionGlass);
    neck.position.y = 0.09;
    potion.add(new Mesh(POTION_BOX, this.potionGlow), neck);
    bolt.visible = false;
    gob.visible = false;
    ecto.visible = false;
    arrow.visible = false;
    potion.visible = false;
    return { bolt, gob, ecto, arrow, potion };
  }

  /**
   * Frees the materials the renderer has always freed (the arrow, fletching,
   * and potion materials are left as they were).
   */
  dispose(): void {
    this.shot.dispose();
    this.gob.dispose();
    this.ectoCore.dispose();
    this.ectoHalo.dispose();
    this.smear.dispose();
  }
}
