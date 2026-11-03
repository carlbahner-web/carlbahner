#!/usr/bin/env bash
# The word editor's own copy of the room (src/wordtune.mjs), published to its own artifact: "let's make this its own artifact
# without all those extra controls" (Carl, 3 Nov 2026). Usage: studio/build-words.sh <outdir>
# It is the room as build-artifact.sh lays it out, with window.WORDS_EDITOR set before the room's script runs.
set -euo pipefail
out="$1"
"$(dirname "$0")/build-artifact.sh" "$out"
python3 - "$out/studio-corner.html" <<'PY'
import sys
p = sys.argv[1]; s = open(p).read()
s = s.replace('<title>Studio Corner</title>', '<title>Studio Word Editor</title>', 1)
s = s.replace('<script type="module" src="src/studio.mjs"></script>', '<script>window.WORDS_EDITOR = true;</script>\n<script type="module" src="src/studio.mjs"></script>', 1)
open(p, 'w').write(s)
PY
