import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const outputPath = 'MANIFEST-SHA256.txt';
const ignoredDirs = new Set(['.git', 'node_modules', '.expo']);

async function filesFromGit() {
  try {
    const { stdout } = await execFileAsync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 });
    return stdout.toString('utf8').split('\0').filter(Boolean);
  } catch {
    return null;
  }
}

async function walk(dir = '.') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === outputPath || ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.isFile()) out.push(full.replace(/^\.\//, ''));
  }
  return out;
}

const files = ((await filesFromGit()) ?? await walk())
  .filter(file => file !== outputPath)
  .sort((a, b) => a.localeCompare(b, 'en'));

const lines = [];
for (const file of files) {
  const contents = await readFile(file);
  const hash = createHash('sha256').update(contents).digest('hex');
  lines.push(`${hash}  ./${file.replaceAll('\\', '/')}`);
}

await writeFile(outputPath, `# NeoLift v${JSON.parse(await readFile('package.json', 'utf8')).version} — SHA-256 manifest\n${lines.join('\n')}\n`, 'utf8');
console.log(`Manifesto atualizado: ${files.length} arquivos.`);
