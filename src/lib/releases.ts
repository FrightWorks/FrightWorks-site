// Latest-release info, fetched from the GitHub API once per build (never from the
// visitor's browser). The site rebuilds when a release is published, so this stays
// current. If the API can't be reached, pages fall back to links that don't need it.

export interface ReleaseAsset {
  name: string;
  url: string;
  size: number;
}

export interface Release {
  tag: string;
  name: string;
  url: string;
  publishedAt: Date;
  assets: ReleaseAsset[];
}

const cache = new Map<string, Promise<Release | null>>();

async function fetchLatest(repo: string): Promise<Release | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'frightworks-site-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers });
    if (!res.ok) {
      console.warn(`[releases] ${repo}: GitHub API answered ${res.status}; using fallback links.`);
      return null;
    }
    const data = await res.json();
    return {
      tag: data.tag_name,
      name: data.name ?? data.tag_name,
      url: data.html_url,
      publishedAt: new Date(data.published_at),
      assets: (data.assets ?? []).map((a: { name: string; browser_download_url: string; size: number }) => ({
        name: a.name,
        url: a.browser_download_url,
        size: a.size,
      })),
    };
  } catch (err) {
    console.warn(`[releases] ${repo}: ${(err as Error).message}; using fallback links.`);
    return null;
  }
}

export function getLatestRelease(repo: string): Promise<Release | null> {
  let p = cache.get(repo);
  if (!p) {
    p = fetchLatest(repo);
    cache.set(repo, p);
  }
  return p;
}

/** A link that always points at the newest release's copy of a stably named file. */
export function latestDownloadUrl(repo: string, file: string): string {
  return `https://github.com/${repo}/releases/latest/download/${file}`;
}

export function latestReleaseUrl(repo: string): string {
  return `https://github.com/${repo}/releases/latest`;
}

export function formatSize(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
