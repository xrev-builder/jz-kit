'use strict';

// Deny-by-default address policy (BUILD-SPEC section 7).
// isPublicAddress(ip) is the single source of truth for "may the browser reach this".
// Anything unparseable is NOT public.

const net = require('node:net');

const V4_BLOCKS = [
  ['0.0.0.0', 8],        // "this network"
  ['10.0.0.0', 8],       // RFC1918
  ['100.64.0.0', 10],    // CGNAT, also the Tailscale range
  ['127.0.0.0', 8],      // loopback
  ['169.254.0.0', 16],   // link-local AND cloud instance metadata
  ['172.16.0.0', 12],    // RFC1918, Docker networks live here
  ['192.0.0.0', 24],     // IETF protocol assignments
  ['192.0.2.0', 24],     // TEST-NET-1
  ['192.168.0.0', 16],   // RFC1918
  ['198.18.0.0', 15],    // benchmarking
  ['198.51.100.0', 24],  // TEST-NET-2
  ['203.0.113.0', 24],   // TEST-NET-3
  ['224.0.0.0', 4],      // multicast
  ['240.0.0.0', 4],      // reserved, includes 255.255.255.255
];

const V6_BLOCKS = [
  ['::', 128],           // unspecified
  ['::1', 128],          // loopback
  ['fc00::', 7],         // unique local
  ['fe80::', 10],        // link-local
  ['ff00::', 8],         // multicast
  ['2001:db8::', 32],    // documentation
];

const blocked = new net.BlockList();
for (const [addr, prefix] of V4_BLOCKS) blocked.addSubnet(addr, prefix, 'ipv4');
for (const [addr, prefix] of V6_BLOCKS) blocked.addSubnet(addr, prefix, 'ipv6');

// Expand any IPv6 text form into eight 16-bit groups. Returns null for anything invalid.
function parseV6(input) {
  let ip = String(input);
  const zone = ip.indexOf('%');
  if (zone !== -1) ip = ip.slice(0, zone);
  if (!net.isIPv6(ip)) return null;

  // Fold a trailing dotted-quad (::ffff:127.0.0.1) into two hex groups.
  const lastColon = ip.lastIndexOf(':');
  const tail = ip.slice(lastColon + 1);
  if (tail.includes('.')) {
    if (!net.isIPv4(tail)) return null;
    const o = tail.split('.').map(Number);
    ip = ip.slice(0, lastColon + 1) +
      (((o[0] << 8) | o[1]) >>> 0).toString(16) + ':' +
      (((o[2] << 8) | o[3]) >>> 0).toString(16);
  }

  const halves = ip.split('::');
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves.length === 2 ? (halves[1] ? halves[1].split(':') : []) : null;

  let groups;
  if (right === null) {
    if (left.length !== 8) return null;
    groups = left;
  } else {
    const fill = 8 - left.length - right.length;
    if (fill < 0) return null;
    groups = left.concat(new Array(fill).fill('0'), right);
  }

  const nums = [];
  for (const g of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
    nums.push(parseInt(g, 16));
  }
  return nums;
}

function groupsToV4(g) {
  return `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
}

// ::ffff:0:0/96 (IPv4-mapped) and 64:ff9b::/96 (NAT64) carry an IPv4 address in their last
// 32 bits. Judge the IPv4 address, not the wrapper, or the v4 blocks are trivially bypassed.
function unwrapEmbeddedV4(groups) {
  const zeroHead = groups[0] === 0 && groups[1] === 0 && groups[2] === 0 && groups[3] === 0;
  if (zeroHead && groups[4] === 0 && groups[5] === 0xffff) return groupsToV4(groups);
  if (groups[0] === 0x64 && groups[1] === 0xff9b &&
      groups[2] === 0 && groups[3] === 0 && groups[4] === 0 && groups[5] === 0) {
    return groupsToV4(groups);
  }
  return null;
}

function isPublicAddress(ip) {
  if (typeof ip !== 'string' || ip.length === 0) return false;
  const bare = ip.indexOf('%') === -1 ? ip : ip.slice(0, ip.indexOf('%'));

  if (net.isIPv4(bare)) return !blocked.check(bare, 'ipv4');

  if (net.isIPv6(bare)) {
    const groups = parseV6(bare);
    if (!groups) return false;
    const embedded = unwrapEmbeddedV4(groups);
    if (embedded !== null) return !blocked.check(embedded, 'ipv4');
    return !blocked.check(bare, 'ipv6');
  }

  return false;
}

module.exports = { isPublicAddress, V4_BLOCKS, V6_BLOCKS };
