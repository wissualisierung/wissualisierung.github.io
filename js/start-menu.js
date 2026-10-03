/**
 * WissOS 2.0 – Start Menu Module
 * Generates the categorized neobrutalist menu from system config
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function() {
  'use strict';

  var _config, _bus, _storage, _getIconUrl;

  var module = {
    init: function(config, bus, storage, getIconDataUrl) {
      _config = config;
      _bus = bus;
      _storage = storage;
      _getIconUrl = getIconDataUrl;

      renderMenu();
    }
  };

  function renderMenu() {
    var body = document.getElementById('start-menu-body');
    var system = document.getElementById('start-menu-system');
    var menuIcon = document.getElementById('start-menu-icon');

    if (!body || !system) return;

    // Set header icon (brain icon SVG representation)
    if (menuIcon) {
      menuIcon.innerHTML = WissOS.ICONS['brain'];
    }

    body.innerHTML = '';
    system.innerHTML = '';

    // Program map lookup builder
    var programMap = {};
    _config.programs.forEach(function(p) { programMap[p.id] = p; });
    (_config.systemPrograms || []).forEach(function(p) { programMap[p.id] = p; });

    // Render program category folders
    _config.menu.folders.forEach(function(folder) {
      var folderEl = document.createElement('div');
      folderEl.className = 'start-menu__folder';

      var header = document.createElement('div');
      header.className = 'start-menu__folder-header';
      header.innerHTML =
        '<span class="menu-icon">' + (WissOS.ICONS[folder.icon] || WissOS.ICONS['folder']) + '</span>' +
        '<span>' + folder.name + '</span>' +
        '<span class="folder-arrow" aria-hidden="true">▶</span>';
      
      header.addEventListener('click', function(e) {
        e.stopPropagation();
        WissOS.sound.play('click');
        folderEl.classList.toggle('open');
      });

      var items = document.createElement('div');
      items.className = 'start-menu__folder-items';

      folder.programIds.forEach(function(pid) {
        var prog = programMap[pid];
        if (!prog) return;

        var item = document.createElement('a');
        item.className = 'start-menu__item';
        item.href = prog.url || '#';

        var labelId = (pid === 'fullscreen-toggle') ? ' id="menu-fullscreen-label"' : '';
        var labelText = (prog.osName || prog.name);
        if (pid === 'fullscreen-toggle' && document.fullscreenElement) {
          labelText = 'Normalbild-OS';
        }

        item.innerHTML =
          '<span class="menu-icon">' + (WissOS.ICONS[prog.icon] || WissOS.ICONS['help']) + '</span>' +
          '<span' + labelId + '>' + labelText + '</span>';
        
        item.addEventListener('click', function(e) {
          e.preventDefault();
          closeMenu();
          WissOS.launchProgram(prog);
        });

        items.appendChild(item);
      });

      folderEl.appendChild(header);
      folderEl.appendChild(items);
      body.appendChild(folderEl);
    });

    // Render system actions (privacy declarations, clock, settings resets)
    var divider = document.createElement('div');
    divider.className = 'start-menu__divider';
    system.appendChild(divider);

    _config.menu.systemEntries.forEach(function(entry) {
      var item = document.createElement('div');
      item.className = 'start-menu__item';
      item.innerHTML =
        '<span class="menu-icon">' + (WissOS.ICONS[entry.icon] || WissOS.ICONS['help']) + '</span>' +
        '<span>' + entry.name + '</span>';
      
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        closeMenu();
        _bus.emit('system:action', { action: entry.action });
      });
      system.appendChild(item);
    });
  }

  function closeMenu() {
    var menu = document.getElementById('start-menu');
    var btn = document.getElementById('start-button');
    if (menu && btn) {
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  WissOS.StartMenu = module;
})();
