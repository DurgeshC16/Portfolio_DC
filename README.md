# DC. — The Interactive Engineering Archive

Durgesh Chaudhari’s computer engineering portfolio pairs five project case studies with runnable demonstrations and their sources. The site is static HTML, CSS and JavaScript. Its fonts, technical artwork, illustrative datasets and downloadable résumé are served from `dist/`.

## Run locally

From the repository root, run `npm run serve` with Python 3 available. Open [the portfolio](http://127.0.0.1:8000/) and press Ctrl+C in the terminal when finished. The preview binds to the loopback interface and serves the archive’s error page for missing documents.

## Explore

- [Kaaran](dist/projects/kaaran.html) traces a synthetic finding to local evidence records in English and Marathi.
- [Tree tutor](dist/projects/tutor.html) lets visitors select a node, apply or undo rotations and inspect its balance factor.
- [Federated learning](dist/projects/federated.html) calculates a weighted model parameter from illustrative client counts.
- [CertiVault](dist/projects/certivault.html) follows a certificate from issuance through public verification.
- [Engineering notebook](dist/projects/notebook.html) includes seven AVL insertions, 27 archived benchmark runs and a reciprocal rank fusion experiment.

The homepage gallery supports keyboard navigation, dragging and touch scrolling. Ctrl/Cmd + K searches the archive. The labs and notebook encode selections in the URL. Figures and navigation have reduced-motion and JavaScript-free alternatives.

## Browser checks

Install the development dependencies and browsers once with `npm ci` and `npx playwright install chromium firefox webkit`. Run `npm test -- --workers=4`. Playwright starts its own local preview. Test reports and screenshots are ignored by Git. [Test coverage](tests/README.md)

## Release

Vercel should use the repository root with the Other preset and serve `dist/`. The checked-in configuration supplies the output directory, skips the build and preserves the 404 status for missing URLs. Domain-specific metadata and live checks are listed in the handoff.

- [Implementation status and verification](docs/CODEX-HANDOFF.md)
- [Design system](docs/design-system.md)
- [Content ledger](docs/content-ledger.md)
- [Outstanding evidence and launch decisions](docs/REMAINING-WORK.md)
- [Earlier enhancement plan](docs/portfolio-enhancement-plan.md)
