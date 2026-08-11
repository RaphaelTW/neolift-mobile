import type { SQLiteDatabase } from 'expo-sqlite';
import type { Exercise, ExerciseMedia } from '@/types';
import { allExercises, countExercisesBySource, upsertExercises } from '@/db/repository';

const WGER_API = 'https://wger.de/api/v2';
const PAGE_SIZE = 100;
const MAX_PAGES = 40;

export const WGER_SYNC_SETTING = 'wgerLastSyncAt';
export const WGER_SYNC_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export function shouldRefreshWger(lastSyncAt?: string | null) {
  if (!lastSyncAt) return true;
  const time = Date.parse(lastSyncAt);
  return !Number.isFinite(time) || Date.now() - time >= WGER_SYNC_INTERVAL_MS;
}

const asText = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const stripHtml = (html: string) => html
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<\/p>/gi, '\n')
  .replace(/<li[^>]*>/gi, '• ')
  .replace(/<\/li>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+\n/g, '\n')
  .replace(/\n\s+/g, '\n')
  .replace(/[ \t]+/g, ' ')
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .trim();

const normalizeName = (value: string) => value
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function muscleSlug(raw: unknown): string {
  const text = typeof raw === 'string'
    ? raw
    : asText((raw as any)?.name_en) || asText((raw as any)?.name) || asText((raw as any)?.common_name);
  const m = text.toLowerCase();
  if (/pector|chest/.test(m)) return 'chest';
  if (/latiss|\blat\b/.test(m)) return 'lats';
  if (/trapez|trap/.test(m)) return 'traps';
  if (/deltoid|shoulder/.test(m)) return 'shoulders';
  if (/biceps/.test(m)) return 'biceps';
  if (/triceps/.test(m)) return 'triceps';
  if (/brachiorad|forearm|wrist/.test(m)) return 'forearms';
  if (/rectus abdom|oblique|abdominal|core/.test(m)) return 'abdominals';
  if (/erector|lower back|lumbar/.test(m)) return 'lower back';
  if (/glute/.test(m)) return 'glutes';
  if (/quadriceps|vastus|rectus femoris/.test(m)) return 'quadriceps';
  if (/hamstring|biceps femoris|semitend|semimembr/.test(m)) return 'hamstrings';
  if (/gastrocn|soleus|calf/.test(m)) return 'calves';
  if (/adductor/.test(m)) return 'adductors';
  if (/abductor|tensor fascia/.test(m)) return 'abductors';
  if (/neck|sternocleid/.test(m)) return 'neck';
  if (/rhomboid|back/.test(m)) return 'middle back';
  return text || 'other';
}

function preferredTranslation(item: any) {
  const translations = Array.isArray(item?.translations) ? item.translations : [];
  return translations.find((translation: any) => Number(translation?.language) === 2 && asText(translation?.name))
    ?? translations.find((translation: any) => asText(translation?.name))
    ?? item?.translation
    ?? null;
}

const itemName = (item: any) => asText(item?.name) || asText(preferredTranslation(item)?.name);
const itemDescription = (item: any) => asText(item?.description) || asText(preferredTranslation(item)?.description);

function pickLicense(...items: any[]) {
  let name: string | null = null;
  let url: string | null = null;
  let author: string | null = null;
  for (const item of items) {
    if (!item) continue;
    const licenseObj = item.license;
    name ||= asText(licenseObj?.full_name) || asText(licenseObj?.short_name) || asText(licenseObj?.name) || (typeof licenseObj === 'string' ? licenseObj : '') || null;
    url ||= asText(licenseObj?.url) || asText(item.license_url) || asText(item.license_object_url) || null;
    author ||= asText(item.license_author) || asText(item.author) || null;
  }
  return { name, url, author };
}

function absoluteMediaUrl(value: unknown) {
  const url = asText(value);
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `https://wger.de${url}`;
  return `https://wger.de/${url.replace(/^\/+/, '')}`;
}

function imageUrl(img: any) {
  return absoluteMediaUrl(img?.image) || absoluteMediaUrl(img?.url) || absoluteMediaUrl(img?.thumbnails?.medium) || absoluteMediaUrl(img?.thumbnails?.small);
}
function videoUrl(video: any) { return absoluteMediaUrl(video?.video) || absoluteMediaUrl(video?.url); }

