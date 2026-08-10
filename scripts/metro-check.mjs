import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const metroDirectory = path.dirname(require.resolve('metro/package.json'));
const imageSizePackagePath = require.resolve('image-size/package.json', {
  paths: [metroDirectory],
});
const imageSizeDirectory = path.dirname(imageSizePackagePath);
const imageSizePackage = require(imageSizePackagePath);

assert.equal(imageSizePackage.version, '2.0.3-neolift.1');
assert.equal(
  fs.lstatSync(imageSizeDirectory).isSymbolicLink(),
  false,
  'image-size must be installed as a real package, not a local directory symlink'
);

require(path.join(metroDirectory, 'src', 'Assets.js'));

console.log('Metro dependency checks passed.');
