import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per game in src/content/games/. The file name is the URL slug
// (/games/<slug>/). Add a file here to add a game to the home page and the site.
const games = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/games' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // playable: released; in-development: being worked on ("Coming soon"); planned: announced, not started.
      status: z.enum(['playable', 'in-development', 'planned']),
      // Shown as a chip, e.g. "GameCube · 2002". Omit while unannounced.
      original: z.string().optional(),
      summary: z.string(),
      // Sort order on the home page, lowest first.
      order: z.number(),
      // GitHub repo ("owner/name"). Releases and download links come from it.
      repo: z.string().optional(),
      // The home page features the playable game with the lowest order.
      hero: image().optional(),
      heroAlt: z.string().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // Front of the original GameCube case, shown beside the cover on the game's card.
      boxart: image().optional(),
      highlights: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      screenshots: z.array(z.object({ src: image(), caption: z.string() })).default([]),
      // Release assets with stable names, served from /releases/latest/download/<file>.
      downloads: z
        .object({
          windowsInstaller: z.string().optional(),
          linuxAppImage: z.string().optional(),
          // Pattern for the versioned zip, matched against the latest release's assets.
          zipPattern: z.string().optional(),
        })
        .optional(),
      requirements: z.string().optional(),
    }),
});

export const collections = { games };
