# Test suite: DC. — The Interactive Engineering Archive

Playwright exercises the full archive in Chromium, with Firefox and WebKit smoke tests for navigation, form state and small-screen layout. The accessibility checks use axe. The loopback server in `tests/serve.py` serves `dist/`, returns the branded page with a 404 status for missing documents, and accepts concurrent test connections.

```sh
npm ci                                     # install development tools
npx playwright install chromium firefox webkit
npm test -- --workers=4                    # every project
npx playwright test --project=desktop      # one project
SKIP_EXTERNAL=1 npx playwright test        # skip the network check of external links
npx playwright test tests/labs.spec.js -g "Federated"
npx playwright show-report                 # HTML report (playwright-report/)
```

Results are also written to `test-results/results.json`.

## Projects and tags

| Project | Viewport | Runs |
|---|---|---|
| `desktop` | 1440×900 | everything **not** tagged `@motion` |
| `tablet` | 768×1024, touch | tests tagged `@responsive` |
| `mobile` | 390×844, `isMobile`, touch, DPR 2 | tests tagged `@responsive` |
| `firefox`, `webkit` | 1440×900 and 390×844 | `@engines` project, history, palette and notebook smoke checks |
| `reduced-motion` | 1440×900, `prefers-reduced-motion: reduce` | tests tagged `@motion` |

Tests that loop over widths internally (overflow at 320/390/768/1024/1440/1920, CLS at 320) run in `desktop` only.

## What is covered

Each spec file names the source of its contract.

- **`routing.spec.js`** covers audit §7 items 1–6 and 37, and design-system §12.6:
  - direct loads of every page;
  - the `#lab/<key>?…` router;
  - restoring after reload;
  - invalid parameters;
  - the study-link and crumb round trips;
  - Back/Forward;
  - restoring the gallery plate and lab after Back;
  - deep links landing in view (not under the sticky header).
- **`labs.spec.js`** covers the Kaaran, AVL and federated labs (audit §3.1, §3.2, §3.6; items 7–27):
  - Kaaran values in English and Marathi, checked against `assets/kaaran-evidence.js`;
  - the LL and LR cases end at root 20 with children 10 and 30, the in-order sequence is preserved, and Undo works;
  - federated: equal counts give 3, `1,1,2` gives 3.5, `0,0,0` gives guidance, invalid inputs are flagged, results are exact or marked approximate, and the percentages total 100;
  - rapid rotations;
  - reduced motion.
- **`notebook.spec.js`** covers audit §3.3–3.5 and items 28–31:
  - the AVL replay table;
  - all 18 benchmark renders, checked against `assets/tree-benchmarks.js`;
  - all 9 RRF tables, recomputed independently;
  - fragments, fallbacks and pinned source commits.
- **`a11y.spec.js`** covers §14:
  - axe with zero violations on every page, including the dialogs and the Marathi state; it uses the WCAG 2.2 AA and best-practice tags plus `label-content-name-mismatch`;
  - one h1 and the landmarks;
  - the skip link;
  - `alt`, `width` and `height` on images;
  - focus rings.
- **`keyboard.spec.js`** covers §10.1, §10.2, §10.13 and §12:
  - gallery ARIA and its four tab stops;
  - arrow keys, Home and End, and clamping;
  - rapid Next/Prev;
  - the gallery fitting the viewport at 1440×900;
  - the mobile strip;
  - the palette: Ctrl+K, Esc, focus return, the combobox, and being ignored inside inputs;
  - the overlay's focus trap and Esc;
  - Work, Contact and Résumé staying visible in the header;
  - copying the email address.
- **`layout.spec.js`**:
  - no horizontal overflow at 6 widths on every page;
  - CLS < 0.01 at load, and at 320;
  - the home-page height, which is reported only.
- **`motion.spec.js`**:
  - under reduced motion, zero running animations 300 ms after load, after scrolling and after each interaction;
  - zero rAF calls at idle;
  - no infinite animations;
  - only transform, opacity, clip-path or stroke-dashoffset are animated;
  - the reduced-motion and view-transition opt-outs exist.
- **`robustness.spec.js`**:
  - zero console errors, page errors, failed requests and HTTP ≥ 400;
  - no duplicate ids;
  - an internal link crawl over href, src, srcset, og:image, `url()`, URL strings in JS and the `#fragment`/`#lab/<key>` targets;
  - every sprite id exists;
  - external links: annotated, failing only on 404 or 410, and never failing on the LinkedIn or LeetCode bot walls;
  - images: lazy loading and their intrinsic ratio;
  - slow fonts and slow images, each delayed 1.5 s: the h1 must be readable at first paint and CLS must stay below 0.01;
  - the no-JS fallbacks.
- **`content.spec.js`**:
  - no glyphs outside the font subsets, in rendered text or in the HTML source;
  - no held, removed or private claims from ledger §0, §6 and §7;
  - JSON-LD that parses and contains no email or phone;
  - head metadata;
  - "synthetic" labelling;
  - 404 safety.

## Writing tests here

- **Target contracts, not styling.** Use ids, `data-*` attributes, roles, accessible names and URL formats (audit §2). A few legacy classes are themselves JS contracts and may be used: `.study-link`, `.detail .crumb`, `.plot-row`, `.weight-plot`.
- **Use `load(page, url)` from `_support.js`** whenever a URL differs from the current one only by its `#fragment`. A plain `page.goto` would then be a same-document navigation and would not re-run the page scripts.
- **Controls that are `aria-disabled` but still focusable** (gallery Prev/Next, rotate buttons) need `click({ force: true })`. Playwright treats `aria-disabled="true"` as not actionable.
- Keep diagnostic outputs in the ignored test report directories or a temporary directory.
