// Packages
import { WebSocket } from 'ws';

// Local Imports
import { HubPart } from '../core/hub-part';
import { nearInterest } from './helpers/interest';

// Types
import type { StateMessage } from './types/state';

/**
 * The per-tick fan-out: tile changes and state to every display, and each
 * phone's changed belongings, vitals, chest, naughty candy and sounds.
 */
export class StateBroadcaster extends HubPart {
  /**
   * Sends this tick's tile changes (if any) and state to every display, and
   * changed inventories to their phones. `steps` ticks just ran, taking
   * `stepMs` in all; both feed the stats shown on the TV each second.
   * @param steps Ticks that just ran.
   * @param stepMs Time (ms) they took in all.
   */
  broadcastState(steps: number, stepMs: number): void {
    this.stats.record(steps, stepMs);
    const changes = this.game.world.map.takeChanges();
    if (changes.length > 0) {
      this.sessions.broadcastToDisplays({ t: 'tiles', changes });
    }
    const state: StateMessage = {
      t: 'state',
      tick: this.game.tick,
      players: this.game.views.snapshot(),
      monsters: this.game.horde.snapshot(),
      shots: this.game.shots.shotStates(),
      puddles: this.game.puddles.puddleStates(),
      bloodMoon: this.game.moon.bloodMoon(),
      items: this.game.world.items.itemStates(),
      lights: this.game.settings.lightsOff ? [] : this.game.world.lights.lightStates(),
      cursorLight: this.game.tvHand.cursorLight,
      events: this.game.outbox.takeEvents(),
      settings: this.game.settings,
      stats: this.stats.current,
      watched: this.sessions.watchedByViewers(),
    };
    this.sendState(state);
    for (const [token, carried] of this.game.outbox.takeInventoryChanges()) {
      const ws = this.sessions.controllers.get(token);
      if (ws) {
        this.sessions.send(ws, { t: 'inventory', ...carried });
      }
    }
    for (const [token, vitals] of this.game.outbox.takeVitalsChanges()) {
      const ws = this.sessions.controllers.get(token);
      if (ws) {
        this.sessions.send(ws, { t: 'vitals', vitals });
      }
    }
    for (const [token, items] of this.game.outbox.takeStashChanges()) {
      const ws = this.sessions.controllers.get(token);
      if (ws) {
        this.sessions.send(ws, { t: 'stash', items });
      }
    }
    for (const [token, candy] of this.game.outbox.takeNaughty()) {
      const ws = this.sessions.controllers.get(token);
      if (ws) {
        this.sessions.send(ws, { t: 'naughty', candy });
      }
    }
    for (const [token, names] of this.game.outbox.takeSounds()) {
      const ws = this.sessions.controllers.get(token);
      if (ws) {
        this.sessions.send(ws, { t: 'sounds', names });
      }
    }
  }

  /**
   * Sends a tick's state to every display. On a huge world, one watching
   * players gets only what's within INTEREST_RADIUS of them (everyone
   * else gets it all).
   * @param state The tick's full state.
   */
  private sendState(state: StateMessage): void {
    const full = JSON.stringify(state);
    const huge = this.game.world.map.edge === 'chasm';
    const width = this.game.world.map.width;
    for (const [ws, session] of this.sessions.sockets) {
      if (session.role !== 'display' || ws.readyState !== WebSocket.OPEN) {
        continue;
      }
      const centers = huge ? state.players.filter((p): boolean => session.watch.includes(p.id)) : [];
      if (centers.length === 0) {
        this.stats.countSent(full.length);
        ws.send(full);
        continue;
      }
      const data = JSON.stringify(nearInterest(state, centers, width));
      this.stats.countSent(data.length);
      ws.send(data);
    }
  }
}
