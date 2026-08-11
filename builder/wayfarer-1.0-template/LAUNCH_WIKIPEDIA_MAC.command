#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ZIM=$(find "$ROOT/Wikipedia" -maxdepth 1 -type f -name '*.zim' -print -quit)
DMG="$ROOT/Readers/macOS/kiwix-macos.dmg"

if [ -z "$ZIM" ]; then
  osascript -e 'display alert "Wayfarer’s Archive" message "The Wikipedia ZIM file is missing."'
  exit 1
fi

if [ -d /Applications/Kiwix.app ]; then
  open -a /Applications/Kiwix.app "$ZIM"
  exit 0
fi

if [ ! -f "$DMG" ]; then
  osascript -e 'display alert "Wayfarer’s Archive" message "The bundled Kiwix disk image is missing."'
  exit 1
fi

open "$DMG"
osascript -e 'display dialog "Kiwix is opening. Drag it to Applications, then run this launcher again." buttons {"OK"} default button "OK" with title "Wayfarer’s Archive"'
