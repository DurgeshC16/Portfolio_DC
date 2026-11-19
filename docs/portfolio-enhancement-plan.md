# Portfolio enhancement plan

**Discussion draft · November 2026**

In the first minute, a recruiter should be able to identify what Durgesh built, how he tested it and where to inspect the evidence. Give an engineer a reason to stay longer by letting them change one input and see the result. Keep the résumé, contact details and case-study summaries directly accessible.

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
| 1 | One locally verified Kaaran evidence trail, reachable from the homepage | Can a visitor tell which source supports the finding? |
| 2 | Two tutor exercises with deterministic state, undo and text equivalents | Can a visitor explain why the two cases require different rotations? |
| 3 | One weighted-average experiment and its research context | Can a visitor distinguish the illustrative calculation from the study’s measured results? |

Keep project titles, contribution statements, technical skills, evaluation summaries and source links in the initial HTML. Add JavaScript to individual demonstrations as needed. Test each increment on a narrow phone, by keyboard, with reduced motion, and with the external project service unavailable. Use observed difficulties from the first five sessions to choose the next revision.

## Decisions for discussion

- Should the homepage open directly on Kaaran’s sample question, or retain the current trefoil illustration with a visible “Inspect Kaaran evidence” link? Test both with the same first-minute task.
- Which parts of each collaborative project did Durgesh personally design, implement or evaluate? Confirm these before expanding individual contribution statements.
- Which research records can be linked directly? Prioritise proceedings entries and the patent record when identifiers are available.
- After the local version is reviewed, decide on the final Vercel address and social preview. The static site in `dist/` is the handoff. A Vercel project connection and deployment are separate future actions.
