// Packages
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  Vector3,
} from 'three';

import { GHOUL_LEAP_TIME, MONSTERS, WITCH_SWIPE, isZombie } from '@halloween/shared/monsters';
import { seededRandom } from '@halloween/shared/world';

// Local Imports
import { toWorld } from './build-graveyard';
import { buildGearModel } from './gear-models';
import { NO_BLOOM_LAYER } from './post-effects';

// Types
import type { Material } from 'three';
import type { GearKind } from '@halloween/shared/gear';
import type { MonsterArmor } from '@halloween/shared/levels';
import type { MonsterKind } from '@halloween/shared/monsters';
import type { MonsterState } from '@halloween/shared/protocol';

const UNIT_BOX = new BoxGeometry(1, 1, 1);

const ZOMBIE_SKINS = ['#7fa36a', '#8a9a78', '#6f8f6a', '#a3a88a', '#9aa6b0', '#86745a'];
const ZOMBIE_SHIRTS = ['#5b6b4a', '#6b5a44', '#4a4f63', '#6e3b3b', '#7a7466', '#3f4a3a', '#8a8070'];
const ZOMBIE_PANTS = ['#353b2c', '#2e2a24', '#2b3040', '#4a3b2a'];
const ZOMBIE_HAIR = ['#3b4a2a', '#2a2420', '#5a4a30', '#8a8a80'];
const ZOMBIE_BONE = '#d8d2bc';
const ZOMBIE_EYE = '#d8ff6a';
const BRUTE_SKINS = ['#6f7f62', '#7a7468', '#5f6f66', '#857a66'];
const BRUTE_TUSK = '#e4dcc0';
const BRUTE_BELT = '#3a2a1a';
const ARMOR_IRON = '#7d848e';
const ARMOR_DARK = '#4e535b';
const ARMOR_RUST = '#7a4a2c';
const SKELETON_BONES = ['#e6e0cc', '#d4ccb2', '#ece6d8'];
const SKELETON_JOINT = '#b8b09a';
const SKELETON_SOCKET = '#141018';
const SKELETON_EYE = '#7fd8ff';
const BOW_WOOD = '#6b4a2a';
const BOW_STRING = '#d8d0b0';
const ARROW_WOOD = '#5a4028';
const WITCH_ROBES = ['#2a1f38', '#1f2a24', '#38201f'];
const WITCH_SKIN = '#7fae6a';
const WITCH_HAIR = '#c9c3b0';
const WITCH_HAT = '#1c1626';
const WITCH_BAND = '#6a3a8a';
const WITCH_BELT = '#3a2a1a';
const WITCH_BOOT = '#1a1414';
const WITCH_EYE = '#ffe14a';
const POTION_PURPLE = '#b04aff';
const POTION_CORK = '#8a6a44';
const BROOM_HANDLE = '#5a3c22';
const BROOM_STRAW = '#b8955a';
const BROOM_TIE = '#3a2a1a';
const GHOUL_SKINS = ['#a9a69c', '#9ea398', '#b0a89c'];
const GHOUL_HAIR = '#141210';
const GHOUL_TEETH = '#e4dcc0';
const GHOUL_EYE = '#ff6a2a';
const DEMON_SHADOW = '#120c14';
const DEMON_HIDE = '#1e1424';
const DEMON_HORN = '#3a2e2a';
const DEMON_EYE = '#ff4a1a';
const DEMON_EMBER = '#ff7a2a';
const DEMON_CLAW = '#d8d0c8';

/**
 * How solid a demon looks: wandering, stalking someone (barely there in
 * the dark), and attacking.
 */
const DEMON_IDLE = 0.65;
const DEMON_STALK = 0.25;
const DEMON_SOLID = 0.9;

/**
 * How long a demon takes to pull itself together after stepping out of the
 * shadows.
 */
const BLINK_FADE = 0.35;

/**
 * Radians of stride per second for each kind while it moves.
 */
const GAIT: Record<MonsterKind, number> = { zombie: 8, vampire: 18, ghost: 8, brute: 3.2, skeleton: 9, witch: 6, ghoul: 14, demon: 5 };

/**
 * A witch's broom swipe: seconds it plays after its windup.
 */
const SWIPE_FOLLOW = 0.4;

/**
 * The faint streak a brute's fist or a witch's broom leaves through the
 * air: pool size, how long each bit lingers, and how many bits fill the
 * gap between frames.
 */
const TRAIL_POOL = 32;
const TRAIL_LIFE = 0.22;
const TRAIL_STEPS = 4;

function pickFrom<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length)];
}
const VAMPIRE_SKIN = '#d9d4e2';
const VAMPIRE_SUIT = '#1c1622';
const VAMPIRE_CAPE = '#120d16';
const VAMPIRE_LINING = '#8a1022';
const VAMPIRE_HAIR = '#0b0b10';
const VAMPIRE_EYE = '#ff2030';
const VAMPIRE_FANG = '#f4f0f6';
const VAMPIRE_MEDALLION = '#c9a84a';
const GHOST_BODY = '#a9c2e4';
const GHOST_FACE = '#1a2236';

/**
 * An angry ghost's glowing eyes and snarl.
 */
const GHOST_MAD = '#ff3b3b';
const HURT_COLOR = '#ff2020';

/**
 * Overall scale relative to a tile (players are 1.3).
 */
const MONSTER_SCALE = 1.3;

const FOLLOW_RATE = 18;

/**
 * Hit reaction: how hard a blow kicks the head (sideways and back, in
 * radians per second) and rocks the body, and the spring that brings them
 * back (stiffness and damping).
 */
const KICK_YAW = 14;
const KICK_PITCH = 10;
const KICK_RECOIL = 6;
const KICK_STIFFNESS = 90;
const KICK_DAMPING = 9;
const HURT_FLASH_TIME = 0.18;
const LUNGE_TIME = 0.3;

/**
 * A zombie's attack (also used for chewing walls): rearing up through its
 * windup (the server's telegraph), slamming down with a lunge and a biting
 * head snap as the hit lands, then recovering.
 */
const ZOMBIE_WINDUP = MONSTERS.zombie.windup;
const ZOMBIE_ATTACK_TIME = ZOMBIE_WINDUP + 0.45;
const ZOMBIE_REAR_END = ZOMBIE_WINDUP / ZOMBIE_ATTACK_TIME;
const ZOMBIE_SLAM_END = (ZOMBIE_WINDUP + 0.15) / ZOMBIE_ATTACK_TIME;

/**
 * Seconds an attack of the newer kinds plays on after its windup.
 */
const FOLLOW_THROUGH = 0.45;
const STUMBLE_TIME = 0.9;

/**
 * A brute's swing: its fists go up over BRUTE_WINDUP (the server's
 * telegraph), come down in BRUTE_SLAM_TIME, and it takes BRUTE_RECOVER to
 * straighten up. Hits barely rock it (BRUTE_HEFT of a zombie's flinch).
 */
const BRUTE_WINDUP = MONSTERS.brute.windup;
const BRUTE_SLAM_TIME = 0.12;
const BRUTE_RECOVER = 0.55;
const BRUTE_HEFT = 0.3;

/**
 * How far a brute rolls and shifts its weight onto each planted leg (its
 * gait is slow, see GAIT).
 */
const BRUTE_ROLL = 0.16;
const BRUTE_SHIFT = 0.05;

/**
 * How hard a brute shakes the trees around it: walking, at each footfall,
 * and when its fists hit the ground (fading over BRUTE_QUAKE_FADE seconds).
 */
const BRUTE_WALK_QUAKE = 0.25;
const BRUTE_STEP_QUAKE = 0.75;
const BRUTE_SLAM_QUAKE = 1.8;
const BRUTE_QUAKE_FADE = 0.6;

/**
 * Spring on a brute's arms (stiffness and damping), loose enough that they
 * lag and swing with its steps.
 */
const BRUTE_ARM_STIFFNESS = 28;
const BRUTE_ARM_DAMPING = 5;
const BRUTE_ARM_HANG = -1.3;

/**
 * Height of a brute's hips: it bends there, so leaning doesn't slide its
 * body off its legs.
 */
const BRUTE_HIP = 0.32;

/**
 * Fastest each kind turns its body, in radians per second.
 */
const TURN_RATE: Record<MonsterKind, number> = { zombie: 1.8, vampire: 9, ghost: 3, brute: 1.3, skeleton: 5, witch: 3, ghoul: 8, demon: 6 };

/**
 * Most a zombie turns its head (radians), and how quickly it gets there:
 * usually a slow creep, sometimes a quicker jerk.
 */
const HEAD_TURN = 0.8;
const HEAD_CREEP = 1.1;
const HEAD_SNAP = 4;

/**
 * What an idle zombie is doing with itself: reaching out, hanging limp,
 * one arm raised, or standing and scanning around. Hunting zombies always
 * reach. Each lasts MOOD_MIN to MOOD_MIN + MOOD_SPREAD seconds.
 */
type ZombieMood = 'reach' | 'slack' | 'one-up' | 'look';
const MOODS: [ZombieMood, number][] = [['reach', 0.3], ['slack', 0.35], ['one-up', 0.15], ['look', 0.2]];
const MOOD_MIN = 4;
const MOOD_SPREAD = 6;

/**
 * What an idle vampire is doing: standing still with its arms at its sides,
 * holding its cape up across its face, slowly looking around, or looming
 * with its arms and cape spread. A hunting vampire stalks, claws ready.
 */
type VampireMood = 'still' | 'cloak' | 'scan' | 'loom';
const VAMPIRE_MOODS: [VampireMood, number][] = [['still', 0.35], ['cloak', 0.25], ['scan', 0.25], ['loom', 0.15]];

/**
 * How high an idle vampire hovers above the ground, and how far it bobs.
 */
const VAMPIRE_HOVER = 0.04;
const VAMPIRE_BOB = 0.02;

/**
 * Arm pitch for each pose: out in front, half down, and hanging.
 */
const ARM_OUT = 0;
const ARM_HALF = -0.9;
const ARM_DOWN = -1.35;

/**
 * Ghost hover height and opacity, and how much brighter it pulses while
 * draining a light.
 */
const GHOST_HEIGHT = 0.35;
const GHOST_OPACITY = 0.4;

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function angleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

/**
 * A voxel zombie, vampire, or ghost, facing +x in its local space. Smooths
 * toward the server state and animates walking, attacking, hits, and (for
 * zombies) stumbling, reaching arms, and a head that looks around.
 * Zombies and vampires are lit by the light map (with glowing eyes);
 * ghosts glow on their own.
 */
