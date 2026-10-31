// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { Essence } from '@halloween/shared/gear/types/infusion';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { NodeId } from '@halloween/shared/skill-tree/types/skill-tree';
import type { SortKey, SortSide } from '@halloween/shared/structures/sorting';

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
   * Infuses a piece of gear at an anvil with the next level of an
   * essence's path.
   *
   * @param from - An equipped slot, a bag index, or 'hammer' for the hammer
   * everyone has (which makes an infused hammer).
   * @param essence - The path's essence.
   */
  readonly infuse = (from: GearSlot | number | 'hammer', essence: Essence): void => this._send({ t: 'infuse', from, essence });

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
   * Turns what's being built a quarter turn left (-1) or right (1).
   * @param dir Which way.
   */
  readonly turn = (dir: -1 | 1): void => this._send({ t: 'turn', dir });

  /**
   * Picks the look the wall being built goes down in.
   * @param style The look (see `WALL_STYLES`).
   */
  readonly buildStyle = (style: number): void => this._send({ t: 'build-style', style });

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
   * Asks for a code that moves this character to another device.
   */
  readonly transferCode = (): void => this._send({ t: 'transfer-code' });

  /**
   * USE on the facing tile (opens or works it, never hurts it).
   */
  readonly use = (): void => this._send({ t: 'use' });

  /**
   * Closes the open digger, station, or sorter panel.
   */
  readonly useClose = (): void => this._send({ t: 'use-close' });

  /**
   * Feeds the open station from the bag.
   *
   * @param all - As many batches as fit, instead of one.
   */
  readonly useFeed = (all: boolean): void => this._send({ t: 'use-feed', all });

  /**
   * Takes what the open bone digger dug up.
   */
  readonly useCollect = (): void => this._send({ t: 'use-collect' });

  /**
   * Tells the open belt sorter what to send out one side.
   *
   * @param side - The side.
   * @param item - What goes that way, or null for nothing.
   */
  readonly useRoute = (side: SortSide, item: SortKey | null): void => this._send({ t: 'use-route', side, item });

  /**
   * Closes the open digger, station, or sorter panel, then panics.
   */
  readonly usePanic = (): void => {
    this._send({ t: 'use-close' });
    this._send({ t: 'panic' });
  };

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
