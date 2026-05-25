/**
 * WissOS 2.0 – Taskbar Module
 * Clock updates, Start button toggle, active window task tracking, and system tray
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
      initTaskbarPrograms();
    }
  };

  // ===== Clock System =====
  function initClock() {
    var clockEl = document.getElementById('taskbar-clock');
    if (!clockEl) return;

    function updateClock() {
      var now = new Date();
      var h = String(now.getHours()).padStart(2, '0');
      var m = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = h + ':' + m;
    }

    updateClock();
    setInterval(updateClock, 10000); // 10s intervals

    clockEl.addEventListener('click', function() {
      _bus.emit('system:action', { action: 'clock-click' });
    });
  }

  // ===== Start Button =====
  function initStartButton() {
    var btn = document.getElementById('start-button');
    var menu = document.getElementById('start-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = menu.classList.contains('open');

      if (isOpen) {
        closeStartMenu();
      } else {
        openStartMenu();
      }
    });

    _bus.on('desktop:click', closeStartMenu);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeStartMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        closeStartMenu();
      }
    });
  }

  function openStartMenu() {
    var menu = document.getElementById('start-menu');
    var btn = document.getElementById('start-button');
    if (!menu || !btn) return;
    menu.classList.add('open');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    _bus.emit('startmenu:opened');
  }

  function closeStartMenu() {
    var menu = document.getElementById('start-menu');
    var btn = document.getElementById('start-button');
    if (!menu || !btn) return;
    menu.classList.remove('open');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    _bus.emit('startmenu:closed');
  }

  // ===== Sound Volume =====
  function initVolume() {
    var volIcon = document.getElementById('volume-icon');
    if (!volIcon) return;
    volIcon.addEventListener('click', function() {
      _bus.emit('system:action', { action: 'volume-click' });
    });
  }

  // ===== Datenschutz Cookie =====
  function initCookie() {
    var cookieIcon = document.getElementById('cookie-icon');
    if (cookieIcon) {
      cookieIcon.addEventListener('click', function() {
        _bus.emit('system:action', { action: 'datenschutz' });
      });
    }
  }

  // ===== Active Open Window Task Tabs =====
  function initTaskbarPrograms() {
    var container = document.getElementById('taskbar-programs');
    if (!container) return;

    _bus.on('window:created', function(data) {
      var btn = document.createElement('button');
      btn.className = 'os-button taskbar-tab active';
      btn.id = 'taskbar-tab-' + data.id;
      btn.textContent = data.title;
      btn.style.cssText = 'padding:2px 10px;font-size:11px;font-weight:900;border:3px solid #000;box-shadow:2px 2px 0 #000;margin-right:8px;background:var(--color-accent);color:#000;cursor:pointer;';
      
      btn.addEventListener('click', function() {
        _bus.emit('system:action', { action: 'focus-click', id: data.id });
        if (window.WissOS.WindowManager && window.WissOS.WindowManager.createWindow) {
          // Trigger raise to front
          var winEl = document.getElementById(data.id);
          if (winEl) {
            winEl.dispatchEvent(new Event('mousedown'));
          }
        }
      });
      container.appendChild(btn);
    });

    _bus.on('window:closed', function(data) {
      var btn = document.getElementById('taskbar-tab-' + data.id);
      if (btn) btn.remove();
    });

    _bus.on('window:focused', function(data) {
      document.querySelectorAll('.taskbar-tab').forEach(function(tab) {
        tab.classList.remove('active');
        tab.style.background = 'var(--color-button-face)';
        tab.style.transform = 'none';
        tab.style.boxShadow = '2px 2px 0 #000';
      });
      var btn = document.getElementById('taskbar-tab-' + data.id);
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'var(--color-accent)';
        btn.style.transform = 'translate(1px, 1px)';
        btn.style.boxShadow = '1px 1px 0 #000';
      }
    });
  }

  WissOS.Taskbar = module;
  WissOS.Taskbar.openStartMenu = openStartMenu;
  WissOS.Taskbar.closeStartMenu = closeStartMenu;
})();
