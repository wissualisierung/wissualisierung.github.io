/* ============================================
   EpochenChat – HTML Exporter
   Bündelt alles in eine Standalone-HTML-Datei
   CC-BY-SA 4.0 Sebastian Wolf 2026
   ============================================ */

const EpochenExporter = (() => {
    'use strict';

    /**
     * Exportiert den Chat als einzelne HTML-Datei
     */
    async function exportAsHtml(config, estimatedMinutes) {
        const textarea = document.getElementById('editorTextarea');
        const markdown = textarea.value;
        const modules = EpochenParser.parse(markdown);

        if (modules.length === 0) {
            alert('Kein Chat-Inhalt zum Exportieren vorhanden.');
            return;
        }

        // Avatar als Base64 laden
        const avatarBase64 = await imageToBase64(config.avatarSrc);

        // Theme CSS sammeln
        const themeCSS = getThemeCSS(config.theme);

        // Dateiname generieren (keine Umlaute/Sonderzeichen)
        const safeName = sanitizeFilename(config.name);
        const filename = `epochenchat_${safeName}.html`;

        // HTML zusammenbauen
        const html = buildExportHtml({
            title: `EpochenChat: ${config.name}`,
            personaName: config.name,
            personaSource: config.source,
            creatorName: config.creator,
            theme: config.theme,
            themeCSS,
            avatarBase64,
            modules: JSON.stringify(modules),
            estimatedMinutes
        });

        // Download auslösen
        downloadFile(html, filename, 'text/html');
    }

    function buildExportHtml({ title, personaName, personaSource, creatorName, theme, themeCSS, avatarBase64, modules, estimatedMinutes }) {
        const creatorHtml = creatorName ? ` &nbsp;&bull;&nbsp; (${escHtml(creatorName)})` : '';
        return `<!DOCTYPE html>
<!--
  EpochenChat
  CC-BY-SA 4.0 Sebastian Wolf 2026
  https://creativecommons.org/licenses/by-sa/4.0/
-->
<html lang="de" data-theme="${theme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="EpochenChat: Interaktiver literarischer Chat mit ${personaName}. Geschätzte Bearbeitungszeit: ${estimatedMinutes} Minuten.">
    <title>${escHtml(title)}</title>
    <style>
${getPlayerCSS()}
${themeCSS}

/* Export-spezifisch */
body {
    margin: 0;
    padding: 0;
    background: var(--color-bg);
    min-height: 100vh;
}

.export-header {
    text-align: center;
    padding: 1rem;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    font-family: var(--font-sans);
    font-size: 0.8rem;
    color: var(--color-text-muted);
}

.export-time {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
}
.export-footer {
    text-align: center;
    padding: 0.6rem;
    font-family: var(--font-sans);
    font-size: 0.6rem;
    color: var(--color-text-muted);
    opacity: 0.6;
}
.export-footer a {
    color: var(--color-accent);
    text-decoration: none;
}
.export-footer a:hover { text-decoration: underline; }
.export-footer__cc {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--color-accent);
    border-radius: 50%;
    font-size: 0.4rem;
    font-weight: 700;
    text-transform: uppercase;
    line-height: 1;
    vertical-align: middle;
    margin-right: 1px;
}
    </style>
</head>
<body>
    <div class="export-header">
        <span class="export-time">⏱ Geschätzte Bearbeitungszeit: ${estimatedMinutes} Minuten${creatorHtml}</span>
    </div>
    <div class="chat-player" id="chatPlayer" role="log" aria-label="Literarischer Chat mit ${escHtml(personaName)}"></div>
    <footer class="export-footer"><a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener"><span class="export-footer__cc">cc</span> CC-BY-SA 4.0</a> Sebastian Wolf 2026</footer>

    <script>
// === EpochenChat Player (Inline) ===
(function() {
    'use strict';

    function escHtml(str) {
        if (!str) return '';
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    var AVATAR_SRC = '${avatarBase64}';
    var PERSONA_NAME = ${JSON.stringify(personaName)};
    var PERSONA_SOURCE = ${JSON.stringify(personaSource || '')};
    var THEME = ${JSON.stringify(theme)};
    var MODULES = ${modules};

    var container = document.getElementById('chatPlayer');
    var currentIndex = 0;
    var checkpointAnswers = [];
    var quizResults = [];
    var barometerResults = [];
    var freetextResults = [];
    var TYPING_DURATION = 800;

    function scrollToBottom() {
        requestAnimationFrame(function() {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
    }

    function createContinueButton() {
        var wrap = document.createElement('div');
        wrap.className = 'chat-continue';
        var btn = document.createElement('button');
        btn.className = 'chat-continue__btn';
        btn.innerHTML = 'Weiter ▾';
        btn.addEventListener('click', function() {
            wrap.remove();
            showNext();
        });
        wrap.appendChild(btn);
        return wrap;
    }

    function advanceAfterInteraction(el) {
        if (currentIndex < MODULES.length) {
            var btn = createContinueButton();
            el.after(btn);
            scrollToBottom();
        } else {
            setTimeout(function(){ showNext(); }, 600);
        }
    }

    function updateProgress() {
        var el = document.getElementById('chatProgressCurrent');
        if (el) el.textContent = currentIndex;
    }

    function renderProgress() {
        var el = document.createElement('div');
        el.className = 'chat-progress';
        el.innerHTML = '<span class="chat-progress__title">' + PERSONA_NAME + '</span>' +
            '<span class="chat-progress__icon">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px;fill:var(--color-accent)"><path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h12V4H6zm2 3h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>' +
            ' Seite <span id="chatProgressCurrent">0</span> von ' + MODULES.length +
            '</span>';
        container.appendChild(el);
    }

    function showTypingThenRender(mod) {
        var typing = document.createElement('div');
        typing.className = 'chat-typing';
        typing.innerHTML = '<div class="chat-avatar"><img src="' + AVATAR_SRC + '" alt="' + PERSONA_NAME + '" /></div>' +
            '<div class="chat-typing__dots"><span class="chat-typing__dot"></span><span class="chat-typing__dot"></span><span class="chat-typing__dot"></span></div>';
        container.appendChild(typing);
        scrollToBottom();
        setTimeout(function() {
            typing.remove();
            renderModule(mod);
        }, TYPING_DURATION);
    }

    function showNext() {
        if (currentIndex >= MODULES.length) {
            if (quizResults.length > 0 || barometerResults.length > 0 || checkpointAnswers.length > 0 || freetextResults.length > 0) {
                var summaryBtn = document.createElement('div');
                summaryBtn.className = 'chat-results-trigger';
                summaryBtn.innerHTML = '<button class="chat-results-trigger__btn"><span class="chat-results-trigger__icon">\uD83D\uDCCA</span><span class="chat-results-trigger__text">Zusammenfassung anzeigen</span></button>';
                container.appendChild(summaryBtn);
                scrollToBottom();
                summaryBtn.querySelector('.chat-results-trigger__btn').addEventListener('click', function(){
                    summaryBtn.remove();
                    container.appendChild(renderResultsSummary());
                    scrollToBottom();
                });
            }
            return;
        }
        var mod = MODULES[currentIndex];
        currentIndex++;
        updateProgress();
        if (mod.type === 'persona' && currentIndex > 1) {
            showTypingThenRender(mod);
        } else {
            renderModule(mod);
        }
    }

    function renderModule(mod) {
        var el;
        switch (mod.type) {
            case 'framing': el = renderFraming(mod); break;
            case 'persona': el = renderPersona(mod); break;
            case 'learner': el = renderLearner(mod); break;
            case 'quote': el = renderQuote(mod); break;
            case 'context': el = renderContext(mod); break;
            case 'quiz-single': el = renderQuiz(mod, false); break;
            case 'quiz-multi': el = renderQuiz(mod, true); break;
            case 'freetext': el = renderFreetext(mod); break;
            case 'barometer': el = renderBarometer(mod); break;
            case 'checkpoint': el = renderCheckpoint(mod); break;
            case 'image': el = renderImage(mod); break;
            case 'audio': el = renderAudio(mod); break;
            case 'annotation': el = renderAnnotation(mod); break;
            case 'self-assessment': el = renderSelfAssessment(mod); break;
            case 'timeline': el = renderTimeline(mod); break;
            case 'finale': el = renderFinale(mod); break;
            default: el = renderPersona(mod);
        }
        container.appendChild(el);
        scrollToBottom();
        var interactive = ['quiz-single','quiz-multi','freetext','barometer','checkpoint','framing','annotation','self-assessment','timeline'];
        if (!interactive.includes(mod.type)) {
            if (currentIndex < MODULES.length) {
                container.appendChild(createContinueButton());
                scrollToBottom();
            } else {
                setTimeout(function(){ showNext(); }, 600);
            }
        }
    }

    function renderFraming(mod) {
        var el = document.createElement('div');
        el.className = 'chat-framing';
        el.innerHTML = '<div class="chat-framing__icon" aria-hidden="true">📜</div>' +
            '<div class="chat-framing__title">Hinweis zur Figur</div>' +
            '<div class="chat-framing__text">' + mod.content + '</div>' +
            '<button class="chat-framing__btn">Verstanden – Chat starten ▸</button>';
        el.querySelector('button').addEventListener('click', function() {
            this.disabled = true;
            this.textContent = '✓ Gestartet';
            showNext();
        });
        return el;
    }

    function renderPersona(mod) {
        var el = document.createElement('div');
        el.className = 'chat-message chat-message--persona';
        var sourceHtml = PERSONA_SOURCE ? '<span class="chat-source-ref" title="Bildquelle: ' + escHtml(PERSONA_SOURCE) + '" tabindex="0" role="button">Q</span>' : '';
        el.innerHTML = '<div class="chat-avatar"><img src="' + AVATAR_SRC + '" alt="' + PERSONA_NAME + '" /></div>' +
            '<div><div class="chat-persona-name">' + PERSONA_NAME + ' ' + sourceHtml + '</div>' +
            '<div class="chat-bubble chat-bubble--persona">' + mod.content + '</div></div>';
        return el;
    }

    function renderLearner(mod) {
        var el = document.createElement('div');
        el.className = 'chat-message chat-message--learner';
        el.innerHTML = '<div><div class="chat-bubble chat-bubble--learner">' + mod.content + '</div></div>';
        return el;
    }

    function renderQuote(mod) {
        var el = document.createElement('div');
        el.className = 'chat-quote';
        el.innerHTML = '<div class="chat-quote__card"><div class="chat-quote__ornament" aria-hidden="true">❝</div>' +
            '<div class="chat-quote__text">' + mod.text + '</div>' +
            (mod.source ? '<div class="chat-quote__source">– ' + mod.source + '</div>' : '') + '</div>';
        return el;
    }

    function renderContext(mod) {
        var el = document.createElement('details');
        el.className = 'chat-context';
        el.innerHTML = '<summary class="chat-context__toggle"><span class="chat-context__arrow" aria-hidden="true">▸</span><span>Hintergrundwissen einblenden</span></summary>' +
            '<div class="chat-context__body">' + mod.content + '</div>';
        return el;
    }

    function renderQuiz(mod, isMulti) {
        var el = document.createElement('div');
        el.className = 'chat-quiz' + (isMulti ? ' chat-quiz--multi' : '');
        var uid = 'q' + Math.random().toString(36).substr(2,6);
        var opts = mod.options.map(function(o,i) {
            return '<label class="chat-quiz__option" data-index="' + i + '" data-correct="' + o.correct + '">' +
                '<input type="' + (isMulti?'checkbox':'radio') + '" name="' + uid + '" class="sr-only" />' +
                '<span class="chat-quiz__indicator" aria-hidden="true"></span><span>' + o.text + '</span></label>';
        }).join('');
        el.innerHTML = '<div class="chat-quiz__card"><div class="chat-quiz__question">' + mod.question + '</div>' +
            '<div class="chat-quiz__options">' + opts + '</div>' +
            '<button class="chat-quiz__check-btn" disabled>\u00dcberpr\u00fcfen</button>' +
            '<div class="chat-quiz__feedback" hidden></div></div>';

        var options = el.querySelectorAll('.chat-quiz__option');
        var checkBtn = el.querySelector('.chat-quiz__check-btn');
        var feedback = el.querySelector('.chat-quiz__feedback');

        options.forEach(function(opt) {
            opt.addEventListener('click', function() {
                if (opt.classList.contains('chat-quiz__option--locked')) return;
                var inp = opt.querySelector('input');
                inp.checked = !inp.checked || !isMulti;
                if (!isMulti) options.forEach(function(o){o.classList.remove('chat-quiz__option--selected');});
                opt.classList.toggle('chat-quiz__option--selected', inp.checked);
                checkBtn.disabled = !el.querySelector('input:checked');
            });
        });

        checkBtn.addEventListener('click', function() {
            var allCorrect = true;
            var feedbackMessages = [];
            options.forEach(function(opt, idx) {
                opt.classList.add('chat-quiz__option--locked');
                var inp = opt.querySelector('input');
                var corr = opt.dataset.correct === 'true';
                var optData = mod.options[idx];
                if (inp.checked && corr) {
                    opt.classList.add('chat-quiz__option--correct');
                    if (optData.feedback) feedbackMessages.push({correct:true,text:optData.feedback});
                } else if (inp.checked && !corr) {
                    opt.classList.add('chat-quiz__option--incorrect');
                    allCorrect = false;
                    if (optData.feedback) feedbackMessages.push({correct:false,text:optData.feedback});
                } else if (!inp.checked && corr) {
                    opt.classList.add('chat-quiz__option--correct');
                    allCorrect = false;
                }
            });
            checkBtn.disabled = true;
            checkBtn.textContent = '\u2713 Ausgewertet';
            feedback.hidden = false;
            if (feedbackMessages.length > 0) {
                feedback.className = 'chat-quiz__feedback chat-quiz__feedback--custom';
                feedback.innerHTML = feedbackMessages.map(function(fb){
                    return '<div class="chat-quiz__feedback-item ' + (fb.correct?'chat-quiz__feedback-item--correct':'chat-quiz__feedback-item--incorrect') + '">' + (fb.correct?'\u2713':'\u2717') + ' ' + fb.text + '</div>';
                }).join('');
            } else {
                feedback.className = 'chat-quiz__feedback ' + (allCorrect ? 'chat-quiz__feedback--correct' : 'chat-quiz__feedback--incorrect');
                feedback.textContent = allCorrect ? '\u2713 Richtig!' : '\u2717 Nicht ganz \u2013 die richtigen Antworten sind markiert.';
            }
            quizResults.push({question: mod.question, correct: allCorrect});
            advanceAfterInteraction(el);
        });
        return el;
    }

    function renderFreetext(mod) {
        var el = document.createElement('div');
        el.className = 'chat-freetext';
        el.innerHTML = '<div class="chat-freetext__card"><div class="chat-freetext__prompt">' + mod.prompt + '</div>' +
            '<textarea class="chat-freetext__textarea" placeholder="Schreibe hier deine Antwort..." rows="4"></textarea></div>';
        el.querySelector('textarea').addEventListener('input', function() {
            if (this.value.trim().length > 5 && !el._adv) {
                el._adv = true;
                freetextResults.push({prompt:mod.prompt,el:this});
                advanceAfterInteraction(el);
            }
        });
        return el;
    }

    function renderBarometer(mod) {
        var el = document.createElement('div');
        el.className = 'chat-barometer';
        el.innerHTML = '<div class="chat-barometer__card"><div class="chat-barometer__statement">' + mod.statement + '</div>' +
            '<div class="chat-barometer__slider-wrap"><input type="range" class="chat-barometer__input" min="1" max="10" value="5" aria-label="' + mod.statement + '" /></div>' +
            '<div class="chat-barometer__labels"><span>' + mod.min + '</span><span>' + mod.max + '</span></div>' +
            '<div class="chat-barometer__value">5</div>' +
            '<button class="chat-barometer__submit">Bestätigen</button></div>';
        var inp = el.querySelector('input[type="range"]');
        var val = el.querySelector('.chat-barometer__value');
        var sub = el.querySelector('button');
        inp.addEventListener('input', function(){val.textContent=inp.value;});
        sub.addEventListener('click', function(){barometerResults.push({statement:mod.statement,value:parseInt(inp.value),min:mod.min,max:mod.max});inp.disabled=true;sub.disabled=true;sub.textContent='✓ Gespeichert';advanceAfterInteraction(el);});
        return el;
    }

    function renderCheckpoint(mod) {
        var el = document.createElement('div');
        el.className = 'chat-checkpoint';
        el.innerHTML = '<div class="chat-checkpoint__card"><div class="chat-checkpoint__icon" aria-hidden="true">📌</div>' +
            '<div class="chat-checkpoint__question">' + mod.question + '</div>' +
            '<textarea class="chat-checkpoint__textarea" placeholder="Dein Gedanke dazu..." rows="3"></textarea>' +
            '<button class="chat-checkpoint__submit">Festhalten</button></div>';
        var ta = el.querySelector('textarea');
        var sub = el.querySelector('button');
        sub.addEventListener('click', function(){
            if (!ta.value.trim()) return;
            checkpointAnswers.push({q:mod.question,a:ta.value.trim()});
            ta.disabled=true;sub.disabled=true;sub.textContent='✓ Festgehalten';advanceAfterInteraction(el);
        });
        return el;
    }

    function renderFinale(mod) {
        var icons = {romantik:'🌿',barock:'⚜️',aufklaerung:'💡',vormaerz:'🗞️',expressionismus:'🔥'};
        var icon = icons[THEME] || '📜';
        var el = document.createElement('div');
        el.className = 'chat-finale';
        
        var linksHtml = '';
        if (mod.links && mod.links.length > 0) {
            linksHtml = mod.links.map(function(link) {
                return '<a class="chat-finale__link" href="' + link.url + '" target="_blank" rel="noopener">' + link.label + ' →</a>';
            }).join('');
        } else if (mod.url) {
            linksHtml = '<a class="chat-finale__link" href="' + mod.url + '" target="_blank" rel="noopener">' + mod.label + ' →</a>';
        }
        
        var litHtml = '';
        if (mod.literature && mod.literature.length > 0) {
            var litItems = mod.literature.map(function(lit) {
                return '<li style="margin-bottom: 0.5rem; padding-left: 1rem; position: relative;"><span style="position: absolute; left: 0; color: var(--color-accent);">•</span>' + lit + '</li>';
            }).join('');
            litHtml = '<div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); text-align: left;">' +
                '<h4 style="font-family: var(--font-sans); font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">Quellen & Literatur</h4>' +
                '<ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; color: var(--color-text); line-height: 1.5;">' + litItems + '</ul>' +
                '</div>';
        }

        el.innerHTML = '<div class="chat-finale__card"><div class="chat-finale__watermark" aria-hidden="true">' + icon + '</div>' +
            '<div class="chat-finale__seal" aria-hidden="true">' + icon + '</div>' +
            '<div class="chat-finale__text">' + mod.text + '</div>' +
            '<div style="display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap;">' + linksHtml + '</div>' + litHtml + '</div>';
        return el;
    }

    function renderImage(mod) {
        var el = document.createElement('div');
        el.className = 'chat-image';
        el.innerHTML = '<div class="chat-image__card"><img class="chat-image__img" src="' + mod.src + '" alt="' + (mod.alt||'Bild') + '" /><div class="chat-image__caption">' + (mod.alt||'') + '</div></div>';
        return el;
    }

    function renderAudio(mod) {
        var el = document.createElement('div');
        el.className = 'chat-audio';
        el.innerHTML = '<div class="chat-audio__card"><div class="chat-audio__icon" aria-hidden="true">\uD83C\uDFB5</div><div class="chat-audio__info"><div class="chat-audio__label">' + (mod.label||'Audio') + '</div><audio class="chat-audio__player" controls preload="metadata"><source src="' + mod.src + '" />Audio nicht verf\u00fcgbar.</audio></div></div>';
        return el;
    }

    function renderAnnotation(mod) {
        var el = document.createElement('div');
        el.className = 'chat-annotation';
        var tid = 'at' + Math.random().toString(36).substr(2,6);
        var hasTargets = mod.targets && mod.targets.length > 0;
        var progressHtml = hasTargets ? '<div class="chat-annotation__progress">\uD83C\uDFAF <span class="chat-annotation__progress-count">0</span> von ' + mod.targets.length + ' Schl\u00fcsselw\u00f6rtern gefunden</div>' : '';
        el.innerHTML = '<div class="chat-annotation__card"><div class="chat-annotation__prompt">' + mod.prompt + '</div><div class="chat-annotation__text" id="' + tid + '">' + mod.text + '</div><div class="chat-annotation__toolbar"><button class="chat-annotation__mark-btn">\u270F Markieren</button><button class="chat-annotation__clear-btn">\u21BA Zur\u00fccksetzen</button></div>' + progressHtml + '<div class="chat-annotation__feedbacks"></div></div>';
        var textEl = document.getElementById(tid) || el.querySelector('.chat-annotation__text');
        var feedbacksEl = el.querySelector('.chat-annotation__feedbacks');
        var progressCountEl = el.querySelector('.chat-annotation__progress-count');
        var foundTargets = {};
        el.querySelector('.chat-annotation__mark-btn').addEventListener('click', function(){
            var sel = window.getSelection();
            if (sel.rangeCount > 0) {
                var r = sel.getRangeAt(0);
                var selectedText = r.toString().trim();
                if (selectedText.length > 0) {
                    var matchedTarget = null;
                    if (hasTargets) {
                        for (var ti = 0; ti < mod.targets.length; ti++) {
                            var tw = mod.targets[ti].word.toLowerCase();
                            var st = selectedText.toLowerCase();
                            if (st === tw || st.indexOf(tw) >= 0 || tw.indexOf(st) >= 0) {
                                matchedTarget = mod.targets[ti];
                                break;
                            }
                        }
                    }
                    var s = document.createElement('span');
                    if (matchedTarget && !foundTargets[matchedTarget.word.toLowerCase()]) {
                        s.className = 'annotation-highlight annotation-highlight--target';
                        foundTargets[matchedTarget.word.toLowerCase()] = true;
                        var fbEl = document.createElement('div');
                        fbEl.className = 'chat-annotation__feedback-item';
                        fbEl.innerHTML = '<strong>\u201E' + matchedTarget.word + '\u201C</strong> \u2013 ' + matchedTarget.feedback;
                        feedbacksEl.appendChild(fbEl);
                        if (progressCountEl) progressCountEl.textContent = Object.keys(foundTargets).length;
                    } else {
                        s.className = 'annotation-highlight';
                        s.style.background = 'rgba(123,158,168,0.3)';
                        s.style.borderBottom = '2px solid var(--color-accent)';
                        s.style.padding = '1px 2px';
                        s.style.borderRadius = '2px';
                    }
                    try { r.surroundContents(s); } catch(e) {}
                    sel.removeAllRanges();
                }
            }
            if (!el._adv) {
                var shouldAdv = hasTargets ? Object.keys(foundTargets).length > 0 : true;
                if (shouldAdv) { el._adv = true; advanceAfterInteraction(el); }
            }
        });
        el.querySelector('.chat-annotation__clear-btn').addEventListener('click', function(){
            var t = el.querySelector('.chat-annotation__text');
            t.innerHTML = t.textContent;
            foundTargets = {};
            feedbacksEl.innerHTML = '';
            if (progressCountEl) progressCountEl.textContent = '0';
        });
        return el;
    }

    function renderSelfAssessment(mod) {
        var el = document.createElement('div');
        el.className = 'chat-self-assessment';
        var lvls = [{i:'\uD83D\uDD34',l:'Noch nicht sicher'},{i:'\uD83D\uDFE1',l:'Teilweise'},{i:'\uD83D\uDFE2',l:'Sicher'}];
        var items = (mod.items||[]).map(function(item,idx){
            var tiles = lvls.map(function(lv,li){
                return '<button class="chat-self-assessment__tile" data-item="'+idx+'" data-level="'+li+'"><span class="chat-self-assessment__tile-icon">'+lv.i+'</span>'+lv.l+'</button>';
            }).join('');
            return '<div class="chat-self-assessment__item"><div class="chat-self-assessment__item-text">'+item+'</div><div class="chat-self-assessment__tiles">'+tiles+'</div></div>';
        }).join('');
        el.innerHTML = '<div class="chat-self-assessment__card"><div class="chat-self-assessment__title">\uD83D\uDCCB Selbsteinsch\u00e4tzung</div><div class="chat-self-assessment__items">'+items+'</div></div>';
        var total = (mod.items||[]).length;
        el.querySelectorAll('.chat-self-assessment__tile').forEach(function(tile){
            tile.addEventListener('click', function(){
                var idx = tile.dataset.item;
                el.querySelectorAll('.chat-self-assessment__tile[data-item="'+idx+'"]').forEach(function(s){s.classList.remove('chat-self-assessment__tile--selected');});
                tile.classList.add('chat-self-assessment__tile--selected');
                var sels = el.querySelectorAll('.chat-self-assessment__tile--selected').length;
                if (sels >= total && !el._adv) { el._adv = true; advanceAfterInteraction(el); }
            });
        });
        return el;
    }

    function renderTimeline(mod) {
        var el = document.createElement('div');
        el.className = 'chat-timeline';
        var epochs = mod.epochs||[];
        var eps = epochs.map(function(ep, idx){
            var isAct = ep.active;
            return '<div class="chat-timeline__epoch '+(isAct?'chat-timeline__epoch--active':'')+'" data-index="'+idx+'">' +
                '<div class="chat-timeline__label">'+ep.name+'</div>' +
                '<button class="chat-timeline__dot" type="button" aria-label="'+ep.name+' '+ep.start+'\u2013'+ep.end+'"></button>' +
                '<div class="chat-timeline__dates">'+ep.start+'\u2013'+ep.end+'</div>' +
                '</div>';
        }).join('');
        el.innerHTML = '<div class="chat-timeline__card"><div class="chat-timeline__track"><div class="chat-timeline__line"></div>'+eps+'</div></div>';
        var card = el.querySelector('.chat-timeline__card');
        var infoBox = null;
        el.querySelectorAll('.chat-timeline__epoch').forEach(function(epochEl, idx){
            var dot = epochEl.querySelector('.chat-timeline__dot');
            var ep = epochs[idx];
            dot.addEventListener('click', function(){
                var wasSelected = epochEl.classList.contains('chat-timeline__epoch--selected');
                el.querySelectorAll('.chat-timeline__epoch--selected').forEach(function(s){
                    s.classList.remove('chat-timeline__epoch--selected');
                });
                if (infoBox) { infoBox.remove(); infoBox = null; }
                if (!wasSelected) {
                    epochEl.classList.add('chat-timeline__epoch--selected');
                    if (ep.info) {
                        infoBox = document.createElement('div');
                        infoBox.className = 'chat-timeline__info-box';
                        infoBox.innerHTML = '<strong>'+ep.name+'</strong> \u2013 '+ep.info;
                        card.appendChild(infoBox);
                    }
                }
                if (!el._adv) { el._adv = true; advanceAfterInteraction(el); }
            });
        });
        return el;
    }

    function renderResultsSummary() {
        var el = document.createElement('div');
        el.className = 'chat-results';
        var qC = quizResults.filter(function(q){return q.correct;}).length;
        var qT = quizResults.length;
        var pct = qT > 0 ? Math.round((qC/qT)*100) : 0;
        var total = qT + barometerResults.length + checkpointAnswers.length + freetextResults.length;
        var h = '<div class="chat-results__card"><div class="chat-results__watermark" aria-hidden="true">\uD83D\uDCCA</div>';
        h += '<div class="chat-results__header"><div class="chat-results__badge">'+PERSONA_NAME+'</div><div class="chat-results__title">Deine Ergebnisse</div><div class="chat-results__subtitle">'+total+' Aufgaben bearbeitet</div></div>';
        // Stats row
        var stats = '';
        if (qT > 0) stats += '<div class="chat-results__stat"><div class="chat-results__stat-value">'+pct+'%</div><div class="chat-results__stat-label">Quiz</div></div>';
        if (barometerResults.length > 0) stats += '<div class="chat-results__stat"><div class="chat-results__stat-value">'+barometerResults.length+'</div><div class="chat-results__stat-label">Barometer</div></div>';
        if (checkpointAnswers.length > 0) stats += '<div class="chat-results__stat"><div class="chat-results__stat-value">'+checkpointAnswers.length+'</div><div class="chat-results__stat-label">Reflexionen</div></div>';
        if (freetextResults.length > 0) stats += '<div class="chat-results__stat"><div class="chat-results__stat-value">'+freetextResults.length+'</div><div class="chat-results__stat-label">Freitext</div></div>';
        if (stats) h += '<div class="chat-results__stats-row">'+stats+'</div>';
        // Quiz with ring
        if (qT > 0) {
            var circ = 2 * Math.PI * 42;
            var off = circ - (circ * pct / 100);
            var ringColor = pct >= 70 ? '#2d8a4e' : pct >= 40 ? 'var(--color-accent)' : '#c0392b';
            h += '<div class="chat-results__section"><div class="chat-results__section-title">\uD83C\uDFAF Quiz-Ergebnisse</div>';
            h += '<div class="chat-results__quiz-hero"><div class="chat-results__ring-wrap">';
            h += '<svg class="chat-results__ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" stroke-width="6"/>';
            h += '<circle cx="50" cy="50" r="42" fill="none" stroke="'+ringColor+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s ease;"/></svg>';
            h += '<div class="chat-results__ring-text"><div class="chat-results__ring-number">'+qC+'/'+qT+'</div><div class="chat-results__ring-label">richtig</div></div></div>';
            h += '<div class="chat-results__quiz-list">';
            quizResults.forEach(function(q){
                h += '<div class="chat-results__quiz-row '+(q.correct?'chat-results__quiz-row--correct':'chat-results__quiz-row--incorrect')+'"><span class="chat-results__quiz-icon">'+(q.correct?'\u2713':'\u2717')+'</span><span class="chat-results__quiz-text">'+q.question+'</span></div>';
            });
            h += '</div></div></div>';
        }
        if (barometerResults.length > 0) {
            h += '<div class="chat-results__section"><div class="chat-results__section-title">\uD83D\uDCC8 Stimmungsbarometer</div>';
            barometerResults.forEach(function(b){var p=((b.value-1)/9)*100;h+='<div class="chat-results__bar"><span class="chat-results__bar-label">'+b.statement+'</span><div class="chat-results__bar-track"><div class="chat-results__bar-fill" style="width:'+p+'%"></div></div><span class="chat-results__bar-value">'+b.value+'/10</span></div>';});
            h += '</div>';
        }
        if (checkpointAnswers.length > 0) {
            h += '<div class="chat-results__section"><div class="chat-results__section-title">\uD83D\uDCCC Deine Reflexionen</div>';
            checkpointAnswers.forEach(function(c){h+='<div class="chat-results__reflection"><div class="chat-results__reflection-q">'+c.q+'</div><div class="chat-results__reflection-a"><span class="chat-results__reflection-quote" aria-hidden="true">\u275D</span>'+c.a+'</div></div>';});
            h += '</div>';
        }
        if (freetextResults.length > 0) {
            h += '<div class="chat-results__section"><div class="chat-results__section-title">\u270F\uFE0F Deine Texte</div>';
            freetextResults.forEach(function(f){var t=f.el?f.el.value.trim():'';if(t){h+='<div class="chat-results__reflection"><div class="chat-results__reflection-q">'+f.prompt+'</div><div class="chat-results__reflection-a"><span class="chat-results__reflection-quote" aria-hidden="true">\u275D</span>'+t+'</div></div>';}});
            h += '</div>';
        }
        h += '<div class="chat-results__footer"><button class="chat-results__copy-btn">\uD83D\uDCCB Ergebnisse kopieren</button><div class="chat-results__footer-note">Tipp: Kopiere deine Ergebnisse und f\u00fcge sie in ein Dokument ein.</div></div></div>';
        el.innerHTML = h;
        el.querySelector('.chat-results__copy-btn').addEventListener('click', function(){
            var NL = String.fromCharCode(10);
            var l = ['EpochenChat \\u2013 Ergebnisse ('+PERSONA_NAME+')','='.repeat(50)];
            if(qT>0){l.push(NL+'Quiz: '+qC+'/'+qT+' richtig ('+pct+'%)');quizResults.forEach(function(q,i){l.push('  '+(q.correct?'\\u2713':'\\u2717')+' '+q.question);});}
            if(barometerResults.length>0){l.push(NL+'Barometer:');barometerResults.forEach(function(b){l.push('  '+b.statement+': '+b.value+'/10');});}
            if(checkpointAnswers.length>0){l.push(NL+'Reflexionen:');checkpointAnswers.forEach(function(c){l.push('  '+c.q+NL+'    \\u2192 '+c.a);});}
            if(freetextResults.length>0){l.push(NL+'Freitext:');freetextResults.forEach(function(f){var t=f.el?f.el.value.trim():'';if(t)l.push('  '+f.prompt+NL+'    \\u2192 '+t);});}
            var txt=l.join(NL);
            try{navigator.clipboard.writeText(txt).then(function(){el.querySelector('.chat-results__copy-btn').textContent='\\u2713 Kopiert!';setTimeout(function(){el.querySelector('.chat-results__copy-btn').textContent='\\uD83D\\uDCCB Ergebnisse kopieren';},2000);});}catch(e){}
        });
        return el;
    }

    // Init
    renderProgress();
    showNext();
})();
    <` + `/script>
</body>
</html>`;
    }

    /**
     * Skaliert ein Avatar-Bild auf 120×120px JPEG für kompakten Export.
     * Erwartet eine data:-URL (wird vom Editor vorab konvertiert).
     * Enthält einen Fetch-Fallback falls doch ein Pfad übergeben wird.
     */
    function imageToBase64(src) {
        return new Promise((resolve) => {
            if (!src) { resolve(''); return; }

            // Bild in Image laden und via Canvas auf 120px resizen
            function loadAndResize(imageUrl) {
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const size = 120;
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        const w = img.naturalWidth || img.width;
                        const h = img.naturalHeight || img.height;
                        const min = Math.min(w, h);
                        const sx = (w - min) / 2;
                        const sy = (h - min) / 2;
                        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
                        resolve(canvas.toDataURL('image/jpeg', 0.75));
                    } catch (e) {
                        // Canvas tainted → data:-URL ohne Resize nutzen
                        resolve(imageUrl.startsWith('data:') ? imageUrl : '');
                    }
                };
                img.onerror = () => resolve(imageUrl.startsWith('data:') ? imageUrl : '');
                img.src = imageUrl;
            }

            // Normalfall: bereits eine data:-URL (vom Editor vorab konvertiert)
            if (src.startsWith('data:')) {
                loadAndResize(src);
                return;
            }

            // Fallback: Pfad per fetch → blob → data:-URL konvertieren
            fetch(src)
                .then(resp => resp.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const dataUrl = reader.result;
                        if (dataUrl && dataUrl.startsWith('data:')) {
                            loadAndResize(dataUrl);
                        } else {
                            resolve('');
                        }
                    };
                    reader.onerror = () => resolve('');
                    reader.readAsDataURL(blob);
                })
                .catch(() => resolve(''));
        });
    }

    /**
     * Theme CSS als String holen
     */
    function getThemeCSS(theme) {
        // Theme-CSS aus vorbundeltem CSS_BUNDLE lesen
        if (typeof CSS_BUNDLE !== 'undefined' && CSS_BUNDLE.themes && CSS_BUNDLE.themes[theme]) {
            return CSS_BUNDLE.themes[theme];
        }

        // Fallback: versuche aus Computed Styles (funktioniert nicht auf file://)
        const themeEl = document.querySelector(`[data-theme="${theme}"]`);
        if (!themeEl) return '';

        const styles = getComputedStyle(themeEl);
        const vars = [
            '--color-primary', '--color-primary-light', '--color-accent', '--color-accent-light',
            '--color-bg', '--color-surface', '--color-surface-hover',
            '--color-bubble-persona', '--color-bubble-persona-text',
            '--color-bubble-learner', '--color-bubble-learner-text',
            '--color-text', '--color-text-muted', '--color-text-inverse',
            '--color-border', '--color-shadow', '--color-overlay', '--texture-bg'
        ];

        let css = `[data-theme="${theme}"] {\n`;
        vars.forEach(v => {
            const val = styles.getPropertyValue(v);
            if (val) css += `    ${v}: ${val.trim()};\n`;
        });
        css += '}\n';
        return css;
    }

    /**
     * Player CSS als String für den Export
     * Nutzt CSS_BUNDLE (aus css-bundle.js) – zuverlässig auch auf file:// 
     */
    function getPlayerCSS() {
        let css = '';

        // Aus vorbundeltem CSS_BUNDLE lesen (immer verfügbar)
        if (typeof CSS_BUNDLE !== 'undefined') {
            // Fonts CSS (Custom Properties + font-fallback stacks)
            // @font-face entfernen (lokale Pfade funktionieren im Export nicht)
            const fontsCSS = CSS_BUNDLE.fonts.replace(/@font-face\s*\{[^}]*\}/g, '');
            css += fontsCSS + '\n';
            // Player CSS (alle Komponenten)
            css += CSS_BUNDLE.player + '\n';
        } else {
            // Fallback: versuche Stylesheet-API (funktioniert nur auf http://)
            for (const sheet of document.styleSheets) {
                try {
                    if (sheet.href && sheet.href.includes('player.css')) {
                        for (const rule of sheet.cssRules) {
                            css += rule.cssText + '\n';
                        }
                    }
                    if (sheet.href && sheet.href.includes('fonts.css')) {
                        for (const rule of sheet.cssRules) {
                            if (rule.selectorText === ':root') {
                                css += rule.cssText + '\n';
                            }
                        }
                    }
                } catch (e) {
                    // CORS - skip
                }
            }
        }

        // Sicherheits-Fallback: Minimale Font-Stacks immer anhängen
        css += `\n/* Font Fallback */
:root {
    --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
    --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-size-persona: 1.05rem;
    --font-size-ui: 0.95rem;
    --font-size-quote: 1.15rem;
    --font-size-small: 0.8rem;
    --font-size-label: 0.85rem;
    --line-height-body: 1.6;
    --line-height-tight: 1.3;
}\n`;

        // sr-only class
        css += `.sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0; }\n`;

        return css;
    }

    function sanitizeFilename(name) {
        return name
            .toLowerCase()
            .replace(/[äÄ]/g, 'ae')
            .replace(/[öÖ]/g, 'oe')
            .replace(/[üÜ]/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    function escHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * SCORM 1.2 Export
     */
    async function exportAsScorm(config, estimatedMinutes) {
        const textarea = document.getElementById('editorTextarea');
        const markdown = textarea.value;
        const modules = EpochenParser.parse(markdown);

        if (modules.length === 0) {
            alert('Kein Chat-Inhalt zum Exportieren vorhanden.');
            return;
        }

        const avatarBase64 = await imageToBase64(config.avatarSrc);
        const themeCSS = getThemeCSS(config.theme);
        const safeName = sanitizeFilename(config.name);

        // HTML-Inhalt (gleich wie normaler Export, plus SCORM-Hooks)
        const playerHtml = buildExportHtml({
            title: `EpochenChat: ${config.name}`,
            personaName: config.name,
            personaSource: config.source,
            creatorName: config.creator,
            theme: config.theme,
            themeCSS,
            avatarBase64,
            modules: JSON.stringify(modules),
            estimatedMinutes
        });

        // SCORM-Wrapper Script (pipwerks-kompatibel)
        const scormScript = `
<` + `script>
// === SCORM 1.2 API Wrapper (Minimal) ===
var SCORM = (function(){
    var api = null;
    function findAPI(w) {
        var attempts = 0;
        while ((!w.API) && (w.parent) && (w.parent != w) && (attempts < 10)) {
            attempts++;
            w = w.parent;
        }
        return w.API || null;
    }
    function init() {
        api = findAPI(window);
        if (!api && window.opener) api = findAPI(window.opener);
        if (api) {
            api.LMSInitialize('');
            api.LMSSetValue('cmi.core.lesson_status', 'incomplete');
            api.LMSCommit('');
        }
    }
    function complete(score) {
        if (!api) return;
        if (typeof score === 'number') {
            api.LMSSetValue('cmi.core.score.raw', String(Math.round(score)));
            api.LMSSetValue('cmi.core.score.min', '0');
            api.LMSSetValue('cmi.core.score.max', '100');
        }
        api.LMSSetValue('cmi.core.lesson_status', 'completed');
        api.LMSSetValue('cmi.core.lesson_location', 'complete');
        api.LMSCommit('');
    }
    function suspend(data) {
        if (!api) return;
        api.LMSSetValue('cmi.suspend_data', JSON.stringify(data).substring(0, 4096));
        api.LMSCommit('');
    }
    function finish() {
        if (api) api.LMSFinish('');
    }
    return { init: init, complete: complete, suspend: suspend, finish: finish };
})();
SCORM.init();
window.addEventListener('beforeunload', function() { SCORM.finish(); });

// Hook: SCORM-Datenübergabe bei Abschluss
var __scormDone = false;
var __origShowNext = showNext;
showNext = function() {
    __origShowNext();
    if (__scormDone) return;
    if (currentIndex >= MODULES.length) {
        __scormDone = true;
        // Score berechnen
        var qT = quizResults.length;
        var qC = quizResults.filter(function(q){return q.correct;}).length;
        if (qT > 0) {
            SCORM.complete(Math.round((qC / qT) * 100));
        } else {
            SCORM.complete();
        }
        // Alle Ergebnisse in suspend_data sichern
        var suspendData = {};
        if (quizResults.length > 0) {
            suspendData.quiz = quizResults.map(function(q){ return {question: q.question, correct: q.correct}; });
        }
        if (barometerResults.length > 0) {
            suspendData.barometer = barometerResults.map(function(b){ return {statement: b.statement, value: b.value}; });
        }
        if (checkpointAnswers.length > 0) {
            suspendData.checkpoints = checkpointAnswers.map(function(c){ return {q: c.q, a: c.a}; });
        }
        if (freetextResults.length > 0) {
            suspendData.freetext = freetextResults.map(function(f){
                var t = f.el ? f.el.value.trim() : '';
                return {prompt: f.prompt, text: t};
            }).filter(function(f){ return f.text; });
        }
        SCORM.suspend(suspendData);
    }
};
<` + `/script>`;

        // SCORM HTML = playerHtml + SCORM-Script vor </body>
        const scormHtml = playerHtml.replace('</body>', scormScript + '\n</body>');

        // imsmanifest.xml
        const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="epochenchat_${safeName}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                       http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org1">
    <organization identifier="org1">
      <title>EpochenChat: ${escHtml(config.name)}</title>
      <item identifier="item1" identifierref="res1">
        <title>EpochenChat: ${escHtml(config.name)}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html" />
    </resource>
  </resources>
</manifest>`;

        // ZIP erstellen (ohne externe Lib – einfaches ZIP-Format)
        const zip = createSimpleZip([
            { name: 'index.html', content: scormHtml },
            { name: 'imsmanifest.xml', content: manifest }
        ]);

        downloadFile(zip, `epochenchat_scorm_${safeName}.zip`, 'application/zip');
    }

    /**
     * Erstellt ein einfaches ZIP-Archiv (Store, kein Deflate)
     */
    function createSimpleZip(files) {
        const enc = new TextEncoder();
        const parts = [];
        const centralDir = [];
        let offset = 0;

        files.forEach(f => {
            const nameBytes = enc.encode(f.name);
            const dataBytes = enc.encode(f.content);
            const crc = crc32(dataBytes);

            // Local file header
            const header = new Uint8Array(30 + nameBytes.length);
            const hv = new DataView(header.buffer);
            hv.setUint32(0, 0x04034b50, true);  // signature
            hv.setUint16(4, 20, true);           // version needed
            hv.setUint16(6, 0, true);            // flags
            hv.setUint16(8, 0, true);            // compression (store)
            hv.setUint16(10, 0, true);           // mod time
            hv.setUint16(12, 0, true);           // mod date
            hv.setUint32(14, crc, true);         // crc32
            hv.setUint32(18, dataBytes.length, true); // compressed
            hv.setUint32(22, dataBytes.length, true); // uncompressed
            hv.setUint16(26, nameBytes.length, true); // name length
            hv.setUint16(28, 0, true);           // extra length
            header.set(nameBytes, 30);

            // Central directory entry
            const cd = new Uint8Array(46 + nameBytes.length);
            const cv = new DataView(cd.buffer);
            cv.setUint32(0, 0x02014b50, true);
            cv.setUint16(4, 20, true);
            cv.setUint16(6, 20, true);
            cv.setUint16(8, 0, true);
            cv.setUint16(10, 0, true);
            cv.setUint16(12, 0, true);
            cv.setUint16(14, 0, true);
            cv.setUint32(16, crc, true);
            cv.setUint32(20, dataBytes.length, true);
            cv.setUint32(24, dataBytes.length, true);
            cv.setUint16(28, nameBytes.length, true);
            cv.setUint16(30, 0, true);
            cv.setUint16(32, 0, true);
            cv.setUint16(34, 0, true);
            cv.setUint16(36, 0, true);
            cv.setUint32(38, 32, true);  // external attrs
            cv.setUint32(42, offset, true);  // local header offset
            cd.set(nameBytes, 46);

            parts.push(header, dataBytes);
            centralDir.push(cd);
            offset += header.length + dataBytes.length;
        });

        // Central directory
        const cdOffset = offset;
        let cdSize = 0;
        centralDir.forEach(cd => {
            parts.push(cd);
            cdSize += cd.length;
        });

        // End of central directory
        const eocd = new Uint8Array(22);
        const ev = new DataView(eocd.buffer);
        ev.setUint32(0, 0x06054b50, true);
        ev.setUint16(4, 0, true);
        ev.setUint16(6, 0, true);
        ev.setUint16(8, files.length, true);
        ev.setUint16(10, files.length, true);
        ev.setUint32(12, cdSize, true);
        ev.setUint32(16, cdOffset, true);
        ev.setUint16(20, 0, true);
        parts.push(eocd);

        // Zusammenbauen
        const totalSize = parts.reduce((s, p) => s + p.length, 0);
        const result = new Uint8Array(totalSize);
        let pos = 0;
        parts.forEach(p => { result.set(p, pos); pos += p.length; });
        return result.buffer;
    }

    /**
     * CRC32 Berechnung
     */
    function crc32(bytes) {
        let crc = 0xFFFFFFFF;
        const table = [];
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[i] = c;
        }
        for (let i = 0; i < bytes.length; i++) {
            crc = table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    return { exportAsHtml, exportAsScorm };
})();
