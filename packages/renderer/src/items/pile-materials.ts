// Packages
import {
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';
import { RESOURCE_COLORS } from '@halloween/shared/goods/goods-display';

// Local Imports
import { SharedBoxFactory } from '../models/shared-box-factory';
import {
  BLOODSTEEL_EDGE,
  BLOOD_GLOW,
  CANDY_BODY,
  CANDY_ENDS,
  GLINT,
  SILVER_SHINE,
  SOCKET,
  VIAL_GLASS,
} from './config/piles';

/**
 * The materials ground drops share: one per resource and detail, the glint
 * every glint clones, and a box factory for gear and material models.
 */
export class PileMaterials {
  /**
   * Logs and crates.
   */
  readonly wood = new MeshLambertMaterial({ color: RESOURCE_COLORS.wood });

  /**
   * Candy wrappers.
   */
  readonly candyBody = new MeshLambertMaterial({ color: CANDY_BODY });

  /**
   * Candy bands and twisted ends.
   */
  readonly candyEnds = new MeshLambertMaterial({ color: CANDY_ENDS });

  /**
   * Bolts and crate straps.
   */
  readonly bolts = new MeshLambertMaterial({ color: RESOURCE_COLORS.bolts });

  /**
   * Boards.
   */
  readonly planks = new MeshLambertMaterial({ color: RESOURCE_COLORS.planks });

  /**
   * Stone chunks.
   */
  readonly stone = new MeshLambertMaterial({ color: RESOURCE_COLORS.stone });

  /**
   * Iron ingots.
   */
  readonly iron = new MeshLambertMaterial({ color: RESOURCE_COLORS.iron });

  /**
   * Bones and the skull.
   */
  readonly bone = new MeshLambertMaterial({ color: RESOURCE_COLORS.bone });

  /**
   * The skull's eye sockets.
   */
  readonly socket = new MeshLambertMaterial({ color: SOCKET });

  /**
   * Silver nuggets.
   */
  readonly silver = new MeshLambertMaterial({ color: RESOURCE_COLORS.silver });

  /**
   * Shiny silver nuggets.
   */
  readonly silverShine = new MeshLambertMaterial({ color: SILVER_SHINE });

  /**
   * Bloodsteel ingots.
   */
  readonly bloodsteel = new MeshLambertMaterial({ color: RESOURCE_COLORS.bloodsteel });

  /**
   * Bloodsteel ingots' lighter edge.
   */
  readonly bloodsteelEdge = new MeshLambertMaterial({ color: BLOODSTEEL_EDGE });

  /**
   * Tonic bottle glass.
   */
  readonly vial = new MeshLambertMaterial({ color: VIAL_GLASS });

  /**
   * The glowing tonic inside.
   */
  readonly tonic = new MeshBasicMaterial({ color: RESOURCE_COLORS.tonic });

  /**
   * Blood, bright so it reads in the dark.
   */
  readonly blood = new MeshBasicMaterial({ color: BLOOD_GLOW });

  /**
   * The glint every glint clones.
   */
  readonly glint = new MeshBasicMaterial({ color: GLINT, transparent: true, depthWrite: false });

  /**
   * Boxes for gear and material models, sharing one material per color.
   */
  readonly boxes = new SharedBoxFactory(true);

  /**
   * Frees every material, then the box factory's.
   */
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
    this.boxes.dispose();
  }
}
