// Packages
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Props for the JoinPanel component.
 */
interface JoinPanelProps {
  /**
   * The server's LAN address, used when the TV itself is on localhost.
   */
  lanAddress: string | null;
}

/**
 * URL phones should open. The controller is served from the same origin as
 * the TV page in production; in dev it's the phone app's own server
 * (`__PHONE_PORT__`), whichever port the TV was opened on. A TV opened at
 * localhost needs the machine's LAN address swapped in or phones can't
 * reach it.
 *
 * @param lanAddress - The machine's LAN address, if the server knows it.
 * @returns The controller's URL.
 */
function controllerUrl(lanAddress: string | null): string {
  const { protocol, hostname } = window.location;
  const port = __PHONE_PORT__ !== null ? String(__PHONE_PORT__) : window.location.port;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const host = isLocal && lanAddress ? lanAddress : hostname;
  return `${protocol}//${host}${port ? `:${port}` : ''}/`;
}

/**
 * A faint QR code tucked in the TV's corner for phones to join: dim white
 * squares on a soft dark glow, no box or label, so it barely shows in the
 * night scene but still scans up close (phone cameras read light-on-dark
 * codes). Hover brightens it and shows the URL. It stays up during
 * Incognito.
 *
 * @param {JoinPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function JoinPanel({ lanAddress }: JoinPanelProps): React.JSX.Element {
  const url = controllerUrl(lanAddress);
  return (
    <div
      className='absolute bottom-0 left-0 p-sm opacity-35 transition-opacity hover:opacity-100'
      style={{ background: 'radial-gradient(closest-side, rgb(0 0 0 / 0.8) 60%, rgb(0 0 0 / 0.4) 80%, transparent)' }}
      title={url}>
      <QRCodeSVG
        value={url}
        size={60}
        marginSize={3}
        fgColor='#ffffff'
        bgColor='transparent' />
    </div>
  );
}

export default JoinPanel;
