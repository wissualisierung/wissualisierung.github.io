/**
 * WissOS 2.0 – Window Manager Module
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

(function() {
  'use strict';

  var _config, _bus, _storage;
  var _zCounter = 100;
  var _windowCount = 0;
  var _windows = {};

  var module = {
    init: function(config, bus, storage) {
      _config = config;
      _bus = bus;
      _storage = storage;

      bus.on('window:create', function(opts) {
        createWindow(opts);
      });

      bus.on('system:action', function(data) {
        handleSystemAction(data);
      });

      document.addEventListener('fullscreenchange', function() {
        var label = document.getElementById('menu-fullscreen-label');
        if (label) {
          label.textContent = document.fullscreenElement ? 'Normalbild-OS' : 'Vollbild-OS';
        }
      });
    },

    createWindow: createWindow,

    focusByUrl: function(url) {
      var foundId = null;
      Object.keys(_windows).forEach(function(wid) {
        if (_windows[wid].opts && _windows[wid].opts.url === url) {
          foundId = wid;
        }
      });
      if (foundId) {
        focusWindow(foundId);
        return true;
      }
      return false;
    }
  };

  function createWindow(opts) {
    var id = 'win-' + (++_windowCount);
    var container = document.getElementById('window-container');

    var win = document.createElement('div');
    win.className = 'os-window';
    win.id = id;
    win.style.zIndex = ++_zCounter;
    win.style.width = (opts.width || 480) + 'px';
    win.style.height = (opts.height || 360) + 'px';

    var taskbar = document.getElementById('taskbar');
    var minY = 0;
    if (taskbar) {
      var rect = taskbar.getBoundingClientRect();
      if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
        minY = rect.height || rect.bottom;
      }
    }

    var x = opts.x != null ? opts.x : Math.max(40, Math.random() * (window.innerWidth - (opts.width || 480) - 100) + 40);
    var rangeY = window.innerHeight - (opts.height || 360) - 100 - minY;
    var y = opts.y != null ? opts.y : Math.max(minY + 30, Math.random() * Math.max(10, rangeY) + minY + 30);
    win.style.left = x + 'px';
    win.style.top = y + 'px';

    // Titlebar
    var titlebar = document.createElement('div');
    titlebar.className = 'os-window__titlebar';

    if (opts.icon) {
      var tbIcon = document.createElement('span');
      tbIcon.className = 'os-window__titlebar-icon-wrap';
      tbIcon.innerHTML = WissOS.ICONS[opts.icon] || WissOS.ICONS['help'];
      titlebar.appendChild(tbIcon);
    }

    var titleText = document.createElement('span');
    titleText.className = 'os-window__title';
    titleText.textContent = opts.title || 'Fenster';
    titlebar.appendChild(titleText);

    // Group of buttons
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
    closeBtn.setAttribute('aria-label', 'Schließen');
    closeBtn.addEventListener('click', function() {
      destroyWindow(id);
    });
    btnGroup.appendChild(closeBtn);
    titlebar.appendChild(btnGroup);

    titlebar.addEventListener('dblclick', function(e) {
      if (e.target === titlebar || e.target === titleText) {
        toggleMaximize(id);
      }
    });

    var content = document.createElement('div');
    content.className = 'os-window__content';
    if (typeof opts.content === 'string') {
      content.innerHTML = opts.content;
    } else if (opts.content instanceof HTMLElement) {
      content.appendChild(opts.content);
    }

    win.appendChild(titlebar);
    win.appendChild(content);

    win.classList.add('os-window--opening');
    container.appendChild(win);
    requestAnimationFrame(function() {
      win.classList.remove('os-window--opening');
    });

    win.addEventListener('mousedown', function() {
      focusWindow(id);
    });

    initDrag(win, titlebar);

    _windows[id] = { el: win, opts: opts };
    focusWindow(id);

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
    var maxBtn = win.querySelector('.os-window__btn--maximize');
    
    var taskbar = document.getElementById('taskbar');
    var minY = 0;
    if (taskbar) {
      var rect = taskbar.getBoundingClientRect();
      if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
        minY = rect.height || rect.bottom;
      }
    }

    if (win.classList.contains('maximized')) {
      win.classList.remove('maximized');
      win.style.removeProperty('top');
      win.style.removeProperty('height');
      win.style.left = entry.oldPos.x + 'px';
      win.style.top = entry.oldPos.y + 'px';
      win.style.width = entry.oldSize.w + 'px';
      win.style.height = entry.oldSize.h + 'px';
      if (maxBtn) maxBtn.textContent = '□';
    } else {
      entry.oldPos = { x: win.offsetLeft, y: win.offsetTop };
      entry.oldSize = { w: win.offsetWidth, h: win.offsetHeight };
      win.classList.add('maximized');
      if (minY > 0) {
        win.style.setProperty('top', minY + 'px', 'important');
        win.style.setProperty('height', 'calc(100vh - ' + minY + 'px)', 'important');
      }
      if (maxBtn) maxBtn.textContent = '❐';
    }
  }

  function focusWindow(id) {
    Object.keys(_windows).forEach(function(wid) {
      var w = _windows[wid];
      if (w && w.el) {
        w.el.classList.add('inactive');
      }
    });
    var entry = _windows[id];
    if (!entry) return;
    entry.el.classList.remove('inactive');
    entry.el.style.zIndex = ++_zCounter;
    _bus.emit('window:focused', { id: id, title: entry.opts.title });
  }

  // ===== Window Drag System =====
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
      
      var taskbar = document.getElementById('taskbar');
      var minY = 0;
      if (taskbar) {
        var rect = taskbar.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
          minY = rect.height || rect.bottom;
        }
      }

      var x = e.clientX - offsetX;
      var y = e.clientY - offsetY;

      var maxX = window.innerWidth - 40;
      var maxY = window.innerHeight - 40;
      
      x = Math.max(-win.offsetWidth + 60, Math.min(x, maxX));
      y = Math.max(minY, Math.min(y, maxY));

      win.style.left = x + 'px';
      win.style.top = y + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (dragging) {
        dragging = false;
        titlebar.style.cursor = 'grab';
        
        if (win.classList.contains('maximized')) {
           toggleMaximize(win.id);
        }
      }
    });

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
      
      var taskbar = document.getElementById('taskbar');
      var minY = 0;
      if (taskbar) {
        var rect = taskbar.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
          minY = rect.height || rect.bottom;
        }
      }

      var x = touch.clientX - offsetX;
      var y = touch.clientY - offsetY;

      var maxX = window.innerWidth - 40;
      var maxY = window.innerHeight - 40;

      x = Math.max(-win.offsetWidth + 60, Math.min(x, maxX));
      y = Math.max(minY, Math.min(y, maxY));

      win.style.left = x + 'px';
      win.style.top = y + 'px';
    }, { passive: true });

    document.addEventListener('touchend', function() {
      dragging = false;
    });
  }

  // ===== System Actions Router =====
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
      case 'paed-helper':
        showPaedHelper();
        break;
      case 'clock-click':
        showClockInfo();
        break;
      case 'screensaver':
        break;
      case 'fullscreen':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          showFullscreenWarning();
        }
        break;
      case 'volume-click':
      case 'focus-click':
        break;
      default:
        createWindow({
          title: data.action,
          icon: 'gear',
          content: '<p style="padding:20px;text-align:center;font-weight:bold;">Aktion „' + data.action + '“ wird in Phase 3 bereitgestellt.</p>',
          width: 340,
          height: 180
        });
    }
  }

  function showFullscreenWarning() {
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:20px;display:flex;flex-direction:column;height:100%;';

    contentEl.innerHTML = `
      <div style="font-size:36px;text-align:center;margin-bottom:8px;">🖥️</div>
      <h4 style="font-family:var(--font-system);font-size:16px;text-align:center;margin-bottom:12px;font-weight:900;">Vollbildmodus aktivieren</h4>
      <div style="font-family:var(--font-body);font-size:12px;line-height:1.6;padding:12px;background:var(--color-accent);border:3px solid #000;margin-bottom:16px;font-weight:600;">
        ⚠️ <strong>Hinweis:</strong><br>
        WissOS 2.0 wechselt in das rahmenlose Vollbild.<br><br>
        Sie können den Vollbildmodus jederzeit über folgende Tasten verlassen:<br>
        &nbsp;&nbsp;• <strong>Taste ESC</strong> – Vollbild verlassen<br>
        &nbsp;&nbsp;• <strong>Taste F11</strong> – Umschalten
      </div>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:auto;">
        <button class="os-button" id="btn-fs-ok" style="font-weight:900;">Aktivieren</button>
        <button class="os-button" id="btn-fs-cancel">Abbrechen</button>
      </div>
    `;

    var winId = createWindow({
      title: 'Vollbildmodus',
      icon: 'fullscreen',
      content: contentEl,
      width: 400,
      height: 320
    });

    setTimeout(function() {
      var ok = document.getElementById('btn-fs-ok');
      var cancel = document.getElementById('btn-fs-cancel');
      if (ok) ok.addEventListener('click', function() {
        destroyWindow(winId);
        document.documentElement.requestFullscreen().catch(() => {});
      });
      if (cancel) cancel.addEventListener('click', function() {
        destroyWindow(winId);
      });
    }, 50);
  }

  function showAbout() {
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:20px; font-family:var(--font-mono), monospace; font-size:13px; line-height:1.7; overflow-y:auto; height:100%; color:#000; background:#fdfdfd;';

    contentEl.innerHTML = `
      <div style="text-align:center; color:#777; font-size:11px; margin-bottom:12px;">CC-BY-SA 4.0 Wolf Sebastian (2026)</div>
      <hr style="border:none; border-top:1px solid #ccc; margin-bottom:16px;">
      <h3 style="font-family:var(--font-system), monospace; font-size:18px; font-weight:bold; margin-bottom:8px; margin-top:0; color:#000; text-align:left;">Impressum</h3>
      <hr style="border:none; border-top:1px solid #ccc; margin-bottom:16px;">
      <p style="margin-bottom:16px; font-weight:bold;">Angaben gemäß § 5 DDG</p>
      <p style="margin-bottom:16px;">
        Name: Sebastian Wolf<br>
        Anschrift: Graf-Leopold-Ring 2, 94099 Ruhstorf a.d.Rott, Bayern, Deutschland<br>
        E-Mail: s.w.oer@outlook.de
      </p>
      <p style="margin-bottom:16px; font-weight:bold;">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</p>
      <p style="margin-bottom:16px;">Sebastian Wolf, [Anschrift wie oben]</p>
      <p style="margin-bottom:16px; font-weight:bold;">Haftungsausschluss:</p>
      <p style="margin-bottom:0;">
        Trotz sorgfältiger inhaltlicher Kontrolle übernehme ich keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
      </p>
    `;

    createWindow({
      title: 'Impressum',
      icon: 'brain',
      content: contentEl,
      width: 500,
      height: 520
    });
  }

  function showDatenschutz() {
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:20px; font-family:var(--font-mono), monospace; font-size:13px; line-height:1.7; overflow-y:auto; height:100%; color:#000; background:#fdfdfd;';

    contentEl.innerHTML = `
      <div style="font-size:36px; text-align:center; margin-bottom:12px;">🍪</div>
      <hr style="border:none; border-top:1px solid #ccc; margin-bottom:16px;">
      <h3 style="font-family:var(--font-system), monospace; font-size:16px; font-weight:bold; margin-bottom:8px; margin-top:0; color:#000; text-align:left;">Hinweis zum Datenschutz</h3>
      <hr style="border:none; border-top:1px solid #ccc; margin-bottom:16px;">
      <p style="margin-bottom:16px;">Diese Anwendung speichert ausschließlich technisch notwendige Daten lokal in Ihrem Browser (sog. Local Storage). Diese Daten dienen allein dazu, Ihren Lernfortschritt oder Ihre Einstellungen innerhalb dieser Anwendung zu sichern.</p>
      <p style="margin-bottom:16px;">Es werden keinerlei personenbezogene Daten erhoben, verarbeitet oder an Dritte übermittelt. Es kommen keine Tracking-Cookies, keine Analyse-Tools und keine externen Skripte zum Einsatz.</p>
      <p style="margin-bottom:16px;">Die lokal gespeicherten Daten verlassen Ihr Gerät nicht und sind ausschließlich für Sie in Ihrem Browser sichtbar. Sie können die gespeicherten Daten jederzeit löschen, indem Sie den Browser-Cache bzw. die Website-Daten in Ihren Browsereinstellungen leeren.</p>
      <p style="margin-bottom:0;">Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG (technisch notwendige Speicherung); Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Funktionsfähigkeit der Anwendung).</p>
    `;

    createWindow({
      title: 'Datenschutz',
      icon: 'cookie',
      content: contentEl,
      width: 500,
      height: 480
    });
  }

  function showHelp() {
    var tips = _config.tips || [];
    var randomTip = tips[Math.floor(Math.random() * tips.length)] || 'Didaktische Ziele aktivieren.';

    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:16px;display:flex;flex-direction:column;height:100%;';

    contentEl.innerHTML = `
      <div style="font-size:36px;text-align:center;margin-bottom:8px;">💡</div>
      <h4 style="font-family:var(--font-system);font-size:15px;text-align:center;margin-bottom:8px;font-weight:900;">Didaktischer Impuls</h4>
      <div id="help-tip-box" style="font-family:var(--font-body);font-size:13px;line-height:1.6;padding:12px;background:var(--color-accent);border:3px solid #000;box-shadow:4px 4px 0 #000;margin-bottom:16px;font-weight:600;">
        ${randomTip}
      </div>
      <button class="os-button" id="btn-next-tip" style="margin:auto auto 0 auto;font-weight:900;display:block;">💡 Nächster Tipp</button>
    `;

    createWindow({
      title: 'Systemhilfe & Didaktik',
      icon: 'help',
      content: contentEl,
      width: 400,
      height: 300
    });

    setTimeout(function() {
      var btn = document.getElementById('btn-next-tip');
      var box = document.getElementById('help-tip-box');
      if (btn && box) {
        btn.addEventListener('click', function() {
          WissOS.sound.play('click');
          var t = tips[Math.floor(Math.random() * tips.length)];
          box.textContent = t;
        });
      }
    }, 50);
  }

  function showPaedHelper() {
    var prog = _config.programs.find(p => p.id === 'paed-navigator');
    if (prog) WissOS.launchProgram(prog);
  }

  function showTrash() {
    var jokes = _config.trashJokes || [];
    var randomJoke = jokes[Math.floor(Math.random() * jokes.length)] || 'Papierkorb ist leer.';

    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:16px;display:flex;flex-direction:column;height:100%;';

    contentEl.innerHTML = `
      <div style="font-size:36px;text-align:center;margin-bottom:8px;">🗑️</div>
      <div id="trash-joke-box" style="font-family:var(--font-body);font-size:12px;line-height:1.6;padding:12px;background:#fff0f5;border:3px solid #000;box-shadow:4px 4px 0 #000;margin-bottom:16px;font-weight:600;text-align:center;">
        ${randomJoke}
      </div>
      <button class="os-button" id="btn-next-joke" style="margin:auto auto 0 auto;font-weight:900;display:block;">🎭 Nächster Witz</button>
    `;

    createWindow({
      title: 'Papierkorb',
      icon: 'trash',
      content: contentEl,
      width: 400,
      height: 280
    });

    setTimeout(function() {
      var btn = document.getElementById('btn-next-joke');
      var box = document.getElementById('trash-joke-box');
      if (btn && box) {
        btn.addEventListener('click', function() {
          WissOS.sound.play('click');
          var j = jokes[Math.floor(Math.random() * jokes.length)];
          box.textContent = j;
        });
      }
    }, 50);
  }

  // ===== Interactive Neobrutalist Terminal CLI =====
  function showTerminal() {
    var term = _config.terminal || {};
    var prompt = term.prompt || 'wissos>';

    var contentEl = document.createElement('div');
    contentEl.className = 'terminal-content';
    contentEl.style.cssText = 'background:#111;color:#7DFFC2;font-family:var(--font-mono);font-size:11px;padding:12px;height:100%;display:flex;flex-direction:column;';

    var output = document.createElement('div');
    output.className = 'terminal-output';
    output.style.cssText = 'flex:1;overflow-y:auto;white-space:pre-wrap;margin-bottom:8px;line-height:1.4;';
    output.textContent = term.welcomeMessage || '';

    var inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;align-items:center;background:#222;padding:4px 8px;border:2px solid #7DFFC2;';

    var promptLabel = document.createElement('span');
    promptLabel.style.cssText = 'font-weight:bold;margin-right:8px;color:#FF6B9D;';
    promptLabel.textContent = prompt;

    var input = document.createElement('input');
    input.type = 'text';
    input.style.cssText = 'flex:1;background:transparent;border:none;outline:none;color:#7DFFC2;font-family:var(--font-mono);font-size:11px;';
    input.setAttribute('aria-label', 'Kommandozeileneingabe');
    input.autocomplete = 'off';
    input.spellcheck = false;

    inputRow.appendChild(promptLabel);
    inputRow.appendChild(input);
    contentEl.appendChild(output);
    contentEl.appendChild(inputRow);

    var winId = createWindow({
      title: 'Terminal / CLI',
      icon: 'terminal',
      content: contentEl,
      width: 520,
      height: 350
    });

    setTimeout(() => input.focus(), 100);

    var history = [];
    var historyIndex = -1;

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var rawInput = input.value;
        var cmdLine = rawInput.trim();
        var parts = cmdLine.split(' ');
        var cmd = parts[0].toLowerCase();
        var arg = parts[1];

        output.textContent += '\n' + prompt + ' ' + rawInput + '\n';
        history.unshift(rawInput);
        historyIndex = -1;
        input.value = '';

        if (cmd === 'clear') {
          output.textContent = '';
        } else if (cmd === 'hilfe') {
          output.textContent += term.commands.hilfe + '\n';
        } else if (cmd === 'version') {
          output.textContent += term.commands.version + '\n';
        } else if (cmd === 'credits') {
          output.textContent += term.commands.credits + '\n';
        } else if (cmd === 'witz') {
          var jokes = _config.trashJokes || [];
          output.textContent += (jokes[Math.floor(Math.random() * jokes.length)] || 'Kein Witz.') + '\n';
        } else if (cmd === 'tipp') {
          var tips = _config.tips || [];
          output.textContent += (tips[Math.floor(Math.random() * tips.length)] || 'Kein Tipp.') + '\n';
        } else if (cmd === 'theme') {
          if (arg) {
            if (WissOS.theme.set(arg.toLowerCase())) {
              output.textContent += 'System-Theme geändert zu: ' + arg + '\n';
            } else {
              output.textContent += 'Fehler: Theme "' + arg + '" ist ungültig.\nVerfügbar: ' + WissOS.theme.available.join(', ') + '\n';
            }
          } else {
            output.textContent += 'Aktuelles Theme: ' + WissOS.theme.current() + '\nVerfügbare Themes: ' + WissOS.theme.available.join(', ') + '\n';
          }
        } else if (cmd === 'hintergrund') {
          output.textContent += 'Wallpaper-Picker geöffnet.\n';
          WissOS.wallpaper.showPicker();
        } else if (cmd === 'reset') {
          output.textContent += 'System wird auf Werkseinstellungen zurückgesetzt ...\n';
          localStorage.clear();
          setTimeout(() => location.reload(), 800);
        } else if (cmd === 'kaffee' || cmd === 'coffee') {
          output.textContent += 'Screensaver gestartet.\n';
          _bus.emit('system:action', { action: 'screensaver' });
        } else if (cmd === 'bluescreen') {
          output.textContent += 'SYSTEMFEHLER wird simuliert ...\n';
          _bus.emit('easteregg:bluescreen');
        } else if (cmd === 'exit') {
          destroyWindow(winId);
        } else if (cmd !== '') {
          output.textContent += `Unbekannter Befehl: '${cmd}'. Tippen Sie 'hilfe' für Steuerungsbefehle.\n`;
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
  }

  // ===== Hourly retro calculator =====
  function showClockInfo() {
    var now = new Date();
    var timeStr = now.toLocaleTimeString('de-DE');
    var dateStr = now.toLocaleDateString('de-DE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:16px;text-align:center;display:flex;flex-direction:column;height:100%;';

    contentEl.innerHTML = `
      <div id="clock-live-time" style="font-size:32px;font-family:var(--font-system);font-weight:900;margin-bottom:4px;">${timeStr}</div>
      <div style="font-size:12px;color:#555;font-weight:bold;margin-bottom:12px;">${dateStr}</div>
      <hr style="margin:8px 0;border:2px solid #000;">
      <h4 style="font-family:var(--font-system);font-size:14px;margin-bottom:8px;font-weight:900;">📏 Unterrichtsstunden-Rechner</h4>
      <p style="font-size:11px;font-weight:bold;margin-bottom:8px;color:#333;">Konvertiert Schulstunden (45 Min) in Echtzeit-Minuten:</p>
      <div style="display:flex;gap:8px;align-items:center;justify-content:center;background:var(--color-bg);padding:10px;border:3px solid #000;box-shadow:3px 3px 0 #000;">
        <input type="number" id="calc-ustd-input" min="0" placeholder="Std" style="width:70px;padding:4px;font-family:var(--font-system);font-size:14px;border:3px solid #000;text-align:center;font-weight:900;">
        <span style="font-family:var(--font-system);font-size:13px;font-weight:900;">UStd =</span>
        <span id="calc-ustd-result" style="font-family:var(--font-system);font-size:15px;font-weight:900;color:#000;">0 Minuten</span>
      </div>
    `;

    var winId = createWindow({
      title: 'Uhrzeit & Stundenrechner',
      icon: 'gear',
      content: contentEl,
      width: 350,
      height: 290
    });

    var timer = setInterval(function() {
      var live = document.getElementById('clock-live-time');
      if (live) {
        live.textContent = new Date().toLocaleTimeString('de-DE');
      } else {
        clearInterval(timer);
      }
    }, 1000);

    setTimeout(function() {
      var input = document.getElementById('calc-ustd-input');
      var result = document.getElementById('calc-ustd-result');
      if (input && result) {
        input.addEventListener('input', function() {
          var val = parseFloat(input.value) || 0;
          result.textContent = (val * 45) + ' Minuten';
        });
      }
    }, 50);
  }

  // ===== WissOS folders =====
  function showWissOSFolder() {
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:16px; display:grid; grid-template-columns: repeat(auto-fill, 82px); gap:12px; justify-content: start;';

    var files = [
      { name: 'config-editor.html', icon: 'browser', url: 'editor/config-editor.html' },
      { name: 'config.json', icon: 'document', url: '../config.json' },
      { name: 'config-data.js', icon: 'document', url: 'js/config-data.js' }
    ];

    files.forEach(function(file) {
      var item = document.createElement('div');
      item.className = 'desktop-icon';
      item.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; width:80px; padding:6px; border:2px solid transparent;';
      
      var img = document.createElement('div');
      img.style.width = '32px';
      img.style.height = '32px';
      img.innerHTML = WissOS.ICONS[file.icon] || WissOS.ICONS['help'];
      
      var label = document.createElement('span');
      label.textContent = file.name;
      label.style.cssText = 'font-family:var(--font-system); font-size:10px; font-weight:bold; text-align:center; word-break: break-word; color:#000;';

      item.appendChild(img);
      item.appendChild(label);

      item.addEventListener('click', function() {
        WissOS.sound.play('click');
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

      item.addEventListener('mouseenter', function() {
        item.style.borderColor = '#000';
        item.style.backgroundColor = 'var(--color-selection)';
      });
      item.addEventListener('mouseleave', function() {
        item.style.borderColor = 'transparent';
        item.style.backgroundColor = 'transparent';
      });

      contentEl.appendChild(item);
    });

    createWindow({
      title: 'Ordner: System-Config',
      icon: 'folder',
      content: contentEl,
      width: 320,
      height: 220
    });
  }

  WissOS.WindowManager = module;
})();
