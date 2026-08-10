import { Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

const OWNER = process.env.EXPO_PUBLIC_GITHUB_OWNER || 'RaphaelTW';
const REPO = process.env.EXPO_PUBLIC_GITHUB_REPO || 'neolift-mobile';
const RELEASE_API = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;

export type ReleaseInfo = {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  notes: string;
  htmlUrl: string;
  apkUrl?: string;
};

const normalize = (value: string) => value.replace(/^v/i, '').split('-')[0];
const newer = (latest: string, current: string) => {
  const a = normalize(latest).split('.').map(Number);
  const b = normalize(current).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
};

export async function checkGithubRelease(): Promise<ReleaseInfo> {
  const response = await fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error('Não foi possível consultar a última release no GitHub.');
  const release = await response.json();
  const currentVersion = Application.nativeApplicationVersion || '1.0.0';
  const latestVersion = normalize(release.tag_name || currentVersion);
  const apk = Array.isArray(release.assets)
    ? release.assets.find((a: any) => typeof a?.name === 'string' && a.name.toLowerCase().endsWith('.apk'))
    : undefined;
  return {
    currentVersion,
    latestVersion,
    hasUpdate: newer(latestVersion, currentVersion),
    notes: release.body || '',
    htmlUrl: release.html_url,
    apkUrl: apk?.browser_download_url
  };
}

export async function installOrOpenRelease(info: ReleaseInfo) {
  if (Platform.OS !== 'android' || !info.apkUrl) {
    await Linking.openURL(info.htmlUrl);
    return 'opened';
  }

  const destination = `${FileSystem.cacheDirectory}neolift-${info.latestVersion}.apk`;
  const downloaded = await FileSystem.downloadAsync(info.apkUrl, destination);
  const contentUri = await FileSystem.getContentUriAsync(downloaded.uri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
    type: 'application/vnd.android.package-archive'
  });
  return 'installer';
}
