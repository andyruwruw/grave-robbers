// Local Imports
import { freshStructure } from '../helpers/fresh-structure';

// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { StructureState } from '../types/structures';

/**
 * Every built structure's live state, by tile index (saved). The tile on
 * the map says what kind it is.
 */
export class StructureStore {
  /**
   * Each structure's state, by tile index, in the order they were built.
   */
  private readonly _byIndex: Map<number, StructureState>;

  /**
   * Sets the store up.
   * @param _map The map the structures stand on.
   * @param saved Saved [tile index, state] pairs to start from.
   */
  constructor(private readonly _map: WorldMap, saved: [number, StructureState][] = []) {
    this._byIndex = new Map(saved);
  }

  /**
   * The structure on a tile.
   * @param i The tile index.
   * @returns Its state, or undefined if nothing is built there.
   */
  get(i: number): StructureState | undefined {
    return this._byIndex.get(i);
  }

  /**
   * Forgets the structure on a tile (the caller sets the tile).
   * @param i The tile index.
   */
  delete(i: number): void {
    this._byIndex.delete(i);
  }

  /**
   * Every structure, live: deleting while iterating is safe.
   * @returns The live iterator of [tile index, state] pairs.
   */
  entries(): MapIterator<[number, StructureState]> {
    return this._byIndex.entries();
  }

  /**
   * Every structure's tile index, live.
   * @returns The live iterator of tile indexes.
   */
  keys(): MapIterator<number> {
    return this._byIndex.keys();
  }

  /**
   * Every structure as saved.
   * @returns [tile index, state] pairs in build order.
   */
  saveEntries(): [number, StructureState][] {
    return [...this._byIndex];
  }

  /**
   * Puts a structure on a tile, remembering the floor it covers and its
   * builder's skill level for it.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param kind What to build.
   * @param level The builder's skill level for it.
   * @param owner The builder's id (a coffin's or digger's owner) or name (a stash's keeper).
   */
  place(tx: number, ty: number, kind: StructureKind, level: number, owner: string | null = null): void {
    this._byIndex.set(ty * this._map.width + tx, freshStructure(kind, level, this._map.get(tx, ty), owner));
    this._map.set(tx, ty, kind);
  }
}
