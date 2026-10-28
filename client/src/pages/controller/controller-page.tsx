// Packages
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BAG_SLOTS } from '@halloween/shared/gear';
import { RESOURCES, stock } from '@halloween/shared/items';
import { MAX_HP } from '@halloween/shared/players';

// Local Imports
import { sfx } from '../../audio/sfx';
import PageLayout from '../../components/layout/page-layout';
import Card from '../../components/ui/primitives/card';
import { Skeleton } from '../../components/ui/feedback/skeleton';
import { TOKEN_STORAGE_KEY } from '../../config';
import {
  readStorage,
  writeStorage,
} from '../../helpers/storage';
import { useSocket } from '../../hooks/use-socket';
import ControllerPad from './components/controller-pad';
import JoinForm from './components/join-form';
import PickupToasts from './components/pickup-toasts';

// Types
import type {
  Gear,
  GearSlot,
  ItemKey,
  RecipeId,
} from '@halloween/shared/gear';
import type { Inventory, Resource } from '@halloween/shared/items';
import type {
  ControllerMessage,
  PlayerIdentity,
  Vitals,
} from '@halloween/shared/protocol';
import type { NodeId, TreeState } from '@halloween/shared/tree';
import type { PickupToast } from './components/pickup-toasts';

const BUILD_ERROR_MS = 1800;

/**
 * How long a "+6 candy" toast stays up after its last bump.
 */
const TOAST_MS = 2200;

const EMPTY_GEAR: Gear = { equipped: { weapon: null, offhand: null, armor: null }, bag: Array.from({ length: BAG_SLOTS }, (): null => null) };

/**
 * Phone page. Says hello with any saved token; the server either resumes
 * that player or asks the phone to join fresh.
 *
 * @returns {React.JSX.Element} The rendered page.
 */
