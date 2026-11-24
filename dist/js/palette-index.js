/* =====================================================================
   DC. — palette-index.js  (owner CHROME · design-system §10.13)
   Static, network-free index for the command palette (js/palette.js).
   Copy comes from docs/content-ledger.md only (approved one-line
   summaries, §0 decisions, §4 approved wording). Paths are written
   relative to dist/ and resolved per page by DC.paletteIndex.resolve():
   ''      on index.html / 404.html
   '../'   on projects/*.html
   Item shape:
     { id, group, title, hint, href?, external?, action?, kw? }
   - group: one of GROUPS[].id (display order = array order)
   - href: dist-relative path, '#hash' (current page), or absolute URL
   - action: id handled by palette.js (copy-email, replay, motion, index)
   - kw: extra search words (never displayed)
   Attaches to window.DC only (no other globals).
   ===================================================================== */
(function () {
  'use strict';
  var DC = window.DC = window.DC || {};
  if (DC.paletteIndex) return;

  var GROUPS = [
    { id: 'recent', label: 'Recent' },
    { id: 'page', label: 'On this page' },
    { id: 'section', label: 'Sections' },
    { id: 'case', label: 'Case studies' },
    { id: 'chapter', label: 'Case-study sections' },
    { id: 'lab', label: 'Labs' },
    { id: 'note', label: 'Notebook' },
    { id: 'research', label: 'Research' },
    { id: 'action', label: 'Actions' }
  ];

  var ITEMS = [
    /* ---- Sections (home page chapters, §13.1) ---- */
    { id: 's-work', group: 'section', title: 'I — Selected work', hint: 'Five plates from the archive', href: 'index.html#work', icon: 'arrow-right', kw: 'work projects plates gallery portfolio' },
    { id: 's-evidence', group: 'section', title: 'II — Evidence', hint: 'Figures with their sources', href: 'index.html#evidence', icon: 'arrow-right', kw: 'evidence figures proof sources' },
    { id: 's-bench', group: 'section', title: 'III — The bench', hint: 'Operate the systems', href: 'index.html#bench', icon: 'arrow-right', kw: 'bench labs lab experiments interactive demo operate' },
    { id: 's-research', group: 'section', title: 'IV — Research & about', hint: 'Papers, granted patent, education', href: 'index.html#research', icon: 'arrow-right', kw: 'research papers about education vit pune skills achievements certifications' },
    { id: 's-contact', group: 'section', title: 'V — Correspondence', hint: 'Email and profiles', href: '#contact', icon: 'arrow-right', kw: 'contact email correspondence hire internship links' },

    /* ---- Case studies (ledger §3 one-line summaries; gallery order §12.8) ---- */
    { id: 'c-kaaran', group: 'case', key: 'kaaran', title: 'Kaaran', hint: 'A bilingual education-data analyst where Claude handles language and code computes every figure.', href: 'projects/kaaran.html', icon: 'file', kw: 'pl 01 bilingual marathi education analyst claude anthropic hackathon data to action fastapi pandas' },
    { id: 'c-tutor', group: 'case', key: 'tutor', title: 'Neuro-symbolic tree tutor', hint: 'A team-built tree-structure tutor where rule-based validators check invariants and an LLM explains them.', href: 'projects/tutor.html', icon: 'file', kw: 'pl 02 avl tree rotation tutor validators llm niraj chavan team' },
    { id: 'c-federated', group: 'case', key: 'federated', title: 'Federated learning for ASD research', hint: 'Team research project on training an ASD facial-image classifier with federated learning; a research prototype, not a diagnostic tool.', href: 'projects/federated.html', icon: 'file', kw: 'pl 03 fedavg federated averaging efficientnetb0 asd autism research' },
    { id: 'c-certivault', group: 'case', key: 'certivault', title: 'CertiVault', hint: 'A PHP/MySQL platform that signs certificates and lets anyone verify them, with six distinct verdicts.', href: 'projects/certivault.html', icon: 'file', kw: 'pl 04 certificate verify verification php mysql signature openssl rsa qr' },
    { id: 'c-notebook', group: 'case', key: 'notebook', title: 'Engineering notebook', hint: 'Interactive notes on two engineering decisions: how insertion order shapes tree height, and how rank fusion orders search results.', href: 'projects/notebook.html', icon: 'file', kw: 'pl 05 notebook benchmarks trees rrf rank fusion c++' },

    /* ---- Case-study sections (stable ids only; the current page's own
           sections are added at runtime as "On this page") ---- */
    { id: 'ch-kaaran-lab', group: 'chapter', title: 'Kaaran · How it works', hint: 'Case-study chapter with the evidence lab', href: 'projects/kaaran.html#how-it-works', icon: 'arrow-right', kw: 'kaaran lab how it works chapter' },
    { id: 'ch-tutor-lab', group: 'chapter', title: 'Tree tutor · How it works', hint: 'Case-study chapter with the rotation lab', href: 'projects/tutor.html#how-it-works', icon: 'arrow-right', kw: 'tutor avl lab how it works chapter' },
    { id: 'ch-federated-lab', group: 'chapter', title: 'Federated learning · How it works', hint: 'Case-study chapter with the averaging lab', href: 'projects/federated.html#how-it-works', icon: 'arrow-right', kw: 'federated fedavg lab how it works chapter' },

    /* ---- Labs (deep links; contracts in audit-code §2.1) ---- */
    { id: 'l-kaaran', group: 'lab', title: 'Kaaran evidence lab', hint: 'Home bench · trace an answer to its records', href: 'index.html#lab/kaaran', icon: 'play', kw: 'kaaran evidence lab bench clusters records' },
    { id: 'l-kaaran-mr', group: 'lab', title: 'Kaaran evidence lab, in Marathi', hint: 'Kaaran case study · Marathi evidence', href: 'projects/kaaran.html#lab/kaaran?lang=mr', icon: 'play', kw: 'kaaran marathi mr language bilingual lab' },
    { id: 'l-tutor', group: 'lab', title: 'Tree rotation lab', hint: 'Home bench · restore the balance', href: 'index.html#lab/tutor', icon: 'play', kw: 'tutor avl rotation tree lab bench balance' },
    { id: 'l-tutor-solved', group: 'lab', title: 'Tree rotation lab, solved', hint: 'Tree tutor case study · right rotation at 30', href: 'projects/tutor.html#lab/tutor?moves=R30', icon: 'play', kw: 'tutor avl rotation solved r30 answer' },
    { id: 'l-federated', group: 'lab', title: 'Federated averaging lab', hint: 'Home bench · weight the client updates', href: 'index.html#lab/federated', icon: 'play', kw: 'federated fedavg averaging weights clients lab bench' },
    { id: 'l-federated-uneven', group: 'lab', title: 'Federated averaging, uneven clients', hint: 'Federated case study · sample counts 1, 1, 2', href: 'projects/federated.html#lab/federated?counts=1,1,2', icon: 'play', kw: 'federated fedavg uneven counts weighted lab' },

    /* ---- Notebook entries (projects/notebook.html; audit-code §2.1) ---- */
    { id: 'n-trees', group: 'note', title: 'How tall does a tree grow?', hint: 'Notebook · insertion order and tree height', href: 'projects/notebook.html#trees', icon: 'arrow-right', kw: 'trees avl red black splay height benchmark insertion order' },
    { id: 'n-trees-random', group: 'note', title: 'Tree heights, random insertion order', hint: 'Notebook · 10,000 insert calls, height', href: 'projects/notebook.html#trees?order=random&size=10000&metric=height', icon: 'play', kw: 'trees random order height benchmark' },
    { id: 'n-retrieval', group: 'note', title: 'Which review surfaces first?', hint: 'Notebook · reciprocal rank fusion', href: 'projects/notebook.html#retrieval', icon: 'arrow-right', kw: 'retrieval rrf rank fusion bm25 semantic hybrid search review summarizer' },
    { id: 'n-insertion', group: 'note', title: 'AVL insertion replay', hint: 'Notebook · step through ascending insertions', href: 'projects/notebook.html#insertion', icon: 'play', kw: 'avl insertion replay step canvas' },

    /* ---- Research (ledger §0b updated evidence) ---- */
    { id: 'r-icnpcv', group: 'research', title: 'Lightweight Handwritten Character Recognition Using EfficientNetB0', hint: 'Published and presented · IEEE ICNPCV 2026', href: 'https://doi.org/10.1109/icnpcv69434.2026.11708952', external: true, icon: 'arrow-up-right', kw: 'paper ieee icnpcv emnist handwriting efficientnet publication doi' },
    { id: 'r-icondeepcom', group: 'research', title: 'Federated learning for cross-cultural ASD research', hint: 'Accepted · IConDeepCom 2026 · ICONDEEPCOM26_079', href: 'index.html#research', icon: 'arrow-right', kw: 'paper conference federated asd icondeepcom' },
    { id: 'r-tutor', group: 'research', title: 'Neuro-Symbolic Agentic AI for Concept-Level Learning and Misconception Repair', hint: 'Accepted manuscript · co-author', href: 'index.html#research', icon: 'arrow-right', kw: 'paper tutor misconception repair tree learning' },
    { id: 'r-patent', group: 'research', title: 'A System Consisting of Solar Technology with Hydroponics', hint: 'Co-inventor · No. 2025/09215 · Granted 24 June 2026', href: 'index.html#research', icon: 'arrow-right', kw: 'patent granted co-inventor solar hydroponics' },

    /* ---- Actions ---- */
    { id: 'a-copy', group: 'action', title: 'Copy email address', hint: 'durgesh.chaudhari24@vit.edu', action: 'copy-email', icon: 'copy', kw: 'copy email address contact clipboard mail' },
    { id: 'a-mail', group: 'action', title: 'Write an email', hint: 'Opens your mail app', href: 'mailto:durgesh.chaudhari24@vit.edu', icon: 'mail', kw: 'email mail mailto contact write message' },
    { id: 'a-resume', group: 'action', title: 'Open résumé', hint: 'PDF', href: 'assets/Durgesh-Chaudhari-Resume.pdf', icon: 'pdf', kw: 'resume cv pdf curriculum vitae' },
    { id: 'a-github', group: 'action', title: 'View GitHub', hint: 'github.com/DurgeshC16', href: 'https://github.com/DurgeshC16', external: true, icon: 'github', kw: 'github code repositories source' },
    { id: 'a-linkedin', group: 'action', title: 'View LinkedIn', hint: 'linkedin.com/in/durgesh-chaudhari-420408331', href: 'https://in.linkedin.com/in/durgesh-chaudhari-420408331', external: true, icon: 'linkedin', kw: 'linkedin profile network' },
    { id: 'a-leetcode', group: 'action', title: 'Algorithm practice on LeetCode', hint: 'leetcode.com/u/strangeDC', href: 'https://leetcode.com/u/strangeDC/', external: true, icon: 'arrow-up-right', kw: 'leetcode algorithms practice' },
    { id: 'a-replay', group: 'action', title: 'Replay Fig. 1', hint: 'Re-run the hero animation', action: 'replay', icon: 'reset', kw: 'replay hero animation truss figure monogram' },
    { id: 'a-motion', group: 'action', title: 'Pause motion', hint: 'Stop non-essential animation on this site', action: 'motion', icon: 'pause', kw: 'pause motion reduce animation accessibility resume' },
    { id: 'a-index', group: 'action', title: 'Open the site index', hint: 'Full-screen contents', action: 'index', icon: 'menu', kw: 'index menu navigation contents' }
  ];

  /* Depth of the current page below dist/ ('' for root pages, '../' for projects/*). */
  function computePrefix() {
    try {
      if (!DC.root) return '';
      var rootPath = new URL(DC.root).pathname;
      var here = location.pathname;
      if (here.indexOf(rootPath) !== 0) return '';
      var rest = here.slice(rootPath.length);
      var depth = rest.split('/').length - 1;
      var p = '';
      for (var i = 0; i < depth; i++) p += '../';
      return p;
    } catch (e) { return ''; }
  }
  var prefix = computePrefix();

  DC.paletteIndex = {
    groups: GROUPS,
    items: ITEMS,
    prefix: prefix,
    /* resolve(path) -> relative URL for this page ('#x' stays on this page; absolute URLs pass through) */
    resolve: function (path) {
      path = String(path || '');
      if (!path || path.charAt(0) === '#' || /^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
      return prefix + path.replace(/^\.?\//, '');
    }
  };
})();
