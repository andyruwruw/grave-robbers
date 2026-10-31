// Packages
import { Group } from 'three';

// Local Imports
import { buildHeldModel } from '../../models/gear/gear-model';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { BoxFactory } from '../../types/models';
import type { HeldModel } from './types/held-model';

/**
 * The models one hand (or spot) can hold, each built the first time it's
 * shown (plain or infused, so a player never builds every variant) and
 * kept, hidden, for next time.
 */
export class HeldModels {
  /**
   * Every model built so far, by kind and infusion.
   */
  private _models = new Map<string, HeldModel>();

  /**
   * The model showing, or null.
   */
  private _shown: HeldModel | null = null;

  /**
   * Where the models go, how their boxes are made, and how each is placed
   * there; set by `mount`.
   */
  private _at: { parent: Group; box: BoxFactory; place: ((group: Group) => void) | null } | null = null;

  /**
   * Sets where the models go and how they're made.
   * @param parent The group they hang from.
   * @param box Makes their boxes (the avatar's, so they flash and fade with it).
   * @param place Places each new model's group, if it needs moving.
   */
  mount(parent: Group, box: BoxFactory, place: ((group: Group) => void) | null = null): void {
    this._at = { parent, box, place };
  }

  /**
   * The model showing, or null.
   * @returns The model.
   */
  get shown(): HeldModel | null {
    return this._shown;
  }

  /**
   * A model, built (hidden) the first time it's asked for.
   * @param kind The gear.
   * @param infusion Its infusion, if any.
   * @returns The model.
   */
  get(kind: GearKind, infusion: Infusion | null): HeldModel {
    const key = infusion ? `${kind}@${infusion.essence}${infusion.level}` : kind;
    let held = this._models.get(key);
    if (!held) {
      const { parent, box, place } = this._at!;
      const model = buildHeldModel(kind, box, infusion);
      const group = new Group();
      group.add(...model.parts);
      group.visible = false;
      place?.(group);
      parent.add(group);
      held = { group, model, flameBase: model.flame ? model.flame.scale.clone() : null };
      this._models.set(key, held);
    }
    return held;
  }

  /**
   * Shows one model and hides the rest.
   * @param kind The gear to show, or null for none.
   * @param infusion Its infusion, if any.
   * @returns The model showing, or null.
   */
  show(kind: GearKind | null, infusion: Infusion | null = null): HeldModel | null {
    const next = kind ? this.get(kind, infusion) : null;
    if (this._shown && this._shown !== next) {
      this._shown.group.visible = false;
    }
    if (next) {
      next.group.visible = true;
    }
    this._shown = next;
    return next;
  }
}
