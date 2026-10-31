// Local Imports
import { BrimstoneLook } from '../kinds/brimstone-look';
import { EctoLook } from '../kinds/ecto-look';
import { FangLook } from '../kinds/fang-look';
import { HexLook } from '../kinds/hex-look';
import { HolyLook } from '../kinds/holy-look';
import { SilverLook } from '../kinds/silver-look';
import { TendonsLook } from '../kinds/tendons-look';

// Types
import type { Essence } from '@halloween/shared/gear/types/infusion';
import type { EssenceLook } from '../essence-look';

/**
 * Each essence's look (one shared instance each: looks hold no state).
 */
export const ESSENCE_LOOKS: Record<Essence, EssenceLook> = {
  ecto: new EctoLook(),
  holy: new HolyLook(),
  brimstone: new BrimstoneLook(),
  hex: new HexLook(),
  fang: new FangLook(),
  tendons: new TendonsLook(),
  silver: new SilverLook(),
};
