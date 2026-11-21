# Durgesh Chaudhari’s engineering portfolio

An interactive portfolio covering AI engineering, research and collaborative software projects. The website is plain HTML, CSS and JavaScript. The HTML pages, styles, script, fonts, illustrations and downloadable résumé are in `dist/`.

## Interactive projects

- **Kaaran** traces a synthetic district finding to three local evidence records. Select a cluster or change the language to inspect its figures, comparison period and source workbooks.
- **Tree tutor** lets visitors choose a node, apply AVL rotations, inspect its balance factor and undo a move. Two insertion sequences illustrate single and double rotations.
- **Federated learning** calculates a weighted average from three adjustable client sample counts. The case study also explains the stages of a training round.

Each demonstration records its selection in the URL so the same example can be reopened or shared. The collaborations section includes interface captures from SmartCare and Review Summarizer. The extension capture uses synthetic review data.

## Local preview

From the repository root, run the following command with Python 3.

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open [the local portfolio](http://127.0.0.1:8000/). Press Ctrl+C in the terminal to stop the preview. The site requires no build step, account or API key. Kaaran’s sample runs locally, and its evidence links open the original project when selected.

## Project documents

- [Portfolio enhancement plan](docs/portfolio-enhancement-plan.md) — proposed interactions, implementation order and decisions for review.
- [Original website plan](docs/Durgesh_Chaudhari_Portfolio_Plan.docx) — the approved design brief.
