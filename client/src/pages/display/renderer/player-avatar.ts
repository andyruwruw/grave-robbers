// Packages
import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Vector3,
} from 'three';
import { GEAR, GEAR_KINDS } from '@halloween/shared/gear';
import { MAX_HP, PLAYER_SPEED, STRIKE_DELAY } from '@halloween/shared/players';
import { STRUCTURE_KINDS } from '@halloween/shared/structures';

// Local Imports
import { toWorld } from './build-graveyard';
import { buildGearModel, buildLantern } from './gear-models';

// Types
import type { Material } from 'three';
import type { GearKind } from '@halloween/shared/gear';
import type { PlayerState } from '@halloween/shared/protocol';
import type { StructureKind } from '@halloween/shared/structures';

const UNIT_BOX = new BoxGeometry(1, 1, 1);

/**
 * The haze around a player slowed by ectoplasm: a green tint, a flicker,
 * and wisps circling them.
 */
const HAZE_COLOR = new Color('#45ffb0');
const HAZE_WISPS = 6;
const HAZE_FADE = 4;

/**
 * Jumping off a ledge: a hop over JUMP_TIME seconds, tucked, arms up, then
 * a squash on landing.
 */
const JUMP_TIME = 0.55;

/**
 * How fast a player whose phone went away slumps down (and gets back up),
 * per second.
 */
const SLUMP_SPEED = 2.5;
const JUMP_HOP = 0.45;
const LAND_TIME = 0.16;
const SKIN = '#e9d3b4';
const DARK = '#15151b';
const TROUSERS = '#2a2a33';
const BOOT = '#1c1611';
const BELT = '#3b2a1c';
const BUCKLE = '#c9a94a';
const TUNIC = '#3a3340';

/**
 * Overall character scale relative to a tile.
 */
const AVATAR_SCALE = 1.3;

/**
 * Screen-anchor height for the name label, in world units.
 */
export const LABEL_HEIGHT = 1.12 * AVATAR_SCALE;

/**
 * Axe swing (fits inside the 0.5s attack cooldown): total duration, and
 * where the wind-up, the hang at the top, the strike, and the held impact
 * end (as fractions of the swing). The strike lands when the server
 * applies the hit.
 */
const SWING_TIME = 0.44;
const WINDUP_END = 0.28;
const HANG_END = 0.38;
const STRIKE_END = STRIKE_DELAY / SWING_TIME;
const IMPACT_END = 0.62;

/**
 * Key poses of the axe arm: the shoulder angle (radians forward from
 * hanging straight down) and the wrist angle (the axe's tilt from the
 * forearm). At rest the axe is held upright in front; raised, the arm is up
 * and back with the axe hanging behind; at impact the arm is forward and
 * the wrist has snapped the axe out past horizontal.
 */
const POSE_REST = { shoulder: 0.25, wrist: 1.9 };
const POSE_RAISED = { shoulder: 3.5, wrist: 2 };
const POSE_IMPACT = { shoulder: 1, wrist: 0.35 };

/**
 * Guns (the crossbow and the blunderbuss) are held level in front instead,
 * and kick up when they fire (over SHOT_TIME seconds).
 */
const POSE_AIM = { shoulder: 1.45, wrist: 0.12 };
const SHOT_TIME = 0.3;
const SHOT_KICK = 0.55;

/**
 * Off-hand arm angle: hanging with the lantern, raised high with a torch,
 * forearm forward behind a shield.
 */
const ARM_TORCH = 2.2;
const ARM_SHIELD = 1.15;

/**
 * The shield arm raised to block, and how fast it gets there.
 */
const ARM_BLOCK = 1.75;
const BLOCK_RATE = 14;

/**
 * A head (or other blocky part) with its edges trimmed: three overlapping
 * boxes, wide, deep, and tall, so the silhouette reads rounded in pixels.
 */
function roundedBox(
  box: (size: [number, number, number], pos: [number, number, number], color: string) => Mesh,
  [w, h, d]: [number, number, number],
  pos: [number, number, number],
  color: string,
): Mesh[] {
  return [
    box([w, h * 0.7, d * 0.78], pos, color),
    box([w * 0.78, h * 0.7, d], pos, color),
    box([w * 0.84, h, d * 0.84], pos, color),
  ];
}

/**
 * The streak the axe blade leaves through the air during the strike: pool
 * size, how long each bit lingers, its size (world units), and how many bits
 * fill the gap between frames so the streak stays solid.
 */
const TRAIL_POOL = 48;
const TRAIL_LIFE = 0.24;
const TRAIL_SIZE = 0.22;
const TRAIL_STEPS = 6;

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);
const easeIn = (t: number): number => t * t * t;
const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));

/**
 * Rough silhouette (width, height, depth) of each structure for the build
 * preview.
 */
