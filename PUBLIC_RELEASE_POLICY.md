# Public release policy

## Intended uses

The public edition must remain redistributable when:

1. downloaded without charge from a donation-supported website;
2. copied by third parties;
3. preinstalled on physical media sold for money.

An item therefore needs an express license or public-domain basis that permits
commercial redistribution. "Free to access," educational use, and
noncommercial permission are not sufficient.

## Inclusion test

Every payload item must satisfy all of these conditions:

- its source and version are recorded;
- commercial redistribution is permitted;
- required license text, notices, and attribution are bundled;
- its local identity is verifiable by hash;
- no unresolved restriction or contradictory notice remains.

For Wikimedia media, the automated release gate accepts only public domain,
CC0, CC BY, and CC BY-SA records confirmed against the current source page.
Custom attribution grants, GFDL-only files, OGL files, IGO variants, files with
missing required creator credit, and records whose remote hash changed are
excluded until reviewed individually.

## Separation rule

`E:\PreservationProject` is a read-only source. The build script copies only
named components into a separate output directory. It never deletes, moves, or
renames source files. `PDFLibrary`, `WesCecil`, `Quarantine`, private portal
catalogs, private documentation, and XOWA user state are not copied.

## Branding and warranty

Wikipedia, Wikimedia, XOWA, Eclipse Temurin, and ImageMagick remain the marks of
their respective owners. Inclusion does not imply endorsement. The archive is
provided without warranty and is not professional medical, legal, or safety
advice.

