import fs from 'node:fs/promises';
const app = JSON.parse(await fs.readFile('app.json', 'utf8'));
const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
if (app.expo.version !== pkg.version) {
  console.error(`Versões diferentes: app.json=${app.expo.version} package.json=${pkg.version}`);
  process.exit(1);
}
console.log(`Versão consistente: v${pkg.version}`);
