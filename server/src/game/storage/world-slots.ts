// Packages
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';

// Local Imports
import { LEGACY_WORLD_SAVE, SAVE_DIR } from '../../config/paths';
import { BACKUPS_KEPT, FIRST_SLOT_NAME, MAX_SLOT_NAME } from './config/save';
import { importLegacy, readSlot, saveSlot } from './slot-files';

// Types
import type { WorldSlotInfo } from '@halloween/shared/saves/world-slots';
import type { Game } from '../game';
import type { LoadedSlot } from './types/save';

/**
 * What a slot's `slot.json` keeps about it.
 */
type SlotMeta = Omit<WorldSlotInfo, 'active'>;

/**
 * The server's saved worlds, each a folder under `SAVE_DIR/worlds/` with
 * its world, chunks, and characters, and which one is being played
 * (`SAVE_DIR/server.json`). Backups of a slot go under
 * `SAVE_DIR/backups/<slot>/`.
 */
export class WorldSlots {
  /**
   * The slot being played.
   */
  private _active: string;

  /**
   * Opens the save folder, making the first slot (from the old
   * single-file save, if there is one) when there are none.
   */
  constructor() {
    mkdirSync(join(SAVE_DIR, 'worlds'), { recursive: true });
    const server = this.readServer();
    if (server && existsSync(this.dir(server))) {
      this._active = server;
    } else {
      this._active = this.list()[0]?.id ?? this.create(FIRST_SLOT_NAME);
      if (this.list().length === 1 && !existsSync(join(this.dir(this._active), 'world.json'))) {
        importLegacy(LEGACY_WORLD_SAVE, this.dir(this._active));
      }
      this.writeServer();
    }
  }

  /**
   * The slot being played.
   * @returns Its id.
   */
  get active(): string {
    return this._active;
  }

  /**
   * Every slot, oldest first.
   * @returns Their info.
   */
  list(): WorldSlotInfo[] {
    return readdirSync(join(SAVE_DIR, 'worlds'))
      .map((id: string): SlotMeta | null => this.meta(id))
      .filter((m: SlotMeta | null): m is SlotMeta => m !== null)
      .sort((a: SlotMeta, b: SlotMeta): number => a.created - b.created)
      .map((m: SlotMeta): WorldSlotInfo => ({ ...m, active: m.id === this._active }));
  }

  /**
   * Makes an empty slot (its world is made when it's first played).
   * @param rawName Its name.
   * @returns Its id.
   */
  create(rawName: string): string {
    const name = rawName.replace(/\s+/g, ' ').trim().slice(0, MAX_SLOT_NAME) || 'World';
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'world';
    let id = base;
    for (let n = 2; existsSync(this.dir(id)); n++) {
      id = `${base}-${n}`;
    }
    mkdirSync(this.dir(id), { recursive: true });
    this.writeMeta({ id, name, created: Date.now(), savedAt: 0, width: 0, height: 0, characters: 0 });
    return id;
  }

  /**
   * Reads a slot to play.
   * @param id The slot.
   * @returns What it holds, or null if there's no such slot.
   */
  read(id: string): LoadedSlot | null {
    return this.meta(id) ? readSlot(this.dir(id)) : null;
  }

  /**
   * Makes a slot the one being played (after it's been read and loaded).
   * @param id The slot.
   */
  activate(id: string): void {
    this._active = id;
    this.writeServer();
  }

  /**
   * Deletes a slot that isn't being played, backing it up first.
   * @param id The slot.
   * @returns Whether it was deleted.
   */
  remove(id: string): boolean {
    if (id === this._active || !this.meta(id)) {
      return false;
    }
    this.backup(id, 'deleted');
    rmSync(this.dir(id), { recursive: true, force: true });
    return true;
  }

  /**
   * Saves the game into the slot being played.
   * @param game The game.
   * @returns How many chunks and players it wrote.
   */
  save(game: Game): { chunks: number; players: number } {
    const wrote = saveSlot(this.dir(this._active), game);
    const meta = this.meta(this._active);
    if (meta) {
      this.writeMeta({ ...meta, savedAt: Date.now(), width: game.world.map.width, height: game.world.map.height, characters: game.roster.away.size + game.roster.players.size - (game.testBot.token ? 1 : 0) });
    }
    return wrote;
  }

  /**
   * Copies a slot's folder into its backups, keeping the newest
   * BACKUPS_KEPT.
   * @param id The slot.
   * @param reason Why (ends the backup's folder name).
   */
  backup(id: string, reason: string): void {
    const root = join(SAVE_DIR, 'backups', id);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    cpSync(this.dir(id), join(root, `${stamp}-${reason}`), { recursive: true, filter: (src: string): boolean => basename(src) !== 'pending' });
    const all = readdirSync(root).sort();
    for (const old of all.slice(0, Math.max(0, all.length - BACKUPS_KEPT))) {
      rmSync(join(root, old), { recursive: true, force: true });
    }
  }

  /**
   * A slot's folder.
   * @param id The slot.
   * @returns Its path.
   */
  private dir(id: string): string {
    return join(SAVE_DIR, 'worlds', id.replace(/[^a-z0-9-]/gi, ''));
  }

  /**
   * A slot's `slot.json`, each field defaulted if bad. A slot folder whose
   * `slot.json` is missing or unreadable but that holds a world gets a new
   * one (named after the folder), so it never drops out of the list.
   * @param id The slot.
   * @returns Its info, or null if it isn't a slot.
   */
  private meta(id: string): SlotMeta | null {
    const dir = this.dir(id);
    let raw: unknown = null;
    try {
      raw = JSON.parse(readFileSync(join(dir, 'slot.json'), 'utf8'));
    } catch {
      raw = null;
    }
    const saved = typeof raw === 'object' && raw !== null ? raw as Partial<SlotMeta> : null;
    if (!saved && !existsSync(join(dir, 'world.json')) && !existsSync(join(dir, 'chunks'))) {
      return null;
    }
    const n = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
    const meta: SlotMeta = {
      id: basename(dir),
      name: typeof saved?.name === 'string' && saved.name ? saved.name : basename(dir),
      created: n(saved?.created),
      savedAt: n(saved?.savedAt),
      width: n(saved?.width),
      height: n(saved?.height),
      characters: n(saved?.characters),
    };
    if (!saved) {
      console.log(`[save] rebuilt the missing or unreadable ${join(dir, 'slot.json')}`);
      this.writeMeta(meta);
    }
    return meta;
  }

  /**
   * Writes a slot's `slot.json`.
   * @param meta Its info.
   */
  private writeMeta(meta: SlotMeta): void {
    writeFileSync(join(this.dir(meta.id), 'slot.json'), JSON.stringify(meta, null, 2));
  }

  /**
   * Which slot `server.json` says is being played.
   * @returns Its id, or null.
   */
  private readServer(): string | null {
    try {
      return (JSON.parse(readFileSync(join(SAVE_DIR, 'server.json'), 'utf8')) as { active?: string }).active ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Writes which slot is being played.
   */
  private writeServer(): void {
    writeFileSync(join(SAVE_DIR, 'server.json'), JSON.stringify({ active: this._active }, null, 2));
  }
}
