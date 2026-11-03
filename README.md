# carlbahner.com

Carl Bahner's site: an explorable version of his home studio, each thing in the room opening a page.

- **Build:** `bash build-site.sh dist` lays out the site in `dist/` (no install, no packages).
- **Host:** Cloudflare Pages, connected to this repo. Build command `bash build-site.sh dist`, output directory `dist`.
- **Try it locally:** serve the folder with anything static, e.g. `npx serve .`.
- **Tests:** `node tests/nav.mjs` and `node tests/sizes.mjs` (need Playwright).

`CLAUDE.md` holds every decision, in Carl's words.
