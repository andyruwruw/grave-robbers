// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { NodeId } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * Typed wrappers around a controller's `send`, one per thing a player does.
 * Every method is an arrow property, so it can be handed straight to a
 * component as a callback.
 */
export class PlayerCommands {
  /**
   * Wraps a controller socket.
   *
   * @param _send - Sends a message to the server.
   */
  constructor(private readonly _send: (msg: ClientMessage) => void) {}

  /**
   * Sends the movement stick.
   *
   * @param x - Left to right, -1 to 1.
   * @param y - Up to down, -1 to 1.
   */
  readonly input = (x: number, y: number): void => this._send({ t: 'input', x, y });

  /**
   * Presses or lets go of the action button.
   *
   * @param down - Whether it's held.
   */
  readonly action = (down: boolean): void => this._send({ t: 'action', down });

  /**
   * Presses or lets go of block.
   *
   * @param down - Whether it's held.
   */
  readonly block = (down: boolean): void => this._send({ t: 'block', down });

  /**
   * Sends the aim stick.
   *
   * @param x - Left to right, -1 to 1.
   * @param y - Up to down, -1 to 1.
   */
  readonly aim = (x: number, y: number): void => this._send({ t: 'aim', x, y });

  /**
   * Equips the gear in a bag slot.
   *
   * @param bag - The bag slot.
   */
  readonly equip = (bag: number): void => this._send({ t: 'equip', bag });

  /**
   * Drinks a tonic from a bag slot.
   *
   * @param bag - The bag slot.
   */
  readonly drink = (bag: number): void => this._send({ t: 'drink', bag });

  /**
   * Moves an equipped item back into the bag.
   *
   * @param slot - The equipped slot.
   */
  readonly unequip = (slot: GearSlot): void => this._send({ t: 'unequip', slot });

  /**
   * Throws an item onto the facing tile.
   *
   * @param from - A bag index or an equipped slot.
   */
  readonly dropGear = (from: GearSlot | number): void => this._send({ t: 'drop-gear', from });

  /**
   * Moves an item to another slot (stacking or swapping).
   *
   * @param from - Where it is.
   * @param to - Where it goes.
   */
  readonly move = (from: GearSlot | number, to: GearSlot | number): void => this._send({ t: 'move-item', from, to });

  /**
   * Crafts `count` of a recipe.
   *
   * @param recipe - What to make.
   * @param count - How many.
   */
  readonly craft = (recipe: RecipeId, count: number): void => this._send({ t: 'craft', recipe, count });

  /**
   * Upgrades a skill tree node.
   *
   * @param node - The node.
   */
  readonly upgrade = (node: NodeId): void => this._send({ t: 'upgrade', node });

  /**
   * Runs from monsters close by for a moment.
   */
  readonly panic = (): void => this._send({ t: 'panic' });

  /**
   * Starts building from a bag slot, or stops (null).
   *
   * @param slot - The bag slot, or null.
   */
  readonly buildSelect = (slot: number | null): void => this._send({ t: 'build-select', slot });

  /**
   * Places what's being built.
   */
  readonly buildPlace = (): void => this._send({ t: 'build-place' });

  /**
   * Claims a TV controller.
   *
   * @param id - The controller's id.
   */
  readonly claimPad = (id: string): void => this._send({ t: 'claim-pad', id });

  /**
   * Lets go of the claimed TV controller.
   */
  readonly releasePad = (): void => this._send({ t: 'release-pad' });

  /**
   * Leaves the game for good.
   */
  readonly leave = (): void => this._send({ t: 'leave' });

  /**
   * Moves an item between the bag and the open storage chest.
   *
   * @param from - Which side it's on.
   * @param index - Its slot.
   */
  readonly stashMove = (from: 'bag' | 'stash', index: number): void => this._send({ t: 'stash-move', from, index });

  /**
   * Closes the open storage chest.
   */
  readonly stashClose = (): void => this._send({ t: 'stash-close' });

  /**
   * Picks the open (empty) storage chest up as a crate.
   */
  readonly stashTakeDown = (): void => this._send({ t: 'stash-take-down' });

  /**
   * Closes the open storage chest, then panics.
   */
  readonly stashPanic = (): void => {
    this._send({ t: 'stash-close' });
    this._send({ t: 'panic' });
  };
}
