import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

const metroDirectory = path.dirname(require.resolve('metro/package.json'));
const imageSizeEntry = require.resolve('image-size', { paths: [metroDirectory] });
const imageSizePackage = require(
  require.resolve('image-size/package.json', { paths: [metroDirectory] })
);
const { imageSize } = require(imageSizeEntry);
const imageUtils = require(path.join(path.dirname(imageSizeEntry), 'types', 'utils.js'));

assert.equal(imageSizePackage.version, '2.0.3-neolift.0');

const malformedIcns = Uint8Array.from([
  0x69, 0x63, 0x6e, 0x73,
  0x00, 0x00, 0x00, 0x10,
  0x69, 0x73, 0x33, 0x32,
  0x00, 0x00, 0x00, 0x00,
]);

assert.throws(
  () => imageSize(malformedIcns),
  /Invalid ICNS entry length/,
  'Malformed ICNS entries must be rejected without looping'
);

const zeroLengthBox = Uint8Array.from([
  0x00, 0x00, 0x00, 0x00,
  0x6a, 0x78, 0x6c, 0x70,
]);

assert.equal(
  imageUtils.findBox(zeroLengthBox, 'jxlp', 0),
  undefined,
  'Zero-length JXL/HEIF boxes must be rejected without looping'
);

const xcodeDirectory = path.dirname(require.resolve('xcode/package.json'));
const uuid = require(require.resolve('uuid', { paths: [xcodeDirectory] }));
assert.match(uuid.v4(), /^[0-9a-f-]{36}$/i);

console.log('Security dependency checks passed.');
