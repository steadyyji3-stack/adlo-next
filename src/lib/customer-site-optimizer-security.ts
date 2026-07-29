import { BlockList, isIP } from 'node:net';

const MAX_URL_LENGTH = 2_048;

const blockedIpv4 = new BlockList();
[
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
  ['224.0.0.0', 4], ['240.0.0.0', 4],
].forEach(([network, prefix]) => blockedIpv4.addSubnet(network as string, prefix as number, 'ipv4'));

const blockedIpv6 = new BlockList();
[
  ['::', 128], ['::1', 128], ['::ffff:0:0', 96], ['64:ff9b::', 96],
  ['64:ff9b:1::', 48], ['100::', 64], ['2001::', 23], ['2001:db8::', 32],
  ['2002::', 16], ['3fff::', 20], ['5f00::', 16], ['fc00::', 7],
  ['fe80::', 10], ['fec0::', 10], ['ff00::', 8],
].forEach(([network, prefix]) => blockedIpv6.addSubnet(network as string, prefix as number, 'ipv6'));

export function normalizeSiteUrl(value: string) {
  if (value.length > MAX_URL_LENGTH) throw new Error('URL_TOO_LONG');

  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('UNSAFE_URL');
  }
  if (url.port) throw new Error('CUSTOM_PORT');
  url.hash = '';
  return url;
}

export function hostnameForLookup(hostname: string) {
  return hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
}

export function isPublicSiteIp(address: string) {
  const family = isIP(address);
  if (family === 4) return !blockedIpv4.check(address, 'ipv4');
  if (family === 6) return !blockedIpv6.check(address, 'ipv6');
  return false;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value, null, 2).replace(/[<>&\u2028\u2029]/g, (character) => {
    const codePoint = character.codePointAt(0);
    return codePoint === undefined ? '' : `\\u${codePoint.toString(16).padStart(4, '0')}`;
  });
}
