#!/usr/bin/env bash
# Lays the studio out as Carl's real site, for carlbahner.com: "i want to replace my current site" (Carl, 3 Nov 2026).
# Only what a visitor's browser loads: the page, its code, its pictures and sounds, and 404.html, which sends any old
# address (his old site's /for-artists and the like) to the room. Usage: studio/build-site.sh <outdir>
# VISITOR COUNTS: "Yes, add counts" (Carl, the launch quiz, 3 Nov 2026). Cloudflare Web Analytics, switched on in
# Cloudflare's dashboard once the site is hosted there, adds its own counter with no change to these files.
set -euo pipefail
cd "$(dirname "$0")"
out="$1"; rm -rf "$out"; mkdir -p "$out"
cp -r index.html 404.html src vendor assets "$out/"
