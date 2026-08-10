import { Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

const OWNER = process.env.EXPO_PUBLIC_GITHUB_OWNER || 'RaphaelTW';
const REPO = process.env.EXPO_PUBLIC_GITHUB_REPO || 'neolift-mobile';
const RELEASES_API = `https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=30`;
const FORCE_UPDATE_AFTER_RELEASES = 4;

export type UpdateMode = 'none' | 'prompt' | 'forced';

export type ReleaseInfo = {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  newerReleaseCount: number;
  updateMode: UpdateMode;
  notes: string;
  htmlUrl: string;
  apkUrl?: string;
  apkName?: string;
};

const normalize = (value: string) => value.replace(/^v/i, '').split('-')[0];

const compareVersions = (left: string, right: string) => {
  const a = normalize(left).split('.').map((part) => Number(part) || 0);
  const b = normalize(right).split('.').map((part) => Number(part) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
};

const newer = (latest: string, current: string) => compareVersions(latest, current) > 0;

const releaseVersion = (release: any) => normalize(String(release?.tag_name || '0.0.0'));

const stableReleases = (releases: any[]) => releases
  .filter((release) => release && !release.draft && !release.prerelease && release.tag_name)
  .sort((a, b) => compareVersions(releaseVersion(b), releaseVersion(a)));

export async function checkGithubRelease(): Promise<ReleaseInfo> {
  const response = await fetch(RELEASES_API, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2026-03-10'
    }
  });

  if (!response.ok) throw new Error('Não foi possível consultar as releases no GitHub.');

  const releases = stableReleases(await response.json());
  const currentVersion = Application.nativeApplicationVersion || '1.1.0';
  const latest = releases[0];

  if (!latest) {
    return {
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
      newerReleaseCount: 0,
      updateMode: 'none',
      notes: '',
      htmlUrl: `https://github.com/${OWNER}/${REPO}/releases`
    };
  }

  const latestVersion = releaseVersion(latest);
  const newerReleases = releases.filter((release) => newer(releaseVersion(release), currentVersion));
  const apk = Array.isArray(latest.assets)
    ? latest.assets.find((asset: any) => typeof asset?.name === 'string' && asset.name.toLowerCase().endsWith('.apk'))
    : undefined;

  const hasUpdate = newer(latestVersion, currentVersion);
  const newerReleaseCount = hasUpdate ? newerReleases.length : 0;
  const updateMode: UpdateMode = !hasUpdate
    ? 'none'
    : newerReleaseCount >= FORCE_UPDATE_AFTER_RELEASES
      ? 'forced'
      : 'prompt';

  return {
    currentVersion,
    latestVersion,
    hasUpdate,
    newerReleaseCount,
    updateMode,
    notes: latest.body || '',
    htmlUrl: latest.html_url || `https://github.com/${OWNER}/${REPO}/releases/latest`,
    apkUrl: apk?.browser_download_url,
    apkName: apk?.name
  };
}

const updateDirectory = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}updates/`;

async function ensureUpdateDirectory() {
  const info = await FileSystem.getInfoAsync(updateDirectory);
  if (!info.exists) await FileSystem.makeDirectoryAsync(updateDirectory, { intermediates: true });
}

export async function downloadAndroidUpdate(info: ReleaseInfo): Promise<string> {
  if (Platform.OS !== 'android') throw new Error('Download direto de APK está disponível apenas no Android.');
  if (!info.apkUrl) throw new Error('A release mais recente não possui um APK anexado.');

  await ensureUpdateDirectory();
  const safeName = (info.apkName || `NeoLift-v${info.latestVersion}.apk`).replace(/[^a-zA-Z0-9._-]/g, '-');
  const destination = `${updateDirectory}${safeName}`;
  const existing = await FileSystem.getInfoAsync(destination);
  if (existing.exists && existing.size && existing.size > 0) return destination;

  const downloaded = await FileSystem.downloadAsync(info.apkUrl, destination);
  if (downloaded.status < 200 || downloaded.status >= 300) {
    await FileSystem.deleteAsync(destination, { idempotent: true }).catch(() => {});
    throw new Error(`Falha ao baixar a atualização (HTTP ${downloaded.status}).`);
  }
  return downloaded.uri;
}

export async function openAndroidInstaller(localApkUri: string) {
  if (Platform.OS !== 'android') return 'unsupported';
  const contentUri = await FileSystem.getContentUriAsync(localApkUri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
    type: 'application/vnd.android.package-archive'
  });
  return 'installer';
}

export async function openUnknownSourcesSettings() {
  if (Platform.OS !== 'android') return;
  const packageName = Application.applicationId;
  await IntentLauncher.startActivityAsync('android.settings.MANAGE_UNKNOWN_APP_SOURCES', {
    data: packageName ? `package:${packageName}` : undefined
  });
}

export async function installOrOpenRelease(info: ReleaseInfo, downloadedUri?: string) {
  if (Platform.OS !== 'android' || !info.apkUrl) {
    await Linking.openURL(info.htmlUrl);
    return 'opened';
  }

  const localUri = downloadedUri || await downloadAndroidUpdate(info);
  return openAndroidInstaller(localUri);
}

export const UPDATE_POLICY = {
  forceAfterNewerReleases: FORCE_UPDATE_AFTER_RELEASES
} as const;
