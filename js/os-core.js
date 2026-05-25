/**
 * WissOS 2.0 – Core Module & Unified Communication Bridge
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

window.WissOS = window.WissOS || {};

// ===== Decoupled Event Bus (Pub/Sub Pattern) =====
(function () {
  const listeners = {};

  WissOS.bus = {
    on(event, callback) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    off(event, callback) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    },
    emit(event, data) {
      if (!listeners[event]) return;
      listeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(`Event '${event}' error:`, e); }
      });
    }
  };
})();

// ===== Storage Wrapper (Persistent State Cache) =====
(function () {
  const PREFIX = 'wissos2_';

  WissOS.storage = {
    get(key, fallback) {
      if (fallback === undefined) fallback = null;
      try {
        const val = localStorage.getItem(PREFIX + key);
        return val !== null ? JSON.parse(val) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch { /* storage quota exceeded */ }
    },
    remove(key) {
      localStorage.removeItem(PREFIX + key);
    }
  };
})();

// ===== Handcrafted Vector Icon Library =====
WissOS.ICONS = {
  typewriter: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="32" height="8" fill="#7DFFC2" stroke="#000" stroke-width="3"/>
    <rect x="4" y="20" width="40" height="20" fill="#EAE6FF" stroke="#000" stroke-width="3"/>
    <rect x="12" y="14" width="24" height="4" fill="#FFF"/>
    <rect x="10" y="26" width="4" height="4" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="16" y="26" width="4" height="4" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="22" y="26" width="4" height="4" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="28" y="26" width="4" height="4" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="34" y="26" width="4" height="4" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="12" y="32" width="4" height="4" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="18" y="32" width="12" height="4" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="32" y="32" width="4" height="4" fill="#FFF" stroke="#000" stroke-width="1.5"/>
  </svg>`,

  magnifier: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" fill="#FFE66D" stroke="#000" stroke-width="3"/>
    <circle cx="20" cy="20" r="6" fill="#FFF" stroke="#000" stroke-width="2"/>
    <line x1="29" y1="29" x2="40" y2="40" stroke="#000" stroke-width="4" stroke-linecap="round"/>
    <rect x="36" y="34" width="8" height="6" fill="#EAE6FF" stroke="#000" stroke-width="2.5" transform="rotate(45 36 34)"/>
  </svg>`,

  book: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="6" width="32" height="36" fill="#FF6B9D" stroke="#000" stroke-width="3"/>
    <rect x="12" y="6" width="28" height="36" fill="#FFF" stroke="#000" stroke-width="3"/>
    <line x1="16" y1="14" x2="36" y2="14" stroke="#000" stroke-width="2"/>
    <line x1="16" y1="20" x2="32" y2="20" stroke="#000" stroke-width="2"/>
    <line x1="16" y1="26" x2="34" y2="26" stroke="#000" stroke-width="2"/>
    <line x1="16" y1="32" x2="28" y2="32" stroke="#000" stroke-width="2"/>
    <rect x="8" y="6" width="4" height="36" fill="#FF6B9D" stroke="#000" stroke-width="2.5"/>
  </svg>`,

  'speech-bubble': `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="40" height="28" fill="#7DFFC2" stroke="#000" stroke-width="3"/>
    <polygon points="12,34 20,34 16,42" fill="#7DFFC2" stroke="#000" stroke-width="3"/>
    <line x1="12" y1="14" x2="36" y2="14" stroke="#000" stroke-width="2"/>
    <line x1="12" y1="20" x2="30" y2="20" stroke="#000" stroke-width="2"/>
    <line x1="12" y1="26" x2="24" y2="26" stroke="#000" stroke-width="2"/>
  </svg>`,

  tree: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="32" width="8" height="12" fill="#FFE66D" stroke="#000" stroke-width="3"/>
    <polygon points="24,4 6,32 42,32" fill="#7DFFC2" stroke="#000" stroke-width="3"/>
    <polygon points="24,12 10,32 38,32" fill="#56d4a0" stroke="#000" stroke-width="2"/>
  </svg>`,

  joystick: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="30" width="32" height="12" fill="#EAE6FF" stroke="#000" stroke-width="3"/>
    <rect x="20" y="12" width="8" height="18" fill="#000" stroke="#000" stroke-width="2"/>
    <circle cx="24" cy="10" r="6" fill="#FF6B9D" stroke="#000" stroke-width="3"/>
    <circle cx="14" cy="36" r="3" fill="#FFE66D" stroke="#000" stroke-width="2"/>
    <circle cx="34" cy="36" r="3" fill="#7DFFC2" stroke="#000" stroke-width="2"/>
  </svg>`,

  paintbrush: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="28" width="8" height="16" fill="#EAE6FF" stroke="#000" stroke-width="3"/>
    <polygon points="16,28 24,4 32,28" fill="#FFE66D" stroke="#000" stroke-width="3"/>
    <rect x="18" y="26" width="12" height="4" fill="#7DFFC2" stroke="#000" stroke-width="2.5"/>
    <line x1="24" y1="10" x2="24" y2="24" stroke="#FF6B9D" stroke-width="2"/>
  </svg>`,

  trash: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="14" width="24" height="28" fill="#EAE6FF" stroke="#000" stroke-width="3"/>
    <rect x="8" y="10" width="32" height="6" fill="#FF6B9D" stroke="#000" stroke-width="3"/>
    <rect x="18" y="6" width="12" height="6" fill="#EAE6FF" stroke="#000" stroke-width="3"/>
    <line x1="20" y1="20" x2="20" y2="36" stroke="#000" stroke-width="2"/>
    <line x1="24" y1="20" x2="24" y2="36" stroke="#000" stroke-width="2"/>
    <line x1="28" y1="20" x2="28" y2="36" stroke="#000" stroke-width="2"/>
  </svg>`,

  terminal: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="40" height="32" fill="#000" stroke="#000" stroke-width="3"/>
    <rect x="6" y="10" width="36" height="28" fill="#111"/>
    <polyline points="10,20 16,24 10,28" fill="none" stroke="#7DFFC2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="18" y1="28" x2="30" y2="28" stroke="#7DFFC2" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  help: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="#FFE66D" stroke="#000" stroke-width="3"/>
    <text x="24" y="32" fill="#000" font-family="monospace" font-size="24" font-weight="bold" text-anchor="middle">?</text>
  </svg>`,

  gear: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="8" fill="#EAE6FF" stroke="#000" stroke-width="3"/>
    <circle cx="24" cy="24" r="4" fill="#FFF" stroke="#000" stroke-width="2"/>
    <rect x="22" y="2" width="4" height="8" fill="#EAE6FF" stroke="#000" stroke-width="2"/>
    <rect x="22" y="38" width="4" height="8" fill="#EAE6FF" stroke="#000" stroke-width="2"/>
    <rect x="2" y="22" width="8" height="4" fill="#EAE6FF" stroke="#000" stroke-width="2"/>
    <rect x="38" y="22" width="8" height="4" fill="#EAE6FF" stroke="#000" stroke-width="2"/>
  </svg>`,

  folder: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12 L4 40 L44 40 L44 16 L22 16 L18 12 Z" fill="#FFE66D" stroke="#000" stroke-width="3"/>
    <rect x="4" y="16" width="40" height="24" fill="#FFE66D" stroke="#000" stroke-width="2" opacity="0.6"/>
  </svg>`,

  brain: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="18" r="10" fill="#FF6B9D" stroke="#000" stroke-width="3"/>
    <circle cx="30" cy="18" r="10" fill="#FF6B9D" stroke="#000" stroke-width="3"/>
    <circle cx="18" cy="28" r="8" fill="#FF6B9D" stroke="#000" stroke-width="3"/>
    <circle cx="30" cy="28" r="8" fill="#FF6B9D" stroke="#000" stroke-width="3"/>
    <line x1="24" y1="10" x2="24" y2="38" stroke="#000" stroke-width="2"/>
  </svg>`,

  browser: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="#7DFFC2" stroke="#000" stroke-width="3"/>
    <ellipse cx="24" cy="24" rx="8" ry="18" fill="none" stroke="#000" stroke-width="2"/>
    <line x1="6" y1="24" x2="42" y2="24" stroke="#000" stroke-width="2"/>
  </svg>`,

  music: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="6" width="32" height="36" fill="#B967FF" stroke="#000" stroke-width="3"/>
    <circle cx="18" cy="30" r="5" fill="#FFF" stroke="#000" stroke-width="2.5"/>
    <circle cx="34" cy="26" r="5" fill="#FFF" stroke="#000" stroke-width="2.5"/>
    <line x1="23" y1="30" x2="23" y2="12" stroke="#000" stroke-width="3.5"/>
    <line x1="39" y1="26" x2="39" y2="8" stroke="#000" stroke-width="3.5"/>
    <line x1="23" y1="12" x2="39" y2="8" stroke="#000" stroke-width="3"/>
  </svg>`,

  notepad: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="4" width="32" height="40" fill="#FFF" stroke="#000" stroke-width="3"/>
    <rect x="8" y="4" width="32" height="8" fill="#FFE66D" stroke="#000" stroke-width="2.5"/>
    <line x1="14" y1="18" x2="34" y2="18" stroke="#000" stroke-width="2"/>
    <line x1="14" y1="24" x2="34" y2="24" stroke="#000" stroke-width="2"/>
    <line x1="14" y1="30" x2="30" y2="30" stroke="#000" stroke-width="2"/>
    <circle cx="11" cy="8" r="2" fill="#000"/>
    <circle cx="24" cy="8" r="2" fill="#000"/>
    <circle cx="37" cy="8" r="2" fill="#000"/>
  </svg>`,

  calculator: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="4" width="28" height="40" fill="#EAE6FF" stroke="#000" stroke-width="3"/>
    <rect x="14" y="8" width="20" height="10" fill="#7DFFC2" stroke="#000" stroke-width="2.5"/>
    <rect x="14" y="22" width="6" height="6" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="22" y="22" width="6" height="6" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="30" y="22" width="6" height="6" fill="#FFE66D" stroke="#000" stroke-width="1.5"/>
    <rect x="14" y="30" width="6" height="6" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="22" y="30" width="6" height="6" fill="#FFF" stroke="#000" stroke-width="1.5"/>
    <rect x="30" y="30" width="6" height="6" fill="#FF6B9D" stroke="#000" stroke-width="1.5"/>
  </svg>`,

  mail: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="40" height="28" fill="#FFF" stroke="#000" stroke-width="3"/>
    <polyline points="4,10 24,28 44,10" fill="none" stroke="#000" stroke-width="3"/>
    <line x1="4" y1="38" x2="18" y2="24" stroke="#000" stroke-width="2"/>
    <line x1="44" y1="38" x2="30" y2="24" stroke="#000" stroke-width="2"/>
  </svg>`,

  clock: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="#FFF" stroke="#000" stroke-width="3"/>
    <line x1="24" y1="24" x2="24" y2="12" stroke="#000" stroke-width="3" stroke-linecap="round"/>
    <line x1="24" y1="24" x2="34" y2="24" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="24" cy="24" r="2" fill="#FF6B9D"/>
  </svg>`,

  document: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,4 32,4 38,10 38,44 10,44" fill="#FFF" stroke="#000" stroke-width="3"/>
    <polygon points="32,4 32,10 38,10" fill="#EAE6FF" stroke="#000" stroke-width="2"/>
    <line x1="16" y1="18" x2="32" y2="18" stroke="#000" stroke-width="2"/>
    <line x1="16" y1="24" x2="32" y2="24" stroke="#000" stroke-width="2"/>
    <line x1="16" y1="30" x2="28" y2="30" stroke="#000" stroke-width="2"/>
  </svg>`,

  fullscreen: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" fill="#EAE6FF" stroke="#000" stroke-width="3"/>
    <rect x="8" y="8" width="32" height="32" fill="#FFF" stroke="#000" stroke-width="2.5"/>
    <polyline points="10,18 10,10 18,10" fill="none" stroke="#7DFFC2" stroke-width="3.5" stroke-linecap="round"/>
    <polyline points="30,10 38,10 38,18" fill="none" stroke="#7DFFC2" stroke-width="3.5" stroke-linecap="round"/>
    <polyline points="38,30 38,38 30,38" fill="none" stroke="#7DFFC2" stroke-width="3.5" stroke-linecap="round"/>
    <polyline points="18,38 10,38 10,30" fill="none" stroke="#7DFFC2" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,

  cookie: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="#FFE66D" stroke="#000" stroke-width="3"/>
    <circle cx="16" cy="18" r="2.5" fill="#000"/>
    <circle cx="28" cy="14" r="3" fill="#000"/>
    <circle cx="32" cy="26" r="2" fill="#000"/>
    <circle cx="20" cy="32" r="3" fill="#000"/>
  </svg>`,

  qr: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="36" height="36" fill="#FFF" stroke="#000" stroke-width="3"/>
    <!-- Position Detection Patterns -->
    <rect x="10" y="10" width="10" height="10" fill="#FFF" stroke="#000" stroke-width="2"/>
    <rect x="13" y="13" width="4" height="4" fill="#FF6B9D"/>
    <rect x="28" y="10" width="10" height="10" fill="#FFF" stroke="#000" stroke-width="2"/>
    <rect x="31" y="13" width="4" height="4" fill="#7DFFC2"/>
    <rect x="10" y="28" width="10" height="10" fill="#FFF" stroke="#000" stroke-width="2"/>
    <rect x="13" y="31" width="4" height="4" fill="#FFE66D"/>
    <!-- Random QR code bits / pixels -->
    <rect x="24" y="24" width="4" height="4" fill="#000"/>
    <rect x="28" y="28" width="4" height="4" fill="#000"/>
    <rect x="36" y="28" width="4" height="4" fill="#000"/>
    <rect x="32" y="32" width="4" height="4" fill="#000"/>
    <rect x="28" y="36" width="4" height="4" fill="#000"/>
    <rect x="24" y="20" width="4" height="4" fill="#000"/>
    <rect x="20" y="24" width="4" height="4" fill="#000"/>
  </svg>`
};

