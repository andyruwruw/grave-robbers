// Packages
import {
  AmbientLight,
  BoxGeometry,
  Box3,
  DirectionalLight,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  OrthographicCamera,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GEAR } from '@halloween/shared/gear';
import { MAP_HEIGHT, MAP_WIDTH, WorldMap } from '@halloween/shared/world';
import { RESOURCE_COLORS } from '@halloween/shared/items';

// Local Imports
import { buildTile } from './build-graveyard';
import { buildGearModel, buildLantern } from './gear-models';

// Types
import type { GearKind, ItemKey, RecipeId } from '@halloween/shared/gear';
import type { Material, Resource } from '@halloween/shared/items';
import type { StructureKind } from '@halloween/shared/structures';
import type { BoxFactory } from './gear-models';

/**
 * Anything the phone shows an icon for: bag items, recipes, and what an
 * empty hand falls back to.
 */
export type IconKey = RecipeId | ItemKey | 'wood-axe' | 'lantern' | `res:${Resource}`;

/**
 * Icon size in pixels; drawn chunky on purpose, like the TV.
 */
const ICON_PX = 40;

const UNIT_BOX = new BoxGeometry(1, 1, 1);
const UP = new Vector3(0, 1, 0);
const BARK = '#4a3020';
const END_GRAIN = '#c79b62';
const STONE_DARK = '#6b7079';
const IRON_EDGE = '#8a98a8';
const BOLT_TIP = '#c9ced6';
const FLETCH = '#7a1f1f';
const BONE_DARK = '#c8b994';
const SOCKET = '#1a1210';
const SILVER_SHINE = '#f4f8fc';
const VIAL_GLASS = '#a8bcc4';
const CORK = '#8a5a32';
const BLOODSTEEL_EDGE = '#a8243a';
const CANDY_YELLOW = '#f5c62e';
const CANDY_ORANGE = '#f07a18';
const CANDY_TWIST = '#d99a1c';
const CANDY_SHINE = '#fff3a6';
const BLOOD_SHINE = '#ec4a58';

/**
 * Shared materials by color, so every icon reuses the same few.
 */
const materials = new Map<string, MeshLambertMaterial | MeshBasicMaterial>();

const box: BoxFactory = (size, pos, color, glow = false) => {
  const key = `${color}:${glow}`;
  let material = materials.get(key);
  if (!material) {
    material = glow ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
    materials.set(key, material);
  }
  const mesh = new Mesh(UNIT_BOX, material);
  mesh.scale.set(...size);
  mesh.position.set(...pos);
  return mesh;
};

/**
 * A small heap of one material, as it looks in the bag, made of boxes
 * from `make` (lit icon boxes by default).
 */
