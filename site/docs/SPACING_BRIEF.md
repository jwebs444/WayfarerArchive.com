# Wayfarer Responsive Spacing Brief

Date: 2026-08-11

## Review record

- Repository: `jwebs444/WayfarerArchive.com`
- Site root: `site/`
- Base revision: `698cea0f6db0643613c8c39511928ba67ebeb550`
- Live source branch: `main`
- Routes reviewed: `/`, `/build`, `/founding-batch`, `/build-beyond`, `/creator`
- Rendering surface: Codex in-app Chromium with explicit CSS viewport overrides
- Publication status at authoring: local candidate verified and approved for release

The brief is stored with the exact candidate reviewed and released. The base
revision above identifies the pre-pass state.

## Composition contract

The homepage retains its exact three-chapter desktop structure:

1. sanctuary hero: one viewport;
2. paired Build and Buy chambers: one viewport;
3. questions plus project origin plus footer: one viewport.

At 1440 x 900 this remains 900 + 900 + 812 + 88 = 2700 CSS pixels.
The same three-viewport ledger was confirmed at 1366 x 768, 1920 x 1080,
and 2560 x 1440.

Phone layouts use natural editorial flow. Long sections may exceed one
viewport rather than compressing type or clipping content. The final project or
route callout and footer form one exact closing viewport where content permits.
The Creator principles intentionally exceed that target because four readable
entries require more room.

Inner-route desktop totals remain content-led. Forcing every route to an integer
height would introduce artificial whitespace or make useful content secondary.
Clean section reveals, readable line grouping, and stable crops take priority.

## Baseline findings

- At 390 x 844, the homepage approach expanded to about 390 pixels inside a
  375-pixel document. The sanctuary concealed the overflow and visibly clipped
  `KNOWLEDGE`.
- The specific `.approach h1` minimum overrode the generic phone heading rule,
  while the grid item's automatic minimum width prevented shrinking.
- At 844 x 390, width-derived top padding made the homepage hero 876 pixels
  tall. The first viewport showed the image and header but not the message or
  primary action.
- Inner heroes at the same landscape size ranged from 709 to 827 pixels, with
  important copy and status content below the fold.
- Phone navigation targets were approximately 23 pixels high and Support was
  approximately 27 pixels high.
- Final phone sections and the footer were not accounted for as one closing
  composition, leaving fragments of the preceding section at maximum scroll.
- The Creator landscape title crossed the raven's focal area.
- At 4K, the fixed root scale left the otherwise correct full-screen chapters
  visually underweighted.

## Changes made

- Allowed grid content to shrink with explicit `min-width: 0` ownership.
- Added a phone-specific `.approach h1` scale that fits the longest word rather
  than relying on hidden overflow.
- Reduced phone section padding while preserving readable natural growth.
- Rebuilt phone navigation as one four-column row with 44-pixel targets and a
  44-pixel Support target.
- Paired the final phone section and 148-pixel footer into one stable viewport
  chapter where content permits.
- Vertically balanced the short final release and annex callouts.
- Added a height-aware 844 x 390 landscape composition rather than deriving
  hero depth from viewport width.
- Extended that compact landscape composition through 640-1040 pixel widths
  and heights up to 800 pixels, eliminating abrupt layout jumps at 720/721
  pixels wide and 500/501 pixels high while covering 1024 x 768 tablets.
- Tightened short-landscape inner-hero typography and margins without reducing
  normal portrait or desktop type.
- Returned Creator landscape copy to a narrow right-side field, leaving the
  raven unobstructed on the left.
- Added restrained root scaling above 3000 pixels so the 4K composition retains
  its authored density while preserving the three-chapter ledger.

## Verified matrix and measurements

Primary checks:

- 360 x 800
- 375 x 667
- 390 x 844
- 430 x 932
- 844 x 390 landscape
- 720 x 500 and 721 x 500 landscape seam
- 900 x 500 and 900 x 501 landscape seam
- 768 x 1024
- 1024 x 768
- 1366 x 768
- 1440 x 900
- 1920 x 1080
- 2560 x 1440
- 3840 x 2160

Candidate results:

- No document-level horizontal overflow on any reviewed route at 360, 390,
  430, 844-landscape, 2560, or 3840 widths.
- Phone navigation targets measure 44 pixels high.
- At 360 x 800, homepage final section 652 + footer 148 = 800.
- At 390 x 844, homepage, Build, Founding Batch, and Build Beyond final section
  696 + footer 148 = 844.
- At 430 x 932, those closing compositions measure 784 + 148 = 932.
- Every hero measures exactly 390 pixels at 844 x 390 after the height-aware
  pass.
- Heroes remain one viewport across the former 720/721-width and
  500/501-height landscape seams.
- The homepage remains exactly three viewports at the four desktop/QHD
  reference sizes above.
- At 3840 x 2160, the root scale reaches 21 pixels, the hero remains one
  viewport, and the closing screen plus 115.5-pixel footer remains one viewport.

## Intentional exceptions

- Phone heroes and long editorial sections may be slightly taller or shorter
  than one viewport.
- Creator principles remain taller than the final phone chapter target.
- Build Beyond's field shelf expands naturally to protect link labels and
  explanatory copy.
- Inner-route desktop totals are not forced to whole numbers.

## Adversarial test targets

- 360-pixel headline behavior under enlarged text.
- Founding Batch status card at 844 x 390.
- Creator raven/title separation at 844 x 390.
- Long Personalize source links at high zoom.
- 3840 x 2160 inner-route line grouping and crop balance.
- Final-section alignment at maximum scroll on 360, 390, and 430 widths.

## Validation

- `pnpm test`: passed, 2/2 rendered-route tests.
- `pnpm lint`: passed.
- `pnpm deploy:dry-run`: passed with Wrangler 4.120.0.
- All five routes were rendered locally after the final CSS build.
- Adversarial review exposed the original 720/721-width and 500/501-height
  media-query seams. After correction, all five routes were rerendered at
  720 x 500, 900 x 501, and 1024 x 768 with one-viewport heroes, complete
  first-view content, and zero document-level horizontal overflow.

## Owner challenge replay for future reviews

- Wayfarer was initially treated as the portfolio gold standard, yet its phone
  heading still exceeded the document and the sanctuary visibly clipped
  `KNOWLEDGE`. A clean desktop chapter ledger never substitutes for longest-word
  and intrinsic-grid testing on phones.
- At 844 x 390, require the last meaningful first-view element: primary action
  on the homepage, complete status card on Founding Batch, and readable identity
  plus copy on every inner route. A hero box measuring one viewport can still
  hide or crop its task.
- Attack every height-aware media query at width and height boundaries. The
  720/721 and 500/501 seams are permanent regression cases, along with tablet
  heights absorbed into the compact landscape treatment.
- Creator must keep the raven and title in separate visual fields. Verify the
  crop and contrast visually rather than concluding from grid columns alone.
- On mobile, include the final callout and footer in one closing ledger and test
  enlarged text, long Personalize links, and all 44-pixel navigation promises.
