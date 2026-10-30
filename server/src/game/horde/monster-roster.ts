// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { Monster } from './monsters/monster';
import type { Target } from './types/hooks';

/**
 * Every monster on the map by id, in the order they appeared.
 */
export class MonsterRoster<P extends Target> {
  /**
   * The monsters by id.
   */
  private readonly _monsters = new Map<number, Monster<P>>();

  /**
   * The id the next monster gets.
   */
  private _nextId = 1;

  /**
   * How many monsters there are.
   * @returns The count.
   */
  get size(): number {
    return this._monsters.size;
  }

  /**
   * Hands out the next monster id.
   * @returns The id.
   */
  takeId(): number {
    return this._nextId++;
  }

  /**
   * Adds a monster.
   * @param m The monster.
   */
  add(m: Monster<P>): void {
    this._monsters.set(m.id, m);
  }

  /**
   * A monster by id.
   * @param id Its id.
   * @returns The monster, or undefined if it's gone.
   */
  get(id: number): Monster<P> | undefined {
    return this._monsters.get(id);
  }

  /**
   * Whether a monster is still around.
   * @param id Its id.
   * @returns True while it is.
   */
  has(id: number): boolean {
    return this._monsters.has(id);
  }

  /**
   * Takes a monster away.
   * @param id Its id.
   */
  delete(id: number): void {
    this._monsters.delete(id);
  }

  /**
   * Takes every monster away.
   */
  clear(): void {
    this._monsters.clear();
  }

  /**
   * Every monster, live: deletions during the loop are seen.
   * @returns The map's own iterator.
   */
  values(): IterableIterator<Monster<P>> {
    return this._monsters.values();
  }

  /**
   * Monsters with a body: what stands on plates, crowds players, and gets
   * pushed around (not ghosts).
   * @returns A new list of them.
   */
  bodies(): Monster<P>[] {
    return [...this._monsters.values()].filter((m: Monster<P>): boolean => m.hasBody);
  }

  /**
   * How many monsters of one kind there are.
   * @param kind The kind.
   * @returns The count.
   */
  count(kind: MonsterKind): number {
    return [...this._monsters.values()].filter((m: Monster<P>): boolean => m.kind === kind).length;
  }
}
