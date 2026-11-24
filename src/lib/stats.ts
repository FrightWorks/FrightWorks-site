// Download stats from the FrightWorks/download-stats repo, fetched once per build (never from the
// visitor's browser). That repo collects the counts twice a day and publishes them as stats.json on its
// GitHub Pages site; the site rebuilds every few hours to pick them up. If the file can't be read, the
// stats page says so and links to the repo instead.
//
// For local work before a change to stats.json is published, point STATS_FILE at a local copy
// (python dashboard.py --out some/dir/index.html writes stats.json next to it).

import { readFile } from 'node:fs/promises';

export const STATS_URL = 'https://frightworks.github.io/download-stats/stats.json';
export const STATS_REPO_URL = 'https://github.com/FrightWorks/download-stats';
const SCHEMA = 1;

export type Platform = 'Windows' | 'Linux';
export const PLATFORMS: Platform[] = ['Windows', 'Linux'];

export interface Part {
  label: string;
  count: number;
}

export interface PlatformStats {
  downloads: number;
  updates: number;
  checks: number;
  parts: Part[];
  updateParts: Part[];
}

export interface StatsFile {
  name: string;
  description: string;
  size: number;
  downloads: number;
}

export interface Version {
  tag: string;
  date: string;
  prerelease: boolean;
  downloads: number;
  platforms: Record<Platform, PlatformStats>;
  files: StatsFile[];
}

export interface Stats {
  schema: number;
  repo: string;
  releasesUrl: string;
  generated: string;
  allVersions: { total: number; platforms: Record<Platform, number> };
  recent: Record<Platform, { count: number; label: string } | null>;
  versions: Version[];
  daily: { date: string; count: number }[];
}

let cached: Promise<Stats | null> | undefined;

async function load(): Promise<Stats | null> {
  try {
    let data: Stats;
    if (process.env.STATS_FILE) {
      data = JSON.parse(await readFile(process.env.STATS_FILE, 'utf-8'));
    } else {
      const res = await fetch(STATS_URL, { headers: { 'User-Agent': 'frightworks-site-build' } });
      if (!res.ok) {
        console.warn(`[stats] ${STATS_URL} answered ${res.status}; the stats page shows a fallback.`);
        return null;
      }
      data = await res.json();
    }
    if (data.schema !== SCHEMA) {
      console.warn(`[stats] stats.json schema ${data.schema}, expected ${SCHEMA}; the stats page shows a fallback.`);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`[stats] ${(err as Error).message}; the stats page shows a fallback.`);
    return null;
  }
}

export function getStats(): Promise<Stats | null> {
  cached ??= load();
  return cached;
}
