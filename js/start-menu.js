/**
 * WissualisierungOS – Start Menu Module
 * Generates menu from config, folder structure, program links
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

    // Set header icon (brain icon)
    menuIcon.src = _getIconUrl('brain');

    body.innerHTML = '';
    system.innerHTML = '';

    // Build program lookup
    var programMap = {};
    _config.programs.forEach(function(p) { programMap[p.id] = p; });
    (_config.systemPrograms || []).forEach(function(p) { programMap[p.id] = p; });

    // Render folders
    _config.menu.folders.forEach(function(folder) {
      var folderEl = document.createElement('div');
      folderEl.className = 'start-menu__folder';

      // Folder header
      var header = document.createElement('div');
      header.className = 'start-menu__folder-header';
      header.innerHTML =
        '<img class="menu-icon" src="' + _getIconUrl(folder.icon || 'folder') + '" alt="">' +
        '<span>' + folder.name + '</span>' +
        '<span class="folder-arrow" aria-hidden="true">▶</span>';
      header.addEventListener('click', function(e) {
        e.stopPropagation();
        folderEl.classList.toggle('open');
      });

      // Folder items
      var items = document.createElement('div');
      items.className = 'start-menu__folder-items';

      folder.programIds.forEach(function(pid) {
        var prog = programMap[pid];
        if (!prog) return;

        var item = document.createElement('a');
        item.className = 'start-menu__item';
        item.href = prog.url || '#';

        // Fullscreen toggle: tag span with id for dynamic label updates
        var labelId = (pid === 'fullscreen-toggle') ? ' id="menu-fullscreen-label"' : '';
        var labelText = (prog.osName || prog.name);
        // Show correct initial label based on current fullscreen state
        if (pid === 'fullscreen-toggle' && document.fullscreenElement) {
          labelText = 'Normalbild-OS';
        }

        item.innerHTML =
          '<img class="menu-icon" src="' + _getIconUrl(prog.icon) + '" alt="">' +
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

    // Render system entries
    var divider = document.createElement('div');
    divider.className = 'start-menu__divider';
    system.appendChild(divider);

    _config.menu.systemEntries.forEach(function(entry) {
      var item = document.createElement('div');
      item.className = 'start-menu__item';
      item.innerHTML =
        '<img class="menu-icon" src="' + _getIconUrl(entry.icon) + '" alt="">' +
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
    menu.classList.remove('open');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
  }

  // Register module
  WissOS.StartMenu = module;
})();
