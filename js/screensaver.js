/**
 * WissualisierungOS – Screensaver
 * Konfigurierbares Screensaver-System: Liest verfügbare Screensaver
 * aus config.screensavers[]. Unterstützt Typen:
 *   - "builtin"  → JS-basierte Canvas-Animation (z.B. Kaffee)
 *   - "iframe"   → Beliebige HTML-Datei wird als Iframe geladen
 * Beenden per Klick/Taste.
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function () {
  'use strict';

  var _bus;
  var _config;
  var _active = false;
  var _animId = null;

  var module = {
    init: function (bus) {
      _bus = bus;
      _config = WissOS.config || {};

      // Systemaction „screensaver" empfangen
      bus.on('system:action', function (data) {
        if (data.action === 'screensaver') {
          startScreensaver(data.type);
        }
      });
    }
  };

  /**
   * Verfügbare Screensaver aus Config holen
   */
  function getScreensavers() {
    return (_config.screensavers && _config.screensavers.length > 0)
      ? _config.screensavers
      // Fallback: Wenn keine Config vorhanden, hardcoded Defaults
      : [
          { id: 'kaffee', name: 'Kaffeepause', type: 'builtin' },
          { id: 'wanderer', name: 'Wanderer', type: 'iframe', url: 'PROGRAMME/Screensaver/wanderer_v6.html' },
          { id: 'weimarer-klassik', name: 'Weimarer Klassik', type: 'iframe', url: 'PROGRAMME/Screensaver/weimarer_klassik.html' }
        ];
  }

  /**
   * Screensaver starten
   * @param {string} [type] - ID des Screensavers. Wenn leer, wird zufällig gewählt.
   */
  function startScreensaver(type) {
    if (_active) return;

    var screensavers = getScreensavers();

    // Screensaver finden oder zufällig wählen
    var chosen = null;
    if (type) {
      for (var i = 0; i < screensavers.length; i++) {
        if (screensavers[i].id === type) { chosen = screensavers[i]; break; }
      }
    }
    if (!chosen) {
      chosen = screensavers[Math.floor(Math.random() * screensavers.length)];
    }
    if (!chosen) return;

    _active = true;

    // Overlay erstellen
    var overlay = document.createElement('div');
    overlay.id = 'screensaver-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;background:#0a0a0a;z-index:9999;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'cursor:pointer;overflow:hidden;';

    // Container für den Inhalt (Canvas oder Iframe)
    var container = document.createElement('div');
    container.style.cssText = 'position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;';
    overlay.appendChild(container);

    // Rendering basierend auf Typ
    if (chosen.type === 'iframe' && chosen.url) {
      renderIframe(container, chosen.url);
    } else if (chosen.id === 'kaffee' || chosen.type === 'builtin') {
      // Builtin: derzeit nur Kaffee
      renderKaffee(container);
    } else if (chosen.type === 'iframe' && !chosen.url) {
      // Iframe ohne URL → Fallback auf Kaffee
      renderKaffee(container);
    }

    document.body.appendChild(overlay);

    // Beenden per Klick, Taste, oder Touch
    function stopScreensaver() {
      _active = false;
      if (_animId) cancelAnimationFrame(_animId);
      overlay.remove();
      document.removeEventListener('keydown', stopScreensaver);
    }
    overlay.addEventListener('click', stopScreensaver);
    document.addEventListener('keydown', stopScreensaver);
  }

  /**
   * Der klassische Kaffee-Screensaver (Canvas, builtin)
   */
  function renderKaffee(container) {
    var canvas = document.createElement('canvas');
    canvas.width = 260;
    canvas.height = 280;
    canvas.style.cssText = 'image-rendering:pixelated;width:260px;height:280px;';
    container.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var fillLevel = 0;
    var steamPhase = 0;
    var frame = 0;

    function animate() {
      frame++;
      ctx.clearRect(0, 0, 260, 280);

      // --- Untertasse ---
      ctx.fillStyle = '#B0A89C';
      ctx.fillRect(30, 220, 160, 18);
      ctx.strokeStyle = '#E0D8CC';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 220, 160, 18);
      ctx.strokeStyle = '#888';
      ctx.strokeRect(32, 222, 156, 14);

      // --- Tassenkörper ---
      ctx.fillStyle = '#F5F0E8';
      ctx.fillRect(50, 90, 100, 132);
      ctx.strokeStyle = '#C8C0B4';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 90, 100, 132);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(53, 93, 94, 126);

      // --- Henkel ---
      ctx.fillStyle = '#E8E0D4';
      ctx.fillRect(150, 110, 30, 80);
      ctx.strokeStyle = '#C8C0B4';
      ctx.lineWidth = 3;
      ctx.strokeRect(150, 110, 30, 80);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(156, 124, 18, 52);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.strokeRect(156, 124, 18, 52);

      // --- Kaffee einfüllen ---
      if (fillLevel < 100) fillLevel += 0.3;
      var coffeeHeight = Math.min((fillLevel / 100) * 120, 120);
      if (coffeeHeight > 0) {
        ctx.fillStyle = '#5C3D2E';
        var coffeeTop = 90 + 128 - coffeeHeight;
        ctx.fillRect(53, coffeeTop, 94, coffeeHeight);
        if (fillLevel > 50) {
          ctx.fillStyle = '#C4A882';
          ctx.fillRect(53, coffeeTop, 94, 8);
        }
      }

      // --- Dampf ---
      if (fillLevel >= 90) {
        steamPhase += 0.04;
        drawSteam(ctx, 75, 85, steamPhase);
        drawSteam(ctx, 100, 80, steamPhase + 1.2);
        drawSteam(ctx, 125, 83, steamPhase + 2.4);
      }

      _animId = requestAnimationFrame(animate);
    }
    _animId = requestAnimationFrame(animate);
  }

  /**
   * Generischer Iframe-Screensaver (für Wanderer und zukünftige HTML-Screensaver)
   * @param {HTMLElement} container
   * @param {string} url - Pfad zur HTML-Datei
   */
  function renderIframe(container, url) {
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = 'width:100%; height:100%; border:none; background:#000; pointer-events:none;';
    container.appendChild(iframe);

    // Da pointer-events:none das Iframe „durchsichtig" für Klicks macht,
    // landen Klicks auf dem Overlay und beenden den Screensaver.
  }

  /**
   * Dampf-Welle zeichnen
   */
  function drawSteam(ctx, x, startY, phase) {
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var y = 0; y < 40; y += 2) {
      var wave = Math.sin((y * 0.15) + phase) * 6;
      var alpha = 1 - (y / 40);
      ctx.globalAlpha = alpha * 0.5;
      if (y === 0) ctx.moveTo(x + wave, startY - y);
      else ctx.lineTo(x + wave, startY - y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  WissOS.Screensaver = module;
})();
