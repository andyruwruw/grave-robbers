// Packages
import React from 'react';
import PageLayout from '@halloween/ui/components/layout/page-layout';
import Card from '@halloween/ui/components/ui/primitives/card';
import { Skeleton } from '@halloween/ui/components/ui/feedback/skeleton';
import { TOKEN_STORAGE_KEY } from '@halloween/ui/config/storage-keys';
import { useWakeLock } from '@halloween/ui/hooks/use-wake-lock';
import JoinForm from '@halloween/game-ui/components/screens/join-form';
import NaughtyScreen from '@halloween/game-ui/components/screens/naughty-screen';
import StashPanel from '@halloween/game-ui/components/stash/stash-panel';
import PickupToasts from '@halloween/game-ui/components/hud/pickup-toasts';
import { useControllerSession } from '@halloween/game-ui/hooks/use-controller-session';
import { usePlayerCommands } from '@halloween/game-ui/hooks/use-player-commands';

// Local Imports
import ControllerPad from './components/pad/controller-pad';

/**
 * Phone page. Says hello with any saved token; the server either resumes
 * that player or asks the phone to join fresh. Keeps the screen on while
 * playing (`useWakeLock`). Everything the player does goes out through
 * `PlayerCommands`.
 *
 * @returns {React.JSX.Element} The rendered page.
 */
function ControllerPage(): React.JSX.Element {
  const {
    welcomed,
    identity,
    joinError,
    joining,
    inventory,
    gear,
    tree,
    research,
    anvil,
    toasts,
    buildError,
    vitals,
    respawnAt,
    naughty,
    endNaughty,
    stash,
    pads,
    padMenu,
    send,
    join,
  } = useControllerSession(TOKEN_STORAGE_KEY);
  useWakeLock(identity !== null);
  const commands = usePlayerCommands(send);

  if (identity) {
    return (
      <>
        <PickupToasts toasts={toasts} />
        {stash && (
          <StashPanel
            bag={gear.bag}
            stash={stash}
            onMove={commands.stashMove}
            onClose={commands.stashClose}
            onTakeDown={commands.stashTakeDown}
            onPanic={commands.stashPanic} />
        )}
        {naughty && (
          <NaughtyScreen
            key={naughty.id}
            candy={naughty.candy}
            onDone={endNaughty} />
        )}
        <ControllerPad
          player={identity.player}
          inventory={inventory}
          gear={gear}
          tree={tree}
          research={research}
          anvil={anvil}
          vitals={vitals}
          respawnAt={respawnAt}
          buildError={buildError}
          pads={pads}
          padMenu={padMenu}
          commands={commands} />
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
              onJoin={join} />
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
