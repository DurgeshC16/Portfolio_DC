# Interactive archive handoff

Branch `redesign/interactive-archive` · [PR #1](https://github.com/DurgeshC16/Portfolio_DC/pull/1) into `main` · updated 26 November 2026

## Recovery and implementation matrix

At takeover the branch and remote were at `c9114b9`. The redesigned site, its responsive artwork and its browser suite existed in the working tree. The index and stash were empty. An allowlisted local checkpoint preserved all 84 changed or untracked working files and a manifest of deleted files before edits. It excludes private research, the supplied résumé original outside the checkout, dependencies and QA output.

| Component | Planned behaviour | Recovered implementation | Gap or defect at takeover | Priority | Verification |
| --- | --- | --- | --- | --- | --- |
| Hero, DC truss and first paint | Readable name, seeded assembly, pointer probe and sleep | Canvas, SVG poster, typography and reduced-motion mode present | Late fonts moved the first screen | A | Delayed-font CLS, idle frames, desktop and phone captures |
| Desktop and mobile gallery | Five bounded project choices, drag, keyboard, native snap and Back | Five genuine plates, counter, buttons and case links | An interrupted scroll could leave the deck and visible plate on different projects | A | Real swipe, interrupted navigation, ends, focus and history |
| Editorial evidence and scroll reveal | Asymmetric evidence tiles, provenance and paper transition | Bilingual Kaaran briefs, verification and retrieval artwork, project index | Some team credit used superseded wording | B | Visual section review, evidence audit, link crawl |
| Kaaran explorer and case | Bilingual records and restorable selection | Local evidence, quick/deep modes and linked records | Reading controls and source paths overflowed at narrow widths | A | 320–1920 px, source links and reload |
| AVL tutor and case | Correct LL/LR rotations, diagnosis and undo | Computational lab and diagrams recovered | SVG node names omitted the visible balance badge | A | axe, keyboard and rotation invariants |
| Federated demo and case | Change counts, inspect weighted average and zero case | Working arithmetic and labelled illustrative values | Paper status and author line were stale | A | Lab and routing suites, ledger audit |
| CertiVault and notebook | Issue/verify case, AVL replay, recorded benchmarks and retrieval scores | Both pages, actual algorithms, provenance and navigation recovered | CertiVault team credit needed correction | A | Notebook tests, source checks and linked navigation |
| Research, About and résumé | Publication statuses, credentials and credible attribution | Editorial sections and downloadable résumé present | Research, patent and credentials predated ledger §0b | A | Compare text and PDF against approved record |
| Contact, navigation, search | Footer email, copy, overlay and searchable Ctrl/Cmd+K palette | Controls, focus handling and destination index present | Verify browser history, copy failure, no-JS and touch paths | B | Keyboard and robustness suites |
| Cursor, transitions, progress | Fine-pointer feedback, cross-page transition and case progress | Native browser enhancements present | Browser support and motion budgets needed measurement | B | Motion tests and browser smoke checks |
| Accessibility and responsiveness | Semantic controls, reduced motion and usable layouts | Recovered browser suite and six-width checks | Tutor names, Kaaran overflow and slow-font shifts | A | axe, six widths, CPU/paint observations |
| SEO and static hosting | Accurate page metadata, preview and real nested 404 | Pages and metadata present | Missing social image, static output settings and nested error handling | B | Internal asset crawl, HTTP status and 1200 × 630 preview |

The earlier QA report recorded 266 passes, two skips and 16 failures. At takeover four representative failures reproduced locally: the tutor’s accessible names, Kaaran overflow, missing social-preview image and slow-font shift on the home page. All four failures were corrected.

## Delivered

- Recovered the seven-page static site, the truss and typography, five gallery plates, editorial evidence grid, three working labs, notebook, search palette and keyboard navigation. The gallery reconciles its selected project with the physical mobile scroll position after interruptions, link navigation and Back.
- Corrected tutor SVG labels, narrow-screen reading controls and credential wrapping. Slow font downloads retain the fallback font for that visit. Below-fold sheets and styles load nearer their sections.
- Applied the latest ledger decisions to the site and downloadable résumé. One paper is published and presented, two are accepted, and the hydroponics patent is granted. Team credits identify the confirmed collaborators. Federated accuracy and unsupported tutor metrics are omitted. The public PDF retains the supplied contact details, education and original profile links. The original supplied file remains outside the checkout.
- Added the 1200 × 630 social preview and a branded nested 404 with recovery links. The Vercel configuration validates against its published schema and selects `dist/` as static output.

## Release verification

| Check | Observed result |
| --- | --- |
| Full suite | `npm test -- --workers=4` completed in 3 min 32 s on 24 November. **294 passed, 0 failed, 0 flaky**. Eight planned exclusions cover four native mobile-strip checks at desktop and tablet widths. All four ran on the mobile profile. |
| Browsers and layouts | Chromium covered seven pages at 320, 390, 768, 1024, 1440 and 1920 px. Firefox and Playwright WebKit passed desktop interaction and small-screen route checks. Physical Safari remains untested. |
| Accessibility and motion | All 27 axe checks passed across the tested pages and dialog states. Focus return, skip links, keyboard gallery controls, reduced motion and idle animation checks passed. |
| Links and PDF | Internal links, fragments, sprite IDs and image sources resolved. Of 33 external destinations, 30 returned HTTP 200 and the DOI returned 202. LinkedIn and LeetCode restricted automated access. Verified the one-page PDF has selectable text, the original contact details and the original four link targets. |
| Visual QA | Inspected desktop and phone captures of the hero, gallery, evidence, labs, research and footer, plus the 320 px Kaaran case. Thirteen local captures are in the workspace’s `_qa/interactive-archive/` directory outside the repository. |
| Performance | In two cold Chromium mobile runs at 390 × 844, 4× CPU slowdown, 150 ms RTT and 1.6 Mbps down, LCP improved from 4.28 / 3.22 s to **2.01 / 2.42 s**. CLS was zero. The static preview served uncompressed assets. HTML and render-blocking CSS fell from 271,442 to 210,609 bytes. |

## Known limits and next action

The throttled mobile runs still recorded main-thread tasks of up to 132 ms, above the 50 ms goal. Total first-screen transfer remains above the 300 KB goal on the uncompressed preview. The expanded homepage measured 9,023 px at desktop width and 13,007 px at phone width, above the reporting targets of 5,200 and 6,200 px. Compression and live field performance need measurement on the eventual host.

Review PR #1 and the local captures. Choosing the public domain will allow final canonical URLs, absolute social-preview URLs and a sitemap. Author-specific contribution details, private evidence permissions and external repository remediation remain tracked in [the remaining-work checklist](REMAINING-WORK.md). Merge and deployment require the owner’s decision.