WissOS.getIconDataUrl = function (iconName) {
  const svg = WissOS.ICONS[iconName] || WissOS.ICONS['help'];
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

// ===== Floating Toast Notification System =====
WissOS.notify = function (text, title) {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:12px;width:320px;pointer-events:none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = 'background:var(--color-accent);color:#000;border:4px solid #000;box-shadow:6px 6px 0 #000;padding:14px 18px;pointer-events:auto;transform:translateX(380px);transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);position:relative;margin-bottom:8px;';
  
  const close = document.createElement('button');
  close.textContent = '×';
  close.style.cssText = 'position:absolute;top:4px;right:8px;background:none;border:none;font-weight:bold;cursor:pointer;font-size:20px;color:#000;';
  close.addEventListener('click', function() {
    toast.style.transform = 'translateX(380px)';
    setTimeout(() => toast.remove(), 400);
  });

  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-family:var(--font-system);font-weight:900;font-size:13px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;';
  titleEl.textContent = title || 'Mitteilung';

  const textEl = document.createElement('div');
  textEl.style.cssText = 'font-family:var(--font-body);font-size:12px;line-height:1.4;font-weight:500;';
  textEl.textContent = text;

  toast.appendChild(close);
  toast.appendChild(titleEl);
  toast.appendChild(textEl);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transform = 'translateX(380px)';
      setTimeout(() => toast.remove(), 400);
    }
  }, 5000);
};

