// Packages
import React from 'react';
import { TICK_RATE } from '@halloween/shared/protocol/network';
import Card from '@halloween/ui/components/ui/primitives/card';

// Local Imports
import { PING_WARN_MS } from '../../config/stats';

// Types
import type { StatsSnapshot } from '../../types/stats';

/**
 * Props for the ServerStats component.
 */
interface ServerStatsProps {
  /**
   * The numbers to show.
   */
  stats: StatsSnapshot;
}

/**
 * Server tick rate and tick time, the TV's frame rate, this page's ping,
 * how much each screen is sent (before compression), and what's on the
 * map. The tick rate turns red when the server falls behind, and the ping
 * when it's over PING_WARN_MS.
 *
 * @param {ServerStatsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered stats.
 */
function ServerStats({ stats }: ServerStatsProps): React.JSX.Element {
  const rows: { label: string; value: string; warn?: boolean }[] = [
    { label: 'Server ticks', value: `${stats.tps} / ${TICK_RATE}`, warn: stats.tps < TICK_RATE * 0.9 },
    { label: 'Tick time', value: `${stats.stepMs.toFixed(2)} ms`, warn: stats.stepMs > 1000 / TICK_RATE / 2 },
    ...(stats.fps === null ? [] : [{ label: 'TV frame rate', value: `${stats.fps} fps`, warn: stats.fps < 30 }]),
    { label: 'Ping (this screen)', value: stats.ping === null ? '...' : `${stats.ping} ms`, warn: (stats.ping ?? 0) > PING_WARN_MS },
    { label: 'Sent to each screen', value: `${stats.displayKBps} KB/s` },
    { label: 'World level', value: stats.worldLevel.toFixed(1) },
    { label: 'Monsters', value: String(stats.monsters) },
    { label: 'Ground items', value: String(stats.items) },
    { label: 'Blood moon', value: stats.bloodMoon ? 'Rising' : 'No' },
  ];

  return (
    <Card className='flex flex-col'>
      <div className='border-b border-border px-lg py-sm text-sm font-medium text-foreground'>Stats</div>
      <dl className='flex flex-col py-xsm'>
        {rows.map(({ label, value, warn }) => (
          <div
            key={label}
            className='flex justify-between px-lg py-xsm text-xs'>
            <dt className='text-foreground-muted'>{label}</dt>
            <dd className={warn ? 'text-danger' : 'text-foreground'}>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default ServerStats;
