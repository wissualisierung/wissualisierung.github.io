/**
 * WissualisierungOS – Window Manager Module
 * Creates, drags, focuses, and closes windows
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function() {
  'use strict';

  var _config, _bus, _storage;
  var _zCounter = 100; // Steuert die Stapelreihenfolge (z-index)
  var _windowCount = 0; // Eindeutige ID-Generierung
  var _windows = {};    // Hält Referenzen auf alle aktiven Fenster-Objekte

  var module = {
    /**
     * Initialisiert den Manager mit den System-Instanzen
     */
    init: function(config, bus, storage) {
      _config = config;
      _bus = bus;
      _storage = storage;

      // Listen for window creation requests
      bus.on('window:create', function(opts) {
        createWindow(opts);
      });

      // Listen for system actions
      bus.on('system:action', function(data) {
        handleSystemAction(data);
      });

      // Fullscreen change listener: update menu label dynamically
      document.addEventListener('fullscreenchange', function() {
        var label = document.getElementById('menu-fullscreen-label');
        if (label) {
          if (document.fullscreenElement) {
            label.textContent = 'Normalbild-OS';
          } else {
            label.textContent = 'Vollbild-OS';
          }
        }
      });
    }
  };

  /**
   * Erstellt ein neues Fenster auf dem Desktop
   * @param {Object} opts - { title, icon, content, width, height, x, y }
   * @returns {string} window id
   */
  function createWindow(opts) {
    var id = 'win-' + (++_windowCount);
    var container = document.getElementById('window-container');

    // DOM-Element für das Fenster erstellen
    var win = document.createElement('div');
    win.className = 'os-window';
    win.id = id;
    win.style.zIndex = ++_zCounter; // Direkt nach oben bringen
    win.style.width = (opts.width || 400) + 'px';
    win.style.height = (opts.height || 300) + 'px';

    // Center if no position given
    var x = opts.x != null ? opts.x : Math.max(40, Math.random() * (window.innerWidth - (opts.width || 400) - 100) + 40);
    var y = opts.y != null ? opts.y : Math.max(30, Math.random() * (window.innerHeight - (opts.height || 300) - 100) + 30);
    win.style.left = x + 'px';
    win.style.top = y + 'px';

    // Titlebar
    var titlebar = document.createElement('div');
    titlebar.className = 'os-window__titlebar';

    if (opts.icon) {
      var tbIcon = document.createElement('img');
      tbIcon.className = 'os-window__titlebar-icon';
      tbIcon.src = WissOS.getIconDataUrl(opts.icon);
      tbIcon.alt = '';
      titlebar.appendChild(tbIcon);
    }

    var titleText = document.createElement('span');
    titleText.className = 'os-window__title';
    titleText.textContent = opts.title || 'Fenster';
    titlebar.appendChild(titleText);

    // Window buttons (minimize placeholder + maximize + close)
    var btnGroup = document.createElement('div');
    btnGroup.className = 'os-window__btn-group';

    var maxBtn = document.createElement('button');
    maxBtn.className = 'os-window__btn os-window__btn--maximize';
    maxBtn.textContent = '□';
    maxBtn.setAttribute('aria-label', 'Maximieren');
    maxBtn.addEventListener('click', function() {
      toggleMaximize(id);
    });
    btnGroup.appendChild(maxBtn);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'os-window__btn os-window__btn--close';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Fenster schließen');
    closeBtn.addEventListener('click', function() {
      destroyWindow(id);
    });
    btnGroup.appendChild(closeBtn);
    titlebar.appendChild(btnGroup);

    // Double-click on titlebar also toggles maximize
    titlebar.addEventListener('dblclick', function(e) {
      if (e.target === titlebar || e.target === titleText) {
        toggleMaximize(id);
      }
    });

    // Content area
    var content = document.createElement('div');
    content.className = 'os-window__content';
    if (typeof opts.content === 'string') {
      content.innerHTML = opts.content;
    } else if (opts.content instanceof HTMLElement) {
      content.appendChild(opts.content);
    }

    win.appendChild(titlebar);
    win.appendChild(content);

    // Window open animation
    win.classList.add('os-window--opening');
    container.appendChild(win);
    requestAnimationFrame(function() {
      win.classList.remove('os-window--opening');
    });

    // Focus on click
    win.addEventListener('mousedown', function() {
      focusWindow(id);
    });

    // Drag via titlebar
    initDrag(win, titlebar);

    _windows[id] = { el: win, opts: opts };
    focusWindow(id);

    // Event emittieren (für Sound-System u.a.)
    _bus.emit('window:created', { id: id, title: opts.title });

    return id;
  }

  function destroyWindow(id) {
    var entry = _windows[id];
    if (!entry) return;
    entry.el.classList.add('os-window--closing');
    _bus.emit('window:closed', { id: id });
    setTimeout(function() {
      if (entry.el) entry.el.remove();
      delete _windows[id];
    }, 150);
  }

  function toggleMaximize(id) {
    var entry = _windows[id];
    if (!entry) return;

    var win = entry.el;
    if (win.classList.contains('maximized')) {
      // Restore
      win.classList.remove('maximized');
      win.style.left = entry.oldPos.x + 'px';
      win.style.top = entry.oldPos.y + 'px';
      win.style.width = entry.oldSize.w + 'px';
      win.style.height = entry.oldSize.h + 'px';
      win.querySelector('.os-window__btn--maximize').textContent = '□';
    } else {
      // Maximize
      entry.oldPos = { x: win.offsetLeft, y: win.offsetTop };
      entry.oldSize = { w: win.offsetWidth, h: win.offsetHeight };
      win.classList.add('maximized');
      win.querySelector('.os-window__btn--maximize').textContent = '❐';
    }
  }

  function focusWindow(id) {
    // Deactivate all titlebars
    Object.keys(_windows).forEach(function(wid) {
      var w = _windows[wid];
      if (w && w.el) {
        var tb = w.el.querySelector('.os-window__titlebar');
        if (tb) tb.classList.add('inactive');
      }
    });
    // Activate this one
    var entry = _windows[id];
    if (!entry) return;
    entry.el.style.zIndex = ++_zCounter;
    var tb = entry.el.querySelector('.os-window__titlebar');
    if (tb) tb.classList.remove('inactive');
  }

  // ===== Window Drag =====
  function initDrag(win, titlebar) {
    var dragging = false;
    var offsetX = 0, offsetY = 0;

    titlebar.addEventListener('mousedown', function(e) {
      if (e.target.closest('.os-window__btn')) return;
      dragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      titlebar.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!dragging) return;
      
      var x = e.clientX - offsetX;
      var y = e.clientY - offsetY;

      // Bounds checking (prevent titlebar from going off-screen)
      var maxX = window.innerWidth - 40;
      var maxY = window.innerHeight - 40;
      
      x = Math.max(-win.offsetWidth + 60, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      win.style.left = x + 'px';
      win.style.top = y + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (dragging) {
        dragging = false;
        titlebar.style.cursor = 'grab';
        
        // If window was maximized, restore on drag? 
        // Classic OS behavior: dragging a maximized window restores it.
        if (win.classList.contains('maximized')) {
           toggleMaximize(win.id);
        }
      }
    });

    // Touch support for window drag
    titlebar.addEventListener('touchstart', function(e) {
      if (e.target.closest('.os-window__btn')) return;
      var touch = e.touches[0];
      dragging = true;
      offsetX = touch.clientX - win.offsetLeft;
      offsetY = touch.clientY - win.offsetTop;
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (!dragging) return;
      var touch = e.touches[0];
      win.style.left = (touch.clientX - offsetX) + 'px';
      win.style.top = (touch.clientY - offsetY) + 'px';
    }, { passive: true });

    document.addEventListener('touchend', function() {
      dragging = false;
    });
  }

  // ===== System Action Handler =====
  // Zentrale Stelle für System-interne Funktionen, die über das Startmenü 
  // oder Desktop-Icons ausgelöst werden (z.B. Papierkorb, Terminal).
  function handleSystemAction(data) {
    switch (data.action) {
      case 'about':
        showAbout();
        break;
      case 'datenschutz':
        showDatenschutz();
        break;
      case 'help':
        showHelp();
        break;
      case 'trash':
        showTrash();
        break;
      case 'terminal':
        showTerminal();
        break;
      case 'editor-folder':
        showWissOSFolder();
        break;
      case 'strophen-editor-folder':
        showStrophenEditorFolder();
        break;
      case 'paed-helper':
        showPaedHelper();
        break;
      case 'clock-click':
        showClockInfo();
        break;
      case 'screensaver':  // Wird von screensaver.js verarbeitet
      case 'volume-click': // Wird von os-core.js verarbeitet
        break;
      case 'fullscreen':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          showFullscreenWarning();
        }
        break;
      default:
        // Unknown action – show placeholder
        createWindow({
          title: data.action,
          icon: 'gear',
          content: '<p style="padding:20px;text-align:center;">Funktion „' + data.action + '" wird in einer späteren Phase implementiert.</p>',
          width: 340,
          height: 180
        });
    }
  }

  function showFullscreenWarning() {
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:24px;';

    var icon = document.createElement('div');
    icon.style.cssText = 'font-size:36px;text-align:center;margin-bottom:12px;';
    icon.textContent = '🖥️';

    var heading = document.createElement('h4');
    heading.style.cssText = 'font-family:var(--font-system);font-size:16px;text-align:center;margin-bottom:16px;color:var(--color-text);';
    heading.textContent = 'Vollbildmodus aktivieren';

    var warningBox = document.createElement('div');
    warningBox.style.cssText = 'font-family:var(--font-body);font-size:13px;line-height:1.8;padding:14px;background:var(--color-accent,#FFF8DC);border:2px solid var(--color-text);margin-bottom:20px;';
    warningBox.innerHTML =
      '⚠️ <strong>Hinweis:</strong><br>' +
      'WissualisierungOS wird im Vollbildmodus bildschirmfüllend angezeigt.<br><br>' +
      'Der Vollbildmodus kann jederzeit über folgende Tasten verlassen werden:<br>' +
      '&nbsp;&nbsp;• Taste <kbd style="padding:2px 6px;background:#eee;border:1px solid #aaa;border-radius:3px;font-family:var(--font-system);font-size:12px;">ESC</kbd> – Vollbild beenden<br>' +
      '&nbsp;&nbsp;• Taste <kbd style="padding:2px 6px;background:#eee;border:1px solid #aaa;border-radius:3px;font-family:var(--font-system);font-size:12px;">F11</kbd> – Vollbild umschalten';

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:12px;justify-content:center;';

    var okBtn = document.createElement('button');
    okBtn.className = 'bevel-btn';
    okBtn.textContent = '✅ Aktivieren';
    okBtn.style.cssText = 'min-width:120px;';
    okBtn.addEventListener('click', function() {
      var winEl = contentEl.closest('.os-window');
      if (winEl) destroyWindow(winEl.id);
      document.documentElement.requestFullscreen().catch(function(err) {
        console.warn('Fullscreen request failed:', err);
      });
    });

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'bevel-btn';
    cancelBtn.textContent = '❌ Abbrechen';
    cancelBtn.style.cssText = 'min-width:120px;';
    cancelBtn.addEventListener('click', function() {
      var winEl = contentEl.closest('.os-window');
      if (winEl) destroyWindow(winEl.id);
    });

    btnRow.appendChild(okBtn);
    btnRow.appendChild(cancelBtn);

    contentEl.appendChild(icon);
    contentEl.appendChild(heading);
    contentEl.appendChild(warningBox);
    contentEl.appendChild(btnRow);

    createWindow({
      title: 'Vollbildmodus',
      icon: 'fullscreen',
      content: contentEl,
      width: 440,
      height: 340
    });
  }

  function showAbout() {
    var c = _config.os;
    createWindow({
      title: 'Über ' + c.name,
      icon: 'brain',
      content:
        '<div style="text-align:center;padding:24px;">' +
        '<div style="font-size:40px;margin-bottom:12px;">⚡</div>' +
        '<h3 style="font-family:var(--font-system);margin-bottom:8px;font-size:22px;">' + c.name + '</h3>' +
        '<p style="font-family:var(--font-body);font-size:13px;">Version ' + c.version + '</p>' +
        '<hr style="margin:16px auto;border:1px solid var(--color-button-shadow);width:60%;">' +
        '<p style="font-style:italic;font-family:var(--font-body);font-size:14px;margin-bottom:12px;">' + c.tagline + '</p>' +
        '<p style="font-size:11px;color:#808080;font-family:var(--font-body);">' + c.license + '</p>' +
        '</div>',
      width: 340,
      height: 300
    });
  }

  function showDatenschutz() {
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:24px; font-family:var(--font-body); font-size:13px; line-height:1.6; overflow-y:auto; height:100%;';
    
    var icon = document.createElement('div');
    icon.style.cssText = 'font-size:36px; text-align:center; margin-bottom:12px;';
    icon.textContent = '🍪';

    var textContent = document.createElement('div');
    textContent.innerHTML = `
      <h3 style="font-family:var(--font-system); font-size:18px; margin-bottom:8px; border-bottom:1px solid var(--color-button-shadow); padding-bottom:4px;">Hinweis zum Datenschutz</h3>
      <p style="margin-bottom:12px;">Diese Anwendung speichert ausschließlich technisch notwendige Daten lokal in Ihrem Browser (sog. Local Storage). Diese Daten dienen allein dazu, Ihren Lernfortschritt oder Ihre Einstellungen innerhalb dieser Anwendung zu sichern.</p>
      <p style="margin-bottom:12px;">Es werden keinerlei personenbezogene Daten erhoben, verarbeitet oder an Dritte übermittelt. Es kommen keine Tracking-Cookies, keine Analyse-Tools und keine externen Skripte zum Einsatz.</p>
      <p style="margin-bottom:12px;">Die lokal gespeicherten Daten verlassen Ihr Gerät nicht und sind ausschließlich für Sie in Ihrem Browser sichtbar. Sie können die gespeicherten Daten jederzeit löschen, indem Sie den Browser-Cache bzw. die Website-Daten in Ihren Browsereinstellungen leeren.</p>
      <p style="margin-bottom:24px;">Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG (technisch notwendige Speicherung); Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Funktionsfähigkeit der Anwendung).</p>

      <h3 style="font-family:var(--font-system); font-size:18px; margin-bottom:8px; border-bottom:1px solid var(--color-button-shadow); padding-bottom:4px;">Impressum</h3>
      <p style="margin-bottom:12px;">Angaben gemäß § 5 DDG</p>
      <p style="margin-bottom:12px;">
        Name: Sebastian Wolf<br>
        Anschrift: Graf-Leopold-Ring 2, 94099 Ruhstorf a.d.Rott, Bayern, Deutschland<br>
        E-Mail: s.w.oer@outlook.de
      </p>
      <p style="margin-bottom:12px;">
        Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br>
        Sebastian Wolf, [Anschrift wie oben]
      </p>
      <p style="margin-bottom:12px;">
        Haftungsausschluss:<br>
        Trotz sorgfältiger inhaltlicher Kontrolle übernehme ich keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
      </p>
    `;

    contentEl.appendChild(icon);
    contentEl.appendChild(textContent);

    createWindow({
      title: 'Datenschutz & Impressum',
      icon: 'cookie',
      content: contentEl,
      width: 460,
      height: 520
    });
  }

  function showHelp() {
    var tips = _config.tips || [];
    var randomTip = tips[Math.floor(Math.random() * tips.length)] || 'Kein Tipp verfügbar.';

    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:20px;';

    var icon = document.createElement('div');
    icon.style.cssText = 'font-size:36px;text-align:center;margin-bottom:16px;';
    icon.textContent = '💡';

    var heading = document.createElement('h4');
    heading.style.cssText = 'font-family:var(--font-system);font-size:16px;text-align:center;margin-bottom:12px;color:var(--color-text);';
    heading.textContent = 'Didaktischer Tipp';

    var tipText = document.createElement('p');
    tipText.style.cssText = 'font-family:var(--font-body);font-size:13px;line-height:1.7;margin-bottom:20px;padding:12px;background:var(--color-accent);border:2px solid var(--color-text);';
    tipText.textContent = randomTip;

    var nextBtn = document.createElement('button');
    nextBtn.className = 'bevel-btn';
    nextBtn.textContent = '💡 Nächster Tipp';
    nextBtn.style.cssText = 'margin:0 auto;display:block;';
    nextBtn.addEventListener('click', function() {
      var newTip = tips[Math.floor(Math.random() * tips.length)] || 'Kein Tipp verfügbar.';
      tipText.textContent = newTip;
    });

    contentEl.appendChild(icon);
    contentEl.appendChild(heading);
    contentEl.appendChild(tipText);
    contentEl.appendChild(nextBtn);

    createWindow({
      title: 'Hilfe – Didaktischer Tipp',
      icon: 'help',
      content: contentEl,
      width: 420,
      height: 340
    });
  }

  function showPaedHelper() {
    var prog = null;
    for (var i = 0; i < _config.programs.length; i++) {
      if (_config.programs[i].id === 'paed-navigator') {
        prog = _config.programs[i];
        break;
      }
    }
    if (prog) {
      WissOS.launchProgram(prog);
    }
  }

  function showTrash() {
    var jokes = _config.trashJokes || [];
    var randomJoke = jokes[Math.floor(Math.random() * jokes.length)] || 'Der Papierkorb ist leer.';

    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:20px;';

    var icon = document.createElement('div');
    icon.style.cssText = 'font-size:36px;text-align:center;margin-bottom:16px;';
    icon.textContent = '🗑️';

    var jokeText = document.createElement('p');
    jokeText.style.cssText = 'font-family:var(--font-body);font-size:13px;line-height:1.7;margin-bottom:20px;text-align:center;padding:12px;background:#fff0f5;border:2px solid var(--color-text);';
    jokeText.textContent = randomJoke;

    var nextBtn = document.createElement('button');
    nextBtn.className = 'bevel-btn';
    nextBtn.textContent = '🎭 Nächster Witz';
    nextBtn.style.cssText = 'margin:0 auto;display:block;';
    nextBtn.addEventListener('click', function() {
      var newJoke = jokes[Math.floor(Math.random() * jokes.length)] || 'Der Papierkorb ist leer.';
      jokeText.textContent = newJoke;
    });

    contentEl.appendChild(icon);
    contentEl.appendChild(jokeText);
    contentEl.appendChild(nextBtn);

    createWindow({
      title: 'Papierkorb',
      icon: 'trash',
      content: contentEl,
      width: 420,
      height: 300
    });
  }

  function showTerminal() {
    var term = _config.terminal || {};
    var commands = term.commands || {};
    var prompt = term.prompt || '>';

    var contentEl = document.createElement('div');
    contentEl.className = 'terminal-content';

    var output = document.createElement('div');
    output.className = 'terminal-output';
    output.textContent = term.welcomeMessage || '';

    var inputRow = document.createElement('div');
    inputRow.className = 'terminal-input-row';

    var promptLabel = document.createElement('span');
    promptLabel.className = 'terminal-prompt';
    promptLabel.textContent = prompt + ' ';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'terminal-input';
    input.setAttribute('aria-label', 'Terminal-Eingabe');
    input.autocomplete = 'off';
    input.spellcheck = false;

    var history = [];
    var historyIndex = -1;

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var cmd = input.value.trim().toLowerCase();
        output.textContent += '\n' + prompt + ' ' + input.value + '\n';
        history.unshift(input.value);
        historyIndex = -1;
        input.value = '';

        if (cmd === 'clear') {
          output.textContent = '';
        } else if (cmd === 'witz') {
          var jokes = _config.trashJokes || [];
          var joke = jokes[Math.floor(Math.random() * jokes.length)] || 'Kein Witz verfügbar.';
          output.textContent += joke + '\n';
        } else if (cmd === 'tipp') {
          var tips = _config.tips || [];
          var tip = tips[Math.floor(Math.random() * tips.length)] || 'Kein Tipp verfügbar.';
          output.textContent += tip + '\n';
        } else if (cmd === 'matrix') {
          output.textContent += 'Die Matrix hat dich... Nein, hier gibt es keine rote Pille.\n';
        } else if (cmd.startsWith('theme ')) {
          // Dynamischer Theme-Wechsel: "theme vaporwave", "theme retro-classic"
          var themeName = cmd.split(' ')[1];
          if (WissOS.theme && WissOS.theme.set(themeName)) {
            output.textContent += 'Theme gewechselt zu: ' + themeName + '\n';
          } else {
            output.textContent += 'Unbekanntes Theme: ' + themeName + '\n';
            output.textContent += 'Verfügbar: ' + (WissOS.theme ? WissOS.theme.available.join(', ') : '?') + '\n';
          }
        } else if (cmd === 'theme') {
          output.textContent += 'Aktuelles Theme: ' + (WissOS.theme ? WissOS.theme.current() : '?') + '\n';
          output.textContent += 'Verfügbar: ' + (WissOS.theme ? WissOS.theme.available.join(', ') : '?') + '\n';
        } else if (cmd === 'reset') {
          // localStorage zurücksetzen (Boot-Flag, Icon-Positionen, etc.)
          localStorage.clear();
          output.textContent += 'localStorage gelöscht. Seite wird neu geladen …\n';
          setTimeout(function() { location.reload(); }, 1000);
        } else if (cmd === 'coffee' || cmd === 'kaffee') {
          // Screensaver starten (Kaffee)
          output.textContent += 'Kaffeepause wird eingeleitet …\n';
          setTimeout(function() {
            _bus.emit('system:action', { action: 'screensaver', type: 'kaffee' });
          }, 500);
        } else if (cmd === 'wanderer') {
          // Screensaver starten (Wanderer)
          output.textContent += 'Wanderer-Modus wird aktiviert …\n';
          setTimeout(function() {
            _bus.emit('system:action', { action: 'screensaver', type: 'wanderer' });
          }, 500);
        } else if (cmd === 'klassik' || cmd === 'weimarer') {
          // Screensaver starten (Weimarer Klassik)
          output.textContent += 'Weimarer Klassik wird geladen …\n';
          setTimeout(function() {
            _bus.emit('system:action', { action: 'screensaver', type: 'weimarer-klassik' });
          }, 500);
        } else if (cmd === 'legacy') {
          // Alte Version öffnen
          output.textContent += 'Legacy-Version wird in neuem Tab geöffnet …\n';
          setTimeout(function() {
            window.open('https://wissualisierung.github.io/eduwolf.github.io/', '_blank');
          }, 500);
        } else if (cmd === 'screensaver') {
          output.textContent += 'Bildschirmschoner wird gestartet (Zufallswahl) …\n';
          setTimeout(function() {
            _bus.emit('system:action', { action: 'screensaver' });
          }, 500);
        } else if (cmd === 'hintergrund' || cmd === 'wallpaper') {
          output.textContent += 'Hintergrundauswahl wird geöffnet …\n';
          setTimeout(function() {
            if (WissOS.wallpaper) WissOS.wallpaper.showPicker();
          }, 300);
        } else if (commands[cmd]) {
          if (commands[cmd] === '__EXIT__') {
            var winEl = contentEl.closest('.os-window');
            if (winEl) destroyWindow(winEl.id);
            return;
          }
          output.textContent += commands[cmd] + '\n';
        } else if (cmd !== '') {
          output.textContent += 'Unbekannter Befehl: ' + cmd + '\nGeben Sie \'hilfe\' ein für verfügbare Befehle.\n';
        }

        output.scrollTop = output.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length > 0 && historyIndex < history.length - 1) {
          historyIndex++;
          input.value = history[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = history[historyIndex];
        } else {
          historyIndex = -1;
          input.value = '';
        }
      }
    });

    inputRow.appendChild(promptLabel);
    inputRow.appendChild(input);
    contentEl.appendChild(output);
    contentEl.appendChild(inputRow);

    createWindow({
      title: 'Terminal',
      icon: 'terminal',
      content: contentEl,
      width: 520,
      height: 360
    });

    // Auto-focus input
    setTimeout(function() { input.focus(); }, 100);
  }

  function showClockInfo() {
    var now = new Date();
    var timeStr = now.toLocaleTimeString('de-DE');
    var dateStr = now.toLocaleDateString('de-DE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Stundenrechner
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:20px;text-align:center;';

    var timeDisplay = document.createElement('div');
    timeDisplay.style.cssText = 'font-size:36px;font-family:var(--font-system);margin-bottom:8px;';
    timeDisplay.textContent = timeStr;

    var dateDisplay = document.createElement('div');
    dateDisplay.style.cssText = 'font-size:14px;color:#808080;font-family:var(--font-body);margin-bottom:20px;';
    dateDisplay.textContent = dateStr;

    // Update time every second
    var clockInterval = setInterval(function() {
      var n = new Date();
      timeDisplay.textContent = n.toLocaleTimeString('de-DE');
    }, 1000);

    var hr = document.createElement('hr');
    hr.style.cssText = 'margin:16px 0;border:1px solid var(--color-button-shadow);';

    var calcTitle = document.createElement('h4');
    calcTitle.style.cssText = 'font-family:var(--font-system);font-size:15px;margin-bottom:12px;';
    calcTitle.textContent = '📏 Stundenrechner (45 min)';

    var calcRow = document.createElement('div');
    calcRow.style.cssText = 'display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;';

    var calcInput = document.createElement('input');
    calcInput.type = 'number';
    calcInput.min = '0';
    calcInput.placeholder = 'Stunden';
    calcInput.style.cssText = 'width:80px;padding:4px 8px;font-family:var(--font-system);font-size:16px;border:2px inset var(--color-button-shadow);background:var(--color-window-bg);text-align:center;';

    var calcLabel = document.createElement('span');
    calcLabel.style.cssText = 'font-family:var(--font-system);font-size:14px;';
    calcLabel.textContent = 'UStd =';

    var calcResult = document.createElement('span');
    calcResult.style.cssText = 'font-family:var(--font-system);font-size:18px;font-weight:bold;min-width:60px;';
    calcResult.textContent = '0 min';

    calcInput.addEventListener('input', function() {
      var val = parseFloat(calcInput.value) || 0;
      calcResult.textContent = (val * 45) + ' min';
    });

    calcRow.appendChild(calcInput);
    calcRow.appendChild(calcLabel);
    calcRow.appendChild(calcResult);

    contentEl.appendChild(timeDisplay);
    contentEl.appendChild(dateDisplay);
    contentEl.appendChild(hr);
    contentEl.appendChild(calcTitle);
    contentEl.appendChild(calcRow);

    var winId = createWindow({
      title: 'Uhrzeit & Stundenrechner',
      icon: 'gear',
      content: contentEl,
      width: 360,
      height: 320
    });

    // Clean up interval when window closes (optional future enhancement)
  }

  function showWissOSFolder() {
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:16px; display:grid; grid-template-columns: repeat(auto-fill, 80px); gap:16px; justify-content: start;';

    var files = [
      { name: 'config-editor.html', icon: 'browser', url: 'editor/config-editor.html' },
      { name: 'config.json', icon: 'document', url: 'config.json' },
      { name: 'config-data.js', icon: 'document', url: 'js/config-data.js' }
    ];

    files.forEach(function(file) {
      var item = document.createElement('div');
      item.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; width:80px; padding:8px;';
      
      var img = document.createElement('img');
      img.src = WissOS.getIconDataUrl(file.icon);
      img.style.width = '32px';
      img.style.height = '32px';
      
      var label = document.createElement('span');
      label.textContent = file.name;
      label.style.cssText = 'font-family:var(--font-system); font-size:11px; text-align:center; word-break: break-word;';

      item.appendChild(img);
      item.appendChild(label);

      item.addEventListener('click', function() {
        if (file.name.endsWith('.html')) {
          WissOS.launchProgram({
            name: file.name,
            osName: file.name,
            icon: file.icon,
            url: file.url,
            openInWindow: true
          });
        } else {
           // Direct link for non-HTML files
           window.open(file.url, '_blank');
        }
      });

      // Hover effect
      item.addEventListener('mouseenter', function() { item.style.backgroundColor = 'var(--color-selection)'; });
      item.addEventListener('mouseleave', function() { item.style.backgroundColor = 'transparent'; });

      contentEl.appendChild(item);
    });

    createWindow({
      title: 'Ordner: WissOS',
      icon: 'folder',
      content: contentEl,
      width: 320,
      height: 240
    });
  }

  function showStrophenEditorFolder() {
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:16px; display:grid; grid-template-columns: repeat(auto-fill, 80px); gap:16px; justify-content: start;';

    var files = [
      { name: 'strophen_editor.html', icon: 'browser', url: 'PROGRAMME/Strophen-Navigator/Editor/strophen_editor.html' },
      { name: 'index_roh.html', icon: 'browser', url: 'PROGRAMME/Strophen-Navigator/Editor/index_roh.html' },
      { name: 'daten.xlsx', icon: 'document', url: 'PROGRAMME/Strophen-Navigator/Editor/774396e9 (1).xlsx' }
    ];

    files.forEach(function(file) {
      var item = document.createElement('div');
      item.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; width:80px; padding:8px;';
      
      var img = document.createElement('img');
      img.src = WissOS.getIconDataUrl(file.icon);
      img.style.width = '32px';
      img.style.height = '32px';
      
      var label = document.createElement('span');
      label.textContent = file.name;
      label.style.cssText = 'font-family:var(--font-system); font-size:11px; text-align:center; word-break: break-word;';

      item.appendChild(img);
      item.appendChild(label);

      item.addEventListener('click', function() {
        if (file.name.endsWith('.html')) {
          WissOS.launchProgram({
            name: file.name,
            osName: file.name,
            icon: file.icon,
            url: file.url,
            openInWindow: true
          });
        } else {
           window.open(file.url, '_blank');
        }
      });

      // Hover effect
      item.addEventListener('mouseenter', function() { item.style.backgroundColor = 'var(--color-selection)'; });
      item.addEventListener('mouseleave', function() { item.style.backgroundColor = 'transparent'; });

      contentEl.appendChild(item);
    });

    createWindow({
      title: 'Ordner: Strophen-Editor',
      icon: 'folder',
      content: contentEl,
      width: 340,
      height: 240
    });
  }

  // Expose module
  WissOS.WindowManager = module;
  WissOS.WindowManager.createWindow = createWindow;
  WissOS.WindowManager.destroyWindow = destroyWindow;
})();
