// Packages
import React, { Component } from 'react';

// Local Imports
import { CRASH_RELOAD_MS } from '../../config/network';

/**
 * Props for CrashReload.
 */
interface CrashReloadProps {
  /**
   * The page it guards.
   */
  children: React.ReactNode;
}

/**
 * State for CrashReload.
 */
interface CrashReloadState {
  /**
   * Whether the page threw while rendering.
   */
  crashed: boolean;
}

/**
 * Wraps a whole page: if it throws while rendering (which would leave a
 * blank screen), it shows a short note and reloads the page after
 * CRASH_RELOAD_MS. Players rejoin on their own (their token is saved), so
 * a crash costs a few seconds instead of someone walking over to fix it.
 */
class CrashReload extends Component<CrashReloadProps, CrashReloadState> {
  /**
   * Nothing has gone wrong yet.
   */
  state: CrashReloadState = { crashed: false };

  /**
   * Notes that the page threw.
   * @returns The crashed state.
   */
  static getDerivedStateFromError(): CrashReloadState {
    return { crashed: true };
  }

  /**
   * Logs what broke and schedules the reload.
   * @param err What was thrown.
   */
  componentDidCatch(err: Error): void {
    console.error('[crash] the page broke; reloading', err);
    setTimeout((): void => window.location.reload(), CRASH_RELOAD_MS);
  }

  /**
   * The page, or the note while it reloads.
   * @returns The rendered page.
   */
  render(): React.ReactNode {
    if (this.state.crashed) {
      return (
        <div className='fixed inset-0 flex items-center justify-center bg-background'>
          <span className='font-medium text-sm text-foreground-muted'>Something broke. Reloading...</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default CrashReload;
