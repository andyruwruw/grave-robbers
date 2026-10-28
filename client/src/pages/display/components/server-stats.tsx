// Packages
import React from 'react';
import { TICK_RATE } from '@halloween/shared/world';

// Local Imports
import Card from '../../../components/ui/primitives/card';

/**
 * Health numbers for the Overview tab, refreshed about once a second.
 */
export interface StatsSnapshot {
  tps: number;
  stepMs: number;

  /**
   * The hidden world level and each player's, by id.
   */
  worldLevel: number;
  levels: Record<string, number>;

  /**
   * The TV's frame rate, or null where there's no renderer (the admin
   * page).
   */
  fps: number | null;
  monsters: number;
  items: number;
  bloodMoon: boolean;
}

/**
 * Props for the ServerStats component.
 */
interface ServerStatsProps {
  stats: StatsSnapshot;
}

/**
 * Server tick rate and tick time, the TV's frame rate, and what's on the
 * map. The tick rate turns red when the server falls behind.
 *
 * @param {ServerStatsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered stats.
 */
function ServerStats({ stats }: ServerStatsProps): React.JSX.Element {
  const rows: { label: string; value: string; warn?: boolean }[] = [
    { label: 'Server ticks', value: `${stats.tps} / ${TICK_RATE}`, warn: stats.tps < TICK_RATE * 0.9 },
    { label: 'Tick time', value: `${stats.stepMs.toFixed(2)} ms`, warn: stats.stepMs > 1000 / TICK_RATE / 2 },
    ...(stats.fps === null ? [] : [{ label: 'TV frame rate', value: `${stats.fps} fps`, warn: stats.fps < 30 }]),
    { label: 'World level', value: stats.worldLevel.toFixed(1) },
    { label: 'Monsters', value: String(stats.monsters) },
    { label: 'Ground items', value: String(stats.items) },
    { label: 'Blood moon', value: stats.bloodMoon ? 'Rising' : 'No' },
  ];

  return (
    <Card className='flex flex-col'>
      <div className='border-b border-[var(--arw-glass-edge)] px-lg py-sm text-sm font-medium text-foreground'>Stats</div>
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