const mainMediaFirst = (a: any, b: any) => Number(Boolean(b?.is_main)) - Number(Boolean(a?.is_main));
const finiteNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const isAnimatedImage = (url: string) => /\.(gif|apng)(?:$|[?#])/i.test(url);

export function mapWgerExercise(item: any): Exercise | null {
  const name = itemName(item);
  const rawId = item?.id ?? item?.exercise_base ?? item?.uuid;
  if (!name || rawId == null) return null;

  const imagesRaw = Array.isArray(item?.images) ? [...item.images].sort(mainMediaFirst) : [];
  const videosRaw = Array.isArray(item?.videos) ? [...item.videos].sort(mainMediaFirst) : [];
  const images = imagesRaw.map(imageUrl).filter(Boolean);
  const videos = videosRaw.map(videoUrl).filter(Boolean);
  const primaryRaw: unknown[] = Array.isArray(item?.muscles) ? item.muscles : Array.isArray(item?.primary_muscles) ? item.primary_muscles : [];
  const secondaryRaw: unknown[] = Array.isArray(item?.muscles_secondary) ? item.muscles_secondary : Array.isArray(item?.secondary_muscles) ? item.secondary_muscles : [];
  const equipmentRaw = Array.isArray(item?.equipment) ? item.equipment : item?.equipment ? [item.equipment] : [];
  const equipment = equipmentRaw.map((e: any) => asText(e?.name) || asText(e)).filter(Boolean).join(' · ') || null;
  const category = asText(item?.category?.name) || asText(item?.category) || 'strength';
  const description = stripHtml(itemDescription(item));
  const instructions = description ? description.split(/\n+/).map(s => s.replace(/^•\s*/, '').trim()).filter(Boolean) : [];

  const translation = preferredTranslation(item);
  const exerciseLicense = pickLicense(translation, item);
  const media: ExerciseMedia[] = [
    ...imagesRaw.map((img: any) => {
      const url = imageUrl(img); if (!url) return null;
      const lic = pickLicense(img, item);
      return { type: 'image' as const, url, source: 'wger' as const, isMain: Boolean(img?.is_main), animated: isAnimatedImage(url), style: asText(img?.style) || null, width: finiteNumber(img?.width), height: finiteNumber(img?.height), license: lic.name, licenseUrl: lic.url, author: lic.author };
    }),
    ...videosRaw.map((video: any) => {
      const url = videoUrl(video); if (!url) return null;
      const lic = pickLicense(video, item);
      return { type: 'video' as const, url, source: 'wger' as const, isMain: Boolean(video?.is_main), width: finiteNumber(video?.width), height: finiteNumber(video?.height), durationSeconds: finiteNumber(video?.duration), codec: asText(video?.codec) || null, license: lic.name, licenseUrl: lic.url, author: lic.author };
    })
  ].filter(Boolean) as ExerciseMedia[];

  return {
    id: `wger:${rawId}`,
    name,
    force: null,
    level: null,
    mechanic: null,
    equipment,
    primaryMuscles: [...new Set(primaryRaw.map(muscleSlug).filter(Boolean))],
    secondaryMuscles: [...new Set(secondaryRaw.map(muscleSlug).filter(Boolean))],
    instructions: instructions.length ? instructions : ['Consulte a demonstração 3D ou o vídeo disponível antes de executar o movimento.'],
    category,
    images,
    videos,
    source: 'wger',
    sourceId: String(rawId),
    sourceUrl: `${WGER_API}/exerciseinfo/${rawId}/`,
    license: exerciseLicense.name,
    licenseUrl: exerciseLicense.url,
    licenseAuthor: exerciseLicense.author,
    media
  };
}

async function fetchPage(url: string) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Wger respondeu ${response.status}`);
  return response.json() as Promise<{ next?: string | null; results?: any[] }>;
}

export async function fetchWgerExercises(onProgress?: (loaded: number) => void) {
  let url: string | null = `${WGER_API}/exerciseinfo/?limit=${PAGE_SIZE}&language=2&format=json`;
  const mapped: Exercise[] = [];
  const seen = new Set<string>();
  let page = 0;

  while (url && page < MAX_PAGES) {
    const payload = await fetchPage(url);
    const results = Array.isArray(payload?.results) ? payload.results : [];
    for (const item of results) {
      const exercise = mapWgerExercise(item);
      if (!exercise) continue;
      const key = normalizeName(exercise.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      mapped.push(exercise);
    }
    onProgress?.(mapped.length);
    url = payload?.next || null;
    page += 1;
  }

  if (!mapped.length) throw new Error('O Wger não retornou exercícios públicos agora.');
  return mapped;
}

export async function syncWgerCatalog(db: SQLiteDatabase, onProgress?: (loaded: number) => void) {
  const [incoming, existing] = await Promise.all([fetchWgerExercises(onProgress), allExercises(db)]);
  const byName = new Map(existing.map(e => [normalizeName(e.name), e]));
  const byWgerId = new Map(existing.filter(e => e.sourceId).map(e => [String(e.sourceId), e]));
  const updates: Exercise[] = [];
  let enriched = 0;
  let added = 0;

  for (const wger of incoming) {
    const key = normalizeName(wger.name);
    const currentById = wger.sourceId ? byWgerId.get(String(wger.sourceId)) : undefined;
    const current = currentById ?? byName.get(key);
    if (current && current.source !== 'wger') {
      const media = [...(current.media ?? []), ...(wger.media ?? [])].filter((m, i, arr) => arr.findIndex(x => x.type === m.type && x.url === m.url) === i);
      const images = [...current.images, ...wger.images].filter((v, i, arr) => arr.indexOf(v) === i);
      const videos = [...(current.videos ?? []), ...(wger.videos ?? [])].filter((v, i, arr) => arr.indexOf(v) === i);
      updates.push({
        ...current,
        images,
        videos,
        media,
        source: 'hybrid',
        sourceId: wger.sourceId,
        sourceUrl: wger.sourceUrl,
        license: wger.license,
        licenseUrl: wger.licenseUrl,
        licenseAuthor: wger.licenseAuthor
      });
      enriched += 1;
    } else if (current?.source === 'wger') {
      // Atualiza nome, instruções e mídias de exercícios Wger já salvos sem mudar o ID local.
      updates.push({ ...wger, id: current.id });
    } else if (!current) {
      updates.push(wger);
      byName.set(key, wger);
      if (wger.sourceId) byWgerId.set(String(wger.sourceId), wger);
      added += 1;
    }
  }

  if (updates.length) await upsertExercises(db, updates);
  const counts = await countExercisesBySource(db);
  return { fetched: incoming.length, enriched, added, ...counts };
}
