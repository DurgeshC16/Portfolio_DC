# Remaining work

A checklist of everything still needed from Durgesh to finish the portfolio: things only you can supply, decide or fix. The redesign itself is implemented on the `redesign/interactive-archive` branch.

- **Living document.** Content reviewed 23 November 2026. The later decisions in the content ledger, §0b, supersede older project notes.
- **Detail and sources.** Each item points to its source in `docs/content-ledger.md`, where you'll find the evidence behind it.
- **Site placeholders.** In the site's HTML, anything waiting on you is marked with a `<!-- TODO(durgesh): … -->` comment. Find them all with:

```sh
grep -rn "TODO(durgesh)" dist/
```

---

## 🔴 Do first: security and privacy

- [ ] **Revoke the leaked Kaggle API token.** A token starting `KGAT_` is hard-coded in `setup_kaggle.bat` in `DurgeshC16/Autism-Detection-using-FL` and in `Niraj-Chavan/EDI-autistic`. To clean it up:
  1. Revoke the token in Kaggle → Settings → API.
  2. Remove the file from git history, for example with `git filter-repo --path setup_kaggle.bat --invert-paths`.
  3. Force-push.

  Treat the token as compromised even after you've cleaned it up. The portfolio won't link either repo until this is done. *(Ledger S1)*
- [ ] **Remove the children's facial photos.** About 300 of them sit in the `Test/` folder of both federated-learning repos. Either remove them or confirm the dataset licence allows redistribution. *(S2)*
- [ ] **Check the image licences in `Oral-Cancer-AI`.** It contains clinical images whose licences haven't been verified, including one third-party credited photo. *(S3)*
- [ ] **Decide whether the public résumé PDF should show your phone number.** *(S9, Q-15)*
- [ ] **Watch Kaaran's live-demo LLM spend after launch.** It's capped at $10 per process. *(S4)*

## 🟠 Résumé alignment

- [x] **Public PDF.** The one-page download at `dist/assets/Durgesh-Chaudhari-Resume.pdf` is a selectable, tagged PDF. The project-folder original and private résumé variants were left unchanged. Existing contact details, profile links, education and section order were retained. The launch-time phone preference remains open above.
- [x] **Credentials and research.** The PDF names the verified Deep Learning Specialization, corrects the AI-900 credential ID, qualifies AB-100 as an exam pass, and identifies the granted patent and the ICNPCV paper. The accepted papers are described alongside their projects.
- [x] **Federated learning and the tutor.** The download limits the federated-learning summary to supported method, artifact and publication details. It scopes the tutor to team work, repository facts and co-authorship. Earlier disputed accuracy, gap, sample size, latency, caching and pilot claims were removed.
- [x] **Kaaran.** The download identifies the four-person team and Top-30 build-stage selection, scopes 22/22 to first-generation taluka briefs, and reports the recorded suite as 304 passed plus three live-API tests skipped.
- [ ] **Other résumé variants.** Independently reconcile the private Elip and Eaton documents if they are used in applications. The Elip wording and template dates, Eaton team attribution, and the incorrect original credential ID remain separate from the public download.
- [ ] **Other project descriptions.** For future résumés that feature CertiVault or Cascade-XID, identify their course teams and individual responsibilities accurately. Keep the Cascade deck's placeholder results unpublished.

## 🟡 Evidence to supply (unlocks content that is currently held back)

