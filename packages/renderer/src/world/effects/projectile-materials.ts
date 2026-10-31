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
  FIRE_ARROW_COLORS,
  FIRE_HEAD_BOX,
  FIRE_TAIL_BOX,
  FLETCH_BOX,
  GHOST_BULLET_COLORS,
  GHOST_CORE_BOX,
  GHOST_HALO_BOX,
  GHOST_WISP_BOX,
  GLAIVE_BLADE_BOX,
  GLAIVE_COLORS,
  GLAIVE_CORE_BOX,
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
  SPIRIT_ARROW_COLORS,
  SPIRIT_HEAD_BOX,
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
   * A thrown glaive's steel blades.
   */
  readonly glaiveBlade = new MeshBasicMaterial({ color: GLAIVE_COLORS.blade });

  /**
   * A thrown glaive's glowing hex core.
   */
  readonly glaiveCore = new MeshBasicMaterial({ color: GLAIVE_COLORS.core });

  /**
   * A fire arrow's burning head.
   */
  readonly fireHead = new MeshBasicMaterial({ color: FIRE_ARROW_COLORS.head });

  /**
   * A fire arrow's flickering tail.
   */
  readonly fireTail = new MeshBasicMaterial({ color: FIRE_ARROW_COLORS.tail, transparent: true, opacity: 0.85, depthWrite: false });

  /**
   * A fire arrow's last, darker lick of tail.
   */
  readonly fireEmber = new MeshBasicMaterial({ color: FIRE_ARROW_COLORS.ember, transparent: true, opacity: 0.6, depthWrite: false });

  /**
   * A spirit arrow's see-through shaft and fletching.
   */
  readonly spiritShaft = new MeshBasicMaterial({ color: SPIRIT_ARROW_COLORS.shaft, transparent: true, opacity: 0.5, depthWrite: false });

  /**
   * A spirit arrow's glowing head.
   */
  readonly spiritHead = new MeshBasicMaterial({ color: SPIRIT_ARROW_COLORS.head });

  /**
   * A ghost bullet's pale core.
   */
  readonly ghostCore = new MeshBasicMaterial({ color: GHOST_BULLET_COLORS.core });

  /**
   * A ghost bullet's see-through halo and wisp.
   */
  readonly ghostHalo = new MeshBasicMaterial({ color: GHOST_BULLET_COLORS.halo, transparent: true, opacity: 0.35, depthWrite: false });

  /**
   * Builds one hidden shot slot: a bolt, a gob with its smear, a ball of
   * ectoplasm, an arrow, a potion, and the infused weapons' shots (a
   * glaive, a fire arrow, a spirit arrow, and a ghost bullet).
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
    const slot = { bolt, gob, ecto, arrow, potion, ...this.buildInfused() };
    for (const mesh of Object.values(slot)) {
      mesh.visible = false;
    }
    return slot;
  }

  /**
   * Builds the infused weapons' shot meshes for one slot.
   * @returns The glaive, fire arrow, spirit arrow, and ghost bullet.
   */
  private buildInfused(): Pick<ShotSlot, 'glaive' | 'fireArrow' | 'spiritArrow' | 'ghostBullet'> {
    const glaive = new Group();
    const across = new Mesh(GLAIVE_BLADE_BOX, this.glaiveBlade);
    across.rotation.y = Math.PI / 2;
    glaive.add(new Mesh(GLAIVE_BLADE_BOX, this.glaiveBlade), across, new Mesh(GLAIVE_CORE_BOX, this.glaiveCore));
    const fireArrow = new Group();
    const head = new Mesh(FIRE_HEAD_BOX, this.fireHead);
    head.position.x = 0.2;
    const tail = new Mesh(FIRE_TAIL_BOX, this.fireTail);
    tail.position.x = -0.3;
    const ember = new Mesh(FIRE_TAIL_BOX, this.fireEmber);
    ember.position.x = -0.48;
    ember.scale.setScalar(0.6);
    fireArrow.add(new Mesh(ARROW_BOX, this.arrow), head, tail, ember);
    const spiritArrow = new Group();
    const spiritFletch = new Mesh(FLETCH_BOX, this.spiritShaft);
    spiritFletch.position.x = -0.19;
    const spiritHead = new Mesh(SPIRIT_HEAD_BOX, this.spiritHead);
    spiritHead.position.x = 0.2;
    spiritArrow.add(new Mesh(ARROW_BOX, this.spiritShaft), spiritFletch, spiritHead);
    const ghostBullet = new Group();
    const wisp = new Mesh(GHOST_WISP_BOX, this.ghostHalo);
    wisp.position.x = -0.18;
    ghostBullet.add(new Mesh(GHOST_CORE_BOX, this.ghostCore), new Mesh(GHOST_HALO_BOX, this.ghostHalo), wisp);
    return { glaive, fireArrow, spiritArrow, ghostBullet };
  }

  /**
   * Frees the materials the renderer has always freed (the arrow, fletching,
   * and potion materials are left as they were) and the infused shots'.
   */
  dispose(): void {
    this.shot.dispose();
    this.gob.dispose();
    this.ectoCore.dispose();
    this.ectoHalo.dispose();
    this.smear.dispose();
    for (const m of [this.glaiveBlade, this.glaiveCore, this.fireHead, this.fireTail, this.fireEmber, this.spiritShaft, this.spiritHead, this.ghostCore, this.ghostHalo]) {
      m.dispose();
    }
  }
}
