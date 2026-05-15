/* ============================================
   EpochenChat – Markdown Parser
   Parst die Chat-Syntax in ein Module-Array
   CC-BY-SA 4.0 Sebastian Wolf 2026
   ============================================ */

const EpochenParser = (() => {
    'use strict';

    // Tag-Pattern: [TAG] oder [TAG:sub] am Zeilenanfang
    const TAG_RE = /^\[([A-ZÄÖÜ_]+)(?::(\w+))?\]\s*(.*)/;

    /**
     * Parst Inline-Markdown: **bold**, *italic*, [text](url), [Q: source]
     */
    function parseInline(text) {
        if (!text) return '';
        return text
            // Quellenreferenzen [Q: Quelle]
            .replace(/\[Q:\s*([^\]]+)\]/g, (_, src) =>
                `<span class="chat-source-ref" title="${escHtml(src)}" tabindex="0" role="button" aria-label="Quelle: ${escHtml(src)}">Q</span>`)
            // Links [text](url)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            // Bold **text**
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic *text*
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n/g, '<br>');
    }

    function escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Hauptparser: String → Array von Modulobjekten
     */
    function parse(markdown) {
        if (!markdown || !markdown.trim()) return [];

        const lines = markdown.split('\n');
        const modules = [];
        let current = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(TAG_RE);

            if (match) {
                // Vorheriges Modul abschließen
                if (current) {
                    modules.push(finalizeModule(current));
                }

                const [, tag, sub, content] = match;
                current = { tag: tag.toUpperCase(), sub: sub || null, lines: [] };
                if (content.trim()) {
                    current.lines.push(content);
                }
            } else if (current) {
                // Zeile zum aktuellen Modul hinzufügen
                current.lines.push(line);
            }
            // Zeilen vor dem ersten Tag werden ignoriert
        }

        // Letztes Modul abschließen
        if (current) {
            modules.push(finalizeModule(current));
        }

        return modules;
    }

    /**
     * Wandelt Roh-Modul in typisiertes Objekt um
     */
    function finalizeModule(raw) {
        const content = raw.lines.join('\n').trim();
        const tag = raw.tag;
        const sub = raw.sub;

        switch (tag) {
            case 'RAHMUNG':
                return { type: 'framing', content: parseInline(content) };

            case 'PERSONA':
                return { type: 'persona', content: parseInline(content) };

            case 'LERNER':
                return { type: 'learner', content: parseInline(content) };

            case 'ZITAT':
                return parseQuote(content);

            case 'KONTEXT':
                return { type: 'context', content: parseInline(content) };

            case 'QUIZ':
                return parseQuiz(content, sub);

            case 'FREITEXT':
                return { type: 'freetext', prompt: parseInline(content) };

            case 'BAROMETER':
                return parseBarometer(content);

            case 'CHECKPOINT':
                return { type: 'checkpoint', question: parseInline(content) };

            case 'SELBST':
                return parseSelfAssessment(content);

            case 'ZEITSTRAHL':
                return parseTimeline(content);

            case 'ABSCHLUSS':
                return parseFinale(content);

            case 'BILD':
                return parseImage(content);

            case 'AUDIO':
                return parseAudio(content);

            case 'ANNOTATION':
                return parseAnnotation(content);

            default:
                return { type: 'persona', content: parseInline(content) };
        }
    }

    function parseQuote(content) {
        // Format: "Zitierter Text" – Quelle
        const quoteMatch = content.match(/^"([^"]+)"\s*[–—-]\s*(.+)$/s);
        if (quoteMatch) {
            return {
                type: 'quote',
                text: parseInline(quoteMatch[1]),
                source: quoteMatch[2].trim()
            };
        }
        // Fallback: ganzer Text ist Zitat
        const parts = content.split(/\n\s*[–—-]\s*/);
        return {
            type: 'quote',
            text: parseInline(parts[0].replace(/^"|"$/g, '')),
            source: parts[1] ? parts[1].trim() : ''
        };
    }

    function parseQuiz(content, sub) {
        const lines = content.split('\n');
        const question = lines[0].trim();
        const options = [];
        const isMulti = (sub || '').toLowerCase() === 'multi';

        for (let i = 1; i < lines.length; i++) {
            const optMatch = lines[i].match(/^\s*-\s*\[([ x])\]\s*(.+)/i);
            if (optMatch) {
                let text = optMatch[2].trim();
                let feedback = null;
                // Parse >> Feedback
                const fbMatch = text.match(/^(.+?)\s*>>\s*(.+)$/);
                if (fbMatch) {
                    text = fbMatch[1].trim();
                    feedback = parseInline(fbMatch[2].trim());
                }
                options.push({
                    text,
                    correct: optMatch[1].toLowerCase() === 'x',
                    feedback
                });
            }
        }

        return {
            type: isMulti ? 'quiz-multi' : 'quiz-single',
            question: parseInline(question),
            options
        };
    }

    function parseBarometer(content) {
        const parts = content.split('|').map(p => p.trim());
        return {
            type: 'barometer',
            statement: parseInline(parts[0] || ''),
            min: parts[1] || 'stimme nicht zu',
            max: parts[2] || 'stimme voll zu'
        };
    }

    function parseSelfAssessment(content) {
        const items = content.split('|').map(p => p.trim()).filter(Boolean);
        return { type: 'self-assessment', items };
    }

    function parseTimeline(content) {
        const entries = content.split('|').map(p => p.trim()).filter(Boolean);
        const epochs = entries.map(e => {
            // Check for >> Info popup text
            let info = null;
            let main = e;
            const infoMatch = e.match(/^(.+?)\s*>>\s*(.+)$/);
            if (infoMatch) {
                main = infoMatch[1].trim();
                info = parseInline(infoMatch[2].trim());
            }
            // Check for * prefix (active/selected epoch)
            const isActive = main.startsWith('*');
            if (isActive) main = main.substring(1).trim();
            const m = main.match(/^(.+):(\d+)-(\d+)$/);
            if (m) return { name: m[1].trim(), start: parseInt(m[2]), end: parseInt(m[3]), active: isActive, info };
            return { name: main, start: 0, end: 0, active: isActive, info };
        });
        return { type: 'timeline', epochs };
    }

    function parseFinale(content) {
        const lines = content.split('\n');
        const mainLines = [];
        const links = [];
        const literature = [];
        
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            const linkMatch = trimmed.match(/^-\s*\[([^\]]+)\]\(([^)]+)\)$/);
            const litMatch = trimmed.match(/^>>\s*(.+)$/);
            
            if (linkMatch) {
                links.push({ label: linkMatch[1], url: linkMatch[2] });
            } else if (litMatch) {
                literature.push(parseInline(litMatch[1]));
            } else {
                mainLines.push(lines[i]);
            }
        }
        
        return {
            type: 'finale',
            text: parseInline(mainLines.join('\n').trim()),
            links: links,
            literature: literature
        };
    }

    function parseImage(content) {
        // New Syntax: ![Alt](URL) >> Source
        const mdMatch = content.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s*>>\s*(.+))?$/);
        if (mdMatch) {
            return {
                type: 'image',
                src: mdMatch[2].trim(),
                alt: mdMatch[1].trim() || 'Bild',
                source: mdMatch[3] ? mdMatch[3].trim() : null
            };
        }

        // Old Syntax: URL | Alt >> Source
        const parts = content.split('|').map(p => p.trim());
        let src = parts[0] || '';
        let alt = parts[1] || 'Bild';
        let source = null;

        // Check for >> source in alt or in the whole content if no |
        const sourceMatch = (parts[1] || parts[0] || '').match(/^(.+?)\s*>>\s*(.+)$/);
        if (sourceMatch) {
            if (parts[1]) alt = sourceMatch[1].trim();
            else src = sourceMatch[1].trim();
            source = sourceMatch[2].trim();
        }

        return { type: 'image', src, alt, source };
    }

    function parseAudio(content) {
        // New Syntax: [Label](URL) >> Source
        const mdMatch = content.match(/^\[([^\]]*)\]\(([^)]+)\)(?:\s*>>\s*(.+))?$/);
        if (mdMatch) {
            return {
                type: 'audio',
                src: mdMatch[2].trim(),
                label: mdMatch[1].trim() || 'Audio abspielen',
                source: mdMatch[3] ? mdMatch[3].trim() : null
            };
        }

        // Old Syntax: URL | Label >> Source
        const parts = content.split('|').map(p => p.trim());
        let src = parts[0] || '';
        let label = parts[1] || 'Audio abspielen';
        let source = null;

        const sourceMatch = (parts[1] || parts[0] || '').match(/^(.+?)\s*>>\s*(.+)$/);
        if (sourceMatch) {
            if (parts[1]) label = sourceMatch[1].trim();
            else src = sourceMatch[1].trim();
            source = sourceMatch[2].trim();
        }

        return { type: 'audio', src, label, source };
    }

    function parseAnnotation(content) {
        const lines = content.split('\n');
        // First line(s) before any >> line: Text | Aufgabe
        const mainLines = [];
        const targets = [];
        for (const line of lines) {
            const targetMatch = line.match(/^\s*>>\s*(.+?)\s*::\s*(.+)$/);
            if (targetMatch) {
                targets.push({
                    word: targetMatch[1].trim(),
                    feedback: parseInline(targetMatch[2].trim())
                });
            } else {
                mainLines.push(line);
            }
        }
        const mainContent = mainLines.join('\n');
        const parts = mainContent.split('|').map(p => p.trim());
        return {
            type: 'annotation',
            text: parts[0] || '',
            prompt: parseInline(parts[1] || 'Markiere relevante Stellen.'),
            targets
        };
    }

    return { parse, parseInline };
})();
