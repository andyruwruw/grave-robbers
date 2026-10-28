// Packages
import { WebSocket } from 'ws';
import { cleanMapGen } from '@halloween/shared/map-gen';

// Local Imports
import { listPresets, savePreset } from '../game/world-store';
import { lanAddress } from './lan-address';

// Types
import type { WebSocketServer, RawData } from 'ws';
import type { TvStatus } from '@halloween/shared/audio';
import type { Game } from '../game/game';
import type {
  ClientMessage,
  ControllerMessage,
  DisplayMessage,
  ServerStats,
} from '@halloween/shared/protocol';

/**
 * Per-socket state once a client has said hello.
 */
type Session =
  | { role: 'unknown' }
  | { role: 'display'; admin: boolean }
  | { role: 'controller'; token: string | null };

/**
 * Routes socket traffic into the Game and broadcasts state to displays.
 * Each phone owns at most one socket: a newer socket for the same token
 * replaces the older one.
 */
export class ConnectionHub {
  private sessions = new Map<WebSocket, Session>();
  private stats: ServerStats = { tps: 0, stepMs: 0, worldLevel: 0, levels: {} };
  private ticks = 0;
  private stepTotal = 0;
  private windowStart = Date.now();
  private controllerByToken = new Map<string, WebSocket>();

  /**
   * The TV's music, last reported, for admin pages that open later.
   */
  private tvStatus: TvStatus | null = null;

  /**
   * The one TV page that plays music (the newest, unless another claims
   * it), so two open TV pages never play over each other.
   */
  private musicOwner: WebSocket | null = null;

  constructor(
    private wss: WebSocketServer,
    private game: Game,
    private onWorldReset: () => void,
  ) {
    wss.on('connection', (ws: WebSocket): void => this.handleConnection(ws));
  }

  /**
   * Sends this tick's tile changes (if any) and state to every display, and
   * changed inventories to their phones. `steps` ticks just ran, taking
   * `stepMs` in all; both feed the stats shown on the TV each second.
   */
  broadcastState(steps: number, stepMs: number): void {
    this.ticks += steps;
    this.stepTotal += stepMs;
    const now = Date.now();
    if (now - this.windowStart >= 1000) {
      this.stats = {
        tps: Math.round((this.ticks * 1000) / (now - this.windowStart) * 10) / 10,
        stepMs: Math.round((this.stepTotal / this.ticks) * 100) / 100,
        worldLevel: Math.round(this.game.worldLevel * 10) / 10,
        levels: this.game.playerLevels(),
      };
      this.ticks = 0;
      this.stepTotal = 0;
      this.windowStart = now;
    }
    const changes = this.game.world.map.takeChanges();
    if (changes.length > 0) {
      this.broadcastToDisplays({ t: 'tiles', changes });
    }
    this.broadcastToDisplays({
      t: 'state',
      tick: this.game.tick,
      players: this.game.snapshot(),
      monsters: this.game.monsters(),
      shots: this.game.shotStates(),
      puddles: this.game.puddleStates(),
      bloodMoon: this.game.bloodMoon(),
      items: this.game.world.itemStates(),
      lights: this.game.settings.lightsOff ? [] : this.game.world.lightStates(),
      cursorLight: this.game.cursorLight,
      events: this.game.takeEvents(),
      settings: this.game.settings,
      stats: this.stats,
    });
    for (const [token, carried] of this.game.takeInventoryChanges()) {
      const ws = this.controllerByToken.get(token);
      if (ws) {
        this.send(ws, { t: 'inventory', ...carried });
      }
    }
    for (const [token, item] of this.game.takeReachChanges()) {
      const ws = this.controllerByToken.get(token);
      if (ws) {
        this.send(ws, { t: 'reach', item });
      }
    }
    for (const [token, vitals] of this.game.takeVitalsChanges()) {
      const ws = this.controllerByToken.get(token);
      if (ws) {
        this.send(ws, { t: 'vitals', vitals });
      }
    }
    for (const [token, names] of this.game.takeSounds()) {
      const ws = this.controllerByToken.get(token);
      if (ws) {
        this.send(ws, { t: 'sounds', names });
      }
    }
  }

