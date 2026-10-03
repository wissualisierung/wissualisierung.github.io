/**
 * WissualisierungOS / WissOS 2.0 – Assistent
 * Ein animiertes Pixel-Buch, das nach einer Phase der Inaktivität aufklappt
 * und einen Befund aus der Lehr-Lern-Forschung samt Quelle zeigt.
 *
 * - Standardmäßig AUS. Ein-/Ausschalten über Startmenü › Werkzeuge › Assistent.
 * - Texte stehen in config.assistant.tips als { text, source } oder als
 *   String "Befund (Quelle: Autor, Jahr)". Leer = eingebaute Befunde.
 * - Zustand wird in WissOS.storage unter 'assistant_enabled' gespeichert.
 * - Terminal ("tipp") und Systemhilfe nutzen dieselben Befunde.
 *
 * Öffentliche API (WissOS.Assistant):
 *   init(config, bus, storage), isEnabled(), setEnabled(bool, showNow),
 *   toggle(showNow), show(), next(), hide(),
 *   getTips(), randomTip(), formatTip(tip)
 *
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'assistant_enabled';
  var DEFAULT_IDLE_SECONDS = 60;

  var _config = null, _bus = null, _storage = null;
  var _initialized = false;
  var _enabled = false;
  var _idleTimer = null;
  var _listenersAttached = false;
  var _el = null;          // Container-Element (wenn sichtbar)
  var _deck = [];          // gemischte Reihenfolge der Tipp-Indizes
  var _lastIndex = -1;

  // Befunde aus der Lehr-Lern-Forschung. Formulierung bewusst neutral:
  // Befund + Quelle, keine Handlungsanweisung. Überschreibbar via config.assistant.tips.
  var DEFAULT_TIPS = [
    { text: 'Nach einer Frage warteten Lehrkräfte in Rowes Beobachtungen meist weniger als eine Sekunde. Bei drei Sekunden oder mehr wurden die Antworten länger und begründeter.',
      source: 'Rowe, 1986' },
    { text: 'In einer großen Metaanalyse verschlechterte Feedback in rund einem Drittel der Fälle die Leistung. Entscheidend war, ob es auf die Aufgabe oder auf die Person zielte.',
      source: 'Kluger & DeNisi, 1996' },
    { text: 'Schüler, die nur schriftliche Kommentare bekamen, zeigten danach mehr Interesse und bessere Leistungen. Kamen Note und Kommentar zusammen, wirkte das ähnlich wie die Note allein.',
      source: 'Butler, 1988' },
    { text: 'Wer einen Text abrufend wiederholte, behielt nach zwei Tagen und nach einer Woche deutlich mehr als die Gruppe, die erneut las. Fünf Minuten nach dem Lernen lag die Lesegruppe noch vorn.',
      source: 'Roediger & Karpicke, 2006' },
    { text: 'Über 317 Experimente hinweg ist verteiltes Üben bei Abrufaufgaben dem geballten Üben für das langfristige Behalten überlegen. Das beste Intervall hängt davon ab, wie lange das Wissen behalten werden soll.',
      source: 'Cepeda et al., 2006' },
    { text: 'Kinder, die für ihre Intelligenz gelobt wurden, wählten danach eher leichte Aufgaben. Nach Misserfolgen schnitten sie schlechter ab als Kinder, die für ihre Anstrengung gelobt wurden.',
      source: 'Mueller & Dweck, 1998' },
    { text: 'In 80 Klassen der Jahrgangsstufen 1 und 2 unterschieden sich effektive und weniger effektive Lehrkräfte nicht darin, wie sie auf Störungen reagierten. Der Unterschied lag im Vorbeugen: Präsenz („withitness“) und mehrere Vorgänge zugleich im Blick behalten („overlapping“).',
      source: 'Kounin, 1970' },
    { text: 'Anfänger lernen oft mehr, wenn sie ausgearbeitete Lösungsbeispiele durchdenken, als wenn sie gleichwertige Aufgaben selbst lösen.',
      source: 'Sweller & Cooper, 1985' },
    { text: 'Lösungsbeispiele helfen vor allem Anfängern. Mit wachsendem Vorwissen verschwindet dieser Vorteil oder kehrt sich um; dann ist selbstständiges Lösen wirksamer.',
      source: 'Kalyuga et al., 2003' },
    { text: 'Studierende, die Geometrieaufgaben gemischt statt blockweise übten, schnitten im Test eine Woche später deutlich besser ab.',
      source: 'Rohrer & Taylor, 2007' },
    { text: 'Für die Annahme, dass Unterricht nach „visuell/auditiv/kinästhetisch“ zu besserem Lernen führt, fand eine Übersichtsarbeit keine belastbaren Belege.',
      source: 'Pashler et al., 2008' },
    { text: 'Markieren und erneutes Lesen wurden in einer umfassenden Übersicht als wenig wirksam eingestuft. Selbsttests und verteiltes Üben schnitten am besten ab.',
      source: 'Dunlosky et al., 2013' },
    { text: 'Lernende, die sich beim Lesen von Beispielen selbst erklärten, warum ein Schritt funktioniert, verstanden den Stoff besser.',
      source: 'Chi et al., 1989' },
    { text: 'Selbst erzeugte Wörter bleiben besser im Gedächtnis als bloß gelesene, auch wenn das Erzeugen trivial ist.',
      source: 'Slamecka & Graf, 1978' },
    { text: 'Interessante, aber für das Thema unwichtige Zusatzinformationen in Lernmaterial verschlechterten das Verständnis.',
      source: 'Harp & Mayer, 1998' },
    { text: 'Erwartungseffekte von Lehrkräften gibt es, sie sind aber meist kleiner als oft behauptet. Bei Lernenden aus ärmeren Verhältnissen fallen sie größer aus.',
      source: 'Jussim & Harber, 2005' },
    { text: 'Schüler, die sich vor der Instruktion an einem Problem versuchten und dabei scheiterten, übertrugen das Gelernte später besser auf neue Aufgaben.',
      source: 'Kapur, 2008' }
  ];

  // ------------------------------------------------------------------
  //  Hilfsfunktionen
  // ------------------------------------------------------------------

  function getStorage() {
    return _storage || (window.WissOS && WissOS.storage) || null;
  }

  // Wandelt einen Eintrag in { text, source } um. Strings der Form
  // "Befund (Quelle: Autor, Jahr)" werden in Text und Quelle zerlegt.
  function normalizeTip(tip) {
    if (!tip) return null;
    if (typeof tip === 'string') {
      var m = tip.match(/^([\s\S]*?)\s*\(Quelle:\s*([^)]+)\)\s*$/);
      return m ? { text: m[1], source: m[2].trim() } : { text: tip, source: '' };
    }
    return { text: tip.text || '', source: tip.source || '' };
  }

  function getTips() {
    var cfg = _config || (window.WissOS && WissOS.config) || {};
    var a = cfg.assistant || {};
    var list = (Array.isArray(a.tips) && a.tips.length) ? a.tips : DEFAULT_TIPS;
    return list.map(normalizeTip).filter(function (t) { return t && t.text; });
  }

  function formatTip(tip) {
    if (!tip) return '';
    return tip.source ? tip.text + ' (Quelle: ' + tip.source + ')' : tip.text;
  }

  function randomTip() {
    var tips = getTips();
    return tips.length ? tips[Math.floor(Math.random() * tips.length)] : null;
  }

  function getIdleMs() {
    var a = (_config && _config.assistant) || {};
    var s = Number(a.idleSeconds) || DEFAULT_IDLE_SECONDS;
    return Math.max(5, s) * 1000;
  }

  // Zieht den nächsten Tipp aus einem gemischten Stapel, ohne direkte Wiederholung
  function drawTip() {
    var tips = getTips();
    if (!tips.length) return null;
    if (!_deck.length) {
      _deck = tips.map(function (_, i) { return i; });
      for (var i = _deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = _deck[i]; _deck[i] = _deck[j]; _deck[j] = t;
      }
      if (_deck.length > 1 && _deck[_deck.length - 1] === _lastIndex) {
        _deck.unshift(_deck.pop());
      }
    }
    _lastIndex = _deck.pop();
    return tips[_lastIndex];
  }

  // ------------------------------------------------------------------
  //  Inaktivitäts-Timer
  // ------------------------------------------------------------------

  function scheduleIdle() {
    clearTimeout(_idleTimer);
    if (!_enabled || _el) return;
    _idleTimer = setTimeout(function () {
      if (_enabled && !_el) show();
    }, getIdleMs());
  }

  function onActivity() {
    // Solange der Assistent sichtbar ist, bleibt er stehen,
    // damit man in Ruhe lesen und „Weiter“ klicken kann.
    if (!_enabled || _el) return;
    scheduleIdle();
  }

  function attachListeners() {
    if (_listenersAttached) return;
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'].forEach(function (evt) {
      document.addEventListener(evt, onActivity, { passive: true });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && _el) hide();
    });
    _listenersAttached = true;
  }

  // ------------------------------------------------------------------
  //  Darstellung
  // ------------------------------------------------------------------

  function injectStyles() {
    if (document.getElementById('assistant-style')) return;
    var css = [
      '#assistant{position:fixed;right:16px;bottom:calc(var(--taskbar-height,44px) + 12px);z-index:8000;',
      'display:flex;flex-direction:column;align-items:flex-end;gap:2px;',
      'max-width:min(330px,calc(100vw - 32px));animation:wa-in .35s ease-out both}',
      '#assistant.wa-closing{animation:wa-outro .4s ease-in .25s both}',

      '.wa-bubble{position:relative;background:var(--color-window-bg,#FFFDF5);color:var(--color-text,#1A1A1A);',
      'border:3px solid var(--color-text,#1A1A1A);box-shadow:4px 4px 0 var(--color-text,#1A1A1A);',
      'padding:12px 14px 10px;margin-right:28px;font-family:var(--font-body,system-ui,sans-serif);',
      'font-size:13px;line-height:1.5;opacity:0;animation:wa-pop .25s ease-out .65s forwards}',
      '.wa-bubble::after{content:"";position:absolute;right:18px;bottom:-12px;width:0;height:0;',
      'border-left:10px solid transparent;border-right:10px solid transparent;',
      'border-top:12px solid var(--color-text,#1A1A1A)}',
      '.wa-bubble::before{content:"";position:absolute;right:21px;bottom:-7px;width:0;height:0;z-index:1;',
      'border-left:7px solid transparent;border-right:7px solid transparent;',
      'border-top:8px solid var(--color-window-bg,#FFFDF5)}',
      '.wa-title{font-family:var(--font-system,monospace);font-size:11px;font-weight:bold;',
      'letter-spacing:.06em;text-transform:uppercase;opacity:.65;margin-bottom:4px}',
      '.wa-text{margin:0}',
      '.wa-source{margin-top:6px;font-size:11px;opacity:.7;font-style:italic}',
      '.wa-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}',
      '.wa-btn{font-family:var(--font-system,monospace);font-size:12px;font-weight:bold;cursor:pointer;',
      'padding:3px 10px;background:var(--color-button-face,#E0E0E0);color:var(--color-text,#1A1A1A);',
      'border:2px solid var(--color-text,#1A1A1A);box-shadow:2px 2px 0 var(--color-text,#1A1A1A)}',
      '.wa-btn:hover{background:var(--color-primary,#7DFFC2)}',
      '.wa-btn:active{transform:translate(2px,2px);box-shadow:none}',
      '.wa-bubble.wa-swap .wa-text,.wa-bubble.wa-swap .wa-source{animation:wa-fade .25s ease-out}',

      '.wa-book{width:72px;height:63px;cursor:pointer;background:none;border:0;padding:0;',
      'animation:wa-bob 2.6s ease-in-out 1s infinite}',
      '.wa-book svg{display:block;width:100%;height:100%;shape-rendering:crispEdges;overflow:visible}',
      '.wa-ink{fill:var(--color-text,#1A1A1A)}',
      '.wa-paper{fill:#FFFDF5;stroke:var(--color-text,#1A1A1A);stroke-width:2}',
      '.wa-cover-fill{fill:var(--color-secondary,#FF6B9D);stroke:var(--color-text,#1A1A1A);stroke-width:2}',
      '.wa-back{fill:var(--color-secondary,#FF6B9D);stroke:var(--color-text,#1A1A1A);stroke-width:2;filter:brightness(.8)}',
      '.wa-label{fill:#FFFDF5;stroke:var(--color-text,#1A1A1A);stroke-width:1}',
      '.wa-line{fill:var(--color-text,#1A1A1A);opacity:.35}',
      '.wa-cheek{fill:var(--color-secondary,#FF6B9D);opacity:.55}',

      '.wa-cover{transform-box:view-box;transform-origin:32px 28px;animation:wa-open .6s ease-in-out .2s both}',
      '.wa-outside{animation:wa-hide-half .6s steps(1,end) .2s both}',
      '.wa-inside{opacity:0;animation:wa-show-half .6s steps(1,end) .2s both}',
      '#assistant.wa-closing .wa-cover{animation:wa-shut .35s ease-in-out both}',
      '#assistant.wa-closing .wa-outside{animation:wa-show-half-r .35s steps(1,end) both}',
      '#assistant.wa-closing .wa-inside{animation:wa-hide-half-r .35s steps(1,end) both}',

      '.wa-eye{transform-box:fill-box;transform-origin:center;animation:wa-blink 4.5s 1.4s infinite}',
      '.wa-mouth-open{opacity:0}',
      '#assistant.wa-talking .wa-mouth-open{animation:wa-talk .28s steps(1,end) 6}',
      '#assistant.wa-talking .wa-mouth-closed{animation:wa-talk-r .28s steps(1,end) 6}',

      '@keyframes wa-in{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}',
      '@keyframes wa-outro{to{transform:translateY(24px);opacity:0}}',
      '@keyframes wa-pop{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:none}}',
      '@keyframes wa-fade{from{opacity:0}to{opacity:1}}',
      '@keyframes wa-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}',
      '@keyframes wa-open{from{transform:scaleX(1)}to{transform:scaleX(-1)}}',
      '@keyframes wa-shut{from{transform:scaleX(-1)}to{transform:scaleX(1)}}',
      '@keyframes wa-hide-half{0%{opacity:1}50%{opacity:0}100%{opacity:0}}',
      '@keyframes wa-show-half{0%{opacity:0}50%{opacity:1}100%{opacity:1}}',
      '@keyframes wa-hide-half-r{0%{opacity:1}50%{opacity:0}100%{opacity:0}}',
      '@keyframes wa-show-half-r{0%{opacity:0}50%{opacity:1}100%{opacity:1}}',
      '@keyframes wa-blink{0%,94%,100%{transform:scaleY(1)}96%{transform:scaleY(.15)}}',
      '@keyframes wa-talk{0%{opacity:1}50%{opacity:0}}',
      '@keyframes wa-talk-r{0%{opacity:0}50%{opacity:1}}',

      '@media (max-width:520px){.wa-bubble{font-size:12.5px;margin-right:20px}.wa-book{width:60px;height:53px}}',
      '@media (prefers-reduced-motion:reduce){',
      '#assistant,#assistant *{animation:none!important}',
      '.wa-bubble{opacity:1}.wa-cover{transform:scaleX(-1)}.wa-outside{opacity:0}.wa-inside{opacity:1}}'
    ].join('');
    var style = document.createElement('style');
    style.id = 'assistant-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Pixel-Buch: Rückendeckel, rechte Seite mit Gesicht, aufklappender Vorderdeckel
  var BOOK_SVG =
    '<svg viewBox="0 0 64 56" aria-hidden="true" focusable="false">' +
      // Schatten
      '<rect x="8" y="51" width="48" height="3" class="wa-ink" opacity=".18"/>' +
      // Rückendeckel
      '<rect x="3" y="7" width="58" height="42" class="wa-back"/>' +
      // Rechte Seite mit Gesicht
      '<rect x="32" y="9" width="26" height="38" class="wa-paper"/>' +
      '<rect x="38" y="20" width="3" height="5" class="wa-ink wa-eye"/>' +
      '<rect x="49" y="20" width="3" height="5" class="wa-ink wa-eye"/>' +
      '<rect x="36" y="28" width="4" height="2" class="wa-cheek"/>' +
      '<rect x="50" y="28" width="4" height="2" class="wa-cheek"/>' +
      '<rect x="42" y="31" width="6" height="2" class="wa-ink wa-mouth-closed"/>' +
      '<rect x="42" y="30" width="6" height="5" class="wa-ink wa-mouth-open"/>' +
      '<rect x="40" y="40" width="12" height="1" class="wa-line"/>' +
      // Buchrücken
      '<rect x="31" y="7" width="2" height="42" class="wa-ink"/>' +
      // Vorderdeckel (klappt um den Rücken nach links)
      '<g class="wa-cover">' +
        '<g class="wa-inside">' +
          '<rect x="32" y="9" width="26" height="38" class="wa-paper"/>' +
          '<rect x="37" y="15" width="16" height="2" class="wa-line"/>' +
          '<rect x="37" y="20" width="16" height="2" class="wa-line"/>' +
          '<rect x="37" y="25" width="12" height="2" class="wa-line"/>' +
          '<rect x="37" y="30" width="16" height="2" class="wa-line"/>' +
          '<rect x="37" y="35" width="10" height="2" class="wa-line"/>' +
        '</g>' +
        '<g class="wa-outside">' +
          '<rect x="32" y="7" width="29" height="42" class="wa-cover-fill"/>' +
          '<rect x="38" y="16" width="17" height="10" class="wa-label"/>' +
          '<rect x="41" y="20" width="11" height="2" class="wa-ink"/>' +
        '</g>' +
      '</g>' +
    '</svg>';

  function render(tip) {
    _el = document.createElement('aside');
    _el.id = 'assistant';
    _el.setAttribute('aria-label', 'Assistent');

    var bubble = document.createElement('div');
    bubble.className = 'wa-bubble';
    bubble.innerHTML =
      '<div class="wa-title">Aus der Forschung</div>' +
      '<p class="wa-text" aria-live="polite"></p>' +
      '<div class="wa-source"></div>' +
      '<div class="wa-actions">' +
        '<button type="button" class="wa-btn" id="assistant-next">Weiter</button>' +
        '<button type="button" class="wa-btn" id="assistant-close" aria-label="Assistent schließen">✕</button>' +
      '</div>';

    var book = document.createElement('button');
    book.type = 'button';
    book.className = 'wa-book';
    book.title = 'Nächster Befund';
    book.setAttribute('aria-label', 'Nächster Befund');
    book.innerHTML = BOOK_SVG;

    _el.appendChild(bubble);
    _el.appendChild(book);

    bubble.querySelector('#assistant-next').addEventListener('click', function (e) {
      e.stopPropagation();
      next();
    });
    bubble.querySelector('#assistant-close').addEventListener('click', function (e) {
      e.stopPropagation();
      hide();
    });
    book.addEventListener('click', function (e) {
      e.stopPropagation();
      next();
    });

    document.body.appendChild(_el);
    setTip(tip, false);
  }

  function setTip(tip, animate) {
    if (!_el || !tip) return;
    var bubble = _el.querySelector('.wa-bubble');
    _el.querySelector('.wa-text').textContent = tip.text || '';
    var src = _el.querySelector('.wa-source');
    src.textContent = tip.source ? 'Quelle: ' + tip.source : '';
    src.style.display = tip.source ? '' : 'none';

    // Mund bewegt sich kurz, als ob das Buch spricht
    _el.classList.remove('wa-talking');
    void _el.offsetWidth;
    _el.classList.add('wa-talking');

    if (animate) {
      bubble.classList.remove('wa-swap');
      void bubble.offsetWidth;
      bubble.classList.add('wa-swap');
    }
  }

  // ------------------------------------------------------------------
  //  Öffentliche Aktionen
  // ------------------------------------------------------------------

  function show() {
    var tip = drawTip();
    if (!tip) return;
    clearTimeout(_idleTimer);
    if (_el) {
      _el.classList.remove('wa-closing');
      setTip(tip, true);
      return;
    }
    injectStyles();
    render(tip);
  }

  function next() {
    if (!_el) { show(); return; }
    var tip = drawTip();
    if (tip) setTip(tip, true);
  }

  function hide() {
    if (!_el) return;
    var el = _el;
    _el = null;
    el.classList.add('wa-closing');
    setTimeout(function () { el.remove(); }, 700);
    scheduleIdle();
  }

  function setEnabled(enabled, showNow) {
    _enabled = !!enabled;
    var st = getStorage();
    if (st && st.set) st.set(STORAGE_KEY, _enabled);

    if (_enabled) {
      attachListeners();
      if (showNow) show(); else scheduleIdle();
    } else {
      clearTimeout(_idleTimer);
      hide();
      clearTimeout(_idleTimer);
    }
    if (_bus) _bus.emit('assistant:state', { enabled: _enabled });
    return _enabled;
  }

  function isEnabled() {
    if (_initialized) return _enabled;
    var st = getStorage();
    return !!(st && st.get && st.get(STORAGE_KEY, false));
  }

  var module = {
    init: function (config, bus, storage) {
      _config = config;
      _bus = bus;
      _storage = storage;
      _initialized = true;

      var st = getStorage();
      _enabled = !!(st && st.get && st.get(STORAGE_KEY, false));
      if (_enabled) {
        attachListeners();
        scheduleIdle();
      }

      if (_bus) {
        _bus.on('system:action', function (data) {
          if (data && data.action === 'toggle-assistant') setEnabled(!_enabled, true);
        });
      }
    },
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    toggle: function (showNow) { return setEnabled(!isEnabled(), showNow); },
    show: show,
    next: next,
    hide: hide,
    getTips: getTips,
    randomTip: randomTip,
    formatTip: formatTip
  };

  WissOS.Assistant = module;
})();
