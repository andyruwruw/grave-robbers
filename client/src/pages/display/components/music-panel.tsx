// Packages
import React, {
  useEffect,
  useState,
} from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Disc3,
  EyeOff,
  ListMusic,
  Music,
  Pause,
  Play,
  SkipForward,
  SlidersHorizontal,
  X,
} from 'lucide-react';

// Local Imports
import Button from '../../../components/ui/controls/button';
import Card from '../../../components/ui/primitives/card';
import { Caption } from '../../../components/typography/typography';
import {
  spotifyLogout,
  spotifyPlaylists,
  spotifyStatus,
} from '../../../audio/spotify';
import PlaylistPicker from './playlist-picker';

// Types
import type {
  AudioSettings,
  MusicStatus,
  QueueEntry,
  QueueSource,
  SpotifyPlaylist,
  SpotifyStatus,
} from '@halloween/shared/audio';
import type { LucideIcon } from 'lucide-react';

/**
 * Props for the MusicPanel component.
 */
interface MusicPanelProps {
  /**
   * Saved music choices, playlist, and volumes.
   */
  settings: AudioSettings;

  /**
   * What's playing and what's next.
   */
  status: MusicStatus;

  /**
   * Called with the full updated settings.
   */
  onChange: (settings: AudioSettings) => void;
  onToggle: () => void;
  onNext: () => void;

  /**
   * Takes a song out of, or moves it in, what's up next.
   */
  onRemove: (index: number, id: string) => void;
  onMove: (index: number, id: string, delta: -1 | 1) => void;

  /**
   * Set while another TV page plays the music: takes it back.
   */
  onClaimMusic?: () => void;

  /**
   * Whether the TV is showing just the now-playing screen.
   */
  incognito: boolean;
  onIncognito: (on: boolean) => void;
}

/**
 * The checkboxes for what to play, and the weight each shuffled source
 * gets against the other.
 */
const SOURCES: { key: 'live' | 'spotify' | 'custom'; label: string; hint: string; weight?: 'spotifyWeight' | 'customWeight' }[] = [
  { key: 'live', label: 'Spotify playback', hint: 'Songs queued on your Spotify (your phone or a Jam) play first, in Spotify’s order' },
  { key: 'spotify', label: 'Spotify playlist', hint: 'Shuffles the playlist picked below', weight: 'spotifyWeight' },
  { key: 'custom', label: 'Custom songs', hint: 'From server/media/music, shuffled in; their parts follow the game', weight: 'customWeight' },
];

const SOURCE_LABELS: Record<QueueSource, string> = { queue: 'Queued', playlist: 'Playlist', custom: 'Custom' };

/**
 * A card with a small icon header.
 */
function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <Card className='flex flex-col'>
      <div className='flex items-center gap-sm border-b border-[var(--arw-glass-edge)] px-lg py-sm text-sm font-medium text-foreground'>
        <Icon
          size={14}
          className='text-foreground-muted' />
        {title}
      </div>
      <div className='flex flex-col gap-md px-lg py-md'>{children}</div>
    </Card>
  );
}

/**
 * One labeled 0..100% slider.
 */
function VolumeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}): React.JSX.Element {
  return (
    <label className='flex flex-col gap-xsm'>
      <span className='flex justify-between text-xs text-foreground'>
        {label}
        <span className='text-foreground-subtle'>{Math.round(value * 100)}%</span>
      </span>
      <input
        type='range'
        min={0}
        max={100}
        value={Math.round(value * 100)}
        className='w-full accent-brand'
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange(Number(e.target.value) / 100)} />
    </label>
  );
}

/**
 * A small square icon button for the up-next rows.
 */
function RowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type='button'
      aria-label={label}
      disabled={disabled}
      className='flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-foreground-muted transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
      onClick={onClick}>
      {children}
    </button>
  );
}

/**
 * A song's cover, or a note placeholder.
 */
