// Auto-generated config loader for file:// compatibility
// This file is loaded BEFORE os-core.js to provide config data without fetch()
window.WissOS = window.WissOS || {};
window.WissOS._configData = {
  "os": {
    "name": "WissualisierungOS",
    "version": "1.0",
    "license": "CC-BY-SA 4.0 Wolf Sebastian (2026)",
    "tagline": "Betriebssystem des Wissens"
  },
  "programs": [
    {
      "id": "bds-kompakt",
      "name": "Autoren-Bibliothek",
      "osName": "LitDM Social Media",
      "description": "BDS-Kompakt interaktiv erkunden",
      "icon": "speech-bubble",
      "category": "Kommunikation",
      "url": "PROGRAMME/Autoren-Bibliothek/BDS_Kompakt.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 0 }
    },
    {
      "id": "epochen-chat",
      "name": "Epochen-Chat",
      "osName": "Mail@Autor",
      "description": "Literarische Epochen im Dialog",
      "icon": "mail",
      "category": "Kommunikation",
      "url": "PROGRAMME/Epochen-Chat/index.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 0 }
    },
    {
      "id": "lyrik-annotation",
      "name": "Lyrik-Annotation",
      "osName": "Lyrik-Annotator",
      "description": "Gedichte annotieren und analysieren",
      "icon": "typewriter",
      "category": "Werkzeuge",
      "url": "PROGRAMME/Lyrik-Annotator/lyrik-editor-v2.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 1 }
    },
    {
      "id": "lapbook-architekt",
      "name": "Lapbook-Architekt",
      "osName": "Lapbook-Designer",
      "description": "Interaktive Lapbooks gestalten",
      "icon": "paintbrush",
      "category": "Kreativ",
      "url": "PROGRAMME/Lapbook_Architekt/lapbook-architekt.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 1 }
    },
    {
      "id": "maerchen-explorer",
      "name": "Märchen-Explorer",
      "osName": "Märchenwerkstatt",
      "description": "Märchenwelten visuell erkunden",
      "icon": "magnifier",
      "category": "Kreativ",
      "url": "PROGRAMME/Märchen-Explorer/Märchenwerkstatt/romantikwerkstatt_maerchenwald_wolf.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 2, "row": 1 }
    },
    {
      "id": "stilmittel-navigator",
      "name": "Stilmittel-Navigator",
      "osName": "Lexikon der Stilmittel",
      "description": "Rhetorische Figuren interaktiv nachschlagen",
      "icon": "book",
      "category": "Werkzeuge",
      "url": "PROGRAMME/Stilmittel-Navigator/stilmittel-final.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 2 }
    },
    {
      "id": "strophen-navigator",
      "name": "Strophen-Navigator",
      "osName": "Lexikon der Strophenformen",
      "description": "Gedichtstrukturen erkunden",
      "icon": "book",
      "category": "Werkzeuge",
      "url": "PROGRAMME/Strophen-Navigator/Beispielausgabe/index.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 2 }
    },
    {
      "id": "brettspiel-editor",
      "name": "Brettspiel-Editor",
      "osName": "Spiele",
      "description": "Eigene Lernspiele entwerfen",
      "icon": "joystick",
      "category": "Spiele",
      "url": "PROGRAMME/Brettspiel-Editor/editor_v3.html",
      "openInWindow": true,
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 3 }
    },
    {
      "id": "paed-navigator",
      "name": "Pädagogischer Navigator",
      "osName": "Pädagogische Hilfe",
      "description": "Hattie-Studie interaktiv nutzen",
      "icon": "help",
      "category": "System",
      "url": "PROGRAMME/Pädagogischer Navigator/paed-navigator.html",
      "openInWindow": true,
      "showOnDesktop": false,
      "action": "paed-helper"
    },
    {
      "id": "bewertungsschluessel",
      "name": "Bewertungsschlüssel",
      "osName": "BE-Taschenrechner",
      "description": "Notenschlüssel-Generator für Klausuren",
      "icon": "calculator",
      "category": "Werkzeuge",
      "url": "PROGRAMME/Bewertungsschlüssel/bewertungsschluessel-generator-v7.html",
      "openInWindow": true,
      "showOnDesktop": false
    },
    {
      "id": "editor-folder",
      "name": "WissOS",
      "osName": "WissOS",
      "description": "Konfigurationsdateien des Systems",
      "icon": "folder",
      "category": "System",
      "url": "#editor-folder",
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 1, "align": "right" }
    },
    {
      "id": "strophen-editor-folder",
      "name": "Strophen-Editor",
      "osName": "Strophen-Editor",
      "description": "Editor-Dateien des Strophen-Navigators",
      "icon": "folder",
      "category": "System",
      "url": "#strophen-editor-folder",
      "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 2, "align": "right" }
    },
    {
      "id": "fullscreen-toggle",
      "name": "Vollbild-OS",
      "osName": "Vollbild-OS",
      "description": "Vollbildmodus aktivieren/deaktivieren",
      "icon": "fullscreen",
      "category": "Werkzeuge",
      "url": "#fullscreen",
      "showOnDesktop": false
    }



  ],
  "systemPrograms": [
    {
      "id": "trash", "name": "Papierkorb",
      "description": "Gelöschte Dateien … und Witze",
      "icon": "trash", "showOnDesktop": true,
      "desktopPosition": { "col": 0, "row": 0, "align": "right" },
      "action": "trash"
    },
    {
      "id": "terminal", "name": "Terminal",
      "description": "Befehlszeile für Kenner",
      "icon": "terminal", "showOnDesktop": true,
      "desktopPosition": { "col": 1, "row": 0, "align": "right" },
      "action": "terminal"
    },
    {
      "id": "help", "name": "Hilfe",
      "description": "Didaktische Tipps und Hilfe",
      "icon": "help", "action": "help"
    },
    {
      "id": "screensaver", "name": "Screensaver",
      "description": "Bildschirmschoner starten",
      "icon": "gear", "action": "screensaver"
    }
  ],
  "menu": {
    "folders": [
      {
        "name": "Werkzeuge",
        "icon": "gear",
        "programIds": [
          "lyrik-annotation",
          "stilmittel-navigator",
          "strophen-navigator",
          "bewertungsschluessel",
          "fullscreen-toggle"
        ]
      },
      { "name": "Kommunikation", "icon": "speech-bubble", "programIds": ["bds-kompakt", "epochen-chat"] },
      { "name": "Kreativ", "icon": "paintbrush", "programIds": ["maerchen-explorer", "lapbook-architekt"] },
      { "name": "Spiele", "icon": "joystick", "programIds": ["brettspiel-editor"] }
    ],
    "systemEntries": [
      { "name": "Pädagogische Hilfe", "icon": "help", "action": "paed-helper" },
      { "name": "Screensaver", "icon": "gear", "action": "screensaver" },
      { "name": "Impressum", "icon": "help", "action": "about" },
      { "name": "Datenschutz", "icon": "cookie", "action": "datenschutz" }
    ]
  },
  "tips": [
    "Schüler lernen besser, wenn sie schlafen. Also nicht wecken.",
    "Gruppenarbeit funktioniert.",
    "Stille im Klassenzimmer hat mehrere Ursachen.",
    "Lernziele sollten messbar sein.",
    "Differenzierung erhöht den Aufwand. Die nötige Energie kann physikalisch durch Kaffee zugeführt werden.",
    "Frontalunterricht ist kein Straftatbestand.",
    "Feedback wirkt. Meistens. Manchmal. Bitte weitermachen.",
    "Eine gute Frage ersetzt fünf Antworten. Manchmal erzeugt sie auch elf weitere.",
    "Handyverbot funktioniert am besten in faradayschen Käfigen.",
    "Stundeneinstieg unter 3 Minuten ist möglich.",
    "Schüler merken, wenn man die Aufgabe selbst nicht gelöst hat.",
    "Höhere Denkprozesse brauchen mehr Prozessorzeit. Aufgaben nicht im Energiesparmodus ausführen.",
    "Vorwissen aktivieren reduziert Ladezeit des Arbeitsgedächtnisses signifikant.",
    "Wiederholung aktiviert das Speicherprotokoll. Ohne sie droht Datenverlust.",
    "Störungen entstehen in Übergangsphasen. Übergangs-Caching verbessert Systemstabilität.",
    "Routinen sind Arbeitsspeicher-Entlastung für Schüler und Lehrkraft.",
    "Klare Strukturen erhöhen die CPU-Geschwindigkeit der SuS.",
    "Metakognition ist das Betriebssystem hinter dem SuS-Betriebssystem.",
    "Lernziele transparent machen senkt die RAM-Last.",
    "Feedback läuft bidirektional. Einseitige Verbindung reduziert Effektstärke.",
    "Klassen mit positiver Fehlerkultur kompilieren schneller."
  ],
  "trashJokes": [
    "Geht ein Arzt zu einem Mann. Fragt der Mann: „Müsste es nicht umgekehrt sein?\"",
    "Lehrerin: „Was ist die Zukunftsform von ‚ich stehle'?\"\nHeinrich: „Ich komme ins Gefängnis!\"",
    "Geht ein Indianer zum Frisör, kommt wieder raus – ist sein Pony weg.",
    "Zwei Fische treffen sich. Sagt der eine: „Hai.\" Sagt der andere: „Wo??\"",
    "„Ganz schön stürmisch heute\", sagt die eine Kerze. Darauf die andere: „Davon kannst du ausgehen!\"",
    "„Ich habe es satt, immer nur hier rumzuhängen!\", sagte die Glühbirne – und brannte durch.",
    "„Das Schöne an der Autokorrektur: Mai spart Zeitung, macht keine Grammatik fohlen und bekommt die Orte richtig getreten.\"",
    "Geht ein Mann in die Bibliothek und fragt: „Haben Sie Bücher über Paranoia?\"\nBibliothekar flüstert: „Die sind hinter Ihnen.\""
  ],
  "terminal": {
    "prompt": "wissos>",
    "welcomeMessage": "WissualisierungOS Terminal v1.0\nGeben Sie 'hilfe' ein f\u00FCr verf\u00FCgbare Befehle.\n",
    "commands": {
      "hilfe": "Verf\u00FCgbare Befehle:\n  hilfe       \u2013 Diese Hilfe\n  version     \u2013 Systemversion\n  legacy      \u2013 \u00c4ltere Version aufrufen\n  kaffee      \u2013 Kaffeepause\n  wanderer    \u2013 Wanderer-Modus\n  klassik     \u2013 Weimarer Klassik\n  witz        \u2013 Ein kleiner Witz\n  tipp        \u2013 Didaktischer Tipp\n  theme       \u2013 Theme anzeigen/wechseln\n  hintergrund \u2013 Wallpaper \u00e4ndern\n  reset       \u2013 Alle Einstellungen zur\u00fccksetzen\n  clear       \u2013 Bildschirm leeren\n  credits     \u2013 Danksagung\n  exit        \u2013 Terminal schlie\u00dfen",
      "version": "WissualisierungOS v1.0\nCC-BY-SA 4.0 Wolf Sebastian (2026)",
      "kaffee": "Kaffeepause wird eingeleitet ...",
      "wanderer": "Wanderer-Modus wird aktiviert ...",
      "klassik": "Weimarer Klassik wird geladen ...",
      "credits": "WissualisierungOS\nKonzept & Umsetzung: Wolf Sebastian\nLizenz: CC-BY-SA 4.0 (2026)",
      "exit": "__EXIT__"
    }
  },
  "bootMessages": [
    "Klassenlistenpuffer wird aufgebaut \u2026",
    "Korrekturwarteschlange wird priorisiert \u2026",
    "Kommas werden nachgez\u00E4hlt \u2026",
    "Kaffeeintegration l\u00E4uft \u2026",
    "Notenbuch wird synchronisiert \u2026",
    "Vertretungsplan wird neu gerendert \u2026",
    "Stundenplan-Konflikt wird ignoriert \u2026",
    "Hausaufgaben-Compliance wird gemessen \u2026",
    "Geduld wird neu installiert \u2026",
    "Freizeit wird gesucht \u2026",
    "Ferien werden geladen \u2026",
    "Motivation wird importiert \u2026 Quelle nicht verf\u00FCgbar \u2026",
    "Kaffee wurde erkannt. Guten Morgen.",
    "Resilienz wird kompiliert \u2026",
    "Systemabsturz wurde verhindert. Diesmal \u2026",
    "Dieser Ladevorgang dauert weniger lange als eine Konferenz \u2026"
  ],
  "bluescreen": {
    "title": "WissualisierungOS \u2013 Systemfehler",
    "errorCode": "DEUTSCH_FATAL_ERROR 0x00DE",
    "message": "Ein schwerwiegender Rechtschreibfehler wurde im Arbeitsspeicher gefunden.\n\nDas Rechtschreibw\u00F6rterbuch muss neu gestartet werden.\n\nFehlerdetails:\n  - Nominalisierung wurde nicht erkannt\n  - Doppelkonsonanz wurde nicht aufgelöst\n  - Infinitivkonstruktion weist Syntaxfehler auf\n\nDr\u00FCcken Sie eine beliebige Taste, um fortzufahren \u2026"
  },
  "wallpapers": [
    { "id": "default", "name": "Lavendel-Raster", "file": "default.png" },
    { "id": "blueprint", "name": "Blaupause", "file": "blueprint.png" },
    { "id": "tafel", "name": "Kreidetafel", "file": "tafel.png" }
  ],
  "screensavers": [
    { "id": "kaffee", "name": "Kaffeepause", "type": "builtin", "description": "Pixel-Kaffeetasse mit Dampf-Animation" },
    { "id": "wanderer", "name": "Wanderer", "type": "iframe", "url": "PROGRAMME/Screensaver/wanderer_v6.html", "description": "Interaktive Wanderer-Animation" },
    { "id": "weimarer-klassik", "name": "Weimarer Klassik", "type": "iframe", "url": "PROGRAMME/Screensaver/weimarer_klassik.html", "description": "Animation zur Weimarer Klassik" }
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
      "enabled": true,
      "idleSeconds": 60,
      "text": ""
    }
  },
  "settings": {
    "soundEnabled": false,
    "theme": "retro-classic",
    "wallpaper": "default",
    "bootOnFirstVisit": true,
    "bookwormIdleSeconds": 60
  }
};
