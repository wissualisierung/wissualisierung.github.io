# WissualisierungOS

> **WissualisierungOS – Das Betriebssystem des Wissens.**

WissualisierungOS ist eine interaktive, webbasierte Landingpage in Form einer Desktop-Umgebung im nostalgischen Retro-Stil. Es dient als zentraler Hub für verschiedene digitale Werkzeuge, Editoren und interaktive Projekte, die als Tools für Lehrkräfte und für den Unterricht entwickelt wurden. 

Das System läuft vollständig im Browser, ist **100 % offline-fähig** und arbeitet **DSGVO-konform**.

![WissualisierungOS Screenshot](https://img.shields.io/badge/Status-Aktiv-success) ![Lizenz](https://img.shields.io/badge/Lizenz-CC--BY--SA%204.0-blue)

---

## ✨ Features

- 🖥️ **Retro-Desktop-Erlebnis:** Fenster-Manager, Startmenü, Taskleiste und Desktop-Icons im klassischen 90er-Jahre-Look.
- 📂 **Zentraler Hub:** Bündelt zahlreiche didaktische Tools, Generatoren und interaktive Lernumgebungen an einem Ort.
- 🔒 **DSGVO-konform & Offline-Ready:** Keine externen Server-Abfragen, keine CDNs, keine Tracking-Cookies. Alles läuft lokal über das `file://`-Protokoll. Daten werden ausschließlich im lokalen Browser-Speicher (Local Storage) abgelegt.
- ⚙️ **Modular anpassbar:** Themes, Hintergrundbilder und Desktop-Verknüpfungen lassen sich zentral über Konfigurationsdateien anpassen.
- 🧑‍🏫 **Pädagogische Extras:** Terminal mit didaktischen Tipps, integrierter Stundenrechner, Bewertungsschlüssel-Generator und fachspezifische Bildschirmschoner (z. B. Weimarer Klassik).

## 🧰 Enthaltene Werkzeuge (Auswahl)

WissualisierungOS bringt out-of-the-box eine Vielzahl an Unterrichts-Tools mit:

### Für die Vorbereitung & Lehrkraft
* **Bewertungsschlüssel-Rechner:** Schnelle Notenschlüssel-Generierung (BE-Taschenrechner) für Klausuren.
* **Pädagogischer Navigator:** Die Hattie-Studie interaktiv nutzen.

### Für den Unterricht & die Schüler:innen
* **Lyrik-Annotator:** Gedichte digital annotieren und analysieren.
* **Stilmittel-Navigator:** Rhetorische Figuren interaktiv nachschlagen.
* **Strophen-Navigator:** Lexikon der Strophenformen zur Erkundung von Gedichtstrukturen.
* **Lapbook-Architekt:** Interaktive Lapbooks am Bildschirm gestalten.
* **Märchen-Explorer:** Märchenwelten und -motive visuell erkunden.
* **Brettspiel-Editor:** Eigene Lernspiele konzipieren und entwerfen.
* **Autoren-Bibliothek & Epochen-Chat:** Literaturgeschichte spielerisch im Social-Media- und Messenger-Format entdecken.

## 🚀 Installation & Nutzung

WissualisierungOS benötigt **keine Installation** und **keine serverseitige Infrastruktur**.

1. Das Repository als ZIP herunterladen oder klonen.
2. Den entpackten Ordner öffnen.
3. Die Datei `index.html` mit einem beliebigen modernen Webbrowser (Chrome, Firefox, Edge, Safari) öffnen.
4. *Optional:* Das System bootet automatisch in die Desktop-Umgebung und kann auf Vollbild (`F11`) gestellt werden.

## 🛠️ Konfiguration

Das System ist hochgradig anpassbar. Die zentrale Steuerung erfolgt über die `config.json` (bzw. als Offline-Fallback über `js/config-data.js`). Hier können Sie:
- Neue Programme und Web-Links (`URL`s) dem Startmenü oder Desktop hinzufügen.
- Das visuelle Erscheinungsbild steuern (Themes, Wallpaper).
- Terminal-Befehle, Witze und didaktische Tipps bearbeiten.
- Versteckte Easter Eggs an- oder abschalten.

## 💻 Das Terminal

Für echte "Power-User" bietet das OS ein Terminal (zu finden auf dem Desktop oder im Startmenü unter *System*).
Einige nützliche Befehle:
- `hilfe`: Listet alle verfügbaren Befehle auf.
- `legacy`: Öffnet die vorherige/ältere Version der Webseite in einem neuen Tab.
- `theme [name]`: Wechselt das visuelle Theme (z. B. `theme vaporwave`).
- `kaffee` / `wanderer` / `klassik`: Starten verschiedene Bildschirmschoner.
- `tipp`: Gibt einen didaktischen Ratschlag aus.
- `witz`: Für die kleine Pause im Lehrerzimmer.

## 📝 Datenschutz & Impressum

Das System verarbeitet keine personenbezogenen Daten. Konfigurationen (wie Fensterpositionen, gewähltes Theme) werden lediglich lokal im `localStorage` des jeweiligen Browsers hinterlegt. 
Ein integriertes Datenschutz-Dokument kann direkt über die Taskleiste (Cookie-Icon 🍪) aufgerufen werden.

## 👨‍💻 Autor & Lizenz

**Konzept & Umsetzung:** Sebastian Wolf (s.w.oer@outlook.de)

Dieses Projekt ist unter der **CC-BY-SA 4.0** lizenziert (Creative Commons Namensnennung - Weitergabe unter gleichen Bedingungen 4.0 International). Das bedeutet, Sie dürfen das Material in jedwedem Format oder Medium vervielfältigen und weiterverbreiten sowie remixen, verändern und darauf aufbauen, solange Sie den Urheber angemessen nennen und Ihre Bearbeitungen unter denselben Lizenzbedingungen weitergeben.

*(Ausgenommen davon sind gegebenenfalls spezifische Bilder oder Texte Dritter innerhalb der bereitgestellten Unterrichtsprogramme, deren Rechte bei den jeweiligen Urhebern liegen. Entsprechende Hinweise finden sich an den entsprechenden Stellen.)*