export class MonsterAvatar {
  readonly group = new Group();
  readonly body = new Group();
  private limbs: Object3D[] = [];
  private head = new Group();
  private armL = new Group();
  private armR = new Group();
  private droopL = 0;
  private droopR = 0;
  private headYaw = 0;
  private headTarget = 0;
  private headSpeed = HEAD_CREEP;
  private headPitch = 0;
  private nextLookAt = 0;
  private mood: ZombieMood = 'reach';
  private moodUntil = 0;
  private raisedSide = 1;
  private armBaseL = 0;
  private armBaseR = 0;
  private hunch = 0;
  private size = 1;
  private oneArmed = false;
  private tail: Mesh[] = [];
  private cape = new Group();
  private capeLow = new Group();
  private capeLift = 0;
  private vampireMood: VampireMood = 'still';
  private lit: MeshLambertMaterial[] = [];
  private ghostMaterial: MeshBasicMaterial | null = null;
  private calmFace = new Group();
  private madFace = new Group();
  private materials: Material[] = [];
  private x: number;
  private y: number;
  private facing: number;
  private elevation = 0;
  private phase = Math.random() * 10;
  private attacks: number;
  private lungeAge = LUNGE_TIME;
  private windup: number;
  private attackTime = ZOMBIE_ATTACK_TIME;
  private attackAge = ZOMBIE_ATTACK_TIME;

  /**
   * A brute's arm angles and their speeds (the arms hang on springs), and
   * whether its current swing has landed yet.
   */
  private armAngle = [BRUTE_ARM_HANG, BRUTE_ARM_HANG];
  private armSpeed = [0, 0];
  private slammed = true;

  /**
   * Goes up each time a brute's fists hit the ground, for the renderer's
   * dust and shake.
   */
  impactCount = 0;

  /**
   * How hard this monster shakes the trees around it right now (only
   * brutes do), and what's left of its last slam's.
   */
  quake = 0;
  private slamQuake = 0;

  /**
   * A ghoul's arms and legs (each in two parts), a skeleton's nocked
   * arrow, and a witch's potion and broom.
   */
  private crawl: { upper: Group; lower: Group; front: boolean; side: number }[] = [];

  /**
   * A demon's trails of smoke (each a chain of segments) and how solid it
   * looks right now.
   */
  private streams: Group[][] = [];
  private fade = DEMON_IDLE;
  private jaw = new Group();

  /**
   * How fast it's really moving (tiles a second, smoothed), so its legs
   * keep pace instead of churning at full speed while it ambles.
   */
  private pace = 0;
  private broom = new Group();
  private swipes: number;
  private swipeAge = WITCH_SWIPE.windup + SWIPE_FOLLOW;

  /**
   * World-space streak behind a brute's fist or a witch's broom; the
   * renderer adds it to the scene.
   */
  readonly trail = new Group();
  private trailBits: { mesh: Mesh; material: MeshBasicMaterial; age: number }[] = [];
  private trailNext = 0;
  private trailSource: Object3D | null = null;
  private trailing = false;
  private trailOpacity = 0;
  private trailSize = 0;
  private trailAt = new Vector3();
  private trailWas = new Vector3();
  private trailPoint = new Vector3();
  private nocked: Mesh | null = null;
  private flask = new Group();

  /**
   * Shadow steps seen, and seconds since the last one.
   */
  private blinks: number;
  private blinkAge = BLINK_FADE;
  private stumbles: number;
  private stumbleAge = STUMBLE_TIME;
  private stumbleSide = 1;
  private hurts: number;
  private hurtAge = HURT_FLASH_TIME;
  private kickYaw = 0;
  private kickYawSpeed = 0;
  private kickPitch = 0;
  private kickPitchSpeed = 0;
  private recoil = 0;
  private recoilSpeed = 0;
  target: MonsterState;

  constructor(state: MonsterState) {
    this.target = state;
    this.x = state.x;
    this.y = state.y;
    this.facing = state.facing;
    this.attacks = state.attacks;
    this.stumbles = state.stumbles;
    this.hurts = state.hurts;
    this.blinks = state.blinks;
    this.swipes = state.swipes;
    this.windup = MONSTERS[state.kind].windup;
    if (state.kind === 'brute') {
      this.buildBrute(state.id, state.held, state.armor);
      this.attackTime = BRUTE_WINDUP + BRUTE_SLAM_TIME + BRUTE_RECOVER;
    } else if (state.kind === 'zombie') {
      this.buildZombie(state.id, state.held, state.armor);
    } else if (state.kind === 'vampire') {
      this.buildVampire();
    } else if (state.kind === 'ghost') {
      this.buildGhost();
    } else {
      this.attackTime = this.windup + (state.kind === 'ghoul' ? GHOUL_LEAP_TIME + 0.3 : FOLLOW_THROUGH);
      if (state.kind === 'skeleton') {
        this.buildSkeleton(state.id);
      } else if (state.kind === 'witch') {
        this.buildWitch(state.id);
      } else if (state.kind === 'ghoul') {
        this.buildGhoul(state.id);
      } else {
        this.buildDemon();
      }
    }
    this.attackAge = this.attackTime;
    if (state.kind === 'brute') {
      this.addTrail(this.armR, [0.53, 0, 0], '#b8b0a0', 0.12, 0.2);
    } else if (state.kind === 'witch') {
      this.addTrail(this.broom, [0.46, 0, 0], POTION_PURPLE, 0.35, 0.16);
    }
    this.group.add(this.body);
    this.group.scale.setScalar(MONSTER_SCALE * this.size);
  }

