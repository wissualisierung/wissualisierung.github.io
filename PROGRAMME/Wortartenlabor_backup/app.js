/* ==========================================================
   WORTARTEN-LABOR – Logik
   CC-BY-SA 4.0 Sebastian Wolf
   ========================================================== */
(function () {
  'use strict';

  const D = window.WAL_DATA;
  const TESTS = D.TESTS;
  const TEST_IDS = TESTS.map(t => t.id);
  const T = Object.fromEntries(TESTS.map(t => [t.id, t]));
  const WA = Object.fromEntries(D.WORTARTEN.map(w => [w.id, w]));
  const SUGGEST_ORDER = ['flex', 'konj', 'steig', 'art', 'sg', 'solo', 'kasus', 'fuege'];

  const $ = sel => document.querySelector(sel);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ---------------------------------------------------------
     HILFSFUNKTIONEN
     --------------------------------------------------------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const bare = w => w.replace(/[!?.,;:]/g, '').trim();
  const fmt = s => esc(s).replace(/\\n/g, '\n').replace(/~([^~]+)~/g, '<s>$1</s>').replace(/\n/g, '<br>');
  const fmtSentence = s => esc(s).replace(/\*([^*]+)\*/g, '<mark>$1</mark>');
  const akk = t => (t.art === 'der' ? 'den' : 'die');
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const bit = (waId, testId) => WA[waId].profile[TEST_IDS.indexOf(testId)] === '1';
  const keyOf = w => w.w + '|' + w.wa;

  /* ---------------------------------------------------------
     PIXEL-SPRITES
     --------------------------------------------------------- */
  const PAL = {
    k: '#3b3355', w: '#ffffff', g: '#e6f4ff', c: '#d9a066', l: '#9ee6c8', d: '#6fcfa8', r: '#ff9ec0',
    a: '#7fb3e8', b: '#ffd166', e: '#8ecae6', p: '#ffadc9', m: '#7ed9b5', s: '#d8d8e8', R: '#ff7a95',
    u: '#c3a6ff', G: '#8fd88f', y: '#fff07a'
  };
  const PROF = [
    '......kkkk......',
    '.....kcccck.....',
    '......kggk......',
    '......kggk......',
    '.....kgggwk.....',
    '....kggggwgk....',
    '...kggggggwgk...',
    '..kllllllllllk..',
    '..kllkkllkkllk..',
    '.klllkkllkklllk.',
    '.kllrllllllrllk.',
    'kllllkllllkllllk',
    'klllllkkkklllllk',
    'kdddwddddddddddk',
    'kddddddddwdddddk',
    '.kkkkkkkkkkkkkk.'
  ];
  const PROF_BLINK = PROF.slice();
  PROF_BLINK[8] = '..kllllllllllk..';
  const PROF_HAPPY = PROF.slice();
  PROF_HAPPY[8] = '..kllkkllkkllk..';
  PROF_HAPPY[9] = '.klkllkkkkllklk.';
  PROF_HAPPY[11] = 'kllllkkkkkkllllk';
  PROF_HAPPY[12] = 'klllllkrrklllllk';

  const ICONS = {
    flex: ['....kkkk....', '..kk....kk..', '.k........k.', 'k........kkk', 'k.........k.', 'k...........',
           '...........k', '.k.........k', 'kkk........k', '.k........k.', '..kk....kk..', '....kkkk....'],
    konj: ['............', '.pp..bb..ee.', '.pp..bb..ee.', '............', 'ppppbbbbeeee', 'ppppbbbbeeee',
           'ppppbbbbeeee', '.pp..bb..ee.', '.pp..bb..ee.', '.pp..bb..ee.', '............', 'kkkkkkkkkkkk'],
    steig: ['..........k.', '.........kkk', '........kkkk', '..........k.', '........GGGG', '........GGGG',
            '....GGGGGGGG', '....GGGGGGGG', 'GGGGGGGGGGGG', 'GGGGGGGGGGGG', 'kkkkkkkkkkkk', '............'],
    art: ['.....aa.....', '..a.aaaa.a..', '.aaaaaaaaaa.', '..aaaaaaaa..', '.aaaawwaaaa.', 'aaaawwwwaaaa',
          'aaaawwwwaaaa', '.aaaawwaaaa.', '..aaaaaaaa..', '.aaaaaaaaaa.', '..a.aaaa.a..', '.....aa.....'],
    sg: ['............', '.kkk........', '.kuk........', '.kuk..k.....', '.kuk.kk.....', '.kukkkkkkkk.',
         '.kukkkkkkkk.', '.kuk.kk.....', '.kuk..k.....', '.kuk........', '.kkk........', '............'],
    kasus: ['............', '.sss....sss.', '.sss....sss.', '.kkk....kkk.', '.RRR....RRR.', '.RRR....RRR.',
            '.RRR....RRR.', '.RRRR..RRRR.', '..RRRRRRRR..', '...RRRRRR...', '............', '..y..y..y...'],
    fuege: ['............', '............', '............', 'kkkk....kkkk', 'kmmk.kk.kppk', 'kmmkkkkkkppk',
            'kmmkkkkkkppk', 'kmmk.kk.kppk', 'kkkk....kkkk', '............', '............', '............'],
    solo: ['.kkkkkkkkkk.', 'kwwwwwwwwwwk', 'kwwwwRRwwwwk', 'kwwwwRRwwwwk', 'kwwwwRRwwwwk', 'kwwwwRRwwwwk',
           'kwwwwwwwwwwk', 'kwwwwRRwwwwk', 'kwwwwwwwwwwk', '.kkkkkkkkkk.', '...kk.......', '...k........']
  };

  function drawSprite(canvas, map) {
    const ctx = canvas.getContext('2d');
    canvas.width = map[0].length; canvas.height = map.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    map.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch !== '.' && PAL[ch]) { ctx.fillStyle = PAL[ch]; ctx.fillRect(x, y, 1, 1); }
    }));
  }

  /* ---------------------------------------------------------
     SOUND (8-Bit über WebAudio)
     --------------------------------------------------------- */
  let AC = null;
  function tone(freq, dur, when = 0, type = 'square', vol = 0.045) {
    if (!state.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = AC.currentTime + when;
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* kein Audio verfügbar */ }
  }
  const seq = (notes, step = 0.08, type) => notes.forEach((f, i) => tone(f, step * 1.1, i * step, type));
  const SFX = {
    click: () => tone(880, 0.04),
    whoosh: () => seq([300, 420, 560], 0.04, 'triangle'),
    work: () => seq(Array.from({ length: 8 }, () => 200 + Math.random() * 500), 0.07),
    ok: () => seq([523, 659, 784]),
    no: () => seq([392, 311, 233], 0.1, 'sawtooth'),
    right: () => seq([523, 659, 784, 1047, 784, 1047], 0.07),
    wrong: () => seq([180, 140], 0.15, 'sawtooth'),
    unlock: () => seq([392, 523, 659, 784, 1047, 1319], 0.06)
  };

  /* ---------------------------------------------------------
     ZUSTAND (wird nicht gespeichert)
     --------------------------------------------------------- */
  const state = {
    words: D.WORDS.map(w => normalize(w, false)),
    mode: 'alle',
    order: [],
    current: null,
    results: {},
    testCount: 0,
    attempts: 0,
    wrongs: new Set(),
    done: false,
    solved: new Set(),
    unlocked: new Set(),
    justUnlocked: null,
    points: 0,
    streak: 0,
    hints: true,
    sound: true,
    busy: false,
    tickets: {}
  };

  function normalize(w, custom) {
    return { w: w.w, wa: w.wa, s: w.s || '', t: w.t || {}, ov: w.ov || {}, tipp: w.tipp || '', custom: !!custom, isNew: !!custom };
  }

  function pool() {
    return state.words.filter(w => {
      if (state.mode === 'eigene') return w.custom;
      if (state.mode === 'basis') return WA[w.wa].group === 'basis';
      if (state.mode === 'profi') return WA[w.wa].group === 'profi';
      return true;
    });
  }

  function actualOk(word, id) {
    return (id in word.ov) ? word.ov[id] : bit(word.wa, id);
  }

  function machineText(word, id, ok) {
    if (word.t[id]) return word.t[id];
    const b = bare(word.w), W = cap(b), wa = word.wa;
    if (ok) return `„${word.w}" besteht die ${T[id].sub}.`;
    switch (id) {
      case 'flex':  return `${b} → ${b} → ${b}\nDas Wort bleibt in jeder Lage gleich.`;
      case 'konj':  return `ich ${b}? · du ${b}? · sie ${b}?\nKeine Endungen für Person und Zeit.`;
      case 'steig': return /r$/.test(b) ? `${b} → ??? → ???\nKein Komparativ, kein Superlativ.`
                                        : `~*${b}er · *am ${b}sten~\nKein Komparativ, kein Superlativ.`;
      case 'art': {
        let s = `~*der ${b} · *die ${b} · *das ${b}~\nKein Artikel möglich.`;
        if (wa === 'Verb') s += `\n(Achtung: „das ${W}" wäre schon ein neues Wort – ein Nomen!)`;
        if (wa === 'Adjektiv') s += `\n(Achtung: „das ${W}e" wäre schon ein neues Wort – ein Nomen!)`;
        return s;
      }
      case 'sg':
        if (wa === 'Verb') return 'Verben bilden das Prädikat – den Kern des Satzes.\nAllein vor dem Verb? Es IST das Verb. Diese Probe hilft hier nicht weiter.';
        return `~*${W} spielt Tim Fußball.~\nAllein vor dem Verb geht es nicht.`;
      case 'kasus': return `${b} + der / des / dem / den …?\nKein bestimmter Fall wird erzwungen.`;
      case 'fuege': return `~*Tim ${b} Ida spielen.~\nEs verbindet nichts miteinander.`;
      case 'solo':  return `„${W}!" – Hä?\nGanz allein (ohne Satz oder Frage davor) ist das keine vollständige Äußerung.`;
    }
    return '';
  }

  function candidates() {
    return D.WORTARTEN.filter(wa => Object.keys(state.results).every(id => bit(wa.id, id) === state.results[id])).map(w => w.id);
  }

  /* ---------------------------------------------------------
     UI: KOPF / STATISTIK
     --------------------------------------------------------- */
  function bump(id) { const s = $(id).parentElement; s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); }
  function renderStats(popPoints) {
    const p = pool();
    $('#stat-points').textContent = state.points;
    $('#stat-streak').textContent = state.streak;
    $('#stat-solved').textContent = `${p.filter(w => state.solved.has(keyOf(w))).length}/${p.length}`;
    $('#stat-collection').textContent = `${state.unlocked.size}/10`;
    if (popPoints) { bump('#stat-points'); bump('#stat-streak'); }
  }

  function speak(html, mood) {
    $('#prof-bubble').innerHTML = html;
    const prof = $('.prof');
    prof.classList.remove('talk'); void prof.offsetWidth; prof.classList.add('talk');
    drawSprite($('#prof-sprite'), mood === 'happy' ? PROF_HAPPY : PROF);
  }

  function toast(msg, ms = 2400) {
    const t = $('#toast'); t.innerHTML = msg; t.hidden = false;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), ms);
  }

  /* ---------------------------------------------------------
     UI: REGAL
     --------------------------------------------------------- */
  function newRound() {
    state.order = shuffle(pool().map(keyOf));
  }

  function renderShelf() {
    const shelf = $('#shelf');
    shelf.innerHTML = '';
    const byKey = Object.fromEntries(pool().map(w => [keyOf(w), w]));
    state.order.filter(k => byKey[k]).forEach((k, i) => {
      const w = byKey[k];
      const solved = state.solved.has(k);
      const b = el('button', 'tube' + (solved ? ' is-solved' : '') + (state.current && keyOf(state.current) === k ? ' is-current' : '') + (w.isNew ? ' is-new' : ''));
      b.setAttribute('role', 'listitem');
      b.id = 'tube-' + i;
      b.title = solved ? `${w.w} – ${w.wa}` : w.w;
      b.style.setProperty('--liquid', solved ? WA[w.wa].color : 'var(--lilac)');
      b.innerHTML = `<span>${esc(w.w)}</span>`;
      b.addEventListener('click', () => { SFX.click(); selectWord(w); });
      shelf.appendChild(b);
    });
  }

  /* ---------------------------------------------------------
     UI: MASCHINEN
     --------------------------------------------------------- */
  function buildMachines() {
    const box = $('#machines');
    TESTS.forEach((t, i) => {
      const m = el('button', 'machine px-box');
      m.id = 'machine-' + t.id;
      m.dataset.id = t.id;
      m.style.setProperty('--mc', t.color);
      m.title = `${t.name} (${t.sub}) – Taste ${i + 1}`;
      m.innerHTML = `
        <div class="m-top"><span class="m-key">${i + 1}</span><span class="m-lamps"><i></i><i></i><i></i></span></div>
        <div class="m-body">
          <canvas class="m-icon"></canvas>
          <span class="m-name">${t.name}</span>
          <span class="m-q">${t.q}</span>
        </div>
        <div class="m-chute"></div>`;
      drawSprite(m.querySelector('canvas'), ICONS[t.id]);
      m.addEventListener('click', () => runTest(t.id));
      box.appendChild(m);
    });
  }

  function resetMachines() {
    document.querySelectorAll('.machine').forEach(m => {
      m.classList.remove('tested', 'working');
      const r = m.querySelector('.m-result'); if (r) r.remove();
    });
  }

  /* ---------------------------------------------------------
     UI: VERDÄCHTIGE / DIAGNOSE / PROTOKOLL
     --------------------------------------------------------- */
  function buildDiagnose() {
    const box = $('#diagnose');
    D.WORTARTEN.forEach(wa => {
      const b = el('button', 'btn diag-btn px-box', wa.id);
      b.id = 'diag-' + wa.id.toLowerCase().replace(/ä/g, 'ae');
      b.dataset.wa = wa.id;
      b.style.setProperty('--wc', wa.color);
      b.addEventListener('click', () => diagnose(wa.id));
      box.appendChild(b);
    });
  }

  function renderSuspects() {
    const box = $('#suspects');
    const c = candidates();
    box.innerHTML = '';
    D.WORTARTEN.forEach(wa => {
      const s = el('span', 'suspect', wa.id);
      s.style.setProperty('--wc', wa.color);
      if (!c.includes(wa.id)) s.classList.add('out');
      else if (c.length === 1) s.classList.add('last');
      box.appendChild(s);
    });
  }

  function renderProtocol() {
    const ol = $('#protocol');
    ol.innerHTML = '';
    const ids = Object.keys(state.results);
    if (!ids.length) { ol.appendChild(el('li', 'empty', 'Noch keine Proben durchgeführt.')); return; }
    ids.forEach(id => {
      const ok = state.results[id];
      ol.appendChild(el('li', '', `<b>${T[id].name}</b> → <span class="${ok ? 'ok' : 'no'}">${ok ? '✓ ' + T[id].okLabel : '✗ ' + T[id].noLabel}</span>`));
    });
  }

  function showTicket(id) {
    const ok = state.results[id];
    const t = T[id];
    const slot = $('#printer-slot');
    slot.innerHTML = '';
    const tk = el('div', 'ticket');
    tk.innerHTML = `
      <div class="t-head"><span>${t.name.toUpperCase()} · ${t.sub}</span><span>„${esc(state.current.w)}"</span></div>
      <div class="t-verdict ${ok ? 'ok' : 'no'}">${ok ? '✓ ' + t.okLabel : '✗ ' + t.noLabel}</div>
      <div class="t-out">${fmt(machineText(state.current, id, ok))}</div>`;
    slot.appendChild(tk);
    const led = $('#printer-led');
    led.className = 'led ' + (ok ? 'on-ok' : 'on-no');
  }

  /* ---------------------------------------------------------
     BESTIMMUNGSBAUM
     --------------------------------------------------------- */
  const TREE = [
    { id: 'root', label: 'WORT', x: 505, y: 22 },
    { id: 'F', label: 'flektierbar', x: 265, y: 68, p: 'root' },
    { id: 'N', label: 'nicht flektierbar', x: 770, y: 68, p: 'root' },
    { id: 'konj', label: 'konjugierbar', x: 70, y: 135, p: 'F' },
    { id: 'komp', label: 'komparierbar', x: 175, y: 178, p: 'F' },
    { id: 'dekl', label: 'deklinierbar', x: 370, y: 135, p: 'F' },
    { id: 'artf', label: 'artikelfähig', x: 265, y: 225, p: 'dekl' },
    { id: 'sgY', label: 'kann SG sein', x: 370, y: 262, p: 'dekl' },
    { id: 'sgN', label: 'kann nicht SG sein', x: 482, y: 225, p: 'dekl' },
    { id: 'integ', label: 'syntaktisch integriert', x: 680, y: 135, p: 'N' },
    { id: 'iso', label: 'syntaktisch isoliert', x: 912, y: 135, p: 'N' },
    { id: 'adv', label: 'kann SG/Attribut sein', x: 585, y: 215, p: 'integ' },
    { id: 'nsg', label: 'kann nicht SG/Attribut sein', x: 780, y: 205, p: 'integ' },
    { id: 'kas', label: 'Kasusforderung', x: 672, y: 270, p: 'nsg' },
    { id: 'fug', label: 'Fügteil', x: 770, y: 270, p: 'nsg' },
    { id: 'L-Verb', leaf: 'Verb', x: 70, y: 335, p: 'konj' },
    { id: 'L-Adjektiv', leaf: 'Adjektiv', x: 175, y: 370, p: 'komp' },
    { id: 'L-Nomen', leaf: 'Nomen', x: 265, y: 335, p: 'artf' },
    { id: 'L-Pronomen', leaf: 'Pronomen', x: 370, y: 370, p: 'sgY' },
    { id: 'L-Artikel', leaf: 'Artikel', x: 482, y: 335, p: 'sgN' },
    { id: 'L-Adverb', leaf: 'Adverb', x: 585, y: 370, p: 'adv' },
    { id: 'L-Präposition', leaf: 'Präposition', x: 672, y: 335, p: 'kas' },
    { id: 'L-Konjunktion', leaf: 'Konjunktion', x: 778, y: 370, p: 'fug' },
    { id: 'L-Partikel', leaf: 'Partikel', x: 878, y: 335, p: 'nsg' },
    { id: 'L-Satzäquivalent', leaf: 'Satzäquivalent', x: 940, y: 372, p: 'iso' }
  ];
  const NODE = Object.fromEntries(TREE.map(n => [n.id, n]));
  // Welche Wortarten liegen unter welchem Knoten?
  TREE.forEach(n => (n.under = new Set()));
  TREE.filter(n => n.leaf).forEach(leaf => {
    let cur = leaf;
    while (cur) { cur.under.add(leaf.leaf); cur = cur.p ? NODE[cur.p] : null; }
  });

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, parent) {
    const e = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    if (parent) parent.appendChild(e);
    return e;
  }

  function buildTree() {
    const root = $('#tree');
    const gEdges = svg('g', {}, root), gNodes = svg('g', {}, root);
    TREE.forEach(n => {
      if (n.p) {
        const p = NODE[n.p];
        n.edge = svg('line', { x1: p.x, y1: p.y + 12, x2: n.x, y2: n.y - 12, class: 'edge' }, gEdges);
      }
      const g = svg('g', { class: 'node' + (n.leaf ? ' leaf' : '') + (n.id === 'root' ? ' root' : '') }, gNodes);
      const label = n.leaf || n.label;
      const w = Math.max(64, label.length * (n.leaf ? 8.6 : 7.9) + 18);
      n.rect = svg('rect', { x: n.x - w / 2, y: n.y - 13, width: w, height: 26, rx: 0 }, g);
      n.text = svg('text', { x: n.x, y: n.y + 1 }, g);
      n.text.textContent = label;
      n.g = g;
      if (n.leaf) n.rect.style.fill = WA[n.leaf].color;
    });
  }

  function renderTree() {
    const c = state.current ? candidates() : D.WORTARTEN.map(w => w.id);
    const showLogic = state.hints && state.current && Object.keys(state.results).length > 0;
    const solvedWa = state.done ? state.current.wa : null;
    TREE.forEach(n => {
      let cls = 'node' + (n.leaf ? ' leaf' : '') + (n.id === 'root' ? ' root' : '');
      let s = '';
      if (solvedWa) {
        s = n.under.has(solvedWa) ? 'yes' : 'no';
      } else if (showLogic && n.id !== 'root' && c.length) {
        const inside = c.filter(x => n.under.has(x)).length;
        s = inside === 0 ? 'no' : (inside === c.length ? 'yes' : '');
      }
      if (s) cls += ' ' + s;
      if (n.leaf) {
        const unlocked = state.unlocked.has(n.leaf);
        n.text.textContent = unlocked ? n.leaf : '???';
        if (!unlocked) cls += ' locked';
        n.rect.style.fill = unlocked ? WA[n.leaf].color : '#fff';
        if (!solvedWa && showLogic && c.length === 1 && c[0] === n.leaf) cls += ' proven';
        if (state.justUnlocked === n.leaf) cls += ' unlocked-now';
      }
      n.g.setAttribute('class', cls);
      if (n.edge) n.edge.setAttribute('class', 'edge' + (s ? ' ' + s : ''));
    });
  }

  /* ---------------------------------------------------------
     SPIELABLAUF
     --------------------------------------------------------- */
  function selectWord(word) {
    if (state.busy) return;
    state.current = word;
    state.results = {};
    state.attempts = 0;
    state.wrongs = new Set();
    state.justUnlocked = null;
    state.done = false;
    const replay = state.solved.has(keyOf(word));

    const card = $('#word-card');
    card.classList.remove('solved', 'shake');
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    $('#word-text').textContent = word.w;
    $('#word-no').textContent = String(state.order.indexOf(keyOf(word)) + 1).padStart(2, '0');
    $('#word-stamp').hidden = true;
    $('#word-sentence').innerHTML = word.s ? '„' + fmtSentence(word.s) + '"' : '';
    $('#printer-slot').innerHTML = '<div class="ticket ticket-empty">Wähle eine Prüfmaschine (oder Taste 1–8).</div>';
    $('#printer-led').className = 'led';
    $('#btn-next').hidden = true;
    document.querySelectorAll('.diag-btn').forEach(b => { b.disabled = false; b.classList.remove('wrong', 'right'); });

    const belt = $('.belt'); belt.classList.add('fast'); setTimeout(() => belt.classList.remove('fast'), 500);
    SFX.whoosh();

    resetMachines();
    renderProtocol(); renderSuspects(); renderTree(); renderShelf();

    if (replay) speak(`„<b>${esc(word.w)}</b>" hast du schon bestimmt. Du kannst es nochmal untersuchen – Punkte gibt es dafür aber keine.`);
    else if (state.hints) speak(`Neue Probe: „<b>${esc(word.w)}</b>". Womit fangen wir an? Tipp: Der <b>Formwandler</b> trennt flektierbare von nicht flektierbaren Wörtern.`);
    else speak(`Neue Probe: „<b>${esc(word.w)}</b>". Viel Erfolg!`);
  }

  function runTest(id) {
    if (!state.current) { speak('Nimm zuerst ein Wort aus dem Regal!'); return; }
    if (state.busy) return;
    if (id in state.results) { SFX.click(); showTicket(id); speak(`Diese Probe hast du schon gemacht – hier ist der Ausdruck nochmal.`); return; }
    state.busy = true;
    document.querySelectorAll('.machine').forEach(m => (m.disabled = true));
    const machine = $('#machine-' + id);
    const card = $('#word-card');
    SFX.whoosh();

    // Wort fliegt in die Maschine
    const r = card.getBoundingClientRect();
    const mr = machine.getBoundingClientRect();
    const fly = el('div', 'flyer', esc(state.current.w));
    document.body.appendChild(fly);
    const fw = fly.offsetWidth, fh = fly.offsetHeight;
    fly.style.left = (r.left + r.width / 2 - fw / 2) + 'px';
    fly.style.top = (r.top + r.height / 2 - fh / 2) + 'px';
    card.style.opacity = '.35';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const dx = (mr.left + mr.width / 2) - (r.left + r.width / 2);
      const dy = (mr.top + mr.height * 0.35) - (r.top + r.height / 2);
      fly.style.transform = `translate(${dx}px, ${dy}px) scale(.25)`;
      fly.style.opacity = '0.2';
    }));

    $('#printer-led').className = 'led busy';
    setTimeout(() => {
      fly.remove();
      machine.classList.add('working');
      SFX.work();
    }, 450);

    setTimeout(() => {
      machine.classList.remove('working');
      card.style.opacity = '';
      const ok = actualOk(state.current, id);
      state.results[id] = ok;
      machine.classList.add('tested');
      const stamp = el('span', 'm-result ' + (ok ? 'ok' : 'no'), ok ? '✓' : '✗');
      machine.querySelector('.m-body').appendChild(stamp);
      (ok ? SFX.ok : SFX.no)();
      showTicket(id);
      renderProtocol(); renderSuspects(); renderTree();
      afterTestSpeech(id, ok);
      state.busy = false;
      document.querySelectorAll('.machine').forEach(m => (m.disabled = false));
    }, 1250);
  }

  function nextSuggestion() {
    const c = candidates();
    for (const id of SUGGEST_ORDER) {
      if (id in state.results) continue;
      const yes = c.filter(wa => bit(wa, id)).length;
      if (yes > 0 && yes < c.length) return T[id];
    }
    return null;
  }

  function afterTestSpeech(id, ok) {
    const t = T[id];
    let msg = `${cap(t.dat)} ${t.name}: ${ok ? t.okMsg : t.noMsg}`;
    if (state.done) { speak(msg); return; }
    if (!state.hints) { speak(msg + ' Was folgerst du daraus?'); return; }
    const c = candidates();
    if (c.length === 1) msg += '<br>⚑ <b>Beweis erbracht!</b> Nur noch eine Wortart ist möglich. Stell deine Diagnose!';
    else if (c.length === 0) msg += '<br>Merkwürdig – kein Profil passt genau. Entscheide mithilfe des Beispielsatzes!';
    else {
      const n = nextSuggestion();
      msg += `<br>Noch <b>${c.length}</b> Verdächtige.` + (n ? ` Weiter mit ${akk(n)} <b>${n.name}</b>?` : '');
    }
    speak(msg);
  }

  function giveTip() {
    if (!state.current) { speak('Nimm zuerst ein Wort aus dem Regal!'); return; }
    if (state.done) { speak('Dieses Wort ist schon gelöst. Weiter geht\'s mit dem nächsten!'); return; }
    const c = candidates();
    if (c.length === 1) { speak('Die Proben haben schon alles bewiesen. Schau bei den Verdächtigen, wer noch übrig ist!'); return; }
    const n = nextSuggestion();
    if (n) speak(`Mein Tipp: Schick das Wort durch ${akk(n)} <b>${n.name}</b>. Die Frage dort: <i>${n.q}</i>`);
    else speak('Hmm, die Maschinen helfen hier nicht weiter. Lies den Beispielsatz genau!');
  }

  function diagnose(waId) {
    if (!state.current) { speak('Nimm zuerst ein Wort aus dem Regal!'); return; }
    if (state.busy || state.done) return;
    const card = $('#word-card');
    if (Object.keys(state.results).length === 0) {
      SFX.wrong();
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      speak('Halt! Im Labor gilt: <b>Erst prüfen, dann urteilen.</b> Schick das Wort durch mindestens eine Maschine.');
      return;
    }
    const word = state.current;
    const key = keyOf(word);
    const btn = document.querySelector(`.diag-btn[data-wa="${waId}"]`);

    if (waId === word.wa) {
      const replay = state.solved.has(key);
      const proven = candidates().length === 1;
      let gain = 0, bonus = 0;
      if (!replay) {
        gain = state.attempts === 0 ? 10 : state.attempts === 1 ? 4 : 1;
        if (proven && state.attempts === 0) bonus = 5;
        state.points += gain + bonus;
        state.streak = state.attempts === 0 ? state.streak + 1 : 0;
        state.solved.add(key);
      }
      state.done = true;
      const first = !state.unlocked.has(waId);
      state.unlocked.add(waId);
      state.justUnlocked = first ? waId : null;

      btn.classList.add('right');
      document.querySelectorAll('.diag-btn').forEach(b => (b.disabled = true));
      card.classList.add('solved');
      card.style.setProperty('--solved-bg', WA[waId].color);
      const stamp = $('#word-stamp');
      stamp.textContent = waId.toUpperCase(); stamp.hidden = false;
      stamp.style.animation = 'none'; void stamp.offsetWidth; stamp.style.animation = '';
      SFX.right();
      confetti(card);
      if (first) setTimeout(() => { SFX.unlock(); toast(`◆ Neue Wortart entdeckt: <b>${waId}</b>!`); }, 700);

      const w = WA[waId];
      let msg = `<b>Richtig!</b> „${esc(word.w)}" ist ${w.ein} <b>${waId}</b>. `;
      if (!replay) msg += `+${gain}${bonus ? ` +${bonus} Beweis-Bonus` : ''} ★<br>`;
      msg += `<small>${w.path}</small>`;
      if (word.tipp) msg += `<br>ℹ ${esc(word.tipp)}`;
      speak(msg, 'happy');

      $('#btn-next').hidden = false;
      renderStats(true); renderTree(); renderShelf();
      checkRoundComplete();
    } else {
      state.attempts++;
      state.streak = 0;
      state.wrongs.add(waId);
      btn.classList.add('wrong'); btn.disabled = true;
      SFX.wrong();
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      speak(wrongHint(waId));
      renderStats();
    }
  }

  function wrongHint(chosen) {
    const w = WA[chosen];
    if (!state.hints) return `Leider nicht. „${esc(state.current.w)}" ist kein${w.ein === 'eine' ? 'e' : ''} ${chosen}. Prüfe weiter!`;
    const diffs = SUGGEST_ORDER.filter(id => bit(chosen, id) !== actualOk(state.current, id));
    const tested = diffs.filter(id => id in state.results);
    if (tested.length) {
      const t = T[tested[0]], ok = state.results[tested[0]];
      return `Nicht ganz! Schau ins Protokoll: ${cap(t.art)} ${t.name} meldete <b>${ok ? t.okLabel : t.noLabel}</b>. ${cap(w.ein)} ${chosen} wäre dort ${bit(chosen, tested[0]) ? 'durchgekommen' : 'gescheitert'}.`;
    }
    if (diffs.length) {
      const t = T[diffs[0]];
      return `Hmm, ${w.ein} ${chosen}? Überprüf das: Schick das Wort durch ${akk(t)} <b>${t.name}</b>. ${cap(w.ein)} ${chosen} würde dort ${bit(chosen, diffs[0]) ? 'bestehen' : 'scheitern'}.`;
    }
    return 'Knapp daneben! Lies den Beispielsatz noch einmal genau.';
  }

  function nextWord() {
    if (state.busy) return;
    const p = pool();
    const open = state.order.filter(k => !state.solved.has(k) && p.some(w => keyOf(w) === k) && (!state.current || k !== keyOf(state.current)));
    if (!open.length) { checkRoundComplete(true); return; }
    const k = open[Math.floor(Math.random() * open.length)];
    selectWord(p.find(w => keyOf(w) === k));
  }

  function checkRoundComplete(force) {
    const p = pool();
    if (!p.length) return;
    const all = p.every(w => state.solved.has(keyOf(w)));
    if (!all) return;
    setTimeout(() => {
      drawSprite($('#win-sprite'), PROF_HAPPY);
      $('#win-text').innerHTML = `Alle <b>${p.length}</b> Wörter dieser Auswahl sind bestimmt!<br>
        Laborpunkte: <b>${state.points} ★</b><br>
        Entdeckte Wortarten: <b>${state.unlocked.size}/10</b>`;
      openModal('#modal-win');
      SFX.unlock();
    }, force ? 0 : 1600);
  }

  function confetti(anchor) {
    const r = anchor.getBoundingClientRect();
    const cols = ['#ffc9de', '#bff0dc', '#fff2a8', '#c7e3ff', '#ddd0ff', '#ffd8b8'];
    for (let i = 0; i < 34; i++) {
      const c = el('div', 'confetti');
      c.style.left = (r.left + r.width / 2) + 'px';
      c.style.top = (r.top + r.height / 2) + 'px';
      c.style.background = cols[i % cols.length];
      c.style.border = '2px solid #3b3355';
      c.style.setProperty('--dx', (Math.random() * 520 - 260) + 'px');
      c.style.setProperty('--dy', (Math.random() * 320 - 220) + 'px');
      c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 1300);
    }
  }

  /* ---------------------------------------------------------
     MARKDOWN-INTEGRATION
     --------------------------------------------------------- */
  const KEYMAP = {
    wortart: 'wa', satz: 's', beispielsatz: 's', beispiel: 's', tipp: 'tipp', hinweis: 'tipp',
    formwandler: 'flex', flexion: 'flex', flex: 'flex', flexionsprobe: 'flex',
    konjugator: 'konj', konjugation: 'konj', konj: 'konj',
    steigerer: 'steig', steigerung: 'steig', komparation: 'steig', steig: 'steig',
    artikel: 'art', artikelmaschine: 'art', art: 'art', artikelprobe: 'art',
    satzglied: 'sg', satzgliedprobe: 'sg', vorfeld: 'sg', sg: 'sg',
    kasus: 'kasus', kasusmagnet: 'kasus', fall: 'kasus',
    fuegteil: 'fuege', fuegeteil: 'fuege', fuegteilkleber: 'fuege', kleber: 'fuege', fuege: 'fuege', verbindung: 'fuege',
    solo: 'solo', solokapsel: 'solo', isoliert: 'solo', isolation: 'solo'
  };
  const WA_SYN = { substantiv: 'Nomen', hauptwort: 'Nomen', interjektion: 'Satzäquivalent', ausruf: 'Satzäquivalent',
                   partikeln: 'Partikel', begleiter: 'Artikel', fuerwort: 'Pronomen', bindewort: 'Konjunktion',
                   verhaeltniswort: 'Präposition', umstandswort: 'Adverb', eigenschaftswort: 'Adjektiv', zeitwort: 'Verb' };
  const norm = s => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z]/g, '');

  function resolveWa(v) {
    const n = norm(v);
    const hit = D.WORTARTEN.find(w => norm(w.id) === n);
    return hit ? hit.id : (WA_SYN[n] || null);
  }

  function parseMD(text) {
    const words = [], errors = [], warnings = [];
    let cur = null, lastKey = null;
    const finish = () => {
      if (!cur) return;
      if (!cur.wa) errors.push(`„${cur.w}": Wortart fehlt oder ist unbekannt${cur._waRaw ? ` („${cur._waRaw}")` : ''}.`);
      else { delete cur._waRaw; words.push(cur); }
    };
    text.replace(/\r/g, '').split('\n').forEach((line, i) => {
      const h = line.match(/^\s*#{2,3}\s+(.+?)\s*#*\s*$/);
      if (h) { finish(); cur = { w: h[1].trim(), wa: null, s: '', t: {}, ov: {}, tipp: '' }; lastKey = null; return; }
      if (/^\s*#\s/.test(line) || /^\s*(<!--.*-->)?\s*$/.test(line) || /^\s*>/.test(line) || /^\s*---\s*$/.test(line)) { lastKey = null; return; }
      if (!cur) return;
      const m = line.match(/^\s*[-*]?\s*([A-Za-zÄÖÜäöüß\- ]+?)\s*:\s*(.*)$/);
      const k = m ? KEYMAP[norm(m[1])] : null;
      if (k) {
        let v = m[2].trim();
        lastKey = k;
        if (k === 'wa') { cur.wa = resolveWa(v); cur._waRaw = v; }
        else if (k === 's') cur.s = v;
        else if (k === 'tipp') cur.tipp = v;
        else {
          const f = v.match(/^(ja|nein|✓|✗)(?:\s*[:|]\s*|\s+[-–]\s+|\s*$)(.*)$/i);
          if (f) { cur.ov[k] = /^(ja|✓)$/i.test(f[1]); v = f[2].trim(); }
          if (v) cur.t[k] = v;
        }
      } else if (lastKey && line.trim()) {
        const add = line.trim();
        if (lastKey === 's') cur.s += ' ' + add;
        else if (lastKey === 'tipp') cur.tipp += ' ' + add;
        else if (lastKey !== 'wa') cur.t[lastKey] = (cur.t[lastKey] ? cur.t[lastKey] + '\n' : '') + add;
      } else if (m) {
        warnings.push(`Zeile ${i + 1}: Unbekannter Schlüssel „${m[1].trim()}" wird ignoriert.`);
      }
    });
    finish();
    return { words, errors, warnings };
  }

  const KEYNAMES = { flex: 'Formwandler', konj: 'Konjugator', steig: 'Steigerer', art: 'Artikel', sg: 'Satzglied', kasus: 'Kasus', fuege: 'Fügteil', solo: 'Solo' };
  function toMD(words) {
    let out = '# Wortarten-Labor – Wortliste\n\n';
    words.forEach(w => {
      out += `## ${w.w}\nWortart: ${w.wa}\n`;
      if (w.s) out += `Satz: ${w.s}\n`;
      TEST_IDS.forEach(id => {
        const hasOv = id in w.ov;
        if (w.t[id] || hasOv) out += `${KEYNAMES[id]}: ${hasOv ? (w.ov[id] ? 'ja: ' : 'nein: ') : ''}${(w.t[id] || '').replace(/\n/g, '\\n')}\n`;
      });
      if (w.tipp) out += `Tipp: ${w.tipp}\n`;
      out += '\n';
    });
    return out;
  }

  const SAMPLE_MD = `# Meine Wörter für das Wortarten-Labor

## Fahrrad
Wortart: Nomen
Satz: Mein *Fahrrad* ist blau.
Formwandler: das Fahrrad → des Fahrrads → die Fahrräder
Artikel: das Fahrrad · ein Fahrrad
Satzglied: Das Fahrrad steht im Keller.

## springen
Wortart: Verb
Satz: Die Kinder *springen* ins Wasser.
Formwandler: springen → sprang → gesprungen
Konjugator: ich springe · du springst · sie sprang

## groß
Wortart: Adjektiv
Satz: Das ist ein *großer* Turm.
Formwandler: groß → große → großem
Steigerer: groß → größer → am größten
Satzglied: Groß ist der Turm.

## ohne
Wortart: Präposition
Satz: Ich gehe nicht *ohne* dich.
Kasus: ohne + AKKUSATIV: ohne den Hund\\n~*ohne dem Hund~

## denn
Wortart: Konjunktion
Satz: Ich bleibe hier, *denn* es regnet.
Fügteil: Ich bleibe hier, denn es regnet.\\n(verbindet zwei Hauptsätze)

## morgen
Wortart: Adverb
Satz: *Morgen* schreiben wir die Arbeit.
Satzglied: Morgen schreiben wir die Arbeit.

## Pst!
Wortart: Satzäquivalent
Satz: *Pst!* Das Baby schläft.
Solo: „Pst!" – ersetzt den Satz „Sei leise!".
`;

  function download(name, text) {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const a = el('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function importMD(text) {
    const rep = $('#md-report');
    const { words, errors, warnings } = parseMD(text);
    let html = '';
    if (words.length) {
      const fresh = words.map(w => normalize(w, true));
      const keys = new Set(fresh.map(keyOf));
      state.words = state.words.filter(w => !keys.has(keyOf(w))).concat(fresh);
      html += `<div class="ok">✓ ${words.length} Wort/Wörter importiert: ${fresh.map(w => `<b>${esc(w.w)}</b> (${w.wa})`).join(', ')}</div>`;
      const opt = $('#mode-select option[value="eigene"]'); opt.disabled = false;
      if ($('#md-only').checked) { state.mode = 'eigene'; $('#mode-select').value = 'eigene'; }
      newRound(); renderShelf(); renderStats();
      toast(`✎ ${words.length} neue Wörter im Regal!`);
    }
    if (!words.length && !errors.length) html += '<div class="err">Keine Wörter gefunden. Jedes Wort braucht eine Überschrift <code>## Wort</code> und eine Zeile <code>Wortart: …</code>.</div>';
    errors.forEach(e => (html += `<div class="err">✗ ${esc(e)}</div>`));
    warnings.forEach(w => (html += `<div class="err">⚠ ${esc(w)}</div>`));
    rep.innerHTML = html;
  }

  /* ---------------------------------------------------------
     MODALS
     --------------------------------------------------------- */
  function openModal(sel) { $(sel).hidden = false; const f = $(sel).querySelector('button, textarea'); if (f) f.focus(); }
  function closeModals() { document.querySelectorAll('.modal').forEach(m => (m.hidden = true)); }
  const anyModal = () => [...document.querySelectorAll('.modal')].some(m => !m.hidden);

  /* ---------------------------------------------------------
     EVENTS
     --------------------------------------------------------- */
  function bind() {
    $('#btn-random').addEventListener('click', () => { SFX.click(); nextWord(); });
    $('#btn-next').addEventListener('click', () => { SFX.click(); nextWord(); });
    $('#btn-tip').addEventListener('click', () => { SFX.click(); giveTip(); });

    $('#btn-hints').addEventListener('click', e => {
      state.hints = !state.hints;
      e.currentTarget.classList.toggle('is-on', state.hints);
      e.currentTarget.classList.toggle('is-off', !state.hints);
      $('#suspects-wrap').hidden = !state.hints;
      renderTree();
      speak(state.hints ? 'Hilfen sind an. Ich helfe dir beim Schlussfolgern!' : 'Hilfen sind aus. Jetzt bist du die Laborleitung!');
    });
    $('#btn-sound').addEventListener('click', e => {
      state.sound = !state.sound;
      e.currentTarget.classList.toggle('is-on', state.sound);
      e.currentTarget.classList.toggle('is-off', !state.sound);
      SFX.click();
    });
    $('#mode-select').addEventListener('change', e => {
      state.mode = e.target.value;
      newRound(); state.current = null; renderShelf(); renderStats(); nextWord();
    });
    $('#btn-tree').addEventListener('click', e => {
      const w = $('#tree-wrap'); w.classList.toggle('collapsed');
      e.currentTarget.textContent = w.classList.contains('collapsed') ? '▸ ausklappen' : '▾ einklappen';
    });

    $('#btn-help').addEventListener('click', () => openModal('#modal-help'));
    $('#btn-md').addEventListener('click', () => openModal('#modal-md'));
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModals));
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModals(); }));
    $('#btn-again').addEventListener('click', () => {
      pool().forEach(w => state.solved.delete(keyOf(w)));
      closeModals(); newRound(); state.current = null; renderShelf(); renderStats(); nextWord();
    });

    // Markdown
    $('#md-import').addEventListener('click', () => importMD($('#md-input').value));
    $('#md-sample').addEventListener('click', () => { $('#md-input').value = SAMPLE_MD; });
    $('#md-template').addEventListener('click', () => download('wortarten-labor-vorlage.md', SAMPLE_MD));
    $('#md-export').addEventListener('click', () => download('wortarten-labor-woerter.md', toMD(state.words)));
    $('#md-clear').addEventListener('click', () => {
      state.words = state.words.filter(w => !w.custom);
      $('#mode-select option[value="eigene"]').disabled = true;
      if (state.mode === 'eigene') { state.mode = 'alle'; $('#mode-select').value = 'alle'; }
      if (state.current && state.current.custom) state.current = null;
      newRound(); renderShelf(); renderStats();
      $('#md-report').innerHTML = '<div class="ok">Importierte Wörter entfernt.</div>';
      if (!state.current) nextWord();
    });
    const readFile = file => {
      if (!file) return;
      const fr = new FileReader();
      fr.onload = () => { $('#md-input').value = fr.result; importMD(fr.result); };
      fr.readAsText(file, 'UTF-8');
    };
    $('#md-file').addEventListener('change', e => { readFile(e.target.files[0]); e.target.value = ''; });
    const ta = $('#md-input');
    ta.addEventListener('dragover', e => { e.preventDefault(); ta.classList.add('drag'); });
    ta.addEventListener('dragleave', () => ta.classList.remove('drag'));
    ta.addEventListener('drop', e => { e.preventDefault(); ta.classList.remove('drag'); readFile(e.dataTransfer.files[0]); });

    // Tastatur
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeModals(); return; }
      if (anyModal() || /input|textarea|select/i.test(e.target.tagName)) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= TESTS.length) { runTest(TESTS[n - 1].id); e.preventDefault(); }
      else if (e.key === 'Enter' && !$('#btn-next').hidden) { nextWord(); e.preventDefault(); }
      else if (e.key.toLowerCase() === 'z') nextWord();
    });
  }

  /* ---------------------------------------------------------
     START
     --------------------------------------------------------- */
  function init() {
    drawSprite($('#logo-sprite'), PROF);
    drawSprite($('#prof-sprite'), PROF);
    setInterval(() => {
      const c = $('#prof-sprite');
      drawSprite(c, PROF_BLINK);
      setTimeout(() => drawSprite(c, state.done ? PROF_HAPPY : PROF), 160);
    }, 3200);
    buildMachines();
    buildDiagnose();
    buildTree();
    bind();
    newRound();
    renderStats();
    nextWord();
    speak(`Willkommen im <b>Wortarten-Labor</b>! Ich bin Prof. Kolbe. Schick das Wort „<b>${esc(state.current.w)}</b>" durch die Prüfmaschinen und finde heraus, welche Wortart es ist.`);
  }

  init();
})();
