# Puzzle & Quiz – Player (Version 3)

Die Klasse öffnet ein digitales Puzzle oder ein Quiz nur über einen **fünfstelligen Code**. Es gibt keine Übersicht und keine Fächer. Welche Datei zu welchem Code gehört, steht in einer kleinen Liste, die du von Hand pflegst.

## Ordner

```
index.html          ← der Player (Code-Eingabe)
generator.html      ← der Puzzle-Generator (für Lehrkräfte)
quiz-editor.html    ← der Quiz-Editor (für Lehrkräfte)
puzzles/
  liste.js          ← die Code-Liste (Puzzles und Quizze)
  …-GRIMM.html      ← exportierte Puzzles
  …-ZWERG.html      ← exportierte Quizze
```

Puzzles und Quizze liegen im selben Ordner `puzzles` und stehen in derselben Liste. Der Player erkennt selbst, was er öffnet. Der ganze Ordner kann auf GitHub Pages, auf einen eigenen Webspace oder in einen Unterordner einer bestehenden Webseite. Es gibt keinen Build-Schritt und keine Automatik.

## Ein Quiz erstellen

1. `quiz-editor.html` öffnen (im Browser, auch ohne Internet).
2. Fragen anlegen: **+ Frage** (bis zu vier Antworten) oder **+ Wahr/Falsch**. Mit dem Häkchen-Feld markierst du richtige Antworten; mehrere richtige sind erlaubt.
3. Viele Fragen auf einmal: **Liste einfügen** – eine Zeile pro Frage:
   ```
   Wie viele Zwerge leben bei Schneewittchen? | sieben | drei | fünf | zwölf
   Dornröschen schläft zehn Jahre lang. | falsch
   ```
   Die erste Antwort ist die richtige; sie landet zufällig auf einer der Kacheln. Tabulator (aus Excel kopiert) oder Semikolon gehen auch.
4. Pro Frage: Zeit (5 bis 90 Sekunden), Punkte (Standard, Doppelt, Ohne) und optional ein Bild.
5. Rechts: Titel, Einleitung, Titelbild (Pixel-Vorlage oder eigenes Bild), Musik und Spielarten.
6. **Ausprobieren** startet das Quiz so, wie es die Klasse sieht.
7. **Projekt sichern** speichert eine `.quiz.json`, mit der du später weiterarbeitest (**Projekt öffnen**).

### Spielarten

- **Allein spielen:** jede Schülerin, jeder Schüler am eigenen Gerät. Antworten per Tippen oder mit den Tasten 1–4. Am Ende gibt es die Punktzahl und eine Übersicht der Antworten.
- **Klassen-Duell:** 2 bis 4 Teams an einem Smartboard. Jedes Team hat unten eine eigene Antwortleiste und tippt seine Antwort dort an (mehrere Finger gleichzeitig gehen). Wenn alle Teams geantwortet haben oder die Zeit abläuft, wird aufgelöst. Zwischendurch zeigt eine Rangliste den Stand, am Ende steht das Siegerpodest.

Punkte: Wer schneller richtig antwortet, bekommt mehr (500 bis 1000 pro richtiger Antwort, bei „Doppelt“ das Doppelte). Mehrere richtige Antworten in Folge geben einen Bonus.

### Musik

Drei eigene Chiptune-Stücke sind eingebaut (Pixel-Pop, Abenteuer, Ruhig) – frei von Rechten Dritter, weil sie Teil des Editors sind. Dazu kommen kurze Effekte für Countdown, richtig, falsch und das Podest.

**Eigene MIDI:** Du kannst eine MIDI-Datei (.mid, höchstens 400 KB) wählen. Sie wird im Retro-Klang abgespielt und ins Quiz eingebettet. Nur Dateien verwenden, die du nutzen darfst (z. B. selbst erstellt oder gemeinfrei).