// ===== Dynamic Program Launcher =====
WissOS.launchProgram = function (prog) {
  if (!prog) return;

  // Handle special internal action strings
  if (prog.url && prog.url.startsWith('#')) {
    const action = prog.url.substring(1);
    WissOS.bus.emit('system:action', { action: action, program: prog });
    return;
  }

  if (!prog.url) return;

  // If already open, raise window to front
  if (WissOS.WindowManager && WissOS.WindowManager.focusByUrl) {
    if (WissOS.WindowManager.focusByUrl(prog.url)) return;
  }

  if (prog.openInWindow) {
    WissOS.WindowManager.createWindow({
      title: prog.osName || prog.name,
      icon: prog.icon,
      content: `<iframe src="${prog.url}" style="width:100%;height:100%;border:none;background:#fff;" title="${prog.name}"></iframe>`,
      width: prog.width || 920,
      height: prog.height || 680,
      url: prog.url
    });
  } else {
    WissOS.showLoadingBar(prog.osName || prog.name, function () {
      window.open(prog.url, '_blank');
    });
  }
};

// ===== Loading Progress UI Bar =====
WissOS.showLoadingBar = function (label, callback) {
  var bar = document.getElementById('loading-bar');
  if (!bar) { if (callback) callback(); return; }

  var labelEl = bar.querySelector('.loading-bar__label');
  var fill = bar.querySelector('.loading-bar__fill');

  if (labelEl) labelEl.textContent = label + ' wird geladen …';
  if (fill) {
    fill.style.animation = 'none';
    fill.offsetHeight; // force reflow
    fill.style.animation = 'loading-fill 1.0s cubic-bezier(0.1, 0.8, 0.2, 1) forwards';
  }

  bar.style.display = 'block';
  bar.setAttribute('aria-hidden', 'false');

  setTimeout(function () {
    bar.style.display = 'none';
    bar.setAttribute('aria-hidden', 'true');
    if (callback) callback();
  }, 1100);
};

