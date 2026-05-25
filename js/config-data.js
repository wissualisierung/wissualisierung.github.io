// ==========================================================================
// WissOS 2.0 – Central System Configuration
// CC-BY-SA 4.0 Wolf Sebastian (2026)
// ==========================================================================

window.WissOS = window.WissOS || {};
window.WissOS._configData = {
  "os": {
    "name": "WissOS 2.0",
    "version": "2.0",
    "license": "CC-BY-SA 4.0 Wolf Sebastian (2026)",
    "tagline": "Neobrutalistisches Betriebssystem des Wissens"
  },
  "programs": [
    {
      "id": "bds-kompakt",
      "name": "Autoren-Bibliothek",
      "osName": "LitDM Social Media",
      "description": "Literarische Profile im neobrutalistischen Feed",
      "icon": "speech-bubble",
      "category": "Kommunikation",
      "url": "PROGRAMME/Messenger-Engine/index.html?mode=library",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 0 }
    },
    {
      "id": "epochen-chat",
      "name": "Epochen-Chat",
      "osName": "EpochenChat Editor",
      "description": "Interaktive literarische Chats erstellen und abspielen",
      "icon": "mail",
      "category": "Kommunikation",
      "url": "PROGRAMME/Epochen-Chat/index.html",
      "openInWindow": true,
      "width": 1200,
      "height": 740,
      "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 0 }
    },
    {
      "id": "stilmittel-navigator",
      "name": "Stilmittel-Navigator",
      "osName": "Lexikon der Stilmittel",
      "description": "Rhetorische Figuren interaktiv lernen",
      "icon": "book",
      "category": "Werkzeuge",
      "url": "PROGRAMME/Flashcard-Engine/index.html?deck=stilmittel",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 1 }
    },
    {
      "id": "strophen-navigator",
      "name": "Strophen-Navigator",
      "osName": "Lexikon der Strophenformen",
      "description": "Didaktische Strophenformen analysieren",
      "icon": "book",
      "category": "Werkzeuge",
      "url": "PROGRAMME/Flashcard-Engine/index.html?deck=strophen",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 1 }
    },
    {
      "id": "paed-navigator",
      "name": "Pädagogischer Navigator",
      "osName": "Hattie-Matrix",
      "description": "54 evidenzbasierte Einflussfaktoren auf den Lernerfolg",
      "icon": "help",
      "category": "System",
      "url": "PROGRAMME/Paed-Navigator/index.html",
      "openInWindow": true,
      "width": 1000,
      "height": 720,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 2, "align": "right" }
    },
    {
      "id": "lapbook-architekt",
      "name": "Lapbook-Architekt",
      "osName": "Lapbook-Designer",
      "description": "Interaktive Lapbooks gestalten",
      "icon": "paintbrush",
      "category": "Kreativ",
      "url": "PROGRAMME/Canvas-Engine/index.html?mode=lapbook",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 2 }
    },
    {
      "id": "maerchen-explorer",
      "name": "Märchen-Explorer",
      "osName": "Romantikwerkstatt",
      "description": "Romantische Märchenstrukturen, Lapbook & Lernkarten",
      "icon": "magnifier",
      "category": "Kreativ",
      "url": "PROGRAMME/Maerchen-Werkstatt/index.html",
      "openInWindow": true,
      "width": 1100,
      "height": 720,
      "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 2 }
    },
    {
      "id": "bewertungsschluessel",
      "name": "Bewertungsschlüssel",
      "osName": "Klausuren-Rechner",
      "description": "Punkte- und Notenschlüssel blitzschnell ermitteln",
      "icon": "calculator",
      "category": "Werkzeuge",
      "url": "PROGRAMME/Tools/bewertungsschluessel.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 1, "align": "right" }
    },
    {
      "id": "qr-generator",
      "name": "QR-Generator",
      "osName": "QR-Code Generator",
      "description": "QR-Codes blitzschnell generieren und herunterladen",
      "icon": "qr",
      "category": "Werkzeuge",
      "url": "PROGRAMME/Tools/qr-generator.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 1, "align": "right" }
    },
    {
      "id": "lyrik-annotator",
      "name": "Lyrik-Annotator",
      "osName": "Lyrik-Annotator",
      "description": "Gedichte interaktiv analysieren und annotieren",
      "icon": "notepad",
      "category": "Kreativ",
      "url": "PROGRAMME/Lyrik-Annotator/index.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 2, "row": 1 }
    },
    {
      "id": "editor-folder",
      "name": "System-Config",
      "osName": "WissOS Systemordner",
      "description": "Die Steuerungsdateien des Systems",
      "icon": "folder",
      "category": "System",
      "url": "#editor-folder",
      "showOnDesktop": false,
      "desktopPosition": { "col": 0, "row": 1, "align": "right" }
    },
    {
      "id": "fullscreen-toggle",
      "name": "Vollbildmodus",
      "osName": "Vollbild umschalten",
      "description": "Browser in Vollbild versetzen",
      "icon": "fullscreen",
      "category": "Werkzeuge",
      "url": "#fullscreen",
      "showOnDesktop": false
    },
    {
      "id": "blockkaskade",
      "name": "Blockkaskade",
      "osName": "Blockkaskade Retro",
      "description": "Klassisches neobrutalistisches Block-Fallspiel",
      "icon": "joystick",
      "category": "Spiele",
      "url": "PROGRAMME/Tools/blockkaskade.html",
      "openInWindow": true,
      "width": 800,
      "height": 600,
      "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 3 }
    },
    {
      "id": "spiele-generator",
      "name": "Spiele-Generator",
      "osName": "Brettspiel-Editor",
      "description": "Eigene Brettspiele erstellen und exportieren",
      "icon": "joystick",
      "category": "Spiele",
      "url": "PROGRAMME/Spiele-Generator/index.html",
      "openInWindow": true,
      "width": 1000,
      "height": 720,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 3 }
    }
  ],
  "systemPrograms": [
    {
      "id": "trash",
      "name": "Papierkorb",
      "description": "Didaktische Abfälle und feine Witze",
      "icon": "trash",
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 0, "align": "right" },
      "action": "trash"
    },
    {
      "id": "terminal",
      "name": "Terminal",
      "description": "Kommandozeile für Systemadministratoren",
      "icon": "terminal",
      "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 0, "align": "right" },
      "action": "terminal"
    },
    {
      "id": "help",
      "name": "WissOS-Hilfe",
      "description": "Didaktische Handreichungen und Systemtipps",
      "icon": "help",
      "action": "help"
    },
    {
      "id": "screensaver",
      "name": "Bildschirmschoner",
      "description": "Bildschirmschoner sofort starten",
      "icon": "gear",
      "action": "screensaver"
    }
  ],
  "menu": {
    "folders": [
      {
        "name": "Kommunikation",
        "icon": "speech-bubble",
        "programIds": ["bds-kompakt", "epochen-chat"]
      },
      {
        "name": "Werkzeuge",
        "icon": "gear",
        "programIds": ["stilmittel-navigator", "strophen-navigator", "bewertungsschluessel", "paed-navigator", "qr-generator", "fullscreen-toggle"]
      },
      {
        "name": "Kreativ",
        "icon": "paintbrush",
        "programIds": ["lapbook-architekt", "maerchen-explorer", "lyrik-annotator"]
      },
      {
        "name": "Spiele",
        "icon": "joystick",
        "programIds": ["blockkaskade", "spiele-generator"]
      }
    ],
    "systemEntries": [
      { "name": "Pädagogische Hattie-Hilfe", "icon": "help", "action": "paed-helper" },
      { "name": "Bildschirmschoner", "icon": "gear", "action": "screensaver" },
      { "name": "Impressum", "icon": "help", "action": "about" },
      { "name": "Datenschutz", "icon": "cookie", "action": "datenschutz" }
    ]
  },
  "tips": [
    "Vorwissen aktivieren verkürzt die Ladezeit des Schüler-Arbeitsgedächtnisses enorm.",
    "Klassen mit einer positiven Fehlerkultur kompilieren neue Erkenntnisse 5x schneller.",
    "Differenzierung erhöht die CPU-Last der Lehrkraft. Externe Zufuhr von Kaffee empfohlen.",
    "Transparente Lernziele reduzieren das Hintergrundrauschen im Unterrichts-RAM.",
    "Metakognition ist das Betriebssystem über dem didaktischen Fachwissen der Schüler.",
    "Regelmäßige Feedbackschleifen laufen bidirektional – Einwegverbindungen dämpfen die Effektstärke.",
    "Routinen im Klassenzimmer entlasten den Arbeitsspeicher aller beteiligten Akteure.",
    "Störungen entstehen oft in Phasenübergängen. Ein stabiler Übergangs-Cache verringert Systemabstürze."
  ],
  "trashJokes": [
    "Zwei Fische treffen sich im Teich. Sagt der eine: „Hai!“ – Sagt der andere: „Wo??!“",
    "Lehrerin: „Was ist die Zukunftsform von ‚ich stehle‘?“ – Schüler: „Ich wandere aus!“",
    "Geht ein Indianer zum Frisör, kommt wieder raus – ist sein Pony weg.",
    "„Ganz schön stürmisch heute“, meint die eine Kerze. Darauf die andere: „Ja, davon kannst du ausgehen!“",
    "Geht ein Mann in die Bibliothek: „Haben Sie Bücher über Paranoia?“ – Der Bibliothekar flüstert: „Ja, sie stehen direkt hinter Ihnen!“"
  ],
  "terminal": {
    "prompt": "wissos2.0>",
    "welcomeMessage": "★ WissOS 2.0 – Neobrutalist Command Line Interface ★\nGeben Sie 'hilfe' ein, um alle Steuerbefehle aufzulisten.\n",
    "commands": {
      "hilfe": "Verfügbare Befehle:\n  hilfe       – Zeigt dieses Hilfemenü\n  version     – Zeigt Systemname und Versionsnummer\n  tipp        – Zeigt einen didaktischen Systemtipp\n  witz        – Erzählt einen Papierkorb-Witz\n  theme       – Zeigt das aktuelle Theme oder wechselt es (z.B. 'theme pommes')\n  hintergrund – Zeigt das Hintergrundbild-Menü\n  clear       – Leert die Terminalanzeige\n  credits     – Zeigt Danksagungen und Lizenzen\n  exit        – Schließt dieses Terminalfenster",
      "version": "WissOS 2.0 – Das neobrutalistische Didaktik-OS\nKonzipiert und modernisiert von Wolf Sebastian (2026)\nLizenz: CC-BY-SA 4.0",
      "credits": "WissOS 2.0\nKonzept, UI Design & Modernisierung: Wolf Sebastian (2026)\nFrameworks: Neobrutalismus CSS-Tokens, marked.js (Offline)\nBDS-Kompakt und Didaktische Flashcards modernisiert.",
      "exit": "__EXIT__"
    }
  },
  "bootMessages": [
    "Neobrutalistische CSS-Grid-Systeme werden ausgerichtet \u2026",
    "Schnittstellen-Brücke wissos-sdk.js wird hochgefahren \u2026",
    "Markdown-Dateien werden indiziert \u2026",
    "Didaktische Hattie-Matrix wird kalibriert \u2026",
    "Kaffeemaschine wird angewählt \u2026 Verbindung hergestellt.",
    "Motivation wird aus dem Lehrerzimmer importiert \u2026",
    "Schülerakten werden geordnet \u2026",
    "Klassenarbeiten-Puffer wird initialisiert \u2026",
    "Geduldsprotokoll wird auf Version 2.0 aktualisiert \u2026",
    "Das System läuft stabil. Schönen Unterrichtstag!"
  ],
  "bluescreen": {
    "title": "WissOS 2.0 – Kritischer Systemausfall",
    "errorCode": "DIDAKTIK_FATAL_ERROR 0x00FF",
    "message": "Ein schwerwiegender didaktischer Konzeptionsfehler wurde entdeckt.\n\nDas System muss neu gestartet werden, um bleibende Schülerdesorientierung zu vermeiden.\n\nDetails:\n  - Stundeneinstieg dauerte länger als 15 Minuten (Buffer Overflow)\n  - Arbeitsaufträge wiesen ungenügende Operatoren-Syntax auf\n  - Sozialform blockierte den kognitiven Durchsatz\n\nDrücken Sie eine beliebige Taste, um das Klassenzimmer neu zu booten \u2026"
  },
  "wallpapers": [
    { "id": "default", "name": "Lavendel-Raster", "file": "default.png" },
    { "id": "blueprint", "name": "Blaupause", "file": "blueprint.png" },
    { "id": "tafel", "name": "Kreidetafel", "file": "tafel.png" }
  ],
  "screensavers": [
    { "id": "kaffee", "name": "Kaffeepause", "type": "builtin", "description": "Pixel-Kaffeetasse mit Dampf-Animation" },
    { "id": "wanderer", "name": "Wanderer über dem Nebelmeer", "type": "iframe", "url": "PROGRAMME/Screensaver/wanderer_v6.html", "description": "Interaktiver romantischer Bildschirmschoner" },
    { "id": "weimarer_klassik", "name": "Weimarer Klassik", "type": "iframe", "url": "PROGRAMME/Screensaver/weimarer_klassik.html", "description": "Literarischer Bildschirmschoner zur Weimarer Klassik" }
  ],
  "easterEggs": {
    "boot": {
      "enabled": true
    },
    "sound": {
      "enabled": true,
      "types": ["startup", "click", "error"]
    },
    "bluescreen": {
      "enabled": true,
      "probability": 0.005
    },
    "bookworm": {
      "enabled": false
    }
  },
  "settings": {
    "soundEnabled": false,
    "theme": "retro-classic",
    "wallpaper": "default",
    "bootOnFirstVisit": true
  }
};
