'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { isPublicAddress, V4_BLOCKS, V6_BLOCKS } = require('../../lib/address-policy');

// First, middle and last address of every blocked range must be rejected.
const V4_RANGE_SAMPLES = {
  '0.0.0.0/8': ['0.0.0.0', '0.128.0.1', '0.255.255.255'],
  '10.0.0.0/8': ['10.0.0.0', '10.128.0.1', '10.255.255.255'],
  '100.64.0.0/10': ['100.64.0.0', '100.100.0.1', '100.127.255.255'],
  '127.0.0.0/8': ['127.0.0.0', '127.0.0.1', '127.255.255.255'],
  '169.254.0.0/16': ['169.254.0.0', '169.254.169.254', '169.254.255.255'],
  '172.16.0.0/12': ['172.16.0.0', '172.20.1.1', '172.31.255.255'],
  '192.0.0.0/24': ['192.0.0.0', '192.0.0.128', '192.0.0.255'],
  '192.0.2.0/24': ['192.0.2.0', '192.0.2.128', '192.0.2.255'],
  '192.168.0.0/16': ['192.168.0.0', '192.168.1.1', '192.168.255.255'],
  '198.18.0.0/15': ['198.18.0.0', '198.18.128.1', '198.19.255.255'],
  '198.51.100.0/24': ['198.51.100.0', '198.51.100.128', '198.51.100.255'],
  '203.0.113.0/24': ['203.0.113.0', '203.0.113.128', '203.0.113.255'],
  '224.0.0.0/4': ['224.0.0.0', '230.1.2.3', '239.255.255.255'],
  '240.0.0.0/4': ['240.0.0.0', '250.1.2.3', '255.255.255.255'],
};

test('every declared IPv4 block has a sample and rejects first, middle and last', () => {
  assert.equal(Object.keys(V4_RANGE_SAMPLES).length, V4_BLOCKS.length);
  for (const [addr, prefix] of V4_BLOCKS) {
    const key = `${addr}/${prefix}`;
    assert.ok(V4_RANGE_SAMPLES[key], `no sample for ${key}`);
    for (const ip of V4_RANGE_SAMPLES[key]) {
      assert.equal(isPublicAddress(ip), false, `${ip} in ${key} must be rejected`);
    }
  }
});

test('addresses just outside a block are public', () => {
  for (const ip of ['9.255.255.255', '11.0.0.0', '172.15.255.255', '172.32.0.0',
    '100.63.255.255', '100.128.0.0', '198.17.255.255', '198.20.0.0',
    '126.255.255.255', '128.0.0.1', '169.253.255.255', '169.255.0.0',
    '192.167.255.255', '192.169.0.0', '223.255.255.255']) {
    assert.equal(isPublicAddress(ip), true, `${ip} should be public`);
  }
});

test('ordinary public addresses are public', () => {
  for (const ip of ['8.8.8.8', '1.1.1.1', '93.184.216.34', '2606:4700:4700::1111', '2a00:1450:4001:80e::200e']) {
    assert.equal(isPublicAddress(ip), true, ip);
  }
});

const V6_RANGE_SAMPLES = {
  '::/128': ['::'],
  '::1/128': ['::1'],
  'fc00::/7': ['fc00::', 'fd00::1', 'fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'],
  'fe80::/10': ['fe80::', 'fe80::1', 'febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff'],
  'ff00::/8': ['ff00::', 'ff02::1', 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'],
  '2001:db8::/32': ['2001:db8::', '2001:db8::1', '2001:db8:ffff:ffff:ffff:ffff:ffff:ffff'],
};

test('every declared IPv6 block has a sample and is rejected', () => {
  assert.equal(Object.keys(V6_RANGE_SAMPLES).length, V6_BLOCKS.length);
  for (const [addr, prefix] of V6_BLOCKS) {
    const key = `${addr}/${prefix}`;
    assert.ok(V6_RANGE_SAMPLES[key], `no sample for ${key}`);
    for (const ip of V6_RANGE_SAMPLES[key]) {
      assert.equal(isPublicAddress(ip), false, `${ip} in ${key} must be rejected`);
    }
  }
});

test('IPv4-mapped IPv6 is judged as the IPv4 address it carries', () => {
  assert.equal(isPublicAddress('::ffff:127.0.0.1'), false);
  assert.equal(isPublicAddress('::ffff:169.254.169.254'), false);
  assert.equal(isPublicAddress('::ffff:10.0.0.1'), false);
  assert.equal(isPublicAddress('::ffff:7f00:1'), false);        // same address, hex form
  assert.equal(isPublicAddress('::ffff:a9fe:a9fe'), false);      // 169.254.169.254
  assert.equal(isPublicAddress('::ffff:8.8.8.8'), true);
  assert.equal(isPublicAddress('::ffff:808:808'), true);
});

test('NAT64 IPv6 is judged as the IPv4 address it carries', () => {
  assert.equal(isPublicAddress('64:ff9b::127.0.0.1'), false);
  assert.equal(isPublicAddress('64:ff9b::169.254.169.254'), false);
  assert.equal(isPublicAddress('64:ff9b::a9fe:a9fe'), false);
  assert.equal(isPublicAddress('64:ff9b::8.8.8.8'), true);
});

test('zone ids do not smuggle a link-local address through', () => {
  assert.equal(isPublicAddress('fe80::1%eth0'), false);
});

test('garbage is never public', () => {
  for (const value of ['', 'garbage', '999.1.1.1', '1.2.3', '127.0.0.1.1', 'http://8.8.8.8',
    '8.8.8.8:80', ' 8.8.8.8', '::ffff:999.1.1.1', 'localhost', null, undefined, 42, {}, []]) {
    assert.equal(isPublicAddress(value), false, String(value));
  }
});
