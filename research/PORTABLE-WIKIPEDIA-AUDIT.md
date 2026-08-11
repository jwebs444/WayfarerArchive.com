# Portable Wikipedia project audit

Audit date: 2026-08-10

## Question

Does a maintained, one-click tool already exist that turns an ordinary USB
drive into a self-contained offline English Wikipedia usable across Windows,
macOS, and Linux?

## Short answer

The component technologies and several setup recipes already exist. Apocalypse
Drive is an especially close prototype. No inspected project currently delivers
the complete, polished promise as a published and tested consumer release.

## Closest match: Apocalypse Drive

Repository: https://github.com/hratterman/apocalypse-drive

The project claims an exFAT portable layout, per-OS launchers, a browser-based
setup wizard, Kiwix ZIM downloads, and optional offline AI. Its default 128 GB
"Survival Pack" uses Wikipedia's top-one-million-article ZIM rather than full
English Wikipedia.

Observed limitations as of the audit:

- The repository has no tags and GitHub shows no published Releases.
- README download links point at a release URL, but no downloadable release is
  currently present.
- The portable workflow still requires platform-specific installation or
  extraction on the USB drive.
- Its static HTML fallback is a landing page; reading ZIM content still requires
  the packaged application or a separately installed Kiwix reader.
- The CI workflow anticipates signed/notarized macOS builds, but the README still
  describes Gatekeeper warnings. Windows SmartScreen warnings are expected.
- The downloader resumes interrupted files but does not compare a published
  cryptographic checksum before accepting them.
- The Python sources compile, but the repository contains no automated test
  suite or dependency lock file.

It is a real and thoughtful prototype, not an established distribution that
eliminates the need for Wayfarer.

## Other relevant projects

### Kiwix portable desktop

Kiwix officially documents a portable USB layout. The user downloads and
unpacks platform readers, creates a `.portable` marker, copies ZIM files, and
optionally generates a library index. It supplies the strongest maintained
reader/content ecosystem but not a finished one-click drive creator.

### Kiwix Hotspot / Offspot

This provides a polished image-building and plug-and-play experience for
Raspberry Pi hardware. It is not an ordinary USB drive that runs within the host
computer's operating system.

### WROLPi

WROLPi offers a bootable USB/ISO containing Wikipedia and other material. It
boots its own Linux system instead of running directly within Windows, macOS,
or the installed Linux system.

### Project NOMAD

NOMAD offers a setup wizard and Kiwix content, but targets a comparatively
powerful Linux host or Windows through WSL2. It is a server platform, not a
small portable encyclopedia drive.

## Dataset comparison

Wayfarer Public 0.7 currently occupies 70,230,633,597 bytes. It contains the
complete October 2024 English Wikipedia XOWA database, 313 approved cached
Wikimedia images, portable Java runtimes, and launchers.

Current Kiwix English options observed in its official catalog include:

- Full English, images (`maxi`, February 2026): about 115 GiB / 124.0 GB.
- Full English, no images (`nopic`, March 2026): about 48 GiB.
- Full English, minimal media (`mini`, June 2026): about 12 GiB.
- Top one million, images (April 2026): about 49.4 GB.

A nominal 128 GB drive has too little comfortable headroom for the 124 GB full
image ZIM plus three readers and support files. This is why Apocalypse Drive's
128 GB preset chooses top-one-million. It is not evidence that Wayfarer should
discard the remaining articles.

## Integrity and manifests

These are separate concepts:

1. Automatic integrity verification: retain. The installer checks a SHA-256
   value after downloading each large package and refuses corrupted packages.
   This should be invisible to ordinary users except when a retry is needed.
2. Release manifest: retain in simple form. This is a machine-readable parts
   list containing version, sizes, package names, licenses, and checksums. It is
   useful for the installer, troubleshooting, updates, and redistribution.
3. Reproducible build: defer. Producing byte-identical output from source is a
   larger engineering commitment and does not materially improve the first
   public Wayfarer release.

## Recommended position

Wayfarer should not market itself as the first offline-Wikipedia USB concept.
It can be the first polished implementation we can substantiate of this narrower
promise:

> Create a complete, dependency-free English Wikipedia drive for a standard
> 128 GB USB device, with full article coverage and a deliberately useful image
> selection.

The main edition should retain all English Wikipedia articles. A top-one-million
"Lite" edition can be considered later for smaller or faster media, but should
not replace the preservation edition.

## Next technical decision

Build and test two proof-of-concept layouts before changing the public site:

1. XOWA Complete: the existing 70 GB edition, repaired and tested on supported
   hosts.
2. Kiwix Complete: current full-English `nopic` ZIM plus a curated diagram cache
   and portable readers.

Score both on Windows launch reliability, macOS and Linux viability, storage,
rendering quality, search, image integration, update difficulty, and legal
redistribution. Choose the reader only after that test.
