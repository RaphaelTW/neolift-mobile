import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const outputPath = 'MANIFEST-SHA256.txt';

const { stdout } = await execFileAsync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'buffer', maxBuffer: 10 * 1024 * 1024 }
);

const files = stdout
  .toString('utf8')
  .split('\0')
  .filter(Boolean)
  .filter((file) => file !== outputPath)
  .sort((left, right) => left.localeCompare(right, 'en'));

const lines = [];

for (const file of files) {
  const contents = await readFile(file);
  const hash = createHash('sha256').update(contents).digest('hex');
  lines.push(`${hash}  ./${file.replaceAll('\\', '/')}`);
}

await writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`Manifesto atualizado: ${files.length} arquivos.`);
