/**
 * WissOS 2.0 – BIOS Boot Sequence
 * Simulates a beautiful high-contrast retro system startup sequence with comical didactical statements.
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function () {
  'use strict';

  var _config, _bus, _storage;
  var _skipRequested = false;

  var module = {
    run: function (config, bus, storage) {
      _config = config;
      _bus = bus;
      _storage = storage;

      var ee = config.easterEggs || {};
      var bootConfig = ee.boot || {};
      if (bootConfig.enabled === false) return Promise.resolve();

      var settings = config.settings || {};
      if (!settings.bootOnFirstVisit) return Promise.resolve();
      if (storage.get('hasBooted', false)) return Promise.resolve();

      return startBoot();
    }
  };

  function startBoot() {
    return new Promise(function (resolve) {
      var screen = document.getElementById('boot-screen');
      var output = screen.querySelector('.boot-output');
      var fill = screen.querySelector('.boot-progress-fill');
      var skipBtn = screen.querySelector('.boot-skip');

      screen.removeAttribute('hidden');
      _skipRequested = false;

      function skipBoot() {
        _skipRequested = true;
      }
      skipBtn.addEventListener('click', skipBoot);

      function onKeySkip(e) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          _skipRequested = true;
        }
      }
      document.addEventListener('keydown', onKeySkip);

      var allMessages = ((_config.bootMessages || []).length > 0)
        ? _config.bootMessages
        : ['System wird gestartet …'];
      
      var messages = shuffleAndPick(allMessages, Math.min(allMessages.length, 8));

      messages.push('');
      messages.push(_config.os.name + ' v' + _config.os.version + ' ist einsatzbereit.');

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
          }, 800);
          return;
        }

        var msg = messages[idx];
        appendLine(output, msg);

        var progress = Math.round(((idx + 1) / totalSteps) * 100);
        if (fill) fill.style.width = progress + '%';

        idx++;

        var delay = 150 + Math.random() * 300;
        setTimeout(nextLine, delay);
      }

      function cleanup() {
        document.removeEventListener('keydown', onKeySkip);
        skipBtn.removeEventListener('click', skipBoot);
      }

      setTimeout(nextLine, 400);
    });
  }

  function appendLine(output, text) {
    var line = document.createElement('div');
    line.className = 'boot-line';

    if (text === '') {
      line.innerHTML = '&nbsp;';
    } else {
      var prefix = (Math.random() > 0.4) ? '[  OK  ] ' : '[ LOAD ] ';
      line.textContent = prefix + text;
    }

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function finishBoot(screen, resolve) {
    screen.classList.add('fade-out');
    _storage.set('hasBooted', true);

    // Play retro beep on successful boot loading
    setTimeout(() => {
      WissOS.sound.play('startup');
    }, 100);

    setTimeout(function () {
      screen.setAttribute('hidden', '');
      screen.classList.remove('fade-out');
      _bus.emit('boot:complete');
      resolve();
    }, 500);
  }

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
