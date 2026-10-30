// Packages
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  ChevronDown,
  Search,
} from 'lucide-react';

// Local Imports
import PlaylistCover from './playlist-cover';

// Types
import type { SpotifyPlaylist } from '@halloween/shared/audio/spotify';

/**
 * Props for the PlaylistPicker component.
 */
interface PlaylistPickerProps {
  /**
   * The linked account's playlists.
   */
  playlists: SpotifyPlaylist[];

  /**
   * The chosen playlist's URI.
   */
  value: string | null;

  /**
   * Called with the picked playlist's URI.
   */
  onChange: (uri: string) => void;
}

/**
 * Picks one of the linked account's playlists: the chosen one with its
 * cover, opening a menu over the page (it doesn't push anything down) with
 * a search box and every playlist with its cover. Closes on a pick, a
 * click outside, Escape, or scrolling.
 *
 * @param {PlaylistPickerProps} props - Component props.
 * @returns {React.JSX.Element} The rendered picker.
 */
function PlaylistPicker({
  playlists,
  value,
  onChange,
}: PlaylistPickerProps): React.JSX.Element {
  const [open, setOpen] = useState<DOMRect | null>(null);
  const [query, setQuery] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const chosen = playlists.find((p: SpotifyPlaylist): boolean => p.uri === value) ?? null;
  const q = query.trim().toLowerCase();
  const shown = q ? playlists.filter((p: SpotifyPlaylist): boolean => p.name.toLowerCase().includes(q)) : playlists;

  useEffect(() => {
    if (!open) {
      return;
    }
    /**
     * Closes the menu.
     */
    const close = (): void => setOpen(null);
    /**
     * Closes the menu on a press outside it and its trigger.
     * @param e The pointer event.
     */
    const outside = (e: PointerEvent): void => {
      if (!menu.current?.contains(e.target as Node) && !trigger.current?.contains(e.target as Node)) {
        close();
      }
    };
    /**
     * Closes the menu on Escape.
     * @param e The key event.
     */
    const key = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        close();
      }
    };
    /**
     * Closes the menu when something outside it scrolls.
     * @param e The scroll event.
     */
    const scroll = (e: Event): void => {
      if (!menu.current?.contains(e.target as Node)) {
        close();
      }
    };
    window.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', key);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', key);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  if (playlists.length === 0) {
    return <span className='text-xs text-foreground-subtle'>No playlists on this account.</span>;
  }

  return (
    <>
      <button
        ref={trigger}
        type='button'
        aria-expanded={!!open}
        aria-haspopup='listbox'
        className='flex items-center gap-sm rounded-md border border-border bg-muted py-xsm pl-xsm pr-sm text-left'
        onClick={(): void => {
          setQuery('');
          setOpen(open ? null : trigger.current!.getBoundingClientRect());
        }}>
        <PlaylistCover
          image={chosen?.image ?? null}
          size={40} />
        <span className='min-w-0 flex-1 truncate text-sm text-foreground'>{chosen?.name ?? 'Pick a playlist'}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-foreground-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && createPortal(
        <div
          ref={menu}
          className='fixed z-50 flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
          style={{ left: open.left, top: open.bottom + 4, width: open.width, maxHeight: Math.max(160, window.innerHeight - open.bottom - 12) }}>
          <label className='flex items-center gap-xsm border-b border-border px-sm py-xsm text-foreground-muted'>
            <Search
              size={14}
              className='shrink-0' />
            <input
              autoFocus
              type='search'
              value={query}
              placeholder='Search playlists'
              aria-label='Search playlists'
              className='min-w-0 flex-1 bg-transparent py-xsm text-xs text-foreground outline-none placeholder:text-foreground-subtle'
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setQuery(e.target.value)} />
          </label>
          <ul
            role='listbox'
            aria-label='Spotify playlists'
            className='scrollbar-thin flex min-h-0 flex-col overflow-y-auto p-xsm'>
            {shown.length === 0 && <li className='px-xsm py-sm text-xs text-foreground-subtle'>No playlists match.</li>}
            {shown.map((p: SpotifyPlaylist) => (
              <li
                key={p.uri}
                role='option'
                aria-selected={p.uri === value}>
                <button
                  type='button'
                  className='flex w-full items-center gap-sm rounded-sm px-xsm py-xsm text-left hover:bg-muted'
                  onClick={(): void => {
                    onChange(p.uri);
                    setOpen(null);
                  }}>
                  <PlaylistCover
                    image={p.image}
                    size={32} />
                  <span className='min-w-0 flex-1 truncate text-xs text-foreground'>{p.name}</span>
                  {p.uri === value && (
                    <Check
                      size={14}
                      className='shrink-0 text-brand' />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )}
    </>
  );
}

export default PlaylistPicker;
