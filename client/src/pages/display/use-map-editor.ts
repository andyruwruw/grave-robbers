// Packages
import React, { useEffect, useRef } from 'react';
import { measureBlend, parseBlendKey } from '@halloween/shared/blend';
import { brushTiles } from '@halloween/shared/map-edit';
import { MAP_HEIGHT, MAP_WIDTH, MAX_LEVEL, MIN_LEVEL, RAMP_DIRS } from '@halloween/shared/world';

// Types
import type { Blend, BlendAreas } from '@halloween/shared/blend';
import type { MapEdit } from '@halloween/shared/map-edit';
import type { ClientMessage } from '@halloween/shared/protocol';
import type { Tile } from '@halloween/shared/world';
import type { WorldRenderer } from './renderer/world-renderer';
import type { TvMouseHandlers } from './use-tv-mouse';

/**
 * The map editor's tools.
 */
export type EditTool = 'raise' | 'lower' | 'stairs' | 'paint' | 'mix' | 'pick' | 'erase';

/**
 * What the map editor will do on a click: the tool, its brush size, and
 * the tile it paints.
 */
export interface EditorState {
  tool: EditTool;
  size: number;

  /**
   * What Paint lays down: the palette entry's label (to show which is
   * picked), its tile, and the tiles it mixes at random, if any.
   */
  label: string;
  tile: Tile;
  mix?: Tile[];

  /**
   * Share of the brush's tiles Paint fills (1 is all of them).
   */
  scatter: number;

  /**
   * The Mix brush's shares of each kind of scenery.
   */
  blend: Blend;

  /**
   * The view while editing: flat daylight, monsters hidden, and the camera
   * looking nearly straight down (so walls don't hide the tiles behind
   * them).
   */
  flat: boolean;
  hideMonsters: boolean;
  topView: boolean;
}

/**
 * Smallest area (tiles across) the picker measures on ground that was never
 * mixed.
 */
const PICK_SIZE = 5;

/**
 * Fewest ms between batches of edits sent while dragging.
 */
const SEND_MS = 90;

/**
 * How near the back edge of a block (in tiles) the Stairs tool picks the
 * stairs climbing up to it instead: stairs that climb toward the camera are
 * seen almost edge on, as a sliver along that edge.
 */
const STAIRS_EDGE = 0.4;

/**
 * The TV's mouse while the map editor is open: a ring follows the tile
 * under the cursor (traced through the terrain, so the side of a block picks
 * the block and a pit's back wall picks the pit; scrolling steps to tiles
 * hidden further back) showing what the round brush covers, and pressing
 * (and dragging) edits the tiles under it. Raise and lower only touch tiles
 * at the level the stroke starts on, taking them one level up or down.
 * Stairs are a click each: a see-through flight shows where they'd go and
 * which way they'd climb; left places them (or deletes stairs already
 * there), right turns them (or the shown flight, before placing; the way
 * picked carries on to the next tiles where it leads up).
 *
 * @param {React.RefObject<WorldRenderer | null>} renderer - The TV's renderer, for picking.
 * @param {EditorState | null} editor - The editor's tool, or null while it's closed.
 * @param {React.RefObject<BlendAreas | null>} blends - The Mix settings the map remembers, for the picker.
 * @param {(next: EditorState) => void} onChange - Changes the editor's state (the picker sets the Mix brush).
 * @param {(msg: ClientMessage) => void} send - Sends to the server.
 * @returns {TvMouseHandlers} Handlers for the element over the map.
 */