// ===== Systems Sound Manager (Synthesized retro audio) =====
(function () {
  var _muted = true;
  var _globallyDisabled = false;
  var _enabledSounds = ['startup', 'click', 'error'];
  var _ctx = null;

  function getAudioContext() {
    if (!_ctx) {
      try {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (_ctx && _ctx.state === 'suspended') {
      _ctx.resume();
    }
    return _ctx;
  }

  WissOS.sound = {
    applyConfig: function (config) {
      var ee = (config || {}).easterEggs || {};
      var sndConfig = ee.sound || {};
      if (sndConfig.enabled === false) {
        _globallyDisabled = true;
        return;
      }
      _globallyDisabled = false;
      if (Array.isArray(sndConfig.types) && sndConfig.types.length > 0) {
        _enabledSounds = sndConfig.types;
      }
    },

    play: function (name) {
      if (_muted || _globallyDisabled) return;
      if (_enabledSounds.indexOf(name) === -1) return;

      var ctx = getAudioContext();
      if (!ctx) return;

      try {
        var t = ctx.currentTime;

        if (name === 'startup') {
          // Double retro synthesized chime
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, t);
          gain.gain.setValueAtTime(0.04, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          osc.start(t);
          osc.stop(t + 0.15);

          var osc2 = ctx.createOscillator();
          var gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(1320, t + 0.12);
          gain2.gain.setValueAtTime(0, t);
          gain2.gain.setValueAtTime(0.04, t + 0.12);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc2.start(t + 0.12);
          osc2.stop(t + 0.35);

        } else if (name === 'error') {
          // Low-pitch hazard alert
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.linearRampToValueAtTime(120, t + 0.3);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);

        } else {
          // Crisp click
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1600, t);
          gain.gain.setValueAtTime(0.02, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
          osc.start(t);
          osc.stop(t + 0.02);
        }
      } catch {}
    },

    isMuted: function () { return _muted; },
    isDisabled: function () { return _globallyDisabled; },
    getContext: getAudioContext,
    setMuted: function (val) {
      _muted = val;
      WissOS.storage.set('soundMuted', _muted);
      var icon = document.getElementById('volume-icon');
      if (icon) icon.textContent = (_muted || _globallyDisabled) ? '🔇' : '🔊';

      // Broadcast new volume state to all active iframes
      var iframes = document.querySelectorAll('iframe');
      for (var i = 0; i < iframes.length; i++) {
        iframes[i].contentWindow.postMessage({
          type: 'VOLUME_CHANGED',
          muted: _muted
        }, '*');
      }
    },
    toggle: function () {
      var wasMuted = _muted;
      WissOS.sound.setMuted(!_muted);
      if (wasMuted && !_muted) {
        WissOS.sound.play('startup');
      }
    }
  };

  var saved = WissOS.storage.get('soundMuted', true);
  _muted = saved;
})();

// ===== Unified Theme Manager (Class-based propagation) =====
WissOS.theme = {
  available: ['retro-classic', 'vaporwave', 'schreibstube', 'pommes', 'neo-dark'],

  set: function (themeName) {
    if (WissOS.theme.available.indexOf(themeName) === -1) return false;

    // 1. Maintain link element for legacy compatibility
    var link = document.getElementById('theme-stylesheet');
    if (link) {
      link.href = 'css/themes/' + themeName + '.css';
    }

    // 2. Class names on root/body for modern instant token theme switching
    var themeClass = 'theme-' + themeName;
    document.documentElement.className = '';
    document.body.className = '';
    document.documentElement.classList.add(themeClass);
    document.body.classList.add(themeClass);

    WissOS.storage.set('theme', themeName);

    // 3. Broadcast new theme to all loaded didactical apps inside iframes
    var iframes = document.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
      iframes[i].contentWindow.postMessage({
        type: 'THEME_CHANGED',
        theme: themeName
      }, '*');
    }

    WissOS.bus.emit('theme:changed', themeName);
    return true;
  },

  restore: function () {
    var saved = WissOS.storage.get('theme', 'retro-classic');
    WissOS.theme.set(saved);
  },

  current: function () {
    return WissOS.storage.get('theme', 'retro-classic');
  }
};