const GHOST_SHAPES: Record<StructureKind, [number, number, number]> = {
  'wood-wall': [1, 1.1, 0.3],
  'stone-wall': [1, 0.9, 0.9],
  'palisade': [1, 1.35, 0.34],
  'door': [1, 1.1, 0.14],
  'wood-fence': [1, 0.75, 0.12],
  'spikes': [0.84, 0.35, 0.84],
  'iron-spikes': [0.86, 0.45, 0.86],
  'barbed-wire': [1, 0.6, 0.2],
  'ghost-lamp': [0.3, 1.6, 0.3],
  'soul-fire': [0.95, 0.35, 0.95],
  'effigy': [0.7, 1.5, 0.4],
  'obelisk': [0.45, 1.95, 0.45],
  'blood-fountain': [0.85, 1.05, 0.85],
  'soul-cage': [0.7, 1.25, 0.7],
  'mirror': [0.75, 1.45, 0.16],
  'scarecrow': [0.95, 1.6, 0.3],
  'torch': [0.2, 1.05, 0.2],
  'lantern': [0.3, 1.55, 0.3],
  'campfire': [0.9, 0.3, 0.9],
  'platform': [1, 0.75, 1],
  'steps': [1, 0.4, 1],
  'research-table': [0.9, 0.75, 0.6],
  'sawmill': [0.95, 0.7, 0.6],
  'furnace': [0.8, 1.45, 0.75],
  'altar': [0.96, 1.2, 0.86],
  'bloodforge': [0.9, 1.5, 0.84],
  'sifter': [1, 0.7, 0.6],
  'sentry': [0.8, 1.15, 0.8],
  'digger': [0.6, 1.25, 0.6],
  'bone-wall': [1, 1.2, 0.46],
  'coffin': [0.55, 0.32, 0.92],
  'bell': [0.96, 1.45, 0.25],
  'cauldron': [0.8, 0.75, 0.8],
};

/**
 * The build preview: a dim white outline and see-through shape where the
 * structure would go, light red (along with whatever is in the way) when it
 * can't go there.
 */
const PLACE_OK = '#ffffff';
const PLACE_BLOCKED = '#ff8a8a';
const UNIT_EDGES = new EdgesGeometry(new BoxGeometry(1, 1, 1));
const HEALTH_FILL = '#e5484d';
const WOUND_FILL = '#6e6e76';
const HURT_COLOR = '#ff2020';

/**
 * How long a hit flashes the body red, and how spawn protection pulses: the
 * body dims and recovers a couple of times a second (never see-through,
 * since the overlapping boxes flicker when drawn transparent, and never
 * brighter, so it doesn't strobe under bloom).
 */
const HURT_FLASH_TIME = 0.18;
const PROTECTION_PULSE_RATE = 2;
const PROTECTION_DIM = 0.45;

/**
 * Running posture: how fast the measured velocity is smoothed (per second),
 * how far the torso tips forward at full speed and sideways when moving
 * across the facing (radians, from the hips), how high the hips sit, and how
 * hard the arms pump.
 */
const RUN_SMOOTHING = 9;
const RUN_LEAN = 0.38;
const SIDE_LEAN = 0.22;
const HIP_HEIGHT = 0.25;
const ARM_PUMP = 0.55;

/**
 * How quickly the rendered position chases the server position (per second).
 */
const FOLLOW_RATE = 18;

/**
 * Smallest signed difference between two angles.
 */
function angleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

/**
 * A hooded graveyard keeper built from boxes, facing +x in its local space:
 * hood and cloak in the player's color, a muted tunic, a rounded head, an
 * axe swung from the right shoulder, and a lantern carried in the left hand.
 * Smooths toward the latest server state each frame and animates walking
 * and swinging. Also owns the outline marking the tile it would act on.
 */
/**
 * What the build preview shows: the structure, whether it can go there,
 * and the box (tile-space center, ground height, width and height) around
 * whatever is in the way, if anything.
 */
export interface PlacePreview {
  kind: StructureKind;
  valid: boolean;
  blocker: { x: number; y: number; base: number; w: number; h: number } | null;
}

export class PlayerAvatar {
  readonly group = new Group();
  readonly label: HTMLDivElement;
  readonly marker = new Group();

  /**
   * Light red outline around whatever stops a build, in world space; the
   * renderer adds it to the scene.
   */
  readonly blocker: LineSegments;
  private hips = new Group();
  private body = new Group();
  private tool = new Group();
  private blade: Mesh | null = null;
  private bladeAt = new Vector3();
  private bladeWas = new Vector3();
  private trailPoint = new Vector3();
  private trailing = false;
  private trailBits: { mesh: Mesh; material: MeshBasicMaterial; age: number }[] = [];
  private trailNext = 0;

