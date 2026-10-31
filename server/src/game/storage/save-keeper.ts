// Local Imports
import { Game } from '../game';
import { WorldSlots } from './world-slots';

// Types
import type { CharacterInfo, WorldSlotInfo } from '@halloween/shared/saves/world-slots';

/**
 * Keeps the game saved: owns the world slots and the game played from the
 * active one, saves on demand (the server calls it on a timer, after a
 * reset, and on shutdown), backs up, and switches slots.
 */
export class SaveKeeper {
  /**
   * The saved worlds.
   */
  readonly slots = new WorldSlots();

  /**
   * The game, opened from the active slot.
   */
  readonly game: Game;

  /**
   * Opens the active slot.
   */
  constructor() {
    this.game = new Game(this.slots.read(this.slots.active));
  }

  /**
   * Saves the game into the active slot. A failure is logged, never
   * thrown: the game plays on and the next save tries again.
   */
  save(): void {
    try {
      const began = performance.now();
      const wrote = this.slots.save(this.game);
      const ms = performance.now() - began;
      if (ms > 50) {
        console.log(`[save] slow save: ${ms.toFixed(0)} ms, ${wrote.chunks} chunks, ${wrote.players} players`);
      }
    } catch (err) {
      console.error('[save] failed', err);
    }
  }

  /**
   * Saves, then copies the active slot into its backups.
   * @param reason Why (names the backup).
   */
  backup(reason: string): void {
    this.save();
    try {
      this.slots.backup(this.slots.active, reason);
    } catch (err) {
      console.error('[save] backup failed', err);
    }
  }

  /**
   * Saves and backs up the active slot, then plays another.
   * @param id The slot to play.
   * @returns Whether it switched.
   */
  switchTo(id: string): boolean {
    if (id === this.slots.active) {
      return false;
    }
    const slot = this.slots.read(id);
    if (!slot) {
      return false;
    }
    this.backup('switched-away');
    this.game.load(slot);
    this.slots.activate(id);
    this.save();
    return true;
  }

  /**
   * Every slot.
   * @returns Their info.
   */
  list(): WorldSlotInfo[] {
    return this.slots.list();
  }

  /**
   * Every character in the world being played.
   * @returns Their info, by name.
   */
  characters(): CharacterInfo[] {
    const { players, away } = this.game.roster;
    const bot = this.game.testBot.token;
    return [
      ...[...players.values()].filter((p): boolean => p.token !== bot).map((p): CharacterInfo => ({ id: p.id, name: p.name, color: p.color, online: true })),
      ...[...away.values()].map((s): CharacterInfo => ({ id: s.id, name: s.name, color: s.color, online: false })),
    ].sort((a: CharacterInfo, b: CharacterInfo): number => a.name.localeCompare(b.name));
  }
}
