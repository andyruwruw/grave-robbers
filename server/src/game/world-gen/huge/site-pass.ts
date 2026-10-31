// Local Imports
import { HUB_RADIUS, SITE_EDGE, SITE_KINDS, SITE_SPACING, SITE_TRIES } from '../config/huge';
import { GenPass } from '../gen-pass';

// Types
import type { Site, SiteKind, SiteKindInfo } from '../types/sites';

/**
 * Where a huge world's sites go and what each one is.
 */
export class SitePass extends GenPass {
  /**
   * The hub at the middle, then sites scattered over the rest: random
   * darts, each kept if it's SITE_SPACING from every site so far, until
   * SITE_TRIES in a row miss. Each gets a kind picked by weight from the
   * ones the landmark knobs allow.
   * @returns Every site, the hub first, levels not yet set.
   */
  lay(): Site[] {
    const n = this.map.width;
    const sites: Site[] = [{ x: n / 2, y: n / 2, kind: 'hub', radius: HUB_RADIUS, level: 0, gates: [] }];
    const kinds = (Object.entries(SITE_KINDS) as [Exclude<SiteKind, 'hub'>, SiteKindInfo][])
      .filter(([, info]): boolean => this.gen.structures[info.needs]);
    const total = kinds.reduce((sum: number, [, info]): number => sum + info.weight, 0);
    for (let miss = 0; miss < SITE_TRIES && kinds.length > 0; miss++) {
      let roll = this.rand() * total;
      const [kind, info] = kinds.find(([, k]): boolean => (roll -= k.weight) < 0) ?? kinds[kinds.length - 1];
      const edge = info.radius + SITE_EDGE;
      const x = Math.floor(edge + this.rand() * (n - 2 * edge)) + 0.5;
      const y = Math.floor(edge + this.rand() * (n - 2 * edge)) + 0.5;
      if (sites.every((s: Site): boolean => Math.hypot(s.x - x, s.y - y) >= Math.max(SITE_SPACING, s.radius + info.radius + 6))) {
        sites.push({ x, y, kind, radius: info.radius, level: 0, gates: [[Math.floor(x), Math.floor(y)]] });
        miss = 0;
      }
    }
    return sites;
  }
}
