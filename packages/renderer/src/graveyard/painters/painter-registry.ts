// Local Imports
import { BeltPainter } from './automation/belt-painter';
import { DiggerPainter } from './automation/digger-painter';
import { SorterPainter } from './automation/sorter-painter';
import { SeedsPainter } from './farming/seeds-painter';
import { SproutPainter } from './farming/sprout-painter';
import { PlatformPainter } from './floors/platform-painter';
import { StepsPainter } from './floors/steps-painter';
import { ChestPainter } from './landmarks/chest-painter';
import { CrossPainter } from './landmarks/cross-painter';
import { CryptPainter } from './landmarks/crypt-painter';
import { FencePainter } from './landmarks/fence-painter';
import { HedgePainter } from './landmarks/hedge-painter';
import { LampPainter } from './landmarks/lamp-painter';
import { MausoleumPainter } from './landmarks/mausoleum-painter';
import { PumpkinPainter } from './landmarks/pumpkin-painter';
import { RockPainter } from './landmarks/rock-painter';
import { RuinPainter } from './landmarks/ruin-painter';
import { StatuePainter } from './landmarks/statue-painter';
import { StumpPainter } from './landmarks/stump-painter';
import { TombstonePainter } from './landmarks/tombstone-painter';
import { TowerPainter } from './landmarks/tower-painter';
import { TreePainter } from './landmarks/tree-painter';
import { WellPainter } from './landmarks/well-painter';
import { CampfirePainter } from './lights/campfire-painter';
import { LanternPainter } from './lights/lantern-painter';
import { TorchPainter } from './lights/torch-painter';
import { AltarPainter } from './stations/altar-painter';
import { AnvilPainter } from './stations/anvil-painter';
import { BloodforgePainter } from './stations/bloodforge-painter';
import { CauldronPainter } from './stations/cauldron-painter';
import { CoffinPainter } from './stations/coffin-painter';
import { FurnacePainter } from './stations/furnace-painter';
import { OvenPainter } from './stations/oven-painter';
import { QuarryPainter } from './stations/quarry-painter';
import { ResearchTablePainter } from './stations/research-table-painter';
import { SawmillPainter } from './stations/sawmill-painter';
import { SifterPainter } from './stations/sifter-painter';
import { StashPainter } from './stations/stash-painter';
import { BarbedWirePainter } from './traps/barbed-wire-painter';
import { BloodFountainPainter } from './traps/blood-fountain-painter';
import { IronSpikesPainter } from './traps/iron-spikes-painter';
import { SpikesPainter } from './traps/spikes-painter';
import { BallistaPainter } from './turrets/ballista-painter';
import { BoltTurretPainter } from './turrets/bolt-turret-painter';
import { FlamethrowerPainter } from './turrets/flamethrower-painter';
import { SentryPainter } from './turrets/sentry-painter';
import { SwiperPainter } from './turrets/swiper-painter';
import { BoneWallPainter } from './walls/bone-wall-painter';
import { DoorPainter } from './walls/door-painter';
import { PalisadePainter } from './walls/palisade-painter';
import { StoneWallPainter } from './walls/stone-wall-painter';
import { WoodFencePainter } from './walls/wood-fence-painter';
import { WoodWallPainter } from './walls/wood-wall-painter';
import { BellPainter } from './wards/bell-painter';
import { EffigyPainter } from './wards/effigy-painter';
import { GhostLampPainter } from './wards/ghost-lamp-painter';
import { ObeliskPainter } from './wards/obelisk-painter';
import { ScarecrowPainter } from './wards/scarecrow-painter';
import { SoulCagePainter } from './wards/soul-cage-painter';
import { SoulFirePainter } from './wards/soul-fire-painter';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { TilePainter } from './tile-painter';

/**
 * The painter for every tile that has something standing on it; bare
 * ground tiles (grass, path, ...) have none.
 */
export const PAINTERS: Partial<Record<Tile, TilePainter>> = {
  fence: new FencePainter(),
  tombstone: new TombstonePainter(),
  cross: new CrossPainter(),
  tree: new TreePainter(),
  stump: new StumpPainter(),
  rock: new RockPainter(),
  pumpkin: new PumpkinPainter(),
  tower: new TowerPainter(),
  platform: new PlatformPainter(),
  steps: new StepsPainter(),
  chest: new ChestPainter(),
  stash: new StashPainter(),
  crypt: new CryptPainter(),
  mausoleum: new MausoleumPainter(),
  ruin: new RuinPainter(),
  well: new WellPainter(),
  statue: new StatuePainter(),
  lamp: new LampPainter(),
  hedge: new HedgePainter(),
  'wood-wall': new WoodWallPainter(),
  'stone-wall': new StoneWallPainter(),
  palisade: new PalisadePainter(),
  door: new DoorPainter(),
  'wood-fence': new WoodFencePainter(),
  spikes: new SpikesPainter(),
  scarecrow: new ScarecrowPainter(),
  'iron-spikes': new IronSpikesPainter(),
  'barbed-wire': new BarbedWirePainter(),
  'ghost-lamp': new GhostLampPainter(),
  'soul-fire': new SoulFirePainter(),
  effigy: new EffigyPainter(),
  obelisk: new ObeliskPainter(),
  'blood-fountain': new BloodFountainPainter(),
  'soul-cage': new SoulCagePainter(),
  torch: new TorchPainter(),
  lantern: new LanternPainter(),
  'research-table': new ResearchTablePainter(),
  sawmill: new SawmillPainter(),
  furnace: new FurnacePainter(),
  campfire: new CampfirePainter(),
  altar: new AltarPainter(),
  bloodforge: new BloodforgePainter(),
  sifter: new SifterPainter(),
  sentry: new SentryPainter(),
  digger: new DiggerPainter(),
  'bone-wall': new BoneWallPainter(),
  coffin: new CoffinPainter(),
  cauldron: new CauldronPainter(),
  anvil: new AnvilPainter(),
  oven: new OvenPainter(),
  quarry: new QuarryPainter(),
  belt: new BeltPainter(),
  sorter: new SorterPainter(),
  seeds: new SeedsPainter(),
  sprout: new SproutPainter(),
  'bolt-turret': new BoltTurretPainter(),
  swiper: new SwiperPainter(),
  flamethrower: new FlamethrowerPainter(),
  ballista: new BallistaPainter(),
  bell: new BellPainter(),
};