Im Klassen-Duell läuft die Musik, beim Allein-Spielen standardmäßig nur die Effekte (umstellbar mit „Musik auch beim Allein-Spielen“). Im Quiz schaltet der Lautsprecher-Knopf zwischen *Musik + Effekte*, *nur Effekte* und *stumm*.

## Veröffentlichen (Puzzle und Quiz gleich)

1. Code prüfen (wird vorgeschlagen; ein eigenes Wort mit 5 Zeichen wie `ZWERG` geht auch).
2. **„Quiz speichern“** bzw. **„Digitales Puzzle speichern“** – die Datei heißt z. B. `maerchen-quiz-ZWERG.html`.
3. Die Datei in den Ordner `puzzles` hochladen.
4. In `puzzles/liste.js` die Zeile einfügen, die unter **„Zeile für die Code-Liste“** steht (Knopf „Kopieren“):

```
ZWERG   maerchen-quiz-ZWERG.html   # Quiz: Märchen-Quiz
```

Auf GitHub: Datei `liste.js` anklicken → Stift-Symbol (Edit) → Zeile einfügen → **Commit changes**. Nach etwa einer Minute ist das Quiz unter seinem Code erreichbar.

**Entfernen:** Zeile in der Liste löschen (und die Datei, wenn sie nicht mehr gebraucht wird).
**Ändern:** Projektdatei öffnen, neu speichern und die alte Datei ersetzen. Code und Dateiname bleiben gleich – die Liste muss nicht angepasst werden.

## Kontrolle

Hinten an die Adresse des Players `#pruefen` anhängen, z. B. `https://NAME.github.io/REPO/#pruefen`. Die Prüfansicht zeigt alle Einträge mit **Art** (Puzzle oder Quiz) und Titel, ob die Dateien vorhanden sind und welche Zeilen Fehler haben (falscher Code, fehlender Dateiname, doppelter Code, Leerzeichen im Dateinamen).

## Direkter Link

`…/index.html#ZWERG` öffnet das Quiz sofort. Im geöffneten Quiz oder Puzzle gibt es dafür den Knopf „Link kopieren“ – praktisch für die Lernplattform oder einen QR-Code.

## Einstellungen

Oben in `index.html`:

```js
window.PLAYER_EINSTELLUNGEN = {
  titel: 'Puzzle & Quiz',
  untertitel: 'Gib den Code ein, den du von deiner Lehrkraft bekommen hast.',
  generatorLink: 'generator.html',     // leer lassen, um den Link auszublenden
  quizEditorLink: 'quiz-editor.html'   // leer lassen, um den Link auszublenden
};
```

## Von Version 2 umsteigen

`index.html` ersetzen und `quiz-editor.html` dazulegen. `liste.js` und alle Puzzles bleiben, wie sie sind. Wer in Version 2 eigene Einstellungen hatte, trägt sie in der neuen `index.html` wieder ein.

## Gut zu wissen

- **GitHub Pages:** Unter Settings → Pages als Quelle **„Deploy from a branch“** wählen.
- **Codes sind kein Passwort.** Die Liste ist eine öffentliche Datei der Webseite. Wer die Adresse von `puzzles/liste.js` kennt, sieht alle Codes. Kaufmaterial (z. B. von Eduki) gehört deshalb nicht hierher.
- **Am eigenen Rechner testen:** `index.html` doppelklicken – funktioniert ohne Server. Nur die Prüfung „Datei vorhanden?“ und die Anzeige der Art gehen lokal nicht.
- **Ton:** Browser spielen Klang erst nach dem ersten Antippen ab. Am Smartboard die Lautstärke vorher prüfen.
- **Datenschutz:** Player, Puzzles und Quizze laden nichts nach, setzen keine Cookies und speichern weder Namen noch Ergebnisse. Im Klassen-Duell gibt es nur Teamnamen (Füchse, Eulen …), keine Schülernamen. Der Webhoster (z. B. GitHub) verarbeitet technisch die IP-Adressen der Besucherinnen und Besucher.
