# 📐 Datenpflege & Architektur: Lexikon der Strophenformen

Dieses Dokument beschreibt die Architektur, Datenhaltung und Pflege des Strophen-Navigators (Lexikon der Strophenformen) in WissOS 2.0.

---

## 1. Architekturübersicht

Der Strophen-Navigator folgt dem WissOS 2.0 Prinzip der **sauberen Trennung von App-Logik und Inhalten** (Content-Separation):

```
wissualisierung_os/
├── content/strophen/                 → Zentraler Datenordner
│   ├── index.json                    → Kompiliertes Gesamtverzeichnis (wird von der App geladen)
│   ├── [id].md                       → Einzelne Lernkarten im Markdown-Format (Offline-Archiv)
│   └── DATENPFLEGE.md                → Diese Dokumentation
│
└── PROGRAMME/Strophen-Navigator/
    ├── Beispielausgabe/
    │   └── index.html                → Die App-Shell (Spezialisierter Browser; lädt index.json dynamisch)
    └── Editor/
        ├── index_roh.html            → Das Roh-Template für den Standalone-Editor
        ├── strophen_editor.html      → Standalone-Editor (für Excel-Import und SCORM-Export)
        └── 774396e9 (1).xlsx         → Die Rohdatenbank als Excel-Tabelle
```

---

## 2. Das Daten-Enrichment (Die Pipeline)

Um die detaillierten akademischen Daten von Horst Joachim Frank (Muster, formale Besonderheiten, Interpretationsaspekte und Traditionslinien) offlinefähig zu machen, wurde eine automatisierte Pipeline implementiert:

* **Das Skript** `enrich_strophen.ps1` extrahiert die rohen Strophenmerkmale und verschmilzt sie mit der wissenschaftlichen Datenbank `FRANK_DATA` aus dem Original-WissOS.
* **Ergebnis**: Eine voll-angereicherte `content/strophen/index.json` und 55 reichhaltige `.md`-Dateien mit allen strukturierten Sektionen.

Falls die Quelldaten in `ALT/V3/` aktualisiert werden, kann die Pipeline jederzeit neu ausgeführt werden:
```powershell
powershell -ExecutionPolicy Bypass -File enrich_strophen.ps1
```

---

## 3. Manuelle Pflege (Neue Strophenformen hinzufügen)

Um eine neue Strophenform manuell hinzuzufügen, müssen zwei Schritte ausgeführt werden:

### Schritt A: Markdown-Lernkarte anlegen
Erstellen Sie eine neue Datei unter `content/strophen/[strophen_id].md` (z. B. `meine_form.md`) nach folgendem Muster:

```markdown
---
id: meine_form
name: Meine Strophenform
alternativnamen:
  - Optionale Alternativbezeichnung
versanzahl: 4
metrum:
  - Jambus
hebungen: 4
reimschema:
  - abab
kadenz: wechselnd
wiki: https://de.wikipedia.org/wiki/Beispiel
---

## Interpretation
Hier steht die didaktische Wirkung und der Charakter der Strophe auf das Gedicht.

## Epochenkontext
Literarhistorischer Hintergrund und repräsentative Epochen (z.B. Romantik).

## Muster der Strophe
Metrische und rhythmische Feinheiten (Hebungen, Zäsuren, Silbenzahl).

## Formale Besonderheiten
Rhetorische Konstruktionen oder strukturelle Besonderheiten.

## Aspekte zur Interpretation
Interpretatorische Anknüpfungspunkte, dialektische Strukturen und Spannungsfelder.

## Traditionslinien
Kulturhistorische Entwicklungslinien vom Barock bis zur Moderne.

## Interpretationshinweise
- Erster wichtiger Hinweis für Schüler.
- Zweiter wichtiger Hinweis für Schüler.

## Vergleichswerke
- **Autor Name**: *Gedichttitel* (Epoche (Jahr); Metrische Struktur; Didaktischer Kontext.)
```

### Schritt B: Im Gesamtverzeichnis (`index.json`) registrieren
Fügen Sie das entsprechende JSON-Objekt in `content/strophen/index.json` ein, damit die App es beim Start laden und filtern kann:

```json
  {
    "id": "meine_form",
    "name": "Meine Strophenform",
    "alternativnamen": [
      "Optionale Alternativbezeichnung"
    ],
    "kriterien": {
      "versanzahl": 4,
      "metrum": [
        "Jambus"
      ],
      "hebungen": "4",
      "reimschema": [
        "abab"
      ],
      "kadenz": "wechselnd"
    },
    "interpretation": {
      "wirkung": "Hier steht die didaktische Wirkung...",
      "epoche_kontext": "Literarhistorischer Hintergrund...",
      "muster": "Metrische und rhythmische Feinheiten...",
      "formales": "Rhetorische Konstruktionen...",
      "aspekte": "Interpretatorische Anknüpfungspunkte...",
      "traditionslinien": "Kulturhistorische Entwicklungslinien...",
      "interpretationshinweise": [
        "Erster wichtiger Hinweis für Schüler.",
        "Zweiter wichtiger Hinweis für Schüler."
      ]
    },
    "vergleichswerke": [
      {
        "autor": "Autor Name",
        "titel": "Gedichttitel",
        "hinweis": "Epoche (Jahr); Metrische Struktur; Didaktischer Kontext."
      }
    ],
    "wikipedia_link": "https://de.wikipedia.org/wiki/Beispiel"
  }
```

---

## 4. Nutzung des Standalone-Editors

Unter `PROGRAMME/Strophen-Navigator/Editor/` liegt ein mächtiger Excel-basierter Editor:

1. Öffnen Sie `strophen_editor.html` direkt im Browser (offline lauffähig).
2. **Schritt 1 – Dateien laden**:
   - Laden Sie die Excel-Tabelle `774396e9 (1).xlsx` (Datenbank).
   - Laden Sie das Roh-Template `index_roh.html` (Template).
3. **Schritt 2 – Datenübersicht**: Sie können alle importierten Formen, Vergleichswerke und Frank-Aspekte in Tabellen einsehen.
4. **Schritt 3 – Optionen**: Konfigurieren Sie Wikisource-Verlinkung und optionale Lizenztexte.
5. **Schritt 4 – Exportieren**:
   - **HTML exportieren**: Generiert eine komplett in sich geschlossene, statische `index.html` (inklusive aller Daten), die ohne Server direkt per Doppelklick geöffnet werden kann.
   - **SCORM exportieren**: Verpackt den Navigator als SCORM-Lernpaket (.zip) zur direkten Integration in Lernmanagementsysteme wie Moodle oder mebis.
