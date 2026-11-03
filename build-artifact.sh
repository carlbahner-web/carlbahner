#!/usr/bin/env bash
# Lays the studio out for publishing as Carl's live link
# (https://claude.ai/artifact/DQ8ij9nV3LYqoqFPctKkyx). Usage: studio/build-artifact.sh <outdir>
# Then publish <outdir>/studio-corner.html to that link with every other file in <outdir> beside it,
# at the same paths (the .mjs files as text/javascript).
set -euo pipefail
cd "$(dirname "$0")"
out="$1"; rm -rf "$out"; mkdir -p "$out"
cp -r src vendor assets "$out/"
# the viewer wraps the page in its own <html>, <head> and <body>, so the page is what is inside them
python3 - "$out/studio-corner.html" <<'PY'
import re, sys
s = open('index.html').read()
head = re.search(r'<head>(.*)</head>', s, re.S).group(1)
body = re.search(r'<body>(.*)</body>', s, re.S).group(1)
head = re.sub(r'\s*<meta[^>]*>', '', head)
open(sys.argv[1], 'w').write(head.strip() + '\n' + body.strip() + '\n')
PY
