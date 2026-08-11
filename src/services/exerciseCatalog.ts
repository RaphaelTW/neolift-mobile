import type { SQLiteDatabase } from 'expo-sqlite';
import type { Exercise } from '@/types';
import { allExercises, countExercises, upsertExercises } from '@/db/repository';
import seed from '../../assets/data/exercises.seed.json';
import bundled from '../../assets/data/exercises.full.json';

export const CATALOG_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
export const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const asFreeExercise = (exercise: Exercise): Exercise => ({
  ...exercise,
  videos: exercise.videos ?? [],
  source: exercise.source ?? 'free-exercise-db',
  sourceUrl: exercise.sourceUrl ?? 'https://github.com/yuhonas/free-exercise-db',
  license: exercise.license ?? 'Unlicense',
  licenseUrl: exercise.licenseUrl ?? 'https://unlicense.org/',
  media: exercise.media ?? (exercise.images ?? []).map(path => ({ type: 'image' as const, url: path, source: 'free-exercise-db' as const, license: 'Unlicense', licenseUrl: 'https://unlicense.org/' }))
});

export async function ensureCatalog(db: SQLiteDatabase) {
  const count = await countExercises(db);
  if (count === 0) {
    const local = (bundled as Exercise[]).length > 0 ? bundled as Exercise[] : seed as Exercise[];
    await upsertExercises(db, local.map(asFreeExercise));
  }
}

export async function syncCatalogFromGithub(db: SQLiteDatabase) {
  const response = await fetch(CATALOG_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Falha ao atualizar catálogo (${response.status})`);
  const data = await response.json() as Exercise[];
  if (!Array.isArray(data) || data.length < 100) throw new Error('Catálogo remoto inválido');
  const existing = new Map((await allExercises(db)).map(item => [item.id, item]));
  const merged = data.map(raw => {
    const free = asFreeExercise(raw);
    const current = existing.get(free.id);
    if (!current || current.source !== 'hybrid') return free;
    const wgerMedia = (current.media ?? []).filter(item => item.source === 'wger');
    const wgerImages = wgerMedia.filter(item => item.type === 'image').map(item => item.url);
    const wgerVideos = wgerMedia.filter(item => item.type === 'video').map(item => item.url);
    return {
      ...free,
      source: 'hybrid' as const,
      sourceId: current.sourceId,
      sourceUrl: current.sourceUrl,
      license: current.license,
      licenseUrl: current.licenseUrl,
      licenseAuthor: current.licenseAuthor,
      images: [...free.images, ...wgerImages].filter((v, i, arr) => arr.indexOf(v) === i),
      videos: [...(current.videos ?? []), ...wgerVideos].filter((v, i, arr) => arr.indexOf(v) === i),
      media: [...(free.media ?? []), ...wgerMedia].filter((m, i, arr) => arr.findIndex(x => x.type === m.type && x.url === m.url) === i)
    };
  });
  await upsertExercises(db, merged);
  return data.length;
}

export const exerciseImageUrl = (path?: string) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith('file:')) return path;
  return `${IMAGE_BASE_URL}${path}`;
};
