# EpochenChat Editor

**EpochenChat** ist ein didaktisches Werkzeug für Lehrkräfte, um interaktive, literarische Chats zu erstellen. Schüler:innen können so in einen simulierten Dialog mit historischen Persönlichkeiten oder literarischen Figuren treten, Wissen vertiefen und Reflexionsaufgaben bearbeiten.

## 🚀 Schnelleinstieg

1. Laden Sie das Projektverzeichnis herunter.
2. Öffnen Sie die Datei `index.html` in einem modernen Webbrowser (Chrome, Firefox, Edge oder Safari).
3. Nutzen Sie den Editor auf der linken Seite, um Ihren Chat zu gestalten. Die Live-Vorschau rechts zeigt sofort das Ergebnis.

## ✨ Features

- **Interaktiver Zeitstrahl:** Visualisierung von Epochen mit anklickbaren Infoboxen.
- **Didaktische Quiz-Module:** Single- und Multi-Choice Fragen mit bedingtem Feedback ("Wenn-Dann").
- **Annotation-Trigger:** Automatisches Feedback beim Markieren bestimmter Begriffe im Text.
- **Stimmungsbarometer & Reflexion:** Abfrage von Einschätzungen und Freitext-Antworten.
- **Premium Design:** Verschiedene Epochen-Themes (Romantik, Barock, Aufklärung, etc.) mit passender Typografie.
- **Export-Optionen:**
    - **Standalone HTML:** Eine einzelne, autarke Datei für den Browser.
    - **SCORM 1.2:** Paket für die Einbindung in Lernmanagementsysteme (LMS) wie Moodle oder It's Learning, inklusive Ergebnisübermittlung.

## 📝 Markdown-Syntax Guide

Der Editor nutzt eine erweiterte Markdown-Syntax:

### 👤 Persona-Nachrichten
Standard-Nachrichten der Figur.
```markdown
Joseph von Eichendorff: Ich muss nun weiterziehen – das liegt in meiner Natur.
```

### 📅 Zeitstrahl (Timeline)
Markieren Sie die aktive Epoche mit einem `*`.
```markdown
Timeline:
1750-1850: Klassik
*1795-1848: Romantik >> Die Romantik betont das Gefühl, die Individualität und die Natur.
1830-1848: Vormärz
```

### ❓ Quiz (Single & Multi)
Nutzen Sie `>>` für individuelles Feedback pro Antwortmöglichkeit.
```markdown
[?] Welches Motiv ist typisch für die Romantik?
- [ ] Die Ratio
- [x] Die Sehnsucht >> Richtig! Die Sehnsucht ist das zentrale Motiv.
- [ ] Die Fabrik
```

### 🖍 Annotation (Markierung)
Triggert Feedback, wenn Schüler:innen bestimmte Wörter im Text markieren.
```markdown
>> Sehnsucht :: Ein Schlüsselbegriff der Epoche.
>> Natur :: Hier als Spiegel der Seele verstanden.
In der Romantik ist die Sehnsucht nach der unberührten Natur allgegenwärtig.
```

### 📊 Weitere Module
- **Stimmungsbarometer:** `[~] Wie stark empfindest du die Naturverbundenheit?`
- **Reflexion (Checkpoint):** `[!] Was nimmst du aus diesem Gespräch mit?`
- **Freitext:** `[...] Beschreibe die Atmosphäre des Gedichts.`
- **Infobox (Framing):** `[#] Hinweis: Dieses Gespräch ist fiktiv.`

## 🎓 SCORM & Ergebnisse

Nach Abschluss des Chats erhalten Schüler:innen eine **Ergebnis-Zusammenfassung** mit Score-Ring und Reflexionskarten. 

Beim **SCORM-Export** werden folgende Daten an das LMS übermittelt:
- **Score:** Prozentuale Quiz-Ergebnisse.
- **Status:** Abschlussstatus (Completed).
- **Suspend Data:** Alle Antworten (Quiz, Barometer, Texte) werden im `suspend_data` Feld gespeichert.

## 📄 Lizenz

Dieses Projekt steht unter der Lizenz:
**CC-BY-SA 4.0 Sebastian Wolf 2026**

Das bedeutet: Sie dürfen das Werk teilen und bearbeiten, sofern Sie den Urheber nennen und Abwandlungen unter derselben Lizenz weitergeben.

---
*Entwickelt für den modernen Deutschunterricht.*
