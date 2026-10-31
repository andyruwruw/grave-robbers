// Local Imports
import { Chapel } from '../classic/landmarks/chapel';
import { Hill } from '../classic/landmarks/hill';
import { Mausoleums } from '../classic/landmarks/mausoleums';
import { WellPlaza } from '../classic/landmarks/well-plaza';
import { GenPass } from '../gen-pass';
import { Graveyard } from './landmarks/graveyard';
import { LoneCrypt } from './landmarks/lone-crypt';
import { PumpkinPatch } from './landmarks/pumpkin-patch';
import { Ruins } from './landmarks/ruins';
import { StoneCircle } from './landmarks/stone-circle';

// Types
import type { Landmark } from '../classic/landmarks/landmark';
import type { Site, SiteKind } from '../types/sites';

/**
 * Builds the landmark on each of a huge world's sites.
 */
export class SiteBuildPass extends GenPass {
  /**
   * Each site but the hub gets its landmark, somewhere on the middle of
   * its pad with its doors toward the site's middle, and a path out to
   * the nearest road.
   * @param sites Every site.
   */
  build(sites: Site[]): void {
    const builders: Record<Exclude<SiteKind, 'hub'>, Landmark> = {
      chapel: new Chapel(this._canvas),
      well: new WellPlaza(this._canvas),
      tower: new Hill(this._canvas),
      mausoleums: new Mausoleums(this._canvas),
      graveyard: new Graveyard(this._canvas),
      crypt: new LoneCrypt(this._canvas),
      ruins: new Ruins(this._canvas),
      stones: new StoneCircle(this._canvas),
      patch: new PumpkinPatch(this._canvas),
    };
    for (const site of sites) {
      if (site.kind === 'hub') {
        continue;
      }
      const half = Math.floor(site.radius * 0.72);
      this._canvas.center = [site.x, site.y];
      builders[site.kind].tryIn({ x: Math.floor(site.x) - half, y: Math.floor(site.y) - half, w: half * 2, h: half * 2 });
    }
    this._canvas.center = [this.map.width / 2, this.map.height / 2];
  }
}
