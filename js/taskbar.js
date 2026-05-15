/**
 * WissualisierungOS – Taskbar Module
 * Clock, Start button toggle, system tray
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function() {
  'use strict';

  var _config, _bus, _storage;

  var module = {
    init: function(config, bus, storage) {
      _config = config;
      _bus = bus;
      _storage = storage;

      initClock();
      initStartButton();
      initVolume();
      initCookie();
    }
  };

  // ===== Clock =====
  function initClock() {
    var clockEl = document.getElementById('taskbar-clock');

    function updateClock() {
      var now = new Date();
      var h = String(now.getHours()).padStart(2, '0');
      var m = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = h + ':' + m;
    }

    updateClock();
    setInterval(updateClock, 10000); // Update every 10s is sufficient

    // Click on clock → emit event (for Stundenrechner)
    clockEl.addEventListener('click', function() {
      _bus.emit('system:action', { action: 'clock-click' });
    });
  }

  // ===== Start Button =====
  function initStartButton() {
    var btn = document.getElementById('start-button');
    var menu = document.getElementById('start-menu');

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = menu.classList.contains('open');

      if (isOpen) {
        closeStartMenu();
      } else {
        openStartMenu();
      }
    });

    // Close start menu on desktop click
    _bus.on('desktop:click', closeStartMenu);

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeStartMenu();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        closeStartMenu();
      }
    });
  }

  function openStartMenu() {
    var menu = document.getElementById('start-menu');
    var btn = document.getElementById('start-button');
    menu.classList.add('open');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    _bus.emit('startmenu:opened');
  }

  function closeStartMenu() {
    var menu = document.getElementById('start-menu');
    var btn = document.getElementById('start-button');
    menu.classList.remove('open');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    _bus.emit('startmenu:closed');
  }

  // ===== Volume =====
  function initVolume() {
    var volIcon = document.getElementById('volume-icon');

    volIcon.addEventListener('click', function() {
      _bus.emit('system:action', { action: 'volume-click' });
    });
  }

  // ===== Cookie (Datenschutz) =====
  function initCookie() {
    var cookieIcon = document.getElementById('cookie-icon');
    if (cookieIcon) {
      cookieIcon.addEventListener('click', function() {
        _bus.emit('system:action', { action: 'datenschutz' });
      });
    }
  }

  // Register module
  WissOS.Taskbar = module;
  WissOS.Taskbar.openStartMenu = openStartMenu;
  WissOS.Taskbar.closeStartMenu = closeStartMenu;
})();
