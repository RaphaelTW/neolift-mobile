import type { SQLiteDatabase } from 'expo-sqlite';
import type { Exercise } from '@/types';
import { countExercises, upsertExercises } from '@/db/repository';
import seed from '../../assets/data/exercises.seed.json';
import bundled from '../../assets/data/exercises.full.json';

export const CATALOG_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
export const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

export async function ensureCatalog(db: SQLiteDatabase) {
  const count = await countExercises(db);
  if (count === 0) {
    const local = (bundled as Exercise[]).length > 0 ? bundled as Exercise[] : seed as Exercise[];
    await upsertExercises(db, local);
  }
}

export async function syncCatalogFromGithub(db: SQLiteDatabase) {
  const response = await fetch(CATALOG_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Falha ao atualizar catálogo (${response.status})`);
  const data = await response.json() as Exercise[];
  if (!Array.isArray(data) || data.length < 100) throw new Error('Catálogo remoto inválido');
  await upsertExercises(db, data);
  return data.length;
}

export const exerciseImageUrl = (path?: string) => path ? `${IMAGE_BASE_URL}${path}` : null;