export function materialModel(material: Material, make: BoxFactory = box): Mesh[] {
  const color = RESOURCE_COLORS[material];
  switch (material) {
    case 'wood':
      return [
        ...[[-0.06, 0.045], [0.06, 0.045], [0, 0.13]].flatMap(([y, z]) => [
          make([0.34, 0.09, 0.09], [0, z, y], BARK),
          make([0.02, 0.07, 0.07], [0.17, z, y], END_GRAIN),
          make([0.33, 0.03, 0.03], [0, z + 0.03, y + 0.02], color),
        ]),
      ];
    case 'planks':
      return [0, 1, 2].map((i: number): Mesh => make([0.38, 0.035, 0.11], [(i % 2) * 0.03 - 0.015, 0.018 + i * 0.04, 0], i % 2 ? END_GRAIN : color));
    case 'stone':
      return [
        make([0.13, 0.1, 0.13], [-0.07, 0.05, 0.03], color),
        make([0.11, 0.09, 0.11], [0.07, 0.045, -0.03], STONE_DARK),
        make([0.09, 0.08, 0.09], [0, 0.13, 0], color),
      ];
    case 'iron':
      return [
        make([0.07, 0.05, 0.2], [-0.04, 0.025, 0], color),
        make([0.07, 0.05, 0.2], [0.04, 0.025, 0], IRON_EDGE),
        make([0.07, 0.05, 0.2], [0, 0.075, 0], color),
      ];
    case 'bolts':
      return [-0.05, 0, 0.05].flatMap((z: number, i: number): Mesh[] => [
        make([0.28, 0.025, 0.025], [0, 0.02 + i * 0.02, z], color),
        make([0.05, 0.035, 0.035], [0.16, 0.02 + i * 0.02, z], BOLT_TIP),
        make([0.05, 0.04, 0.01], [-0.13, 0.02 + i * 0.02, z], FLETCH),
      ]);
    case 'arrows':
      return [-0.06, -0.02, 0.02, 0.06].flatMap((z: number, i: number): Mesh[] => [
        make([0.34, 0.02, 0.02], [0, 0.02 + (i % 2) * 0.02, z], color),
        make([0.04, 0.035, 0.03], [0.18, 0.02 + (i % 2) * 0.02, z], BOLT_TIP),
        make([0.07, 0.045, 0.008], [-0.15, 0.02 + (i % 2) * 0.02, z], FLETCH),
      ]);
    case 'bone':
      return [
        ...[-1, 1].flatMap((side: number): Mesh[] => {
          const parts = [
            make([0.34, 0.05, 0.05], [0, 0.03 + (side + 1) * 0.03, 0], color),
            make([0.06, 0.07, 0.1], [0.17, 0.03 + (side + 1) * 0.03, 0], color),
            make([0.06, 0.07, 0.1], [-0.17, 0.03 + (side + 1) * 0.03, 0], color),
          ];
          for (const part of parts) {
            part.position.applyAxisAngle(UP, side * 0.5);
            part.rotation.y = side * 0.5;
          }
          return parts;
        }),
        make([0.16, 0.13, 0.15], [0, 0.17, 0.02], color),
        make([0.11, 0.05, 0.1], [0, 0.09, 0.05], BONE_DARK),
        make([0.04, 0.035, 0.01], [-0.035, 0.165, 0.1], SOCKET),
        make([0.04, 0.035, 0.01], [0.035, 0.165, 0.1], SOCKET),
      ];
    case 'silver':
      return [
        make([0.16, 0.05, 0.08], [-0.02, 0.025, -0.05], color),
        make([0.16, 0.05, 0.08], [0.02, 0.025, 0.05], color),
        make([0.12, 0.04, 0.05], [0, 0.07, 0], SILVER_SHINE),
        make([0.05, 0.04, 0.05], [0.13, 0.02, -0.02], SILVER_SHINE),
      ];
    case 'bloodsteel':
      return [
        make([0.07, 0.05, 0.2], [-0.04, 0.025, 0], color),
        make([0.07, 0.05, 0.2], [0.04, 0.025, 0], BLOODSTEEL_EDGE),
        make([0.07, 0.05, 0.2], [0, 0.075, 0], color),
        make([0.05, 0.005, 0.16], [0, 0.1, 0], BLOODSTEEL_EDGE),
      ];
    case 'tonic':
      return [[-0.07, 0.04], [0.08, -0.03]].flatMap(([x, z]) => [
        make([0.12, 0.14, 0.12], [x, 0.07, z], VIAL_GLASS),
        make([0.1, 0.11, 0.1], [x, 0.065, z + 0.015], color, true),
        make([0.05, 0.06, 0.05], [x, 0.17, z], VIAL_GLASS),
        make([0.06, 0.04, 0.06], [x, 0.21, z], CORK),
      ]);
  }
}

/**
 * Candy (a wrapped sweet: yellow with orange bands and twisted orange
 * ends) or blood (a drop).
 */
export function resourceModel(resource: Resource, make: BoxFactory = box): Mesh[] {
  if (resource === 'candy') {
    return [
      make([0.18, 0.14, 0.12], [0, 0.1, 0], CANDY_YELLOW),
      make([0.025, 0.145, 0.125], [-0.045, 0.1, 0], CANDY_ORANGE),
      make([0.025, 0.145, 0.125], [0.045, 0.1, 0], CANDY_ORANGE),
      make([0.1, 0.02, 0.02], [-0.01, 0.15, 0.06], CANDY_SHINE),
      ...[-1, 1].flatMap((side: number): Mesh[] => [
        make([0.03, 0.09, 0.08], [side * 0.1, 0.1, 0], CANDY_YELLOW),
        make([0.03, 0.05, 0.05], [side * 0.125, 0.1, 0], CANDY_TWIST),
        make([0.03, 0.09, 0.07], [side * 0.15, 0.1, 0], CANDY_ORANGE),
        make([0.03, 0.14, 0.09], [side * 0.18, 0.1, 0], CANDY_ORANGE),
        make([0.03, 0.19, 0.1], [side * 0.21, 0.1, 0], CANDY_ORANGE),
        make([0.031, 0.02, 0.101], [side * 0.21, 0.1, 0], CANDY_TWIST),
      ]),
    ];
  }
  const color = RESOURCE_COLORS.blood;
  return [
    ...([[0.12, 0.01], [0.2, 0.05], [0.22, 0.1], [0.18, 0.15], [0.13, 0.2], [0.08, 0.25], [0.04, 0.29]] as const)
      .map(([w, y]): Mesh => make([w, 0.05, w], [0, y + 0.025, 0], color)),
    make([0.04, 0.07, 0.02], [-0.06, 0.15, 0.09], BLOOD_SHINE),
    make([0.025, 0.03, 0.02], [-0.035, 0.21, 0.065], BLOOD_SHINE),
  ];
}

/**
 * Builds the model an icon shows, centered roughly on the origin.
 */
