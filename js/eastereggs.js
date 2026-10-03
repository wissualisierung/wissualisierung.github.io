/**
 * WissOS 2.0 – Easter Eggs Module
 * Integrated "Bluescreen of Deutsch"
 * (Der frühere „Bücherwurm“ ist jetzt der „Assistent“ in js/assistant.js.)
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function () {
  'use strict';

  var _config, _bus, _storage;

  var module = {
    init: function (config, bus, storage) {
      _config = config;
      _bus = bus;
      _storage = storage;

      var ee = config.easterEggs || {};

      var bsConfig = ee.bluescreen || {};
      if (bsConfig.enabled !== false) {
        initBluescreen(bsConfig);
      }
    }
  };

  // ===== Bluescreen of Deutsch (Strg+Alt+D) =====
  function initBluescreen(bsConfig) {
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        showBluescreen();
      }
    });

    // Listen for terminal-triggered bluescreen
    if (_bus) {
      _bus.on('easteregg:bluescreen', function () {
        showBluescreen();
      });
    }
  }

  function showBluescreen() {
    var bs = _config.bluescreen || {};

    WissOS.sound.play('error');

    var overlay = document.createElement('div');
    overlay.id = 'bluescreen-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;background:#0000AA;z-index:999999;' +
      'display:flex;align-items:center;justify-content:center;' +
      'cursor:pointer;padding:40px;';

    var content = document.createElement('div');
    content.style.cssText = 'max-width:640px;width:100%;font-family:var(--font-mono);color:#fff;';

    var title = document.createElement('div');
    title.style.cssText =
      'background:#FFAAAA;color:#0000AA;display:inline-block;' +
      'padding:4px 12px;font-size:20px;font-weight:900;margin-bottom:24px;border:3px solid #000;';
    title.textContent = bs.title || 'WissOS 2.0 – Systemfehler';

    var code = document.createElement('div');
    code.style.cssText = 'font-size:15px;margin-bottom:20px;color:#FFFF00;font-weight:bold;';
    code.textContent = bs.errorCode || 'FATAL_ERROR 0x00DE';

    var msg = document.createElement('pre');
    msg.style.cssText =
      'font-family:var(--font-mono);font-size:13px;white-space:pre-wrap;' +
      'word-break:break-word;line-height:1.8;margin-bottom:32px;color:#fff;font-weight:bold;';
    msg.textContent = bs.message || 'Ein unbekannter Fehler ist aufgetreten.';

    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:16px;animation:bsodBlink 1.2s step-end infinite;font-weight:900;color:#FFFF00;';
    hint.textContent = 'Drücken Sie eine beliebige Taste, um das Klassenzimmer neu zu booten …';

    content.appendChild(title);
    content.appendChild(code);
    content.appendChild(msg);
    content.appendChild(hint);
    overlay.appendChild(content);

    if (!document.getElementById('bsod-style')) {
      var style = document.createElement('style');
      style.id = 'bsod-style';
      style.textContent = '@keyframes bsodBlink { 50% { opacity: 0; } }';
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);

    function dismiss() {
      overlay.remove();
      document.removeEventListener('keydown', dismiss);
      location.reload();
    }
    overlay.addEventListener('click', dismiss);
    document.addEventListener('keydown', dismiss);
  }

  WissOS.EasterEggs = module;
})();
