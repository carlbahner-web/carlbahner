#!/usr/bin/env bash
# The phone stop editor's own copy of the room (src/phonetune.mjs), published to its own artifact: "i need an artifa5 that
# allows me to control the per-swipe-camera and the placement of the words. Phone/mobile version only please" (Carl,
# 4 Nov 2026). Usage: build-phone.sh <outdir>
# It is the room as build-artifact.sh lays it out, with window.SNAP_EDITOR and PHONE_PREVIEW set before the room's script runs.
set -euo pipefail
out="$1"
"$(dirname "$0")/build-artifact.sh" "$out"
python3 - "$out/studio-corner.html" <<'PY'
import sys
p = sys.argv[1]; s = open(p).read()
import re; s = re.sub(r'<title>[^<]*</title>', '<title>Phone Stop Editor</title>', s, 1)
s = s.replace('<script type="module" src="src/studio.mjs"></script>', '<script>window.SNAP_EDITOR = true; window.PHONE_PREVIEW = true;</script>\n<script type="module" src="src/studio.mjs"></script>', 1)
open(p, 'w').write(s)
PY
