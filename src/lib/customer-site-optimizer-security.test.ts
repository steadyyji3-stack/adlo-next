import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hostnameForLookup,
  isPublicSiteIp,
  normalizeSiteUrl,
  serializeJsonLd,
} from './customer-site-optimizer-security';

test('accepts ordinary public website URLs and removes fragments', () => {
  assert.equal(normalizeSiteUrl('https://example.com/menu#today').toString(), 'https://example.com/menu');
});

test('rejects credentials, non-http protocols, custom ports, and oversized URLs', () => {
  assert.throws(() => normalizeSiteUrl('https://user:secret@example.com'), /UNSAFE_URL/);
  assert.throws(() => normalizeSiteUrl('file:///etc/passwd'), /UNSAFE_URL/);
  assert.throws(() => normalizeSiteUrl('https://example.com:8443'), /CUSTOM_PORT/);
  assert.throws(() => normalizeSiteUrl(`https://example.com/${'a'.repeat(2_100)}`), /URL_TOO_LONG/);
});

test('normalizes bracketed IPv6 literals before DNS handling', () => {
  assert.equal(hostnameForLookup('[2001:4860:4860::8888]'), '2001:4860:4860::8888');
});

test('blocks local, private, mapped, documentation, and transition IP ranges', () => {
  for (const address of [
    '127.0.0.1', '10.0.0.1', '169.254.169.254', '192.168.1.1', '::1',
    'fc00::1', 'fe80::1', '::ffff:127.0.0.1', '64:ff9b::7f00:1', '2002:7f00:1::',
  ]) {
    assert.equal(isPublicSiteIp(address), false, address);
  }
});

test('allows representative public IPv4 and IPv6 addresses', () => {
  assert.equal(isPublicSiteIp('8.8.8.8'), true);
  assert.equal(isPublicSiteIp('2001:4860:4860::8888'), true);
});

test('escapes script boundaries in generated JSON-LD', () => {
  const serialized = serializeJsonLd({ name: '</script><script>alert(1)</script>&' });
  assert.equal(serialized.includes('</script>'), false);
  assert.match(serialized, /\\u003c\/script\\u003e/);
  assert.match(serialized, /\\u0026/);
});
