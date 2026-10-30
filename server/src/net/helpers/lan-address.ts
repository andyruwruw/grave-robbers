// Packages
import { networkInterfaces } from 'node:os';

// Local Imports
import { PREFERRED_PREFIXES, VIRTUAL_ADAPTER } from '../config/lan';

/**
 * Best-guess LAN IPv4 address of this machine, so a TV opened on localhost
 * can still show a QR code phones can reach. Skips virtual adapters (WSL,
 * Docker, VPNs) and prefers the usual home router ranges.
 * @returns The address, or null if there is none.
 */
export function lanAddress(): string | null {
  const candidates = Object.entries(networkInterfaces())
    .filter(([name]) => !VIRTUAL_ADAPTER.test(name))
    .flatMap(([, ifaces]) => ifaces ?? [])
    .filter((iface) => iface.family === 'IPv4' && !iface.internal)
    .map((iface) => iface.address);
  for (const prefix of PREFERRED_PREFIXES) {
    const match = candidates.find((a: string) => a.startsWith(prefix));
    if (match) {
      return match;
    }
  }
  return candidates[0] ?? null;
}
