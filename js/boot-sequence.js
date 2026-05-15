/**
 * WissualisierungOS – Boot-Sequenz
 * Simuliert das „Hochfahren" des Betriebssystems mit scrollenden
 * Ladetexten aus der Config und einem Fortschrittsbalken.
 * Kann beim ersten Besuch automatisch gestartet oder übersprungen werden.
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function () {
  'use strict';

  var _config, _bus, _storage;
  var _skipRequested = false;

  var module = {
    /**
     * Startet die Boot-Sequenz, falls konfiguriert.
     * Wird von os-core.js VOR den anderen Modulen aufgerufen.
     * @returns {Promise} resolved wenn der Boot abgeschlossen / übersprungen wurde
     */
    run: function (config, bus, storage) {
      _config = config;
      _bus = bus;
      _storage = storage;

      // Prüfe ob Boot über easterEggs.boot deaktiviert wurde
      var ee = config.easterEggs || {};
      var bootConfig = ee.boot || {};
      if (bootConfig.enabled === false) return Promise.resolve();

      // Kein Boot wenn über Settings deaktiviert oder bereits gebootet
      var settings = config.settings || {};
      if (!settings.bootOnFirstVisit) return Promise.resolve();
      if (storage.get('hasBooted', false)) return Promise.resolve();

      return startBoot();
    }
  };

  /**
   * Boot-Sequenz ausführen:
   * 1. Boot-Screen einblenden
   * 2. Zufällige Nachrichten aus config.bootMessages anzeigen
   * 3. Fortschrittsbalken füllen
   * 4. Abschlussmeldung, dann Desktop freigeben
   */
  function startBoot() {
    return new Promise(function (resolve) {
      var screen = document.getElementById('boot-screen');
      var output = screen.querySelector('.boot-output');
      var fill = screen.querySelector('.boot-progress-fill');
      var skipBtn = screen.querySelector('.boot-skip');

      // Boot-Screen sichtbar machen
      screen.removeAttribute('hidden');
      _skipRequested = false;

      // Überspringen-Button
      function skipBoot() {
        _skipRequested = true;
      }
      skipBtn.addEventListener('click', skipBoot);

      // Auch beliebige Taste zum Überspringen
      function onKeySkip(e) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          _skipRequested = true;
        }
      }
      document.addEventListener('keydown', onKeySkip);

      // Boot-Nachrichten zusammenstellen (zufällige Auswahl)
      var allMessages = ((_config.bootMessages || []).length > 0)
        ? _config.bootMessages
        : ['System wird gestartet …'];
      var messages = shuffleAndPick(allMessages, Math.min(allMessages.length, 10));

      // Abschlussnachricht immer am Ende
      messages.push('');
      messages.push(_config.os.name + ' v' + _config.os.version + ' ist bereit.');

      var idx = 0;
      var totalSteps = messages.length;

      function nextLine() {
        if (_skipRequested) {
          cleanup();
          finishBoot(screen, resolve);
          return;
        }

        if (idx >= totalSteps) {
          setTimeout(function () {
            cleanup();
            finishBoot(screen, resolve);
          }, 1200);
          return;
        }

        var msg = messages[idx];
        appendLine(output, msg);

        // Fortschrittsbalken aktualisieren
        var progress = Math.round(((idx + 1) / totalSteps) * 100);
        fill.style.width = progress + '%';

        idx++;

        // Zufälliges Delay zwischen den Zeilen (200–600ms)
        var delay = 200 + Math.random() * 400;
        setTimeout(nextLine, delay);
      }

      function cleanup() {
        document.removeEventListener('keydown', onKeySkip);
        skipBtn.removeEventListener('click', skipBoot);
      }

      // Initiales Delay
      setTimeout(nextLine, 800);
    });
  }

  /**
   * Eine Textzeile an den Boot-Output anhängen
   */
  function appendLine(output, text) {
    var line = document.createElement('div');
    line.className = 'boot-line';

    if (text === '') {
      line.innerHTML = '&nbsp;';
    } else {
      var prefix = (Math.random() > 0.3) ? '[ OK ] ' : '[ .. ] ';
      line.textContent = prefix + text;
    }

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  /**
   * Boot-Sequenz beenden: Ausblenden, DOM aufräumen, Desktop freigeben
   */
  function finishBoot(screen, resolve) {
    screen.classList.add('fade-out');
    _storage.set('hasBooted', true);

    setTimeout(function () {
      screen.setAttribute('hidden', '');
      screen.classList.remove('fade-out');
      _bus.emit('boot:complete');
      resolve();
    }, 600);
  }

  /**
   * Zufällige Auswahl aus einem Array (Fisher-Yates Shuffle)
   */
  function shuffleAndPick(arr, count) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy.slice(0, count);
  }

  WissOS.BootSequence = module;
})();
