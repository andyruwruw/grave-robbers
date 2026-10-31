// Packages
import { DIGGER_SECONDS } from '@halloween/shared/structures/automation';
import { STATIONS } from '@halloween/shared/structures/stations';
import { STRUCTURES } from '@halloween/shared/structures/structure-catalog';
import { PALISADE_THORNS } from '@halloween/shared/structures/traps';
import { TURRETS } from '@halloween/shared/structures/turrets';
import { SPIKE_DAMAGE_PER_SECOND } from '@halloween/shared/players/health';
import { MAX_UPGRADE_LEVEL } from '@halloween/shared/skill-tree/upgrade-cost';
import {
  altarBleed,
  bellRadius,
  diggerSeconds,
  lightIntensity,
  lightRadius,
  spikeDamage,
  stationSeconds,
  structureHp,
  turretDamage,
} from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { TOP } from '../config/item-details';
import {
  STAT_MAX_BRIGHTNESS,
  STAT_MAX_HP,
  STAT_MAX_RADIUS,
  STAT_MAX_TURRET_DPS,
  STAT_MAX_TURRET_RANGE,
  STAT_MAX_TURRET_RATE,
} from '../config/stat-scales';
import { StatSheet } from './stat-sheet';

// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Stat } from '../types/stats';

/**
 * A structure's bars: toughness, then whatever it does (traps, turret,
 * altar, digger, bell, light, station work), in that order.
 */
export class StructureStatSheet extends StatSheet {
  /**
   * Makes a sheet for one structure.
   *
   * @param _kind - The structure.
   * @param tree - The player's skill tree.
   * @param level - The structure's upgrade level.
   */
  constructor(
    private readonly _kind: StructureKind,
    tree: TreeState,
    level: number,
  ) {
    super(tree, level);
  }

  /**
   * The structure's bars.
   *
   * @returns A fresh list of stats.
   */
  stats(): Stat[] {
    const stats: Stat[] = [{ icon: 'toughness', color: 'green', label: 'Toughness', fill: structureHp(this._kind, this._level) / STAT_MAX_HP }];
    this._trapStats(stats);
    this._turretStats(stats);
    this._helperStats(stats);
    this._lightStats(stats);
    this._stationStats(stats);
    return stats;
  }

  /**
   * Adds the damage spikes and palisades do.
   *
   * @param stats - The list to add to.
   */
  private _trapStats(stats: Stat[]): void {
    const kind = this._kind;
    const level = this._level;
    if (kind === 'spikes') {
      stats.push({ icon: 'spikes', color: 'red', label: 'Damage to walkers', fill: spikeDamage(SPIKE_DAMAGE_PER_SECOND, level) / (SPIKE_DAMAGE_PER_SECOND * TOP) });
    }
    if (kind === 'palisade') {
      stats.push({ icon: 'spikes', color: 'red', label: 'Thorns', fill: PALISADE_THORNS / (SPIKE_DAMAGE_PER_SECOND * TOP) });
    }
  }

  /**
   * Adds a turret's damage, fire rate and range.
   *
   * @param stats - The list to add to.
   */
  private _turretStats(stats: Stat[]): void {
    const kind = this._kind;
    const turret = TURRETS[kind];
    if (turret) {
      stats.push(
        { icon: 'damage', color: 'red', label: 'Damage a second', fill: turretDamage(kind, this._level) / turret.cooldown / STAT_MAX_TURRET_DPS },
        { icon: 'speed', color: 'yellow', label: 'Fire rate', fill: 1 / turret.cooldown / STAT_MAX_TURRET_RATE },
        { icon: 'reach', color: 'blue', label: 'Range', fill: turret.range / STAT_MAX_TURRET_RANGE },
      );
    }
  }

  /**
   * Adds what the altar, digger and bell each do.
   *
   * @param stats - The list to add to.
   */
  private _helperStats(stats: Stat[]): void {
    const kind = this._kind;
    const level = this._level;
    if (kind === 'altar') {
      stats.push({ icon: 'blood', color: 'blood', label: 'Kill blood', fill: altarBleed(level) / altarBleed(MAX_UPGRADE_LEVEL) });
    }
    if (kind === 'digger') {
      stats.push({ icon: 'dig', color: 'brown', label: 'Dig speed', fill: DIGGER_SECONDS / diggerSeconds(level) / 2 });
    }
    if (kind === 'bell') {
      stats.push({ icon: 'ghost', color: 'ecto', label: 'Ghost ward', fill: bellRadius(level) / bellRadius(MAX_UPGRADE_LEVEL) });
    }
  }

  /**
   * Adds a light's reach, and its brightness when it burns forever.
   *
   * @param stats - The list to add to.
   */
  private _lightStats(stats: Stat[]): void {
    const def = STRUCTURES[this._kind];
    const level = this._level;
    if (def.light) {
      const lit = def.light.burn === Infinity;
      stats.push({ icon: 'light', color: 'sun', label: 'Light', fill: (lit ? lightRadius(def.light.radius, level) : def.light.radius) / STAT_MAX_RADIUS });
      if (lit) {
        stats.push({ icon: 'flame', color: 'orange', label: 'Brightness', fill: lightIntensity(def.light.intensity, level) / STAT_MAX_BRIGHTNESS });
      }
    }
  }

  /**
   * Adds a station's work speed.
   *
   * @param stats - The list to add to.
   */
  private _stationStats(stats: Stat[]): void {
    const kind = this._kind;
    if (STATIONS[kind]) {
      stats.push({ icon: 'gear', color: 'yellow', label: 'Work speed', fill: STATIONS[kind]!.seconds / stationSeconds(kind, this._level) / 2.5 });
    }
  }
}
