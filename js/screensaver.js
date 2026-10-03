/**
 * WissOS 2.0 – Screen Saver Module
 * Built-in Canvas pixel art coffee and dynamic iframe wrappers
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

      bus.on('system:action', function (data) {
        if (data.action === 'screensaver') {
          startScreensaver(data.type);
        }
      });
    }
  };

  function getScreensavers() {
    return (_config.screensavers && _config.screensavers.length > 0)
      ? _config.screensavers
      : [
          { id: 'kaffee', name: 'Kaffeepause', type: 'builtin' }
        ];
  }

  function startScreensaver(type) {
    if (_active) return;

    var screensavers = getScreensavers();
    var chosen = null;
    if (type) {
      chosen = screensavers.find(s => s.id === type);
    }
    if (!chosen) {
      chosen = screensavers[Math.floor(Math.random() * screensavers.length)] || { id: 'kaffee', type: 'builtin' };
    }

    _active = true;

    var overlay = document.createElement('div');
    overlay.id = 'screensaver-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;background:#0d0d0d;z-index:99999;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'cursor:pointer;overflow:hidden;';

    var container = document.createElement('div');
    container.style.cssText = 'position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;';
    overlay.appendChild(container);

    if (chosen.type === 'iframe' && chosen.url) {
      var iframe = document.createElement('iframe');
      iframe.src = chosen.url;
      iframe.style.cssText = 'width:100%; height:100%; border:none; background:#000; pointer-events:none;';
      container.appendChild(iframe);
    } else {
      renderKaffee(container);
    }

    document.body.appendChild(overlay);

    function stopScreensaver() {
      _active = false;
      if (_animId) cancelAnimationFrame(_animId);
      overlay.remove();
      document.removeEventListener('keydown', stopScreensaver);
    }
    overlay.addEventListener('click', stopScreensaver);
    document.addEventListener('keydown', stopScreensaver);
  }

  function renderKaffee(container) {
    var canvas = document.createElement('canvas');
    canvas.width = 260;
    canvas.height = 280;
    canvas.style.cssText = 'image-rendering:pixelated;width:260px;height:280px;';
    container.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var fillLevel = 0;
    var steamPhase = 0;

    function animate() {
      ctx.clearRect(0, 0, 260, 280);

      // Plate
      ctx.fillStyle = '#C3B091';
      ctx.fillRect(30, 220, 160, 18);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 220, 160, 18);

      // Mug body
      ctx.fillStyle = 'var(--color-primary)';
      ctx.fillRect(50, 90, 100, 132);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 90, 100, 132);

      // Mug handle
      ctx.fillStyle = 'var(--color-primary)';
      ctx.fillRect(150, 110, 30, 80);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeRect(150, 110, 30, 80);
      ctx.fillStyle = '#0d0d0d';
      ctx.fillRect(156, 124, 18, 52);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeRect(156, 124, 18, 52);

      // Coffee filling
      if (fillLevel < 100) fillLevel += 0.3;
      var coffeeHeight = Math.min((fillLevel / 100) * 115, 115);
      if (coffeeHeight > 0) {
        ctx.fillStyle = '#4A3E3D'; // Dark espresso brown
        var coffeeTop = 90 + 128 - coffeeHeight;
        ctx.fillRect(54, coffeeTop, 92, coffeeHeight);
        
        if (fillLevel > 50) {
          ctx.fillStyle = '#C3B091'; // Foam
          ctx.fillRect(54, coffeeTop, 92, 8);
        }
      }

      // Steam
      if (fillLevel >= 90) {
        steamPhase += 0.05;
        drawSteam(ctx, 75, 80, steamPhase);
        drawSteam(ctx, 100, 75, steamPhase + 1.2);
        drawSteam(ctx, 125, 78, steamPhase + 2.4);
      }

      _animId = requestAnimationFrame(animate);
    }
    _animId = requestAnimationFrame(animate);
  }

  function drawSteam(ctx, x, startY, phase) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (var y = 0; y < 40; y += 2) {
      var wave = Math.sin((y * 0.15) + phase) * 5;
      var alpha = 1 - (y / 40);
      ctx.globalAlpha = alpha * 0.6;
      if (y === 0) ctx.moveTo(x + wave, startY - y);
      else ctx.lineTo(x + wave, startY - y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  WissOS.Screensaver = module;
})();