// ===== Wallpaper Manager =====
WissOS.wallpaper = {
  set: function (wallpaperId) {
    var desktop = document.getElementById('desktop');
    if (!desktop) return;

    var wallpapers = (WissOS.config || {}).wallpapers || [];
    var wp = null;
    for (var i = 0; i < wallpapers.length; i++) {
      if (wallpapers[i].id === wallpaperId) { wp = wallpapers[i]; break; }
    }

    if (wp && wp.file) {
      desktop.style.backgroundImage = 'url(../assets/wallpapers/' + wp.file + ')';
      desktop.style.backgroundSize = 'cover';
      desktop.style.backgroundPosition = 'center';
    } else {
      desktop.style.backgroundImage = '';
      desktop.style.backgroundSize = '';
      desktop.style.backgroundPosition = '';
    }

    WissOS.storage.set('wallpaper', wallpaperId);
  },

  restore: function () {
    var saved = WissOS.storage.get('wallpaper', null);
    if (saved) WissOS.wallpaper.set(saved);
  },

  showPicker: function () {
    var wallpapers = (WissOS.config || {}).wallpapers || [];
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:16px;';

    var heading = document.createElement('h4');
    heading.style.cssText = 'font-family:var(--font-system);margin-bottom:12px;font-weight:900;';
    heading.textContent = '🖼️ Hintergrundbild wählen';
    contentEl.appendChild(heading);

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:12px;';

    var defaultItem = createWallpaperItem('default', 'Punktraster', null);
    grid.appendChild(defaultItem);

    wallpapers.forEach(function (wp) {
      if (wp.id === 'default') return;
      var item = createWallpaperItem(wp.id, wp.name, wp.file);
      grid.appendChild(item);
    });

    contentEl.appendChild(grid);

    WissOS.WindowManager.createWindow({
      title: 'Hintergrund ändern',
      icon: 'paintbrush',
      content: contentEl,
      width: 360,
      height: 260
    });
  }
};

