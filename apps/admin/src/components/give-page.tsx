// Packages
import React, { useState } from 'react';
import { itemIconUrl } from '@halloween/renderer/icons/item-icons';
import TitledCard from '@halloween/controls/components/ui/titled-card';

// Local Imports
import { GIVE_AMOUNTS, GIVE_SECTIONS } from '../config/give';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { GiveItem, GiveSection } from '../types/give';

/**
 * Props for the GivePage component.
 */
interface GivePageProps {
  /**
   * Everyone in the game.
   */
  roster: PlayerState[];

  /**
   * The followed player's id (picked first), or null.
   */
  follow: string | null;

  /**
   * Sends a game command to the server.
   */
  send: (msg: ClientMessage) => void;
}

/**
 * A toggle button's classes: highlighted when picked.
 *
 * @param on Whether it's picked.
 * @returns The classes.
 */
function pickClass(on: boolean): string {
  return `rounded-md border text-xs text-foreground transition-colors ${on ? 'border-brand bg-brand-muted ring-1 ring-brand' : 'border-border bg-muted hover:bg-background'}`;
}

/**
 * The Give page: pick a player and an amount, then click anything (candy,
 * blood, a material, gear, or a buildable, each its own 3D model) to put
 * that many straight into their bag (`give`). Gear is capped at
 * GIVE_GEAR_MAX a click, and what doesn't fit drops at their feet.
 *
 * @param {GivePageProps} props - Component props.
 * @returns {React.JSX.Element} The rendered page.
 */
function GivePage({ roster, follow, send }: GivePageProps): React.JSX.Element {
  const [picked, setPicked] = useState<string | null>(follow);
  const [amount, setAmount] = useState(GIVE_AMOUNTS[1]);
  const player = roster.find((p: PlayerState): boolean => p.id === picked) ?? roster[0] ?? null;

  return (
    <div className='flex flex-col gap-lg'>
      <TitledCard title='Player'>
        {roster.length === 0
          ? <span className='text-xs text-foreground-muted'>No one has joined yet.</span>
          : (
            <div className='flex flex-wrap gap-xsm'>
              {roster.map((p: PlayerState) => (
                <button
                  key={p.id}
                  type='button'
                  aria-pressed={player?.id === p.id}
                  className={`flex items-center gap-xsm px-sm py-xsm ${pickClass(player?.id === p.id)}`}
                  onClick={(): void => setPicked(p.id)}>
                  <span
                    className='h-2.5 w-2.5 rounded-full'
                    style={{ background: p.color }} />
                  {p.name}
                </button>
              ))}
            </div>
          )}
      </TitledCard>
      <TitledCard
        title='Amount'
        bodyClassName='grid grid-cols-4 gap-xsm px-lg py-md'>
        {GIVE_AMOUNTS.map((n: number) => (
          <button
            key={n}
            type='button'
            aria-pressed={amount === n}
            className={`py-xsm font-medium ${pickClass(amount === n)}`}
            onClick={(): void => setAmount(n)}>
            {n}
          </button>
        ))}
      </TitledCard>
      {GIVE_SECTIONS.map(({ title, items }: GiveSection) => (
        <TitledCard
          key={title}
          title={title}
          bodyClassName='grid grid-cols-4 gap-xsm px-lg py-md'>
          {items.map(({ kind, label }: GiveItem) => (
            <button
              key={kind}
              type='button'
              title={player ? `Give ${player.name} ${amount} ${label}` : label}
              disabled={!player}
              className={`flex min-w-0 flex-col items-center gap-xsm py-sm disabled:opacity-50 ${pickClass(false)}`}
              onClick={(): void => {
                if (player) {
                  send({ t: 'give', player: player.id, item: kind, count: amount });
                }
              }}>
              <img
                src={itemIconUrl(kind)}
                alt=''
                width={32}
                height={32}
                className='h-8 w-8 [image-rendering:pixelated]' />
              <span className='w-full truncate px-xsm text-center'>{label}</span>
            </button>
          ))}
        </TitledCard>
      ))}
    </div>
  );
}

export default GivePage;
