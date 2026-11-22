# Portfolio enhancement plan

**Design proposal · 21 November 2026**

**Local build status.** The Kaaran-led opening, four-project collaboration grid, AVL rotation lab and federated averaging experiment are implemented. Browser checks cover navigation, keyboard operation, shared demonstration state and six screen widths. The five-person evidence-finding exercise below is still a proposed usability study.

In the first minute, a recruiter should be able to identify what Durgesh built, how he tested it and where to inspect the evidence. Give an engineer a reason to stay longer by letting them change one input and see the result. Keep the résumé, contact details and case-study summaries directly accessible.

## The design direction

Open on Durgesh’s name and a working piece of Kaaran. A district officer’s question appears beside a small result sheet. Selecting **Inspect 3 clusters** opens the three records behind Pandharpur’s ranking, in place. The visitor has learned something about both the project and its author before reaching the first case study.

| Reference | What is visible on the site | How to apply it here |
| --- | --- | --- |
| Dousan Miao | An asymmetric light grid puts a personal introduction and contact actions alongside differently sized project previews. A phone screen makes Android Private Space recognisable even before the caption is read. | Use a light grid for collaborations and research. Give each project an artifact that explains it at a glance, such as an offline SmartCare screen or a source review beside the extension’s summary. [Dousan Miao](https://dousanmiao.com/) |
| Valentin Chevalier | Oversized initials anchor a sparse dark opening. The selected-work gallery brings one project forward, with previous and next controls. The Five Keys page identifies the work performed before expanding into project details. | Give one engineering demonstration visual priority at a time. Carry its title and selected state into the case study, then show team credit, Durgesh’s confirmed role and the evaluation. [Portfolio](https://www.valentin-chevalier.com/) · [Five Keys case study](https://www.valentin-chevalier.com/five-keys) |

### First screen

On desktop, use an ink-coloured opening with the full name on the left and a light, legible project surface on the right. Keep the existing DM Sans for controls, Instrument Serif italic for the surname, and cobalt for selections and evidence links. Use a lighter blue for links on dark backgrounds. Reserve the trefoil sculpture for the About section, where it can act as a personal signature.

| Identity | Selected demonstration |
| --- | --- |
| **Durgesh Chaudhari** | **Kaaran** · Synthetic district data |
| AI engineering · VIT Pune | Which block requires the most attention? |
| “I build AI systems that can show their work.” | Pandharpur · **Inspect 3 clusters** |
| **View résumé** · **Contact** | **Kaaran** · **Tree tutor** · **Federated learning** |

On a phone, put the name, positioning and résumé link first. Place the Kaaran question immediately below. Expand the evidence beneath its button and allow ordinary vertical scrolling. Keep all three project names available as controls. A visitor should be able to reach the tutor without discovering a swipe gesture.

### What follows the opening

| Section | Visitor experience |
| --- | --- |
| Selected demonstration | Switch the same surface between a district evidence sheet, a manipulable tree and a three-client averaging diagram. Give each a single primary action and a direct case-study link. Returning from a case study restores the previous selection. |
| Collaborations | Use a wide SmartCare tile showing an offline workflow, an adjacent Review Summarizer excerpt and a compact exam-management entry. Link to the tree tutor from this collection as well, and credit Niraj Chavan on all four collaborations. Capture original project screens when available. |
| Research | Present the federated-learning paper as a bibliographic entry with title, venue, year and available author record. Place the paper and patent counts here, alongside their source. Put Kaaran’s test count in its case study and CGPA beside education. |
| About and contact | Pair the trefoil with a short personal account of an engineering decision. End with internship interests, email, LinkedIn and a downloadable résumé. |

### How movement earns its place

Use a short crossfade when switching projects. Opening Kaaran evidence should align the count with the first source row. A tree rotation should move the same labelled nodes to their new positions so the visitor can follow node 20 as it becomes the root. Keep the comparison figures and all navigation readable while these transitions run. Under reduced motion, show the completed state immediately. Use native links, visible focus and buttons for every action.

## First release candidate — Kaaran’s evidence explorer

The current replay answers one district question in English and Marathi. The first improvement should let a visitor examine the reasoning behind that answer without leaving the page.

1. **Choose a question.** Start with “Which block requires the most attention?” Add “Why does this cluster need attention?” once a matching source extract has been checked. Link directly to the first question from the homepage.
2. **Select a finding.** Selecting Pandharpur reveals its three flagged clusters. Selecting Bhalwad Khurd explains the reported 11.6-point relative decline in mathematics. Selecting Bhalpur explains its 14.7 percentage-point seasonal attendance gap. Show each measure with its own unit, comparison and period.
3. **Inspect the evidence.** Beside the answer, show the relevant workbook names, comparison periods and source link. Store a small, dated extract of the synthetic data locally so a visitor can complete the exercise even when the original service is asleep.
4. **Share the result.** Give each verified question and cluster a stable URL fragment. Opening that link restores the same selection. Switching language preserves the selected record and evidence panel.

**Acceptance test.** On a phone, a first-time visitor can identify the three clusters and explain what one figure measures. Aim for four of five test participants to find supporting evidence within 30 seconds without prompting. Check identical record IDs and values in both languages. Use a small evidence table for keyboard and screen-reader access.

## Second release candidate — tree rotation lab

The current tutor has one fixed left-left imbalance. Extend it into a short exercise with two contrasting cases. Start with the sequences `30, 20, 10` and `30, 10, 20`. Both become left-heavy at the root, but the second needs a left rotation at node 10 followed by a right rotation at node 30.

- Before each move, show the tree, the selected node and its balance factor. Let the visitor predict a rotation, apply it, undo it and replay the exercise.
- Compute the new tree and balance factors from the node structure in JavaScript. Generate the diagram and its text description from that same structure. If a move is legal but leaves an imbalance, show exactly where it remains.
- Keep the full collaborative tutor and its authorship visible beside the exercise. Label the portfolio exercise as a local demonstration.

**Acceptance test.** Both sequences finish with root 20 and children 10 and 30. Every move preserves the in-order key sequence. Undo restores the previous structure and keyboard focus. Reduced-motion mode shows the resulting state immediately.

## Third release candidate — federated averaging experiment

The current research walkthrough explains three training stages. Add a small numerical experiment in which the visitor changes one client’s sample count and predicts the aggregated model parameter.

Use explicitly illustrative client parameters of 1, 3 and 5. Equal sample counts give a weighted mean of 3. Counts of 1, 1 and 2 give 3.5. Show each client’s contribution beside the equation. Place the study’s reported accuracy and evaluation context in a separate research section.

**Acceptance test.** Both examples reproduce the stated means. A visitor can enter counts by keyboard. If all counts are zero, display guidance and wait for a positive count. Keep the full calculation available as text.

## Delivery and review

| Order | Deliverable | Review question |
| --- | --- | --- |
| 1 | A local desktop and phone prototype of the opening, with one complete Kaaran evidence trail and a working résumé link | Can a first-time visitor identify Durgesh’s field, open the résumé and find a source record? |
| 2 | The light collaboration grid, research record and case-study layouts, using verified screenshots and contribution statements | Can a recruiter distinguish Durgesh’s contribution from the team outcome and reach the relevant repository? |
| 3 | Two tutor exercises with deterministic state, undo and text equivalents | Can a visitor explain why the two cases require different rotations? |
| 4 | One weighted-average experiment, followed by mobile, keyboard, reduced-motion and loading checks across all three demonstrations | Can a visitor distinguish the illustrative calculation from the study’s measured results? |

Build the first prototype in the existing HTML, CSS and JavaScript. Use CSS Grid for the two homepage layouts and load each exercise’s code when needed. Keep project titles, contribution statements, technical skills, evaluation summaries, résumé and source links in the initial HTML. Verify that opening a project URL directly and using the browser’s Back button both work. Check the first screen at 320, 390, 768 and 1440 pixels, with 200% zoom, and with the external project service unavailable. Record the device and network profile when checking the proposed 2.5-second mobile largest-contentful-paint target.

## Decisions for discussion

- Use the current trefoil-led homepage as the comparison for the proposed Kaaran-led opening. In five short sessions, record time to the first source record and whether visitors can describe Durgesh’s role. Use the result to decide which opening ships.
- Which parts of each collaborative project did Durgesh personally design, implement or evaluate? Confirm these before expanding individual contribution statements.
- Which research records can be linked directly? Prioritise proceedings entries and the patent record when identifiers are available.
- After the local version is reviewed, decide on the final Vercel address and social preview. The static site in `dist/` is the handoff. A Vercel project connection and deployment are separate future actions.

## Engineering notebook and next review

The local notebook now links the C++ binary-tree benchmark to its archived measurements and the collaborative Review Summarizer to its fusion implementation. Visitors can replay a small AVL insertion sequence, compare all 27 benchmark configurations, and change the retrieval scenario or search method. The homepage and both related projects link directly to the relevant study.

For the next review, ask one classmate to find the configuration where the splay tree becomes a chain and one recruiter to trace a notebook result to the original source. Record where either reader hesitates. If repeated benchmark trials become available, add their distributions alongside the archived single-run timings. A retrieval evaluation can follow when the team has labeled queries and relevance judgments.
