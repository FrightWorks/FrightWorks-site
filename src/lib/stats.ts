// Download stats, fetched once per build for the stats page's fallback. The FrightWorks web server regenerates
// stats.json every 5 minutes (FrightWorks/download-stats' dashboard.py, run by a timer set up in frightworks-infra)
// and serves it at /stats.json; the page itself loads that file in the browser, so it doesn't wait for a rebuild.
// Never call the GitHub API from the browser: /stats.json is our own file. If it can't be read at build time, the
// page starts with a "couldn't be loaded" note and the browser fills it in.
//
// For local work, point STATS_FILE at a local copy (python dashboard.py --out some/dir/index.html writes stats.json
// next to it).

import { readFile } from 'node:fs/promises';
import { usable, type Stats } from './stats-view';

export * from './stats-view';
export const STATS_URL = 'https://frightworks.dev/stats.json';

let cached: Promise<Stats | null> | undefined;

async function load(): Promise<Stats | null> {
  try {
    let data: unknown;
    if (process.env.STATS_FILE) {
      data = JSON.parse(await readFile(process.env.STATS_FILE, 'utf-8'));
    } else {
      const res = await fetch(STATS_URL, { headers: { 'User-Agent': 'frightworks-site-build' } });
      if (!res.ok) {
        console.warn(`[stats] ${STATS_URL} answered ${res.status}; the stats page starts with a fallback.`);
        return null;
      }
      data = await res.json();
    }
    if (!usable(data)) {
      console.warn(`[stats] stats.json isn't usable (schema or no versions); the stats page starts with a fallback.`);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`[stats] ${(err as Error).message}; the stats page starts with a fallback.`);
    return null;
  }
}

export function getStats(): Promise<Stats | null> {
  cached ??= load();
  return cached;
}