function Art({ src, size }: { src: string | null; size: number }): React.JSX.Element {
  return src ? (
    <img
      src={src}
      alt=''
      className='shrink-0 rounded-sm object-cover'
      style={{ width: size, height: size }} />
  ) : (
    <span
      className='flex shrink-0 items-center justify-center rounded-sm bg-muted text-foreground-subtle'
      style={{ width: size, height: size }}>
      <Music size={size / 2} />
    </span>
  );
}

/**
 * Music controls for the TV, as cards: the music, ambience, and sound
 * effect volumes; what's playing (play/pause and skip, Incognito, which
 * hides the game's chrome behind a plain now-playing screen until someone
 * joins); what's up next (each of the player's own songs can move up or
 * down or come out); what to play (the Spotify account's queue first, a
 * Spotify playlist, the custom songs, in any mix, with a slider under each
 * shuffled source for how often it's picked against the other); and the
 * Spotify account and playlist (picked from a searchable menu with
 * covers).
 *
 * @param {MusicPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function MusicPanel({
  settings,
  status,
  onChange,
  onToggle,
  onNext,
  onRemove,
  onMove,
  onClaimMusic,
  incognito,
  onIncognito,
}: MusicPanelProps): React.JSX.Element {
  const [spotify, setSpotify] = useState<SpotifyStatus | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);

  useEffect(() => {
    let live = true;
    void spotifyStatus().then(async (next: SpotifyStatus): Promise<void> => {
      if (!live) {
        return;
      }
      setSpotify(next);
      if (next.linked) {
        const lists = await spotifyPlaylists();
        if (live) {
          setPlaylists(lists);
        }
      }
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (settings.spotify && !settings.playlist && playlists.length > 0) {
      onChange({ ...settings, playlist: playlists[0].uri });
    }
  }, [settings, playlists, onChange]);

  const login = (): void => {
    const back = `${window.location.origin}${window.location.pathname}`;
    window.location.href = `/auth/spotify/login?return=${encodeURIComponent(back)}`;
  };

  const logout = (): void => {
    void spotifyLogout().then((): void => {
      setSpotify((s: SpotifyStatus | null): SpotifyStatus | null => (s ? { ...s, linked: false } : s));
      setPlaylists([]);
      onChange({ ...settings, live: false, spotify: false, playlist: null });
    });
  };

  const current = status.current;
  const queued = status.upNext.filter((e: QueueEntry): boolean => e.source === 'queue').length;
  const weights = settings.spotify && settings.custom ? settings.spotifyWeight + settings.customWeight : null;

  return (
    <div className='flex flex-col gap-lg'>
      <Section
        icon={SlidersHorizontal}
        title='Volume'>
        <VolumeSlider
          label='Music'
          value={settings.musicVolume}
          onChange={(musicVolume: number): void => onChange({ ...settings, musicVolume })} />
        <VolumeSlider
          label='Ambience'
          value={settings.ambienceVolume}
          onChange={(ambienceVolume: number): void => onChange({ ...settings, ambienceVolume })} />
        <VolumeSlider
          label='Sound effects'
          value={settings.sfxVolume}
          onChange={(sfxVolume: number): void => onChange({ ...settings, sfxVolume })} />
      </Section>

      <Section
        icon={Play}
        title='Now playing'>
        <div className='flex items-center gap-sm'>
          <Art
            src={current?.art ?? null}
            size={48} />
          <div className='flex min-w-0 flex-1 flex-col'>
            <span className='truncate text-sm text-foreground'>{current?.title ?? 'Nothing playing'}</span>
            {current?.artist && <span className='truncate text-xs text-foreground-subtle'>{current.artist}</span>}
            {current && <span className='text-[10px] uppercase tracking-wide text-foreground-subtle'>{SOURCE_LABELS[current.source]}</span>}
          </div>
          <Button
            variant='ghost'
            size='icon'
            aria-label={status.playing ? 'Pause' : 'Play'}
            onClick={onToggle}>
            {status.playing ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Next song'
            onClick={onNext}>
            <SkipForward size={16} />
          </Button>
        </div>
        {status.error && <span className='text-xs text-danger'>{status.error}</span>}
        {onClaimMusic && (
          <Button
            variant='outline'
            size='sm'
            onClick={onClaimMusic}>
            <Music size={14} />
            Play music here
          </Button>
        )}
        <Button
          variant={incognito ? 'secondary' : 'outline'}
          size='sm'
          aria-pressed={incognito}
          onClick={(): void => onIncognito(!incognito)}>
          <EyeOff size={14} />
          Incognito
        </Button>
      </Section>

      {status.upNext.length > 0 && (
        <Section
          icon={ListMusic}
          title='Up next'>
          <div className='flex flex-col gap-xsm'>
            {status.upNext.map((entry: QueueEntry, i: number) => (
              <div
                key={`${entry.id}-${i}`}
                className='flex items-center gap-sm'>
                <Art
                  src={entry.art}
                  size={28} />
                <div className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-xs text-foreground'>{entry.title}</span>
                  <span className='truncate text-[11px] text-foreground-subtle'>
                    {entry.artist ? `${entry.artist} · ` : ''}
                    <span className={entry.source === 'queue' ? 'text-brand' : ''}>{SOURCE_LABELS[entry.source]}</span>
                  </span>
                </div>
                {entry.source !== 'queue' && (
                  <div className='flex shrink-0 items-center'>
                    <RowButton
                      label='Move up'
                      disabled={i <= queued}
                      onClick={(): void => onMove(i, entry.id, -1)}>
                      <ArrowUp size={13} />
                    </RowButton>
                    <RowButton
                      label='Move down'
                      disabled={i === status.upNext.length - 1}
                      onClick={(): void => onMove(i, entry.id, 1)}>
                      <ArrowDown size={13} />
                    </RowButton>
                    <RowButton
                      label='Remove'
                      onClick={(): void => onRemove(i, entry.id)}>
                      <X size={13} />
                    </RowButton>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section
        icon={Music}
        title='Music'>
        {SOURCES.map(({ key, label, hint, weight }) => (
          <div
            key={key}
            className='flex flex-col gap-xsm'>
            <label className='flex cursor-pointer items-start gap-sm'>
              <input
                type='checkbox'
                className='peer sr-only'
                checked={settings[key]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...settings, [key]: e.target.checked })} />
              <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border peer-focus-visible:ring-1 peer-focus-visible:ring-brand ${settings[key] ? 'border-brand bg-brand text-background' : 'border-border bg-muted'}`}>
                {settings[key] && <Check size={12} />}
              </span>
              <span className='flex flex-col'>
                <span className='text-xs text-foreground'>{label}</span>
                <span className='text-[11px] leading-snug text-foreground-subtle'>{hint}</span>
              </span>
            </label>
            {weight && weights !== null && (
              <label className='ml-6 flex items-center gap-sm'>
                <input
                  type='range'
                  min={0}
                  max={100}
                  aria-label={`How often: ${label}`}
                  value={Math.round(settings[weight] * 100)}
                  className='min-w-0 flex-1 accent-brand'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...settings, [weight]: Number(e.target.value) / 100 })} />
                <span className='w-20 shrink-0 text-right text-[11px] text-foreground-subtle'>
                  {weights > 0 ? Math.round((settings[weight] / weights) * 100) : 50}% of songs
                </span>
              </label>
            )}
          </div>
        ))}
      </Section>

      <Section
        icon={Disc3}
        title='Spotify'>
        {!spotify && <Caption>Checking Spotify...</Caption>}
        {spotify && !spotify.configured && <Caption>Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET for the server to use Spotify (see the README).</Caption>}
        {spotify?.configured && !spotify.linked && (
          <Button
            variant='outline'
            size='sm'
            onClick={login}>
            Connect Spotify
          </Button>
        )}
        {spotify?.linked && (
          <>
            <PlaylistPicker
              playlists={playlists}
              value={settings.playlist}
              onChange={(playlist: string): void => onChange({ ...settings, playlist })} />
            <Button
              variant='ghost'
              size='sm'
              onClick={logout}>
              Disconnect Spotify
            </Button>
          </>
        )}
      </Section>
    </div>
  );
}

export default MusicPanel;
