/**
 * WissualisierungOS – Config-Editor JS (v2)
 * Matches current config.json structure exactly.
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */
(function () {
  'use strict';

  // ===== Available icons (mirrors os-core.js including fullscreen) =====
  var ICON_NAMES = ['typewriter','magnifier','book','speech-bubble','tree','joystick','paintbrush','trash','terminal','help','gear','folder','brain','browser','palette','music','video','notepad','calculator','camera','calendar','mail','clock','document','star','fullscreen','cookie'];

  var config = null;

  // ===== Boot =====
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initImportExport();
    initAddButtons();
    loadDefaultConfig();
  });

  // ===== Tabs =====
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected','true');
        var panel = document.getElementById('tab-' + btn.dataset.tab);
        if (panel) panel.classList.add('active');
        if (btn.dataset.tab === 'desktop') renderDesktopPreview();
      });
    });
  }

  // ===== Import / Export =====
  function initImportExport() {
    var fileInput = document.getElementById('file-input');
    document.getElementById('btn-import').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function (ev) {
        try {
          config = JSON.parse(ev.target.result);
          ensureStructure();
          renderAll();
          setStatus('✅ ' + f.name + ' importiert');
        } catch (err) { alert('Fehler beim Parsen: ' + err.message); }
      };
      r.readAsText(f);
      fileInput.value = '';
    });
    document.getElementById('btn-export').addEventListener('click', exportConfig);
  }

  function exportConfig() {
    if (!config) return;
    collectAll();

    // 1. config.json exportieren
    var json = JSON.stringify(config, null, 2);
    downloadFile('config.json', json, 'application/json');

    // 2. config-data.js exportieren (wird von GitHub Pages / file:// als primäre Quelle geladen)
    //    Dieses Skript setzt window.WissOS._configData VOR os-core.js
    var jsContent = '// Auto-generated config loader for file:// compatibility\n' +
      '// This file is loaded BEFORE os-core.js to provide config data without fetch()\n' +
      'window.WissOS = window.WissOS || {};\n' +
      'window.WissOS._configData = ' + json + ';\n';
    setTimeout(function () {
      downloadFile('config-data.js', jsContent, 'application/javascript');
    }, 500); // Kurze Verzögerung, damit der Browser beide Downloads verarbeitet

    setStatus('💾 config.json + config-data.js exportiert');
  }

  function downloadFile(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ===== Load =====
  function loadDefaultConfig() {
    fetch('../config.json').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      config = JSON.parse(JSON.stringify(data));
      ensureStructure();
      renderAll();
      setStatus('✅ config.json geladen');
    }).catch(function () {
      if (window.WissOS && window.WissOS._configData) {
        config = JSON.parse(JSON.stringify(window.WissOS._configData));
        ensureStructure();
        renderAll();
        setStatus('✅ config.json geladen (eingebettet)');
      } else {
        config = createEmptyConfig();
        renderAll();
        setStatus('⚠️ Keine config.json gefunden – leere Konfiguration');
      }
    });
  }

  /** Ensure all top-level keys exist */
  function ensureStructure() {
    if (!config.os) config.os = {name:'',version:'',license:'',tagline:''};
    if (!config.programs) config.programs = [];
    if (!config.systemPrograms) config.systemPrograms = [];
    if (!config.menu) config.menu = {folders:[],systemEntries:[]};
    if (!config.menu.folders) config.menu.folders = [];
    if (!config.menu.systemEntries) config.menu.systemEntries = [];
    if (!config.tips) config.tips = [];
    if (!config.trashJokes) config.trashJokes = [];
    if (!config.terminal) config.terminal = {prompt:'wissos>',welcomeMessage:'',commands:{}};
    if (!config.terminal.commands) config.terminal.commands = {};
    if (!config.bootMessages) config.bootMessages = [];
    if (!config.bluescreen) config.bluescreen = {title:'',errorCode:'',message:''};
    if (!config.wallpapers) config.wallpapers = [];
    if (!config.screensavers) config.screensavers = [];
    if (!config.settings) config.settings = {};
    if (!config.easterEggs) config.easterEggs = { boot: { enabled: true }, sound: { enabled: true, types: ['startup', 'click', 'error'] }, bluescreen: { enabled: true, probability: 0.005 }, bookworm: { enabled: true, idleSeconds: 60, text: '' } };
    if (!config.easterEggs.boot) config.easterEggs.boot = { enabled: true };
    if (!config.easterEggs.sound) config.easterEggs.sound = { enabled: true, types: ['startup', 'click', 'error'] };
    if (!config.easterEggs.bluescreen) config.easterEggs.bluescreen = { enabled: true, probability: 0.005 };
    if (!config.easterEggs.bookworm) config.easterEggs.bookworm = { enabled: true, idleSeconds: 60, text: '' };
  }

  function createEmptyConfig() {
    return {
      os:{name:'WissualisierungOS',version:'1.0',license:'',tagline:''},
      programs:[], systemPrograms:[],
      menu:{folders:[],systemEntries:[]},
      tips:[], trashJokes:[],
      terminal:{prompt:'wissos>',welcomeMessage:'',commands:{}},
      bootMessages:[],
      bluescreen:{title:'',errorCode:'',message:''},
      wallpapers:[],
      screensavers:[],
      easterEggs: { boot: { enabled: true }, sound: { enabled: true, types: ['startup', 'click', 'error'] }, bluescreen: { enabled: true, probability: 0.005 }, bookworm: { enabled: true, idleSeconds: 60, text: '' } },
      settings:{soundEnabled:false,theme:'retro-classic',wallpaper:'default',bootOnFirstVisit:true,bookwormIdleSeconds:60}
    };
  }

  // ===== Render All =====
  function renderAll() {
    renderPrograms();
    renderSystemPrograms();
    renderMenuFolders();
    renderMenuSystem();
    renderStringList('tips-list', config.tips);
    renderStringList('jokes-list', config.trashJokes);
    renderStringList('boot-list', config.bootMessages);
    renderTerminal();
    renderWallpapers();
    renderScreensavers();
    renderSettings();
    renderEasterEggs();
    updateStatusCount();
  }

  // ===== Programs =====
  function renderPrograms() {
    var list = document.getElementById('programs-list');
    list.innerHTML = '';
    config.programs.forEach(function (p, i) {
      list.appendChild(createProgramCard(p, i, 'program'));
    });
  }

  function renderSystemPrograms() {
    var list = document.getElementById('sysprograms-list');
    list.innerHTML = '';
    config.systemPrograms.forEach(function (p, i) {
      list.appendChild(createProgramCard(p, i, 'system'));
    });
  }

  function createProgramCard(p, idx, type) {
    var card = document.createElement('div');
    card.className = 'editor-card';
    var isSystem = type === 'system';
    var fields = '';

    fields += fg('ID', inp(p.id, 'data-field=id data-type='+type+' data-idx='+idx));
    fields += fg('Name', inp(p.name, 'data-field=name data-type='+type+' data-idx='+idx));

    if (!isSystem) {
      fields += fg('OS-Name', inp(p.osName||'', 'data-field=osName data-type='+type+' data-idx='+idx));
    }

    fields += fg('Beschreibung', inp(p.description||'', 'data-field=description data-type='+type+' data-idx='+idx));
    fields += fg('Icon', sel(ICON_NAMES, p.icon, 'data-field=icon data-type='+type+' data-idx='+idx));

    if (!isSystem) {
      fields += fg('Kategorie', inp(p.category||'', 'data-field=category data-type='+type+' data-idx='+idx));
      fields += fg('URL', inp(p.url||'', 'data-field=url data-type='+type+' data-idx='+idx));
      fields += fg('Fenster', '<label><input type="checkbox"'+(p.openInWindow?' checked':'')+' data-field=openInWindow data-type='+type+' data-idx='+idx+'> In OS-Fenster öffnen</label>');
      fields += fg('Action', inp(p.action||'', 'data-field=action data-type='+type+' data-idx='+idx));
    } else {
      fields += fg('Action', inp(p.action||'', 'data-field=action data-type='+type+' data-idx='+idx));
    }

    fields += fg('Desktop', '<label><input type="checkbox"'+(p.showOnDesktop?' checked':'')+' data-field=showOnDesktop data-type='+type+' data-idx='+idx+'> Anzeigen</label>');
    fields += fg('Col', inp(p.desktopPosition?p.desktopPosition.col:'', 'data-field=col data-type='+type+' data-idx='+idx+' type=number style="width:60px"'));
    fields += fg('Row', inp(p.desktopPosition?p.desktopPosition.row:'', 'data-field=row data-type='+type+' data-idx='+idx+' type=number style="width:60px"'));
    fields += fg('Align', sel(['left','right'], (p.desktopPosition&&p.desktopPosition.align)||'left', 'data-field=align data-type='+type+' data-idx='+idx));

    card.innerHTML =
      '<div class="card-header">' +
        '<span class="card-title"><span class="card-id">'+(isSystem?'SYS':'#'+idx)+'</span> '+esc(p.name||p.id)+'</span>' +
        '<div class="card-actions"><button class="bevel-btn btn-sm btn-danger btn-del" title="Löschen">✕</button></div>' +
      '</div>' +
      '<div class="card-grid">'+fields+'</div>';

    card.querySelector('.btn-del').addEventListener('click', function () {
      if (!confirm('„'+(p.name||p.id)+'" wirklich löschen?')) return;
      if (isSystem) config.systemPrograms.splice(idx,1); else config.programs.splice(idx,1);
      if (isSystem) renderSystemPrograms(); else renderPrograms();
      setStatus('🗑️ Programm gelöscht');
    });

    card.querySelectorAll('[data-field]').forEach(function (el) {
      var evt = (el.type==='checkbox'||el.tagName==='SELECT') ? 'change' : 'input';
      el.addEventListener(evt, function () {
        var arr = el.dataset.type==='system' ? config.systemPrograms : config.programs;
        var obj = arr[parseInt(el.dataset.idx)];
        if (!obj) return;
        var f = el.dataset.field;
        if (f==='showOnDesktop'||f==='openInWindow') { obj[f] = el.checked; }
        else if (f==='col'||f==='row') {
          if (!obj.desktopPosition) obj.desktopPosition={col:0,row:0};
          obj.desktopPosition[f] = parseInt(el.value)||0;
        } else if (f==='align') {
          if (!obj.desktopPosition) obj.desktopPosition={col:0,row:0};
          if (el.value==='right') obj.desktopPosition.align='right';
          else delete obj.desktopPosition.align;
        } else { obj[f] = el.value; }
        var title = card.querySelector('.card-title');
        if (title) title.innerHTML = '<span class="card-id">'+(el.dataset.type==='system'?'SYS':'#'+el.dataset.idx)+'</span> '+esc(obj.name||obj.id);
      });
    });

    return card;
  }

  // ===== Menu Folders =====
  function renderMenuFolders() {
    var list = document.getElementById('menu-folders-list');
    list.innerHTML = '';
    config.menu.folders.forEach(function (folder, i) {
      var card = document.createElement('div');
      card.className = 'editor-card';
      var assigned = (folder.programIds||[]).join(', ');
      card.innerHTML =
        '<div class="card-header">' +
          '<span class="card-title">📁 '+esc(folder.name)+'</span>' +
          '<div class="card-actions"><button class="bevel-btn btn-sm btn-danger btn-del">✕</button></div>' +
        '</div>' +
        '<div class="card-grid">' +
          fg('Name', inp(folder.name, 'data-mf=name data-i='+i)) +
          fg('Icon', sel(ICON_NAMES, folder.icon, 'data-mf=icon data-i='+i)) +
          fg('Programme (IDs, kommagetrennt)', '<textarea class="field" rows="2" data-mf=pids data-i='+i+'>'+esc(assigned)+'</textarea>') +
        '</div>';
      card.querySelector('.btn-del').addEventListener('click', function () {
        config.menu.folders.splice(i,1); renderMenuFolders();
      });
      card.querySelectorAll('[data-mf]').forEach(function (el) {
        el.addEventListener('input', function () {
          var f = config.menu.folders[parseInt(el.dataset.i)];
          if (el.dataset.mf==='pids') f.programIds = el.value.split(',').map(function(s){return s.trim();}).filter(Boolean);
          else f[el.dataset.mf] = el.value;
        });
      });
      list.appendChild(card);
    });
  }

  function renderMenuSystem() {
    var list = document.getElementById('menu-system-list');
    list.innerHTML = '';
    config.menu.systemEntries.forEach(function (entry, i) {
      var item = document.createElement('div');
      item.className = 'editor-card';
      item.innerHTML =
        '<div class="card-header">' +
          '<span class="card-title">⚡ '+esc(entry.name)+'</span>' +
          '<div class="card-actions"><button class="bevel-btn btn-sm btn-danger btn-del">✕</button></div>' +
        '</div>' +
        '<div class="card-grid">' +
          fg('Name', inp(entry.name, 'data-ms=name data-i='+i)) +
          fg('Icon', sel(ICON_NAMES, entry.icon, 'data-ms=icon data-i='+i)) +
          fg('Action', inp(entry.action||'', 'data-ms=action data-i='+i)) +
        '</div>';
      item.querySelector('.btn-del').addEventListener('click', function () {
        config.menu.systemEntries.splice(i,1); renderMenuSystem();
      });
      item.querySelectorAll('[data-ms]').forEach(function (el) {
        el.addEventListener('input', function () {
          config.menu.systemEntries[parseInt(el.dataset.i)][el.dataset.ms] = el.value;
        });
      });
      list.appendChild(item);
    });
  }

  // ===== String Lists =====
  function renderStringList(containerId, arr) {
    var list = document.getElementById(containerId);
    list.innerHTML = '';
    arr.forEach(function (text, i) {
      var item = document.createElement('div');
      item.className = 'string-item';
      item.setAttribute('draggable', 'true');
      item.innerHTML =
        '<span class="drag-handle" title="Ziehen zum Sortieren">⠿</span>' +
        '<textarea rows="1">'+esc(text)+'</textarea>' +
        '<button class="btn-remove" title="Entfernen">✕</button>';
      var ta = item.querySelector('textarea');
      ta.addEventListener('input', function () { arr[i] = ta.value; });
      item.querySelector('.btn-remove').addEventListener('click', function () {
        arr.splice(i,1); renderStringList(containerId, arr);
      });
      item.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain',i); item.style.opacity='0.4'; });
      item.addEventListener('dragend', function () { item.style.opacity='1'; });
      item.addEventListener('dragover', function (e) { e.preventDefault(); item.classList.add('drag-over'); });
      item.addEventListener('dragleave', function () { item.classList.remove('drag-over'); });
      item.addEventListener('drop', function (e) {
        e.preventDefault(); item.classList.remove('drag-over');
        var from = parseInt(e.dataTransfer.getData('text/plain'));
        if (from===i) return;
        var moved = arr.splice(from,1)[0];
        arr.splice(i,0,moved);
        renderStringList(containerId, arr);
      });
      list.appendChild(item);
    });
  }

  // ===== Terminal =====
  function renderTerminal() {
    document.getElementById('term-prompt').value = config.terminal.prompt||'';
    document.getElementById('term-welcome').value = (config.terminal.welcomeMessage||'').replace(/\\n/g,'\n');
    var list = document.getElementById('terminal-cmds');
    list.innerHTML = '';
    var cmds = config.terminal.commands||{};
    Object.keys(cmds).forEach(function (key) {
      var card = document.createElement('div');
      card.className = 'editor-card cmd-card';
      card.innerHTML =
        '<div class="card-header">' +
          '<span class="card-title"><span class="cmd-key">'+esc(key)+'</span></span>' +
          '<div class="card-actions"><button class="bevel-btn btn-sm btn-danger btn-del">✕</button></div>' +
        '</div>' +
        '<div class="card-grid">' +
          fg('Befehl', inp(key, 'data-cmd-key data-old="'+esc(key)+'"')) +
          fg('Antwort', '<textarea class="field" rows="2" data-cmd-val>'+esc(cmds[key])+'</textarea>') +
        '</div>';
      card.querySelector('.btn-del').addEventListener('click', function () {
        delete config.terminal.commands[key]; renderTerminal();
      });
      card.querySelector('[data-cmd-key]').addEventListener('change', function () {
        var nk = this.value.trim(); var old = this.dataset.old;
        if (nk && nk!==old) {
          config.terminal.commands[nk] = config.terminal.commands[old];
          delete config.terminal.commands[old];
          renderTerminal();
        }
      });
      card.querySelector('[data-cmd-val]').addEventListener('input', function () {
        config.terminal.commands[key] = this.value;
      });
      list.appendChild(card);
    });
  }

  // ===== Wallpapers =====
  function renderWallpapers() {
    var list = document.getElementById('wallpapers-list');
    list.innerHTML = '';
    config.wallpapers.forEach(function (wp, i) {
      var card = document.createElement('div');
      card.className = 'editor-card';
      card.innerHTML =
        '<div class="card-header">' +
          '<span class="card-title">🖼️ '+esc(wp.name||wp.id)+'</span>' +
          '<div class="card-actions"><button class="bevel-btn btn-sm btn-danger btn-del">✕</button></div>' +
        '</div>' +
        '<div class="card-grid">' +
          fg('ID', inp(wp.id, 'data-wp=id data-i='+i)) +
          fg('Name', inp(wp.name, 'data-wp=name data-i='+i)) +
          fg('Datei', inp(wp.file, 'data-wp=file data-i='+i)) +
        '</div>';
      card.querySelector('.btn-del').addEventListener('click', function () {
        config.wallpapers.splice(i,1); renderWallpapers();
      });
      card.querySelectorAll('[data-wp]').forEach(function (el) {
        el.addEventListener('input', function () {
          config.wallpapers[parseInt(el.dataset.i)][el.dataset.wp] = el.value;
        });
      });
      list.appendChild(card);
    });
  }

  // ===== Settings =====
  function renderSettings() {
    document.getElementById('os-name').value = config.os.name||'';
    document.getElementById('os-version').value = config.os.version||'';
    document.getElementById('os-tagline').value = config.os.tagline||'';
    document.getElementById('os-license').value = config.os.license||'';
    var s = config.settings||{};
    document.getElementById('set-theme').value = s.theme||'retro-classic';
    document.getElementById('set-wallpaper').value = s.wallpaper||'default';
    document.getElementById('set-sound').checked = !!s.soundEnabled;
    document.getElementById('set-boot').checked = !!s.bootOnFirstVisit;
    document.getElementById('set-idle').value = s.bookwormIdleSeconds||60;
    document.getElementById('bs-title').value = (config.bluescreen||{}).title||'';
    document.getElementById('bs-code').value = (config.bluescreen||{}).errorCode||'';
    document.getElementById('bs-msg').value = ((config.bluescreen||{}).message||'').replace(/\\n/g,'\n');
  }

  // ===== Easter Eggs =====
  function renderEasterEggs() {
    var ee = config.easterEggs || { boot:{}, sound:{}, bluescreen:{}, bookworm:{} };
    document.getElementById('ee-boot-enabled').checked = ee.boot.enabled !== false;
    document.getElementById('ee-sound-enabled').checked = ee.sound.enabled !== false;
    document.getElementById('ee-sound-types').value = (ee.sound.types || ['startup', 'click', 'error']).join(', ');
    document.getElementById('ee-bluescreen-enabled').checked = ee.bluescreen.enabled !== false;
    document.getElementById('ee-bluescreen-prob').value = ee.bluescreen.probability != null ? ee.bluescreen.probability : 0.005;
    document.getElementById('ee-bookworm-enabled').checked = ee.bookworm.enabled !== false;
    document.getElementById('ee-bookworm-idle').value = ee.bookworm.idleSeconds || 60;
    document.getElementById('ee-bookworm-text').value = ee.bookworm.text || '';
  }

  // ===== Collect before export =====
  function collectAll() {
    if (!config.settings) config.settings = {};
    config.settings.theme = document.getElementById('set-theme').value;
    config.settings.wallpaper = document.getElementById('set-wallpaper').value;
    config.settings.soundEnabled = document.getElementById('set-sound').checked;
    config.settings.bootOnFirstVisit = document.getElementById('set-boot').checked;
    config.settings.bookwormIdleSeconds = parseInt(document.getElementById('set-idle').value)||60;
    config.os.name = document.getElementById('os-name').value;
    config.os.version = document.getElementById('os-version').value;
    config.os.tagline = document.getElementById('os-tagline').value;
    config.os.license = document.getElementById('os-license').value;
    if (!config.bluescreen) config.bluescreen = {};
    config.bluescreen.title = document.getElementById('bs-title').value;
    config.bluescreen.errorCode = document.getElementById('bs-code').value;
    config.bluescreen.message = document.getElementById('bs-msg').value;
    
    if (!config.easterEggs) config.easterEggs = { boot:{}, sound:{}, bluescreen:{}, bookworm:{} };
    config.easterEggs.boot.enabled = document.getElementById('ee-boot-enabled').checked;
    config.easterEggs.sound.enabled = document.getElementById('ee-sound-enabled').checked;
    var soundTypes = document.getElementById('ee-sound-types').value;
    config.easterEggs.sound.types = soundTypes ? soundTypes.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
    config.easterEggs.bluescreen.enabled = document.getElementById('ee-bluescreen-enabled').checked;
    var prob = parseFloat(document.getElementById('ee-bluescreen-prob').value);
    config.easterEggs.bluescreen.probability = isNaN(prob) ? 0.005 : prob;
    config.easterEggs.bookworm.enabled = document.getElementById('ee-bookworm-enabled').checked;
    config.easterEggs.bookworm.idleSeconds = parseInt(document.getElementById('ee-bookworm-idle').value) || 60;
    config.easterEggs.bookworm.text = document.getElementById('ee-bookworm-text').value;

    config.terminal.prompt = document.getElementById('term-prompt').value;
    config.terminal.welcomeMessage = document.getElementById('term-welcome').value;
    // Clean up: remove align:"left" (default) from desktopPositions
    (config.programs||[]).concat(config.systemPrograms||[]).forEach(function(p) {
      if (p.desktopPosition && !p.desktopPosition.align) delete p.desktopPosition.align;
      // Remove empty action fields
      if (p.action === '') delete p.action;
      // Remove empty desktopPosition if not on desktop
      if (!p.showOnDesktop && p.desktopPosition && p.desktopPosition.col===0 && p.desktopPosition.row===0) {
        // keep it – user may want to toggle showOnDesktop later
      }
    });
  }

  // ===== Desktop Preview =====
  function renderDesktopPreview() {
    var preview = document.getElementById('desktop-preview');
    preview.innerHTML = '';
    var pw = preview.clientWidth||800;
    var allProgs = (config.programs||[]).concat(config.systemPrograms||[]);
    allProgs.forEach(function (p) {
      if (!p.showOnDesktop || !p.desktopPosition) return;
      var icon = document.createElement('div');
      icon.className = 'preview-icon';
      var col = p.desktopPosition.col||0;
      var row = p.desktopPosition.row||0;
      var isRight = p.desktopPosition.align === 'right';
      if (isRight) {
        icon.style.right = (20 + col * 90) + 'px';
      } else {
        icon.style.left = (20 + col * 90) + 'px';
      }
      icon.style.top = (20 + row * 100) + 'px';
      icon.innerHTML = '<img src="" alt=""><span>'+esc(p.name||p.id)+'</span>';
      var img = icon.querySelector('img');
      img.src = makePreviewIcon(p.icon);
      if (isRight) icon.classList.add('preview-icon-right');
      preview.appendChild(icon);
    });
  }

  function makePreviewIcon(iconName) {
    var colors = {typewriter:'#7DFFC2',magnifier:'#FFE66D',book:'#FF6B9D','speech-bubble':'#7DFFC2',tree:'#7DFFC2',joystick:'#D4D0C8',paintbrush:'#FFE66D',trash:'#D4D0C8',terminal:'#1A1A1A',help:'#FFE66D',gear:'#D4D0C8',folder:'#FFE66D',brain:'#FF6B9D',fullscreen:'#7DFFC2',calculator:'#D4D0C8',mail:'#FAFAF5',cookie:'#D4D0C8'};
    var c = colors[iconName]||'#D4D0C8';
    var svg = '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="32" height="32" rx="2" fill="'+c+'" stroke="#1A1A1A" stroke-width="3"/><text x="20" y="26" text-anchor="middle" font-size="14" font-family="monospace" fill="#1A1A1A">'+(iconName||'?').charAt(0).toUpperCase()+'</text></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  // ===== Add buttons =====
  function initAddButtons() {
    document.getElementById('btn-add-program').addEventListener('click', function () {
      config.programs.push({id:'programm-'+Date.now(),name:'Neues Programm',osName:'',description:'',icon:'gear',category:'',url:'#',openInWindow:true,showOnDesktop:false,desktopPosition:{col:0,row:0}});
      renderPrograms();
      setStatus('＋ Programm hinzugefügt');
    });
    document.getElementById('btn-add-sysprog').addEventListener('click', function () {
      config.systemPrograms.push({id:'sys-'+Date.now(),name:'Neues System-Programm',description:'',icon:'gear',showOnDesktop:false,action:''});
      renderSystemPrograms();
      setStatus('＋ System-Programm hinzugefügt');
    });
    document.getElementById('btn-add-folder').addEventListener('click', function () {
      config.menu.folders.push({name:'Neuer Ordner',icon:'folder',programIds:[]});
      renderMenuFolders();
    });
    document.getElementById('btn-add-sysentry').addEventListener('click', function () {
      config.menu.systemEntries.push({name:'Neuer Eintrag',icon:'help',action:''});
      renderMenuSystem();
    });
    document.getElementById('btn-add-tip').addEventListener('click', function () {
      config.tips.push('Neuer Tipp');
      renderStringList('tips-list', config.tips);
    });
    document.getElementById('btn-add-joke').addEventListener('click', function () {
      config.trashJokes.push('Neuer Witz');
      renderStringList('jokes-list', config.trashJokes);
    });
    document.getElementById('btn-add-boot').addEventListener('click', function () {
      config.bootMessages.push('Neue Boot-Nachricht …');
      renderStringList('boot-list', config.bootMessages);
    });
    document.getElementById('btn-add-cmd').addEventListener('click', function () {
      var key = prompt('Befehlsname:');
      if (!key) return;
      config.terminal.commands[key.trim()] = '';
      renderTerminal();
    });
    document.getElementById('btn-add-wallpaper').addEventListener('click', function () {
      config.wallpapers.push({id:'wp-'+Date.now(),name:'Neues Wallpaper',file:''});
      renderWallpapers();
    });
    document.getElementById('btn-add-screensaver').addEventListener('click', function () {
      config.screensavers.push({id:'ss-'+Date.now(),name:'Neuer Screensaver',type:'iframe',url:'',description:''});
      renderScreensavers();
      setStatus('＋ Screensaver hinzugefügt');
    });
  }

  // ===== Helpers =====
  function esc(s) { var d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
  function inp(val, attrs) { return '<input class="field" value="'+esc(val!=null?val:'')+'" '+(attrs||'')+'>'; }
  function sel(opts, selected, attrs) {
    var h = '<select class="field" '+(attrs||'')+'>';
    opts.forEach(function(o){ h += '<option value="'+o+'"'+(o===selected?' selected':'')+'>'+o+'</option>'; });
    return h + '</select>';
  }
  function fg(label, content) { return '<div class="form-group"><label>'+label+'</label>'+content+'</div>'; }
  function setStatus(msg) { document.getElementById('status-text').textContent = msg; }
  // ===== Screensavers =====
  function renderScreensavers() {
    var list = document.getElementById('screensavers-list');
    list.innerHTML = '';
    config.screensavers.forEach(function (ss, i) {
      var card = document.createElement('div');
      card.className = 'editor-card';
      var typeLabel = ss.type === 'builtin' ? '⚡ Builtin' : '🌐 Iframe';
      card.innerHTML =
        '<div class="card-header">' +
          '<span class="card-title">🖥️ '+esc(ss.name||ss.id)+' <span class="card-id">'+typeLabel+'</span></span>' +
          '<div class="card-actions"><button class="bevel-btn btn-sm btn-danger btn-del">✕</button></div>' +
        '</div>' +
        '<div class="card-grid">' +
          fg('ID', inp(ss.id, 'data-ss=id data-i='+i)) +
          fg('Name', inp(ss.name, 'data-ss=name data-i='+i)) +
          fg('Typ', sel(['builtin','iframe'], ss.type, 'data-ss=type data-i='+i)) +
          fg('URL (nur bei iframe)', inp(ss.url||'', 'data-ss=url data-i='+i)) +
          fg('Beschreibung', inp(ss.description||'', 'data-ss=description data-i='+i)) +
        '</div>';
      card.querySelector('.btn-del').addEventListener('click', function () {
        if (!confirm('Screensaver "'+(ss.name||ss.id)+'" löschen?')) return;
        config.screensavers.splice(i,1); renderScreensavers();
      });
      card.querySelectorAll('[data-ss]').forEach(function (el) {
        var evt = el.tagName==='SELECT' ? 'change' : 'input';
        el.addEventListener(evt, function () {
          config.screensavers[parseInt(el.dataset.i)][el.dataset.ss] = el.value;
        });
      });
      list.appendChild(card);
    });
  }

  function updateStatusCount() {
    var c = config.programs.length;
    var s = config.systemPrograms.length;
    var ss = config.screensavers.length;
    document.getElementById('status-count').textContent = c+' Programme, '+s+' System, '+config.tips.length+' Tipps, '+ss+' Screensaver';
  }
})();
