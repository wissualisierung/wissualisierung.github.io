/* ============================================
   EpochenChat – Editor Logic
   Split-Screen-Editor, Persona-Config, Preview
   CC-BY-SA 4.0 Sebastian Wolf 2026
   ============================================ */

const EpochenEditor = (() => {
    'use strict';

    // State
    let currentTheme = 'modern_hell';
    let avatarDataUrl = '';

    /**
     * Konvertiert ein Bild (Pfad, file://, http://) in eine kompakte data:-URL.
     * 1. Lädt die Bilddaten per XHR/fetch (umgeht file://-Einschränkungen)
     * 2. Skaliert auf 200×200px JPEG (kompakt für Vorschau, Export, localStorage)
     *
     * Für bereits konvertierte data:-URLs wird sofort zurückgegeben.
     */
    function fetchImageAsDataUrl(src) {
        return new Promise((resolve) => {
            if (!src) { resolve(''); return; }
            if (src.startsWith('data:')) { resolve(src); return; }

            // Schritt 2: data:-URL → Image → Canvas-Resize → kompakte JPEG data:-URL
            function resizeDataUrl(dataUrl) {
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const size = 200; // Ausreichend für Avatar-Vorschau
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        const w = img.naturalWidth || img.width;
                        const h = img.naturalHeight || img.height;
                        const min = Math.min(w, h);
                        const sx = (w - min) / 2;
                        const sy = (h - min) / 2;
                        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
                        resolve(canvas.toDataURL('image/jpeg', 0.8));
                    } catch (e) {
                        resolve(dataUrl); // Resize fehlgeschlagen → Vollbild
                    }
                };
                img.onerror = () => resolve(dataUrl);
                img.src = dataUrl;
            }

            // Schritt 1: Bilddaten laden → Blob → data:-URL
            function blobToDataUrl(blob) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataUrl = reader.result;
                    if (dataUrl && dataUrl.startsWith('data:')) {
                        resizeDataUrl(dataUrl);
                    } else {
                        resolve('');
                    }
                };
                reader.onerror = () => resolve('');
                reader.readAsDataURL(blob);
            }

            // Versuch 1: XMLHttpRequest (zuverlässig auf file://, status=0)
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', src, true);
                xhr.responseType = 'blob';
                xhr.onload = () => {
                    if ((xhr.status === 0 || xhr.status === 200) && xhr.response) {
                        blobToDataUrl(xhr.response);
                    } else {
                        tryFetch();
                    }
                };
                xhr.onerror = () => tryFetch();
                xhr.send();
            } catch (e) {
                tryFetch();
            }

            // Versuch 2: fetch-API (Fallback)
            function tryFetch() {
                fetch(src)
                    .then(resp => resp.blob())
                    .then(blob => blobToDataUrl(blob))
                    .catch(() => resolve(''));
            }
        });
    }
    let debounceTimer = null;

    // Persona-Vorlagen: Standard-Tutorial (hardcoded) + dynamische Autoren-Vorlagen
    const TEMPLATES = {
        standard: {
            name: 'EpochenChat Tutorial',
            theme: 'modern_hell',
            avatar: 'assets/demo_didaktik.png',
            epoch: 'Didaktik & Methode',
            markdown: `[RAHMUNG]
Dieses Tutorial führt in das Chat-Format ein. Es demonstriert die grundlegenden Module anhand ihrer eigenen Struktur. Das Format basiert auf den elf Aspekten literarischen Lernens nach Spinner (2006). Jedes Modul erfüllt eine spezifische didaktische Funktion. Diese Konzeption wird im Folgenden knapp erläutert.

[PERSONA]
Hallo! Willkommen im Tutorial zum Generator *EpochenChat*. Mit mir können Epochen und ihre Vertreter lebendig werden. 

[KONTEXT]
Das Chat-Format strukturiert literarische Lernprozesse als simulierten Dialog. Eine PERSONA – eine historisch oder literarisch fundierte Konstruktion – übernimmt die Rolle des Impulsgebers. Der LERNER modelliert die Schülerperspektive. Beide zusammen erzeugen das für literarisches Lernen zentrale Spannungsverhältnis zwischen subjektiver Involviertheit und analytischer Distanz. 

[PERSONA]
Ich bin eine didaktische Konstruktion. Ich spreche aus der Perspektive einer historischen Figur – auf Basis von Texten, Briefen und gesicherten Quellen. Was ich sage, ist aber keine historische Wahrheit, sondern eine interpretierte Annäherung. Jede meiner Aussagen kann mit einer Quellenangabe versehen werden. [Q: Hier kann eine Quelle eingefügt werden]

[PERSONA]
Das einleitende RAHMUNG-Modul sichert die nötige Transparenz über den konstruierten Charakter der Persona. Hier sollte darauf verwiesen werden, dass es sich um eine didaktische Fiktion handelt, um Transparenz für den Lernenden zu schaffen und die Konstruktion falscher mentaler Bilder zu vermeiden.

[LERNER]
Wozu brauche ich eigentlich eine Persona? Reicht es nicht, den Text selbst zu lesen?

[PERSONA]
Das Persona-Format zielt auf das Nachvollziehen fremder Perspektiven. Indem die historische Figur selbst spricht, werden Schülerinnen und Schüler eingeladen, die Hintergründe der Haltung zu rekonstruieren und nicht nur zu beschreiben. 

[LERNER]
Wozu brauche ich eine Persona? Reicht es nicht, den Text selbst zu lesen?

[PERSONA]
Der LERNER-Einwurf modelliert dabei produktives Nachfragen: Er zeigt, wie kritische Auseinandersetzung aussehen kann.

[ZITAT]
"Literarisches Lernen vollzieht sich im Spannungsfeld von subjektiver Involviertheit und analytischer Distanz." – Kaspar H. Spinner, Literarisches Lernen (2006)

[ANNOTATION]
Literarisches Lernen vollzieht sich im Spannungsfeld von subjektiver Involviertheit und analytischer Distanz. | Markiere die beiden Pole, zwischen denen sich laut Spinner produktive Spannung bildet. 
>> subjektiver Involviertheit :: FREITEXT und BAROMETER adressieren diesen Pol gezielt.
>> analytischer Distanz :: ANNOTATION und QUIZ sichern die genaue Textwahrnehmung ab.

[CHECKPOINT]
Überlege kurz, welchen der beiden Pole du im Unterricht häufiger anwendest und welcher in deinem Unterricht vielleicht noch zu kurz kommt. Wie könntest du darauf reagieren? Notiere eine konkrete Handlungsoption. 

[QUIZ:single]
Welches Modul dient primär der Verständnissicherung mit sofortigem Feedback?
- [ ] Freitext >> FREITEXT ist offen; es gibt keine richtige Antwort und kein automatisches Feedback.
- [ ] Kontext >> KONTEXT liefert Hintergrundwissen, prüft aber nichts ab.
- [x] Quiz >> Korrekt. Das QUIZ-Modul bietet Single- und Multiple-Choice-Formate mit optionalem Feedback je Antwortoption.
- [ ] Checkpoint >> CHECKPOINT ist offen; es gibt keine richtige Antwort oder ein unmittelbares Feedback.

[FREITEXT]
Entscheide, für welches Werk oder welche Epoche du dieses Format einmal exemplarisch einsetzen und welche zwei Aspekte nach Spinner du dabei gezielt adressieren möchtest. Begründe deine Wahl.

[CHECKPOINT]
Gib für ein selbst gewähltes Modul den didaktischen Zweck an!

[SELBST]
Ich verstehe die Grundstruktur des Chat-Formats | Ich kann Module gezielt Lernzielen zuordnen | Ich kann ein eigenes Modul nach dem vorgegebenen Format erstellen

[PERSONA]
Nach dem folgenden Abschluss kannst du dir eine Zusammenfassung anzeigen lassen. Speichere dir diese ab, damit im anschließenden Unterrichtsgespräch darauf Bezug genommen werden kann. Insbesondere deine Freitext-Anworten sind dabei von besonderem Interesse.

[ABSCHLUSS]
Das Chat-Format ist ein offenes Werkzeug: Es strukturiert literarische Lernprozesse, schreibt aber keine Inhalte vor. Die vollständige Modul-Referenz sowie Beispiel-Chats stehen im Editor selbst zur Verfügung. Klicke einfach auf das Fragezeichen. Wenn du dich weiter über Spinners elf Aspekte zum Literarischen Lernen informieren willst, findest du hier die geeigneten Hintergründe. 
- [Link zum Artikel](https://www.deutschdidaktik.phil.fau.de/files/2024/06/Spinner-Kaspar-H.-2006-Literarisches-Lernen-_ocr.pdf)
>> Spinner, Kaspar H.: Literarisches Lernen. In: Praxis Deutsch, Bd. 33, Nr. 200. Friedrich Verlag 2006, S. 6–16.`
        }
    };

    /**
     * Registriert Autoren-Vorlagen aus dem vorlagen-bundle.js (window.VORLAGEN_BUNDLE).
     * Wird synchron beim Init aufgerufen – kein XHR/fetch nötig (file://-kompatibel).
     */
    function loadVorlagenBundle() {
        const bundle = window.VORLAGEN_BUNDLE;
        if (!Array.isArray(bundle) || bundle.length === 0) {
            console.warn('VORLAGEN_BUNDLE nicht verfügbar.');
            return;
        }

        bundle.forEach(entry => {
            const key = entry.filename.replace('.json', '');
            TEMPLATES[key] = {
                name: entry.name,
                theme: entry.theme,
                avatar: entry.avatar,
                epoch: entry.epoch,
                markdown: entry.markdown || '',
                source: entry.source || '',
                creator: entry.creator || '',
                time: entry.time || '15',
                _bundleAvatarDataUrl: entry.avatarDataUrl || ''
            };
        });
    }

    // Snippet-Definitionen für die Toolbar
    const SNIPPETS = [
        { label: '[RAHMUNG]', tag: '[RAHMUNG]\nHinweis: Diese Figur ist eine didaktische Konstruktion.\n' },
        { label: '[PERSONA]', tag: '[PERSONA]\nText der Persona\n' },
        { label: '[LERNER]', tag: '[LERNER]\nReflexionsfrage\n' },
        { label: '[ZITAT]', tag: '[ZITAT]\n"Zitierter Text" – Quelle\n' },
        { label: '[KONTEXT]', tag: '[KONTEXT]\nHintergrundtext\n' },
        { label: '[BILD]', tag: '[BILD]\n![Bildbeschreibung](https://link-zum-bild.jpg) >> Bildquelle\n' },
        { label: '[AUDIO]', tag: '[AUDIO]\n[Titel des Audio-Beitrags](https://link-zur-audio.mp3) >> Quelle\n' },
        { label: '[ANNOTATION]', tag: '[ANNOTATION]\nPrimärtext zum Markieren | Arbeitsauftrag\n>> Schlüsselwort :: Feedback-Text\n' },
        { label: '[QUIZ:single]', tag: '[QUIZ:single]\nFrage\n- [ ] falsch >> Erklärung warum falsch\n- [x] richtig >> Genau, weil…\n- [ ] falsch\n' },
        { label: '[QUIZ:multi]', tag: '[QUIZ:multi]\nFrage\n- [x] richtig >> Korrekt!\n- [ ] falsch >> Das stimmt nicht, weil…\n- [x] richtig\n' },
        { label: '[FREITEXT]', tag: '[FREITEXT]\nAufgabenstellung\n' },
        { label: '[BAROMETER]', tag: '[BAROMETER]\nAussage | stimme nicht zu | stimme voll zu\n' },
        { label: '[CHECKPOINT]', tag: '[CHECKPOINT]\nReflexionsfrage\n' },
        { label: '[SELBST]', tag: '[SELBST]\nKompetenz 1 | Kompetenz 2 | Kompetenz 3\n' },
        { label: '[ZEITSTRAHL]', tag: '[ZEITSTRAHL]\nBarock:1600-1720 | *Romantik:1795-1835 >> Epoche der Sehnsucht | Expressionismus:1905-1925\n' },
        { label: '[ABSCHLUSS]', tag: '[ABSCHLUSS]\nAbschlusstext\n- [Linktext](URL)\n>> Literatur\n' }
    ];

    /**
     * Editor initialisieren
     */
    function init() {
        const textarea = document.getElementById('editorTextarea');
        const previewContainer = document.getElementById('previewContainer');
        const themeSelect = document.getElementById('personaTheme');
        const nameInput = document.getElementById('personaName');
        const sourceInput = document.getElementById('personaSource');
        const creatorInput = document.getElementById('creatorName');
        const timeInput = document.getElementById('estimatedTime');
        const avatarImg = document.getElementById('personaAvatarImg');
        const avatarInput = document.getElementById('avatarFileInput');
        const avatarUploadBtn = document.getElementById('avatarUploadBtn');

        // Snippet-Toolbar aufbauen
        renderSnippetToolbar();

        // Vorlagen aus Bundle registrieren (synchron, file://-kompatibel)
        loadVorlagenBundle();

        // Template-Grid aufbauen
        renderTemplateGrid();

        // Standard-Template laden
        loadTemplate('standard');

        // Live-Preview (debounced)
        textarea.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => updatePreview(), 300);
        });

        // Theme-Wechsel
        themeSelect.addEventListener('change', () => {
            currentTheme = themeSelect.value;
            applyTheme();
            updatePreview();
        });

        // Name & Source Änderung
        nameInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => updatePreview(), 300);
        });
        sourceInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => updatePreview(), 300);
        });

        // Avatar-Upload
        avatarUploadBtn.addEventListener('click', () => avatarInput.click());
        avatarImg.addEventListener('click', () => avatarInput.click());

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Bitte wähle eine Bilddatei (JPG, PNG, SVG).');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                avatarDataUrl = ev.target.result;
                avatarImg.src = avatarDataUrl;
                updatePreview();
            };
            reader.readAsDataURL(file);
        });

        // Export-Buttons
        document.getElementById('btnExportHtml').addEventListener('click', exportHtml);
        document.getElementById('btnExportScorm').addEventListener('click', exportScorm);
        document.getElementById('btnTemplates').addEventListener('click', showTemplateModal);

        // Save / Load
        document.getElementById('btnSave').addEventListener('click', saveProject);
        document.getElementById('btnLoad').addEventListener('click', () => document.getElementById('loadFileInput').click());
        document.getElementById('loadFileInput').addEventListener('change', loadProject);

        // Markdown Import
        document.getElementById('btnImportMd').addEventListener('click', () => document.getElementById('importMdInput').click());
        document.getElementById('importMdInput').addEventListener('change', importMarkdown);

        // Keyboard Shortcuts
        document.addEventListener('keydown', handleShortcuts);

        // Statusbar
        textarea.addEventListener('input', updateStatusBar);
        updateStatusBar();

        // Auto-save to localStorage every 30s
        setInterval(autoSave, 30000);
        loadAutoSave();
    }

    function renderSnippetToolbar() {
        const toolbar = document.getElementById('snippetToolbar');
        SNIPPETS.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'snippet-btn snippet-btn--tag';
            btn.textContent = s.label;
            btn.title = `${s.label} einfügen`;
            btn.addEventListener('click', () => insertSnippet(s.tag));
            toolbar.appendChild(btn);
        });
    }

    function insertSnippet(text) {
        const textarea = document.getElementById('editorTextarea');
        const start = textarea.selectionStart;
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(textarea.selectionEnd);

        // Ensure newline before tag
        const prefix = before.length > 0 && !before.endsWith('\n') ? '\n\n' : '';
        textarea.value = before + prefix + text + after;
        textarea.focus();

        const newPos = start + prefix.length + text.length;
        textarea.setSelectionRange(newPos, newPos);
        updatePreview();
        updateStatusBar();
    }

    function renderTemplateGrid() {
        const grid = document.getElementById('templateGrid');
        grid.innerHTML = '';

        Object.entries(TEMPLATES).forEach(([key, tmpl]) => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <img class="template-card__avatar" src="${tmpl.avatar}" alt="${tmpl.name}" />
                <div class="template-card__name">${tmpl.name}</div>
                <div class="template-card__epoch">${tmpl.epoch}</div>
            `;
            card.addEventListener('click', () => {
                loadTemplate(key);
                hideTemplateModal();
            });
            grid.appendChild(card);
        });
    }

    function loadTemplate(key) {
        const tmpl = TEMPLATES[key];
        if (!tmpl) return;

        document.getElementById('editorTextarea').value = tmpl.markdown;
        document.getElementById('personaName').value = tmpl.name;
        document.getElementById('personaTheme').value = tmpl.theme;
        document.getElementById('personaSource').value = tmpl.source || '';
        document.getElementById('creatorName').value = tmpl.creator || '';
        document.getElementById('estimatedTime').value = tmpl.time || '20';

        // Avatar: embedded data-URL aus Bundle oder Bilddatei laden
        if (tmpl._bundleAvatarDataUrl) {
            avatarDataUrl = tmpl._bundleAvatarDataUrl;
            document.getElementById('personaAvatarImg').src = avatarDataUrl;
        } else {
            document.getElementById('personaAvatarImg').src = tmpl.avatar;
            fetchImageAsDataUrl(tmpl.avatar).then(dataUrl => {
                avatarDataUrl = dataUrl || '';
                if (dataUrl) {
                    document.getElementById('personaAvatarImg').src = dataUrl;
                }
                updatePreview();
            });
        }

        currentTheme = tmpl.theme;
        applyTheme();
        updatePreview();
        updateStatusBar();
    }

    function applyTheme() {
        const previewPanel = document.getElementById('previewPanel');
        previewPanel.dataset.theme = currentTheme;
    }

    function getConfig() {
        const nameInput = document.getElementById('personaName');
        const sourceInput = document.getElementById('personaSource');
        const creatorInput = document.getElementById('creatorName');
        const avatarImg = document.getElementById('personaAvatarImg');
        return {
            name: nameInput.value || 'Persona',
            theme: currentTheme,
            source: sourceInput.value || '',
            creator: creatorInput.value || '',
            avatarSrc: avatarDataUrl || avatarImg.src
        };
    }

    function updatePreview() {
        const textarea = document.getElementById('editorTextarea');
        const previewContainer = document.getElementById('previewContainer');
        const markdown = textarea.value;
        const modules = EpochenParser.parse(markdown);
        const config = getConfig();

        EpochenPlayer.renderAll(previewContainer, modules, config);
    }

    function updateStatusBar() {
        const textarea = document.getElementById('editorTextarea');
        const text = textarea.value;
        const lines = text.split('\n').length;
        const modules = EpochenParser.parse(text);

        document.getElementById('statusModules').textContent = modules.length;
        document.getElementById('statusLines').textContent = lines;

        const dot = document.getElementById('statusDot');
        dot.className = modules.length > 0 ? 'editor-statusbar__dot' : 'editor-statusbar__dot editor-statusbar__dot--error';
    }

    function showTemplateModal() {
        document.getElementById('templateModal').hidden = false;
    }

    function hideTemplateModal() {
        document.getElementById('templateModal').hidden = true;
    }

    /* === Keyboard Shortcuts === */
    function handleShortcuts(e) {
        // Ctrl+S → HTML Export
        if (e.ctrlKey && !e.shiftKey && e.key === 's') {
            e.preventDefault();
            exportHtml();
        }
        // Ctrl+Shift+S → Save Project
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            saveProject();
        }
        // Ctrl+O → Load Project
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            document.getElementById('loadFileInput').click();
        }
        // Escape → Close modals
        if (e.key === 'Escape') {
            hideTemplateModal();
        }
    }

    /* === Save / Load Project === */
    function saveProject() {
        const project = {
            version: '0.2',
            type: 'epochenchat-project',
            timestamp: new Date().toISOString(),
            persona: {
                name: document.getElementById('personaName').value,
                source: document.getElementById('personaSource').value,
                creator: document.getElementById('creatorName').value,
                theme: currentTheme,
                avatarDataUrl: avatarDataUrl,
                avatarDefault: document.getElementById('personaAvatarImg').src
            },
            estimatedTime: document.getElementById('estimatedTime').value,
            markdown: document.getElementById('editorTextarea').value
        };

        const json = JSON.stringify(project, null, 2);
        const safeName = sanitizeFilename(project.persona.name);
        const filename = `epochenchat_${safeName}.json`;

        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('💾 Projekt gespeichert');
    }

    function loadProject(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const project = JSON.parse(ev.target.result);

                if (project.type !== 'epochenchat-project') {
                    alert('Diese Datei ist kein gültiges EpochenChat-Projekt.');
                    return;
                }

                document.getElementById('editorTextarea').value = project.markdown || '';
                document.getElementById('personaName').value = project.persona?.name || 'Persona';
                document.getElementById('personaSource').value = project.persona?.source || '';
                document.getElementById('creatorName').value = project.persona?.creator || '';
                document.getElementById('personaTheme').value = project.persona?.theme || 'romantik';
                document.getElementById('estimatedTime').value = project.estimatedTime || '20';

                if (project.persona?.avatarDataUrl) {
                    avatarDataUrl = project.persona.avatarDataUrl;
                    document.getElementById('personaAvatarImg').src = avatarDataUrl;
                } else {
                    avatarDataUrl = '';
                    // Template-Avatar als data:-URL laden
                    const tmpl = Object.values(TEMPLATES).find(t => t.theme === project.persona?.theme);
                    if (tmpl) {
                        document.getElementById('personaAvatarImg').src = tmpl.avatar;
                        fetchImageAsDataUrl(tmpl.avatar).then(dataUrl => {
                            avatarDataUrl = dataUrl || '';
                            if (dataUrl) {
                                document.getElementById('personaAvatarImg').src = dataUrl;
                            }
                            updatePreview();
                        });
                    }
                }

                currentTheme = project.persona?.theme || 'romantik';
                applyTheme();
                updatePreview();
                updateStatusBar();
                showNotification('📂 Projekt geladen');

            } catch (err) {
                alert('Fehler beim Laden der Datei: ' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset
    }

    /* === Markdown Import === */
    function importMarkdown(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('editorTextarea').value = ev.target.result;
            updatePreview();
            updateStatusBar();
            showNotification('📄 Markdown importiert');
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    /* === Auto-Save (localStorage) === */
    function autoSave() {
        try {
            const data = {
                markdown: document.getElementById('editorTextarea').value,
                name: document.getElementById('personaName').value,
                source: document.getElementById('personaSource').value,
                creator: document.getElementById('creatorName').value,
                theme: currentTheme,
                time: document.getElementById('estimatedTime').value,
                avatarDataUrl: avatarDataUrl
            };
            localStorage.setItem('epochenchat_autosave', JSON.stringify(data));
        } catch (e) { /* localStorage might be full or unavailable */ }
    }

    function loadAutoSave() {
        try {
            const saved = localStorage.getItem('epochenchat_autosave');
            if (!saved) return;

            const data = JSON.parse(saved);
            // Only restore if the textarea is still at the default template
            const currentText = document.getElementById('editorTextarea').value;
            if (data.markdown && data.markdown !== currentText && data.markdown.length > 50) {
                const restore = confirm('Es gibt eine automatisch gespeicherte Version. Wiederherstellen?');
                if (restore) {
                    document.getElementById('editorTextarea').value = data.markdown;
                    document.getElementById('personaName').value = data.name || 'Persona';
                    document.getElementById('personaSource').value = data.source || '';
                    document.getElementById('creatorName').value = data.creator || '';
                    document.getElementById('personaTheme').value = data.theme || 'romantik';
                    document.getElementById('estimatedTime').value = data.time || '20';
                    if (data.avatarDataUrl) {
                        avatarDataUrl = data.avatarDataUrl;
                        document.getElementById('personaAvatarImg').src = avatarDataUrl;
                    } else {
                        // Template-Avatar als data:-URL nachladen
                        const tmpl = Object.values(TEMPLATES).find(t => t.theme === (data.theme || 'romantik'));
                        if (tmpl) {
                            fetchImageAsDataUrl(tmpl.avatar).then(dataUrl => {
                                if (dataUrl) {
                                    avatarDataUrl = dataUrl;
                                    document.getElementById('personaAvatarImg').src = dataUrl;
                                    updatePreview();
                                }
                            });
                        }
                    }
                    currentTheme = data.theme || 'romantik';
                    applyTheme();
                    updatePreview();
                    updateStatusBar();
                }
            }
        } catch (e) { /* ignore */ }
    }

    /* === Notifications === */
    function showNotification(message) {
        // Remove any existing notification
        const existing = document.querySelector('.editor-notification');
        if (existing) existing.remove();

        const el = document.createElement('div');
        el.className = 'editor-notification';
        el.textContent = message;
        document.body.appendChild(el);

        setTimeout(() => {
            el.classList.add('editor-notification--hide');
            setTimeout(() => el.remove(), 300);
        }, 2000);
    }

    function sanitizeFilename(name) {
        return (name || 'projekt')
            .toLowerCase()
            .replace(/[äÄ]/g, 'ae')
            .replace(/[öÖ]/g, 'oe')
            .replace(/[üÜ]/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    /**
     * HTML-Export
     */
    function exportHtml() {
        const timeInput = document.getElementById('estimatedTime');
        const time = parseInt(timeInput.value);

        if (!time || time < 1) {
            timeInput.focus();
            timeInput.style.borderColor = '#c0392b';
            alert('Bitte gib eine geschätzte Bearbeitungszeit (in Minuten) an.');
            return;
        }
        timeInput.style.borderColor = '';

        EpochenExporter.exportAsHtml(getConfig(), time);
        showNotification('⬇ HTML exportiert');
    }

    /**
     * SCORM 1.2 Export
     */
    function exportScorm() {
        const timeInput = document.getElementById('estimatedTime');
        const time = parseInt(timeInput.value);

        if (!time || time < 1) {
            timeInput.focus();
            timeInput.style.borderColor = '#c0392b';
            alert('Bitte gib eine geschätzte Bearbeitungszeit (in Minuten) an.');
            return;
        }
        timeInput.style.borderColor = '';

        EpochenExporter.exportAsScorm(getConfig(), time);
        showNotification('🎓 SCORM 1.2 ZIP exportiert');
    }

    // Public API
    return { init, hideTemplateModal, TEMPLATES };
})();