  /**
   * World-space streak behind the swinging blade; the renderer adds it to
   * the scene.
   */
  readonly trail = new Group();
  private markerMaterial: MeshBasicMaterial;
  private ghosts: Record<StructureKind, Group>;
  private ghostMaterial: MeshBasicMaterial;
  private ghostEdges: LineBasicMaterial;
  private blockerMaterial: LineBasicMaterial;
  private swings: number;
  private swingAge = SWING_TIME;
  private hurts: number;
  private hurtAge = HURT_FLASH_TIME;
  private healthFill: HTMLDivElement;
  private woundFill: HTMLDivElement;
  private healthBar: HTMLDivElement;
  private lit: MeshLambertMaterial[] = [];
  private litColors: Color[] = [];
  private pulse = 1;
  private legL = new Group();
  private legR = new Group();
  private head = new Group();
  private wrist = new Group();
  private lanternArm = new Group();
  private block = 0;
  private weapons = new Map<GearKind | 'wood-axe', { group: Group; tip: Mesh | null }>();
  private offhands = new Map<GearKind | 'lantern', Group>();
  private beltLantern = new Group();
  private plate = new Group();
  private armors = new Map<GearKind, Group>();
  private torchFlame: Mesh | null = null;
  private gearKey = '';
  private materials: Material[] = [];
  private x: number;
  private y: number;
  private facing: number;
  private walkPhase = 0;
  private velocity = { x: 0, y: 0 };
  private run = 0;
  private side = 0;
  private elevation = 0;
  private haze = 0;
  private hazeGroup: Group | null = null;
  private hazeMaterial: MeshBasicMaterial | null = null;
  private lastGround: number | null = null;
  private jump: { age: number; from: number } | null = null;
  private landAge = LAND_TIME;
  private slump = 0;
  target: PlayerState;

