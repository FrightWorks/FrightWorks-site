import type { CollectionEntry } from 'astro:content';
import { getLatestRelease, latestDownloadUrl, latestReleaseUrl, type Release } from './releases';

export interface DownloadFile {
  url: string;
  file: string;
  /** Bytes, from the latest release. Missing when the GitHub API couldn't be reached. */
  size?: number;
}

export interface GameDownloads {
  release: Release | null;
  releasesUrl: string;
  windows?: DownloadFile;
  linux?: DownloadFile;
  zip?: DownloadFile;
}

export async function getDownloads(game: CollectionEntry<'games'>): Promise<GameDownloads | null> {
  const { repo, downloads } = game.data;
  if (!repo) return null;

  const release = await getLatestRelease(repo);
  const result: GameDownloads = { release, releasesUrl: latestReleaseUrl(repo) };
  const sizeOf = (file: string) => release?.assets.find((a) => a.name === file)?.size;

  if (downloads?.windowsInstaller) {
    const file = downloads.windowsInstaller;
    result.windows = { file, url: latestDownloadUrl(repo, file), size: sizeOf(file) };
  }
  if (downloads?.linuxAppImage) {
    const file = downloads.linuxAppImage;
    result.linux = { file, url: latestDownloadUrl(repo, file), size: sizeOf(file) };
  }
  if (downloads?.zipPattern && release) {
    const re = new RegExp(downloads.zipPattern);
    const asset = release.assets.find((a) => re.test(a.name));
    if (asset) result.zip = { file: asset.name, url: asset.url, size: asset.size };
  }
  return result;
}