function buildModel(key: IconKey): Group {
  const group = new Group();
  if (key.startsWith('res:')) {
    group.add(...resourceModel(key.slice(4) as Resource));
    group.rotation.y = key === 'res:candy' ? 0.25 : 0;
    return group;
  }
  if (key === 'bolts' || key === 'arrows' || key.startsWith('mat:')) {
    group.add(...materialModel(key === 'bolts' || key === 'arrows' ? key : key.slice(4) as Material));
    group.rotation.y = 0.5;
    return group;
  }
  if (key.startsWith('build:')) {
    const kind = key.slice(6) as StructureKind;
    const map = WorldMap.filled('grass');
    const tx = Math.floor(MAP_WIDTH / 2);
    const ty = Math.floor(MAP_HEIGHT / 2);
    map.set(tx, ty, kind);
    if (kind === 'steps') {
      map.set(tx, ty - 1, 'platform');
    }
    group.add(buildTile(map, 1, tx, ty));
    return group;
  }
  const kind = key.startsWith('gear:') ? key.slice(5) as GearKind : key as 'wood-axe' | 'lantern';
  const parts = kind === 'lantern' ? buildLantern(box) : buildGearModel(kind, box).parts;
  const holder = new Group();
  holder.add(...parts);
  if (kind === 'shield') {
    holder.rotation.y = -0.5;
  } else if (kind !== 'lantern' && GEAR[kind].slot === 'armor') {
    holder.rotation.y = Math.PI / 2 + 0.4;
  } else if (kind !== 'lantern') {
    holder.rotation.set(0, Math.PI / 2 - 0.6, Math.PI * 0.75);
  }
  group.add(holder);
  return group;
}

/**
 * The one renderer every icon is drawn with, made on first use.
 */
let stage: { renderer: WebGLRenderer; scene: Scene; camera: OrthographicCamera } | null = null;

const cache = new Map<IconKey, string>();
const spins = new Map<IconKey, string[]>();

/**
 * Frames in one turn of a spinning model.
 */
const SPIN_FRAMES = 36;

/**
 * Looking down from the front right, like the TV but a little lower.
 */
const VIEW = new Vector3(0.9, 1.1, 1.6).normalize();

/**
 * An image URL of a little 3D model of the item, drawn once and cached.
 */
export function itemIconUrl(key: IconKey): string {
  let url = cache.get(key);
  if (!url) {
    url = renderIcon(key, null);
    cache.set(key, url);
  }
  return url;
}

/**
 * Image URLs of the item's model turning once around, framed the same in
 * every frame so it spins in place. Drawn once and cached.
 */
export function itemSpinUrls(key: IconKey): string[] {
  let frames = spins.get(key);
  if (!frames) {
    frames = Array.from({ length: SPIN_FRAMES }, (_, i: number): string => renderIcon(key, (i / SPIN_FRAMES) * Math.PI * 2));
    spins.set(key, frames);
  }
  return frames;
}

/**
 * Draws the item's model. Without `spin` it's framed tightly; with it, the
 * model is turned that far around its middle and framed by its bounding
 * sphere, which holds it at any angle.
 */
function renderIcon(key: IconKey, spin: number | null): string {
  if (!stage) {
    const renderer = new WebGLRenderer({ alpha: true, antialias: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(ICON_PX, ICON_PX, false);
    const scene = new Scene();
    const sun = new DirectionalLight('#ffffff', 2.2);
    sun.position.set(-1, 3, 2);
    scene.add(new AmbientLight('#ffffff', 1.4), sun);
    stage = { renderer, scene, camera: new OrthographicCamera(-1, 1, 1, -1, 0.01, 20) };
  }
  const { renderer, scene, camera } = stage;
  const built = buildModel(key);
  built.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(built);
  const sphere = bounds.getBoundingSphere(new Sphere());
  let model: Group = built;
  if (spin !== null) {
    model = new Group();
    const turn = new Group();
    built.position.sub(sphere.center);
    turn.add(built);
    turn.rotation.y = spin;
    model.add(turn);
    model.position.copy(sphere.center);
  }
  scene.add(model);
  model.updateMatrixWorld(true);
  camera.position.copy(sphere.center).add(VIEW.clone().multiplyScalar(sphere.radius * 4));
  camera.near = sphere.radius;
  camera.far = sphere.radius * 8;
  camera.lookAt(sphere.center);
  camera.updateMatrixWorld();
  if (spin !== null) {
    const half = sphere.radius * 0.85;
    camera.left = -half;
    camera.right = half;
    camera.top = half;
    camera.bottom = -half;
  } else {
    const seen = new Box3();
    for (let i = 0; i < 8; i++) {
      seen.expandByPoint(new Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z).applyMatrix4(camera.matrixWorldInverse));
    }
    const half = Math.max(seen.max.x - seen.min.x, seen.max.y - seen.min.y) / 2;
    const cx = (seen.max.x + seen.min.x) / 2;
    const cy = (seen.max.y + seen.min.y) / 2;
    camera.left = cx - half;
    camera.right = cx + half;
    camera.top = cy + half;
    camera.bottom = cy - half;
  }
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  scene.remove(model);
  model.traverse((o) => {
    if (o instanceof InstancedMesh) {
      o.geometry.dispose();
      (o.material as MeshLambertMaterial).dispose();
    }
  });
  return renderer.domElement.toDataURL();
}
