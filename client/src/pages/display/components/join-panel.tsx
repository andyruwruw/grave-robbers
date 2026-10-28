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
 * the TV page, but a TV opened at localhost needs the machine's LAN address
 * swapped in or phones can't reach it.
 */
function controllerUrl(lanAddress: string | null): string {
  const { protocol, hostname, port } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const host = isLocal && lanAddress ? lanAddress : hostname;
  return `${protocol}//${host}${port ? `:${port}` : ''}/`;
}

/**
 * Small QR code in the TV's corner for phones to join: white squares on a
 * soft dark glow rather than a white box, so it sits in the night scene
 * (phone cameras read light-on-dark codes). Hover brightens it and shows
 * the URL. It stays up during Incognito.
 *
 * @param {JoinPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function JoinPanel({ lanAddress }: JoinPanelProps): React.JSX.Element {
  const url = controllerUrl(lanAddress);
  return (
    <div
      className='absolute bottom-0 left-0 p-sm opacity-70 transition-opacity hover:opacity-100'
      style={{ background: 'radial-gradient(closest-side, rgb(0 0 0 / 0.9) 60%, rgb(0 0 0 / 0.55) 80%, transparent)' }}
      title={url}>
      <QRCodeSVG
        value={url}
        size={72}
        marginSize={3}
        fgColor='#ffffff'
        bgColor='transparent' />
    </div>
  );
}

export default JoinPanel;
