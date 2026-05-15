/* ============================================
   EpochenChat – Player / Renderer
   Rendert Module sequenziell mit Animationen
   CC-BY-SA 4.0 Sebastian Wolf 2026
   ============================================ */

const EpochenPlayer = (() => {
    'use strict';

    let container = null;
    let modules = [];
    let currentIndex = 0;
    let personaConfig = {};
    let avatarSrc = '';
    let progressEl = null;
    let isPlaying = false;
    let checkpointAnswers = [];
    let quizResults = [];
    let barometerResults = [];
    let freetextResults = [];

    const TYPING_DELAY = 600;   // ms before typing indicator appears
    const TYPING_DURATION = 800; // ms typing indicator is shown
    const SCROLL_BEHAVIOR = 'smooth';

    /**
     * Initialisiert den Player
     */
    function init(containerEl, moduleList, config) {
        container = containerEl;
        modules = moduleList || [];
        currentIndex = 0;
        checkpointAnswers = [];
        quizResults = [];
        barometerResults = [];
        freetextResults = [];
        personaConfig = config || {};
        avatarSrc = config.avatarSrc || 'assets/avatars/eichendorff.png';

        container.innerHTML = '';
        container.setAttribute('role', 'log');
        container.setAttribute('aria-label', 'Literarischer Chat');

        if (modules.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--color-text-muted);">Gib links einen Chat im Markdown-Format ein...</div>';
            return;
        }

        // Progress bar
        renderProgress();

        // Start rendering
        isPlaying = true;
        showNext();
    }

    function renderProgress() {
        progressEl = document.createElement('div');
        progressEl.className = 'chat-progress';
        progressEl.innerHTML = `
            <span class="chat-progress__title">${personaConfig.name || 'Persona'}</span>
            <span class="chat-progress__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h12V4H6zm2 3h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>
                Seite <span id="chatProgressCurrent">0</span> von ${modules.length}
            </span>
        `;
        container.appendChild(progressEl);
    }

    function updateProgress() {
        const el = document.getElementById('chatProgressCurrent');
        if (el) el.textContent = currentIndex;
    }

    /**
     * Zeigt das nächste Modul
     */
    function showNext() {
        if (currentIndex >= modules.length) {
            isPlaying = false;
            if (quizResults.length > 0 || barometerResults.length > 0 || checkpointAnswers.length > 0 || freetextResults.length > 0) {
                const summaryBtn = document.createElement('div');
                summaryBtn.className = 'chat-results-trigger';
                summaryBtn.innerHTML = `
                    <button class="chat-results-trigger__btn">
                        <span class="chat-results-trigger__icon">📊</span>
                        <span class="chat-results-trigger__text">Zusammenfassung anzeigen</span>
                    </button>
                `;
                container.appendChild(summaryBtn);
                scrollToBottom();

                summaryBtn.querySelector('.chat-results-trigger__btn').addEventListener('click', () => {
                    summaryBtn.remove();
                    const summary = renderResultsSummary();
                    container.appendChild(summary);
                    scrollToBottom();
                });
            }
            return;
        }

        const mod = modules[currentIndex];
        currentIndex++;
        updateProgress();

        // Persona-Nachrichten bekommen Tipp-Indikator
        if (mod.type === 'persona' && currentIndex > 1) {
            showTypingThenRender(mod);
        } else {
            renderModule(mod);
        }
    }

    function showTypingThenRender(mod) {
        const typing = createTypingIndicator();
        container.appendChild(typing);
        scrollToBottom();

        setTimeout(() => {
            typing.remove();
            renderModule(mod);
        }, TYPING_DURATION);
    }

    function createTypingIndicator() {
        const wrap = document.createElement('div');
        wrap.className = 'chat-typing';
        wrap.innerHTML = `
            <div class="chat-avatar">
                <img src="${avatarSrc}" alt="${personaConfig.name || 'Persona'}" />
            </div>
            <div class="chat-typing__dots">
                <span class="chat-typing__dot"></span>
                <span class="chat-typing__dot"></span>
                <span class="chat-typing__dot"></span>
            </div>
        `;
        return wrap;
    }

    /**
     * Rendert ein einzelnes Modul
     */
    function renderModule(mod) {
        let el;

        switch (mod.type) {
            case 'framing':         el = renderFraming(mod); break;
            case 'persona':         el = renderPersona(mod); break;
            case 'learner':         el = renderLearner(mod); break;
            case 'quote':           el = renderQuote(mod); break;
            case 'context':         el = renderContext(mod); break;
            case 'quiz-single':     el = renderQuiz(mod, false); break;
            case 'quiz-multi':      el = renderQuiz(mod, true); break;
            case 'freetext':        el = renderFreetext(mod); break;
            case 'barometer':       el = renderBarometer(mod); break;
            case 'checkpoint':      el = renderCheckpoint(mod); break;
            case 'image':           el = renderImage(mod); break;
            case 'audio':           el = renderAudio(mod); break;
            case 'annotation':      el = renderAnnotation(mod); break;
            case 'self-assessment': el = renderSelfAssessment(mod); break;
            case 'timeline':        el = renderTimeline(mod); break;
            case 'finale':          el = renderFinale(mod); break;
            default:                el = renderPersona(mod); break;
        }

        container.appendChild(el);
        scrollToBottom();

        // Auto-advance für nicht-interaktive Module
        const interactive = ['quiz-single', 'quiz-multi', 'freetext', 'barometer', 'checkpoint', 'framing', 'annotation', 'self-assessment', 'timeline'];
        if (!interactive.includes(mod.type)) {
            if (currentIndex < modules.length) {
                const btn = createContinueButton();
                container.appendChild(btn);
                scrollToBottom();
            } else {
                // Letztes Modul: showNext aufrufen für Zusammenfassung
                setTimeout(() => showNext(), 600);
            }
        }
    }

    function createContinueButton() {
        const wrap = document.createElement('div');
        wrap.className = 'chat-continue';
        const btn = document.createElement('button');
        btn.className = 'chat-continue__btn';
        btn.innerHTML = 'Weiter ▾';
        btn.addEventListener('click', () => {
            wrap.remove();
            showNext();
        });
        wrap.appendChild(btn);
        return wrap;
    }

    function advanceAfterInteraction(el) {
        if (currentIndex < modules.length) {
            const btn = createContinueButton();
            el.after(btn);
            scrollToBottom();
        } else {
            // Letztes Modul: Zusammenfassung triggern
            setTimeout(() => showNext(), 600);
        }
    }

    /* === Module Renderers === */

    function renderFraming(mod) {
        const el = document.createElement('div');
        el.className = 'chat-framing';
        el.innerHTML = `
            <div class="chat-framing__icon" aria-hidden="true">📜</div>
            <div class="chat-framing__title">Hinweis zur Figur</div>
            <div class="chat-framing__text">${mod.content}</div>
            <button class="chat-framing__btn" id="framingStartBtn">
                Verstanden – Chat starten ▸
            </button>
        `;
        el.querySelector('#framingStartBtn').addEventListener('click', function() {
            this.disabled = true;
            this.textContent = '✓ Gestartet';
            showNext();
        });
        return el;
    }

    function renderPersona(mod) {
        const el = document.createElement('div');
        el.className = 'chat-message chat-message--persona';
        
        const sourceHtml = personaConfig.source ? 
            `<span class="chat-source-ref" title="Bildquelle: ${(personaConfig.source || '').replace(/"/g, '&quot;')}" tabindex="0" role="button">Q</span>` : '';
            
        el.innerHTML = `
            <div class="chat-avatar">
                <img src="${avatarSrc}" alt="${personaConfig.name || 'Persona'}" />
            </div>
            <div>
                <div class="chat-persona-name">${personaConfig.name || 'Persona'} ${sourceHtml}</div>
                <div class="chat-bubble chat-bubble--persona">${mod.content}</div>
            </div>
        `;
        return el;
    }

    function renderLearner(mod) {
        const el = document.createElement('div');
        el.className = 'chat-message chat-message--learner';
        el.innerHTML = `
            <div>
                <div class="chat-bubble chat-bubble--learner">${mod.content}</div>
            </div>
        `;
        return el;
    }

    function renderQuote(mod) {
        const el = document.createElement('div');
        el.className = 'chat-quote';
        el.innerHTML = `
            <div class="chat-quote__card">
                <div class="chat-quote__ornament" aria-hidden="true">❝</div>
                <div class="chat-quote__text">${mod.text}</div>
                ${mod.source ? `<div class="chat-quote__source">– ${mod.source}</div>` : ''}
            </div>
        `;
        return el;
    }

    function renderContext(mod) {
        const el = document.createElement('details');
        el.className = 'chat-context';
        el.innerHTML = `
            <summary class="chat-context__toggle">
                <span class="chat-context__arrow" aria-hidden="true">▸</span>
                <span>Hintergrundwissen einblenden</span>
            </summary>
            <div class="chat-context__body">${mod.content}</div>
        `;
        return el;
    }

    function renderQuiz(mod, isMulti) {
        const el = document.createElement('div');
        el.className = `chat-quiz ${isMulti ? 'chat-quiz--multi' : ''}`;

        const uid = 'quiz_' + Math.random().toString(36).substr(2, 6);
        let optionsHtml = mod.options.map((opt, i) => `
            <label class="chat-quiz__option" data-index="${i}" data-correct="${opt.correct}" for="${uid}_${i}">
                <input type="${isMulti ? 'checkbox' : 'radio'}" name="${uid}" id="${uid}_${i}" class="sr-only" value="${i}" />
                <span class="chat-quiz__indicator" aria-hidden="true"></span>
                <span>${opt.text}</span>
            </label>
        `).join('');

        el.innerHTML = `
            <div class="chat-quiz__card">
                <div class="chat-quiz__question">${mod.question}</div>
                <div class="chat-quiz__options">${optionsHtml}</div>
                <button class="chat-quiz__check-btn" disabled>Überprüfen</button>
                <div class="chat-quiz__feedback" hidden></div>
            </div>
        `;

        const options = el.querySelectorAll('.chat-quiz__option');
        const checkBtn = el.querySelector('.chat-quiz__check-btn');
        const feedback = el.querySelector('.chat-quiz__feedback');

        // Selection handling
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                if (opt.classList.contains('chat-quiz__option--locked')) return;
                const input = opt.querySelector('input');
                input.checked = !input.checked || !isMulti;

                if (!isMulti) {
                    options.forEach(o => o.classList.remove('chat-quiz__option--selected'));
                }
                opt.classList.toggle('chat-quiz__option--selected', input.checked);
                checkBtn.disabled = !el.querySelector('input:checked');
            });
        });

        // Check
        checkBtn.addEventListener('click', () => {
            let allCorrect = true;
            const feedbackMessages = [];

            options.forEach((opt, idx) => {
                opt.classList.add('chat-quiz__option--locked');
                const input = opt.querySelector('input');
                const isCorrect = opt.dataset.correct === 'true';
                const optData = mod.options[idx];

                if (input.checked && isCorrect) {
                    opt.classList.add('chat-quiz__option--correct');
                    if (optData.feedback) feedbackMessages.push({ correct: true, text: optData.feedback });
                } else if (input.checked && !isCorrect) {
                    opt.classList.add('chat-quiz__option--incorrect');
                    allCorrect = false;
                    if (optData.feedback) feedbackMessages.push({ correct: false, text: optData.feedback });
                } else if (!input.checked && isCorrect) {
                    opt.classList.add('chat-quiz__option--correct');
                    allCorrect = false;
                }
            });

            checkBtn.disabled = true;
            checkBtn.textContent = '✓ Ausgewertet';
            feedback.hidden = false;

            // Show conditional feedback if available, else generic
            if (feedbackMessages.length > 0) {
                feedback.className = 'chat-quiz__feedback chat-quiz__feedback--custom';
                feedback.innerHTML = feedbackMessages.map(fb =>
                    `<div class="chat-quiz__feedback-item ${fb.correct ? 'chat-quiz__feedback-item--correct' : 'chat-quiz__feedback-item--incorrect'}">${fb.correct ? '✓' : '✗'} ${fb.text}</div>`
                ).join('');
            } else {
                feedback.className = `chat-quiz__feedback ${allCorrect ? 'chat-quiz__feedback--correct' : 'chat-quiz__feedback--incorrect'}`;
                feedback.textContent = allCorrect ? '✓ Richtig!' : '✗ Nicht ganz – die richtigen Antworten sind markiert.';
            }

            quizResults.push({ question: mod.question, correct: allCorrect });
            advanceAfterInteraction(el);
        });

        return el;
    }

    function renderFreetext(mod) {
        const el = document.createElement('div');
        el.className = 'chat-freetext';
        el.innerHTML = `
            <div class="chat-freetext__card">
                <div class="chat-freetext__prompt">${mod.prompt}</div>
                <textarea class="chat-freetext__textarea" placeholder="Schreibe hier deine Antwort..." rows="4"></textarea>
            </div>
        `;

        const textarea = el.querySelector('textarea');
        textarea.addEventListener('input', () => {
            if (textarea.value.trim().length > 5 && !el._advanced) {
                el._advanced = true;
                freetextResults.push({ prompt: mod.prompt, getText: () => textarea.value.trim() });
                advanceAfterInteraction(el);
            }
        });

        return el;
    }

    function renderBarometer(mod) {
        const el = document.createElement('div');
        el.className = 'chat-barometer';
        const uid = 'baro_' + Math.random().toString(36).substr(2, 6);
        el.innerHTML = `
            <div class="chat-barometer__card">
                <div class="chat-barometer__statement">${mod.statement}</div>
                <div class="chat-barometer__slider-wrap">
                    <input type="range" class="chat-barometer__input" id="${uid}" min="1" max="10" value="5"
                           aria-label="${mod.statement}" />
                </div>
                <div class="chat-barometer__labels">
                    <span>${mod.min}</span>
                    <span>${mod.max}</span>
                </div>
                <div class="chat-barometer__value">5</div>
                <button class="chat-barometer__submit">Bestätigen</button>
            </div>
        `;

        const input = el.querySelector('input[type="range"]');
        const value = el.querySelector('.chat-barometer__value');
        const submit = el.querySelector('.chat-barometer__submit');

        input.addEventListener('input', () => {
            value.textContent = input.value;
        });

        submit.addEventListener('click', () => {
            barometerResults.push({ statement: mod.statement, value: parseInt(input.value), min: mod.min, max: mod.max });
            input.disabled = true;
            submit.disabled = true;
            submit.textContent = '✓ Gespeichert';
            advanceAfterInteraction(el);
        });

        return el;
    }

    function renderCheckpoint(mod) {
        const el = document.createElement('div');
        el.className = 'chat-checkpoint';
        el.innerHTML = `
            <div class="chat-checkpoint__card">
                <div class="chat-checkpoint__icon" aria-hidden="true">📌</div>
                <div class="chat-checkpoint__question">${mod.question}</div>
                <textarea class="chat-checkpoint__textarea" placeholder="Dein Gedanke dazu..." rows="3"></textarea>
                <button class="chat-checkpoint__submit">Festhalten</button>
            </div>
        `;

        const textarea = el.querySelector('textarea');
        const submit = el.querySelector('.chat-checkpoint__submit');

        submit.addEventListener('click', () => {
            const answer = textarea.value.trim();
            if (!answer) return;
            checkpointAnswers.push({ question: mod.question, answer });
            textarea.disabled = true;
            submit.disabled = true;
            submit.textContent = '✓ Festgehalten';
            advanceAfterInteraction(el);
        });

        return el;
    }

    function renderFinale(mod) {
        const el = document.createElement('div');
        el.className = 'chat-finale';

        const epocheIcons = {
            'romantik': '🌿',
            'barock': '⚜️',
            'aufklaerung': '💡',
            'vormaerz': '🗞️',
            'expressionismus': '🔥'
        };
        const sealIcon = epocheIcons[personaConfig.theme] || '📜';

        let linksHtml = '';
        if (mod.links && mod.links.length > 0) {
            linksHtml = mod.links.map(link => 
                `<a class="chat-finale__link" href="${link.url}" target="_blank" rel="noopener">${link.label} →</a>`
            ).join('');
        } else if (mod.url) { // Fallback für alte Projekte
            linksHtml = `<a class="chat-finale__link" href="${mod.url}" target="_blank" rel="noopener">${mod.label} →</a>`;
        }

        let litHtml = '';
        if (mod.literature && mod.literature.length > 0) {
            litHtml = `<div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); text-align: left;">
                <h4 style="font-family: var(--font-sans); font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">Quellen & Literatur</h4>
                <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; color: var(--color-text); line-height: 1.5;">
                    ${mod.literature.map(lit => `<li style="margin-bottom: 0.5rem; padding-left: 1rem; position: relative;"><span style="position: absolute; left: 0; color: var(--color-accent);">•</span>${lit}</li>`).join('')}
                </ul>
            </div>`;
        }

        el.innerHTML = `
            <div class="chat-finale__card">
                <div class="chat-finale__watermark" aria-hidden="true">${sealIcon}</div>
                <div class="chat-finale__seal" aria-hidden="true">${sealIcon}</div>
                <div class="chat-finale__text">${mod.text}</div>
                <div style="display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap;">
                    ${linksHtml}
                </div>
                ${litHtml}
            </div>
        `;
        return el;
    }

    function renderImage(mod) {
        const el = document.createElement('div');
        el.className = 'chat-image';
        const sourceHtml = mod.source ? `<div class="chat-image__source">${mod.source}</div>` : '';
        el.innerHTML = `
            <div class="chat-image__card">
                <div class="chat-image__caption">${mod.alt || 'Bild'}</div>
                <img class="chat-image__img" src="${mod.src}" alt="${mod.alt || 'Bild'}" />
                ${sourceHtml}
            </div>
        `;
        return el;
    }

    function renderAudio(mod) {
        const el = document.createElement('div');
        el.className = 'chat-audio';
        const sourceHtml = mod.source ? `<div class="chat-audio__source">${mod.source}</div>` : '';
        el.innerHTML = `
            <div class="chat-audio__card">
                <div class="chat-audio__label">${mod.label || 'Audio'}</div>
                <div class="chat-audio__content">
                    <div class="chat-audio__icon" aria-hidden="true">🎵</div>
                    <audio class="chat-audio__player" controls preload="metadata">
                        <source src="${mod.src}" />
                        Dein Browser unterstützt kein Audio.
                    </audio>
                </div>
                ${sourceHtml}
            </div>
        `;
        return el;
    }

    function renderAnnotation(mod) {
        const el = document.createElement('div');
        el.className = 'chat-annotation';
        const hasTargets = mod.targets && mod.targets.length > 0;
        const progressHtml = hasTargets
            ? `<div class="chat-annotation__progress">🎯 <span class="chat-annotation__progress-count">0</span> von ${mod.targets.length} Schlüsselwörtern gefunden</div>`
            : '';
        el.innerHTML = `
            <div class="chat-annotation__card">
                <div class="chat-annotation__prompt">${mod.prompt}</div>
                <div class="chat-annotation__text" id="annotText_${Math.random().toString(36).substr(2,6)}">${mod.text}</div>
                <div class="chat-annotation__toolbar">
                    <button class="chat-annotation__mark-btn">✏ Markieren</button>
                    <button class="chat-annotation__clear-btn">↺ Zurücksetzen</button>
                </div>
                ${progressHtml}
                <div class="chat-annotation__feedbacks"></div>
            </div>
        `;

        const textEl = el.querySelector('.chat-annotation__text');
        const markBtn = el.querySelector('.chat-annotation__mark-btn');
        const clearBtn = el.querySelector('.chat-annotation__clear-btn');
        const feedbacksEl = el.querySelector('.chat-annotation__feedbacks');
        const progressCountEl = el.querySelector('.chat-annotation__progress-count');
        const foundTargets = new Set();

        markBtn.addEventListener('click', () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && textEl.contains(selection.anchorNode)) {
                const range = selection.getRangeAt(0);
                const selectedText = range.toString().trim();
                if (selectedText.length > 0) {
                    // Check if this matches a target
                    let matchedTarget = null;
                    if (hasTargets) {
                        matchedTarget = mod.targets.find(t =>
                            selectedText.toLowerCase() === t.word.toLowerCase() ||
                            selectedText.toLowerCase().includes(t.word.toLowerCase()) ||
                            t.word.toLowerCase().includes(selectedText.toLowerCase())
                        );
                    }

                    const span = document.createElement('span');
                    if (matchedTarget && !foundTargets.has(matchedTarget.word.toLowerCase())) {
                        span.className = 'annotation-highlight annotation-highlight--target';
                        foundTargets.add(matchedTarget.word.toLowerCase());

                        // Show feedback
                        const fbEl = document.createElement('div');
                        fbEl.className = 'chat-annotation__feedback-item';
                        fbEl.innerHTML = `<strong>„${matchedTarget.word}"</strong> – ${matchedTarget.feedback}`;
                        feedbacksEl.appendChild(fbEl);

                        // Update progress
                        if (progressCountEl) {
                            progressCountEl.textContent = foundTargets.size;
                        }
                    } else {
                        span.className = 'annotation-highlight';
                        span.style.background = 'rgba(123,158,168,0.3)';
                        span.style.borderBottom = '2px solid var(--color-accent)';
                        span.style.padding = '1px 2px';
                        span.style.borderRadius = '2px';
                    }

                    try {
                        range.surroundContents(span);
                    } catch(e) { /* partial selection across elements */ }
                    selection.removeAllRanges();
                }
            }
            if (!el._advanced) {
                const shouldAdvance = hasTargets ? foundTargets.size > 0 : true;
                if (shouldAdvance) {
                    el._advanced = true;
                    advanceAfterInteraction(el);
                }
            }
        });

        clearBtn.addEventListener('click', () => {
            const original = textEl.textContent;
            textEl.innerHTML = original;
            foundTargets.clear();
            feedbacksEl.innerHTML = '';
            if (progressCountEl) progressCountEl.textContent = '0';
        });

        return el;
    }

    function renderSelfAssessment(mod) {
        const el = document.createElement('div');
        el.className = 'chat-self-assessment';

        const levels = [
            { icon: '🔴', label: 'Noch nicht sicher' },
            { icon: '🟡', label: 'Teilweise' },
            { icon: '🟢', label: 'Sicher' }
        ];

        let itemsHtml = (mod.items || []).map((item, idx) => {
            const tilesHtml = levels.map((lvl, li) => `
                <button class="chat-self-assessment__tile" data-item="${idx}" data-level="${li}">
                    <span class="chat-self-assessment__tile-icon">${lvl.icon}</span>
                    ${lvl.label}
                </button>
            `).join('');
            return `
                <div class="chat-self-assessment__item">
                    <div class="chat-self-assessment__item-text">${item}</div>
                    <div class="chat-self-assessment__tiles">${tilesHtml}</div>
                </div>
            `;
        }).join('');

        el.innerHTML = `
            <div class="chat-self-assessment__card">
                <div class="chat-self-assessment__title">📋 Selbsteinschätzung</div>
                <div class="chat-self-assessment__items">${itemsHtml}</div>
            </div>
        `;

        let selections = 0;
        const totalItems = (mod.items || []).length;

        el.querySelectorAll('.chat-self-assessment__tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const itemIdx = tile.dataset.item;
                const siblings = el.querySelectorAll(`.chat-self-assessment__tile[data-item="${itemIdx}"]`);
                const wasSelected = tile.classList.contains('chat-self-assessment__tile--selected');

                siblings.forEach(s => s.classList.remove('chat-self-assessment__tile--selected'));
                if (!wasSelected) {
                    tile.classList.add('chat-self-assessment__tile--selected');
                }

                // Count selections
                selections = el.querySelectorAll('.chat-self-assessment__tile--selected').length;
                if (selections >= totalItems && !el._advanced) {
                    el._advanced = true;
                    advanceAfterInteraction(el);
                }
            });
        });

        return el;
    }

    function renderTimeline(mod) {
        const el = document.createElement('div');
        el.className = 'chat-timeline';

        const epochs = mod.epochs || [];
        const epochsHtml = epochs.map((ep, idx) => {
            const isActive = ep.active;
            return `
                <div class="chat-timeline__epoch ${isActive ? 'chat-timeline__epoch--active' : ''}" data-index="${idx}">
                    <div class="chat-timeline__label">${ep.name}</div>
                    <button class="chat-timeline__dot" type="button" aria-label="${ep.name} ${ep.start}–${ep.end}"></button>
                    <div class="chat-timeline__dates">${ep.start}–${ep.end}</div>
                </div>
            `;
        }).join('');

        el.innerHTML = `
            <div class="chat-timeline__card">
                <div class="chat-timeline__track">
                    <div class="chat-timeline__line"></div>
                    ${epochsHtml}
                </div>
            </div>
        `;

        const card = el.querySelector('.chat-timeline__card');
        let infoBox = null;

        // Click handling for dots
        el.querySelectorAll('.chat-timeline__epoch').forEach((epochEl, idx) => {
            const dot = epochEl.querySelector('.chat-timeline__dot');
            const ep = epochs[idx];

            dot.addEventListener('click', () => {
                const wasSelected = epochEl.classList.contains('chat-timeline__epoch--selected');

                // Deselect all
                el.querySelectorAll('.chat-timeline__epoch--selected').forEach(s => {
                    s.classList.remove('chat-timeline__epoch--selected');
                });

                // Remove info box
                if (infoBox) { infoBox.remove(); infoBox = null; }

                if (!wasSelected) {
                    epochEl.classList.add('chat-timeline__epoch--selected');
                    if (ep.info) {
                        infoBox = document.createElement('div');
                        infoBox.className = 'chat-timeline__info-box';
                        infoBox.innerHTML = `<strong>${ep.name}</strong> – ${ep.info}`;
                        card.appendChild(infoBox);
                    }
                }

                // Advance on first click
                if (!el._advanced) {
                    el._advanced = true;
                    advanceAfterInteraction(el);
                }
            });
        });

        return el;
    }

    /* === Ergebnis-Zusammenfassung === */

    function renderResultsSummary() {
        const el = document.createElement('div');
        el.className = 'chat-results';

        const quizCorrect = quizResults.filter(q => q.correct).length;
        const quizTotal = quizResults.length;
        const scorePercent = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;

        // Count total interactions
        const totalInteractions = quizTotal + barometerResults.length + checkpointAnswers.length + freetextResults.length;

        let html = `<div class="chat-results__card">
            <div class="chat-results__watermark" aria-hidden="true">📊</div>
            <div class="chat-results__header">
                <div class="chat-results__badge">${personaConfig.name || 'Persona'}</div>
                <div class="chat-results__title">Deine Ergebnisse</div>
                <div class="chat-results__subtitle">${totalInteractions} Aufgaben bearbeitet</div>
            </div>`;

        // Stats row (compact overview)
        const stats = [];
        if (quizTotal > 0) stats.push(`<div class="chat-results__stat"><div class="chat-results__stat-value">${scorePercent}%</div><div class="chat-results__stat-label">Quiz</div></div>`);
        if (barometerResults.length > 0) stats.push(`<div class="chat-results__stat"><div class="chat-results__stat-value">${barometerResults.length}</div><div class="chat-results__stat-label">Barometer</div></div>`);
        if (checkpointAnswers.length > 0) stats.push(`<div class="chat-results__stat"><div class="chat-results__stat-value">${checkpointAnswers.length}</div><div class="chat-results__stat-label">Reflexionen</div></div>`);
        if (freetextResults.length > 0) stats.push(`<div class="chat-results__stat"><div class="chat-results__stat-value">${freetextResults.length}</div><div class="chat-results__stat-label">Freitext</div></div>`);
        if (stats.length > 0) {
            html += `<div class="chat-results__stats-row">${stats.join('')}</div>`;
        }

        // Quiz-Score with ring
        if (quizTotal > 0) {
            const circumference = 2 * Math.PI * 42;
            const offset = circumference - (circumference * scorePercent / 100);
            html += `<div class="chat-results__section">
                <div class="chat-results__section-title">🎯 Quiz-Ergebnisse</div>
                <div class="chat-results__quiz-hero">
                    <div class="chat-results__ring-wrap">
                        <svg class="chat-results__ring" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" stroke-width="6"/>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="${scorePercent >= 70 ? '#2d8a4e' : scorePercent >= 40 ? 'var(--color-accent)' : '#c0392b'}" stroke-width="6" stroke-linecap="round"
                                stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s ease;"/>
                        </svg>
                        <div class="chat-results__ring-text">
                            <div class="chat-results__ring-number">${quizCorrect}/${quizTotal}</div>
                            <div class="chat-results__ring-label">richtig</div>
                        </div>
                    </div>
                    <div class="chat-results__quiz-list">`;
            quizResults.forEach((q, i) => {
                html += `<div class="chat-results__quiz-row ${q.correct ? 'chat-results__quiz-row--correct' : 'chat-results__quiz-row--incorrect'}">
                    <span class="chat-results__quiz-icon">${q.correct ? '✓' : '✗'}</span>
                    <span class="chat-results__quiz-text">${q.question}</span>
                </div>`;
            });
            html += `</div></div></div>`;
        }

        // Barometer
        if (barometerResults.length > 0) {
            html += `<div class="chat-results__section">
                <div class="chat-results__section-title">📈 Stimmungsbarometer</div>`;
            barometerResults.forEach(b => {
                const pct = ((b.value - 1) / 9) * 100;
                html += `<div class="chat-results__bar">
                    <span class="chat-results__bar-label">${b.statement}</span>
                    <div class="chat-results__bar-track"><div class="chat-results__bar-fill" style="width:${pct}%"></div></div>
                    <span class="chat-results__bar-value">${b.value}/10</span>
                </div>`;
            });
            html += `</div>`;
        }

        // Checkpoint-Antworten
        if (checkpointAnswers.length > 0) {
            html += `<div class="chat-results__section">
                <div class="chat-results__section-title">📌 Deine Reflexionen</div>`;
            checkpointAnswers.forEach(c => {
                html += `<div class="chat-results__reflection">
                    <div class="chat-results__reflection-q">${c.question}</div>
                    <div class="chat-results__reflection-a">
                        <span class="chat-results__reflection-quote" aria-hidden="true">❝</span>
                        ${c.answer}
                    </div>
                </div>`;
            });
            html += `</div>`;
        }

        // Freitext-Antworten
        if (freetextResults.length > 0) {
            html += `<div class="chat-results__section">
                <div class="chat-results__section-title">✏️ Deine Texte</div>`;
            freetextResults.forEach(f => {
                const text = typeof f.getText === 'function' ? f.getText() : (f.text || '');
                if (text) {
                    html += `<div class="chat-results__reflection">
                        <div class="chat-results__reflection-q">${f.prompt}</div>
                        <div class="chat-results__reflection-a">
                            <span class="chat-results__reflection-quote" aria-hidden="true">❝</span>
                            ${text}
                        </div>
                    </div>`;
                }
            });
            html += `</div>`;
        }

        html += `<div class="chat-results__footer">
            <button class="chat-results__copy-btn">📋 Ergebnisse kopieren</button>
            <div class="chat-results__footer-note">Tipp: Kopiere deine Ergebnisse und füge sie in ein Dokument ein.</div>
        </div>`;
        html += `</div>`;

        el.innerHTML = html;

        // Copy handler
        const copyBtn = el.querySelector('.chat-results__copy-btn');
        copyBtn.addEventListener('click', () => {
            const lines = [];
            lines.push(`EpochenChat \u2013 Ergebnisse (${personaConfig.name || 'Persona'})`);
            lines.push('='.repeat(50));
            if (quizTotal > 0) {
                lines.push(`\nQuiz: ${quizCorrect}/${quizTotal} richtig (${scorePercent}%)`);
                quizResults.forEach((q, i) => lines.push(`  ${q.correct ? '\u2713' : '\u2717'} ${q.question}`));
            }
            if (barometerResults.length > 0) {
                lines.push(`\nBarometer:`);
                barometerResults.forEach(b => lines.push(`  ${b.statement}: ${b.value}/10`));
            }
            if (checkpointAnswers.length > 0) {
                lines.push(`\nReflexionen:`);
                checkpointAnswers.forEach(c => lines.push(`  ${c.question}\n    \u2192 ${c.answer}`));
            }
            if (freetextResults.length > 0) {
                lines.push(`\nFreitext:`);
                freetextResults.forEach(f => {
                    const text = typeof f.getText === 'function' ? f.getText() : (f.text || '');
                    if (text) lines.push(`  ${f.prompt}\n    \u2192 ${text}`);
                });
            }
            const textToCopy = lines.join('\n');
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyBtn.textContent = '\u2713 Kopiert!';
                setTimeout(() => { copyBtn.textContent = '\uD83D\uDCCB Ergebnisse kopieren'; }, 2000);
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = textToCopy;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                copyBtn.textContent = '\u2713 Kopiert!';
                setTimeout(() => { copyBtn.textContent = '\uD83D\uDCCB Ergebnisse kopieren'; }, 2000);
            });
        });

        return el;
    }

    /**
     * Gibt die aktuellen Ergebnisse zurück (für SCORM etc.)
     */
    function getResults() {
        return {
            quiz: quizResults.slice(),
            barometer: barometerResults.slice(),
            checkpoints: checkpointAnswers.slice(),
            freetext: freetextResults.map(f => ({
                prompt: f.prompt,
                text: typeof f.getText === 'function' ? f.getText() : (f.text || '')
            }))
        };
    }

    /* === Utilities === */

    function scrollToBottom() {
        requestAnimationFrame(() => {
            const panel = container.closest('.editor-panel--right') || container;
            panel.scrollTo({ top: panel.scrollHeight, behavior: SCROLL_BEHAVIOR });
        });
    }

    /**
     * Preview-Modus: alle Module sofort rendern (ohne Animation)
     */
    function renderAll(containerEl, moduleList, config) {
        container = containerEl;
        modules = moduleList || [];
        personaConfig = config || {};
        avatarSrc = config.avatarSrc || 'assets/avatars/eichendorff.png';
        currentIndex = 0;
        checkpointAnswers = [];
        quizResults = [];
        barometerResults = [];
        freetextResults = [];

        container.innerHTML = '';
        container.setAttribute('role', 'log');

        if (modules.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--color-text-muted);font-family:var(--font-sans);">Gib links einen Chat im Markdown-Format ein…</div>';
            return;
        }

        renderProgress();

        modules.forEach((mod, i) => {
            currentIndex = i + 1;
            let el;

            switch (mod.type) {
                case 'framing':         el = renderFraming(mod); break;
                case 'persona':         el = renderPersona(mod); break;
                case 'learner':         el = renderLearner(mod); break;
                case 'quote':           el = renderQuote(mod); break;
                case 'context':         el = renderContext(mod); break;
                case 'quiz-single':     el = renderQuiz(mod, false); break;
                case 'quiz-multi':      el = renderQuiz(mod, true); break;
                case 'freetext':        el = renderFreetext(mod); break;
                case 'barometer':       el = renderBarometer(mod); break;
                case 'checkpoint':      el = renderCheckpoint(mod); break;
                case 'image':           el = renderImage(mod); break;
                case 'audio':           el = renderAudio(mod); break;
                case 'annotation':      el = renderAnnotation(mod); break;
                case 'self-assessment': el = renderSelfAssessment(mod); break;
                case 'timeline':        el = renderTimeline(mod); break;
                case 'finale':          el = renderFinale(mod); break;
                default:                el = renderPersona(mod); break;
            }

            container.appendChild(el);
        });

        updateProgress();
    }

    return { init, renderAll, getResults };
})();
