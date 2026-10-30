// Packages
import {
  useCallback,
  useRef,
  useState,
} from 'react';
import { RESOURCES, stock } from '@halloween/shared/goods/goods';
import { MAX_HP } from '@halloween/shared/players/health';
import { sfx } from '@halloween/ui/audio/sfx/sfx';
import {
  readStorage,
  writeStorage,
} from '@halloween/ui/helpers/storage';
import { useSocket } from '@halloween/ui/hooks/use-socket';

// Local Imports
import {
  BUILD_ERROR_MS,
  EMPTY_GEAR,
  EMPTY_VITALS,
} from '../config/session';
import { useFlashMessage } from './use-flash-message';
import { usePickupToasts } from './use-pickup-toasts';
import { useSfxUnlock } from './use-sfx-unlock';

// Types
import type { BagItem, Gear } from '@halloween/shared/inventory/bag-items';
import type { Inventory, Resource } from '@halloween/shared/goods/goods';
import type { ControllerMessage } from '@halloween/shared/protocol/messages/controller-message';
import type { PadInfo } from '@halloween/shared/protocol/pads';
import type { PlayerIdentity } from '@halloween/shared/protocol/state/player-state';
import type { Vitals } from '@halloween/shared/protocol/state/vitals';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type {
  ControllerSession,
  NaughtyNotice,
  PadMenuRequest,
  Rumble,
} from '../types/session';

/**
 * A controller socket and the player state it hears about. Says hello with
 * the token saved under `tokenKey`; the server either resumes that player
 * or asks for a fresh join. Plays the player's own sounds and buzzes
 * (`rumble`, the phone's vibration by default) when hurt, killed, or
 * picking something up.
 *
 * @param {string} tokenKey - Where the player token is kept in localStorage.
 * @param {(pattern: Rumble) => void} [rumble] - Buzzes the device.
 * @returns {ControllerSession} The session.
 */
export function useControllerSession(tokenKey: string, rumble: (pattern: Rumble) => void = (p: Rumble): void => {
  navigator.vibrate?.(p);
}): ControllerSession {
  const [welcomed, setWelcomed] = useState(false);
  const [identity, setIdentity] = useState<PlayerIdentity | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [inventory, setInventory] = useState<Inventory>(stock());
  const [gear, setGear] = useState<Gear>(EMPTY_GEAR);
  const [tree, setTree] = useState<TreeState>({ found: [], levels: {} });
  const [research, setResearch] = useState(0);
  const [anvil, setAnvil] = useState<number | null>(null);
  const carried = useRef(0);
  const lastInventory = useRef<Inventory | null>(null);
  const { toasts, bump } = usePickupToasts();
  const { message: buildError, flash: flashBuildError } = useFlashMessage(BUILD_ERROR_MS);
  const [vitals, setVitals] = useState<Vitals>(EMPTY_VITALS);
  const [respawnAt, setRespawnAt] = useState(0);
  const [naughty, setNaughty] = useState<NaughtyNotice | null>(null);
  const [stash, setStash] = useState<(BagItem | null)[] | null>(null);
  const [pads, setPads] = useState<PadInfo[]>([]);
  const [padMenu, setPadMenu] = useState<PadMenuRequest | null>(null);
  /**
   * Clears the naughty screen once it has played.
   */
  const endNaughty = useCallback((): void => setNaughty(null), []);
  const lastHp = useRef(MAX_HP);

  useSfxUnlock();

  /**
   * Remembers (or forgets) the player token across reloads.
   *
   * @param next - The player now played, or null.
   */
  const applyIdentity = (next: PlayerIdentity | null): void => {
    lastInventory.current = null;
    setIdentity(next);
    writeStorage(tokenKey, next?.token ?? null);
  };

  /**
   * Handles one message from the server. Defined inline each render, so
   * the 'vitals' case reads this render's `vitals`.
   *
   * @param msg - The message.
   */
  const handleMessage = (msg: ControllerMessage): void => {
    switch (msg.t) {
      case 'controller-welcome':
        setWelcomed(true);
        applyIdentity(msg.identity);
        return;
      case 'joined':
        setJoining(false);
        setJoinError(null);
        applyIdentity(msg.identity);
        return;
      case 'join-error':
        setJoining(false);
        setJoinError(msg.error);
        return;
      case 'left':
        applyIdentity(null);
        setPads([]);
        return;
      case 'vitals': {
        const next = msg.vitals;
        if (next.death) {
          if (!vitals.death) {
            rumble([200, 80, 200]);
            sfx.play('death');
          }
          setRespawnAt(Date.now() + next.death.respawnIn * 1000);
        } else if (vitals.death) {
          sfx.play('respawn');
        } else if (next.hp < lastHp.current) {
          rumble(60);
          sfx.play('hurt');
        }
        lastHp.current = next.hp;
        setVitals(next);
        return;
      }
      case 'build-error':
        rumble([30, 40, 30]);
        sfx.play('error');
        flashBuildError(msg.error);
        return;
      case 'stash':
        setStash(msg.items);
        return;
      case 'pads':
        setPads(msg.pads);
        return;
      case 'pad-menu':
        setPadMenu({ menu: msg.menu, id: Date.now() });
        return;
      case 'naughty':
        rumble([80, 40, 80, 40, 160]);
        sfx.play('error', { volume: 1, pitch: 0.7 });
        setNaughty({ id: Date.now(), candy: msg.candy });
        return;
      case 'sounds':
        for (const name of msg.names) {
          sfx.play(name, { volume: 0.8, pitch: 0.95 + Math.random() * 0.1 });
        }
        return;
      case 'inventory': {
        const total = RESOURCES.reduce((sum: number, r: Resource): number => sum + msg.inventory[r], 0);
        if (total > carried.current) {
          rumble(15);
        }
        carried.current = total;
        const before = lastInventory.current;
        lastInventory.current = msg.inventory;
        bump(before, msg.inventory);
        setInventory(msg.inventory);
        setGear(msg.gear);
        setTree(msg.tree);
        setResearch(msg.research);
        setAnvil(msg.anvil);
        return;
      }
    }
  };

  const { send } = useSocket<ControllerMessage>({
    hello: () => ({ t: 'hello-controller', token: readStorage(tokenKey) ?? undefined }),
    onMessage: handleMessage,
  });

  /**
   * Asks the server to join with a name and color.
   * @param name The player name.
   * @param color The player color.
   */
  const join = useCallback((name: string, color: string): void => {
    setJoining(true);
    setJoinError(null);
    send({ t: 'join', name, color });
  }, [send]);

  return { welcomed, identity, joinError, joining, inventory, gear, tree, research, anvil, toasts, buildError, vitals, respawnAt, naughty, endNaughty, stash, pads, padMenu, send, join };
}
