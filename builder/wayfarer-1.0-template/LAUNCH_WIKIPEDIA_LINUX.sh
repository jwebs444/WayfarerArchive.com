#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ZIM=$(find "$ROOT/Wikipedia" -maxdepth 1 -type f -name '*.zim' -print -quit)
READER="$ROOT/Readers/Linux/kiwix-desktop.AppImage"

if [ -z "$ZIM" ]; then
  printf '%s\n' "Wikipedia archive not found in $ROOT/Wikipedia" >&2
  exit 1
fi
if [ ! -f "$READER" ]; then
  printf '%s\n' "Kiwix AppImage not found at $READER" >&2
  exit 1
fi

if [ -x "$READER" ] && "$READER" "$ZIM"; then
  exit 0
fi

# Removable drives are often mounted noexec and FAT/exFAT cannot preserve the
# executable bit. Copy only the small reader to a temporary executable path;
# the large ZIM always remains on the drive.
TEMP_READER="${TMPDIR:-/tmp}/wayfarer-kiwix-${USER:-user}.AppImage"
cp "$READER" "$TEMP_READER"
chmod 700 "$TEMP_READER"
exec "$TEMP_READER" "$ZIM"
