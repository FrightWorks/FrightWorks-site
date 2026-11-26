# FrightWorks site

Source for https://frightworks.dev, the website of the FrightWorks GitHub org (unofficial PC ports of Scooby-Doo!
games). Static site built with Astro by `.github/workflows/deploy.yml` and self-hosted behind Cloudflare: the web server
pulls the `github-pages` artifact of each successful run on `main` within a few minutes (GitHub Pages is no longer used).

## Commands

- `npm install`, then `npm run dev` (http://localhost:4321) or `npm run build` (output in `dist/`), `npm run preview`
- Node 22.23.4 or newer (CI uses 24)

## Layout

- `src/content/games/*.md`: one file per game; the file name is the URL slug (`/games/<slug>/`). The schema is in
  `src/content.config.ts`. Adding a game = adding a file plus its screenshots under `src/assets/screenshots/<slug>/`.
  The home page features the playable game with the lowest `order`.
- `src/lib/releases.ts`: fetches each game's latest GitHub release at build time (uses `GITHUB_TOKEN` if set). Never
  call the GitHub API from the browser. If the API fails the build still succeeds and pages fall back to
  `/releases/latest` links.
- Download buttons for stably named assets (`FrightWorks-win-Setup.exe`, `FrightWorks.AppImage`) use
  `/releases/latest/download/<file>` and need no rebuild; the version label and the versioned zip need one.
- `src/styles/global.css`: design tokens. The look is "Stormy Night": dark-only, night navy, lantern amber accent,
  Luckiest Guy display (same font as the no100f launcher) with Figtree body, both self-hosted via Fontsource.
  Keep new UI on these tokens.

## Rules

- No game data, ROM/ISO links or ripped assets on the site. Screenshots of the ports are fine.
- Original GameCube box art and original title screens are allowed for identifying a game (cards, game pages). Use
  the least restrictive source available (currently libretro-thumbnails), check each image, and credit the source on
  `/credits/`. Files live in `src/assets/boxart/` and `src/assets/title-screens/`.
- Keep the Warner Bros. / THQ / Heavy Iron disclaimer in the footer.
- Facts about a game (features, requirements, file paths) come from that game's repo README; don't invent them.
- The no100f README was cut down on 2026-11-24 (FrightWorks/FrightWorks-no100f#214): it keeps the intro, features,
  getting started and keys, and the details moved to that repo's `docs/`: `playing.md` (installing, updates, file
  locations, moving from an earlier version, keys, controllers, Linux, developer tools), `disc.md` (which disc version,
  formats, checksums), `ps2-xbox-extras.md` (cutscenes, textures and sound from the player's own PS2 or Xbox disc) and
  `building.md`. Take no100f facts from the README plus those pages.
- Run `npm run build` before committing; it must finish without errors.
