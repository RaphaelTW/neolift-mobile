import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const url = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const out = path.resolve('assets/data/exercises.full.json');
console.log('Baixando catálogo público do free-exercise-db...');
const response = await fetch(url);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
if (!Array.isArray(data) || data.length < 100) throw new Error('Catálogo inválido.');
await fs.writeFile(out, JSON.stringify(data));
console.log(`OK: ${data.length} exercícios salvos em ${out}`);