### Research and IP
- [x] **IConDeepCom 2026 paper.** The site uses **Accepted**, paper ID ICONDEEPCOM26_079, and the ordered author list from the camera-ready manuscript. Remaining optional evidence is the presentation certificate or acceptance email and a public proceedings link when available.
- [ ] **Tutor manuscript.** The author-supplied accepted-manuscripts folder supports the approved **Accepted** status. The paper gives the title and ordered authors. Supply a venue, date and independent acceptance record before adding those particulars. The filename alone cannot establish a venue.
- [x] **ICNPCV paper:** Published (DOI) and Presented (e-certificate, 17–18 Jul 2026). Done.
- [ ] **Patent (optional).** Which register is the screenshot from (it looks like South Africa's CIPC format)? A public link would let the site show an evidence link.

### Federated learning (results currently hidden on the site)
- [ ] **Decision needed: publish the paper's accuracy?** The camera-ready paper reports **95.2% for EfficientNetB4** and **90.1% for EfficientNetB0**. But the public dashboard checkpoint is a **B0** renamed from `acc_0.9018` to `acc_0.9518` (commit `b88feb8e`), so the dashboard and résumé attach the B4 number to the B0 model. Options:
  - fix the dashboard label/filename and let the site cite the paper's figures with model names;
  - keep the results hidden.
- [ ] **Training material.** Share the Flower training code, notebook or logs (3 clients, 80 rounds, per-client accuracy).
- [ ] **Datasets.** Names, sources and per-client sizes of the 3 datasets (12,423 images in total).
- [ ] **Your role.** Every public code commit is by Niraj. *(Q-3)*

### Team projects with Niraj Chavan
- [ ] **Tree tutor.** Which files or features did you build? Do you have private history (a branch, zip or Drive copy)? What are the sources for the résumé metrics? *(Q-4)*
- [ ] **SmartCare, Review Summarizer, Exam Management System.** What did you design, write or test in each? Which TEAM.md role (P1–P4) did you hold in Review Summarizer? *(Q-6)*
- [ ] **Credit wording.** Confirm Niraj agrees with how he is credited.

### Kaaran
- [ ] **AI-assistance wording.** Is this right: "built with Claude as an AI coding assistant; I specified, reviewed, tested and integrated"? *(Q-7)*
- [ ] **Teammates.** Names and roles of the other members of Team EASY COMPANY, if they agree to be named.
- [x] **Hackathon:** the Top-30 selection e-mail (10 Oct 2026) was found. Still open: the Top-10 or finale outcome, and a public announcement link if one exists.
- [ ] **Demo video.** A public link to the demo video, if there is one.

### CertiVault
- [x] **Team identified.** The C1_G3 course materials name Anjali Chandewar, Durgesh Chaudhari, Falguni Chaudhari and guide Prof. Rahul Diwate. The website reports repository maintenance and the 37 named commits plus nine under a project identity. Individual team responsibilities or confirmation of the alias can be added if documented. *(Q-8)*
- [ ] **CI.** Get it green again (it has failed since 2026-11-18).
- [ ] **Test count.** Reconcile it: the repo states 590, 512+78 and 690+78 in different places.
- [ ] **Screenshots.** Capture them from the seeded demo dataset, or deploy a public demo. The supplied report and slide deck contain text, diagrams and mock certificate illustrations. Neither contains a screenshot of the running application.
- [ ] **GitHub description.** Add one that names CertiVault on `Web_Tech_CP`, or rename the repo.
- [ ] **Paper draft.** Is it submitted anywhere?

### Cascade-XID
- [ ] **Default branch.** Make `master` the default. Visitors currently see an empty skeleton on `main`.
- [ ] **Licence and results.** Add a licence. Say when the E1/E3 experiment results will exist (the site marks the project "In progress"). *(Q-10)*

### Oral-Cancer-AI (kept off the site until these are fixed)
- [ ] Event name, date, team and result. *(Q-9)*
- [ ] Fix the README's stack (ResNet18 / PyTorch / Flask) and remove the "XX%" table.
- [ ] Confirm the licences of the training images.

### Certifications
- [ ] **AI-900.** A Microsoft Learn share link (needs a public profile).
- [ ] **AB-100.** A transcript share link, and which prerequisite you are pursuing. *(Q-11)*
- [x] **Coursera:** 49 verify URLs confirmed. The site links the Deep Learning Specialization, IBM Full Stack Software Developer and Google AI certificates. Duke DeFi and HKUST FinTech are available as optional secondary records.
- [ ] **LeetCode.** A badge URL or dated screenshot. The profile blocks automated checks.
- [ ] **LinkedIn.** Export your profile (Profile → More → Save to PDF) and put it in `C:\Programming\Portfolio\`, so experience, honours and certifications can be cross-checked.
- [x] **"Achievements and Certificates Stuff" folder:** found in `_research/` and used. Its two "Other certificates" subfolders are empty; add files there if you meant to include more.

## 🟢 Repository housekeeping

- [ ] Fix or archive the misleading repo descriptions *(Q-13)*:
  - `Autism-Detection-using-Federated-Learning` (its README describes handwriting recognition);
  - `Autism-Detection-using-FL` (says EfficientNetB4; the checkpoint is EfficientNetB0);
  - `SmartCare-Software-engineering-project`;
  - the `Forensic-Handwriting-AI` and `Memori_OpenSourceHack` forks (0 commits by you).
- [ ] Decide on skills *(Q-14)*:
  - add PHP (CertiVault)?
  - keep Flower, Redis, MongoDB, Supabase and Next.js, which no public code by you shows?
- [ ] Decide how case studies should describe AI coding-agent use in CertiVault, Cascade-XID and DS_Actual_CP. *(Q-12)*
- [x] **Image provenance.** The SmartCare capture was taken from the genuine React symptom-selection screen after the test browser switched offline, with no patient input. The Review Summarizer capture uses the genuine extension UI and a synthetic API response. Its ratings are illustrative fixtures. A pinned-revision recapture would be required to establish the exact revision of these existing image files. *(Q-17)*

## 🔵 Launch and deployment

- [ ] **Canonical URLs.**
  - [x] The portfolio uses the résumé’s `in.linkedin.com` profile URL in links and structured data.
  - Choose the final domain, then fill in `canonical`, `og:url`, absolute `og:image` URLs and `sitemap.xml`. *(Q-16)*
- [ ] **Review and merge.** Review the branch `redesign/interactive-archive` on GitHub, then merge it into `main` (or ask me to open a pull request).
- [ ] **Deploy to Vercel.**
  1. Import `DurgeshC16/Portfolio_DC`.
  2. Leave Framework preset set to "Other" with no build command.
  3. Set Output directory to `dist`.

  `vercel.json` in the repo sets this up.
- [ ] **After deploying:**
  - Run Lighthouse on the live URL, mobile and desktop.
  - Test link previews (LinkedIn Post Inspector, opengraph.xyz).
  - Click through every external link once.
- [ ] **Optional usability check.** Ask one recruiter and one engineer to find a Kaaran source record and a tree-benchmark result, and note where they hesitate. *(docs/portfolio-enhancement-plan.md)*

## ⚪ Site work deferred (implementation, not content)

These are possible extensions to the existing implementation.

- [ ] **Case studies.** Both featured case studies exist. Add a verified account of individual technical responsibilities when supplied.
- [ ] **CertiVault visuals.** Replace the diagrams with real UI captures once screenshots exist.
- [ ] **Federated results.** Add a results chart only if real per-round metrics are supplied.
- [ ] **Notebook.** Optionally extend it with more of DS_Actual_CP's 375 recorded benchmark rows (search, delete and range operations), with the single-run caveat.
