/**
 * Binary min-heap of tile indices keyed by f-score.
 */
export class MinHeap {
  /**
   * The queued tile indices, in heap order.
   */
  private _items: number[] = [];

  /**
   * Each queued item's key, parallel to `_items`.
   */
  private _keys: number[] = [];

  /**
   * How many items are queued.
   * @returns The count.
   */
  get size(): number {
    return this._items.length;
  }

  /**
   * Queues an item.
   * @param item The tile index.
   * @param key Its f-score (lower pops first).
   */
  push(item: number, key: number): void {
    const { _items: items, _keys: keys } = this;
    let i = items.length;
    items.push(item);
    keys.push(key);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (keys[parent] <= key) {
        break;
      }
      items[i] = items[parent];
      keys[i] = keys[parent];
      i = parent;
    }
    items[i] = item;
    keys[i] = key;
  }

  /**
   * Takes the item with the lowest key.
   * @returns The tile index.
   */
  pop(): number {
    const { _items: items, _keys: keys } = this;
    const top = items[0];
    const lastItem = items.pop()!;
    const lastKey = keys.pop()!;
    if (items.length > 0) {
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        let mKey = lastKey;
        if (l < items.length && keys[l] < mKey) {
          m = l;
          mKey = keys[l];
        }
        if (r < items.length && keys[r] < mKey) {
          m = r;
        }
        if (m === i) {
          break;
        }
        items[i] = items[m];
        keys[i] = keys[m];
        i = m;
      }
      items[i] = lastItem;
      keys[i] = lastKey;
    }
    return top;
  }
}