  /**
   * Sends to every display, or only TVs (`false`) or only admin pages
   * (`true`).
   */
  private broadcastToDisplays(msg: DisplayMessage, admin?: boolean): void {
    const data = JSON.stringify(msg);
    for (const [ws, session] of this.sessions) {
      if (session.role === 'display' && (admin === undefined || session.admin === admin) && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }

  private worldMessage(): DisplayMessage {
    return { t: 'world', seed: this.game.world.seed, tiles: this.game.world.map.encode(), levels: this.game.world.map.encodeLevels(), ramps: this.game.world.map.encodeRamps(), blends: this.game.world.blendAreas(), view: this.game.world.view };
  }

  private handleConnection(ws: WebSocket): void {
    this.sessions.set(ws, { role: 'unknown' });
    ws.on('message', (raw: RawData): void => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      this.handleMessage(ws, msg);
    });
    ws.on('close', (): void => this.handleClose(ws));
  }

  private handleMessage(ws: WebSocket, msg: ClientMessage): void {
    const session = this.sessions.get(ws);
    if (!session) {
      return;
    }
    switch (msg.t) {
      case 'hello-display':
        this.sessions.set(ws, { role: 'display', admin: msg.admin === true });
        this.send(ws, { t: 'display-welcome', lanAddress: lanAddress(), presets: listPresets() });
        this.send(ws, this.worldMessage());
        if (msg.admin !== true) {
          this.setMusicOwner(ws);
        }
        if (msg.admin === true && this.tvStatus) {
          this.send(ws, { t: 'tv-status', status: this.tvStatus });
        }
        return;
      case 'tv-control':
        if (session.role === 'display' && session.admin) {
          this.broadcastToDisplays({ t: 'tv-control', control: msg.control }, false);
        }
        return;
      case 'edit-map':
        if (session.role === 'display' && Array.isArray(msg.edits)) {
          for (const e of msg.edits.slice(0, 200)) {
            if (e && typeof e === 'object') {
              this.game.world.edit(e);
            }
          }
          this.game.world.map.takeChanges();
          this.broadcastToDisplays(this.worldMessage());
        }
        return;
      case 'save-preset': {
        const name = typeof msg.name === 'string' ? msg.name.trim().slice(0, 40) : '';
        if (session.role === 'display' && name) {
          const map = this.game.world.map;
          savePreset({ name, seed: this.game.world.seed, tiles: map.encode(), levels: map.encodeLevels(), ramps: map.encodeRamps(), blends: this.game.world.blendAreas(), view: this.game.world.view });
          this.broadcastToDisplays({ t: 'presets', presets: listPresets() });
        }
        return;
      }
      case 'claim-music':
        if (session.role === 'display' && !session.admin) {
          this.setMusicOwner(ws);
        }
        return;
      case 'tv-status':
        if (session.role === 'display' && !session.admin && ws === this.musicOwner) {
          this.tvStatus = msg.status;
          this.broadcastToDisplays({ t: 'tv-status', status: msg.status }, true);
        }
        return;
      case 'hello-controller': {
        const identity = typeof msg.token === 'string' ? this.game.resume(msg.token) : null;
        this.sessions.set(ws, { role: 'controller', token: identity?.token ?? null });
        if (identity) {
          this.claimToken(ws, identity.token);
        }
        this.send(ws, { t: 'controller-welcome', identity });
        this.sendPrivateState(ws, identity?.token ?? null);
        return;
      }
      case 'join': {
        if (session.role !== 'controller' || session.token) {
          return;
        }
        const result = this.game.join(String(msg.name ?? ''), String(msg.color ?? ''));
        if (!result.ok) {
          this.send(ws, { t: 'join-error', error: result.error });
          return;
        }
        session.token = result.identity.token;
        this.claimToken(ws, result.identity.token);
        this.send(ws, { t: 'joined', identity: result.identity });
        this.sendPrivateState(ws, result.identity.token);
        return;
      }
      case 'leave':
        if (session.role === 'controller' && session.token) {
          this.game.leave(session.token);
          this.controllerByToken.delete(session.token);
          session.token = null;
          this.send(ws, { t: 'left' });
        }
        return;
      case 'input':
        if (session.role === 'controller' && session.token) {
          this.game.setInput(session.token, Number(msg.x), Number(msg.y));
        }
        return;
      case 'action':
        if (session.role === 'controller' && session.token) {
          this.game.setAction(session.token, msg.down === true);
        }
        return;
      case 'block':
        if (session.role === 'controller' && session.token) {
          this.game.setBlock(session.token, msg.down === true);
        }
        return;
      case 'aim':
        if (session.role === 'controller' && session.token) {
          this.game.setAim(session.token, msg.x, msg.y);
        }
        return;
      case 'drop':
        if (session.role === 'controller' && session.token) {
          this.game.drop(session.token, msg.resource);
        }
        return;
      case 'grab':
        if (session.role === 'controller' && session.token) {
          this.game.grab(session.token);
        }
        return;
      case 'equip':
        if (session.role === 'controller' && session.token) {
          this.game.equip(session.token, msg.bag);
        }
        return;
      case 'drink':
        if (session.role === 'controller' && session.token) {
          this.game.drink(session.token, msg.bag);
        }
        return;
      case 'panic':
        if (session.role === 'controller' && session.token) {
          this.game.panic(session.token);
        }
        return;
      case 'unequip':
        if (session.role === 'controller' && session.token) {
          this.game.unequip(session.token, msg.slot);
        }
        return;
      case 'drop-gear':
        if (session.role === 'controller' && session.token) {
          this.game.dropGear(session.token, msg.from);
        }
        return;
      case 'move-item':
        if (session.role === 'controller' && session.token) {
          this.game.moveItem(session.token, msg.from, msg.to);
        }
        return;
      case 'craft':
        if (session.role === 'controller' && session.token) {
          this.game.craft(session.token, msg.recipe, msg.count);
        }
        return;
      case 'upgrade':
        if (session.role === 'controller' && session.token) {
          this.game.upgrade(session.token, msg.node);
        }
        return;
      case 'build-select':
        if (session.role === 'controller' && session.token) {
          this.game.selectBuild(session.token, msg.slot);
        }
        return;
      case 'build-place':
        if (session.role === 'controller' && session.token) {
          const error = this.game.placeBuild(session.token);
          if (error) {
            this.send(ws, { t: 'build-error', error });
          }
        }
        return;
      case 'reset-world':
        if (session.role === 'display') {
          this.game.reset(typeof msg.preset === 'string' ? msg.preset : null, cleanMapGen(msg.gen));
          this.broadcastToDisplays(this.worldMessage());
          this.onWorldReset();
        }
        return;
      case 'kill-monsters':
        if (session.role === 'display') {
          this.game.killMonsters();
        }
        return;
      case 'tv-lift':
        if (session.role === 'display') {
          this.game.lift(msg.target, msg.x, msg.y, msg.drop);
        }
        return;
      case 'tv-light':
        if (session.role === 'display') {
          this.game.setCursorLight(msg.at);
        }
        return;
      case 'force-blood-moon':
        if (session.role === 'display') {
          this.game.forceBloodMoon();
        }
        return;
      case 'game-settings':
        if (session.role === 'display') {
          this.game.configure(msg.settings);
        }
        return;
      case 'spawn':
        if (session.role === 'display') {
          this.game.spawn(msg.kind);
        }
        return;
    }
  }

  /**
   * Hands the music to one TV page and tells every TV page whether it's
   * the one.
   */
  private setMusicOwner(ws: WebSocket | null): void {
    this.musicOwner = ws;
    for (const [other, session] of this.sessions) {
      if (session.role === 'display' && !session.admin) {
        this.send(other, { t: 'music-owner', owner: other === ws });
      }
    }
  }

  private handleClose(ws: WebSocket): void {
    const session = this.sessions.get(ws);
    this.sessions.delete(ws);
    if (ws === this.musicOwner) {
      const tvs = [...this.sessions].filter(([, s]: [WebSocket, Session]): boolean => s.role === 'display' && !s.admin);
      this.setMusicOwner(tvs.at(-1)?.[0] ?? null);
    }
    if (session?.role === 'controller' && session.token && this.controllerByToken.get(session.token) === ws) {
      this.controllerByToken.delete(session.token);
      this.game.disconnect(session.token);
    }
  }

  /**
   * Binds a token to this socket, closing any older socket holding it.
   */
  private claimToken(ws: WebSocket, token: string): void {
    const previous = this.controllerByToken.get(token);
    if (previous && previous !== ws) {
      const prevSession = this.sessions.get(previous);
      if (prevSession?.role === 'controller') {
        prevSession.token = null;
      }
      previous.close(4000, 'Replaced by a newer connection');
    }
    this.controllerByToken.set(token, ws);
  }

  /**
   * Brings a freshly attached phone up to date: inventory, gear, what's in
   * reach, and vitals.
   */
  private sendPrivateState(ws: WebSocket, token: string | null): void {
    const carried = token ? this.game.inventoryOf(token) : null;
    const vitals = token ? this.game.vitalsOf(token) : null;
    if (token && carried) {
      this.send(ws, { t: 'inventory', ...carried });
      this.send(ws, { t: 'reach', item: this.game.reachOf(token) });
    }
    if (vitals) {
      this.send(ws, { t: 'vitals', vitals });
    }
  }

  private send(ws: WebSocket, msg: DisplayMessage | ControllerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }
}