  constructor(state: PlayerState, labelLayer: HTMLElement) {
    this.target = state;
    this.x = state.x;
    this.y = state.y;
    this.facing = state.facing;
    this.swings = state.swings;
    this.hurts = state.hurts;

    const box = (size: [number, number, number], pos: [number, number, number], color: string, glow = false): Mesh => {
      const material = glow ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
      this.materials.push(material);
      if (material instanceof MeshLambertMaterial) {
        this.lit.push(material);
        this.litColors.push(material.color.clone());
      }
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.scale.set(...size);
      mesh.position.set(...pos);
      mesh.castShadow = !glow;
      return mesh;
    };

    const cloak = `#${new Color(state.color).lerp(new Color(DARK), 0.4).getHexString()}`;
    const tunic = `#${new Color(state.color).lerp(new Color(TUNIC), 0.6).getHexString()}`;
    for (const [leg, side] of [[this.legL, -1], [this.legR, 1]] as const) {
      leg.position.z = 0.08 * side;
      leg.add(
        box([0.12, 0.17, 0.12], [0, 0.155, 0], TROUSERS),
        box([0.15, 0.08, 0.13], [0.015, 0.04, 0], BOOT),
      );
    }

    this.body.add(
      box([0.24, 0.32, 0.34], [0, 0.41, 0], tunic),
      box([0.25, 0.04, 0.35], [0, 0.29, 0], BELT),
      box([0.02, 0.04, 0.05], [0.13, 0.29, 0], BUCKLE),
      box([0.05, 0.44, 0.38], [-0.14, 0.4, 0], cloak),
    );

    this.head.position.set(0.01, 0.58, 0);
    this.head.add(
      ...roundedBox(box, [0.28, 0.26, 0.3], [0, 0.13, 0], SKIN),
      box([0.02, 0.06, 0.05], [0.145, 0.14, -0.065], DARK),
      box([0.02, 0.06, 0.05], [0.145, 0.14, 0.065], DARK),
      box([0.3, 0.06, 0.3], [-0.01, 0.28, 0], state.color),
      box([0.07, 0.24, 0.32], [-0.13, 0.15, 0], state.color),
      box([0.22, 0.2, 0.04], [-0.02, 0.16, -0.16], state.color),
      box([0.22, 0.2, 0.04], [-0.02, 0.16, 0.16], state.color),
      box([0.05, 0.05, 0.3], [0.12, 0.27, 0], cloak),
    );
    this.body.add(this.head);

    this.tool.position.set(0, 0.56, -0.23);
    this.tool.add(
      box([0.09, 0.2, 0.09], [0, -0.1, 0], state.color),
      box([0.08, 0.06, 0.08], [0, -0.21, 0], SKIN),
    );
    this.wrist.position.set(0, -0.21, 0);
    for (const kind of GEAR_KINDS.filter((k: GearKind): boolean => GEAR[k].slot === 'weapon')) {
      const model = buildGearModel(kind, box);
      const group = new Group();
      group.add(...model.parts);
      this.wrist.add(group);
      this.weapons.set(kind, { group, tip: model.tip });
    }
    this.tool.add(this.wrist);

    const lantern = (): Mesh[] => buildLantern(box);
    this.lanternArm.position.set(0, 0.56, 0.23);
    this.lanternArm.add(
      box([0.09, 0.2, 0.09], [0, -0.1, 0], state.color),
      box([0.08, 0.06, 0.08], [0, -0.21, 0], SKIN),
    );
    const handLantern = new Group();
    handLantern.add(...lantern());
    this.offhands.set('lantern', handLantern);
    for (const kind of ['torch', 'shield'] as const) {
      const model = buildGearModel(kind, box);
      const group = new Group();
      group.add(...model.parts);
      group.position.y = kind === 'torch' ? -0.21 : 0;
      this.offhands.set(kind, group);
      this.torchFlame ??= model.flame;
    }
    this.lanternArm.add(...this.offhands.values());
    this.beltLantern.add(...lantern());
    this.beltLantern.position.set(0.03, 0.52, 0.2);
    this.beltLantern.scale.setScalar(0.8);
    for (const kind of GEAR_KINDS.filter((k: GearKind): boolean => GEAR[k].slot === 'armor')) {
      const group = new Group();
      group.add(...buildGearModel(kind, box).parts);
      this.armors.set(kind, group);
      this.plate.add(group);
    }
    this.body.add(this.tool, this.lanternArm, this.beltLantern, this.plate);
    this.applyGear();

    const trailColor = new Color(state.color).multiplyScalar(0.5);
    for (let i = 0; i < TRAIL_POOL; i++) {
      const material = new MeshBasicMaterial({ color: trailColor, transparent: true, opacity: 0, depthWrite: false });
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.visible = false;
      this.trail.add(mesh);
      this.trailBits.push({ mesh, material, age: TRAIL_LIFE });
    }
    const torso = new Group();
    torso.position.y = -HIP_HEIGHT;
    torso.add(this.body);
    this.hips.position.y = HIP_HEIGHT;
    this.hips.add(torso);
    this.group.add(this.legL, this.legR, this.hips);
    this.group.scale.setScalar(AVATAR_SCALE);

    const edge = new MeshBasicMaterial({ color: state.color, transparent: true, opacity: 0.8 });
    this.markerMaterial = edge;
    for (const [w, d, ox, oz] of [[1, 0.06, 0, -0.47], [1, 0.06, 0, 0.47], [0.06, 1, -0.47, 0], [0.06, 1, 0.47, 0]]) {
      const bar = new Mesh(UNIT_BOX, edge);
      bar.scale.set(w, 0.02, d);
      bar.position.set(ox, 0.03, oz);
      this.marker.add(bar);
    }
    this.marker.visible = false;

    this.ghostMaterial = new MeshBasicMaterial({ color: PLACE_OK, transparent: true, opacity: 0.05, depthWrite: false });
    this.ghostEdges = new LineBasicMaterial({ color: PLACE_OK, transparent: true, opacity: 0.3 });
    this.ghosts = Object.fromEntries(STRUCTURE_KINDS.map((kind: StructureKind): [StructureKind, Group] => {
      const [w, h, d] = GHOST_SHAPES[kind];
      const ghost = new Group();
      ghost.add(new Mesh(UNIT_BOX, this.ghostMaterial), new LineSegments(UNIT_EDGES, this.ghostEdges));
      ghost.scale.set(w, h, d);
      ghost.position.y = h / 2;
      ghost.visible = false;
      this.marker.add(ghost);
      return [kind, ghost];
    })) as Record<StructureKind, Group>;
    this.blockerMaterial = new LineBasicMaterial({ color: PLACE_BLOCKED, depthTest: false, transparent: true });
    this.blocker = new LineSegments(UNIT_EDGES, this.blockerMaterial);
    this.blocker.renderOrder = 10;
    this.blocker.visible = false;

    this.label = document.createElement('div');
    this.label.className = 'pointer-events-none absolute left-0 top-0 whitespace-nowrap border-b-2 px-1 pb-0.5 font-pixel text-[10px] text-foreground [text-shadow:0_2px_0_var(--arw-bg)]';
    this.label.style.borderColor = state.color;
    this.label.textContent = state.name;
    this.healthBar = document.createElement('div');
    this.healthBar.className = 'absolute inset-x-1 -bottom-1.5 h-1 bg-background';
    this.healthFill = document.createElement('div');
    this.healthFill.className = 'h-full';
    this.healthFill.style.backgroundColor = HEALTH_FILL;
    this.woundFill = document.createElement('div');
    this.woundFill.className = 'absolute inset-y-0 right-0';
    this.woundFill.style.backgroundColor = WOUND_FILL;
    this.healthBar.append(this.healthFill, this.woundFill);
    this.label.appendChild(this.healthBar);
    labelLayer.appendChild(this.label);
  }

