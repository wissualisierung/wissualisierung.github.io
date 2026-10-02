/**
 * WissualisierungOS – Easter Eggs
 * Enthält: Bluescreen of Deutsch, Bücherwurm (Inaktivitäts-Tipp)
 * Alle Features sind optional und über config.easterEggs steuerbar.
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function () {
  'use strict';

  var _config, _bus, _storage;
  var _idleTimer = null;
  var _bookwormEl = null;

  var module = {
    init: function (config, bus, storage) {
      _config = config;
      _bus = bus;
      _storage = storage;

      // Easter-Egg-Konfiguration mit Defaults zusammenführen
      var ee = config.easterEggs || {};

      // Bluescreen nur wenn aktiviert (Default: true)
      var bsConfig = ee.bluescreen || {};
      if (bsConfig.enabled !== false) {
        initBluescreen(bsConfig);
      }

      // Bücherwurm nur wenn aktiviert (Default: true)
      var bwConfig = ee.bookworm || {};
      if (bwConfig.enabled !== false) {
        initBookworm(bwConfig);
      }
    }
  };

  // ====================================================================
  //  BLUESCREEN OF DEUTSCH
  //  Auslöser: Strg+Alt+D, oder optionaler Zufall
  // ====================================================================

  function initBluescreen(bsConfig) {
    // Tastenkombination Strg+Alt+D
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        showBluescreen();
      }
    });

    // Zufälliger Auslöser (konfigurierbare Wahrscheinlichkeit, Default: 0.005)
    var probability = (bsConfig.probability != null) ? bsConfig.probability : 0.005;
    if (probability > 0 && Math.random() < probability) {
      setTimeout(function () {
        showBluescreen();
      }, 15000 + Math.random() * 30000); // Nach 15–45 Sekunden
    }
  }

  function showBluescreen() {
    var bs = _config.bluescreen || {};

    // Overlay erstellen
    var overlay = document.createElement('div');
    overlay.id = 'bluescreen-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;background:#0000AA;z-index:99999;' +
      'display:flex;align-items:center;justify-content:center;' +
      'cursor:pointer;padding:40px;';

    var content = document.createElement('div');
    content.style.cssText =
      'max-width:640px;width:100%;font-family:VT323,monospace;color:#fff;';

    // Titel mit invertiertem Hintergrund (wie echter BSOD)
    var title = document.createElement('div');
    title.style.cssText =
      'background:#A0A0A0;color:#0000AA;display:inline-block;' +
      'padding:2px 12px;font-size:22px;margin-bottom:24px;';
    title.textContent = bs.title || 'WissualisierungOS – Systemfehler';

    // Fehlercode
    var code = document.createElement('div');
    code.style.cssText = 'font-size:16px;margin-bottom:20px;color:#FFE66D;';
    code.textContent = bs.errorCode || 'FATAL_ERROR 0x00DE';

    // Nachricht
    var msg = document.createElement('pre');
    msg.style.cssText =
      'font-family:VT323,monospace;font-size:16px;white-space:pre-wrap;' +
      'word-break:break-word;line-height:1.8;margin-bottom:32px;';
    msg.textContent = bs.message || 'Ein unbekannter Fehler ist aufgetreten.';

    // Hinweis (blinkt)
    var hint = document.createElement('div');
    hint.style.cssText =
      'font-size:18px;animation:bsodBlink 1s step-end infinite;';
    hint.textContent = 'Drücken Sie eine beliebige Taste, um fortzufahren …';

    content.appendChild(title);
    content.appendChild(code);
    content.appendChild(msg);
    content.appendChild(hint);
    overlay.appendChild(content);

    // Blink-Animation einspritzen (wenn noch nicht vorhanden)
    if (!document.getElementById('bsod-style')) {
      var style = document.createElement('style');
      style.id = 'bsod-style';
      style.textContent = '@keyframes bsodBlink { 50% { opacity: 0; } }';
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);

    // Beenden per Klick oder Taste
    function dismiss() {
      overlay.remove();
      document.removeEventListener('keydown', dismiss);
    }
    overlay.addEventListener('click', dismiss);
    document.addEventListener('keydown', dismiss);
  }

  // ====================================================================
  //  BÜCHERWURM (Inaktivitäts-Tipp)
  //  Erscheint nach konfigurierbarer Idle-Zeit unten rechts,
  //  zeigt einen zufälligen Tipp oder konfigurierten Text.
  //  Verschwindet bei Interaktion.
  // ====================================================================

  function initBookworm(bwConfig) {
    // Idle-Zeit: Priorität: easterEggs.bookworm.idleSeconds > settings.bookwormIdleSeconds > 60
    var idleSeconds = bwConfig.idleSeconds || (_config.settings || {}).bookwormIdleSeconds || 60;
    if (idleSeconds <= 0) return;

    var idleMs = idleSeconds * 1000;

    function resetIdle() {
      clearTimeout(_idleTimer);
      hideBookworm();
      _idleTimer = setTimeout(function () { showBookworm(bwConfig); }, idleMs);
    }

    // Interaktions-Events, die den Timer zurücksetzen
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(function (evt) {
      document.addEventListener(evt, resetIdle, { passive: true });
    });

    // Initialen Timer starten
    resetIdle();
  }

  function showBookworm(bwConfig) {
    if (_bookwormEl) return;

    // Text bestimmen: bwConfig.text hat Priorität, dann zufälliger Tipp
    var tip;
    if (bwConfig && bwConfig.text) {
      tip = bwConfig.text;
    } else {
      var tips = _config.tips || [];
      tip = tips[Math.floor(Math.random() * tips.length)] || 'Bücherwürmer wissen alles.';
    }

    _bookwormEl = document.createElement('div');
    _bookwormEl.id = 'bookworm';
    _bookwormEl.style.cssText =
      'position:fixed;bottom:52px;right:16px;z-index:8000;' +
      'display:flex;align-items:flex-end;gap:0;' +
      'animation:bookwormIn 0.4s ease-out;pointer-events:none;';

    // Bücherwurm-Emoji (links neben Sprechblase)
    var worm = document.createElement('div');
    worm.style.cssText =
      'font-size:36px;line-height:1;animation:bookwormBounce 1.5s ease-in-out infinite;' +
      'margin-right:-4px;z-index:1;';
    worm.textContent = '🐛';

    // Sprechblase (rechts vom Wurm)
    var bubble = document.createElement('div');
    bubble.style.cssText =
      'background:#FFE66D;border:3px solid #1A1A1A;padding:10px 14px;' +
      'font-family:VT323,monospace;font-size:14px;color:#1A1A1A;' +
      'max-width:260px;line-height:1.5;box-shadow:4px 4px 0 #000;' +
      'position:relative;margin-bottom:8px;';
    bubble.textContent = tip;

    // Pfeil zeigt nach links (zum Wurm)
    var arrow = document.createElement('div');
    arrow.style.cssText =
      'position:absolute;left:-10px;bottom:12px;' +
      'width:0;height:0;' +
      'border-top:8px solid transparent;border-bottom:8px solid transparent;' +
      'border-right:10px solid #1A1A1A;';
    bubble.appendChild(arrow);
    var arrowInner = document.createElement('div');
    arrowInner.style.cssText =
      'position:absolute;left:-7px;bottom:14px;' +
      'width:0;height:0;' +
      'border-top:6px solid transparent;border-bottom:6px solid transparent;' +
      'border-right:8px solid #FFE66D;';
    bubble.appendChild(arrowInner);

    // Wurm zuerst, dann Sprechblase
    _bookwormEl.appendChild(worm);
    _bookwormEl.appendChild(bubble);

    // Animations-Styles einspritzen
    if (!document.getElementById('bookworm-style')) {
      var style = document.createElement('style');
      style.id = 'bookworm-style';
      style.textContent =
        '@keyframes bookwormIn { from { transform:translateY(20px);opacity:0; } to { transform:translateY(0);opacity:1; } }' +
        '@keyframes bookwormBounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }';
      document.head.appendChild(style);
    }

    document.body.appendChild(_bookwormEl);
  }

  function hideBookworm() {
    if (_bookwormEl) {
      _bookwormEl.remove();
      _bookwormEl = null;
    }
  }

  WissOS.EasterEggs = module;
})();
