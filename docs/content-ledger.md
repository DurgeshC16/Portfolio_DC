# Content ledger: Durgesh Chaudhari portfolio redesign

Single source of truth for every public claim on the redesigned site. If a sentence is not in an "Approved public wording" cell, or does not restate one, it does not ship.

- Compiled: 2026-11-23, from the research reports in `C:\Programming\Portfolio\_research\`: `audit-code.md`, `kaaran.md`, `tutor.md`, `federated.md`, `federated-metrics.json`, `collabs.md`, `durgesh-repos.md`, `publications.md` and `resume.md`. Also read: the existing site copy in `durgesh-portfolio/dist/` (`index.html`, `projects/*.html`).
- Nothing here was re-measured. Where a report re-derived a figure, that is stated. Source citations use the reports' notation: `repo:path:line @commit`. Line numbers refer to the commit named in each report.
- Where two reports disagree, this ledger follows the later and more specific one. The one case so far: `federated.md` §4 says a web search found no "IConDeepCom 2026" event, but `publications.md` §1 found and captured the official site. The conference **is** real; the paper is what remains unverified.

---

## 0. Decisions from Durgesh (2026-11-23) — these OVERRIDE anything below

1. **Patent → publish as filed.** Durgesh chose to show the verified facts. Approved wording: "Co-inventor · Patent application 2025/09215 · *A System Consisting of Solar Technology with Hydroponics* · Filed 31 Oct 2025." Status chip: **Filed**. Never "granted" (TODO: upgrade when Durgesh supplies a grant number or certificate). Do not state a jurisdiction.
2. **Federated-learning results → HOLD.** Do not publish 95.2% / 90.18%, 12,423 images, the 1.8 pp gap, round 33 or 80 rounds anywhere on the site. The case study covers problem, method (FedAvg, EfficientNetB0 transfer learning per the checkpoint config), architecture, ethics/limitations and the illustrative FedAvg lab. Results get a minimal visible note ("Results will be added with the published paper.") and an HTML `<!-- TODO(durgesh): ... -->` comment.
3. **Team projects in Niraj Chavan's repositories (tree tutor, Review Summarizer, SmartCare, Exam Management) → team credit + repo-verified facts only.** Wording: "Team project with Niraj Chavan · repository by Niraj Chavan". Use only facts verified in the repos (e.g. tutor: 6 tree structures with deterministic validators, 34 FastAPI routes, 122 pytest functions, a 52-concept / 94-edge prerequisite graph, Gemini with rule-based fallbacks). Omit the résumé-only tutor metrics (240 cases/100%, 34.1 ms, Redis 87%, 23-user pilot, "7 agents", "36 concepts"). Personal-contribution slots get `<!-- TODO(durgesh): describe your part -->` comments, not visible placeholders.
4. **IEEE ICNPCV 2026 paper → confirmed as Durgesh's; list as Published** with the full author list and DOI exactly as in row P2 below.
5. **IConDeepCom 2026 federated paper:** list as co-authored, with the conference verified as real; status word only per evidence (no DOI exists). The third paper is not listed (TODO). Replace bare counters ("3 papers", "1 granted patent") with listed items.

### 0b. Evidence from Durgesh's local folders (2026-11-23) — supersedes §0 where they differ
Sources: `_research/local-docs.md`, `_research/certificates-a.md`, `_research/certificates-b.md`, and the folder `_research/Achievements and Certificates Stuff/` that Durgesh supplied. Personal documents stay out of the repo.

6. **Patent → GRANTED** (this supersedes §0.1). Durgesh supplied a patent-register record showing:
   - application 2025/09215, lodged (complete) 2025-10-31, accepted 2026-06-05 and **granted 2026-06-24**;
   - applicant Vishwakarma Institute of Technology;
   - eight inventors, including CHAUDHARI, Durgesh Nitin;
   - IPC A01G.

   Approved wording: "**Granted patent** · *A System Consisting of Solar Technology with Hydroponics* · No. 2025/09215 · granted 24 Jun 2026 · co-inventor (one of eight; applicant: VIT Pune)." Status chip: **Granted**. Do not state a jurisdiction (TODO(durgesh): confirm the register and add a public link).
7. **Papers** (Durgesh's folder is titled "Accepted Research papers"):
   - **P2, ICNPCV 2026 (IEEE) → Published · Presented.** Use the DOI author line in row P2. The e-certificate states that Durgesh presented it at Global Academy of Technology, Bengaluru, on 17–18 Jul 2026. The STAI 2026 acceptance (paper ID 434) is the same paper, so never list it separately.
   - **P1, IConDeepCom 2026 → Accepted** (camera-ready paper ID ICONDEEPCOM26_079). Authors in order: Saraswati Patil, Durgesh Chaudhari, Niraj Chavan, Anjali Chandewar, Falguni Chaudhari. Title per the camera-ready. **Results stay on HOLD per §0.2.** The paper reports EfficientNetB4 at 95.2% and B0 at 90.1%, while the public checkpoint is a B0 relabelled 0.9518. This needs Durgesh's decision before any number is shown.
   - **P3, Neuro-symbolic tutor paper (IEEE-format manuscript) → Accepted** (per Durgesh's folder). Durgesh is 5th of 5 authors. The venue is not evidenced (the filename suggests "Incode2026_984"; TODO(durgesh): venue and date). Its metrics stay off the site (see §0.3, and its N=100 outcomes are projections).
   - The research index may therefore say "three papers": one published, two accepted. List them as items, not a counter.
8. **Certifications** (Coursera verify pages checked; each names "Durgesh Nitin Chaudhari"):
   - **Microsoft Certified: Azure AI Fundamentals (AI-900)** · earned 29 Jun 2026 · credential ID **B95FB0D40BFFDBF9**. Every résumé prints B95F80…, which is a typo; use the corrected ID.
   - **Deep Learning Specialization** · DeepLearning.AI · Nov 2026 · https://coursera.org/verify/specialization/IUL2VTFTL1RV
   - **IBM Full Stack Software Developer Professional Certificate** · Oct 2026 · 15 courses · https://coursera.org/verify/professional-cert/IRVG1NOM9YUA
   - **Google AI Professional Certificate** · Oct 2026 · https://coursera.org/verify/professional-cert/S1MQHA14ZOTD
   - Optional, secondary list: **Decentralized Finance (DeFi) Specialization** · Duke · Oct 2026 · https://coursera.org/verify/specialization/HHXV6LSHZ76U; **FinTech: Finance Industry Transformation and Regulation Specialization** · HKUST · Oct 2026 · https://coursera.org/verify/specialization/RTXLD5W53438
   - **AB-100**: "exam passed, certification pending" (RESUME).
   - **Do NOT list "Machine Learning Specialization (Stanford)".** No certificate exists; it is probably a mislabel of the Deep Learning Specialization (TODO(durgesh)).
   - Omit the individual courses and the Infosys Springboard courses. Never use `Coursera 9ZYVKBUD6GJ9.pdf`, which belongs to someone else.
9. **CertiVault is a TEAM course project** (Web Technology, group C1_G3): Anjali Chandewar, Durgesh Chaudhari and Falguni Chaudhari; guide Prof. Rahul Diwate.
   - Role wording: "Team course project; I'm the sole committer of the public repository" (46/46 commits). Never "I designed and built the platform".
   - Verdict states: use only those in the repo/deck (the deck shows **5 verdicts** and a 0–100 trust score). Check the repo before drawing "six".
10. **Cascade-XID is a TEAM Data Science course project** (TY-B5-G1): Durgesh Chaudhari, Yugant Chincholikar and Ronit Dahiwal. It is "In progress", with **no results**. The deck figures (86.2%, 0.834, 11.7%, 96.2%) are CONFLICT and placeholders, never to be shown.
11. **Hackathon:** a 10 Oct 2026 selection e-mail lists team "Easy Company" with the idea KAARAN in the Top-30 build stage (VERIFIED, private document). Do not use "Hack2Skill National-Level". Krithoathon 4.0 (VNR VJIET, 24–25 Apr 2026) is a participation certificate only.
12. **LinkedIn:** use https://in.linkedin.com/in/durgesh-chaudhari-420408331 (the form used on all of Durgesh's résumés).

---

## 1. Status vocabulary

| Status | Meaning | Publish? |
|---|---|---|
| **VERIFIED** | A public source a visitor can open confirms it. The research also checked it: by reading the code, re-deriving it from recorded data, observing it on the live demo, or finding a third-party record. | Yes, with the approved wording. |
| **VERIFIED (self-reported)** | A qualifier on VERIFIED. A public document in Durgesh's own repository states it, but the research did not reproduce it (tests not run, eval not re-run). | Yes, but only with attribution ("the project log reports …"). Never as a bare headline number. |
| **RESUME** | The résumé states it. No evidence contradicts it, and no public source can confirm it. | Only with the approved wording, which is usually softer than the résumé. Where marked **HOLD**, wait for Durgesh. |
| **CONFLICT** | Evidence contradicts the claim or casts real doubt on it. | **No.** It stays off the site until Durgesh resolves it with primary evidence. |
| **UNKNOWN** | The information is missing. It is a TODO for Durgesh. | No. Leave the slot out rather than show a placeholder. |

Status words for research items (§4) map onto evidence as follows:

| Word | Evidence required |
|---|---|
| **published** | A DOI or an official proceedings entry. |
| **presented** | A participation or presentation certificate, or a programme listing that names the paper. |
| **accepted** | An acceptance email or notification. |
| **filed** | A public application number in a patent register. |
| **pending** | The candidate's own transcript or a share link showing an exam passed and a credential not yet issued. |
| **granted** | A grant record (patent number, grant date, register URL or certificate). **There is none today.** |

House style for copy: concrete and modest. Prefer the active voice and avoid adjectives like "robust", "cutting-edge", "seamless" and "powerful". Durgesh's own work is written in the first person ("I built…"). Team outcomes are written as team outcomes ("The team…"). Every metric carries its scope: the dataset, the number of runs, and who measured it.

---

## 2. Identity and contact facts

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Name: Durgesh Chaudhari | VERIFIED | résumé; GitHub `DurgeshC16`; Crossref DOI 10.1109/icnpcv69434.2026.11708952 (name and affiliation match) | Durgesh Chaudhari |
| B.Tech Computer Engineering, VIT Pune, Sep 2024 – June 2028 | RESUME | resume.md:10 | B.Tech Computer Engineering, VIT Pune · 2024–2028 (expected) |
| VIT Pune = Vishwakarma Institute of Technology, Pune | VERIFIED | vit.edu domain of his email; the affiliation on the Crossref record (publications.md §1 P2) | Vishwakarma Institute of Technology (VIT), Pune |
| CGPA 8.94 | RESUME | resume.md:7,10 | CGPA 8.94 |
| "Pre-final-year" student | RESUME (consistent with dates) | resume.md:7 | Third-year B.Tech student (2026–27) |
| Class XII 86.00% (DNCVP Jalgaon), Class X 88.40% (VPEMS Jalgaon) | RESUME | resume.md:11-12 | Not on the site (low value). It can stay in the résumé PDF. |
| Location: Pune, India | RESUME (site copy; consistent with VIT Pune) | dist/index.html:138 | Pune, India |
| Seeking AI internships | RESUME | resume.md:7 | Looking for an AI engineering internship. |
| Email (public): durgesh.chaudhari24@vit.edu | RESUME | resume.md:4; dist/index.html:854 | durgesh.chaudhari24@vit.edu |
| Personal commit email (durgeshnc999@…) | VERIFIED (git) | git shortlog in every DurgeshC16 repo | **Do not publish.** |
| Phone +91 86250 92950 | RESUME | resume.md:4 | **Not in site HTML.** It is already exposed in the résumé PDF; see §6, S9. |
| GitHub: https://github.com/DurgeshC16 | VERIFIED (HTTP 200) | audit-code.md §5 link table | github.com/DurgeshC16 |
| LinkedIn: /in/durgesh-chaudhari-420408331 | RESUME (authwall, HTTP 999) | resume.md:43; publications.md §5 | Use `https://www.linkedin.com/in/durgesh-chaudhari-420408331`. The site uses `in.linkedin.com`; pick one form for the links and the JSON-LD (Q-16). |
| LeetCode: https://leetcode.com/u/strangeDC/ | RESUME (Cloudflare 403) | resume.md:44; publications.md §4 L | "Algorithm practice on LeetCode" plus the link |
| Positioning line "I build AI systems that can show their work." | Copy (not a factual claim) | dist/index.html:86 | Keep. It matches Kaaran's verified design. |
| Résumé summary: "builds LLM-powered and multi-agent AI systems end to end" | RESUME (Kaaran supports it; the tutor's multi-agent work is not attributable to him) | resume.md:7 | "I build LLM applications where code, not the model, is responsible for the facts." Kaaran supports this directly. |
| Résumé summary: "Three conference papers and one granted patent" | **CONFLICT** | publications.md §0, §2 | **Do not publish.** See §4. |

### Skills (publish only those with evidence; this is the evidence map)

| Skill | Status | Evidence |
|---|---|---|
| Python, FastAPI, pandas, pytest, Docker, Claude API (tool/JSON-schema outputs), prompt caching/replay, WhatsApp Cloud API, speech-to-text/TTS (Sarvam) | VERIFIED | Kaaran (sole committer): kaaran.md §2 |
| DuckDB | VERIFIED | Kaaran v1 ingest, `src/kaaran/ingest/pipeline.py:17,486-492` |
| C++17, CMake, GoogleTest, Node/Express, D3, Chart.js | VERIFIED | DS_Actual_CP (12/12 commits): durgesh-repos.md §2.3 |
| PHP 8.2, MySQL/MariaDB, Web Crypto, OpenSSL (RSA, SHA-256), GitHub Actions | VERIFIED | CertiVault/Web_Tech_CP (sole committer): durgesh-repos.md §2.1. **PHP is not on the résumé**; add it if Durgesh agrees. |
| scikit-learn, XGBoost, PyTorch, SHAP, FAISS, sentence-transformers, Ollama | VERIFIED | Cascade-XID (sole committer): durgesh-repos.md §2.2 |
| SQL, C, JavaScript, TypeScript, React, Next.js, Flask, Node.js, JWT, Tailwind, PostgreSQL, MongoDB, SQLite, Redis, Supabase | RESUME | Listed on resume.md:15-19. Not evidenced in Durgesh-authored public code (React/Next.js/Redis/Postgres appear only in Niraj-committed repos). |
| TensorFlow/Keras, EfficientNet, MobileNetV2, OpenCV, Flower (federated learning) | RESUME | resume.md:18. **No Flower code exists in any public repo** (federated.md §0). The EfficientNetB0 checkpoint exists; no MobileNetV2 artifact does. |
| BM25, RAG | VERIFIED in Cascade-XID (FAISS RAG); BM25 only in the collaborator's Review Summarizer repo | durgesh-repos.md §2.2; collabs.md §2.3 |
| Knowledge graphs, LLM evaluation | LLM evaluation VERIFIED (Kaaran intent and brief evals). Knowledge graph: only the tutor (not attributable) | kaaran.md §4; tutor.md §4 |
| Microsoft Azure (AI-900) | RESUME | see §4 C1 |

Approved skill groups for the site (all items have evidence in Durgesh's own repos):
- **LLM engineering:** Claude API with JSON-schema plans, placeholder-constrained generation with deterministic verification, recorded-replay evaluation, RAG over FAISS, local models via Ollama.
- **Backend and data:** Python, FastAPI, pandas, DuckDB, PHP 8.2, MySQL, SQL.
- **ML:** scikit-learn, XGBoost, PyTorch, SHAP, TensorFlow/Keras (transfer learning).
- **Systems and delivery:** C++17, Docker, Render, GitHub Actions, pytest, GoogleTest.

---

## 3. Projects

Placement summary:

| Project | Placement | Condition to change |
|---|---|---|
| Kaaran | **FEATURED** | none |
| CertiVault | **FEATURED** | Ship once screenshots exist and the test-count and CI items are fixed (Q-8). Until then, it can run as a case study with an SVG diagram and no screenshots. |
| Engineering notebook | **FEATURED** (existing page) | none |
| Neuro-symbolic tree tutor | **INDEX** | Upgrade to FEATURED only if Durgesh documents his part (Q-4). |
| Federated learning ASD research | **INDEX** (research archive entry) | Upgrade only with training notebooks or logs, a resolved accuracy figure and paper evidence (Q-1, Q-3). |
| Cascade-XID | **INDEX**, labelled "In progress" | Upgrade when experiments E1/E3 have results (durgesh-repos.md §2.2). |
| Review Summarizer | **INDEX** | Durgesh's role confirmed (Q-6). |
| SmartCare | **INDEX** | Durgesh's role confirmed (Q-6). |
| Oral-Cancer-AI | **INDEX**, after the README fix; otherwise **OMIT** | Q-9 |
| Exam Management System | **OMIT** | Durgesh shows his contribution (Q-6). |

---

### 3.1 Kaaran: bilingual AI data analyst for education officers

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Built for the AI for Foundational Learning Hackathon (ShikshaNext with Anthropic), Challenge 4 "Data to Action" | VERIFIED | hack2skill.com/event/aiforfoundationallearning; Internshala listing; `Kaaran:README.md` header; `docs/PROJECT_CONTEXT.md:7` | Built for the AI for Foundational Learning Hackathon (ShikshaNext, in collaboration with Anthropic), challenge "Data to Action". |
| Team reached the top 30 | RESUME (consistent: the repo says "selected … Build stage", and the event rules make the Build stage the top 30; no public team list) | `docs/PROJECT_CONTEXT.md:7,40` @2be1d690; publications.md §3 | Selected for the hackathon's Build stage (top 30 teams). |
| Top 10 or finale result | UNKNOWN | publications.md §3 | Do not mention. |
| Team: "Team EASY COMPANY", 4 members | VERIFIED (self-reported) | `docs/PROJECT_CONTEXT.md:7`; `docs/USER_TESTING.md:17-20` | Four-person team (Team EASY COMPANY). |
| Durgesh is the sole committer (49 of 49 commits) | VERIFIED | `git shortlog -sne --all` @b6eb102 (kaaran.md §5) | I wrote every commit in the public repository. |
| Built with an AI coding assistant | VERIFIED | 46 of 49 commits carry `Co-Authored-By: Claude …` trailers; `CLAUDE.md` committed (kaaran.md §5) | Built with Claude as an AI coding assistant; I specified, reviewed, tested and integrated the system. (The exact phrasing needs confirming; see Q-7.) |
| Marathi/English, web + WhatsApp + voice | VERIFIED | live demo captures 2026-11-23; `src/kaaran/whatsapp.py`; `voice/sarvam.py` | Officers ask in Marathi or English, typed or spoken, on the web or through WhatsApp. |
| WhatsApp is production-ready | CONFLICT | README: Meta **test number**, reaches pre-registered phones only; templates needed for proactive messages (PROGRESS.md:359) | Say "a WhatsApp channel (running on a Meta test number)" or show the simulator. |
| Claude turns each question into a validated plan; doubtful plans become a clarifying question | VERIFIED | `llm/intent.py:80-125,227-243`; the live `/api/ask` reported `model: claude-haiku-5-5` | Claude turns each question into a JSON plan over a closed list of places. Code validates the plan, and anything doubtful becomes a clarifying question rather than a guess. |
| Rule-based fallback when the LLM is unavailable | VERIFIED | `llm/intent.py:196-225` | If the model is unavailable or over budget, a rule-based parser takes over. |
| Code computes every figure; the LLM never produces a number | VERIFIED | `brief/writer.py:18-38`; `brief/verify.py:5-75`; `brief/render.py:69` | The model writes sentences with placeholders such as `{{n:id}}`. Code fills in every number from an evidence pack that records its source file and rows. |
| "DuckDB/pandas engine computes every figure" | VERIFIED (with nuance) | The live block lens is pandas/numpy only; DuckDB is the store in the v1 ingest (`ingest/pipeline.py:17,486-492`) | Figures are computed with pandas (the first ingest pipeline used DuckDB). Do not say the live demo runs on DuckDB. |
| Deterministic verifier rejects digits, spelled numbers, causal wording, school names and bad placeholders; one retry, then a template | VERIFIED | `brief/verify.py:21-75`; `writer.py:126-169` | A deterministic verifier rejects generated text containing digits, number words, school names or unsupported causal claims. A failed draft gets one retry, then falls back to a fixed template. |
| Verifier caught real errors | VERIFIED (re-derived from `llm_cache`) | 9 of 11 live block-lens briefs had one retry for Marathi causal wording (`…मुळे`), recorded 2026-10-26 and 10-31 (kaaran.md §4, §6.1) | In the live demo's briefs, the verifier caught Marathi causal wording in 9 of 11 and forced a rewrite; all then passed. |
| "22 of 22 generated briefs passed the verifier on the first attempt" | VERIFIED **only for the first-generation (taluka-level) briefs** | PROGRESS.md:230; cache shows 22 first-attempt calls on 2026-10-23 | Only in the scoped form: "All 22 first-generation taluka briefs passed on the first attempt." Never imply it of the current demo. |
| One-page evidence PDF; every figure clicks through to file, sheet and rows | VERIFIED | live `/api/briefs/blocks.BPandharpur/pdf` returned a 1-page PDF; source drawer captured | Each answer has a one-page evidence brief (PDF). Clicking a figure shows the file, filter and matched rows behind it. |
| 92% intent accuracy, LLM parser, 25 questions | VERIFIED (re-derived: 23/25 from recorded Haiku outputs) | `tests/fixtures/intent_questions.json`; `llm_cache/`; scoring rule `eval/intent.py:42-43`; kaaran.md §4 | On a 25-question test set, Claude Haiku parsed 23 (92%) correctly. Both misses asked for clarification or refused rather than guessing. |
| Sonnet 100% on the same set; Haiku kept for cost ($0.0002 vs $0.0043 per question) | VERIFIED (accuracy re-derived; cost self-reported) | PROGRESS.md:339; kaaran.md §6.2 | Sonnet scored 25/25, but Haiku was kept: its misses were conservative, and the project log puts it at roughly a twentieth of the cost per question. |
| 96% with the rule tier | VERIFIED (self-reported) | PROGRESS.md:102; commit 1b14482; the test enforces only ≥ 0.8 | The project log reports 96% for the rule-based fallback on the same set. |
| 100% column mapping on an unseen layout | VERIFIED (with scope) | `synth/layout.py:1-90`; PROGRESS.md:239-241; 3 recorded mappings re-checked, 47/47 fields (kaaran.md §4) | On a held-out synthetic file layout with reworded Marathi/English headers, shuffled and junk columns, the LLM column mapper matched all 47 fields across 3 seeds. The mapper is not used by the live demo's ingest. |
| "295-test suite" | VERIFIED but stale | README:278 says 295; AST count at HEAD is 307; commit ae85be7 reports "304 passed, 3 skipped" | About 300 automated tests (307 at the final commit; the last recorded run reports 304 passed and 3 live-API tests skipped). |
| Planted-truth evaluation of the analysis engine | VERIFIED (self-reported) | PROGRESS.md:209-210, 327 | The synthetic data plants known causes. The project log reports the engine recovered all 19 on 6 seeds, and that re-checking provenance found and fixed 3 errors. |
| WhatsApp webhook signature checks | VERIFIED | `whatsapp.py:383-387` (HMAC-SHA256, constant-time compare, no unsigned mode); `app.py:326-333` | Incoming WhatsApp webhooks are rejected unless their HMAC signature matches. |
| Per-process LLM and voice spend caps | VERIFIED | `llm/client.py:9,24,95,146,149`; `voice/sarvam.py:72`; `render.yaml:19-22` | Live model and voice calls stop at a per-process spending cap. |
| Only aggregates reach the LLM; no school names in generated text | VERIFIED | `evidence.py:172` (`llm_view`); verifier SCHOOL_NAME | The model sees only aggregates, never school names. |
| Deployed with Docker on Render | VERIFIED | Dockerfile; render.yaml; live 200 on 2026-11-23 | Deployed as a Docker container on Render's free tier. |
| Answers in under 1 s once warm | VERIFIED (measured live) | 7 warm calls: 0.34–0.87 s end to end; the server reported 0.11–0.38 s (kaaran.md §4) | Once the server is warm, answers return in under a second. The free tier takes about a minute to wake after 15 idle minutes. |
| Demo data is synthetic | VERIFIED | README "Data note"; every record carries `"synthetic": true` | All demo findings use synthetic data with real Solapur block names as labels. The `/real` page shows real public aggregates (UDISE+ 2024-25). |
| No interviews with serving officers yet; Marathi needs native review | VERIFIED | `docs/USER_TESTING.md:17-20`; PROGRESS.md:337 | Use as a limitation (below). |
| Values 11.6 / 14.7 / 7.4 pp for the 3 Pandharpur kendras | VERIFIED (live API, 2026-11-23) | audit-code.md §3.6; kaaran.md §9 | Keep as in `dist/assets/kaaran-evidence.js`, labelled synthetic. |

**One-line summary (13 words):** A bilingual education-data analyst where Claude handles language and code computes every figure.

**Short description (59 words):** Kaaran answers Marathi or English questions from education officers on the web, over WhatsApp and by voice. Claude turns each question into a validated plan and writes wording with placeholders; pandas code computes the figures, a deterministic verifier checks the text, and every number links to its source file and rows. The public demo runs on synthetic district data.

**Problem.** A block education officer in Maharashtra oversees 150–300 schools. The data on them (UDISE+, attendance, teacher posts, assessments) sits in separate portals and Excel sheets that nobody joins or checks. Officers need a specific, trustworthy action, in Marathi, on a basic phone. (Source: README "The problem"; `docs/PROJECT_CONTEXT.md:15-21,45-47`.)

**Role wording (approved):** "Co-built in a four-person hackathon team (Team EASY COMPANY). I am the sole committer of the public repository and built the system with Claude as an AI coding assistant, covering the intent parser, the analysis engine, the evidence briefs, the verifier, the WhatsApp and voice channels and the deployment. The team ran user testing and prepared the pitch materials." *(The component list follows the areas his commits touch (kaaran.md §5). Q-7 confirms the AI-assistance phrasing and whether teammates may be named.)*

**Team credits:** Team EASY COMPANY (4 members; names UNKNOWN, Q-7). One teammate is a government primary-school teacher (`docs/USER_TESTING.md`). A mentor review on 24 Oct came from Central Square Foundation. Do not name the mentor without consent.

**Stack:** Python 3.11, FastAPI, pandas/numpy, DuckDB (v1 ingest), Claude Haiku (intent) and Claude Sonnet (wording), Sarvam AI speech-to-text (saaras:v4) and TTS (bulbul:v4-flash), Meta WhatsApp Cloud API, headless Chromium for PDF, Noto Devanagari fonts, Docker, Render, pytest.

**Architecture (for the SVG; from kaaran.md §3, as built on the live path)**

Nodes:
1. Officer (DEO / BEO)
2. Web app (role home, ask box, mic)
3. WhatsApp (Cloud API webhook + simulator)
4. Sarvam speech-to-text
5. FastAPI `Service.ask`
6. Code guard (wellbeing / abuse / caste-religion → fixed reply)
7. Intent parser: Claude Haiku → JSON plan
8. Plan validator + rule fallback
9. Raw files (synthetic xlsx/csv in real formats)
10. Ingest + bilingual header recognition (provenance per row)
11. Trust checks (flat runs, missing, implausible)
12. Insight engine (risk scan, diagnoses D1–D8, positive deviants, twin)
13. Action rubric A1–A13
14. Evidence pack (numbers + provenance)
15. Direct-answer templates (no LLM)
16. Brief writer: Claude Sonnet, placeholders only
17. Verifier
18. Placeholder filler + template fallback
19. Outputs: answer with click-to-source, evidence JSON, A4 PDF, MP3 summary (Sarvam TTS)
20. Replay cache + spend caps
21. Docker on Render

Edges:
- 1→2/3 "question, typed or voice"; 2/3→4→5 "voice → transcript"; 2/3→5 "text question".
- 5→6 "checked first, no AI call"; 6→7 "question + list of places"; 7→8 "JSON plan → validated (doubt → clarify)"; 8→12/15 "block, kendra, metric".
- 9→10→11→12→13→14 "raw rows → canonical tables → trusted rows → findings → actions → numbers with provenance".
- 14→15 "facts → template sentence"; 14→16 "aggregates only, no school names".
- 16→17 "placeholder prose (mr + en)"; 17→16 "fail → one retry"; 17→18 "pass or template"; 18→19 "figures filled from the pack (Devanagari digits for mr)"; 19→1 "web / WhatsApp text + PDF + MP3".
- 20↔7/16 "recorded first, live API second, capped".

Draw dashed (planned, not live): LLM column mapper in the live ingest; officer file upload; SMS fallback.

**Key decisions and challenges**
1. **The model writes words; code writes numbers.** A placeholder contract plus a deterministic verifier. Real catch: Sonnet wrote the Marathi for "because of election work" for a ruled-out cause; the verifier blocked it and the retry fixed it (9 of 11 live briefs).
2. **Clarify, don't guess.** Place names are a closed JSON-schema enum. Tests assert that a miss may ask or refuse but never analyse the wrong place (`tests/test_intent.py:17-29`).
3. **Record-and-replay for every LLM call.** It keeps tests and the public demo cheap and repeatable. User testing exposed the trade-off: unrecorded questions fell to the rule parser and gave "dummy answers", which led to the deterministic direct-answer layer (PROGRESS.md:74-117).
4. **Planted-truth synthetic data.** Generators plant known causes, so the engine can be scored against an answer key.
5. **Trust checks before analysis.** Rule-based confidence labels (STRONG needs effect + share + replication + no pre-trend). Flagged clusters only get "verify registers".
6. **A Chromium PDF service on a 512 MB / 0.1 CPU free host.** Briefs and PDFs are pre-built at image build time, and only one dataset is loaded (about 320 MB vs 630 MB).

**Limitations (publish):** All demo findings are synthetic. No serving education officers had been interviewed by 29 Oct 2026. The Marathi needs native-speaker review. Officers cannot yet upload their own files. WhatsApp runs on a Meta test number. The free host has a cold start of about a minute.

**Links**
- Repo: https://github.com/DurgeshC16/Kaaran (VERIFIED 200, MIT licence).
- Live demo: https://kaaran-vk5o.onrender.com (VERIFIED, loads 2026-11-23; add a "may take a minute to wake" note).
- Source record example: https://kaaran-vk5o.onrender.com/api/briefs/blocks.BPandharpur/number?id=n.drop.08K03 (VERIFIED).

**Visual assets** (source → suggested target; convert to WebP and pad the A4 prints):
- `_research/assets-candidates/kaaran/kaaran-desktop-source-drawer.png` → `dist/assets/projects/kaaran/source-drawer.webp` (hero: figure → file, filter, rows)
- `…/kaaran-mobile-source-drawer.png` → `…/source-drawer-mobile.webp`
- `…/kaaran-brief-print-en-a4.png`, `…/kaaran-brief-print-mr-a4.png` → `…/brief-en.webp`, `…/brief-mr.webp`
- `…/kaaran-desktop-answer-en.png` / `…/kaaran-mobile-answer-en.png` → `…/answer-cards.webp`
- `…/kaaran-mobile-whatsapp-most-attention.png` → `…/whatsapp.webp`
- `…/kaaran-desktop-answer-why-up-translit.png` → `…/translit-answer.webp`
- Existing: `dist/assets/kaaran-blocks.webp` (decorative only).
- Caption rule: every capture is captioned "Synthetic demo data · captured 2026-11-23 from the live demo". `kaaran-desktop-real-data.png` is captioned "Real public aggregates (UDISE+ 2024-25)".
- Optional figure built from recorded data: "placeholder sentence → filled sentence" for `F.risk.08K03`, next to the verifier rejection `{"F.diag.duty": {"mr": ["CAUSAL_WORDING"]}}`.

**Placement: FEATURED** (gallery + case study + the existing evidence lab).

---

### 3.2 Neuro-symbolic tree tutor

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Repository and authorship | VERIFIED | `Niraj-Chavan/nuerosymbolic-agentic-ai` @87d8dd0: 5 commits, all Niraj-Chavan, all within 16 s on 2026-10-14 (a bulk import); LICENSE credits Niraj Chavan (tutor.md §1, §4) | Team project with Niraj Chavan; repository maintained by Niraj. |
| Durgesh "built" it (résumé: "Built a 7-agent …") | CONFLICT (0 commits; no mention in any file; the public history is a re-import, so the work may exist elsewhere) | tutor.md §4 | Do not say "built". Use the team wording above until Q-4 is answered. |
| 6 tree structures: AVL, red-black, B-tree, B+ tree, heap, segment tree | VERIFIED | `core/tree_factory.py:24-29`; `trees/*.py` | Covers six structures: AVL, red-black, B-tree, B+ tree, heap and segment tree. |
| Rule-based validators check invariants after every operation | VERIFIED | `agents/validation_agent.py:24-108`; `validators/*` | After every operation, rule-based validators check the structure's invariants twice, inside the tree class and again on the exported JSON, and merge the results. |
| Gemini reasoning | VERIFIED | `llm/gemini_engine.py`; `config.py:32-34` (default `gemini-2.5-flash`) | Gemini writes explanations, Socratic prompts and quiz feedback. Every LLM path has a rule-based fallback. |
| "7-agent" | CONFLICT (the code has 9 `BaseAgent` subclasses plus 2 agent-like classes; 5 run in the operation pipeline; there is no list of 7) | tutor.md §2.1 | "A multi-agent tutor; five agents run in sequence over a shared blackboard for each tree operation." |
| "36-concept prerequisite knowledge graph" | CONFLICT (the code has 52 concepts and 94 edges; "36" appears nowhere) | `agents/misconception_engine.py:186-400` (AST count) | A prerequisite graph of 52 concepts and 94 weighted edges, with mastery that decays over time. |
| FastAPI, 30+ endpoints | VERIFIED (34 routes: 33 HTTP + 1 WebSocket) | tutor.md §2.5 | A FastAPI backend with 34 routes, including a WebSocket tutor chat. |
| React/D3.js interface | VERIFIED | `frontend/package.json`; `TreeVisualizer.jsx`; `ConceptGraph.jsx` | A React and D3 interface animates each step and draws the concept graph. |
| "Detects and repairs misconceptions" | CONFLICT (partial: detection comes from quizzes, chat and Gemini diagram grading; "repair" is a chat flag; validators only see the tool's own self-balanced trees) | tutor.md §3, §6.4 | "Tracks likely misconceptions from quiz answers and tutor conversations." |
| 100% structural-violation detection on 240 test cases | CONFLICT (no 240-case suite; only 5 violation-injection tests, all AVL) | tutor.md §3 | Do not publish. |
| 34.1 ms mean validation latency | CONFLICT (no benchmark; the docs give only a "<200 ms" target) | tutor.md §3 | Do not publish. |
| Redis caching cut repeated LLM response time by 87% (1.43 s → 0.18 s) | **CONFLICT (contradicted: the `@cached` decorator is never applied)** | `cache/redis_client.py:76-113`; grep (tutor.md §2.7) | Do not publish. Remove it from tutor.html. |
| 11 misconception patterns from 219 error events across 23 pilot users | CONFLICT (no pilot data, logs or consent records; the code defines 7 pattern types) | tutor.md §3 | Do not publish. |
| 120+ automated tests | VERIFIED (count only: 122 test functions; never run in CI; pass status unknown) | tutor.md §3 | A pytest suite of 122 test functions (most cover AVL). |
| Docker / GitHub Actions CI | Docker VERIFIED (files exist); CI CONFLICT (the workflow sits in a subfolder GitHub ignores; 0 runs) | tutor.md §2.8 | "Docker Compose setup." Do not claim CI. |

**One-line summary (14 words):** A team-built tree-structure tutor where rule-based validators check invariants and an LLM explains them.

**Short description (58 words):** A FastAPI and React/D3 tutor for six tree structures: AVL, red-black, B-tree, B+ tree, heap and segment tree. Rule-based validators check every invariant after an operation, a 52-concept prerequisite graph tracks mastery from quiz and tutor answers, and Gemini writes explanations and Socratic prompts, with rule-based fallbacks when no API key is set. Team project with Niraj Chavan.

**Problem.** Students learn balanced-tree rules by memorising rotations. The tutor checks a structure against its invariants, names the rule involved, and links the mistake to prerequisite concepts.

**Role wording (approved):** "Team project with Niraj Chavan; repository maintained by Niraj." Add a first-person contribution line only after Q-4. The portfolio's own AVL rotation exercise is Durgesh's code (all portfolio commits are his) and may say: "A local demonstration I built that follows the tutor's balance-factor rules."

**Team credits:** Niraj Chavan (repository owner, sole committer). Other members UNKNOWN.

**Stack:** Python, FastAPI, NetworkX, Gemini 2.5 Flash (`google-generativeai`), React 18, Vite, D3 v7, Zustand, WebSocket, Docker Compose (Celery/Redis optional; PostgreSQL schema present but not wired).

**Architecture (tutor.md §6.1-6.2)**

Nodes:
- Student
- React + D3 UI (Practice / Quiz / Tutor)
- FastAPI `/api` (34 routes)
- OperationPipeline over the AgentContext blackboard
- A1 Tree Execution
- A2 Validation (internal + external validators)
- A3 Diagnosis (Misconception Engine, 24 violation signatures)
- A4 Teaching (fallback bank)
- A5 Concept Graph (52 concepts / 94 edges, decay)
- A6 Quiz (55-question bank)
- Tutoring layer (meta-cognitive strategy, emotional tracker, adaptive teaching, diagnostic intelligence, curriculum architect → topological learning path)
- Gemini 2.5 Flash (with fallback)
- Dashed: Celery + Redis (optional, off by default); PostgreSQL (schema only)

Edges:
- Student→UI "insert / delete / search; quiz; chat; upload diagram"; UI→API "REST"; UI⇄API "WebSocket tutor chat".
- API→Pipeline "POST /tree/operate".
- ① A1 "execute op → tree + step log"; ② A2 "check invariants"; ③ A3 "only if violations"; A3→LLM "optional enrichment"; ④ A4 "explanation + guiding question"; A4→LLM "generate, else fallback"; ⑤ A5 "recommendations (no mastery change from the playground)".
- Pipeline→UI "tree, steps, validation, diagnosis, teaching".
- A6→A5 "graded answer → mastery up or down"; Tutoring→LLM "Socratic reply, sentiment, diagram grading"; Tutoring→A5 "repaired → mastery up"; A5→Tutoring "weak concepts → learning path".

**Key decisions:** (1) Validators are the source of truth; the LLM only explains, and every LLM path has a deterministic fallback. (2) A blackboard plus a conditional pipeline instead of agent-to-agent calls. (3) Double validation with deduplication. (4) Mastery moves only on deliberate evidence (quizzes, remediation, diagram checks), with forgetting-curve decay and mistakes propagated down the prerequisite graph. (5) Step-level explanations ("why" plus a concept tag) on every animation step.

**Limitations (if a case study is ever published):** The validators only see trees built by the tool's own self-balancing code, so the symbolic path rarely fires in normal use. A key mismatch between the diagnosis and teaching agents sends generic fallback text. No persistence (in-memory state with 4 workers). Thin tests outside AVL (none for red-black or segment tree). CI never ran. The docs drift from the code (they mention a Claude adapter and React Flow, neither of which exists).

**Links:** Repo https://github.com/Niraj-Chavan/nuerosymbolic-agentic-ai (VERIFIED 200; the "nuero" spelling is the real name). Live demo: none.

**Visual assets:** No authentic screenshots exist. Redraw an SVG from `_research/assets-candidates/tutor/ascii-architecture-agent-communication.txt` (it matches the code). Use the palette from `TreeVisualizer.jsx:11-30` and `ConceptGraph.jsx:4-11` (quoted in `assets-candidates/tutor/provenance.md`). Do **not** use `ascii-architecture-system-overview.txt` as a basis; it shows parts that don't exist. The portfolio's rotation lab (`dist/experiments.js` rotationLab) can stay as a labelled local demonstration. **Do not quote** `data/fallback_explanations.json` (its worked example is wrong; tutor.md §6.4).

**Placement: INDEX.** The rotation exercise moves to, or stays in, the notebook as Durgesh's own demonstration. Upgrade to FEATURED only after Q-4.

---

### 3.3 Federated learning ASD research

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Public code is an inference dashboard plus one checkpoint; **no federated-learning code** (no Flower, FedAvg, client/server or training scripts) in any public repo | VERIFIED | `git grep` over all commits of 4 repos (federated.md §0-1) | The public repository contains the inference dashboard and the trained checkpoint; the training code is not public. |
| Repo authorship | VERIFIED | `DurgeshC16/Autism-Detection-using-FL`: 4 commits by Niraj; `Niraj-Chavan/EDI-autistic`: 5 by Niraj-Chavan | Team project with Niraj Chavan; repository maintained by Niraj. |
| Durgesh "designed" the framework | UNKNOWN | federated.md §4 | Do not claim until Q-3. |
| 3 clients, FedAvg, cross-silo, raw images stay local | RESUME (no code) | resume.md:29 | "The study design trains across three data silos with federated averaging, so raw images never leave each silo (training code not public)." |
| EfficientNet transfer learning | VERIFIED | checkpoint `model_config`: frozen EfficientNetB0 → GAP → Dropout 0.4 → Dense 256 → Dropout 0.4 → Dense 128 → Dropout 0.3 → Dense 1 sigmoid; Adam 1e-4; binary cross-entropy; Keras 2.15.0 | A frozen, ImageNet-pretrained EfficientNetB0 with a small trainable classification head (about 361k parameters). |
| Repo description: "EfficientNetB4 (~95%)", "MobileNetV2 (~82%)" | CONFLICT (the checkpoint is B0; no MobileNetV2 artifact) | GitHub API description (federated.md §1) | Do not publish. Fix the GitHub description (Q-13). |
| 95.2% global accuracy | **CONFLICT** | The checkpoint was committed as `…acc_0.9018_round_33.h5`, then renamed to `0.9518` with byte-identical content (blob b26c5f16, R100) in commit b88feb8e, while the dashboard text changed "95%" → "95.18%". No evaluation log (federated.md §2; federated-metrics.json) | **Do not publish** any accuracy until Q-3 is resolved with logs. |
| 12,423 images | RESUME, **HOLD** (no manifest; part of the conflicted results sentence) | resume.md:30 | Hold. |
| 80 rounds | RESUME, **HOLD** | resume.md:29 | Hold. |
| Best checkpoint at round 33 | RESUME (filename only) | the filename in every commit | Hold (it is only meaningful with the accuracy). |
| Cross-client gap narrowed to 1.8 pp | RESUME, **HOLD** (no per-client metrics anywhere) | resume.md:30 | Hold. |
| "3 culturally diverse datasets" | RESUME, **HOLD** (dataset names, sizes and sources UNKNOWN; the only test data matches a public web-scraped Kaggle set) | federated.md §1 | Say "three datasets" only once their sources are named (Q-3). |
| Streamlit dashboard with confidence scores | VERIFIED (runs locally) | `app.py:56-138` @b88feb8e | A local Streamlit dashboard returns a research-only prediction with a model score and a disclaimer. |
| "Deployed … for real-time prediction" | CONFLICT (localhost only; no hosted URL) | README:20 | Do not say "deployed". |
| Paper at IConDeepCom 2026 | see §4 P1 | — | — |

**One-line summary (19 words):** Team research project on training an ASD facial-image classifier with federated learning; a research prototype, not a diagnostic tool.

**Short description (58 words):** A team research project with Niraj Chavan. The described design trains a classifier across three data silos with federated averaging so raw images stay local. The public repository holds the inference side only: a frozen EfficientNetB0 transfer-learning checkpoint and a local Streamlit dashboard that shows a research-only prediction with a disclaimer. Training code and results are not public.

**Problem.** Facial-image datasets for ASD research are small, scattered across institutions and too sensitive to pool. Federated learning trains one model without moving the images.

**Role wording (approved):** "Team research project with Niraj Chavan; repository maintained by Niraj." Once confirmed (§4 P1), add "Co-author of the accompanying paper". Add Durgesh's technical role only after Q-3.

**Team credits:** Niraj Chavan (repository). Paper co-authors UNKNOWN (Q-1).

**Stack (verified only):** TensorFlow/Keras 2.15, EfficientNetB0 (ImageNet), Streamlit, OpenCV. Flower is RESUME only, so label it "described".

**Architecture.** Nodes marked † must be labelled "as described by the team; code not public" and drawn dashed.
- Nodes: Client 1/2/3† (local images stay on site†) → Local model (VERIFIED structure above) → Local training (Adam 1e-4, BCE; VERIFIED compile config) → Flower server · FedAvg† → Global model (round t)† → Best checkpoint (filename "round 33") → Streamlit dashboard (VERIFIED: upload → resize 224 → predict → label + score ≤ 99% + disclaimer).
- Edges:
  - server→client "global weights"†
  - images→training "never leave the client"†
  - training→server "updated head weights + sample count"†
  - server "w = Σ nₖwₖ / Σ nₖ"† (cite Flower's `aggregate.py`, not the project)
  - "repeat for R rounds"†
  - checkpoint→dashboard "load .h5" (VERIFIED)

**Key decisions:** A frozen backbone means only a ~361k-parameter head is trained, so updates are small (verified from the config; the motivation is inferred). A research disclaimer appears in the UI.

**Limitations (must accompany any public entry):** This is not a diagnostic tool; ASD diagnosis is clinical and behavioural. Public ASD face datasets are web-scraped, with unverified labels (PMC8811190), so accuracy may reflect dataset artefacts. Per-population results are not public. Federated learning alone does not guarantee privacy (no secure aggregation or differential privacy is evidenced).

**Links:** Do not link any FL repo until security notice S1 is resolved. Afterwards, link `https://github.com/Niraj-Chavan/EDI-autistic` labelled "Inference dashboard (collaborator's repository)". The current site links `DurgeshC16/Autism-Detection-using-FL` (federated.html:140); replace that. No live demo.

**Visual assets:** Draw an SVG from `_research/assets-candidates/federated/model-architecture-from-checkpoint.json` and the node list above. Keep the existing illustrative FedAvg widget (labelled "Illustrative values"). **No training curve or per-client chart** (no data exists). **Never** use the `Test/` images (photographs of children).

**Placement: INDEX** (research archive entry, cross-linked from §4). The FedAvg widget can stay as an illustrative notebook entry.

---

### 3.4 CertiVault: certificate issuance and verification (repo `Web_Tech_CP`)

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| CertiVault lives in `DurgeshC16/Web_Tech_CP`; a Web Technology course project | VERIFIED | `README.md:1,7-8` @aea2ff8 | CertiVault, a Web Technology course project. |
| Durgesh is the only committer (46 commits) | VERIFIED for 37 commits under his named identities; 9 commits by `CertiVault Dev <dev@certivault.local>` are probably his, but UNKNOWN | durgesh-repos.md §2.1 | "I am the only committer on the public repository." (Use only after Q-8 confirms the CertiVault Dev identity.) |
| Solo or team | UNKNOWN | no names in git, LICENSE or docs | Do not state either way until Q-8. |
| Certificates bound by a SHA-256 canonical fingerprint + RSA-2048 signature; signing-key fingerprint pinned outside the DB; QR code | VERIFIED | `README.md:7-13` | Each certificate is fingerprinted with SHA-256 and signed with RSA-2048. The signing key's fingerprint is pinned outside the database, and each certificate carries a QR code. |
| Six verdicts: VALID, TAMPERED, EXPIRED, REVOKED, SUPERSEDED, INVALID; public verification without an account | VERIFIED | `README.md:7-13` | Anyone can verify a certificate without an account and gets one of six verdicts. |
| Fixed verification order: exists → revoked → superseded → hash → key pin → RSA verify → expired | VERIFIED | `README.md:106-125` | (Use in the diagram.) |
| Optional Merkle transparency log with signed checkpoints; Open Badges/Credly sources; attested external credentials | VERIFIED (documented features) | `README.md:100-102` | An optional append-only (Merkle) transparency log with signed checkpoints. |
| Stack: PHP 8.2 (no framework), MySQL/MariaDB strict mode, vanilla JS, Web Crypto, TOTP, AES-256-GCM, HMAC-SHA-256, bcrypt | VERIFIED | `README.md:129-139` | as listed |
| Docker + Render blueprint | VERIFIED (files) | Dockerfile, docker-compose.yml, render.yaml | Docker setup and a Render deployment blueprint. |
| Live demo | UNKNOWN (none found; the deploy doc has only an example URL) | `docs/13_DEPLOY_RENDER.md:254` | No live link. |
| Test count (590 / 512+78 / 690+78) | CONFLICT (inconsistent within the repo) | `README.md:18`; `docs/07_TESTING.md:8-10,41-63`; `docs/09:23`; `docs/10:289` | No number. "Automated PHP and headless-browser test suites." |
| CI green | CONFLICT (the last 5 runs failed, 2026-11-18/19; last green e1e1aa7 on 2026-11-15) | GitHub Actions API (durgesh-repos.md §2.1) | Do not show a CI badge or claim passing CI until fixed. |
| Tamper-detection, ablation and latency figures (3,500 edits, 0.086% bound, RSA 1.09/0.35 ms, ~399 req/s …) | UNKNOWN (from an unpublished paper draft kept out of the repo; it describes an earlier snapshot; the harness is only partly committed) | `docs/08_RESEARCH_SUMMARY.md:3-6,32-93` | Do not publish until the paper is public. |
| Accompanying IEEE-style paper | UNKNOWN (the repo calls it an unpublished draft) | `docs/08:3-6`; `docs/09:32` | Do not mention as a paper (see §4 P3). |
| Rate-limiter scaling bug found and fixed (3.8 → 54.7 ms at 30k rows, fixed to ~3.4 ms) | VERIFIED (self-reported; from the same draft summary) | `docs/08:64-69` | Hold with the other draft figures. The story ("a lookup that grew with table size") can be told without numbers. |
| Stated limitations | VERIFIED | `README.md:315-321` | see Limitations |
| AI-assisted development | UNKNOWN (signals only: large phase-structured commits, 15 commits in ~70 min on 2026-11-15) | durgesh-repos.md §2.1 | Ask (Q-12). Do not mention either way until answered. |

**One-line summary (15 words):** A PHP/MySQL platform that signs certificates and lets anyone verify them, with six distinct verdicts.

**Short description (57 words):** CertiVault, a Web Technology course project, issues certificates bound to their issuer by a SHA-256 fingerprint and an RSA-2048 signature, with the signing key's fingerprint pinned outside the database and a QR code on each certificate. Anyone can check a certificate without an account and receives one of six verdicts: valid, tampered, expired, revoked, superseded or invalid.

**Problem.** Certificates circulate as editable PDFs and images, and recipients have no quick way to check them. Blockchain approaches add fees and latency and still cannot prove that a ledger identity belongs to a real institution (`README.md:41-46`).

**Role wording (approved, pending Q-8):** "Course project. I designed and built the platform; every commit in the public repository is mine."

**Team credits:** None found (UNKNOWN).

**Stack:** PHP 8.2, MySQL/MariaDB, vanilla JavaScript, Web Crypto, OpenSSL, html5-qrcode, pdf.js, dompdf, PHPMailer, phpqrcode, GitHub Actions, headless Chrome tests, Docker.

**Architecture**

Nodes:
- Institution issuer
- Issuance service (canonical JSON → SHA-256 fingerprint → RSA-2048 signature)
- Key pin store (outside DB)
- MySQL (certificates, 18 migrations)
- Certificate PDF + QR
- Holder
- Public verifier (no account)
- `verify.php` cascade
- Verdict (6)
- Optional: Merkle transparency log with signed checkpoints
- Optional: Smart Verify (scan the QR from an image or PDF in the browser)
- Optional: in-browser signed-credential check (Web Crypto)

Edges:
- issuer → issuance "certificate data"; issuance → MySQL "record + signature"; issuance → PDF "QR with ID"
- holder → verifier "shares PDF / QR / link"; verifier → cascade "certificate ID"
- cascade steps in order "exists → revoked → superseded → hash match → key pin match → RSA verify → expired"; cascade → verdict
- issuance → transparency log "append leaf; signed checkpoint"

**Key decisions:** Signatures plus key pinning instead of a blockchain. A fixed precedence among the verdicts, so a certificate gets exactly one explainable verdict. No inline scripts allowed by the CSP. Verification is open to anyone, without accounts.

**Limitations (publish; `README.md:315-321`):** Single operator. Trust-on-first-use key pinning. "A signature proves who issued a certificate, not that its content is true." No public demo yet.

**Links:** Repo https://github.com/DurgeshC16/Web_Tech_CP (public; cloned 2026-11-23). Recommend adding a GitHub description and possibly renaming the repo (Q-8). No live demo.

**Visual assets:** `_research/assets-candidates/Web_Tech_CP/certivault-favicon.svg` (small glyph only). An SVG of the verdict cascade drawn from `README.md:106-125`. Screenshots are **needed** (Q-8): the verify page with VALID/TAMPERED/REVOKED seals, the in-browser credential check and analytics, from the fictional seeded dataset (`CV_SCREENSHOT_DIR` support exists). `CertiVault_Project_Brief.pdf` is reference only (it shows the starting scope vs what was built). Optional interactive: a client-side "tamper the certificate" toy, labelled "illustration".

**Placement: FEATURED.** Before launch: confirm Q-8, fix CI or omit any CI mention, and capture screenshots. Ship with the SVG and no screenshots if necessary.

---

### 3.5 Cascade-XID (repo `Data_science_cp`)

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Confidence-gated two-tier explainable IDS (research prototype) | VERIFIED (design and code on `master`) | `README.md:3,39-65` @f859cb0 (branch `master`) | A research prototype for a two-tier, explainable intrusion detector. |
| Tier 1: RF / XGBoost / PyTorch MLP, calibrated; gate on max-probability or entropy, thresholds fitted on validation, target 5–15% escalation | VERIFIED (design/code) | `README.md:39-65` | as stated, labelled "design" |
| Tier 2: SHAP + FAISS retrieval over MITRE ATT&CK v20.0 + local Ollama LLM (llama3.1:8b), strict JSON validation, ≤ 2 retries, "Needs Human Review" fallback | VERIFIED (code) | `README.md:39-65` | as stated |
| Data pipeline: 2,830,743 rows → 2,522,362 after removing 308,381 exact duplicates; 70 features; 47-row zero-day holdout | VERIFIED (self-reported, measured outputs committed) | `reports/split_summary.md:20,46-47`; `README.md:118` | CICIDS2017: 2,830,743 flows, of which 308,381 exact duplicates were removed (2,522,362 remain); 70 features; a 47-flow zero-day holdout. |
| ATT&CK knowledge base: 1,133 chunks covering 706 techniques | VERIFIED (self-reported) | `README.md:119` | as stated |
| Retrieval Recall@5 0.3667, MRR 0.1225 on 60 unreviewed queries | VERIFIED (self-reported; the repo calls it "poor") | `reports/retrieval_eval.md:7-10`; `docs/14:48` | Do not headline. It may appear as an honest "first retrieval check was weak" note. |
| Detection, cost, baseline, ablation, zero-day, ATT&CK-mapping, human evaluation (E1–E7) | UNKNOWN (not run) | `reports/results.md:1-5`; `README.md:120,122` | "Experiments not yet run." **No performance claims.** |
| Tests: "169 passed" | VERIFIED (self-reported); 147 `def test_` functions counted | `README.md:125`; durgesh-repos.md §2.2 | A pytest suite on synthetic fixtures. |
| Sole committer (11/11) | VERIFIED | git shortlog | I am the sole committer. |
| AI-agent-assisted implementation | UNKNOWN (signals: `AGENTS.md:3`; 4 phases of ~2k lines each committed in under 2 h) | durgesh-repos.md §2.2 | Ask (Q-12). |
| Course project vs paper | UNKNOWN | — | Q-10 |
| GitHub default branch `main` shows only scaffolding | VERIFIED | `main` @7b4aa44 | Link to `/tree/master` until fixed (Q-10). |
| Licence | none (`README.md:344-347`) | — | — |

**One-line summary (16 words):** In-progress research design for an intrusion detector that escalates only uncertain network flows to an explainer.

**Short description (56 words):** Cascade-XID is designed to score every network flow with a calibrated classifier and escalate only uncertain flows to a second tier that combines SHAP attributions, retrieval over MITRE ATT&CK and a local LLM whose JSON output is validated. The data pipeline and knowledge base are built; detection, cost and ablation experiments have not been run yet.

**Problem.** LLM-based IDS explainers call the model on every alert, depend on cloud APIs, are not grounded in ATT&CK and give no rule for when to escalate. These gaps were drawn from 15 base papers (`docs/16_research_objectives.md:1-30`).

**Role wording (approved):** "My research project; I am the sole committer." Add an AI-assistance note per Q-12.

**Team credits:** none found.

**Stack:** Python 3.11, pandas/parquet, scikit-learn, XGBoost, PyTorch, Optuna, SHAP, sentence-transformers (all-MiniLM-L6-v2), FAISS, Ollama, Streamlit, pytest, ruff, Makefile.

**Architecture**

Nodes:
- CICIDS2017 flows
- Loader / EDA / preprocess (leak-free 4-way split + zero-day holdout)
- Tier 1 classifier (calibrated)
- Confidence gate
- Confident → label
- Tier 2: SHAP explainer → ATT&CK retriever (FAISS over 1,133 chunks) → local LLM (Ollama) → JSON validator
- Output: explanation with ATT&CK IDs, or "Needs Human Review"

Edges:
- flows → preprocess → Tier 1 "probabilities"
- Tier 1 → gate
- gate → label "max-prob ≥ τ and entropy ≤ τ"
- gate → Tier 2 "uncertain (target 5–15%)"
- SHAP → retriever "top features as query"
- retriever → LLM "grounding passages"
- LLM → validator "JSON"
- validator → LLM "≤ 2 retries"
- validator → output

**Key decisions:** Escalate only uncertain flows, to bound LLM cost. Fully local inference. ATT&CK-ID-grounded, schema-validated output. An equal-cost random-escalation control in the evaluation protocol. A rule against fabricating numbers ("numbers in tests are not dataset results").

**Limitations (publish):** No detection or cost results yet. The first retrieval check was weak. 12 known issues are self-listed (`docs/14:35-52`). No licence. No CI.

**Links:** https://github.com/DurgeshC16/Data_science_cp/tree/master (public; cloned 2026-11-23). No demo.

**Visual assets:** An SVG cascade diagram from `README.md:41-65`. A data-funnel graphic from `_research/assets-candidates/Data_science_cp/split_summary.json`. Do not chart `retrieval_eval.json`.

**Placement: INDEX**, labelled "In progress". Upgrade when E1/E3 results exist.

---

### 3.6 Engineering notebook (DS_Actual_CP benchmarks + RRF study)

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Five trees implemented from scratch in C++17: AVL, red-black, B-tree, B+ tree, splay | VERIFIED | `DS_Actual_CP:README.md:1-8`; `src/*.cpp`; `CMakeLists.txt:4` | My C++17 implementations of five search trees: AVL, red-black, B-tree, B+ tree and splay. |
| Sole committer (12/12) | VERIFIED | git shortlog @b80db89 | "My C++ benchmark" (keep) |
| AI-assisted planning | UNKNOWN (`implementation_plan.md` is written as an assistant's proposal) | durgesh-repos.md §2.3 | Ask (Q-12). |
| 375 benchmark records (5 trees × 5 ops × 5 datasets × 3 sizes), one run each | VERIFIED | `dashboard/metrics.json`; `src/BenchmarkRunner.cpp:32-55` | Each configuration has one recorded run. |
| The 27 Insert records on the site match the source exactly | VERIFIED (0 mismatches) | audit-code.md §3.4 | keep |
| Random inputs use seed 42 | VERIFIED | `src/DatasetGenerator.cpp:29-47` (`mt19937 gen(42)`) | keep |
| "Real-world" dataset is real | CONFLICT (25 integers repeated cyclically) | `data/realworld.txt`; `DatasetGenerator.cpp:61-71` | Never present it as a real workload. If shown, call it "a short repeating sequence". |
| Network-routing simulation | CONFLICT (stub returning two hard-coded routers) | `src/Simulations.cpp:374-382` | Do not mention. |
| 9 GoogleTest cases (AVL, RB, B, B+) | VERIFIED (count; no recorded runs; no splay test) | `tests/TreeTests.cpp` | Optional: "GoogleTest invariant tests for four of the five trees." |
| AVL insertion replay (7 keys) is correct | VERIFIED | audit-code.md §3.3 (independent check) | keep |
| RRF: score = Σ 1/(60 + rank), 1-based rank | VERIFIED | `review-summarizer:src/retrieval/hybrid_search.py:63-77` @68d0c0a; audit-code.md §3.5 | keep |
| "The project uses BM25 … and FAISS with multilingual E5" | VERIFIED that the module exists; CONFLICT that it is on the served path (`api/main.py:189` passes an empty query, so hybrid search never runs when served) | collabs.md §2.2 edge 9 | "The repository includes a retriever that fuses BM25 keyword ranks with FAISS/multilingual-E5 semantic ranks." |
| "Review Summarizer, co-built with Niraj Chavan" | UNKNOWN (0 Durgesh commits) | collabs.md §2.9 | "Review Summarizer, a team project with Niraj Chavan (repository maintained by Niraj)". |
| Review examples are fictional | VERIFIED | notebook.html | keep the label |

**One-line summary (19 words):** Interactive notes on two engineering decisions: how insertion order shapes tree height, and how rank fusion orders search results.

**Short description (51 words):** The notebook replays a seven-key AVL insertion, plots 27 recorded runs from my C++17 benchmark of AVL, red-black and splay trees, and recomputes reciprocal rank fusion (k = 60) as implemented in the Review Summarizer team project. Benchmark and fusion figures link to pinned source commits; the review examples are fictional.

**Problem.** Two questions a reader can test: why does insertion order turn a splay tree into a 10,000-level chain while AVL stays at 14 levels? And how does fusing two rankings decide which review surfaces first?

**Role wording (approved):** Benchmarks: "My C++ benchmark (sole author of DS_Actual_CP)." RRF: "Explains the fusion step from Review Summarizer, a team project with Niraj Chavan; repository maintained by Niraj." The notebook page itself, including its AVL replay, rotation lab and FedAvg widget, is Durgesh's portfolio code.

**Team credits:** Niraj Chavan (Review Summarizer repository).

**Stack:** C++17, CMake, GoogleTest, nlohmann/json, Node/Express, D3, Chart.js (source project). The site uses vanilla JS, canvas and CSS.

**Architecture**
- Benchmark: DatasetGenerator (seed 42; ascending / descending / random / skewed / repeating) → BenchmarkRunner (5 trees × 5 ops × 3 sizes, 1 run) → `metrics.json` (375 records) → site `tree-benchmarks.js` (27 Insert records) → log-scale plot. Edge labels: "keys", "timed batch, excludes generation", "pinned @b80db89", "filter Insert × AVL/RB/Splay".
- RRF: query → BM25Okapi (lowercased whitespace tokens) and E5-small → FAISS IndexFlatIP → two ranked lists → RRF "Σ 1/(60 + rank)" → fused list (stable sort; dense list first breaks ties).

**Key decisions:** Single-run timings are shown with that caveat, not as distributions. Log scales are fixed per metric. Rank fusion rather than score blending avoids calibrating BM25 against cosine scores.

**Limitations (publish):** One run per configuration. The "real-world" dataset is synthetic. The RRF example uses fictional reviews, and the fusion step is not on the served path of the source app.

**Links:**
- https://github.com/DurgeshC16/DS_Actual_CP plus the pinned blob links (VERIFIED 200).
- https://github.com/Niraj-Chavan/review-summarizer/blob/68d0c0a…/src/retrieval/hybrid_search.py (VERIFIED 200).
- Recommend linking DS_Actual_CP only via its pinned files: the repo commits `node_modules/` and `build/`.

**Visual assets:** Existing notebook instruments. Optional expansion from `_research/assets-candidates/DS_Actual_CP/metrics.json` (Search/Delete, B/B+ families), with the single-run caveat in the UI.

**Placement: FEATURED** (existing page; also linked from the tutor and Review Summarizer entries).

---

### 3.7 Review Summarizer

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Repo and authorship | VERIFIED | `Niraj-Chavan/review-summarizer` @68d0c0a: 8 commits, all Niraj-Chavan; TEAM.md lists anonymous roles P1–P4 | Team project with Niraj Chavan; repository maintained by Niraj. |
| Durgesh's role (P1–P4?) | UNKNOWN | collabs.md §2.1, §2.9 | Q-6 |
| Chrome MV3 extension + FastAPI `POST /api/summarize` | VERIFIED | `extension/manifest.json`; `src/api/main.py:138` | A Chrome extension backed by a FastAPI service. |
| LLM extracts 3–8 aspects with sentiment, explanation, evidence quote | VERIFIED | `aspect_opinion_agent.py:17-50` | An Ollama model extracts 3–8 product aspects, each with a sentiment score, a one-line explanation and a quoted review. |
| Trust-weighted rating; heuristic trust score (XGBoost on rule-derived weak labels; Louvain collusion graph) | VERIFIED | `summarization_agent.py:14-28`; `classifier.py:16-52`; `graph.py:26-72` | Ratings are re-weighted by a heuristic review-trust score. |
| Hybrid BM25 + E5/FAISS retrieval fused by RRF (k = 60) | VERIFIED (module); CONFLICT that it is used when served | `hybrid_search.py:63-77`; `main.py:189` | "The repository includes a BM25 + multilingual-E5 retriever fused by reciprocal rank fusion." |
| Multi-site support | CONFLICT (ID extraction only; non-Amazon data is synthetic) | `README.md:131`; `main.py:53-117` | "Live scraping covers Amazon only; other sites use synthetic reviews." |
| Benchmark results (ROUGE-L, BERTScore …) | **CONFLICT (hand-written mock values)** | `eval/mock_results.py:7-41` | Never cite. |
| "Flagged 45 reviews", "15% rating correction" | CONFLICT (demo talk track) | `DEMO.md:21,29`; ROADMAP.md | Never cite. |
| Existing tile: "groups reviews by aspect and combines keyword and semantic search to retrieve evidence" | CONFLICT (half right) | dist/index.html:559-560 | Replace with the short description below. |

**One-line summary (15 words):** Team-built Chrome extension and FastAPI service that summarises product reviews by aspect using an LLM.

**Short description (60 words):** A Chrome extension sends a product's ID and title to a FastAPI service, which asks an Ollama model to extract 3–8 aspects with explanations and evidence quotes, and weights the rating by a heuristic review-trust score. The repository also includes a BM25 + multilingual-E5 retriever fused by reciprocal rank fusion. Live scraping covers Amazon only; other sites use synthetic reviews.

**Problem.** Star ratings hide which aspects buyers praise or criticise, and they count suspicious reviews at full weight.

**Role wording:** "Team project with Niraj Chavan; repository maintained by Niraj."

**Team credits:** Niraj Chavan; the other TEAM.md roles are unnamed.

**Stack:** Python, FastAPI, Ollama, sentence-transformers (multilingual-E5-small), FAISS, rank-bm25, XGBoost, NetworkX + python-louvain, TextBlob, Playwright/BS4, Streamlit, Chrome MV3 (JS).

**Architecture (served path; collabs.md §2.2)**
- Nodes: Extension → API → cache (platform:pid) → scraper (Amazon) / synthetic generator → trust (graph → features → XGBoost) → orchestrator → aspect agent → summariser → Ollama → API → extension. Draw the retriever dashed ("in repository, not on the served path").
- Edges: "product ID + title"; "cache hit returns"; "≤ 10 reviews, or synthetic if < 3"; "trust = 1 − P(fake)"; "reviews + trust → aspects (JSON)"; "trust-weighted rating + 2–4 sentence summary"; "rating gauge, aspect bars".

**Key decisions:** Rank fusion over score blending. One multilingual encoder reused for retrieval, chunking and near-duplicate detection. Trust as an input to the LLM stage. JSON mode plus one stricter retry. Timeouts mapped to HTTP 503/504.

**Limitations:** Mock benchmarks. Synthetic data outside Amazon. Trust labels derived from their own features. A plausible bug where trust scores are applied to the wrong reviews (sort order; collabs.md §2.7). The extension runs on every page.

**Links:** https://github.com/Niraj-Chavan/review-summarizer (VERIFIED 200). No demo.

**Visual assets:** `dist/assets/review-screen.webp` (= `_research/assets-candidates/review-summarizer/site-existing-review-screen.webp`, real UI with mock data), captioned "Synthetic review data". Optionally redraw `readme-architecture-mermaid-github-render-cropped.png` in site style, labelled "intended flow".

**Placement: INDEX.**

---

### 3.8 SmartCare

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Repo and authorship | VERIFIED | `Niraj-Chavan/SMARTCARE-AN-offline-First-AI-system` @d518494: 8 commits, all Niraj | Team project with Niraj Chavan; repository maintained by Niraj. |
| Durgesh's copy `DurgeshC16/SmartCare-Software-engineering-project` | VERIFIED (1 commit, 6dbad97; 51 of 53 blobs identical; only the package files differ) | collabs.md §3.2 | Do not present it as his authorship. Link Niraj's repo. |
| Software Engineering course project | RESUME-level (inferred from his repo name and local folder path) | collabs.md §3 | "A Software Engineering course team project" (confirm, Q-6). |
| Offline-first React PWA, IndexedDB (Dexie), Workbox | VERIFIED | `vite.config.js:9-37`; `src/db.js:3-23` | An offline-first React progressive web app that stores its knowledge base in IndexedDB. |
| Works fully offline | CONFLICT (partial: the first-ever use needs a connection to seed the knowledge base) | `App.jsx:22-27` | "Works offline after its first online visit." |
| "AI" scoring | VERIFIED: deterministic rules (symptom-overlap fraction, highest risk tier) | `symptomScorer.js:12-34`; `riskCalculator.js:1-27`; `README.md:99` | Rule-based matching against 16 conditions and 41 symptoms. |
| Optional local LLM explanation | VERIFIED | `ollamaClient.js:94-161` ("Do not diagnose", JSON, temperature 0.2, 45 s timeout) | An optional local Ollama model summarises next steps and red flags from the rule result; it is told not to diagnose. |
| Diagnostic framing (Durgesh's repo description: "detection which disease the patient has") | CONFLICT | GitHub API; vs `ollamaClient.js:110` | Never use diagnostic wording. Fix the description (Q-13). |
| Encrypted health records | CONFLICT (key derived from public browser properties + a fixed salt) | `crypto.js:19-42` | Do not mention encryption. |
| Sync to server | CONFLICT (`queueAction` never called; no backend in repo) | collabs.md §3.5 | Do not mention sync. |

**One-line summary (16 words):** Team-built offline-first symptom-checker PWA with rule-based scoring and an optional local-LLM explanation; not a diagnostic tool.

**Short description (55 words):** SmartCare, a Software Engineering course project (repository by Niraj Chavan), is a React progressive web app that works offline after its first online visit. It matches selected symptoms against a 16-condition knowledge base stored in IndexedDB, assigns a risk tier by rules, and can ask a local Ollama model to summarise next steps without diagnosing.

**Problem.** People in low-connectivity areas need basic symptom guidance that keeps working without a network.

**Role wording:** "Course team project with Niraj Chavan; repository maintained by Niraj."

**Team credits:** Niraj Chavan; others UNKNOWN.

**Stack:** React 19, Vite, vite-plugin-pwa (Workbox), Dexie/IndexedDB, Web Speech API, Ollama (optional), Vitest, Playwright.

**Architecture (collabs.md §3.3)**
- Nodes: service worker (cache-first); knowledge-base JSON → seed → IndexedDB; UI (symptom chips / text / voice) → scorer → risk tier → optional Ollama explainer → results; online event → KB version check.
- Edges: "seed only when online"; "selected symptoms"; "matched / condition symptoms"; "highest risk among matches"; "rule result + top 5 → JSON summary (do not diagnose)"; "on reconnect: KB version swap (atomic)". Draw the sync queue dashed ("not wired").

**Key decisions:** Inference stays in the browser. Versioned Dexie schemas. The LLM explains but never decides. Reconnection is treated as an event.

**Limitations:** The first visit needs a connection. Sync is not implemented. Three agent modules are not wired. The end-to-end test fails. The "encryption" is obfuscation.

**Links:** https://github.com/Niraj-Chavan/SMARTCARE-AN-offline-First-AI-system (VERIFIED 200). No verified live demo.

**Visual assets:** `dist/assets/smartcare-screen.webp` (authentic render; capture method undocumented, Q-17).

**Placement: INDEX.**

---

### 3.9 Oral-Cancer-AI

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Hackathon project for problem KR0468 ("Clinically Deployable Explainable Multimodal AI System for Oral Cancer Diagnosis and Risk Assessment") | VERIFIED (problem statement in repo) | `KR0468.pdf` (VNRVJIET letterhead, "KRITHOMEDH" logo) | Built during a hackathon for problem statement KR0468. |
| Event name ("Krithoathon" vs "Krithomedh"), date, result | UNKNOWN | durgesh-repos.md §2.4 | Do not name the event until Q-9. |
| Team members | UNKNOWN | — | Q-9 |
| Commits by Durgesh (2/2); README "Author: Durgesh Chaudhari" | VERIFIED | git shortlog; `README.md:236-239` | Repository published by me. |
| Two PyTorch ResNet18 classifiers (intraoral, histopathology), 10 epochs, Adam 1e-4, class-weighted CE | VERIFIED | `train/train_intraoral.py:22-66` | as in the short description |
| README: "ResNet50V2", "TensorFlow/Keras", "Flask/FastAPI" | CONFLICT (the code is PyTorch ResNet18 + Flask) | `README.md:30,77,80-82` | Do not repeat. Fix the README (Q-9). |
| Fusion: fixed weights 0.4 / 0.3 / 0.3 + a "2 of 3 above 0.7" rule → Low/Med/High | VERIFIED | `backend/predict.py:162-180` | Fixed-weight fusion. |
| Grad-CAM on the intraoral image | VERIFIED | `backend/gradcam.py` | Grad-CAM heatmap. |
| Feature importance | CONFLICT (hard-coded per risk factor) | `backend/predict.py:190-201` | Do not mention. |
| Genomic data, attention/transformer fusion | UNKNOWN (not implemented) | durgesh-repos.md §2.4 | Do not mention. |
| Accuracy metrics | UNKNOWN (README table shows "XX%") | `README.md:172-179` | "The repository records no accuracy figures." |
| Train/serve preprocessing mismatch | VERIFIED (defect) | `train_intraoral.py:31,38` vs `predict.py:48-51` | Limitation. |

**One-line summary (17 words):** Hackathon prototype combining two ResNet18 image models and a rule-based clinical score into an oral-cancer risk level.

**Short description (50 words):** Built during a hackathon for problem statement KR0468. Two ImageNet-pretrained ResNet18 classifiers (intraoral photo, histopathology) and a rule-based clinical questionnaire score are combined with fixed weights into a low, medium or high risk level, with a Grad-CAM heatmap on the photo. The repository records no accuracy figures; not clinically validated.

**Problem.** The brief asked for an explainable multimodal risk assessment for oral cancer. The prototype covers images and clinical answers, but not genomics.

**Role wording (approved, pending Q-9):** "Hackathon project; I published the repository." Add a team line only after Q-9 is answered. Do not use a "details to follow" placeholder.

**Stack:** PyTorch, torchvision (ResNet18), Grad-CAM, Flask, HTML/JS.

**Architecture**
- Nodes: intraoral photo → ResNet18-A; histopathology tile → ResNet18-B; questionnaire (10 inputs) → rule score; fusion (0.4/0.3/0.3 + agreement rule) → risk tier; Grad-CAM → heatmap; Flask `/predict`, `/feedback` → feedback.json.
- Edges: "probability", "probability", "score", "Low / Medium / High", "heatmap on photo".

**Key decisions:** Fixed, inspectable fusion weights rather than a learned fusion (a hackathon time trade-off).

**Limitations:** No measured accuracy. A train/serve normalisation mismatch. No genomic modality. Not clinically validated. Image licences unverified.

**Links:** https://github.com/DurgeshC16/Oral-Cancer-AI (public; cloned 2026-11-23). Link only after the README stack is corrected. No demo.

**Visual assets:** **None publishable.** Both heatmaps in `_research/assets-candidates/Oral-Cancer-AI/` are marked DO-NOT-PUBLISH: unverified licence, and one carries a third-party photo credit. Use a text-only entry or a simple SVG of the fusion.

**Placement: INDEX** after the README fix; otherwise **OMIT**.

---

### 3.10 Exam Management System

**Claims**

| Claim | Status | Source | Approved public wording |
|---|---|---|---|
| Repo and authorship | VERIFIED | `Niraj-Chavan/DBMS-CP` @4ae6570: Siddhesh e479490 (209 files) + Niraj 4ae6570; 0 Durgesh commits | — |
| Durgesh's role | UNKNOWN. His own `DurgeshC16/DBMS_CP` is README-only and describes a Supabase design, but the team code has no Supabase. `scripts/check-durgesh.ts` is referenced but absent, which is not evidence of authorship | collabs.md §4 | — |
| Next.js 16, TypeScript, better-sqlite3, bcrypt, 7-day JWT + session rows, transactional submit, grade bands, PDFKit certificates; 14 tables / 21 indexes | VERIFIED | collabs.md §4.1 | (only if un-omitted) |
| "Timed assessments" (existing tile) | UNKNOWN (not checked in research) | dist/index.html:598-601 | Do not repeat. |
| README: "SQL injection prevention (parameterized queries)" everywhere | CONFLICT (`sql-filter.ts:33` interpolates a number) | collabs.md §4.2 | — |

**One-line summary (if ever published, 13 words):** Team-built Next.js exam platform with role-based access, grading and PDF certificates on SQLite.

**Short description (if ever published, 38 words):** A Next.js and TypeScript exam system for students and administrators, built on SQLite with bcrypt passwords, JWT sessions backed by a session table, transactional answer submission, grade bands and PDFKit certificates. Team project; repository maintained by Niraj Chavan.

**Role wording:** "Team project; repository maintained by Niraj Chavan." Contribution UNKNOWN.

**Architecture (if needed):** pages → `middleware.ts` (role redirect) → API route handlers → auth middleware (session table) → services → better-sqlite3 (WAL, FKs) → PDFKit certificates.

**Links:** https://github.com/Niraj-Chavan/DBMS-CP (VERIFIED 200). Note: its README publishes default credentials.

**Visual assets:** none. **Do not publish** `assets-candidates/dbms-cp/repo-test-certificate.pdf` (institutional branding on a fictional student).

**Placement: OMIT**, until Durgesh documents his part.

---

## 4. Research and achievements

**No bare counts.** Replace "3 conference papers / 1 granted patent" (dist/index.html:697-701) with a list. A count may appear only if it equals the number of items listed.

| # | Item | Claimed (résumé/site) | Evidence-backed status | Ledger status | Source | Approved public wording |
|---|---|---|---|---|---|---|
| P1 | "Federated Learning Framework for Privacy-Preserving and Cross-Cultural ASD Detection from Facial Images", IConDeepCom 2026 | Co-authored conference paper (site); counted among "3 conference papers" (résumé) | **Venue VERIFIED** (5th International Conference on Deep Sciences for Computing and Communications, 15–16 Jun 2026, SRM IST Kattankulathur with Southern Taiwan University of Science and Technology, hybrid). **Paper:** accepted / presented / published all UNKNOWN; no title, author list, DOI or proceedings entry found. The proceedings publisher for 2026 is not announced. | RESUME (paper); VERIFIED (venue) | https://icondeepcom.wordpress.com/ (capture `_research/refs/publications/icondeepcom_in.txt`); publications.md §1 P1 | Until evidence arrives: **"Co-authored paper · IConDeepCom 2026 · proceedings not yet published."** Once the acceptance email or certificate arrives: "Presented at IConDeepCom 2026 (5th edition, hybrid); proceedings forthcoming." Never "published" without a DOI. Do not attach any accuracy figure (see §3.3). Link the conference site, not a LinkedIn profile. |
| P2 | "Lightweight Handwritten Character Recognition Using EfficientNetB0: Transfer Learning and Augmentation Ablation on EMNIST Balanced" | Not named on the résumé | **published**: IEEE, 2026 ICNPCV, Bangalore, 17–18 Jul 2026, pp. 1–8, DOI 10.1109/icnpcv69434.2026.11708952. "Durgesh Chaudhari", Dept. of Computer Engineering, VIT Pune, is 2nd of 6 authors. **Identity is a name + affiliation match, not yet confirmed by Durgesh.** | VERIFIED (record); identity UNKNOWN | https://doi.org/10.1109/icnpcv69434.2026.11708952 ; https://api.crossref.org/works/10.1109/icnpcv69434.2026.11708952 | After Durgesh confirms (Q-1): "V. Sonwane, **D. Chaudhari**, R. Chandorkar, A. Chandewar, F. Chaudhari, P. Chandak. *Lightweight Handwritten Character Recognition Using EfficientNetB0: Transfer Learning and Augmentation Ablation on EMNIST Balanced.* 2026 International Conference on Natural Language Processing and Computer Vision (ICNPCV), IEEE, pp. 1–8. doi:10.1109/icnpcv69434.2026.11708952." Status: Published. **Before confirmation: omit.** |
| P3 | Third conference paper | "3 Conference Research Papers" | **None found.** The CertiVault paper is, by the repo's own statement, an unpublished draft (`Web_Tech_CP:docs/08_RESEARCH_SUMMARY.md:3-6`). The 2023 ICICCS paper by "Durgesh Sunil Chaudhari" is very likely a different person (it predates his B.Tech). | UNKNOWN | publications.md §1 P3 | **Omit.** Do not invent, and do not list the CertiVault draft. If Durgesh supplies a title, venue and status: list it with the matching word (accepted / under review). |
| CNT | Paper count "3" | Résumé | Supports at most 1 published (P2, pending identity) + 1 self-reported (P1) | CONFLICT | — | Do not show a count. |
| PAT | Patent | "Granted Patent" / "one granted patent" (résumé) | **filed**: VIT Pune IPR-filed register (May 2026), Sr. 894, application **2025/09215**, "A SYSTEM CONSISTING OF SOLAR TECHNOLOGY WITH HYDROPONICS", filed 31-10-2025. Inventors include "CHAUDHARI, Durgesh Nitin". Publication and grant columns are blank. Not in VIT Instrumentation's granted table (Jan 2026). Jurisdiction probably South Africa (inferred from the number format; unconfirmed). **No grant record anywhere.** Identity unconfirmed (department listed as "AIDS"). | **CONFLICT** ("granted"); "filed" pending identity confirmation | https://www.vit.edu/wp-content/uploads/2026/05/VIT-IPR-Filed.pdf p.58; publications.md §2 | **Never "granted"** without a grant record. After Durgesh confirms it is his (Q-2): "Co-inventor, patent application 2025/09215, *A System Consisting of Solar Technology with Hydroponics*, filed 31 Oct 2025." Add the jurisdiction only when confirmed. Before confirmation: omit. |
| H1 | Top 30, AI for Foundational Learning Hackathon | "Top 30" | Event and Top-30 Build stage VERIFIED; the team's selection is self-reported in his repo (consistent with the rules). Top 10 / finale: no evidence. | RESUME | hack2skill.com/event/aiforfoundationallearning; `Kaaran:docs/PROJECT_CONTEXT.md:7` | "Kaaran (Team EASY COMPANY, 4 members) was selected for the Build stage (top 30 teams) of the AI for Foundational Learning Hackathon, run by ShikshaNext in collaboration with Anthropic, Oct–Nov 2026." |
| H2 | Oral-cancer hackathon (KR0468) | Not on the résumé | Event name, date, team and result UNKNOWN | UNKNOWN | durgesh-repos.md §2.4 | Omit from achievements. The project can appear as an INDEX entry (§3.9). |
| C1 | Microsoft Certified: Azure AI Fundamentals (AI-900), Jun 2026, credential ID B95F80D40BFFDBF9 | Résumé; site (without ID) | Plausible (AI-900 retired 30 Jun 2026). No public lookup by ID exists; a holder-generated share link is needed. | RESUME | resume.md:38; learn.microsoft.com AI-900 exam page | "Microsoft Certified: Azure AI Fundamentals (AI-900) · June 2026". Show the credential ID **only next to a working Microsoft Learn share link** (Q-11). |
| C2 | Machine Learning Specialization (Stanford Online & DeepLearning.AI, Coursera), Nov 2026 | Résumé; site | The programme is verified; his certificate is not public | RESUME | coursera.org/specializations/machine-learning-introduction | "Machine Learning Specialization · Stanford Online and DeepLearning.AI (Coursera) · November 2026". Add a Verify link when supplied. |
| C3 | Microsoft AB-100 | "Exam passed, Certification pending" | **pending**: coherent with Microsoft's rule that the Expert certification also needs an Associate-level prerequisite (AI-900 does not count) | RESUME | learn.microsoft.com …/agentic-ai-business-solutions-architect/ | "AB-100 exam passed (Microsoft Certified: Agentic AI Business Solutions Architect Expert pending a prerequisite certification)". **Never "certified".** Optional; it is fine to omit until there is a transcript share link. |
| L1 | LeetCode 100 Days Badge | Résumé; site | Profile blocked to automated checks | RESUME | resume.md:37 | "LeetCode 100 Days Badge" with a profile link. |
| CO | "Co-author's record" link to Niraj's LinkedIn | Site (index.html:757-771) | Not a publication record (authwall; his public README lists no papers) | CONFLICT (as evidence) | publications.md §5 | Remove. Link DOIs or the conference site instead. |

---

## 5. Questions for Durgesh (deduplicated, in priority order)

**P0: block headline claims or the résumé link**
1. **Papers.** (a) Is the IEEE ICNPCV 2026 handwriting paper (DOI 10.1109/icnpcv69434.2026.11708952) yours, and is it one of the "3 papers"? (b) For IConDeepCom 2026: the CMT paper ID (ICONDEEPCOM26_xxx), the acceptance email, the presentation certificate, the full ordered author list, and any proceedings or DOI news. (c) The third paper: title, venue, date, status and proof. If none exists, the count goes.
2. **Patent.** Is application 2025/09215 (solar + hydroponics, filed 31 Oct 2025) yours, and is it the one on the résumé? Give the jurisdiction, any patent number and grant date, and the certificate or register URL. If it is not granted, the résumé must say "filed".
3. **Federated-learning results.** Why was the checkpoint renamed from `acc_0.9018` to `acc_0.9518` with identical bytes (commit b88feb8e)? Which figure is correct, and on which split? Please send the training notebooks or logs (Flower code, 3 clients, 80 rounds, per-client accuracies), the names, sources and sizes of the three datasets (12,423 images), and your own role in the work.
4. **Tree tutor.** Which parts did you build (files or features)? Is there any private history (branch, zip, Drive)? Where do the following come from: the 240 cases / 100% / 34.1 ms figures, the Redis 1.43 s → 0.18 s result (the committed code applies no cache), and the 23-user pilot (219 events, 11 patterns)? Was there consent or an ethics note for the pilot? Which 7 agents are meant, and which version had 36 concepts (the code has 52)?
5. **Résumé PDF.** The site links `dist/assets/Durgesh-Chaudhari-Resume.pdf`, which still says "Granted Patent", "Three conference papers", the tutor metrics and the FL 95.2%. Will you update it to match this ledger before launch? Otherwise the site contradicts its own résumé.

**P1: needed for featured case studies**
6. **Collaborations** (SmartCare, Review Summarizer, Exam Management System). What did you design, write or test in each? Which TEAM.md role (P1–P4) did you hold in Review Summarizer? Is SmartCare a Software Engineering course project? Who is the "durgesh" in DBMS-CP's `scripts/check-durgesh.ts`, and was your Supabase design part of that system? Does Niraj agree to be named as he is in this ledger?
7. **Kaaran.** Is the approved AI-assistance wording right ("built with Claude as an AI coding assistant; I specified, reviewed, tested and integrated")? May teammates be named, and with what roles? Do you have a public link, email or certificate for the Top-30 selection? What was the Top-10 or finale outcome?
8. **CertiVault.** Is `CertiVault Dev <dev@certivault.local>` you? Was the project solo or a team? Is the paper draft submitted anywhere? Can CI be made green, the test counts reconciled, screenshots captured from the seeded dataset, and a GitHub description (and possibly a new repo name) added? Is a demo deploy planned?
9. **Oral-Cancer-AI.** What were the exact event name (Krithoathon vs Krithomedh, VNRVJIET?), the date, the team members, your part and any result? Where did the training and validation images come from, and under what licences? Can the README be corrected (ResNet18 / PyTorch / Flask; remove the "XX%" table)?
10. **Cascade-XID.** Is it a course project or research towards a paper? Can `master` become the default branch? When will E1/E3 results exist? Will you add a licence?
11. **Certifications.** Please supply: a Microsoft Learn share link for AI-900 (public profile); a transcript share link showing AB-100 passed, and which prerequisite you are pursuing; the Coursera certificate verify URL; and a LeetCode badge URL or dated screenshot.
12. **AI-assisted development elsewhere.** CertiVault, Cascade-XID and DS_Actual_CP show signals of coding-agent use (`AGENTS.md`, `implementation_plan.md`, phase-sized commits). How do you want this described in each case study?

**P2: housekeeping**
13. **Misleading repo descriptions to fix or archive:**
    - `Autism-Detection-using-Federated-Learning` (handwriting text, placeholder);
    - `Autism-Detection-using-FL` ("EfficientNetB4 ~95%, MobileNetV2 ~82%");
    - `SmartCare-Software-engineering-project` ("detection which disease");
    - the `Forensic-Handwriting-AI` fork (résumé-style description, 0 commits by you);
    - the `Memori_OpenSourceHack` fork (0 commits).
    Did you have a role in Forensic-Handwriting-AI or Memori?
14. Would you like PHP added to your skills (CertiVault)? Should Flower, Redis, MongoDB, Supabase and Next.js stay on the résumé, given that no code you authored publicly shows them?
15. Do you want your phone number on the public résumé PDF? (See S9.)
16. Which LinkedIn URL is canonical (`www.` or `in.`)? What is the final deployment URL (needed for canonical and Open Graph tags)?
17. Who captured `smartcare-screen.webp` and `review-screen.webp`, and how? Can the captures be repeated from a pinned commit for the provenance record?

---

## 6. Security and privacy notices

Do not copy any secret value into the site, the docs or the commit messages.

| # | Severity | Notice | Where | Action |
|---|---|---|---|---|
| S1 | **High** | A **hard-coded Kaggle API token** (a string beginning `KGAT_`) is committed in `setup_kaggle.bat` in two public repositories, including their history. The value is deliberately not reproduced here. | `DurgeshC16/Autism-Detection-using-FL` and `Niraj-Chavan/EDI-autistic` (federated.md §0, §6) | Durgesh/Niraj: revoke the token in Kaggle account settings now, then remove the file from history (for example with git filter-repo) and force-push. Treat the token as compromised whatever the clean-up. **Do not link either repo from the portfolio until this is done.** |
| S2 | High (privacy/ethics) | The `Test/` folder holds ~300 facial photographs of children (the ASD dataset test split) in a public repo. | Both FL repos | Never reproduce them on the site. Recommend removing them from the public repos, or confirming the dataset licence allows redistribution. |
| S3 | Medium (privacy/licence) | Clinical images with unverified licences. One local heatmap carries a third-party photo credit ("reproduced with permission from Health Scotland and Glasgow Dental Hospital"). The repo also holds ~490 validation images. | `DurgeshC16/Oral-Cancer-AI`; `_research/assets-candidates/Oral-Cancer-AI/*DO-NOT-PUBLISH*` | Do not publish any. Durgesh to check the dataset licences for the public repo. |
| S4 | Medium | **Cost exposure:** the Kaaran demo runs in live LLM mode, so new phrasings call Claude on Durgesh's key. A per-process cap of $10 (voice ₹500) is set. | `render.yaml:17-22` | Acceptable with the cap. Keep "Try the demo" links pointed at the example-question flows. Watch spend after launch. |
| S5 | Low | The Review Summarizer extension runs on `<all_urls>` and posts page titles to localhost. Its API allows CORS `*` with credentials. | `extension/manifest.json:16-22`; `content.js:394-401`; `main.py:19-25` | If linked, describe it as a local prototype. Do not invite visitors to install it. |
| S6 | Low | DBMS-CP publishes default login credentials (`README.md:63-69`, `TEST_CREDENTIALS.md`). | `Niraj-Chavan/DBMS-CP` | Not linked (OMIT). If ever linked, confirm no deployed instance uses them. |
| S7 | Low (accuracy) | SmartCare's "encryption" derives its key from public browser properties and a fixed salt. | `crypto.js:19-42` | Never describe it as secure storage of health data. |
| S8 | Low | `repo-test-certificate.pdf` carries institutional branding on a fictional student. | `_research/assets-candidates/dbms-cp/` | Do not publish. |
| S9 | Privacy | The résumé PDF on the site exposes a personal mobile number. Git commit metadata exposes a personal Gmail address. | `dist/assets/Durgesh-Chaudhari-Resume.pdf`; git identities | Do not add the phone number or Gmail address to site HTML or JSON-LD. Durgesh decides whether the public PDF keeps the phone number (Q-15). |
| S10 | Info | The Kaaran WhatsApp integration uses a Meta test number, and the app secret lives in Render env vars (`sync:false`). | `render.yaml` | Nothing to do. Never publish the test number. |

---

## 7. Required changes to existing site copy (for the implementation team)

| File:line | Current | Change to |
|---|---|---|
| index.html:501-503 | "Four projects co-built with Niraj Chavan" | Remove. Each INDEX entry carries "Team project with Niraj Chavan; repository maintained by Niraj." |
| index.html:559-560 | Review Summarizer "combines keyword and semantic search to retrieve evidence" | §3.7 short description |
| index.html:598-603 | Exam Management System tile | Remove (OMIT) |
| index.html:638-642 | "A seven-agent tutor …" | §3.2 one-line summary |
| index.html:697-701 | "3 Conference papers" / "1 Granted patent" counters | A list per §4, with no counts |
| index.html:731-739 | IConDeepCom entry, "Co-authored … across three datasets" | §4 P1 wording; drop "across three datasets" until Q-3 |
| index.html:757-771 | "Co-author's record" → Niraj's LinkedIn | Remove |
| kaaran.html:102-106 | "co-built … placed in the top 30" | §3.1 role wording + H1 wording ("selected for the Build stage (top 30 teams)") |
| kaaran.html:109-110 | Chips: Claude, DuckDB, Python | Claude, Python, pandas, FastAPI (DuckDB only with the v1 note) |
| kaaran.html:128-130 | "22 evaluated briefs passed … first attempt"; "295 automated tests"; "96%" unattributed | Scoped 22/22 wording, the 9-of-11 verifier catch, "about 300 automated tests", and "the project log reports 96%" |
| tutor.html:101-105 | "seven-agent learning system co-built with Niraj Chavan" | §3.2 role and description |
| tutor.html:127-129 | "The résumé reports" 240 cases / 34.1 ms / 23-user pilot | Remove (CONFLICT) |
| tutor.html:135-137 | "Redis caching reduced repeated response time from 1.43 seconds to 0.18 seconds" | Remove (contradicted by code) |
| federated.html:108-110 | Chips: Flower, EfficientNet, TensorFlow | EfficientNetB0, TensorFlow/Keras, Streamlit (Flower only as "described") |
| federated.html:120-121 | "Three clients … The experiment ran for 80 rounds." | §3.3 RESUME wording with "training code not public"; drop "80 rounds" (HOLD) |
| federated.html:127-128 | "The résumé reports 95.2% … 12,423 … round 33 … 1.8 pp" | Remove until Q-3 (CONFLICT/HOLD) |
| federated.html:140 | Link to `DurgeshC16/Autism-Detection-using-FL` | Remove until S1 is fixed; then link `Niraj-Chavan/EDI-autistic`, labelled "inference dashboard (collaborator's repository)" |
| notebook.html:205-207 | "Review Summarizer, co-built with Niraj Chavan" | "Review Summarizer, a team project with Niraj Chavan (repository maintained by Niraj)" |
| notebook.html:212-216 | "The project uses BM25 … FAISS …" | "The repository includes a retriever that fuses BM25 … and FAISS …" |
| index.html JSON-LD (882-903) | sameAs uses `in.linkedin.com` | Use the canonical URL (Q-16). Add `alumniOf` (Vishwakarma Institute of Technology, Pune). **No email or phone.** |
