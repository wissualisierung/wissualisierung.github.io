/**
 * WissOS 2.0 – Desktop Icons Module
 * Renders icons, handles selection, drag & drop, double-click, and persistent positions
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function() {
  'use strict';

  var _config, _bus, _storage, _getIconUrl;
  var _selectedIcon = null;
  var _dragState = null;
  var _isMobile = function() { return window.innerWidth <= 768; };

  var module = {
    init: function(config, bus, storage, getIconDataUrl) {
      _config = config;
      _bus = bus;
      _storage = storage;
      _getIconUrl = getIconDataUrl;

      renderIcons();

      // Deselect on desktop click
      bus.on('desktop:click', function() {
        deselectAll();
      });

      // Handle resize dynamics
      var _wasMobile = _isMobile();
      window.addEventListener('resize', function() {
        var isMobileNow = _isMobile();
        var icons = document.querySelectorAll('.desktop-icon');
        if (isMobileNow) {
          icons.forEach(function(el) {
            el.style.left = '';
            el.style.top = '';
          });
        } else if (_wasMobile || !icons[0] || !icons[0].style.left) {
          var allPrograms = _config.programs.filter(function(p) { return p.showOnDesktop; });
          var allSysProgs = (_config.systemPrograms || []).filter(function(p) { return p.showOnDesktop; });
          var allItems = allPrograms.map(function(p) { return { id: p.id, pos: p.desktopPosition }; })
            .concat(allSysProgs.map(function(p) { return { id: p.id, pos: p.desktopPosition }; }));

          icons.forEach(function(el) {
            var iconId = el.dataset.iconId;
            var item = null;
            for (var i = 0; i < allItems.length; i++) {
              if (allItems[i].id === iconId) { item = allItems[i]; break; }
            }
            positionIcon(el, iconId, item ? item.pos : null);
          });
        }
        _wasMobile = isMobileNow;
      });
    }
  };

  function renderIcons() {
    var container = document.getElementById('icon-container');
    if (!container) return;
    container.innerHTML = '';

    // 1. Render learning applications
    var programs = _config.programs.filter(function(p) { return p.showOnDesktop; });
    programs.forEach(function(prog) {
      var el = createIconElement(prog.id, prog.osName || prog.name, prog.icon, prog.description);
      positionIcon(el, prog.id, prog.desktopPosition);
      container.appendChild(el);

      el.addEventListener('dblclick', function(e) {
        e.preventDefault();
        _bus.emit('icon:dblclick', { id: prog.id });
        WissOS.launchProgram(prog);
      });
    });

    // 2. Render system tools (Papierkorb, Terminal, etc.)
    var sysprogs = (_config.systemPrograms || []).filter(function(p) { return p.showOnDesktop; });
    sysprogs.forEach(function(prog) {
      var el = createIconElement(prog.id, prog.name, prog.icon, prog.description);
      positionIcon(el, prog.id, prog.desktopPosition);
      container.appendChild(el);

      el.addEventListener('dblclick', function(e) {
        e.preventDefault();
        _bus.emit('icon:dblclick', { id: prog.id });
        _bus.emit('system:action', { action: prog.action, program: prog });
      });
    });
  }

  function createIconElement(id, label, iconName, description) {
    var div = document.createElement('div');
    div.className = 'desktop-icon';
    div.id = 'icon-' + id;
    div.setAttribute('role', 'listitem');
    div.setAttribute('aria-label', label);
    div.setAttribute('tabindex', '0');
    div.dataset.iconId = id;
    div.dataset.description = description || '';

    // Direct SVG inline injection instead of <img> to make it neobrutalist crisp
    var imgWrapper = document.createElement('div');
    imgWrapper.className = 'desktop-icon__img-wrap';
    imgWrapper.innerHTML = WissOS.ICONS[iconName] || WissOS.ICONS['help'];

    var span = document.createElement('span');
    span.className = 'desktop-icon__label';
    span.textContent = label;

    div.appendChild(imgWrapper);
    div.appendChild(span);

    // Click -> Select
    div.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      selectIcon(div);

      if (!_isMobile()) {
        var rect = div.getBoundingClientRect();
        _dragState = {
          el: div,
          startX: e.clientX,
          startY: e.clientY,
          offsetX: e.clientX - rect.left,
          offsetY: e.clientY - rect.top,
          moved: false,
          iconId: id
        };
      }
    });

    // Tap handling for touch displays (tablets/phones)
    var lastTap = 0;
    div.addEventListener('touchend', function(e) {
      var now = Date.now();
      if (now - lastTap < 350) {
        e.preventDefault();
        div.dispatchEvent(new Event('dblclick'));
      } else {
        selectIcon(div);
      }
      lastTap = now;
    });

    // Custom neobrutalist system tooltips on hover
    div.addEventListener('mouseenter', function(e) {
      if (description) showTooltip(e, description);
    });
    div.addEventListener('mouseleave', hideTooltip);
    div.addEventListener('mousemove', function(e) {
      if (description && (!_dragState || !_dragState.moved)) moveTooltip(e);
    });

    div.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        div.dispatchEvent(new Event('dblclick'));
      }
    });

    return div;
  }

  function positionIcon(el, iconId, defaultPos) {
    if (_isMobile()) return;

    var saved = _storage.get('icon_pos_' + iconId);
    if (saved) {
      el.style.left = saved.x + 'px';
      el.style.top = saved.y + 'px';
    } else if (defaultPos) {
      if (defaultPos.align === 'right') {
        el.style.right = (defaultPos.col * 110 + 20) + 'px';
        el.style.left = 'auto';
      } else {
        el.style.left = (defaultPos.col * 110 + 20) + 'px';
        el.style.right = 'auto';
      }
      el.style.top = (defaultPos.row * 110 + 20) + 'px';
    }
  }

  function selectIcon(el) {
    deselectAll();
    el.classList.add('selected');
    _selectedIcon = el;
  }

  function deselectAll() {
    document.querySelectorAll('.desktop-icon.selected').forEach(function(ic) {
      ic.classList.remove('selected');
    });
    _selectedIcon = null;
  }

  // ===== Drag system listener (desktop mouse) =====
  document.addEventListener('mousemove', function(e) {
    if (!_dragState) return;
    var dx = Math.abs(e.clientX - _dragState.startX);
    var dy = Math.abs(e.clientY - _dragState.startY);

    if (!_dragState.moved && (dx > 5 || dy > 5)) {
      _dragState.moved = true;
      _dragState.el.classList.add('dragging');
      hideTooltip();
    }

    if (_dragState.moved) {
      var containerRect = document.getElementById('icon-container').getBoundingClientRect();
      var x = e.clientX - _dragState.offsetX - containerRect.left;
      var y = e.clientY - _dragState.offsetY - containerRect.top;
      _dragState.el.style.left = x + 'px';
      _dragState.el.style.top = y + 'px';
    }
  });

  document.addEventListener('mouseup', function() {
    if (!_dragState) return;
    if (_dragState.moved) {
      _dragState.el.classList.remove('dragging');
      _storage.set('icon_pos_' + _dragState.iconId, {
        x: parseInt(_dragState.el.style.left),
        y: parseInt(_dragState.el.style.top)
      });
    }
    _dragState = null;
  });

  // ===== Tooltip Rendering =====
  function showTooltip(e, text) {
    var tip = document.getElementById('tooltip');
    if (!tip) return;
    tip.textContent = text;
    tip.style.display = 'block';
    moveTooltip(e);
  }

  function moveTooltip(e) {
    var tip = document.getElementById('tooltip');
    if (!tip) return;
    tip.style.left = (e.clientX + 16) + 'px';
    tip.style.top = (e.clientY + 16) + 'px';
  }

  function hideTooltip() {
    var tip = document.getElementById('tooltip');
    if (tip) tip.style.display = 'none';
  }

  WissOS.DesktopIcons = module;
})();