  /**
   * Sets up a faint streak behind a point (`at`, in `parent`'s space) that
   * shows while the attack swings through.
   */
  private addTrail(parent: Object3D, at: [number, number, number], color: string, opacity: number, size: number): void {
    const source = new Object3D();
    source.position.set(...at);
    parent.add(source);
    this.trailSource = source;
    this.trailOpacity = opacity;
    this.trailSize = size;
    for (let i = 0; i < TRAIL_POOL; i++) {
      const material = new MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false });
      this.materials.push(material);
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.visible = false;
      this.trail.add(mesh);
      this.trailBits.push({ mesh, material, age: TRAIL_LIFE });
    }
  }

  /**
   * Drops streak bits along the source's path while `active` (filling in
   * between frames), and fades and shrinks the ones already out.
   */
  private updateTrail(dt: number, active: boolean): void {
    if (!this.trailSource) {
      return;
    }
    this.group.updateMatrixWorld(true);
    this.trailSource.getWorldPosition(this.trailAt);
    if (active) {
      const from = this.trailing ? this.trailWas : this.trailAt;
      for (let s = 1; s <= TRAIL_STEPS; s++) {
        const bit = this.trailBits[this.trailNext];
        this.trailNext = (this.trailNext + 1) % TRAIL_POOL;
        bit.mesh.position.copy(this.trailPoint.lerpVectors(from, this.trailAt, s / TRAIL_STEPS));
        bit.age = 0;
      }
    }
    this.trailing = active;
    this.trailWas.copy(this.trailAt);
    for (const bit of this.trailBits) {
      bit.age = Math.min(bit.age + dt, TRAIL_LIFE);
      const k = bit.age / TRAIL_LIFE;
      bit.mesh.visible = k < 1;
      bit.material.opacity = this.trailOpacity * (1 - k * k);
      bit.mesh.scale.setScalar(this.trailSize * (1 - k * 0.6));
    }
  }

  /**
   * A head with its edges trimmed: three overlapping boxes, wide, deep, and
   * tall, so the silhouette reads rounded in pixels.
   */
  private roundedBox([w, h, d]: [number, number, number], pos: [number, number, number], color: string): Mesh[] {
    return [
      this.box([w, h * 0.7, d * 0.78], pos, color),
      this.box([w * 0.78, h * 0.7, d], pos, color),
      this.box([w * 0.84, h, d * 0.84], pos, color),
    ];
  }

  private box(size: [number, number, number], pos: [number, number, number], color: string, glow = false): Mesh {
    const material = glow ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
    this.materials.push(material);
    if (material instanceof MeshLambertMaterial) {
      this.lit.push(material);
    }
    const mesh = new Mesh(UNIT_BOX, material);
    mesh.scale.set(...size);
    mesh.position.set(...pos);
    mesh.castShadow = !glow;
    if (glow) {
      mesh.layers.set(NO_BLOOM_LAYER);
    }
    return mesh;
  }

  /**
   * A zombie whose look is picked from its id: skin, clothes, hair, build,
   * a hunch, and sometimes a missing arm, showing ribs, or a slack jaw. A
   * piece of junk it carries sits in its hand, and a helmet or plate it
   * wears goes over its head or chest.
   */
  private buildZombie(id: number, held: GearKind | null, armor: MonsterArmor | null): void {
    const rand = seededRandom(id * 7919 + 13);
    const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)];
    const skin = pick(ZOMBIE_SKINS);
    const shirt = pick(ZOMBIE_SHIRTS);
    const pants = pick(ZOMBIE_PANTS);
    this.size = 0.9 + rand() * 0.2;
    this.hunch = rand() * 0.18;
    this.oneArmed = rand() < 0.15;

    const legL = this.box([0.14, 0.24, 0.14], [0, 0.12, -0.09], pants);
    const legR = this.box([0.14, 0.24, 0.14], [0, 0.12, 0.09], pants);
    this.limbs.push(legL, legR);
    this.group.add(legL, legR);
    this.body.add(this.box([0.28, 0.34, 0.4], [0, 0.41, 0], shirt));
    if (armor === 'plate') {
      this.body.add(
        this.box([0.32, 0.26, 0.44], [0.005, 0.45, 0], ARMOR_IRON),
        this.box([0.33, 0.04, 0.45], [0.005, 0.35, 0], ARMOR_DARK),
        this.box([0.02, 0.06, 0.08], [0.17, 0.5, 0.06], ARMOR_RUST),
      );
    }
    if (rand() < 0.6) {
      this.body.add(this.box([0.12, 0.1, 0.12], [0.1, 0.27 + rand() * 0.2, (rand() - 0.5) * 0.24], skin));
    }
    if (rand() < 0.2) {
      for (let i = 0; i < 3; i++) {
        this.body.add(this.box([0.02, 0.025, 0.18], [0.145, 0.38 + i * 0.06, 0], ZOMBIE_BONE));
      }
    }

    this.head.position.set(0.03, 0.58, 0);
    if (armor) {
      this.head.add(
        this.box([0.34, 0.1, 0.34], [-0.01, 0.27, 0], ARMOR_IRON),
        this.box([0.26, 0.06, 0.26], [-0.02, 0.34, 0], ARMOR_IRON),
        this.box([0.06, 0.12, 0.04], [0.17, 0.19, 0], ARMOR_DARK),
      );
    }
    this.head.add(
      ...this.roundedBox([0.3, 0.3, 0.3], [0, 0.14, 0], skin),
      this.box([0.02, 0.07, 0.07], [0.16, 0.16, -0.07], '#1a1a12'),
      this.box([0.02, 0.07, 0.07], [0.16, 0.16, 0.07], '#1a1a12'),
      this.box([0.03, 0.07, 0.07], [0.17, 0.16, -0.07], ZOMBIE_EYE, true),
      this.box([0.03, 0.05, 0.06], [0.17, 0.17, 0.08], ZOMBIE_EYE, true),
      rand() < 0.25
        ? this.box([0.03, 0.09, 0.14], [0.16, 0.01, 0.01], '#2a1a12')
        : this.box([0.02, 0.04, 0.14], [0.16, 0.05, 0.01], '#2a1a12'),
    );
    const hair = armor ? 1 : rand();
    const hairColor = pick(ZOMBIE_HAIR);
    if (hair < 0.3) {
      this.head.add(this.box([0.18, 0.06, 0.2], [-0.07, 0.31, 0.05], hairColor));
    } else if (hair < 0.55) {
      this.head.add(
        this.box([0.06, 0.08, 0.06], [-0.02, 0.32, -0.08], hairColor),
        this.box([0.06, 0.1, 0.06], [-0.08, 0.33, 0.06], hairColor),
      );
    } else if (hair < 0.75) {
      this.head.add(
        this.box([0.32, 0.06, 0.32], [-0.01, 0.31, 0], hairColor),
        this.box([0.06, 0.24, 0.3], [-0.15, 0.12, 0], hairColor),
      );
    }

    for (const [arm, side] of [[this.armL, -1], [this.armR, 1]] as const) {
      arm.position.set(0.02, 0.54, 0.24 * side);
      if (side === 1 && this.oneArmed) {
        arm.add(this.box([0.12, 0.1, 0.1], [0.04, 0, 0], shirt));
      } else {
        arm.add(
          this.box([0.36, 0.1, 0.1], [0.18, 0, 0], shirt),
          this.box([0.1, 0.09, 0.09], [0.4, 0, 0], skin),
        );
      }
    }
    if (held) {
      const weapon = new Group();
      weapon.add(...buildGearModel(held, (size, pos, color, glow) => this.box(size, pos, color, glow)).parts);
      weapon.position.set(0.4, 0, 0);
      weapon.rotation.z = Math.PI / 2 - 0.6;
      weapon.scale.setScalar(0.85);
      (this.oneArmed ? this.armL : this.armR).add(weapon);
    }
    this.body.add(this.head, this.armL, this.armR);
    this.droopL = rand() * 0.35;
    this.droopR = rand() * 0.35;
  }

  /**
   * A brute: a hulking, shirtless zombie built from rounded masses, not
   * slabs: short thick legs on hip pivots, a pot belly under a barrel
   * chest, a hump of shoulder muscle the small head sinks forward from
   * (heavy brow, underbite, tusks), and long arms of round shoulders,
   * swollen forearms, and big fists that hang near the ground. Junk sits
   * in its right fist; a helmet or plate (with pauldrons) goes on over.
   */
  private buildBrute(id: number, held: GearKind | null, armor: MonsterArmor | null): void {
    const rand = seededRandom(id * 7919 + 13);
    const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)];
    const skin = pick(BRUTE_SKINS);
    const pants = pick(ZOMBIE_PANTS);
    const dark = '#' + [1, 3, 5].map((i: number): string => Math.round(parseInt(skin.slice(i, i + 2), 16) * 0.78).toString(16).padStart(2, '0')).join('');
    this.size = 1.3 + rand() * 0.1;

    for (const side of [-1, 1]) {
      const leg = new Group();
      leg.position.set(0, 0.3, 0.13 * side);
      leg.add(
        ...this.roundedBox([0.2, 0.16, 0.2], [0, -0.07, 0], pants),
        ...this.roundedBox([0.17, 0.13, 0.17], [0.01, -0.19, 0], skin),
        ...this.roundedBox([0.24, 0.06, 0.18], [0.04, -0.27, 0], dark),
      );
      this.limbs.push(leg);
      this.group.add(leg);
    }
    this.body.add(
      ...this.roundedBox([0.3, 0.14, 0.42], [0, 0.34, 0], pants),
      this.box([0.34, 0.04, 0.46], [0.01, 0.4, 0], BRUTE_BELT),
      ...this.roundedBox([0.36, 0.2, 0.44], [0.04, 0.48, 0], skin),
      ...this.roundedBox([0.4, 0.24, 0.6], [0.01, 0.63, 0], skin),
      ...this.roundedBox([0.28, 0.14, 0.46], [-0.07, 0.77, 0], dark),
      this.box([0.03, 0.08, 0.18], [0.215, 0.63, -0.11], dark),
      this.box([0.03, 0.08, 0.18], [0.215, 0.63, 0.11], dark),
      this.box([0.03, 0.02, 0.14], [0.225, 0.5, 0.05], '#4a2a22'),
    );
    if (armor === 'plate') {
      this.body.add(
        ...this.roundedBox([0.44, 0.22, 0.64], [0.02, 0.64, 0], ARMOR_IRON),
        this.box([0.42, 0.04, 0.62], [0.02, 0.53, 0], ARMOR_DARK),
        this.box([0.02, 0.06, 0.08], [0.245, 0.68, -0.12], ARMOR_RUST),
      );
    }

    this.head.position.set(0.17, 0.72, 0);
    this.head.add(
      ...this.roundedBox([0.24, 0.22, 0.24], [0, 0.1, 0], skin),
      ...this.roundedBox([0.17, 0.09, 0.22], [0.06, -0.01, 0], dark),
      this.box([0.07, 0.05, 0.26], [0.1, 0.16, 0], dark),
      this.box([0.02, 0.035, 0.05], [0.125, 0.11, -0.06], ZOMBIE_EYE, true),
      this.box([0.02, 0.035, 0.05], [0.125, 0.11, 0.06], ZOMBIE_EYE, true),
      this.box([0.03, 0.06, 0.03], [0.14, 0.05, -0.07], BRUTE_TUSK),
      this.box([0.03, 0.06, 0.03], [0.14, 0.05, 0.07], BRUTE_TUSK),
    );
    if (armor) {
      this.head.add(
        ...this.roundedBox([0.28, 0.1, 0.28], [-0.01, 0.2, 0], ARMOR_IRON),
        ...this.roundedBox([0.2, 0.05, 0.2], [-0.02, 0.26, 0], ARMOR_IRON),
        this.box([0.03, 0.1, 0.04], [0.14, 0.13, 0], ARMOR_DARK),
      );
    }

    for (const [arm, side] of [[this.armL, -1], [this.armR, 1]] as const) {
      arm.position.set(0.02, 0.66, 0.37 * side);
      arm.add(
        ...this.roundedBox([0.2, 0.2, 0.2], [0, 0, 0], skin),
        ...this.roundedBox([0.24, 0.15, 0.15], [0.15, 0, 0], skin),
        ...this.roundedBox([0.24, 0.19, 0.19], [0.35, 0, 0], skin),
        ...this.roundedBox([0.17, 0.17, 0.17], [0.53, 0, 0], dark),
      );
      if (armor === 'plate') {
        arm.add(...this.roundedBox([0.24, 0.1, 0.24], [0, 0.09, 0], ARMOR_IRON));
      }
    }
    if (held) {
      const weapon = new Group();
      weapon.add(...buildGearModel(held, (size, pos, color, glow) => this.box(size, pos, color, glow)).parts);
      weapon.position.set(0.54, 0, 0);
      weapon.rotation.z = Math.PI / 2 - 0.6;
      weapon.scale.setScalar(0.85);
      this.armR.add(weapon);
    }
    this.body.add(this.head, this.armL, this.armR);
  }

  /**
   * A vampire in a dark suit with a two-piece cape (hinged at the shoulders
   * and halfway down, so it can billow and ripple), a high collar, slicked
   * hair with a widow's peak, glowing eyes, fangs, and clawed hands.
   */
  private buildVampire(): void {
    const legL = this.box([0.12, 0.26, 0.12], [0, 0.13, -0.08], VAMPIRE_SUIT);
    const legR = this.box([0.12, 0.26, 0.12], [0, 0.13, 0.08], VAMPIRE_SUIT);
    this.limbs.push(legL, legR);
    this.group.add(legL, legR);
    this.body.add(
      this.box([0.24, 0.36, 0.34], [0, 0.44, 0], VAMPIRE_SUIT),
      this.box([0.04, 0.2, 0.1], [0.12, 0.48, 0], '#e8e4ea'),
      this.box([0.02, 0.05, 0.05], [0.135, 0.57, 0], VAMPIRE_MEDALLION),
      this.box([0.08, 0.24, 0.44], [-0.09, 0.72, 0], VAMPIRE_LINING),
      this.box([0.05, 0.27, 0.5], [-0.13, 0.73, 0], VAMPIRE_CAPE),
    );

    this.head.position.set(0.02, 0.64, 0);
    this.head.add(
      ...this.roundedBox([0.26, 0.28, 0.28], [0, 0.13, 0], VAMPIRE_SKIN),
      this.box([0.28, 0.08, 0.3], [-0.02, 0.29, 0], VAMPIRE_HAIR),
      this.box([0.05, 0.07, 0.08], [0.12, 0.25, 0], VAMPIRE_HAIR),
      this.box([0.12, 0.14, 0.3], [-0.1, 0.2, 0], VAMPIRE_HAIR),
      this.box([0.03, 0.02, 0.09], [0.145, 0.2, -0.07], VAMPIRE_HAIR),
      this.box([0.03, 0.02, 0.09], [0.145, 0.2, 0.07], VAMPIRE_HAIR),
      this.box([0.03, 0.06, 0.08], [0.14, 0.15, -0.07], VAMPIRE_EYE, true),
      this.box([0.03, 0.06, 0.08], [0.14, 0.15, 0.07], VAMPIRE_EYE, true),
      this.box([0.02, 0.05, 0.02], [0.14, 0.03, -0.035], VAMPIRE_FANG),
      this.box([0.02, 0.05, 0.02], [0.14, 0.03, 0.035], VAMPIRE_FANG),
    );

    this.cape.position.set(-0.14, 0.66, 0);
    this.cape.add(
      this.box([0.05, 0.34, 0.52], [0, -0.17, 0], VAMPIRE_CAPE),
      this.box([0.02, 0.32, 0.46], [0.03, -0.17, 0], VAMPIRE_LINING),
    );
    this.capeLow.position.set(0, -0.33, 0);
    this.capeLow.add(
      this.box([0.05, 0.3, 0.56], [0, -0.15, 0], VAMPIRE_CAPE),
      this.box([0.02, 0.28, 0.5], [0.03, -0.14, 0], VAMPIRE_LINING),
      this.box([0.05, 0.07, 0.13], [0, -0.33, -0.2], VAMPIRE_CAPE),
      this.box([0.05, 0.05, 0.12], [0, -0.32, 0.02], VAMPIRE_CAPE),
      this.box([0.05, 0.08, 0.13], [0, -0.34, 0.21], VAMPIRE_CAPE),
    );
    this.cape.add(this.capeLow);

    for (const [arm, side] of [[this.armL, -1], [this.armR, 1]] as const) {
      arm.position.set(0, 0.58, 0.21 * side);
      arm.add(
        this.box([0.3, 0.1, 0.1], [0.14, 0, 0], VAMPIRE_SUIT),
        this.box([0.08, 0.08, 0.08], [0.32, 0, 0], VAMPIRE_SKIN),
        this.box([0.06, 0.02, 0.07], [0.38, -0.02, 0], VAMPIRE_FANG),
      );
    }
    this.body.add(this.head, this.cape, this.armL, this.armR);
  }

  /**
   * A skeleton archer: bone legs on hip pivots, a pelvis and spine, three
   * ribs over a sternum, a skull with dark sockets and pale pinpoint eyes,
   * thin jointed arms, and a recurve bow in its left hand. An arrow shows
   * on the string while it draws.
   */
  private buildSkeleton(id: number): void {
    const rand = seededRandom(id * 7919 + 13);
    const bone = SKELETON_BONES[Math.floor(rand() * SKELETON_BONES.length)];
    this.size = 0.95 + rand() * 0.1;
    for (const side of [-1, 1]) {
      const leg = new Group();
      leg.position.set(0, 0.27, 0.07 * side);
      leg.add(
        this.box([0.05, 0.13, 0.05], [0, -0.065, 0], bone),
        this.box([0.06, 0.04, 0.06], [0, -0.13, 0], SKELETON_JOINT),
        this.box([0.045, 0.13, 0.045], [0, -0.2, 0], bone),
        this.box([0.1, 0.03, 0.06], [0.03, -0.255, 0], bone),
      );
      this.limbs.push(leg);
      this.group.add(leg);
    }
    this.body.add(
      this.box([0.1, 0.06, 0.2], [0, 0.29, 0], bone),
      this.box([0.04, 0.2, 0.04], [-0.03, 0.4, 0], bone),
      this.box([0.15, 0.025, 0.24], [0.01, 0.4, 0], bone),
      this.box([0.16, 0.025, 0.26], [0.01, 0.45, 0], bone),
      this.box([0.15, 0.025, 0.24], [0.01, 0.5, 0], bone),
      this.box([0.03, 0.13, 0.04], [0.085, 0.45, 0], bone),
      this.box([0.05, 0.03, 0.32], [0, 0.55, 0], bone),
    );
    this.head.position.set(0.01, 0.58, 0);
    this.head.add(
      ...this.roundedBox([0.22, 0.19, 0.22], [0, 0.11, 0], bone),
      this.box([0.1, 0.05, 0.16], [0.05, 0, 0], SKELETON_JOINT),
      this.box([0.02, 0.06, 0.06], [0.105, 0.12, -0.05], SKELETON_SOCKET),
      this.box([0.02, 0.06, 0.06], [0.105, 0.12, 0.05], SKELETON_SOCKET),
      this.box([0.025, 0.025, 0.025], [0.11, 0.12, -0.05], SKELETON_EYE, true),
      this.box([0.025, 0.025, 0.025], [0.11, 0.12, 0.05], SKELETON_EYE, true),
      this.box([0.02, 0.035, 0.03], [0.11, 0.07, 0], SKELETON_SOCKET),
      this.box([0.02, 0.02, 0.1], [0.105, 0.025, 0], SKELETON_SOCKET),
    );
    for (const [arm, side] of [[this.armL, -1], [this.armR, 1]] as const) {
      arm.position.set(0.01, 0.54, 0.17 * side);
      arm.add(
        this.box([0.17, 0.035, 0.035], [0.085, 0, 0], bone),
        this.box([0.04, 0.04, 0.04], [0.17, 0, 0], SKELETON_JOINT),
        this.box([0.15, 0.03, 0.03], [0.26, 0, 0], bone),
        this.box([0.05, 0.045, 0.045], [0.35, 0, 0], bone),
      );
    }
    const bow = new Group();
    bow.position.set(0.36, 0, 0);
    const upper = this.box([0.03, 0.17, 0.03], [-0.02, 0.1, 0], BOW_WOOD);
    upper.rotation.z = 0.3;
    const lower = this.box([0.03, 0.17, 0.03], [-0.02, -0.1, 0], BOW_WOOD);
    lower.rotation.z = -0.3;
    bow.add(this.box([0.04, 0.07, 0.04], [0, 0, 0], BOW_WOOD), upper, lower, this.box([0.008, 0.36, 0.008], [-0.07, 0, 0], BOW_STRING));
    this.armL.add(bow);
    this.nocked = this.box([0.32, 0.015, 0.015], [0.27, 0.54, -0.07], ARROW_WOOD);
    this.nocked.visible = false;
    this.body.add(this.head, this.armL, this.armR, this.nocked);
  }

  /**
   * A witch: a bell of a robe in stepped layers with boots peeking out, a
   * green face with a long hooked nose and yellow eyes under stringy gray
   * hair, a tall pointed hat with a bent tip, a glowing purple potion in
   * her right hand and a broom in her left.
   */
  private buildWitch(id: number): void {
    const rand = seededRandom(id * 7919 + 13);
    const robe = WITCH_ROBES[Math.floor(rand() * WITCH_ROBES.length)];
    this.size = 0.95 + rand() * 0.1;
    for (const side of [-1, 1]) {
      const boot = this.box([0.12, 0.05, 0.08], [0.06, 0.025, 0.07 * side], WITCH_BOOT);
      this.limbs.push(boot);
      this.group.add(boot);
    }
    this.body.add(
      this.box([0.42, 0.12, 0.46], [-0.01, 0.1, 0], robe),
      this.box([0.36, 0.12, 0.4], [0, 0.21, 0], robe),
      this.box([0.3, 0.12, 0.34], [0, 0.32, 0], robe),
      this.box([0.27, 0.03, 0.31], [0, 0.39, 0], WITCH_BELT),
      this.box([0.26, 0.14, 0.3], [0, 0.44, 0], robe),
      this.box([0.22, 0.06, 0.34], [0, 0.53, 0], robe),
    );
    const tip = this.box([0.06, 0.09, 0.06], [-0.09, 0.49, 0], WITCH_HAT);
    tip.rotation.z = 0.5;
    this.head.position.set(0.04, 0.56, 0);
    this.head.add(
      ...this.roundedBox([0.19, 0.19, 0.19], [0, 0.1, 0], WITCH_SKIN),
      this.box([0.07, 0.035, 0.035], [0.12, 0.09, 0], WITCH_SKIN),
      this.box([0.03, 0.04, 0.035], [0.16, 0.07, 0], WITCH_SKIN),
      this.box([0.02, 0.03, 0.045], [0.1, 0.13, -0.045], WITCH_EYE, true),
      this.box([0.02, 0.03, 0.045], [0.1, 0.13, 0.045], WITCH_EYE, true),
      this.box([0.02, 0.02, 0.07], [0.1, 0.04, 0], '#2a1a14'),
      this.box([0.09, 0.24, 0.24], [-0.08, 0.04, 0], WITCH_HAIR),
      this.box([0.05, 0.16, 0.04], [0.02, 0.02, -0.11], WITCH_HAIR),
      this.box([0.05, 0.16, 0.04], [0.02, 0.02, 0.11], WITCH_HAIR),
      this.box([0.4, 0.03, 0.4], [-0.01, 0.21, 0], WITCH_HAT),
      this.box([0.21, 0.03, 0.21], [-0.01, 0.24, 0], WITCH_BAND),
      this.box([0.2, 0.08, 0.2], [-0.01, 0.27, 0], WITCH_HAT),
      this.box([0.15, 0.08, 0.15], [-0.03, 0.34, 0], WITCH_HAT),
      this.box([0.1, 0.08, 0.1], [-0.05, 0.41, 0], WITCH_HAT),
      tip,
    );
    for (const [arm, side] of [[this.armL, -1], [this.armR, 1]] as const) {
      arm.position.set(0.01, 0.49, 0.17 * side);
      arm.add(this.box([0.24, 0.09, 0.09], [0.12, 0, 0], robe), this.box([0.06, 0.06, 0.06], [0.28, 0, 0], WITCH_SKIN));
    }
    this.flask.position.set(0.31, 0.05, 0);
    this.flask.add(this.box([0.09, 0.09, 0.09], [0, 0, 0], POTION_PURPLE, true), this.box([0.035, 0.05, 0.035], [0, 0.065, 0], POTION_CORK));
    this.armR.add(this.flask);
    this.broom.position.set(0.28, 0, 0);
    this.broom.add(
      this.box([0.6, 0.025, 0.025], [0.08, 0, 0], BROOM_HANDLE),
      this.box([0.04, 0.05, 0.05], [0.37, 0, 0], BROOM_TIE),
      this.box([0.14, 0.08, 0.08], [0.45, 0, 0], BROOM_STRAW),
      this.box([0.06, 0.1, 0.1], [0.5, 0, 0], BROOM_STRAW),
    );
    this.armL.add(this.broom);
    this.body.add(this.head, this.armL, this.armR);
  }

  /**
   * A ghoul: a gaunt, gray-skinned person down on all fours in torn
   * clothes, hunched low with its shoulders below its hips. Long splayed
   * arms bend at the elbow; its long hind legs fold with the knees jutting
   * up above its back and its feet tucked under its middle, like a spider.
   * Its head hangs low between its shoulders under long black hair,
   * glowing eyes and an open mouth of teeth showing through. Each limb
   * bends at its middle joint.
   */
  private buildGhoul(id: number): void {
    const rand = seededRandom(id * 7919 + 13);
    const skin = GHOUL_SKINS[Math.floor(rand() * GHOUL_SKINS.length)];
    const shirt = pickFrom(rand, ZOMBIE_SHIRTS);
    const pants = pickFrom(rand, ZOMBIE_PANTS);
    const dark = '#' + [1, 3, 5].map((i: number): string => Math.round(parseInt(skin.slice(i, i + 2), 16) * 0.72).toString(16).padStart(2, '0')).join('');
    this.size = 1.2 + rand() * 0.15;
    this.body.add(
      ...this.roundedBox([0.15, 0.14, 0.22], [-0.2, 0.36, 0], pants),
      ...this.roundedBox([0.18, 0.13, 0.23], [-0.06, 0.32, 0], shirt),
      ...this.roundedBox([0.2, 0.14, 0.27], [0.1, 0.27, 0], shirt),
      this.box([0.07, 0.04, 0.29], [-0.04, 0.26, 0], dark),
      this.box([0.04, 0.025, 0.04], [-0.14, 0.44, 0], dark),
      this.box([0.04, 0.025, 0.04], [-0.04, 0.4, 0], dark),
      this.box([0.04, 0.025, 0.04], [0.06, 0.36, 0], dark),
      this.box([0.08, 0.04, 0.06], [0.1, 0.345, -0.08], skin),
      this.box([0.08, 0.04, 0.06], [0.1, 0.345, 0.08], skin),
    );
    this.head.position.set(0.22, 0.22, 0);
    this.head.add(
      ...this.roundedBox([0.16, 0.16, 0.15], [0.07, 0, 0], skin),
      this.box([0.15, 0.04, 0.16], [0.06, 0.085, 0], GHOUL_HAIR),
      this.box([0.12, 0.24, 0.04], [0.07, -0.08, -0.08], GHOUL_HAIR),
      this.box([0.12, 0.24, 0.04], [0.07, -0.08, 0.08], GHOUL_HAIR),
      this.box([0.04, 0.2, 0.15], [-0.01, -0.04, 0], GHOUL_HAIR),
      this.box([0.02, 0.022, 0.03], [0.15, 0.02, -0.04], GHOUL_EYE, true),
      this.box([0.02, 0.022, 0.03], [0.15, 0.02, 0.04], GHOUL_EYE, true),
      this.box([0.02, 0.05, 0.08], [0.15, -0.05, 0], '#1a0e0e'),
      this.box([0.022, 0.015, 0.07], [0.152, -0.03, 0], GHOUL_TEETH),
    );
    for (const side of [-1, 1]) {
      const upper = new Group();
      upper.position.set(0.14, 0.28, 0.15 * side);
      upper.rotation.x = 0.35 * side;
      const lower = new Group();
      lower.position.set(0, -0.17, 0);
      lower.add(
        this.box([0.045, 0.17, 0.045], [0, -0.085, 0], skin),
        this.box([0.09, 0.03, 0.07], [0.035, -0.17, 0], skin),
        this.box([0.035, 0.02, 0.07], [0.085, -0.175, 0], dark),
      );
      upper.add(this.box([0.055, 0.17, 0.055], [0, -0.085, 0], skin), this.box([0.07, 0.07, 0.07], [0, -0.03, 0], shirt), lower);
      this.crawl.push({ upper, lower, front: true, side });
      this.body.add(upper);
    }
    for (const side of [-1, 1]) {
      const upper = new Group();
      upper.position.set(-0.2, 0.34, 0.12 * side);
      upper.rotation.x = 0.45 * side;
      const lower = new Group();
      lower.position.set(0, 0.3, 0);
      lower.add(
        this.box([0.06, 0.58, 0.06], [0, -0.29, 0], pants),
        this.box([0.065, 0.06, 0.065], [0, 0, 0], dark),
        this.box([0.13, 0.04, 0.07], [0.04, -0.58, 0], skin),
      );
      upper.add(this.box([0.075, 0.3, 0.075], [0, 0.15, 0], pants), lower);
      this.crawl.push({ upper, lower, front: false, side });
      this.body.add(upper);
    }
    this.body.add(this.head);
  }

  /**
   * A demon: a ghost made of shadow, low to the ground. A dark torso and
   * hunched shoulders, and a horned head with slanted burning eyes and a
   * hinged jaw of pale fangs over an ember maw; behind, its body comes
   * apart into three rippling trails of smoke. Everything is see-through,
   * more so while it stalks (see `animateDemon`).
   */
  private buildDemon(): void {
    this.size = 1.2;
    this.body.add(
      ...this.roundedBox([0.34, 0.18, 0.36], [0.05, 0.3, 0], DEMON_SHADOW),
      ...this.roundedBox([0.2, 0.12, 0.42], [0.12, 0.38, 0], DEMON_HIDE),
      this.box([0.02, 0.08, 0.02], [0.225, 0.32, -0.07], DEMON_EMBER, true),
      this.box([0.02, 0.05, 0.02], [0.225, 0.29, 0.06], DEMON_EMBER, true),
    );
    for (const z of [-0.1, 0, 0.1]) {
      let parent: Group = this.body;
      const stream: Group[] = [];
      for (let i = 0; i < 4; i++) {
        const seg = new Group();
        seg.position.set(i === 0 ? -0.1 : -0.13, i === 0 ? 0.28 : -0.015, i === 0 ? z : 0);
        seg.add(this.box([0.16, 0.13 - i * 0.025, 0.14 - i * 0.025], [-0.07, 0, 0], i % 2 === 0 ? DEMON_SHADOW : DEMON_HIDE));
        parent.add(seg);
        stream.push(seg);
        parent = seg;
      }
      this.streams.push(stream);
    }
    const horn = (side: number): Group => {
      const g = new Group();
      g.position.set(-0.02, 0.15, 0.07 * side);
      g.rotation.x = 0.5 * side;
      const tip = this.box([0.03, 0.08, 0.03], [-0.03, 0.12, 0], DEMON_HORN);
      tip.rotation.z = 0.7;
      g.add(this.box([0.045, 0.09, 0.045], [0, 0.045, 0], DEMON_HORN), tip);
      return g;
    };
    const eye = (side: number): Mesh => {
      const mesh = this.box([0.02, 0.022, 0.055], [0.095, 0.1, 0.045 * side], DEMON_EYE, true);
      mesh.rotation.x = -0.35 * side;
      return mesh;
    };
    this.jaw.position.set(-0.04, 0.02, 0);
    this.jaw.add(
      this.box([0.17, 0.05, 0.16], [0.08, -0.025, 0], DEMON_HIDE),
      this.box([0.02, 0.035, 0.03], [0.155, 0.012, -0.05], DEMON_CLAW),
      this.box([0.02, 0.035, 0.03], [0.155, 0.012, 0.05], DEMON_CLAW),
      this.box([0.02, 0.025, 0.02], [0.155, 0.008, 0], DEMON_CLAW),
    );
    this.head.position.set(0.25, 0.37, 0);
    this.head.add(
      ...this.roundedBox([0.18, 0.13, 0.18], [0, 0.1, 0], DEMON_HIDE),
      eye(-1),
      eye(1),
      this.box([0.02, 0.03, 0.03], [0.09, 0.035, -0.05], DEMON_CLAW),
      this.box([0.02, 0.03, 0.03], [0.09, 0.035, 0.05], DEMON_CLAW),
      this.box([0.06, 0.03, 0.1], [0.05, 0.03, 0], DEMON_EMBER, true),
      horn(-1),
      horn(1),
      this.jaw,
    );
    this.body.add(this.head);
    for (const material of this.materials) {
      material.transparent = true;
      material.depthWrite = false;
    }
    this.body.traverse((o: Object3D): void => {
      o.castShadow = false;
    });
  }

  private buildGhost(): void {
    const material = new MeshBasicMaterial({ color: GHOST_BODY, transparent: true, opacity: GHOST_OPACITY, depthWrite: false });
    this.ghostMaterial = material;
    this.materials.push(material);
    const part = (size: [number, number, number], pos: [number, number, number]): Mesh => {
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.scale.set(...size);
      mesh.position.set(...pos);
      return mesh;
    };
    this.body.add(
      part([0.4, 0.34, 0.4], [0, 0.42, 0]),
      part([0.34, 0.16, 0.34], [0, 0.66, 0]),
      part([0.22, 0.08, 0.22], [0, 0.78, 0]),
      part([0.1, 0.2, 0.1], [0.04, 0.42, 0.26]),
      part([0.1, 0.2, 0.1], [0.04, 0.42, -0.26]),
      this.calmFace,
      this.madFace,
    );
    this.calmFace.add(
      this.box([0.02, 0.1, 0.07], [0.205, 0.58, -0.08], GHOST_FACE, true),
      this.box([0.02, 0.1, 0.07], [0.205, 0.58, 0.08], GHOST_FACE, true),
      this.box([0.02, 0.07, 0.1], [0.205, 0.44, 0], GHOST_FACE, true),
    );
    const brow = (side: number): Mesh => {
      const mesh = this.box([0.02, 0.035, 0.11], [0.207, 0.645, 0.08 * side], GHOST_FACE, true);
      mesh.rotation.x = 0.55 * side;
      return mesh;
    };
    this.madFace.add(
      brow(-1),
      brow(1),
      this.box([0.02, 0.06, 0.06], [0.206, 0.58, -0.08], GHOST_MAD, true),
      this.box([0.02, 0.06, 0.06], [0.206, 0.58, 0.08], GHOST_MAD, true),
      this.box([0.02, 0.035, 0.2], [0.205, 0.45, 0], GHOST_FACE, true),
      this.box([0.02, 0.04, 0.03], [0.206, 0.43, -0.07], GHOST_MAD, true),
      this.box([0.02, 0.04, 0.03], [0.206, 0.43, 0], GHOST_MAD, true),
      this.box([0.02, 0.04, 0.03], [0.206, 0.43, 0.07], GHOST_MAD, true),
    );
    this.madFace.visible = false;
    for (const [ox, oz] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) {
      const wisp = part([0.14, 0.18, 0.14], [ox, 0.17, oz]);
      this.tail.push(wisp);
      this.body.add(wisp);
    }
  }

  /**
   * Kicks the legs and flaps the arms while held up by the TV's mouse,
   * `amount` 0 (on the ground) to 1. Runs after `update`. Ghosts just
   * swing.
   */
  flail(amount: number, time: number): void {
    const kick = Math.sin(time * 13 + this.phase) * 0.6 * amount;
    if (this.limbs.length === 2) {
      this.limbs[0].rotation.z = kick;
      this.limbs[1].rotation.z = -kick;
    }
    if (amount > 0 && this.target.kind !== 'ghost') {
      this.armL.rotation.z += Math.sin(time * 9) * 0.6 * amount;
      this.armR.rotation.z += Math.sin(time * 9 + 2.5) * 0.6 * amount;
      this.head.rotation.z += Math.sin(time * 5) * 0.25 * amount;
    }
  }

  /**
   * Advances smoothing and animation by `dt` seconds.
   */
  update(dt: number, time: number, groundHeight: number): void {
    const t = this.target;
    if (t.swipes !== this.swipes) {
      this.swipes = t.swipes;
      this.swipeAge = 0;
    }
    this.swipeAge = Math.min(this.swipeAge + dt, WITCH_SWIPE.windup + SWIPE_FOLLOW);
    if (t.blinks !== this.blinks) {
      this.blinks = t.blinks;
      this.blinkAge = 0;
      this.x = t.x;
      this.y = t.y;
      this.facing = t.facing;
    }
    this.blinkAge = Math.min(this.blinkAge + dt, BLINK_FADE);
    const wasX = this.x;
    const wasY = this.y;
    const k = 1 - Math.exp(-FOLLOW_RATE * dt);
    this.x += (t.x - this.x) * k;
    this.y += (t.y - this.y) * k;
    this.elevation += (groundHeight - this.elevation) * k;
    if (dt > 0) {
      this.pace += (Math.hypot(this.x - wasX, this.y - wasY) / dt - this.pace) * Math.min(1, dt * 8);
    }
    if (t.moving) {
      this.phase += dt * GAIT[t.kind] * Math.min(1.3, Math.max(0.15, this.pace / MONSTERS[t.kind].speed));
    }
    const turn = angleDelta(this.facing, t.facing) * k;
    const maxTurn = TURN_RATE[t.kind] * dt;
    this.facing += Math.max(-maxTurn, Math.min(maxTurn, turn));

    if (t.attacks !== this.attacks) {
      this.attacks = t.attacks;
      this.lungeAge = -this.windup;
      this.attackAge = 0;
      this.slammed = false;
    }
    this.lungeAge = Math.min(this.lungeAge + dt, LUNGE_TIME);
    this.attackAge = Math.min(this.attackAge + dt, this.attackTime);
    const lunge = this.lungeAge > 0 ? Math.sin((this.lungeAge / LUNGE_TIME) * Math.PI) : 0;
    const coil = this.lungeAge < 0 && this.windup > 0 ? 1 + this.lungeAge / this.windup : 0;

    if (t.stumbles !== this.stumbles) {
      this.stumbles = t.stumbles;
      this.stumbleAge = 0;
      this.stumbleSide = Math.random() < 0.5 ? -1 : 1;
    }
    this.stumbleAge = Math.min(this.stumbleAge + dt, STUMBLE_TIME);
    const s = this.stumbleAge / STUMBLE_TIME;
    const trip = s < 1 ? Math.sin(Math.min(1, s * 2.5) * Math.PI / 2) * (1 - s) : 0;

    const stride = t.moving ? Math.sin(this.phase) : 0;
    if (this.limbs.length === 2) {
      this.limbs[0].position.x = stride * 0.08;
      this.limbs[1].position.x = -stride * 0.08;
    }
    this.springKick(dt);
    if (isZombie(t.kind)) {
      if (t.kind === 'brute') {
        this.animateBrute(dt, time, stride, trip);
      } else {
        this.animateZombie(dt, time, stride, trip);
      }
      this.head.rotation.y += this.kickYaw;
      this.head.rotation.z += this.kickPitch;
      this.body.rotation.z += this.recoil;
    } else if (t.kind === 'vampire') {
      this.animateVampire(dt, time, stride, lunge, coil);
      this.head.rotation.y += this.kickYaw;
      this.head.rotation.z += this.kickPitch;
    } else if (t.kind !== 'ghost') {
      if (t.kind === 'skeleton') {
        this.animateSkeleton(time, stride);
      } else if (t.kind === 'witch') {
        this.animateWitch(time, stride);
      } else if (t.kind === 'ghoul') {
        this.animateGhoul(dt, time);
      } else {
        this.animateDemon(dt, time);
      }
      this.head.rotation.y += this.kickYaw;
      this.head.rotation.z += this.kickPitch;
      this.body.rotation.z += this.recoil;
    } else {
      this.body.position.y = GHOST_HEIGHT + Math.sin(time * 2.4 + this.phase) * 0.06;
      this.tail.forEach((wisp: Mesh, i: number): void => {
        wisp.position.y = 0.17 + Math.sin(time * 6 + i * 1.7) * 0.04;
      });
      this.calmFace.visible = !t.hunting;
      this.madFace.visible = t.hunting;
      const pulse = t.draining ? 0.5 + 0.5 * Math.sin(time * 10) : t.hunting ? 0.25 + 0.25 * Math.sin(time * 6) : 0;
      this.body.scale.setScalar(1 + pulse * 0.08);
      this.ghostMaterial!.opacity = GHOST_OPACITY + pulse * 0.3;
    }

    const { x, z } = toWorld(this.x, this.y);
    this.group.position.set(x, this.elevation, z);
    this.group.rotation.y = -this.facing;
    const swing = t.kind === 'brute'
      ? this.attackAge >= BRUTE_WINDUP * 0.85 && this.attackAge < BRUTE_WINDUP + BRUTE_SLAM_TIME + 0.04
      : this.swipeAge >= WITCH_SWIPE.windup * 0.9 && this.swipeAge < WITCH_SWIPE.windup + 0.16;
    this.updateTrail(dt, swing);

    if (t.hurts !== this.hurts) {
      this.hurts = t.hurts;
      this.hurtAge = 0;
    }
    this.hurtAge = Math.min(this.hurtAge + dt, HURT_FLASH_TIME);
    const flash = 1 - this.hurtAge / HURT_FLASH_TIME;
    for (const m of this.lit) {
      m.emissive.set(HURT_COLOR).multiplyScalar(flash);
    }
  }

  /**
   * Lurching sway kept small enough to stay inside its tile, plus a mood
   * that sets the arms and head: reaching out (always while hunting), hanging
   * limp with the head down, one arm up, or standing and slowly scanning
   * around. Poses blend into each other. A stumble buckles the knees and
   * flails the arms.
   */
  private animateZombie(dt: number, time: number, stride: number, trip: number): void {
    const t = this.target;
    const { raise, slam } = this.attackPose();
    const attacking = raise > 0 || slam > 0;
    if (t.hunting) {
      this.mood = 'reach';
      this.moodUntil = time + 1;
    } else if (time >= this.moodUntil) {
      let roll = Math.random();
      this.mood = MOODS.find(([, weight]): boolean => (roll -= weight) < 0)?.[0] ?? 'slack';
      this.moodUntil = time + MOOD_MIN + Math.random() * MOOD_SPREAD;
      this.raisedSide = Math.random() < 0.5 ? 1 : -1;
    }

    const slack = this.mood === 'slack';
    this.body.rotation.x = Math.sin(this.phase * 0.5) * 0.1 + Math.sin(time * 0.7 + this.phase) * 0.04 + trip * 0.12 * this.stumbleSide;
    this.body.rotation.z = -0.1 - this.hunch - (slack ? 0.06 : 0) + raise * 0.15 - slam * 0.35 - trip * 0.18;
    this.body.position.x = slam * 0.16;
    this.body.position.y = -trip * 0.05;

    if (time >= this.nextLookAt) {
      this.nextLookAt = time + 2 + Math.random() * 4;
      this.headTarget = (Math.random() * 2 - 1) * HEAD_TURN * (t.moving ? 0.5 : 1);
      this.headSpeed = Math.random() < 0.15 ? HEAD_SNAP : HEAD_CREEP;
      if (Math.random() < 0.3) {
        this.droopL = Math.random() * 0.35;
        this.droopR = Math.random() * 0.35;
      }
    }
    let yaw = this.headTarget;
    let pitch = 0;
    if (t.hunting || attacking) {
      yaw = this.headTarget * 0.2;
    } else if (this.mood === 'look') {
      yaw = Math.sin(time * 0.5 + this.phase) * HEAD_TURN;
    } else if (slack) {
      yaw = this.headTarget * 0.4;
      pitch = -0.4;
    }
    const ease = Math.min(1, dt * this.headSpeed);
    this.headYaw += (yaw - this.headYaw) * ease;
    this.headPitch += (pitch - this.headPitch) * Math.min(1, dt * 1.5);
    this.head.rotation.y = this.headYaw;
    this.head.rotation.x = 0.12 + Math.sin(time * 0.9 + this.phase) * 0.08;
    this.head.rotation.z = this.headPitch + Math.abs(stride) * 0.06 - trip * 0.2 + raise * 0.25 - slam * 0.45;

    const pose = (side: number): number => {
      switch (this.mood) {
        case 'slack': return ARM_DOWN;
        case 'look': return ARM_HALF;
        case 'one-up': return side === this.raisedSide ? ARM_OUT : ARM_DOWN;
        default: return ARM_OUT;
      }
    };
    const blend = Math.min(1, dt * 2);
    this.armBaseL += (pose(1) - this.armBaseL) * blend;
    this.armBaseR += (pose(-1) - this.armBaseR) * blend;
    const swing = slack ? 0.3 : 0.18;
    const flail = Math.sin(this.stumbleAge * 24) * trip;
    for (const [arm, base, droop, side] of [[this.armL, this.armBaseL, this.droopL, 1], [this.armR, this.armBaseR, this.droopR, -1]] as const) {
      arm.rotation.z = base - droop + stride * swing * side + Math.sin(time * 1.1 + this.phase + side) * 0.08 + raise * 1.1 - slam * 0.9 + flail * 0.5 * side;
      arm.rotation.y = Math.sin(time * 0.7 + this.phase * side) * 0.12 * side;
      arm.rotation.x = flail * 0.4 * side;
    }
  }

  /**
   * A brute moves with weight: each footfall drops the body and nods the
   * head, it rolls from leg to leg, breathes heavily standing still, and its
   * arms hang on loose springs so they lag and swing. Its swing heaves both
   * fists slowly over its head, leaning back (trembling at the top), then
   * hammers them down in front with a crouch and a lunge, and it takes a
   * moment to straighten up.
   */
  private animateBrute(dt: number, time: number, stride: number, trip: number): void {
    const t = this.target;
    const a = this.attackAge;
    let raise = 0;
    let slam = 0;
    if (a < BRUTE_WINDUP) {
      const w = a / BRUTE_WINDUP;
      raise = w * w * (3 - 2 * w);
    } else if (a < BRUTE_WINDUP + BRUTE_SLAM_TIME) {
      const s = (a - BRUTE_WINDUP) / BRUTE_SLAM_TIME;
      raise = 1 - s;
      slam = s * s;
    } else if (a < this.attackTime) {
      const r = (a - BRUTE_WINDUP - BRUTE_SLAM_TIME) / BRUTE_RECOVER;
      slam = (1 - r) * (1 - r);
    }
    if (!this.slammed && a >= BRUTE_WINDUP + BRUTE_SLAM_TIME * 0.8) {
      this.slammed = true;
      this.impactCount++;
      this.slamQuake = BRUTE_SLAM_QUAKE;
    }
    const attacking = raise > 0 || slam > 0;
    const step = t.moving ? Math.abs(stride) ** 4 : 0;
    this.slamQuake = Math.max(0, this.slamQuake - (BRUTE_SLAM_QUAKE / BRUTE_QUAKE_FADE) * dt);
    this.quake = (t.moving ? BRUTE_WALK_QUAKE + step * BRUTE_STEP_QUAKE : 0) + this.slamQuake;
    const breathe = Math.sin(time * 1.4 + this.phase);
    const tremble = raise > 0.85 && slam === 0 ? Math.sin(time * 45) * 0.03 : 0;

    for (const [i, limb] of this.limbs.entries()) {
      limb.position.x = 0;
      limb.rotation.z = (i === 0 ? 1 : -1) * stride * 0.5;
    }
    const weight = t.moving ? Math.sin(this.phase - 0.6) : 0;
    const lean = -0.28 + raise * 0.4 - slam * 0.35 + breathe * 0.015 - trip * 0.12;
    this.body.rotation.z = lean;
    this.body.position.x = BRUTE_HIP * Math.sin(lean) + slam * 0.1 - raise * 0.04;
    this.body.position.y = BRUTE_HIP * (1 - Math.cos(lean)) - step * 0.05 + breathe * 0.006 + raise * 0.04 - slam * 0.08 - trip * 0.05;
    this.body.rotation.x = weight * BRUTE_ROLL + trip * 0.1 * this.stumbleSide + tremble;
    this.body.position.z = weight * BRUTE_SHIFT;

    if (time >= this.nextLookAt) {
      this.nextLookAt = time + 3 + Math.random() * 4;
      this.headTarget = (Math.random() * 2 - 1) * HEAD_TURN * 0.6;
    }
    this.headYaw += ((t.hunting || attacking ? 0 : this.headTarget) - this.headYaw) * Math.min(1, dt * 1.2);
    this.head.rotation.y = this.headYaw;
    this.head.rotation.x = 0;
    this.head.rotation.z = -0.1 + step * 0.12 + raise * 0.3 - slam * 0.3 + breathe * 0.03;

    for (const [i, arm] of [this.armL, this.armR].entries()) {
      const side = i === 0 ? 1 : -1;
      if (attacking) {
        this.armAngle[i] = BRUTE_ARM_HANG + raise * 3.5 + slam * 0.8 + tremble;
        this.armSpeed[i] = 0;
      } else {
        const want = BRUTE_ARM_HANG + (t.hunting ? 0.3 : 0) + stride * 0.35 * side - step * 0.15 + breathe * 0.03;
        this.armSpeed[i] += (BRUTE_ARM_STIFFNESS * (want - this.armAngle[i]) - BRUTE_ARM_DAMPING * this.armSpeed[i]) * Math.min(dt, 1 / 30);
        this.armAngle[i] += this.armSpeed[i] * Math.min(dt, 1 / 30);
      }
      arm.rotation.z = this.armAngle[i];
      arm.rotation.y = 0;
      arm.rotation.x = stride * 0.06 * side;
    }
  }

  /**
   * A vampire hovers a little and bobs when it isn't moving, glides leaning
   * forward with its arms swept back and its cape streaming out behind
   * when it is, and lunges with its claws out and its cape flaring when it
   * strikes. Idle, it stands still, hides behind its cape, looks around, or
   * looms with its arms and cape spread; hunting, it stalks with claws
   * raised and eyes ahead. The cape always ripples, lower half lagging.
   */
  private animateVampire(dt: number, time: number, stride: number, lunge: number, coil: number): void {
    const t = this.target;
    if (t.hunting) {
      this.moodUntil = time + 1;
    } else if (time >= this.moodUntil) {
      let roll = Math.random();
      this.vampireMood = VAMPIRE_MOODS.find(([, weight]): boolean => (roll -= weight) < 0)?.[0] ?? 'still';
      this.moodUntil = time + MOOD_MIN + Math.random() * MOOD_SPREAD;
      this.raisedSide = Math.random() < 0.5 ? 1 : -1;
    }
    const mood: VampireMood | 'stalk' = t.hunting ? 'stalk' : this.vampireMood;
    this.capeLift += ((t.moving ? 1 : 0) - this.capeLift) * Math.min(1, dt * 4);
    const lift = this.capeLift;
    const loom = mood === 'loom' && !t.moving ? 1 : 0;

    for (const limb of this.limbs) {
      limb.position.x *= 0.6;
    }
    this.body.position.y = (1 - lift) * (VAMPIRE_HOVER + Math.sin(time * 2 + this.phase) * VAMPIRE_BOB) + Math.abs(stride) * 0.015;
    this.body.position.x = lunge * 0.14;
    this.body.rotation.z = -0.38 * lift - (mood === 'stalk' && !t.moving ? 0.12 : 0) + loom * 0.06 - lunge * 0.35 + coil * 0.22 + this.recoil;
    this.body.rotation.x = Math.sin(time * 0.8 + this.phase) * 0.03;

    if (time >= this.nextLookAt) {
      this.nextLookAt = time + 1.5 + Math.random() * 3;
      this.headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    const yaw = mood === 'stalk' || t.moving ? 0 : mood === 'scan' ? Math.sin(time * 0.6 + this.phase) * HEAD_TURN : this.headTarget * 0.4;
    this.headYaw += (yaw - this.headYaw) * Math.min(1, dt * 3);
    this.head.rotation.y = this.headYaw;
    this.head.rotation.z = (mood === 'stalk' ? -0.15 : 0.05) + lift * 0.25 + Math.sin(time * 1.3 + this.phase) * 0.03 - lunge * 0.2;

    const hang = -1.45;
    let armL = { z: hang, x: 0, y: 0 };
    let armR = { z: hang, x: 0, y: 0 };
    if (lunge > 0.01) {
      armL = { z: -0.15 + lunge * 0.2, x: 0, y: 0.15 };
      armR = { z: -0.15 + lunge * 0.2, x: 0, y: -0.15 };
    } else if (coil > 0.01) {
      armL = { z: -0.3 + coil * 0.75, x: 0, y: 0.4 };
      armR = { z: -0.3 + coil * 0.75, x: 0, y: -0.4 };
    } else if (lift > 0.5) {
      armL = { z: -2.3, x: 0, y: 0 };
      armR = { z: -2.3, x: 0, y: 0 };
    } else if (mood === 'stalk') {
      armL = { z: -0.55 + Math.sin(time * 5) * 0.06, x: 0, y: 0.25 };
      armR = { z: -0.55 + Math.sin(time * 5 + 1) * 0.06, x: 0, y: -0.25 };
    } else if (mood === 'cloak') {
      const raised = { z: 0.15, x: 0, y: -0.95 * this.raisedSide };
      armL = this.raisedSide === -1 ? raised : armL;
      armR = this.raisedSide === 1 ? raised : armR;
    } else if (mood === 'loom') {
      armL = { z: -0.5, x: -1.1, y: 0 };
      armR = { z: -0.5, x: 1.1, y: 0 };
    }
    const ease = Math.min(1, dt * (lunge > 0.01 || coil > 0.01 ? 20 : 5));
    for (const [arm, pose, side] of [[this.armL, armL, -1], [this.armR, armR, 1]] as const) {
      arm.rotation.z += (pose.z + Math.sin(time * 1.4 + this.phase + side) * 0.04 - arm.rotation.z) * ease;
      arm.rotation.x += (pose.x - arm.rotation.x) * ease;
      arm.rotation.y += (pose.y - arm.rotation.y) * ease;
    }

    const flutter = 2 + lift * 9;
    const cloak = mood === 'cloak' && !t.moving ? 1 : 0;
    this.cape.rotation.z = -(0.06 + lift * 0.8 + loom * 0.25 + lunge * 0.5) + Math.sin(time * flutter + this.phase) * (0.04 + lift * 0.1);
    this.capeLow.rotation.z = -lift * 0.35 + Math.sin(time * flutter + this.phase - 1.1) * (0.06 + lift * 0.22);
    this.cape.rotation.x = Math.sin(time * 1.7 + this.phase) * 0.05 * (1 + lift) + cloak * 0.35 * this.raisedSide;
    this.cape.scale.z = 1 + loom * 0.35 + lunge * 0.3 + cloak * 0.15;
  }

  /**
   * How far into its attack one of the newer kinds is: `charge` (0..1,
   * eased) builds through the windup and lets go just after, and `strike`
   * (0..1) snaps up as the attack lands and fades through the follow
   * through.
   */
  private attackPhase(): { charge: number; strike: number } {
    const a = this.attackAge;
    if (a >= this.attackTime) {
      return { charge: 0, strike: 0 };
    }
    if (a < this.windup) {
      const t = a / this.windup;
      return { charge: t * t * (3 - 2 * t), strike: 0 };
    }
    const s = (a - this.windup) / (this.attackTime - this.windup);
    return { charge: Math.max(0, 1 - s * 4), strike: s < 0.2 ? s / 0.2 : (1 - s) / 0.8 };
  }

  /**
   * Idles with its head snapping from side to side, every bone rattling a
   * little. To shoot, it raises the bow at arm's length and draws the
   * string back to its chest with an arrow nocked, leaning back, then
   * looses and lowers it.
   */
  private animateSkeleton(time: number, stride: number): void {
    const t = this.target;
    const { charge, strike } = this.attackPhase();
    const aim = Math.max(charge, Math.min(1, strike * 1.5));
    for (const [i, limb] of this.limbs.entries()) {
      limb.position.x = 0;
      limb.rotation.z = (i === 0 ? 1 : -1) * stride * 0.55;
    }
    this.body.position.y = Math.abs(stride) * 0.02;
    this.body.rotation.z = -0.05 + charge * 0.12 - strike * 0.06;
    this.body.rotation.x = Math.sin(time * 9 + this.phase) * 0.015 * (t.moving ? 1 : 0.4);
    if (time >= this.nextLookAt) {
      this.nextLookAt = time + 1 + Math.random() * 3;
      this.headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this.head.rotation.y = t.hunting || aim > 0 ? 0 : this.headTarget;
    this.head.rotation.z = (t.hunting ? -0.05 : 0.05) + Math.sin(time * 1.3 + this.phase) * 0.03;
    const hang = t.hunting ? ARM_HALF : ARM_DOWN;
    this.armL.rotation.z = mix(hang + stride * 0.3, 0, aim);
    this.armL.rotation.y = -0.3 * aim;
    this.armR.rotation.z = mix(hang - stride * 0.3, 0.05, aim);
    this.armR.rotation.y = 0.75 * charge;
    this.armR.position.x = 0.01 - 0.08 * charge;
    this.nocked!.visible = charge > 0.05 && strike === 0;
  }

  /**
   * Hobbles hunched with her robe swaying. To throw, she points at her
   * target with her free hand and draws the potion back over her shoulder,
   * leaning back, then hurls it forward (it's gone from her hand until the
   * next one).
   */
  private animateWitch(time: number, stride: number): void {
    const t = this.target;
    const a = this.attackAge;
    const { charge, strike } = this.attackPhase();
    const throwing = a < this.attackTime;
    this.body.position.y = Math.abs(stride) * 0.015 + Math.sin(time * 2 + this.phase) * 0.008;
    this.body.rotation.z = -0.14 + charge * 0.18 - strike * 0.22;
    this.body.rotation.x = stride * 0.07 + Math.sin(time * 1.3 + this.phase) * 0.025;
    if (time >= this.nextLookAt) {
      this.nextLookAt = time + 2 + Math.random() * 3;
      this.headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this.head.rotation.y = t.hunting || throwing ? 0 : this.headTarget * 0.7;
    this.head.rotation.z = -0.08 + charge * 0.2 - strike * 0.1;
    let arm = t.hunting ? -0.9 : -1.2 + stride * 0.2;
    if (a < this.windup) {
      arm = mix(arm, 2.6, charge);
    } else if (throwing) {
      const s = (a - this.windup) / (this.attackTime - this.windup);
      arm = s < 0.2 ? mix(2.6, -0.1, s / 0.2) : mix(-0.1, -0.9, (s - 0.2) / 0.8);
    }
    this.armR.rotation.z = arm;
    this.flask.visible = !(a >= this.windup && throwing);
    const sw = this.swipeAge;
    const sweep = WITCH_SWIPE.windup;
    let broomZ = mix(t.hunting ? -0.6 : -0.75 - stride * 0.15, -0.05, charge);
    let broomY = -0.25 * charge;
    let twist = 0;
    if (sw < sweep) {
      const k = sw / sweep;
      const e = k * k * (3 - 2 * k);
      broomZ = mix(broomZ, -0.15, e);
      broomY = mix(broomY, 1.3, e);
      twist = 0.35 * e;
    } else if (sw < sweep + SWIPE_FOLLOW) {
      const k = (sw - sweep) / SWIPE_FOLLOW;
      const fast = Math.min(1, k / 0.35);
      broomZ = mix(-0.15, broomZ, Math.max(0, (k - 0.35) / 0.65));
      broomY = mix(mix(1.3, -1.5, fast), broomY, Math.max(0, (k - 0.35) / 0.65));
      twist = mix(mix(0.35, -0.45, fast), 0, Math.max(0, (k - 0.35) / 0.65));
    }
    this.armL.rotation.z = broomZ;
    this.armL.rotation.y = broomY;
    this.body.rotation.y = twist;
  }

  /**
   * Bounds along low on hands and feet: both hands reach out together,
   * then both feet, the body rocking front to back and the joints folding
   * as each pair lifts, the head twitching. Its legs keep pace with how
   * fast it's really going (see `update`). To pounce it gathers itself
   * lower still, arms and legs folded under it, knees high, then springs:
   * arms reaching out ahead, legs flung back straight, nose up then down as
   * it lands.
   */
  private animateGhoul(dt: number, time: number): void {
    const t = this.target;
    const a = this.attackAge;
    const crouch = a < this.windup ? (a / this.windup) ** 0.6 : 0;
    const leap = a >= this.windup && a < this.windup + GHOUL_LEAP_TIME ? (a - this.windup) / GHOUL_LEAP_TIME : 0;
    const air = Math.sin(leap * Math.PI);
    const stretch = leap > 0 ? Math.min(1, (1 - leap) * 4, leap * 6) : 0;
    const run = t.moving && leap === 0 ? 1 : 0;
    const ph = this.phase;
    for (const limb of this.crawl) {
      const at = ph + (limb.front ? 0 : Math.PI);
      const swing = Math.sin(at) * run;
      const lift = Math.max(0, Math.cos(at)) * run;
      const rest = limb.front ? [0.35 + swing * 0.6, -0.5 - lift * 0.6] : [-0.75 + swing * 0.4, 0.85 + lift * 0.3];
      const coiled = limb.front ? [0.6, -1.1] : [-1.05, 1.4];
      const flung = limb.front ? [1.4, -0.2] : [-0.1, 0.3];
      limb.upper.rotation.z = mix(mix(rest[0], coiled[0], crouch), flung[0], stretch);
      limb.lower.rotation.z = mix(mix(rest[1], coiled[1], crouch), flung[1], stretch);
    }
    this.body.position.y = run * Math.abs(Math.sin(ph)) * 0.035 - crouch * 0.07 + air * 0.3 + (run ? 0 : Math.sin(time * 2.2 + ph) * 0.005);
    this.body.rotation.z = run * Math.sin(ph) * 0.09 - crouch * 0.06 + (leap > 0 ? 0.2 * Math.cos(leap * Math.PI) : 0);
    this.body.rotation.x = 0;
    if (time >= this.nextLookAt) {
      this.nextLookAt = time + 0.3 + Math.random() * 1.5;
      this.headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this.headYaw += ((t.hunting || crouch > 0 ? 0 : this.headTarget) - this.headYaw) * Math.min(1, dt * 14);
    this.head.rotation.y = this.headYaw;
    this.head.rotation.z = 0.2 + crouch * 0.3 + Math.sin(time * 3 + ph) * 0.03;
  }

  /**
   * Slithers low to the ground, swaying side to side as it goes, its trails
   * of smoke rippling out behind (harder when it moves, still while it
   * attacks). To bite it rears its head back and up with its jaw gaping,
   * then lunges and snaps it shut. It's faint while it stalks someone and
   * turns solid as it attacks; just after stepping out of the shadows it's
   * squashed flat and pulls itself up.
   */
  private animateDemon(dt: number, time: number): void {
    const t = this.target;
    const { charge, strike } = this.attackPhase();
    const attacking = Math.max(charge, strike);
    this.capeLift += ((t.moving && attacking === 0 ? 1 : 0) - this.capeLift) * Math.min(1, dt * 4);
    const move = this.capeLift;
    const ph = this.phase;
    this.body.position.y = 0.03 + Math.sin(time * 1.8 + ph) * 0.015 + charge * 0.06;
    this.body.position.x = strike * 0.1;
    this.body.rotation.z = Math.sin(time * 1.1 + ph) * 0.03 + charge * 0.2 - strike * 0.2;
    this.body.rotation.x = Math.sin(ph) * 0.08 * move;
    this.body.rotation.y = Math.sin(ph) * 0.18 * move;
    const calm = 1 - 0.75 * attacking;
    this.streams.forEach((stream: Group[], s: number): void => {
      stream.forEach((seg: Group, i: number): void => {
        seg.rotation.y = Math.sin(time * (3 + move * 2) + i * 0.9 + s * 1.7) * (0.25 + move * 0.2) * calm;
        seg.rotation.z = (Math.sin(time * 2.3 + i * 1.1 + s) * 0.18 + 0.05 * i) * calm;
      });
    });
    if (time >= this.nextLookAt) {
      this.nextLookAt = time + 2 + Math.random() * 3;
      this.headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this.head.rotation.y = t.hunting || attacking > 0 ? 0 : this.headTarget * 0.6;
    this.head.rotation.z = -0.05 + charge * 0.45 - strike * 0.35;
    this.head.position.x = 0.25 - charge * 0.07 + strike * 0.12;
    this.jaw.rotation.z = -0.95 * charge - 0.15 * (t.hunting && attacking === 0 ? 1 : 0) - Math.max(0, 0.6 - strike * 3) * (strike > 0 ? 1 : 0);
    const s = this.blinkAge / BLINK_FADE;
    this.body.scale.set(1.4 - 0.4 * s, 0.2 + 0.8 * s, 1.4 - 0.4 * s);
    const want = attacking > 0 ? DEMON_SOLID : t.hunting ? DEMON_STALK : DEMON_IDLE;
    this.fade += (want - this.fade) * Math.min(1, dt * (want > this.fade ? 10 : 2));
    for (const material of this.materials) {
      material.opacity = material instanceof MeshBasicMaterial ? Math.min(1, this.fade * 1.4) : this.fade;
    }
  }

  /**
   * How far into its attack a zombie is: `raise` (0..1) rears the arms and
   * head up, then `slam` (0..1) drives them down with a lunge.
   */
  private attackPose(): { raise: number; slam: number } {
    const a = this.attackAge / ZOMBIE_ATTACK_TIME;
    if (a >= 1) {
      return { raise: 0, slam: 0 };
    }
    if (a < ZOMBIE_REAR_END) {
      const t = a / ZOMBIE_REAR_END;
      return { raise: 1 - (1 - t) * (1 - t), slam: 0 };
    }
    if (a < ZOMBIE_SLAM_END) {
      const t = (a - ZOMBIE_REAR_END) / (ZOMBIE_SLAM_END - ZOMBIE_REAR_END);
      return { raise: 1 - t, slam: t * t };
    }
    const t = (a - ZOMBIE_SLAM_END) / (1 - ZOMBIE_SLAM_END);
    return { raise: 0, slam: (1 - t) * (1 - t) };
  }

  /**
   * A blow landed, travelling along tile-space angle `angle`: the head
   * snaps the way it was hit (back if struck from the front, sideways from
   * the side) and the body rocks, then both spring back.
   */
  knock(angle: number): void {
    const rel = angle - this.facing;
    const heft = this.target.kind === 'brute' ? BRUTE_HEFT : 1;
    this.kickYawSpeed -= Math.sin(rel) * KICK_YAW * heft;
    this.kickPitchSpeed -= Math.cos(rel) * KICK_PITCH * heft;
    this.recoilSpeed -= Math.cos(rel) * KICK_RECOIL * heft;
  }

  /**
   * Damped springs pulling the hit reaction back to rest.
   */
  private springKick(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.kickYawSpeed += (-KICK_STIFFNESS * this.kickYaw - KICK_DAMPING * this.kickYawSpeed) * step;
    this.kickPitchSpeed += (-KICK_STIFFNESS * this.kickPitch - KICK_DAMPING * this.kickPitchSpeed) * step;
    this.recoilSpeed += (-KICK_STIFFNESS * this.recoil - KICK_DAMPING * this.recoilSpeed) * step;
    this.kickYaw += this.kickYawSpeed * step;
    this.kickPitch += this.kickPitchSpeed * step;
    this.recoil += this.recoilSpeed * step;
  }

  /**
   * Smoothed tile-space position, for its glow.
   */
  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  dispose(): void {
    this.materials.forEach((m: Material): void => m.dispose());
  }
}