export function useMapEditor(
  renderer: React.RefObject<WorldRenderer | null>,
  editor: EditorState | null,
  blends: React.RefObject<BlendAreas | null>,
  onChange: (next: EditorState) => void,
  send: (msg: ClientMessage) => void,
): TvMouseHandlers {
  const stroke = useRef<{ seen: Set<number>; from: number; level: number } | null>(null);
  const depth = useRef<{ front: number; at: number }>({ front: -1, at: 0 });
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const stairsDir = useRef<number | null>(null);
  const placing = useRef<{ tx: number; ty: number; dir: number } | null>(null);
  const queue = useRef<MapEdit[]>([]);
  const lastSent = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!editor) {
      renderer.current?.setEditCursor(null);
    }
    if (editor?.tool !== 'stairs') {
      renderer.current?.setStairsGhost(null);
    }
  }, [editor, renderer]);

  useEffect(() => () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  }, []);

  const flush = (): void => {
    timer.current = null;
    if (queue.current.length > 0) {
      send({ t: 'edit-map', edits: queue.current });
      queue.current = [];
      lastSent.current = performance.now();
    }
  };

  const push = (e: MapEdit): void => {
    queue.current.push(e);
    const wait = SEND_MS - (performance.now() - lastSent.current);
    if (wait <= 0) {
      flush();
    } else {
      timer.current ??= setTimeout(flush, wait);
    }
  };

  /**
   * The tile the brush is on: the nearest one under the mouse, or one
   * further back along the line of sight after scrolling.
   */
  const tileAt = (clientX: number, clientY: number): { tx: number; ty: number } | null => {
    const hits = renderer.current!.pickTiles(clientX, clientY);
    const front = hits[0] ? hits[0].ty * 1000 + hits[0].tx : -1;
    if (front !== depth.current.front) {
      depth.current = { front, at: 0 };
    }
    const hit = hits[Math.min(depth.current.at, hits.length - 1)];
    if (!hit) {
      return null;
    }
    const r = renderer.current!;
    if (editor?.tool === 'stairs' && r.tileKind(hit.tx, hit.ty) !== 'stairs') {
      for (const [i, [ux, uy]] of RAMP_DIRS.entries()) {
        const sx = hit.tx - ux;
        const sy = hit.ty - uy;
        const edge = ux > 0 ? hit.x - hit.tx : ux < 0 ? hit.tx + 1 - hit.x : uy > 0 ? hit.y - hit.ty : hit.ty + 1 - hit.y;
        if (edge < STAIRS_EDGE && r.tileKind(sx, sy) === 'stairs' && r.rampDir(sx, sy) === i) {
          return { tx: sx, ty: sy };
        }
      }
    }
    return { tx: hit.tx, ty: hit.ty };
  };

  const showCursor = (clientX: number, clientY: number): { tx: number; ty: number } | null => {
    const tile = tileAt(clientX, clientY);
    const r = renderer.current!;
    placing.current = null;
    if (tile && editor?.tool === 'stairs' && r.tileKind(tile.tx, tile.ty) !== 'stairs') {
      const options = r.stairsOptions(tile.tx, tile.ty);
      placing.current = options.find((o) => o.dir === stairsDir.current) ?? options[0] ?? null;
    }
    r.setStairsGhost(placing.current);
    const size = !editor ? 1 : editor.tool === 'stairs' ? 1 : editor.tool === 'pick' ? Math.max(PICK_SIZE, editor.size) : editor.size;
    r.setEditCursor(tile && editor && { ...(placing.current ?? tile), size });
    return tile;
  };

  const apply = (tx: number, ty: number): void => {
    if (!editor || !stroke.current) {
      return;
    }
    const key = ty * 1000 + tx;
    if (stroke.current.seen.has(key)) {
      return;
    }
    stroke.current.seen.add(key);
    const { tool, size, tile, mix, scatter } = editor;
    if (tool === 'erase') {
      push({ op: 'erase', tx, ty, size });
    } else if (tool === 'mix') {
      push({ op: 'blend', tx, ty, size, blend: editor.blend });
    } else if (tool === 'paint') {
      push({ op: 'tile', tx, ty, size, tile, ...(mix ? { mix } : {}), ...(scatter < 1 ? { scatter } : {}) });
    } else if (tool === 'raise' || tool === 'lower') {
      push({ op: 'level', tx, ty, size, level: stroke.current.level, from: stroke.current.from });
    }
  };

  return {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>): void => {
      if (!renderer.current || !editor) {
        return;
      }
      const tile = tileAt(e.clientX, e.clientY);
      if (!tile) {
        return;
      }
      const { tx, ty } = tile;
      if (editor.tool === 'stairs') {
        const onStairs = renderer.current.tileKind(tx, ty) === 'stairs';
        if (e.button === 0 && onStairs) {
          push({ op: 'erase', tx, ty, size: 1 });
        } else if (e.button === 0 && placing.current) {
          push({ op: 'stairs', ...placing.current });
          placing.current = null;
          renderer.current.setStairsGhost(null);
        } else if (e.button === 2 && onStairs) {
          push({ op: 'stairs', tx, ty });
        } else if (e.button === 2) {
          const options = renderer.current.stairsOptions(tx, ty);
          const at = options.findIndex((o) => o.tx === placing.current?.tx && o.ty === placing.current?.ty && o.dir === placing.current?.dir);
          if (options.length > 0) {
            stairsDir.current = options[(at + 1) % options.length].dir;
            showCursor(e.clientX, e.clientY);
          }
        }
        flush();
        return;
      }
      if (e.button !== 0) {
        return;
      }
      if (editor.tool === 'pick') {
        const key = Object.entries(blends.current ?? {}).find(([, list]) => list.includes(ty * MAP_WIDTH + tx))?.[0];
        const map = renderer.current.worldMap();
        const blend = key !== undefined ? parseBlendKey(key) : map ? measureBlend(map, brushTiles(tx, ty, Math.max(PICK_SIZE, editor.size), MAP_WIDTH, MAP_HEIGHT)) : {};
        onChange({ ...editor, blend, tool: 'mix' });
        return;
      }
      const from = renderer.current.levelAt(tx, ty);
      stroke.current = { seen: new Set(), from, level: Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, from + (editor.tool === 'lower' ? -1 : 1))) };
      e.currentTarget.setPointerCapture(e.pointerId);
      apply(tx, ty);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>): void => {
      if (!renderer.current || !editor) {
        return;
      }
      pointer.current = { x: e.clientX, y: e.clientY };
      const tile = showCursor(e.clientX, e.clientY);
      if (tile && stroke.current) {
        apply(tile.tx, tile.ty);
      }
    },
    onPointerUp: (): void => {
      stroke.current = null;
      flush();
    },
    onPointerCancel: (): void => {
      stroke.current = null;
      flush();
    },
    onContextMenu: (e: React.MouseEvent<HTMLDivElement>): void => {
      e.preventDefault();
    },
    onWheel: (e: React.WheelEvent<HTMLDivElement>): void => {
      if (!renderer.current || !editor || !pointer.current) {
        return;
      }
      const hits = renderer.current.pickTiles(pointer.current.x, pointer.current.y);
      depth.current.at = Math.max(0, Math.min(hits.length - 1, depth.current.at + (e.deltaY > 0 ? 1 : -1)));
      showCursor(pointer.current.x, pointer.current.y);
    },
  };
}
