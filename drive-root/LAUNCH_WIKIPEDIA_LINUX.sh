#!/bin/sh
set -eu
archive_root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
xowa_root="$archive_root/Wikipedia/XOWA"
reader="$xowa_root/xowa_linux_64.jar"
java="$archive_root/Runtimes/Java/Linux-x64/jdk8u502-b07-jre/bin/java"
test -f "$reader" || { echo "XOWA is missing: $reader" >&2; exit 1; }
test -f "$java" || { echo "Portable Java is missing: $java" >&2; exit 1; }
chmod u+x "$java" 2>/dev/null || true
exec "$java" -Xmx1024m -jar "$reader" --root_dir "$xowa_root" --bin_dir_name linux_64 --app_mode gui --url en.wikipedia.org/wiki/Main_Page --show_license n --show_args n

