import fs from 'node:fs/promises';

const app = JSON.parse(await fs.readFile('app.json', 'utf8'));
const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
const eas = JSON.parse(await fs.readFile('eas.json', 'utf8'));

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (app.expo.version !== pkg.version) {
  fail(`Versões diferentes: app.json=${app.expo.version} package.json=${pkg.version}`);
}
if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) fail(`Versão inválida: ${pkg.version}`);

const versionCode = app.expo.android?.versionCode;
const buildNumber = Number(app.expo.ios?.buildNumber);
if (!Number.isInteger(versionCode) || versionCode < 1) fail('android.versionCode deve ser um inteiro positivo.');
if (!Number.isInteger(buildNumber) || buildNumber < 1) fail('ios.buildNumber deve ser um inteiro positivo.');
if (versionCode !== buildNumber) fail(`Builds diferentes: Android=${versionCode} iOS=${buildNumber}`);
if (eas.cli?.appVersionSource !== 'local') fail('EAS deve usar as versões locais definidas no app.json.');
if (eas.build?.preview?.android?.buildType !== 'apk') fail('O perfil EAS preview deve gerar APK.');

const imageSizePackage = 'file:vendor/image-size-2.0.3-neolift.1.tgz';
if (pkg.dependencies?.['image-size'] !== imageSizePackage || pkg.overrides?.['image-size'] !== imageSizePackage) {
  fail('image-size deve usar o tarball seguro e imutável do projeto.');
}
if (pkg.overrides?.uuid !== '11.1.1') fail('uuid deve permanecer fixado em 11.1.1.');

await fs.access(`RELEASE-v${pkg.version}.md`).catch(() => fail(`RELEASE-v${pkg.version}.md não encontrado.`));

console.log(`Versão consistente: v${pkg.version} (build ${versionCode})`);
