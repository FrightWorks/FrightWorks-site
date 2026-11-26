# frightworks.dev

The website for [FrightWorks](https://github.com/FrightWorks): unofficial PC ports of Scooby-Doo! games.

Built with [Astro](https://astro.build) by GitHub Actions on every push to `main` and served from FrightWorks' own server
behind Cloudflare, which picks up each new build within a few minutes.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Adding a game

1. Put screenshots in `src/assets/screenshots/<slug>/`.
2. Add `src/content/games/<slug>.md` (see `no100f.md` for every field). It appears on the home page and at
   `/games/<slug>/`.

Download links and the version number come from the game repo's latest GitHub release when the site builds. The site
rebuilds every 3 hours, on every push, and when a game repo sends a `release-published` repository dispatch. Every
30 minutes `stats-check.yml` also checks whether FrightWorks/download-stats has published a new `stats.json` (compared
with `/stats-generated.txt` from the last build) and starts a rebuild if so; download-stats publishes twice a day and
within about an hour of a new release.

Scooby-Doo ™ & © Hanna-Barbera / Warner Bros. Unofficial fan project, not affiliated with or endorsed by Warner Bros.,
THQ or Heavy Iron Studios.
