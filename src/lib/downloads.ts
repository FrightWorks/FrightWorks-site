import type { CollectionEntry } from 'astro:content';
import { getLatestRelease, latestDownloadUrl, latestReleaseUrl, type Release } from './releases';

export interface GameDownloads {
  release: Release | null;
  releasesUrl: string;
  windows?: { url: string; file: string };
  linux?: { url: string; file: string };
  zip?: { url: string; file: string };
}

export async function getDownloads(game: CollectionEntry<'games'>): Promise<GameDownloads | null> {
  const { repo, downloads } = game.data;
  if (!repo) return null;

  const release = await getLatestRelease(repo);
  const result: GameDownloads = { release, releasesUrl: latestReleaseUrl(repo) };

  if (downloads?.windowsInstaller) {
    result.windows = { file: downloads.windowsInstaller, url: latestDownloadUrl(repo, downloads.windowsInstaller) };
  }
  if (downloads?.linuxAppImage) {
    result.linux = { file: downloads.linuxAppImage, url: latestDownloadUrl(repo, downloads.linuxAppImage) };
  }
  if (downloads?.zipPattern && release) {
    const re = new RegExp(downloads.zipPattern);
    const asset = release.assets.find((a) => re.test(a.name));
    if (asset) result.zip = { file: asset.name, url: asset.url };
  }
  return result;
}
