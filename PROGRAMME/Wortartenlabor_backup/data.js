/* ==========================================================
   WORTARTEN-LABOR – Daten
   Maschinen (Proben), Wortarten-Profile und Beispielwörter.
   CC-BY-SA 4.0 Sebastian Wolf
   ----------------------------------------------------------
   Schreibweise in den Ausgaben:
     ~text~   = misslungene / ungrammatische Form (durchgestrichen)
     \n       = Zeilenumbruch
     *wort*   = (nur im Satz) Hervorhebung des Wortes
   ========================================================== */
window.WAL_DATA = (function () {

  /* Reihenfolge = Reihenfolge der Profil-Bits unten! */
  const TESTS = [
    { id: 'flex',  name: 'Formwandler',      art: 'der', dat: 'beim',    sub: 'Flexions-Probe',
      q: 'Verändert das Wort seine Form?', color: '#ffd1e3',
      okLabel: 'FLEKTIERBAR', noLabel: 'NICHT FLEKTIERBAR',
      okMsg: 'Die Form ändert sich – das Wort ist <b>flektierbar</b>!',
      noMsg: 'Das Wort bleibt immer gleich – es ist <b>nicht flektierbar</b>.' },
    { id: 'konj',  name: 'Konjugator',       art: 'der', dat: 'beim',    sub: 'Konjugations-Probe',
      q: 'Lässt es sich nach Person und Zeit verändern?', color: '#fff3a6',
      okLabel: 'KONJUGIERBAR', noLabel: 'NICHT KONJUGIERBAR',
      okMsg: 'ich – du – er/sie/es … es lässt sich <b>konjugieren</b>!',
      noMsg: 'Keine Personalformen – <b>nicht konjugierbar</b>.' },
    { id: 'steig', name: 'Steigerer',        art: 'der', dat: 'beim',    sub: 'Komparations-Probe',
      q: 'Gibt es Komparativ und Superlativ?', color: '#c8f2c8',
      okLabel: 'STEIGERBAR', noLabel: 'NICHT STEIGERBAR',
      okMsg: 'Höher, schneller, weiter – das Wort ist <b>steigerbar</b>!',
      noMsg: 'Keine Steigerung möglich – <b>nicht komparierbar</b>.' },
    { id: 'art',   name: 'Artikel-Maschine', art: 'die', dat: 'bei der', sub: 'Artikel-Probe',
      q: 'Kann ein Artikel davorstehen?', color: '#cfe8ff',
      okLabel: 'ARTIKELFÄHIG', noLabel: 'KEIN ARTIKEL MÖGLICH',
      okMsg: 'Der, die, das – das Wort ist <b>artikelfähig</b>!',
      noMsg: 'Mit Artikel klingt es falsch – <b>nicht artikelfähig</b>.' },
    { id: 'sg',    name: 'Satzglied-Probe',  art: 'die', dat: 'bei der', sub: 'Vorfeld-Test',
      q: 'Kann es (mit Begleiter) allein vor dem Verb stehen?', color: '#e8d6ff',
      okLabel: 'KANN SATZGLIED SEIN', noLabel: 'KEIN SATZGLIED',
      okMsg: 'Es kann allein vor dem Verb stehen – also ein <b>Satzglied</b> sein!',
      noMsg: 'Allein vor dem Verb geht es nicht – <b>kein Satzglied</b>.' },
    { id: 'kasus', name: 'Kasus-Magnet',     art: 'der', dat: 'beim',    sub: 'Kasus-Probe',
      q: 'Zwingt es dem folgenden Wort einen Fall auf?', color: '#ffdcc2',
      okLabel: 'FORDERT EINEN KASUS', noLabel: 'KEINE KASUSFORDERUNG',
      okMsg: 'Zack – es zieht einen bestimmten <b>Fall</b> an sich!',
      noMsg: 'Der Magnet bleibt stumm – <b>keine Kasusforderung</b>.' },
    { id: 'fuege', name: 'Fügteil-Kleber',   art: 'der', dat: 'beim',    sub: 'Verbindungs-Probe',
      q: 'Verbindet es Wörter, Wortgruppen oder Sätze?', color: '#c9f5e6',
      okLabel: 'VERBINDET (FÜGTEIL)', noLabel: 'VERBINDET NICHTS',
      okMsg: 'Es klebt Teile zusammen – ein <b>Fügteil</b>!',
      noMsg: 'Der Kleber hält nicht – <b>kein Fügteil</b>.' },
    { id: 'solo',  name: 'Solo-Kapsel',      art: 'die', dat: 'bei der', sub: 'Isolations-Probe',
      q: 'Kann es ganz allein eine Äußerung sein?', color: '#ffd6d6',
      okLabel: 'STEHT ALLEIN (ISOLIERT)', noLabel: 'BRAUCHT EINEN SATZ',
      okMsg: 'Es funktioniert ganz allein – <b>syntaktisch isoliert</b>!',
      noMsg: 'Allein ergibt es keinen Sinn – es ist <b>in den Satz integriert</b>.' }
  ];

  /* Profil-Bits: flex konj steig art sg kasus fuege solo */
  const WORTARTEN = [
    { id: 'Verb',           ein: 'ein',  color: '#fff07a', profile: '11000000', group: 'basis',
      path: 'flektierbar → konjugierbar',
      info: 'Verben (Tätigkeits-/Zeitwörter) lassen sich konjugieren: Sie verändern sich nach Person, Zahl und Zeit.' },
    { id: 'Adjektiv',       ein: 'ein',  color: '#a6eea6', profile: '10101000', group: 'basis',
      path: 'flektierbar → komparierbar',
      info: 'Adjektive (Eigenschaftswörter) lassen sich steigern: Positiv, Komparativ, Superlativ.' },
    { id: 'Nomen',          ein: 'ein',  color: '#9fd8f7', profile: '10011000', group: 'basis',
      path: 'flektierbar → deklinierbar → artikelfähig',
      info: 'Nomen (Substantive) sind artikelfähig und werden großgeschrieben. Sie werden dekliniert.' },
    { id: 'Pronomen',       ein: 'ein',  color: '#9db7ff', profile: '10001000', group: 'basis',
      path: 'flektierbar → deklinierbar → kann Satzglied sein',
      info: 'Pronomen (Fürwörter) werden dekliniert und können allein ein Satzglied bilden – sie stehen für ein Nomen.' },
    { id: 'Artikel',        ein: 'ein',  color: '#8fe0d2', profile: '10000000', group: 'basis',
      path: 'flektierbar → deklinierbar → kann nicht Satzglied sein',
      info: 'Artikel (Begleiter) werden dekliniert, brauchen aber immer ein Nomen – allein sind sie kein Satzglied.' },
    { id: 'Adverb',         ein: 'ein',  color: '#f3b8f3', profile: '00001000', group: 'profi',
      path: 'nicht flektierbar → integriert → kann Satzglied oder Attribut sein',
      info: 'Adverbien (Umstandswörter) verändern sich nicht, können aber allein ein Satzglied sein: Heute regnet es.' },
    { id: 'Präposition',    ein: 'eine', color: '#ffc896', profile: '00000100', group: 'profi',
      path: 'nicht flektierbar → integriert → Kasusforderung',
      info: 'Präpositionen (Verhältniswörter) verlangen einen bestimmten Fall: mit + Dativ, für + Akkusativ …' },
    { id: 'Konjunktion',    ein: 'eine', color: '#c6f0a0', profile: '00000010', group: 'profi',
      path: 'nicht flektierbar → integriert → Fügteil',
      info: 'Konjunktionen (Bindewörter) verbinden Wörter, Wortgruppen oder Sätze: und, oder, weil, dass …' },
    { id: 'Partikel',       ein: 'eine', color: '#c5bfff', profile: '00000000', group: 'profi',
      path: 'nicht flektierbar → integriert → kein Satzglied, kein Fügteil, keine Kasusforderung',
      info: 'Partikeln verändern sich nicht, sind kein Satzglied, verbinden nichts und fordern keinen Fall: sehr, nur, mal …' },
    { id: 'Satzäquivalent', ein: 'ein',  color: '#ffa8bb', profile: '00000001', group: 'profi',
      path: 'nicht flektierbar → syntaktisch isoliert',
      info: 'Satzäquivalente (z. B. Interjektionen) stehen ganz allein und ersetzen einen ganzen Satz: Aha! Autsch!' }
  ];

  /* t = Ausgaben der Maschinen (nur dort nötig, wo eine Probe gelingt
     oder ein besonderer Hinweis sinnvoll ist – der Rest wird erzeugt). */
  const WORDS = [
    /* ---------- VERB ---------- */
    { w: 'lachen', wa: 'Verb', s: 'Wir *lachen* über den Witz.',
      t: { flex: 'lachen → lachte → gelacht', konj: 'ich lache · du lachst · sie lachte' } },
    { w: 'schwimmen', wa: 'Verb', s: 'Im Sommer *schwimmen* wir im See.',
      t: { flex: 'schwimmen → schwamm → geschwommen', konj: 'ich schwimme · du schwimmst · er schwamm' } },
    { w: 'schreiben', wa: 'Verb', s: 'Die Klasse will einen Brief *schreiben*.',
      t: { flex: 'schreiben → schrieb → geschrieben', konj: 'ich schreibe · du schreibst · sie schrieb' } },
    { w: 'gehen', wa: 'Verb', s: 'Morgen *gehen* wir ins Kino.',
      t: { flex: 'gehen → ging → gegangen', konj: 'ich gehe · du gehst · er ging' } },
    { w: 'lesen', wa: 'Verb', s: 'Mia möchte das Buch *lesen*.',
      t: { flex: 'lesen → las → gelesen', konj: 'ich lese · du liest · sie las' } },

    /* ---------- ADJEKTIV ---------- */
    { w: 'schön', wa: 'Adjektiv', s: 'Das ist ein *schönes* Lied.',
      t: { flex: 'schön → schöne → schönes → schönem', steig: 'schön → schöner → am schönsten',
           sg: 'Schön singt der Chor.\n(„schön" steht allein vor dem Verb.)' } },
    { w: 'schnell', wa: 'Adjektiv', s: 'Der *schnelle* Hund gewinnt.',
      t: { flex: 'schnell → schnelle → schnellen', steig: 'schnell → schneller → am schnellsten',
           sg: 'Schnell rennt der Hund weg.' } },
    { w: 'klein', wa: 'Adjektiv', s: 'Die *kleine* Maus piepst.',
      t: { flex: 'klein → kleine → kleinem → kleinen', steig: 'klein → kleiner → am kleinsten',
           sg: 'Klein ist die Maus.' } },
    { w: 'laut', wa: 'Adjektiv', s: 'Die Musik ist viel zu *laut*.',
      t: { flex: 'laut → laute → lautes', steig: 'laut → lauter → am lautesten',
           sg: 'Laut ruft Tim nach seinem Hund.' } },
    { w: 'mutig', wa: 'Adjektiv', s: 'Ida ist ein *mutiges* Mädchen.',
      t: { flex: 'mutig → mutige → mutiges', steig: 'mutig → mutiger → am mutigsten',
           sg: 'Mutig springt Ida ins Wasser.' } },

    /* ---------- NOMEN ---------- */
    { w: 'Haus', wa: 'Nomen', s: 'Das *Haus* hat ein rotes Dach.',
      t: { flex: 'das Haus → des Hauses → die Häuser', art: 'das Haus · ein Haus',
           sg: 'Das Haus steht am See.\n(mit Begleiter vor dem Verb)' } },
    { w: 'Hund', wa: 'Nomen', s: 'Unser *Hund* heißt Bello.',
      t: { flex: 'der Hund → des Hundes → die Hunde', art: 'der Hund · ein Hund',
           sg: 'Der Hund bellt laut.' } },
    { w: 'Freundschaft', wa: 'Nomen', s: 'Ihre *Freundschaft* ist stark.',
      t: { flex: 'die Freundschaft → die Freundschaften', art: 'die Freundschaft · eine Freundschaft',
           sg: 'Die Freundschaft hält ewig.' } },
    { w: 'Baum', wa: 'Nomen', s: 'Auf dem *Baum* sitzt ein Vogel.',
      t: { flex: 'der Baum → des Baumes → die Bäume', art: 'der Baum · ein Baum',
           sg: 'Der Baum wächst schnell.' } },
    { w: 'Schule', wa: 'Nomen', s: 'Die *Schule* beginnt um acht.',
      t: { flex: 'die Schule → die Schulen', art: 'die Schule · eine Schule',
           sg: 'Die Schule ist neu.' } },

    /* ---------- PRONOMEN ---------- */
    { w: 'ich', wa: 'Pronomen', s: '*Ich* spiele gern Fußball.',
      t: { flex: 'ich → meiner → mir → mich', sg: 'Ich spiele Fußball.\n(ganz allein vor dem Verb)' } },
    { w: 'du', wa: 'Pronomen', s: 'Kommst *du* heute mit?',
      t: { flex: 'du → deiner → dir → dich', sg: 'Du spielst Fußball.' } },
    { w: 'wir', wa: 'Pronomen', s: 'Morgen fahren *wir* ans Meer.',
      t: { flex: 'wir → unser → uns → uns', sg: 'Wir spielen Fußball.' } },
    { w: 'er', wa: 'Pronomen', s: 'Tim ist krank, deshalb bleibt *er* zu Hause.',
      t: { flex: 'er → seiner → ihm → ihn', sg: 'Er spielt Fußball.' } },
    { w: 'jemand', wa: 'Pronomen', s: 'Hat *jemand* meinen Schal gesehen?',
      t: { flex: 'jemand → jemandes → jemandem → jemanden', sg: 'Jemand spielt Fußball.' } },

    /* ---------- ARTIKEL ---------- */
    { w: 'der', wa: 'Artikel', s: '*Der* Hund bellt.',
      t: { flex: 'der → des → dem → den',
           sg: 'Der ___ spielt Fußball. → Da fehlt doch was!\n„der" braucht ein Nomen als Partner: Der Hund spielt …' },
      tipp: 'Vorsicht, Doppelrolle: In „Der da war es!" steht „der" allein – dann ist es ein Pronomen. Entscheidend ist immer der Satz.' },
    { w: 'die', wa: 'Artikel', s: '*Die* Katze schläft auf dem Sofa.',
      t: { flex: 'die → der → der → die',
           sg: 'Die ___ schläft. → Da fehlt doch was!\n„die" braucht ein Nomen als Partner: Die Katze schläft.' },
      tipp: 'Vorsicht, Doppelrolle: In „Die kenne ich!" steht „die" allein – dann ist es ein Pronomen.' },
    { w: 'das', wa: 'Artikel', s: 'Wo ist *das* Buch?',
      t: { flex: 'das → des → dem → das',
           sg: 'Das ___ liegt dort. → Da fehlt doch was!\n„das" braucht ein Nomen als Partner: Das Buch liegt dort.' },
      tipp: 'Vorsicht, Doppelrolle: In „Das stimmt!" steht „das" allein – dann ist es ein Pronomen.' },
    { w: 'ein', wa: 'Artikel', s: 'Ich sehe *einen* Vogel.',
      t: { flex: 'ein → eines → einem → einen',
           sg: 'Ein ___ fliegt vorbei. → Da fehlt doch was!\n„ein" braucht ein Nomen: Ein Vogel fliegt vorbei.' } },
    { w: 'kein', wa: 'Artikel', s: 'Ich habe *keinen* Hunger.',
      t: { flex: 'kein → keines → keinem → keinen',
           sg: 'Kein ___ ist da. → Da fehlt doch was!\n„kein" braucht ein Nomen: Kein Mensch ist da.' } },

    /* ---------- ADVERB ---------- */
    { w: 'heute', wa: 'Adverb', s: '*Heute* ist Montag.',
      t: { sg: 'Heute spielt Tim Fußball.\nAuch als Attribut: das Spiel heute' } },
    { w: 'dort', wa: 'Adverb', s: 'Das Haus *dort* ist uralt.',
      t: { sg: 'Dort spielt Tim Fußball.\nAuch als Attribut: das Haus dort' } },
    { w: 'oft', wa: 'Adverb', s: 'Wir gehen *oft* schwimmen.',
      t: { sg: 'Oft spielt Tim Fußball.' } },
    { w: 'gestern', wa: 'Adverb', s: '*Gestern* hat es geregnet.',
      t: { sg: 'Gestern spielte Tim Fußball.\nAuch als Attribut: das Spiel gestern' } },
    { w: 'hier', wa: 'Adverb', s: 'Bleib bitte *hier*!',
      t: { sg: 'Hier spielt Tim Fußball.\nAuch als Attribut: der Platz hier' } },

    /* ---------- PRÄPOSITION ---------- */
    { w: 'zu', wa: 'Präposition', s: 'Ich gehe *zu* meiner Oma.',
      t: { kasus: 'zu + DATIV: zu dem Haus (zum Haus)\n~*zu das Haus~' } },
    { w: 'mit', wa: 'Präposition', s: 'Ida spielt *mit* ihrem Bruder.',
      t: { kasus: 'mit + DATIV: mit dem Ball\n~*mit den Ball~' } },
    { w: 'für', wa: 'Präposition', s: 'Das Geschenk ist *für* dich.',
      t: { kasus: 'für + AKKUSATIV: für den Freund\n~*für dem Freund~' } },
    { w: 'wegen', wa: 'Präposition', s: '*Wegen* des Regens fällt das Spiel aus.',
      t: { kasus: 'wegen + GENITIV: wegen des Regens' } },
    { w: 'aus', wa: 'Präposition', s: 'Sie kommt gerade *aus* der Schule.',
      t: { kasus: 'aus + DATIV: aus dem Haus\n~*aus das Haus~' } },

    /* ---------- KONJUNKTION ---------- */
    { w: 'und', wa: 'Konjunktion', s: 'Tim *und* Ida spielen Fußball.',
      t: { fuege: 'Tim + und + Ida → Tim und Ida spielen.\n(verbindet Wörter)' } },
    { w: 'oder', wa: 'Konjunktion', s: 'Möchtest du Tee *oder* Kakao?',
      t: { fuege: 'Tee + oder + Kakao → Tee oder Kakao?\n(verbindet Wörter)' } },
    { w: 'aber', wa: 'Konjunktion', s: 'Es regnet, *aber* wir gehen raus.',
      t: { fuege: 'Tim spielt, aber Ida liest.\n(verbindet Sätze)' } },
    { w: 'weil', wa: 'Konjunktion', s: 'Ich bleibe drinnen, *weil* es regnet.',
      t: { fuege: 'Tim lacht, weil Ida einen Witz erzählt.\n(verbindet Haupt- und Nebensatz)' } },
    { w: 'dass', wa: 'Konjunktion', s: 'Ich hoffe, *dass* du kommst.',
      t: { fuege: 'Ich weiß, dass Ida gewinnt.\n(verbindet Haupt- und Nebensatz)' } },

    /* ---------- PARTIKEL ---------- */
    { w: 'sehr', wa: 'Partikel', s: 'Der Tee ist *sehr* heiß.',
      t: { sg: '~*Sehr ist der Tee heiß.~\n„sehr" klebt am Adjektiv: sehr heiß.' } },
    { w: 'nur', wa: 'Partikel', s: 'Tim hat *nur* zwei Euro.',
      t: { sg: '~*Nur hat Tim zwei Euro.~\nAllein kann „nur" nicht vor dem Verb stehen.' } },
    { w: 'etwa', wa: 'Partikel', s: 'Bist du *etwa* krank?',
      t: { sg: '~*Etwa bist du krank?~\nAllein vor dem Verb geht es nicht.' } },
    { w: 'mal', wa: 'Partikel', s: 'Komm *mal* her!',
      t: { sg: '~*Mal komm her!~\n„mal" bleibt im Satz – es tönt nur ab.' } },
    { w: 'also', wa: 'Partikel', s: 'Das ist *also* dein Zimmer!',
      t: { sg: '~*Also ist das dein Zimmer!~\nDie Bedeutung kippt: Aus Staunen wird eine Schlussfolgerung.\nAls Partikel bleibt „also" an seinem Platz.' },
      tipp: 'Achtung: Am Satzanfang („Also, gehen wir!") kann „also" auch anders gebraucht werden. Hier tönt es nur ab.' },

    /* ---------- SATZÄQUIVALENT ---------- */
    { w: 'Aha!', wa: 'Satzäquivalent', s: '*Aha!* Jetzt verstehe ich es.',
      t: { solo: '„Aha!" – Alles klar! Eine vollständige Äußerung ganz ohne Satz.' } },
    { w: 'Hallo!', wa: 'Satzäquivalent', s: '*Hallo!* Schön, dich zu sehen.',
      t: { solo: '„Hallo!" – funktioniert ganz allein als Gruß.' } },
    { w: 'Autsch!', wa: 'Satzäquivalent', s: '*Autsch!* Das tat weh.',
      t: { solo: '„Autsch!" – ersetzt einen ganzen Satz („Das tut weh!").' } },
    { w: 'Tschüss!', wa: 'Satzäquivalent', s: '*Tschüss!* Bis morgen.',
      t: { solo: '„Tschüss!" – steht allein als Abschiedsgruß.' } },
    { w: 'Juhu!', wa: 'Satzäquivalent', s: '*Juhu!* Wir haben gewonnen.',
      t: { solo: '„Juhu!" – ein Freudenschrei, ganz ohne Satz.' } }
  ];

  return { TESTS, WORTARTEN, WORDS };
})();