  /**
   * Kicks the legs and flaps the arms while held up by the TV's mouse,
   * `amount` 0 (on the ground) to 1. Runs after `update`.
   */
  flail(amount: number, time: number): void {
    if (amount > 0) {
      const kick = Math.sin(time * 15) * 0.7 * amount;
      this.legL.rotation.z += kick;
      this.legR.rotation.z -= kick;
      this.lanternArm.rotation.z += Math.sin(time * 11) * 0.7 * amount;
      this.tool.rotation.z += Math.sin(time * 11 + 2) * 0.5 * amount;
      this.head.rotation.z += Math.sin(time * 6) * 0.3 * amount;
    }
  }

  /**
   * Advances smoothing and animation by `dt` seconds. `time` drives the
   * spawn-protection pulse. Running tips the torso into the direction of
   * travel, lengthens and lifts the stride, and pumps the arms.
   */
  update(dt: number, time: number, groundHeight: number): void {
    const t = this.target;
    this.group.visible = !t.dead;
    this.label.style.display = t.dead ? 'none' : '';
    if (t.dead) {
      this.x = t.x;
      this.y = t.y;
      this.hurts = t.hurts;
      return;
    }
    const k = 1 - Math.exp(-FOLLOW_RATE * dt);
    const dx = (t.x - this.x) * k;
    const dy = (t.y - this.y) * k;
    this.x += dx;
    this.y += dy;
    if (this.lastGround !== null && this.lastGround - groundHeight > 0.5 && t.moving && !t.lifted && !this.jump) {
      this.jump = { age: 0, from: this.elevation };
    }
    this.lastGround = groundHeight;
    let jumpPose = 0;
    if (this.jump) {
      this.jump.age += dt;
      const s = Math.min(1, this.jump.age / JUMP_TIME);
      this.elevation = this.jump.from + (groundHeight - this.jump.from) * s * s + Math.sin(s * Math.PI) * JUMP_HOP;
      jumpPose = Math.sin(Math.min(1, s * 1.4) * Math.PI / 2) * (1 - s * s);
      if (s >= 1) {
        this.jump = null;
        this.landAge = 0;
      }
    } else {
      this.elevation += (groundHeight - this.elevation) * k;
    }
    this.landAge = Math.min(LAND_TIME, this.landAge + dt);
    const squash = Math.sin((this.landAge / LAND_TIME) * Math.PI) * (this.landAge < LAND_TIME ? 1 : 0);
    this.facing += angleDelta(this.facing, t.facing) * k;

    const v = 1 - Math.exp(-RUN_SMOOTHING * dt);
    this.velocity.x += (dx / Math.max(dt, 1e-3) - this.velocity.x) * v;
    this.velocity.y += (dy / Math.max(dt, 1e-3) - this.velocity.y) * v;
    const cos = Math.cos(this.facing);
    const sin = Math.sin(this.facing);
    const clamp = (n: number): number => Math.max(-1, Math.min(1, n));
    this.run = clamp((this.velocity.x * cos + this.velocity.y * sin) / PLAYER_SPEED);
    this.side = clamp((this.velocity.y * cos - this.velocity.x * sin) / PLAYER_SPEED);
    const speed = Math.min(1, Math.hypot(this.run, this.side));

    if (t.moving) {
      this.walkPhase += dt * (9 + 7 * speed);
    } else {
      this.walkPhase = 0;
    }
    const stride = Math.sin(this.walkPhase);
    const lift = Math.cos(this.walkPhase) * 0.06 * speed;
    this.legL.position.x = stride * (0.07 + 0.06 * speed);
    this.legR.position.x = -stride * (0.07 + 0.06 * speed);
    this.legL.position.y = Math.max(0, lift);
    this.legR.position.y = Math.max(0, -lift);
    this.body.position.y = Math.abs(stride) * (0.03 + 0.04 * speed);
    this.hips.rotation.z = -RUN_LEAN * this.run;
    this.hips.rotation.x = SIDE_LEAN * this.side;
    this.hips.rotation.y = stride * 0.12 * speed;
    this.slump = Math.max(0, Math.min(1, this.slump + (t.connected ? -1 : 1) * SLUMP_SPEED * dt));
    const slump = this.slump * this.slump * (3 - 2 * this.slump);
    this.legL.rotation.z = 0.9 * jumpPose;
    this.legR.rotation.z = -0.5 * jumpPose;
    this.legL.position.y += 0.1 * jumpPose;
    this.legR.position.y += 0.1 * jumpPose;
    this.hips.rotation.z -= 0.35 * jumpPose;
    this.body.position.y -= 0.08 * squash + 0.16 * slump;
    this.legL.rotation.z += 1.35 * slump;
    this.legR.rotation.z += 1.2 * slump;
    this.legL.position.y += 0.12 * slump;
    this.legR.position.y += 0.12 * slump;
    this.hips.rotation.z -= 0.45 * slump;
    this.group.scale.set(1 + 0.12 * squash, 1 - 0.18 * squash, 1 + 0.12 * squash);

    const gearKey = `${t.gear.weapon}|${t.gear.offhand}|${t.gear.armor}`;
    if (gearKey !== this.gearKey) {
      this.applyGear();
    }
    if (t.swings !== this.swings) {
      this.swings = t.swings;
      this.swingAge = 0;
    }
    const before = this.swingAge;
    this.swingAge = Math.min(this.swingAge + dt, SWING_TIME);
    this.block += ((t.blocking ? 1 : 0) - this.block) * Math.min(1, dt * BLOCK_RATE);
    if (t.gear.weapon && GEAR[t.gear.weapon].weapon?.ranged) {
      this.animateShot(Math.min(1, this.swingAge / SHOT_TIME));
    } else {
      this.animateSwing(this.swingAge / SWING_TIME, time);
      if (this.swingAge >= SWING_TIME) {
        this.tool.rotation.z -= stride * ARM_PUMP * speed;
      }
    }
    this.head.rotation.z += RUN_LEAN * 0.5 * Math.max(0, this.run);
    if (slump > 0) {
      this.lanternArm.rotation.z -= 0.3 * slump;
      this.tool.rotation.z -= 0.5 * slump;
      this.head.rotation.z -= 0.75 * slump + Math.sin(time * 1.2) * 0.04 * slump;
    }
    if (jumpPose > 0) {
      this.lanternArm.rotation.z += 2.2 * jumpPose;
      this.tool.rotation.z += 1.6 * jumpPose;
      this.head.rotation.z += 0.3 * jumpPose;
    }
    if (this.torchFlame) {
      this.torchFlame.scale.set(0.11 * (1 + Math.sin(time * 23) * 0.12), 0.15 * (1 + Math.sin(time * 31 + 1) * 0.22), 0.11);
    }

    const { x, z } = toWorld(this.x, this.y);
    this.group.position.set(x, this.elevation, z);
    this.group.rotation.y = -this.facing;
    this.updateTrail(dt);

    if (t.hurts !== this.hurts) {
      this.hurts = t.hurts;
      this.hurtAge = 0;
    }
    this.hurtAge = Math.min(this.hurtAge + dt, HURT_FLASH_TIME);
    const flash = 1 - this.hurtAge / HURT_FLASH_TIME;
    this.pulse = t.protected ? 1 - PROTECTION_DIM * (0.5 - 0.5 * Math.cos(time * PROTECTION_PULSE_RATE * Math.PI * 2)) : 1;
    this.haze = Math.max(0, Math.min(1, this.haze + (t.slowed ? 1 : -1) * HAZE_FADE * dt));
    const shimmer = this.haze * (0.6 + 0.4 * Math.sin(time * 9));
    this.lit.forEach((m: MeshLambertMaterial, i: number): void => {
      m.emissive.set(HURT_COLOR).multiplyScalar(flash).lerp(HAZE_COLOR, shimmer * 0.45);
      m.color.copy(this.litColors[i]).multiplyScalar(this.pulse);
    });
    this.updateHaze(time);

    const opacity = 1 - 0.4 * shimmer;
    for (const m of this.materials) {
      m.transparent = opacity < 1;
      m.opacity = opacity;
    }
    this.label.style.opacity = String(t.connected ? 1 : 0.5);
    this.healthBar.style.display = t.hp < MAX_HP ? '' : 'none';
    this.healthFill.style.width = `${(t.hp / MAX_HP) * 100}%`;
    this.woundFill.style.width = `${(t.wounded / MAX_HP) * 100}%`;
  }

