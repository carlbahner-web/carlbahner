#!/usr/bin/env bash
# The view editor's own copy of the room (src/viewtune.mjs, EDIT VIEWS), published to its own artifact, never the room's:
# "Artifact not a page please" (Carl, 2 Nov 2026). Usage: studio/build-editor.sh <outdir>
# It is the room as build-artifact.sh lays it out, with window.STUDIO_EDITOR set before the room's script runs.
set -euo pipefail
out="$1"
"$(dirname "$0")/build-artifact.sh" "$out"
python3 - "$out/studio-corner.html" <<'PY'
import sys
p = sys.argv[1]; s = open(p).read()
s = s.replace('<title>Studio Corner</title>', '<title>Studio View Editor</title>', 1)
s = s.replace('<script type="module" src="src/studio.mjs"></script>', '<script>window.STUDIO_EDITOR = true;</script>\n<script type="module" src="src/studio.mjs"></script>', 1)
open(p, 'w').write(s)
PY