function ControllerPage(): React.JSX.Element {
  const [welcomed, setWelcomed] = useState(false);
  const [identity, setIdentity] = useState<PlayerIdentity | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [inventory, setInventory] = useState<Inventory>(stock());
  const [gear, setGear] = useState<Gear>(EMPTY_GEAR);
  const [tree, setTree] = useState<TreeState>({ found: [], levels: {} });
  const [research, setResearch] = useState(false);
  const [reach, setReach] = useState<ItemKey | null>(null);
  const carried = useRef(0);
  const lastInventory = useRef<Inventory | null>(null);
  const [toasts, setToasts] = useState<PickupToast[]>([]);
  const toastTimers = useRef(new Map<Resource, ReturnType<typeof setTimeout>>());
  const toastId = useRef(0);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [vitals, setVitals] = useState<Vitals>({ hp: MAX_HP, wounded: 0, protected: false, death: null });
  const [respawnAt, setRespawnAt] = useState(0);
  const lastHp = useRef(MAX_HP);
  const buildErrorTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const unlock = (): void => {
      void sfx.unlock();
    };
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, []);

  /**
   * Remembers (or forgets) the player token across reloads.
   */
  const applyIdentity = (next: PlayerIdentity | null): void => {
    lastInventory.current = null;
    setIdentity(next);
    writeStorage(TOKEN_STORAGE_KEY, next?.token ?? null);
  };

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
        return;
      case 'vitals': {
        const next = msg.vitals;
        if (next.death) {
          if (!vitals.death) {
            navigator.vibrate?.([200, 80, 200]);
            sfx.play('death');
          }
          setRespawnAt(Date.now() + next.death.respawnIn * 1000);
        } else if (vitals.death) {
          sfx.play('respawn');
        } else if (next.hp < lastHp.current) {
          navigator.vibrate?.(60);
          sfx.play('hurt');
        }
        lastHp.current = next.hp;
        setVitals(next);
        return;
      }
      case 'build-error':
        navigator.vibrate?.([30, 40, 30]);
        sfx.play('error');
        setBuildError(msg.error);
        clearTimeout(buildErrorTimer.current);
        buildErrorTimer.current = setTimeout((): void => setBuildError(null), BUILD_ERROR_MS);
        return;
      case 'sounds':
        for (const name of msg.names) {
          sfx.play(name, { volume: 0.8, pitch: 0.95 + Math.random() * 0.1 });
        }
        return;
      case 'inventory': {
        const total = RESOURCES.reduce((sum: number, r: Resource): number => sum + msg.inventory[r], 0);
        if (total > carried.current) {
          navigator.vibrate?.(15);
        }
        carried.current = total;
        const before = lastInventory.current;
        lastInventory.current = msg.inventory;
        for (const r of RESOURCES) {
          const gained = before ? msg.inventory[r] - before[r] : 0;
          if (gained > 0) {
            toastId.current++;
            const id = toastId.current;
            setToasts((list: PickupToast[]): PickupToast[] => {
              const shown = list.find((t: PickupToast): boolean => t.resource === r);
              return shown
                ? list.map((t: PickupToast): PickupToast => (t.resource === r ? { resource: r, amount: t.amount + gained, id } : t))
                : [...list, { resource: r, amount: gained, id }];
            });
            clearTimeout(toastTimers.current.get(r));
            toastTimers.current.set(r, setTimeout((): void => setToasts((list: PickupToast[]): PickupToast[] => list.filter((t: PickupToast): boolean => t.resource !== r)), TOAST_MS));
          }
        }
        setInventory(msg.inventory);
        setGear(msg.gear);
        setTree(msg.tree);
        setResearch(msg.research);
        return;
      }
      case 'reach':
        if (msg.item && !reach) {
          navigator.vibrate?.(10);
        }
        setReach(msg.item);
        return;
    }
  };

  const { send } = useSocket<ControllerMessage>({
    hello: () => ({ t: 'hello-controller', token: readStorage(TOKEN_STORAGE_KEY) ?? undefined }),
    onMessage: handleMessage,
  });

  const handleJoin = useCallback((name: string, color: string): void => {
    setJoining(true);
    setJoinError(null);
    send({ t: 'join', name, color });
  }, [send]);

  if (identity) {
    return (
      <>
        <PickupToasts toasts={toasts} />
        <ControllerPad
          player={identity.player}
          inventory={inventory}
          gear={gear}
          tree={tree}
          research={research}
          reach={reach}
          vitals={vitals}
          respawnAt={respawnAt}
          onInput={(x: number, y: number): void => send({ t: 'input', x, y })}
          onBlock={(down: boolean): void => send({ t: 'block', down })}
          onAction={(down: boolean): void => send({ t: 'action', down })}
          onAim={(x: number, y: number): void => send({ t: 'aim', x, y })}
          onDrop={(resource: Resource): void => send({ t: 'drop', resource })}
          onGrab={(): void => send({ t: 'grab' })}
          onEquip={(bag: number): void => send({ t: 'equip', bag })}
          onDrink={(bag: number): void => send({ t: 'drink', bag })}
          onUnequip={(slot: GearSlot): void => send({ t: 'unequip', slot })}
          onDropGear={(from: GearSlot | number): void => send({ t: 'drop-gear', from })}
          onMove={(from: GearSlot | number, to: GearSlot | number): void => send({ t: 'move-item', from, to })}
          onCraft={(recipe: RecipeId, count: number): void => send({ t: 'craft', recipe, count })}
          onUpgrade={(node: NodeId): void => send({ t: 'upgrade', node })}
          onPanic={(): void => send({ t: 'panic' })}
          onBuildSelect={(slot: number | null): void => send({ t: 'build-select', slot })}
          onBuildPlace={(): void => send({ t: 'build-place' })}
          buildError={buildError}
          onLeave={(): void => send({ t: 'leave' })} />
      </>
    );
  }

  return (
    <div className='min-h-full'>
      <PageLayout className='flex min-h-[100dvh] flex-col justify-center'>
        <div className='mx-auto w-full max-w-md'>
          {welcomed ? (
            <JoinForm
              error={joinError}
              joining={joining}
              onJoin={handleJoin} />
          ) : (
            <Card className='flex flex-col gap-md p-xl'>
              <Skeleton
                height={28}
                width='70%' />
              <Skeleton height={36} />
              <Skeleton height={36} />
              <Skeleton height={40} />
            </Card>
          )}
        </div>
      </PageLayout>
    </div>
  );
}

export default ControllerPage;