  /**
   * Green wisps that circle a player slowed by ectoplasm, built the first
   * time they're needed.
   */
  private updateHaze(time: number): void {
    if (this.haze <= 0) {
      if (this.hazeGroup) {
        this.hazeGroup.visible = false;
      }
      return;
    }
    if (!this.hazeGroup) {
      this.hazeMaterial = new MeshBasicMaterial({ color: HAZE_COLOR, transparent: true, opacity: 0, depthWrite: false });
      this.hazeGroup = new Group();
      for (let i = 0; i < HAZE_WISPS; i++) {
        const wisp = new Mesh(UNIT_BOX, this.hazeMaterial);
        wisp.scale.setScalar(0.07 + (i % 3) * 0.02);
        this.hazeGroup.add(wisp);
      }
      this.group.add(this.hazeGroup);
    }
    this.hazeGroup.visible = true;
    this.hazeMaterial!.opacity = 0.55 * this.haze;
    this.hazeGroup.children.forEach((wisp, i: number): void => {
      const a = time * (1.6 + (i % 2) * 0.7) + (i * Math.PI * 2) / HAZE_WISPS;
      const r = 0.3 + 0.05 * Math.sin(time * 3 + i);
      wisp.position.set(Math.cos(a) * r, 0.25 + ((i * 0.13 + time * 0.35) % 0.7), Math.sin(a) * r);
      wisp.rotation.set(time * 2 + i, time * 1.3, 0);
    });
  }

