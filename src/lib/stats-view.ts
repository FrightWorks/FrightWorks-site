// The live part of /stats/, as an HTML string from a stats.json object. Used twice: at build time (the page's
// fallback, so it works without JavaScript) and in the browser, which loads /stats.json when the page opens and
// every few minutes after. Browser-safe: no Node imports. Every value from the JSON goes through esc().

export const SCHEMA = 1;
export const STATS_REPO_URL = 'https://github.com/FrightWorks/download-stats';

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

/** A stats.json this page can draw: the right schema and at least one version. */
export function usable(data: unknown): data is Stats {
  const s = data as Stats | null;
  return !!s && s.schema === SCHEMA && Array.isArray(s.versions) && s.versions.length > 0 && typeof s.generated === 'string';
}

const esc = (v: unknown) =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const num = (n: number) => Number(n).toLocaleString('en-US');
const parts = (list: Part[]) => list.map((p) => `${p.label} ${num(p.count)}`).join(' · ');
const size = (n: number) =>
  n < 1048576
    ? `${num(Math.round(n / 1024))} KB`
    : `${(n / 1048576).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`;
const day = (iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(2)}%`;
const seriesVar: Record<Platform, string> = { Windows: 'var(--series-win)', Linux: 'var(--series-linux)' };
const key = (p: Platform) => `<i class="key" style="background:${seriesVar[p]}"></i>`;

export function updatedLabel(generated: string): string {
  return new Date(generated).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/** Everything on /stats/ that comes from stats.json. `open` = tags of the versions whose details are open. */
export function renderStats(stats: Stats, open?: Set<string>): string {
  const versions = stats.versions;
  const current = versions[0];
  const maxVersion = Math.max(1, ...versions.map((v) => v.downloads));
  const daily = stats.daily ?? [];
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const isOpen = (v: Version, i: number) => (open ? open.has(v.tag) : i === 0);

  const tiles = [
    `<div class="tile"><span class="k">Latest version</span><span class="v">${esc(current.tag)}</span>` +
      `<span class="d">released ${esc(day(current.date))}</span></div>`,
    ...PLATFORMS.map((p) => {
      const st = current.platforms[p];
      const recent = stats.recent?.[p];
      return (
        `<div class="tile"><span class="k">${key(p)}${p} downloads</span><span class="v">${num(st.downloads)}</span>` +
        `<span class="d">${esc(parts(st.parts) || 'no downloads yet')}</span>` +
        (recent ? `<span class="d up">+${num(recent.count)} ${esc(recent.label)}</span>` : '') +
        `</div>`
      );
    }),
    `<div class="tile"><span class="k">Update files</span>` +
      `<span class="v">${num(PLATFORMS.reduce((n, p) => n + current.platforms[p].updates, 0))}</span>` +
      `<span class="d">${PLATFORMS.map((p) => `${p} ${num(current.platforms[p].updates)}`).join(' · ')}</span></div>`,
  ].join('');

  const hbars = versions
    .map((v) => {
      const bars = PLATFORMS.filter((p) => v.platforms[p].downloads > 0)
        .map((p) => {
          const label = `${v.tag} ${p}: ${num(v.platforms[p].downloads)}`;
          return (
            `<i tabindex="0" style="width:${pct(v.platforms[p].downloads, maxVersion)};background:${seriesVar[p]}" ` +
            `data-tip="${esc(label)}" aria-label="${esc(`${label} downloads`)}"></i>`
          );
        })
        .join('');
      return `<div class="hrow"><span class="tag">${esc(v.tag)}</span><div class="hbar">${bars}</div><span class="n">${num(v.downloads)}</span></div>`;
    })
    .join('');

  const perDay =
    daily.length > 0
      ? `<p class="note">Installer, zip, AppImage and tarball of ${esc(current.tag)}, both platforms together, from ` +
        `${esc(day(daily[0].date))} to ${esc(day(daily[daily.length - 1].date))} (Central time).</p>` +
        `<div class="cols" style="--n:${daily.length}">` +
        daily
          .map((d) => {
            const short = day(d.date, { month: 'short', day: 'numeric' });
            return (
              `<div class="col"><div class="track"><span class="val">${num(d.count)}</span>` +
              `<i tabindex="0" style="height:${((d.count / maxDaily) * 140).toFixed(1)}px" ` +
              `data-tip="${esc(`${short}: ${num(d.count)} new`)}" aria-label="${esc(`${short}: ${num(d.count)} new downloads`)}"></i>` +
              `</div><span class="date">${esc(day(d.date, { day: 'numeric' }))}</span></div>`
            );
          })
          .join('') +
        `</div>`
      : `<p class="note">The chart appears once the snapshots of ${esc(current.tag)} span at least two days.</p>`;

  const details = versions
    .map((v, i) => {
      const rows = PLATFORMS.map((p) => {
        const st = v.platforms[p];
        return (
          `<tr><td>${p}</td><td class="n">${num(st.downloads)}<small>${esc(parts(st.parts))}</small></td>` +
          `<td class="n">${num(st.updates)}<small>${esc(parts(st.updateParts))}</small></td>` +
          `<td class="n">${num(st.checks)}</td></tr>`
        );
      }).join('');
      const files = v.files
        .map(
          (f) =>
            `<tr><td class="fn">${esc(f.name)}</td><td class="desc">${esc(f.description)}</td>` +
            `<td class="n">${size(f.size)}</td><td class="n">${num(f.downloads)}</td></tr>`,
        )
        .join('');
      return (
        `<details data-tag="${esc(v.tag)}"${isOpen(v, i) ? ' open' : ''}><summary><span>${esc(v.tag)}` +
        `${v.prerelease ? ' (pre-release)' : ''}</span><small>${esc(day(v.date))} · ${num(v.downloads)} downloads</small></summary>` +
        `<div class="tbl"><table><thead><tr><th>Platform</th><th class="n">Downloads</th><th class="n">Update files</th>` +
        `<th class="n">Update checks</th></tr></thead><tbody>${rows}</tbody></table></div>` +
        `<div class="tbl"><table class="files"><thead><tr><th>File</th><th>What it is</th><th class="n">Size</th>` +
        `<th class="n">Downloads</th></tr></thead><tbody>${files}</tbody></table></div></details>`
      );
    })
    .join('');

  return (
    `<p class="lead intro">Night of 100 Frights, counted from its GitHub releases every 5 minutes. ` +
    `Last updated ${esc(updatedLabel(stats.generated))}. All versions together: <strong>${num(stats.allVersions.total)}</strong> ` +
    `downloads (${PLATFORMS.map((p) => `${p} ${num(stats.allVersions.platforms[p])}`).join(' · ')}).</p>` +
    `<p class="links"><a href="${esc(stats.releasesUrl)}">Releases on GitHub</a><a href="${STATS_REPO_URL}">How these are collected</a></p>` +
    `<div class="tiles">${tiles}</div>` +
    `<section class="card" aria-labelledby="per-version"><h2 id="per-version" class="display">Downloads per version</h2>` +
    `<p class="note">The last ${versions.length} versions, newest first. Installer and zip are combined for Windows, ` +
    `AppImage and tarball for Linux. Counts keep growing after a release, so older versions aren't final.</p>` +
    `<div class="legend">${PLATFORMS.map((p) => `<span>${key(p)}${p}</span>`).join('')}</div>` +
    `<div class="hbars">${hbars}</div></section>` +
    `<section class="card" aria-labelledby="per-day"><h2 id="per-day" class="display">New downloads per day</h2>${perDay}</section>` +
    `<section class="card" aria-labelledby="details"><h2 id="details" class="display">Details per version</h2>` +
    `<p class="note">Open a version to see its numbers and files.</p>${details}</section>`
  );
}

export function renderUnavailable(): string {
  return (
    `<p class="lead intro">The stats couldn't be loaded. They're collected by the ` +
    `<a href="${STATS_REPO_URL}">download-stats</a> scripts every 5 minutes; try again in a moment.</p>`
  );
}