function createWallpaperItem(id, name, file) {
  var item = document.createElement('div');
  item.style.cssText = 'border:4px solid #000;box-shadow:3px 3px 0 #000;cursor:pointer;text-align:center;transition:transform 0.1s;background:#fff;';

  var preview = document.createElement('div');
  preview.style.cssText = 'width:100%;height:50px;background:var(--color-bg);border-bottom:3px solid #000;';
  if (file) {
    preview.style.backgroundImage = 'url(../assets/wallpapers/' + file + ')';
    preview.style.backgroundSize = 'cover';
  } else {
    preview.style.backgroundImage = 'radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)';
    preview.style.backgroundSize = '6px 6px';
  }

  var label = document.createElement('div');
  label.style.cssText = 'font-family:var(--font-system);font-size:11px;font-weight:bold;padding:4px;color:#000;background:var(--color-button-face);';
  label.textContent = name;

  item.appendChild(preview);
  item.appendChild(label);

  item.addEventListener('click', function () {
    WissOS.sound.play('click');
    WissOS.wallpaper.set(id);
  });
  item.addEventListener('mouseenter', function () {
    item.style.transform = 'translate(-2px, -2px)';
    item.style.boxShadow = '5px 5px 0 #000';
  });
  item.addEventListener('mouseleave', function () {
    item.style.transform = 'none';
    item.style.boxShadow = '3px 3px 0 #000';
  });

  return item;
}