  /**
   * The strike, in five beats: wind-up (axe hauled far back over the
   * shoulder, leaning back, twisting away, rising onto the toes), a hang at
   * the top with a tremble, a violent whip down past horizontal with a lunge,
   * a deep crouch, and a squash; a held beat at impact; then an eased
   * recovery to rest.
   */
  private animateSwing(phase: number, time: number): void {
    const mix = (a: typeof POSE_REST, b: typeof POSE_REST, t: number): typeof POSE_REST => ({
      shoulder: a.shoulder + (b.shoulder - a.shoulder) * t,
      wrist: a.wrist + (b.wrist - a.wrist) * t,
    });
    let arm = POSE_REST;
    let strike = 0;
    let lean = 0;
    let twist = 0;
    let step = 0;
    let rise = 0;
    let squash = 0;
    if (phase < WINDUP_END) {
      const t = easeOut(phase / WINDUP_END);
      arm = mix(POSE_REST, POSE_RAISED, t);
      lean = 0.22 * t;
      twist = 0.5 * t;
      rise = 0.04 * t;
    } else if (phase < HANG_END) {
      arm = { shoulder: POSE_RAISED.shoulder + Math.sin(time * 90) * 0.04, wrist: POSE_RAISED.wrist };
      lean = 0.22;
      twist = 0.5;
      rise = 0.04;
    } else if (phase < STRIKE_END) {
      const t = easeIn((phase - HANG_END) / (STRIKE_END - HANG_END));
      arm = { shoulder: POSE_RAISED.shoulder + (POSE_IMPACT.shoulder - POSE_RAISED.shoulder) * t, wrist: POSE_RAISED.wrist + (POSE_IMPACT.wrist - POSE_RAISED.wrist) * t * t };
      strike = t;
      lean = 0.22 - 0.72 * t;
      twist = 0.5 - 1.05 * t;
      step = 0.18 * t;
      rise = 0.04 - 0.12 * t;
      squash = t;
    } else if (phase < IMPACT_END) {
      arm = POSE_IMPACT;
      strike = 1;
      lean = -0.5;
      twist = -0.55;
      step = 0.18;
      rise = -0.08;
      squash = 1 - (phase - STRIKE_END) / (IMPACT_END - STRIKE_END) * 0.5;
    } else if (phase < 1) {
      const t = easeInOut((phase - IMPACT_END) / (1 - IMPACT_END));
      arm = mix(POSE_IMPACT, POSE_REST, t);
      strike = 1 - t;
      lean = -0.5 * (1 - t);
      twist = -0.55 * (1 - t);
      step = 0.18 * (1 - t);
      rise = -0.08 * (1 - t);
      squash = 0.5 * (1 - t);
    }
    this.tool.rotation.z = arm.shoulder;
    this.tool.rotation.x = -0.3 * strike;
    this.wrist.rotation.z = arm.wrist;
    this.poseOffhand(lean);
    this.head.rotation.z = lean * 0.4;
    this.body.rotation.z = -lean;
    this.body.rotation.y = twist;
    this.body.position.x = step;
    this.body.position.y += rise;
    this.body.scale.set(1 + squash * 0.08, 1 - squash * 0.1, 1 + squash * 0.08);
  }

  /**
   * Firing a gun: it kicks up and the body rocks back, then settles
   * level again.
   */
  private animateShot(phase: number): void {
    const kick = phase < 1 ? Math.sin(Math.min(1, phase * 4) * Math.PI / 2) * (1 - phase) * (1 - phase) : 0;
    this.tool.rotation.z = POSE_AIM.shoulder + kick * SHOT_KICK;
    this.tool.rotation.x = 0;
    this.wrist.rotation.z = POSE_AIM.wrist + kick * 0.3;
    this.poseOffhand(0.15 * kick);
    this.head.rotation.z = 0.1 * kick;
    this.body.rotation.z = -0.15 * kick;
    this.body.rotation.y = 0;
    this.body.position.x = -0.05 * kick;
    this.body.scale.set(1, 1, 1);
  }

  /**
   * Swings the lantern with the walk, holds a torch up high, or keeps a
   * shield forward.
   */
  private poseOffhand(lean: number): void {
    const offhand = this.target.gear.offhand;
    const sway = Math.sin(this.walkPhase);
    if (offhand === 'torch') {
      this.lanternArm.rotation.z = ARM_TORCH + lean * 0.3 - sway * 0.06;
    } else if (offhand === 'shield') {
      this.lanternArm.rotation.z = ARM_SHIELD + (ARM_BLOCK - ARM_SHIELD) * this.block + lean * 0.3 * (1 - this.block);
    } else {
      this.lanternArm.rotation.z = 0.35 + lean * 0.8 + sway * (0.25 + ARM_PUMP * Math.min(1, Math.hypot(this.run, this.side)));
    }
  }

