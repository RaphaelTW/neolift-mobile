import { Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

const OWNER = process.env.EXPO_PUBLIC_GITHUB_OWNER || 'RaphaelTW';
const REPO = process.env.EXPO_PUBLIC_GITHUB_REPO || 'neolift-mobile';
const RELEASES_API = `https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=100`;
const FORCE_UPDATE_AFTER_RELEASES = 4;
const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/i;

type GithubAsset = {
  name?: string;
  browser_download_url?: string;
  content_type?: string;
  state?: string;
  size?: number;
  digest?: string;
};

type GithubRelease = {
  id?: number;
  tag_name?: string;
  draft?: boolean;
  prerelease?: boolean;
  body?: string;
  html_url?: string;
  assets?: GithubAsset[];
};

export type UpdateMode = 'none' | 'prompt' | 'forced';

export type ReleaseInfo = {
  releaseId?: number;
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  newerReleaseCount: number;
  updateMode: UpdateMode;
  notes: string;
  htmlUrl: string;
  apkUrl?: string;
  apkName?: string;
  apkSize?: number;
  apkDigest?: string;
};

const normalizeVersion = (value: string) => {
  const match = value.trim().match(VERSION_PATTERN);
  return match ? `${Number(match[1])}.${Number(match[2])}.${Number(match[3])}` : null;
};

export const compareVersions = (left: string, right: string) => {
  const a = normalizeVersion(left)?.split('.').map(Number) ?? [0, 0, 0];
  const b = normalizeVersion(right)?.split('.').map(Number) ?? [0, 0, 0];
  for (let index = 0; index < 3; index += 1) {
    const difference = a[index] - b[index];
    if (difference !== 0) return difference > 0 ? 1 : -1;
  }
  return 0;
};

const isNewer = (candidate: string, current: string) => compareVersions(candidate, current) > 0;
const releaseVersion = (release: GithubRelease) => normalizeVersion(String(release.tag_name || ''));

const apkAssetForRelease = (release: GithubRelease, version: string) => {
  const assets = Array.isArray(release.assets)
    ? release.assets.filter((asset) => {
      const name = asset.name?.toLowerCase() || '';
      return name.endsWith('.apk')
        && Boolean(asset.browser_download_url)
        && asset.state !== 'new'
        && (asset.size ?? 1) > 0;
    })
    : [];

  const exactName = `neolift-v${version}.apk`;
  return assets.find((asset) => asset.name?.toLowerCase() === exactName)
    ?? assets.find((asset) => asset.name?.toLowerCase().includes(`v${version}`))
    ?? assets[0];
};

const stableReleases = (releases: GithubRelease[]) => releases
  .filter((release) => release && !release.draft && !release.prerelease && releaseVersion(release))
  .sort((left, right) => compareVersions(releaseVersion(right)!, releaseVersion(left)!));

const currentAppVersion = () => normalizeVersion(
  Constants.expoConfig?.version || Application.nativeApplicationVersion || '0.0.0'
) || '0.0.0';

export async function checkGithubRelease(): Promise<ReleaseInfo> {
  const response = await fetch(RELEASES_API, {
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  if (!response.ok) {
    throw new Error(`Não foi possível consultar as releases no GitHub (HTTP ${response.status}).`);
  }

  const payload: unknown = await response.json();
  const releases = stableReleases(Array.isArray(payload) ? payload as GithubRelease[] : []);
  const currentVersion = currentAppVersion();
  const newerReleases = releases.filter((release) => isNewer(releaseVersion(release)!, currentVersion));
  const installableRelease = newerReleases.find((release) => {
    const version = releaseVersion(release)!;
    return Boolean(apkAssetForRelease(release, version));
  });
  const latestRelease = installableRelease ?? newerReleases[0] ?? releases[0];

  if (!latestRelease) {
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

  const latestVersion = releaseVersion(latestRelease)!;
  const apk = apkAssetForRelease(latestRelease, latestVersion);
  const hasUpdate = isNewer(latestVersion, currentVersion);
  const newerReleaseCount = hasUpdate ? newerReleases.length : 0;
  const updateMode: UpdateMode = !hasUpdate
    ? 'none'
    : newerReleaseCount >= FORCE_UPDATE_AFTER_RELEASES
      ? 'forced'
      : 'prompt';

  return {
    releaseId: latestRelease.id,
    currentVersion,
    latestVersion,
    hasUpdate,
    newerReleaseCount,
    updateMode,
    notes: latestRelease.body || '',
    htmlUrl: latestRelease.html_url || `https://github.com/${OWNER}/${REPO}/releases/latest`,
    apkUrl: apk?.browser_download_url,
    apkName: apk?.name,
    apkSize: apk?.size,
    apkDigest: apk?.digest
  };
}

const updatesRoot = `${FileSystem.documentDirectory || FileSystem.cacheDirectory || ''}updates/`;

async function ensureDirectory(directory: string) {
  if (!directory.startsWith('file://')) throw new Error('O armazenamento local do aplicativo não está disponível.');
  const info = await FileSystem.getInfoAsync(directory);
  if (!info.exists) await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
}

const validDownloadedFile = async (uri: string, expectedSize?: number) => {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || !info.size || info.size <= 0) return false;
  return !expectedSize || info.size === expectedSize;
};

export async function downloadAndroidUpdate(info: ReleaseInfo): Promise<string> {
  if (Platform.OS !== 'android') throw new Error('Download direto de APK está disponível apenas no Android.');
  if (!info.apkUrl) throw new Error(`A release v${info.latestVersion} ainda não possui um APK válido anexado.`);

  const versionDirectory = `${updatesRoot}v${info.latestVersion}/`;
  await ensureDirectory(versionDirectory);

  const safeName = (info.apkName || `NeoLift-v${info.latestVersion}.apk`).replace(/[^a-zA-Z0-9._-]/g, '-');
  const destination = `${versionDirectory}${safeName}`;
  const temporaryDestination = `${destination}.download`;

  if (await validDownloadedFile(destination, info.apkSize)) return destination;

  await FileSystem.deleteAsync(destination, { idempotent: true });
  await FileSystem.deleteAsync(temporaryDestination, { idempotent: true });

  try {
    const downloaded = await FileSystem.downloadAsync(info.apkUrl, temporaryDestination, {
      headers: { Accept: 'application/vnd.android.package-archive' }
    });
    if (downloaded.status < 200 || downloaded.status >= 300) {
      throw new Error(`Falha ao baixar a atualização (HTTP ${downloaded.status}).`);
    }
    if (!await validDownloadedFile(downloaded.uri, info.apkSize)) {
      throw new Error('O APK baixado está vazio ou incompleto. Tente novamente.');
    }
    await FileSystem.moveAsync({ from: downloaded.uri, to: destination });
    return destination;
  } catch (error) {
    await FileSystem.deleteAsync(temporaryDestination, { idempotent: true }).catch(() => {});
    throw error;
  }
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
