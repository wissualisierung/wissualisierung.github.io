/**
 * WissOS 2.0 – Easter Eggs Module
 * Integrated "Bluescreen of Deutsch" and the cute animated Tip Bookworm
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

      var ee = config.easterEggs || {};

      var bsConfig = ee.bluescreen || {};
      if (bsConfig.enabled !== false) {
        initBluescreen(bsConfig);
      }

      var bwConfig = ee.bookworm || {};
      if (bwConfig.enabled !== false) {
        initBookworm(bwConfig);
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

  // ===== Inactivity Tip Bookworm =====
  function initBookworm(bwConfig) {
    var idleSeconds = bwConfig.idleSeconds || 60;
    if (idleSeconds <= 0) return;

    var idleMs = idleSeconds * 1000;

    function resetIdle() {
      clearTimeout(_idleTimer);
      hideBookworm();
      _idleTimer = setTimeout(function () { showBookworm(bwConfig); }, idleMs);
    }

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(function (evt) {
      document.addEventListener(evt, resetIdle, { passive: true });
    });

    resetIdle();
  }

  function showBookworm(bwConfig) {
    if (_bookwormEl) return;

    var tip;
    if (bwConfig && bwConfig.text) {
      tip = bwConfig.text;
    } else {
      var tips = _config.tips || [];
      tip = tips[Math.floor(Math.random() * tips.length)] || 'Didaktische Ziele aktivieren.';
    }

    _bookwormEl = document.createElement('div');
    _bookwormEl.id = 'bookworm';
    _bookwormEl.style.cssText =
      'position:fixed;bottom:60px;right:20px;z-index:8000;' +
      'display:flex;align-items:flex-end;gap:0;' +
      'animation:bookwormIn 0.4s ease-out;pointer-events:none;';

    var worm = document.createElement('div');
    worm.style.cssText =
      'font-size:42px;line-height:1;animation:bookwormBounce 1.5s ease-in-out infinite;' +
      'margin-right:-2px;z-index:1;';
    worm.textContent = '🐛';

    var bubble = document.createElement('div');
    bubble.style.cssText =
      'background:var(--color-accent);border:4px solid #000;padding:12px 16px;' +
      'font-family:var(--font-mono);font-size:12px;color:#000;' +
      'max-width:240px;line-height:1.5;box-shadow:6px 6px 0 #000;' +
      'position:relative;margin-bottom:8px;font-weight:900;';
    bubble.textContent = tip;

    var arrow = document.createElement('div');
    arrow.style.cssText =
      'position:absolute;left:-12px;bottom:12px;' +
      'width:0;height:0;' +
      'border-top:8px solid transparent;border-bottom:8px solid transparent;' +
      'border-right:12px solid #000;';
    bubble.appendChild(arrow);
    
    var arrowInner = document.createElement('div');
    arrowInner.style.cssText =
      'position:absolute;left:-7px;bottom:14px;' +
      'width:0;height:0;' +
      'border-top:6px solid transparent;border-bottom:6px solid transparent;' +
      'border-right:10px solid var(--color-accent);';
    bubble.appendChild(arrowInner);

    _bookwormEl.appendChild(worm);
    _bookwormEl.appendChild(bubble);

    if (!document.getElementById('bookworm-style')) {
      var style = document.createElement('style');
      style.id = 'bookworm-style';
      style.textContent =
        '@keyframes bookwormIn { from { transform:translateY(30px);opacity:0; } to { transform:translateY(0);opacity:1; } }' +
        '@keyframes bookwormBounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }';
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