  /**
   * How bright the player's light is right now (dims with the spawn
   * protection pulse).
   */
  get lightLevel(): number {
    return this.pulse;
  }

  /**
   * Shows the equipped weapon, off-hand piece, and armor (the wood axe and
   * the lantern when a slot is empty; the lantern moves to the belt behind
   * a shield).
   */
  private applyGear(): void {
    const { weapon, offhand, armor } = this.target.gear;
    this.gearKey = `${weapon}|${offhand}|${armor}`;
    for (const [kind, { group, tip }] of this.weapons) {
      group.visible = kind === (weapon ?? 'wood-axe');
      if (group.visible) {
        this.blade = weapon && GEAR[weapon].weapon?.ranged ? null : tip;
      }
    }
    for (const [kind, group] of this.offhands) {
      group.visible = kind === (offhand ?? 'lantern');
    }
    this.beltLantern.visible = offhand === 'shield';
    for (const [kind, group] of this.armors) {
      group.visible = kind === armor;
    }
  }

  /**
   * From the hang through the impact, drops glowing bits along the blade's
   * path (filling in between frames), then fades and shrinks them.
   */
  private updateTrail(dt: number): void {
    const phase = this.swingAge / SWING_TIME;
    const active = this.blade !== null && phase >= HANG_END && phase <= IMPACT_END && this.target.connected && !this.target.dead;
    this.group.updateMatrixWorld(true);
    this.blade?.getWorldPosition(this.bladeAt);
    if (active) {
      const from = this.trailing ? this.bladeWas : this.bladeAt;
      for (let s = 1; s <= TRAIL_STEPS; s++) {
        const bit = this.trailBits[this.trailNext];
        this.trailNext = (this.trailNext + 1) % TRAIL_POOL;
        bit.mesh.position.copy(this.trailPoint.lerpVectors(from, this.bladeAt, s / TRAIL_STEPS));
        bit.age = 0;
      }
    }
    this.trailing = active;
    this.bladeWas.copy(this.bladeAt);
    for (const bit of this.trailBits) {
      bit.age = Math.min(bit.age + dt, TRAIL_LIFE);
      const k = bit.age / TRAIL_LIFE;
      bit.mesh.visible = k < 1;
      bit.material.opacity = 0.25 * (1 - k * k);
      bit.mesh.scale.setScalar(TRAIL_SIZE * (1 - k * 0.6));
    }
  }

  /**
   * Smoothed tile-space position, for the lantern or torch light.
   */
  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Outlines the tile this player would act on in their color, or while
   * they're placing a structure, a dim white outline and see-through shape
   * of it, light red if it can't go there, with whatever is in the way
   * outlined light red too. Null hides it.
   */
  showMarker(tile: { tx: number; ty: number } | null, place: PlacePreview | null = null, height = 0): void {
    const shown = tile !== null && this.target.connected && !this.target.dead;
    this.marker.visible = shown;
    for (const kind of STRUCTURE_KINDS) {
      this.ghosts[kind].visible = place?.kind === kind;
    }
    const blocker = shown && place ? place.blocker : null;
    this.blocker.visible = blocker !== null;
    if (blocker) {
      const { x, z } = toWorld(blocker.x, blocker.y);
      this.blocker.position.set(x, blocker.base + blocker.h / 2, z);
      this.blocker.scale.set(blocker.w, blocker.h, blocker.w);
    }
    if (!tile) {
      return;
    }
    const { x, z } = toWorld(tile.tx + 0.5, tile.ty + 0.5);
    this.marker.position.set(x, height, z);
    const color = !place ? this.target.color : place.valid ? PLACE_OK : PLACE_BLOCKED;
    this.markerMaterial.color.set(color);
    this.markerMaterial.opacity = place?.valid ? 0.3 : 0.8;
    this.ghostMaterial.color.set(color);
    this.ghostMaterial.opacity = place?.valid ? 0.05 : 0.12;
    this.ghostEdges.color.set(color);
    this.ghostEdges.opacity = place?.valid ? 0.3 : 0.7;
  }

  dispose(): void {
    this.label.remove();
    this.materials.forEach((m: Material): void => m.dispose());
    this.markerMaterial.dispose();
    this.ghostMaterial.dispose();
    this.ghostEdges.dispose();
    this.blockerMaterial.dispose();
    this.hazeMaterial?.dispose();
    this.trailBits.forEach(({ material }): void => material.dispose());
  }
}