// ===== Direct Message Bridge (Iframe SDK Communication Gateway) =====
window.addEventListener('message', function (e) {
  var data = e.data;
  if (!data || typeof data !== 'object') return;

  switch (data.type) {
    case 'APP_READY':
      // Capture frame ready state and broadcast active system environments
      var currentTheme = WissOS.theme.current();
      var isMuted = WissOS.sound.isMuted();
      var iframes = document.querySelectorAll('iframe');
      for (var i = 0; i < iframes.length; i++) {
        var frame = iframes[i];
        if (frame.contentWindow === e.source) {
          frame.contentWindow.postMessage({
            type: 'THEME_CHANGED',
            theme: currentTheme
          }, '*');
          frame.contentWindow.postMessage({
            type: 'VOLUME_CHANGED',
            muted: isMuted
          }, '*');
          break;
        }
      }
      break;

    case 'PLAY_SOUND':
      if (data.sound) {
        WissOS.sound.play(data.sound);
      }
      break;

    case 'OPEN_PROGRAM':
      if (data.programId) {
        var prog = null;
        var allProgs = (WissOS.config.programs || []).concat(WissOS.config.systemPrograms || []);
        for (var i = 0; i < allProgs.length; i++) {
          if (allProgs[i].id === data.programId) {
            prog = allProgs[i];
            break;
          }
        }
        if (prog) {
          WissOS.launchProgram(prog);
        }
      }
      break;

    case 'SAVE_STATE':
      const resolvedState = data.state !== undefined ? data.state : data.data;
      if (data.key && resolvedState !== undefined) {
        WissOS.storage.set('appstate_' + data.key, resolvedState);
        e.source.postMessage({ type: 'STATE_SAVED', key: data.key, success: true }, '*');
      }
      break;

    case 'LOAD_STATE':
      if (data.key) {
        var state = WissOS.storage.get('appstate_' + data.key, null);
        e.source.postMessage({ type: 'STATE_LOADED', key: data.key, state: state, data: state }, '*');
      }
      break;

    case 'NOTIFY':
      const notifyText = data.text || data.message;
      if (notifyText) {
        WissOS.notify(notifyText, data.title);
      }
      break;
  }
});

// ===== Host Initialization Process =====
WissOS.init = async function () {
  if (WissOS._configData) {
    WissOS.config = WissOS._configData;
  } else {
    try {
      const response = await fetch('config.json');
      WissOS.config = await response.json();
    } catch (err) {
      console.error('Failed loading config.json, utilizing built-in data.', err);
      // Fallback config
      WissOS.config = WissOS._configData || {};
    }
  }

  var config = WissOS.config;
  var bus = WissOS.bus;
  var storage = WissOS.storage;

  // Restore states
  WissOS.theme.restore();
  WissOS.sound.applyConfig(config);
  WissOS.sound.setMuted(WissOS.sound.isMuted());

  // Run Boot BIOS sequence
  if (WissOS.BootSequence) {
    await WissOS.BootSequence.run(config, bus, storage);
  }
  
  // Bulletproof fallback to ensure boot screen is hidden on early resolve
  const bootScreen = document.getElementById('boot-screen');
  if (bootScreen) {
    bootScreen.setAttribute('hidden', '');
  }

  // Init interface elements
  if (WissOS.WindowManager) WissOS.WindowManager.init(config, bus, storage);
  if (WissOS.DesktopIcons) WissOS.DesktopIcons.init(config, bus, storage, WissOS.getIconDataUrl);
  if (WissOS.Taskbar) WissOS.Taskbar.init(config, bus, storage);
  if (WissOS.StartMenu) WissOS.StartMenu.init(config, bus, storage, WissOS.getIconDataUrl);
  if (WissOS.Screensaver) WissOS.Screensaver.init(bus);
  if (WissOS.EasterEggs) WissOS.EasterEggs.init(config, bus, storage);

  // Restore wallpaper
  WissOS.wallpaper.restore();

  // Attach sound hooks to generic events
  bus.on('startmenu:opened', function () { WissOS.sound.play('click'); });
  bus.on('startmenu:closed', function () { WissOS.sound.play('click'); });
  bus.on('window:created', function () { WissOS.sound.play('click'); });
  bus.on('window:closed', function () { WissOS.sound.play('click'); });
  bus.on('icon:dblclick', function () { WissOS.sound.play('click'); });

  // Handle generic desktop events
  document.getElementById('desktop').addEventListener('click', function (e) {
    if (e.target.id === 'desktop' || e.target.id === 'icon-container') {
      bus.emit('desktop:click');
    }
  });

  document.getElementById('desktop').addEventListener('contextmenu', function (e) {
    if (e.target.id === 'desktop' || e.target.id === 'icon-container') {
      e.preventDefault();
      WissOS.wallpaper.showPicker();
    }
  });

  bus.on('system:action', function (data) {
    if (data.action === 'volume-click') {
      WissOS.sound.toggle();
    }
  });

  console.log(config.os.name + ' initialized successfully.');
};

document.addEventListener('DOMContentLoaded', WissOS.init);
