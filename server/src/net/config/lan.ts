/**
 * Network adapter names that aren't the machine's real LAN (WSL, Docker,
 * VMs, VPNs, loopback).
 */
export const VIRTUAL_ADAPTER = /vethernet|wsl|docker|virtualbox|vmware|hyper-v|tailscale|zerotier|loopback/i;

/**
 * Address ranges home routers usually hand out, most likely first.
 */
export const PREFERRED_PREFIXES = ['192.168.', '10.', '172.'];
