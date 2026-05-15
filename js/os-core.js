/**
 * WissualisierungOS – Core Module
 * Entry point: loads config, initializes all modules
 * CC-BY-SA 4.0 Wolf Sebastian (2026)
 */

// ===== Globaler Namespace =====
// WissOS ist das zentrale Objekt, das alle Module und Daten kapselt.
// Dies verhindert globale Namensraum-Konflikte und ermöglicht einfache Kommunikation.
window.WissOS = window.WissOS || {};

// ===== Event Bus (Pub/Sub Pattern) =====
// Ermöglicht die entkoppelte Kommunikation zwischen Modulen (z.B. Taskbar -> WindowManager).
// Nutzung: WissOS.bus.on('event', callback) / WissOS.bus.emit('event', data)
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
        try { cb(data); } catch (e) { console.error(`Event '${event}' handler error:`, e); }
      });
    }
  };
})();

// ===== Storage Wrapper =====
// Abstraktionsschicht für localStorage, um Daten persistent zu speichern.
// Nutzt ein Präfix ('wissos_'), um andere Webseiten-Daten nicht zu beeinflussen.
(function () {
  const PREFIX = 'wissos_';

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
      } catch { /* quota exceeded */ }
    },
    remove(key) {
      localStorage.removeItem(PREFIX + key);
    }
  };
})();

// ===== SVG Icon Library =====
WissOS.ICONS = {
  typewriter: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="32" height="8" fill="#7DFFC2" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="4" y="20" width="40" height="20" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="12" y="14" width="24" height="4" fill="#FAFAF5"/>
    <rect x="10" y="26" width="4" height="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="16" y="26" width="4" height="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="22" y="26" width="4" height="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="28" y="26" width="4" height="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="34" y="26" width="4" height="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="12" y="32" width="4" height="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="18" y="32" width="12" height="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="32" y="32" width="4" height="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1"/>
  </svg>`,

  magnifier: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" fill="#FFE66D" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="20" cy="20" r="7" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="29" y1="29" x2="40" y2="40" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/>
    <rect x="36" y="34" width="8" height="6" rx="1" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2" transform="rotate(45 36 34)"/>
  </svg>`,

  book: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="6" width="32" height="36" rx="0" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="12" y="6" width="28" height="36" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="3"/>
    <line x1="16" y1="14" x2="36" y2="14" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="16" y1="20" x2="32" y2="20" stroke="#D4D0C8" stroke-width="2"/>
    <line x1="16" y1="26" x2="34" y2="26" stroke="#D4D0C8" stroke-width="2"/>
    <line x1="16" y1="32" x2="28" y2="32" stroke="#D4D0C8" stroke-width="2"/>
    <rect x="8" y="6" width="4" height="36" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="2"/>
  </svg>`,

  'speech-bubble': `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="40" height="28" fill="#7DFFC2" stroke="#1A1A1A" stroke-width="3"/>
    <polygon points="12,34 20,34 16,44" fill="#7DFFC2" stroke="#1A1A1A" stroke-width="3"/>
    <line x1="12" y1="16" x2="36" y2="16" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="12" y1="22" x2="30" y2="22" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="12" y1="28" x2="24" y2="28" stroke="#1A1A1A" stroke-width="2"/>
  </svg>`,

  tree: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="32" width="8" height="12" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <polygon points="24,4 6,32 42,32" fill="#7DFFC2" stroke="#1A1A1A" stroke-width="3"/>
    <polygon points="24,12 10,32 38,32" fill="#56d4a0" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="18" cy="24" r="2" fill="#FF6B9D"/>
    <circle cx="28" cy="20" r="2" fill="#FFE66D"/>
    <circle cx="24" cy="28" r="2" fill="#FF6B9D"/>
  </svg>`,

  joystick: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="30" width="32" height="12" rx="0" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="20" y="12" width="8" height="20" fill="#1A1A1A" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="24" cy="10" r="6" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="14" cy="36" r="3" fill="#FFE66D" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="34" cy="36" r="3" fill="#7DFFC2" stroke="#1A1A1A" stroke-width="2"/>
  </svg>`,

  paintbrush: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="28" width="8" height="16" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <polygon points="16,28 24,4 32,28" fill="#FFE66D" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="18" y="26" width="12" height="4" fill="#7DFFC2" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="24" y1="10" x2="24" y2="24" stroke="#FF6B9D" stroke-width="2"/>
  </svg>`,

  trash: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="14" width="24" height="28" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="8" y="10" width="32" height="6" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="18" y="6" width="12" height="6" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <line x1="20" y1="20" x2="20" y2="36" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="24" y1="20" x2="24" y2="36" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="28" y1="20" x2="28" y2="36" stroke="#1A1A1A" stroke-width="2"/>
  </svg>`,

  terminal: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="40" height="32" fill="#1A1A1A" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="6" y="10" width="36" height="28" fill="#0a0a0a"/>
    <polyline points="10,20 16,24 10,28" fill="none" stroke="#7DFFC2" stroke-width="2"/>
    <line x1="18" y1="28" x2="30" y2="28" stroke="#7DFFC2" stroke-width="2"/>
  </svg>`,

  help: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="#FFE66D" stroke="#1A1A1A" stroke-width="3"/>
    <text x="24" y="32" fill="#1A1A1A" font-family="monospace" font-size="24" font-weight="bold" text-anchor="middle">?</text>
  </svg>`,

  gear: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="8" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="24" cy="24" r="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="22" y="2" width="4" height="8" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="22" y="38" width="4" height="8" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="2" y="22" width="8" height="4" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="38" y="22" width="8" height="4" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="7" y="7" width="4" height="8" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2" transform="rotate(45 9 11)"/>
    <rect x="33" y="33" width="4" height="8" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2" transform="rotate(45 35 37)"/>
    <rect x="33" y="7" width="4" height="8" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2" transform="rotate(-45 35 11)"/>
    <rect x="7" y="33" width="4" height="8" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2" transform="rotate(-45 9 37)"/>
  </svg>`,

  folder: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12 L4 40 L44 40 L44 16 L22 16 L18 12 Z" fill="#FFE66D" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="4" y="16" width="40" height="24" fill="#FFE66D" stroke="#1A1A1A" stroke-width="2" opacity="0.7"/>
  </svg>`,

  brain: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="18" r="10" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="30" cy="18" r="10" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="18" cy="28" r="8" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="30" cy="28" r="8" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="3"/>
    <line x1="24" y1="10" x2="24" y2="38" stroke="#1A1A1A" stroke-width="2"/>
    <path d="M16 16 Q20 22 16 28" fill="none" stroke="#1A1A1A" stroke-width="1.5"/>
    <path d="M32 16 Q28 22 32 28" fill="none" stroke="#1A1A1A" stroke-width="1.5"/>
  </svg>`,

  browser: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="#7DFFC2" stroke="#1A1A1A" stroke-width="3"/>
    <ellipse cx="24" cy="24" rx="8" ry="18" fill="none" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="6" y1="24" x2="42" y2="24" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="9" y1="16" x2="39" y2="16" stroke="#1A1A1A" stroke-width="1.5"/>
    <line x1="9" y1="32" x2="39" y2="32" stroke="#1A1A1A" stroke-width="1.5"/>
  </svg>`,

  palette: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="26" rx="18" ry="16" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="14" cy="20" r="3" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="22" cy="15" r="3" fill="#FFE66D" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="32" cy="17" r="3" fill="#7DFFC2" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="36" cy="26" r="3" fill="#B967FF" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="18" cy="32" r="4" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2"/>
  </svg>`,

  music: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="6" width="32" height="36" rx="0" fill="#B967FF" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="18" cy="30" r="5" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="34" cy="26" r="5" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="23" y1="30" x2="23" y2="12" stroke="#1A1A1A" stroke-width="3"/>
    <line x1="39" y1="26" x2="39" y2="8" stroke="#1A1A1A" stroke-width="3"/>
    <line x1="23" y1="12" x2="39" y2="8" stroke="#1A1A1A" stroke-width="3"/>
  </svg>`,

  video: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="40" height="28" fill="#1A1A1A" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="6" y="12" width="36" height="24" fill="#2a2a3a"/>
    <polygon points="19,18 19,30 33,24" fill="#FF6B9D" stroke="#FAFAF5" stroke-width="1"/>
    <rect x="4" y="6" width="8" height="6" fill="#FFE66D" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="36" y="6" width="8" height="6" fill="#FFE66D" stroke="#1A1A1A" stroke-width="2"/>
  </svg>`,

  notepad: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="4" width="32" height="40" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="8" y="4" width="32" height="8" fill="#FFE66D" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="14" y1="18" x2="34" y2="18" stroke="#D4D0C8" stroke-width="2"/>
    <line x1="14" y1="24" x2="34" y2="24" stroke="#D4D0C8" stroke-width="2"/>
    <line x1="14" y1="30" x2="30" y2="30" stroke="#D4D0C8" stroke-width="2"/>
    <line x1="14" y1="36" x2="26" y2="36" stroke="#D4D0C8" stroke-width="2"/>
    <circle cx="11" cy="8" r="2" fill="#1A1A1A"/>
    <circle cx="24" cy="8" r="2" fill="#1A1A1A"/>
    <circle cx="37" cy="8" r="2" fill="#1A1A1A"/>
  </svg>`,

  calculator: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="4" width="28" height="40" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="14" y="8" width="20" height="10" fill="#7DFFC2" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="14" y="22" width="6" height="6" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1.5"/>
    <rect x="22" y="22" width="6" height="6" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1.5"/>
    <rect x="30" y="22" width="6" height="6" fill="#FFE66D" stroke="#1A1A1A" stroke-width="1.5"/>
    <rect x="14" y="30" width="6" height="6" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1.5"/>
    <rect x="22" y="30" width="6" height="6" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1.5"/>
    <rect x="30" y="30" width="6" height="6" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="1.5"/>
    <rect x="14" y="38" width="14" height="4" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="1.5"/>
  </svg>`,

  camera: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="14" width="40" height="26" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <polygon points="16,14 20,8 28,8 32,14" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="24" cy="28" r="8" fill="#1A1A1A" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="24" cy="28" r="5" fill="#7DFFC2" stroke="#FAFAF5" stroke-width="1"/>
    <circle cx="24" cy="28" r="2" fill="#FAFAF5"/>
    <rect x="36" y="17" width="5" height="3" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="1"/>
  </svg>`,

  calendar: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="36" height="32" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="6" y="10" width="36" height="10" fill="#FF6B9D" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="12" y="6" width="4" height="8" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="32" y="6" width="4" height="8" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2"/>
    <rect x="11" y="25" width="5" height="5" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="19" y="25" width="5" height="5" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="27" y="25" width="5" height="5" fill="#FFE66D" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="35" y="25" width="5" height="5" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="11" y="33" width="5" height="5" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="1"/>
    <rect x="19" y="33" width="5" height="5" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="1"/>
  </svg>`,

  mail: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="40" height="28" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="3"/>
    <polyline points="4,10 24,28 44,10" fill="none" stroke="#1A1A1A" stroke-width="3"/>
    <line x1="4" y1="38" x2="18" y2="24" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="44" y1="38" x2="30" y2="24" stroke="#1A1A1A" stroke-width="2"/>
  </svg>`,

  clock: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="24" cy="24" r="15" fill="#FAFAF5" stroke="#D4D0C8" stroke-width="1"/>
    <line x1="24" y1="24" x2="24" y2="12" stroke="#1A1A1A" stroke-width="3"/>
    <line x1="24" y1="24" x2="34" y2="24" stroke="#1A1A1A" stroke-width="2"/>
    <circle cx="24" cy="24" r="2" fill="#FF6B9D"/>
    <circle cx="24" cy="8" r="1.5" fill="#1A1A1A"/>
    <circle cx="24" cy="40" r="1.5" fill="#1A1A1A"/>
    <circle cx="8" cy="24" r="1.5" fill="#1A1A1A"/>
    <circle cx="40" cy="24" r="1.5" fill="#1A1A1A"/>
  </svg>`,

  document: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,4 32,4 38,10 38,44 10,44" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="3"/>
    <polygon points="32,4 32,10 38,10" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="16" y1="18" x2="32" y2="18" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="16" y1="24" x2="32" y2="24" stroke="#D4D0C8" stroke-width="2"/>
    <line x1="16" y1="30" x2="28" y2="30" stroke="#D4D0C8" stroke-width="2"/>
    <line x1="16" y1="36" x2="24" y2="36" stroke="#D4D0C8" stroke-width="2"/>
  </svg>`,

  star: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="24,4 29,18 44,18 32,28 36,42 24,34 12,42 16,28 4,18 19,18" fill="#FFE66D" stroke="#1A1A1A" stroke-width="3"/>
  </svg>`,

  fullscreen: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <rect x="8" y="8" width="32" height="32" fill="#FAFAF5" stroke="#1A1A1A" stroke-width="2"/>
    <polyline points="10,18 10,10 18,10" fill="none" stroke="#7DFFC2" stroke-width="3" stroke-linecap="round"/>
    <polyline points="30,10 38,10 38,18" fill="none" stroke="#7DFFC2" stroke-width="3" stroke-linecap="round"/>
    <polyline points="38,30 38,38 30,38" fill="none" stroke="#7DFFC2" stroke-width="3" stroke-linecap="round"/>
    <polyline points="18,38 10,38 10,30" fill="none" stroke="#7DFFC2" stroke-width="3" stroke-linecap="round"/>
    <line x1="10" y1="10" x2="18" y2="18" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="38" y1="10" x2="30" y2="18" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="38" y1="38" x2="30" y2="30" stroke="#1A1A1A" stroke-width="2"/>
    <line x1="10" y1="38" x2="18" y2="30" stroke="#1A1A1A" stroke-width="2"/>
  </svg>`,

  cookie: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="#D4D0C8" stroke="#1A1A1A" stroke-width="3"/>
    <circle cx="16" cy="18" r="2" fill="#1A1A1A"/>
    <circle cx="28" cy="14" r="2.5" fill="#1A1A1A"/>
    <circle cx="32" cy="26" r="2" fill="#1A1A1A"/>
    <circle cx="20" cy="32" r="3" fill="#1A1A1A"/>
    <circle cx="26" cy="22" r="1.5" fill="#1A1A1A"/>
    <circle cx="14" cy="26" r="2.5" fill="#1A1A1A"/>
  </svg>`
};

// ===== Icon URL Generator =====
WissOS.getIconDataUrl = function (iconName) {
  const svg = WissOS.ICONS[iconName] || WissOS.ICONS['help'];
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

// ===== Program Launcher =====
WissOS.launchProgram = function (prog) {
  if (!prog) return;

  // Handle special internal URLs
  if (prog.url && prog.url.startsWith('#')) {
    const action = prog.url.substring(1);
    WissOS.bus.emit('system:action', { action: action, program: prog });
    return;
  }

  if (!prog.url) return;

  // Option 1: Open in OS Window (Iframe)
  if (prog.openInWindow) {
    WissOS.WindowManager.createWindow({
      title: prog.osName || prog.name,
      icon: prog.icon,
      content: '<iframe src="' + prog.url + '" style="width:100%; height:100%; border:none; background:#fff;"></iframe>',
      width: prog.width || 900,
      height: prog.height || 650
    });
  }
  // Option 2: Open in new Tab (with loading animation)
  else {
    WissOS.showLoadingBar(prog.osName || prog.name, function () {
      window.open(prog.url, '_blank');
    });
  }
};

// ===== Loading Bar UI =====
WissOS.showLoadingBar = function (label, callback) {
  var bar = document.getElementById('loading-bar');
  if (!bar) { if (callback) callback(); return; }

  var labelEl = bar.querySelector('.loading-bar__label');
  var fill = bar.querySelector('.loading-bar__fill');

  if (labelEl) labelEl.textContent = label + ' wird geöffnet …';
  if (fill) {
    fill.style.animation = 'none';
    fill.offsetHeight; // reflow
    fill.style.animation = 'loading-fill 1.2s ease-out forwards';
  }

  bar.style.display = 'block';
  bar.setAttribute('aria-hidden', 'false');

  setTimeout(function () {
    bar.style.display = 'none';
    bar.setAttribute('aria-hidden', 'true');
    if (callback) callback();
  }, 1300);
};

// ===== Konfiguration =====
// Hält die aktuellen Systemeinstellungen und Programmlisten.
WissOS.config = null;

// ===== Sound-Manager =====
// Steuert UI-Sounds (standardmäßig aus, per Lautstärke-Icon aktivierbar).
// Konfigurierbar über config.easterEggs.sound.
// Nutzt einen geteilten AudioContext, der bei der ersten User-Geste resumed wird.
(function () {
  var _muted = true;
  var _globallyDisabled = false; // Wenn via Config komplett deaktiviert
  var _enabledSounds = ['startup', 'click', 'error']; // Default: alle Sounds aktiv
  var _ctx = null; // Geteilter AudioContext

  /**
   * AudioContext erstellen oder vorhandenen zurückgeben.
   * Muss bei der ersten Nutzung im Kontext einer User-Geste aufgerufen werden.
   */
  function getAudioContext() {
    if (!_ctx) {
      try {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    // Browser kann den Context suspendieren → bei Geste resumieren
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }
    return _ctx;
  }

  WissOS.sound = {
    /** Konfig anwenden (wird nach Config-Load aufgerufen) */
    applyConfig: function (config) {
      var ee = (config || {}).easterEggs || {};
      var sndConfig = ee.sound || {};
      // Sound global deaktivierbar
      if (sndConfig.enabled === false) {
        _globallyDisabled = true;
        return;
      }
      _globallyDisabled = false;
      // Selektive Sound-Typen
      if (Array.isArray(sndConfig.types) && sndConfig.types.length > 0) {
        _enabledSounds = sndConfig.types;
      }
    },

    /**
     * Retro-PC-Sound abspielen.
     * Wird nur abgespielt wenn: nicht gemutet, nicht global deaktiviert, Typ erlaubt.
     * MUSS aus einer User-Geste heraus aufgerufen werden (Klick, Taste),
     * damit der Browser den AudioContext freigibt.
     */
    play: function (name) {
      if (_muted || _globallyDisabled) return;
      if (_enabledSounds.indexOf(name) === -1) return;

      var ctx = getAudioContext();
      if (!ctx) return;

      try {
        var t = ctx.currentTime;

        if (name === 'startup') {
          // PC-POST-Beep: Einzelner kurzer hoher Ton (wie BIOS-Beep)
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(1000, t);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.setValueAtTime(0.06, t + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);

          // Zweiter, tieferer Bestätigungs-Beep nach kurzer Pause
          var osc2 = ctx.createOscillator();
          var gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(800, t + 0.3);
          gain2.gain.setValueAtTime(0, t);
          gain2.gain.setValueAtTime(0.05, t + 0.3);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          osc2.start(t + 0.3);
          osc2.stop(t + 0.45);

        } else if (name === 'error') {
          // Fehler-Beep: Zwei schnelle tiefe Töne
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.setValueAtTime(200, t + 0.12);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.25);

        } else {
          // Klick: Kurzer PC-Speaker-artiger Impuls
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(1200, t);
          gain.gain.setValueAtTime(0.03, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
          osc.start(t);
          osc.stop(t + 0.04);
        }
      } catch (e) { /* AudioContext error */ }
    },
    isMuted: function () { return _muted; },
    isDisabled: function () { return _globallyDisabled; },
    /** Geteilten AudioContext zurückgeben (für Boot-Sounds u.a.) */
    getContext: getAudioContext,
    setMuted: function (val) {
      _muted = val;
      WissOS.storage.set('soundMuted', _muted);
      // Lautstärke-Icon aktualisieren
      var icon = document.getElementById('volume-icon');
      if (icon) icon.textContent = (_muted || _globallyDisabled) ? '🔇' : '🔊';
    },
    toggle: function () {
      var wasMuted = _muted;
      WissOS.sound.setMuted(!_muted);
      // Wenn gerade eingeschaltet: sofort Bestätigungston abspielen
      // (wird aus User-Geste aufgerufen → AudioContext darf starten)
      if (wasMuted && !_muted) {
        WissOS.sound.play('startup');
      }
    }
  };

  // Gespeicherten Zustand laden
  var saved = WissOS.storage.get('soundMuted', true);
  _muted = saved;
})();

// ===== Theme-Manager =====
// Wechselt das Theme-Stylesheet zur Laufzeit und speichert die Wahl.
WissOS.theme = {
  available: ['retro-classic', 'vaporwave', 'schreibstube', 'pommes'],

  /** Aktuelles Theme setzen */
  set: function (themeName) {
    if (WissOS.theme.available.indexOf(themeName) === -1) return false;
    var link = document.getElementById('theme-stylesheet');
    if (link) {
      link.href = 'css/themes/' + themeName + '.css';
      WissOS.storage.set('theme', themeName);
    }
    return true;
  },

  /** Gespeichertes Theme wiederherstellen */
  restore: function () {
    var saved = WissOS.storage.get('theme', null);
    if (saved && WissOS.theme.available.indexOf(saved) !== -1) {
      WissOS.theme.set(saved);
    }
  },

  /** Aktuelles Theme abfragen */
  current: function () {
    var link = document.getElementById('theme-stylesheet');
    if (!link) return 'retro-classic';
    var href = link.getAttribute('href') || '';
    var match = href.match(/themes\/(.+)\.css/);
    return match ? match[1] : 'retro-classic';
  }
};

// ===== Wallpaper-Manager =====
// Ermöglicht den Wechsel des Desktop-Hintergrunds.
WissOS.wallpaper = {
  /** Wallpaper per CSS-Klasse oder Bild setzen */
  set: function (wallpaperId) {
    var desktop = document.getElementById('desktop');
    if (!desktop) return;

    // Wallpaper-Daten aus Config suchen
    var wallpapers = (WissOS.config || {}).wallpapers || [];
    var wp = null;
    for (var i = 0; i < wallpapers.length; i++) {
      if (wallpapers[i].id === wallpaperId) { wp = wallpapers[i]; break; }
    }

    if (wp && wp.file) {
      desktop.style.backgroundImage = 'url(assets/wallpapers/' + wp.file + ')';
      desktop.style.backgroundSize = 'cover';
      desktop.style.backgroundPosition = 'center';
    } else {
      // Standard: Punktraster aus CSS
      desktop.style.backgroundImage = '';
      desktop.style.backgroundSize = '';
      desktop.style.backgroundPosition = '';
    }

    WissOS.storage.set('wallpaper', wallpaperId);
  },

  /** Gespeichertes Wallpaper wiederherstellen */
  restore: function () {
    var saved = WissOS.storage.get('wallpaper', null);
    if (saved) WissOS.wallpaper.set(saved);
  },

  /** Wallpaper-Auswahl-Fenster anzeigen */
  showPicker: function () {
    var wallpapers = (WissOS.config || {}).wallpapers || [];
    var contentEl = document.createElement('div');
    contentEl.style.cssText = 'padding:16px;';

    var heading = document.createElement('h4');
    heading.style.cssText = 'font-family:var(--font-system);margin-bottom:12px;';
    heading.textContent = '🖼️ Hintergrund wählen';
    contentEl.appendChild(heading);

    // Standard-Option (Punktraster)
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,100px);gap:8px;';

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
      width: 380,
      height: 280
    });
  }
};

function createWallpaperItem(id, name, file) {
  var item = document.createElement('div');
  item.style.cssText =
    'border:3px solid var(--color-text);cursor:pointer;text-align:center;' +
    'transition:border-color 0.15s;';

  var preview = document.createElement('div');
  preview.style.cssText = 'width:100%;height:60px;background:var(--color-bg);';
  if (file) {
    preview.style.backgroundImage = 'url(assets/wallpapers/' + file + ')';
    preview.style.backgroundSize = 'cover';
  } else {
    // Punktraster-Vorschau
    preview.style.backgroundImage =
      'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)';
    preview.style.backgroundSize = '8px 8px';
  }

  var label = document.createElement('div');
  label.style.cssText =
    'font-family:var(--font-system);font-size:12px;padding:4px;' +
    'background:var(--color-button-face);';
  label.textContent = name;

  item.appendChild(preview);
  item.appendChild(label);

  item.addEventListener('click', function () {
    WissOS.wallpaper.set(id);
  });
  item.addEventListener('mouseenter', function () {
    item.style.borderColor = 'var(--color-primary)';
  });
  item.addEventListener('mouseleave', function () {
    item.style.borderColor = 'var(--color-text)';
  });

  return item;
}

// ===== Initialisierung (Boot-Prozess) =====
// Diese Funktion wird aufgerufen, wenn das DOM bereit ist.
WissOS.init = async function () {
  // 1. Konfiguration laden: Priorisiere eingebettete Daten (für file:// Kompatibilität)
  if (WissOS._configData) {
    WissOS.config = WissOS._configData;
  } else {
    try {
      const response = await fetch('config.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      WissOS.config = await response.json();
    } catch (err) {
      console.error('Failed to load config.json:', err);
      document.getElementById('desktop').innerHTML =
        '<div style="padding:40px;font-family:monospace;color:#1A1A1A;">' +
        '<h1>⚠️ Fehler</h1><p>config.json konnte nicht geladen werden.</p>' +
        '<p style="color:#808080;">' + err.message + '</p></div>';
      return;
    }
  }

  var config = WissOS.config;
  var bus = WissOS.bus;
  var storage = WissOS.storage;

  // 2. Theme und Sound-Zustand wiederherstellen (vor dem Boot, damit alles korrekt aussieht)
  WissOS.theme.restore();
  WissOS.sound.applyConfig(config);
  WissOS.sound.setMuted(WissOS.sound.isMuted());

  // 3. Boot-Sequenz ausführen (blockiert bis abgeschlossen/übersprungen)
  if (WissOS.BootSequence) {
    await WissOS.BootSequence.run(config, bus, storage);
  }

  // 4. UI-Module initialisieren (in korrekter Reihenfolge)
  WissOS.WindowManager.init(config, bus, storage);
  WissOS.DesktopIcons.init(config, bus, storage, WissOS.getIconDataUrl);
  WissOS.Taskbar.init(config, bus, storage);
  WissOS.StartMenu.init(config, bus, storage, WissOS.getIconDataUrl);

  // 5. Atmosphäre-Module initialisieren
  if (WissOS.Screensaver) WissOS.Screensaver.init(bus);
  if (WissOS.EasterEggs) WissOS.EasterEggs.init(config, bus, storage);

  // 6. Wallpaper wiederherstellen
  WissOS.wallpaper.restore();

  // 7. Klick-Sounds an UI-Events hängen
  // (Alle diese Events werden durch User-Gesten ausgelöst → AudioContext erlaubt)
  bus.on('startmenu:opened', function () { WissOS.sound.play('click'); });
  bus.on('startmenu:closed', function () { WissOS.sound.play('click'); });
  bus.on('window:created', function () { WissOS.sound.play('click'); });
  bus.on('window:closed', function () { WissOS.sound.play('click'); });
  bus.on('icon:dblclick', function () { WissOS.sound.play('click'); });

  // 8. Desktop-Klick: Icons deselektieren, Startmenü schließen
  document.getElementById('desktop').addEventListener('click', function (e) {
    if (e.target.id === 'desktop' || e.target.id === 'icon-container') {
      bus.emit('desktop:click');
    }
  });

  // 9. Desktop-Rechtsklick: Kontextmenü für Wallpaper-Wechsel
  document.getElementById('desktop').addEventListener('contextmenu', function (e) {
    if (e.target.id === 'desktop' || e.target.id === 'icon-container') {
      e.preventDefault();
      WissOS.wallpaper.showPicker();
    }
  });

  // 10. Lautstärke-Icon: Sound-Toggle
  bus.on('system:action', function (data) {
    if (data.action === 'volume-click') {
      WissOS.sound.toggle();
    }
  });

  console.log(config.os.name + ' v' + config.os.version + ' initialized.');
};

// Boot
document.addEventListener('DOMContentLoaded', WissOS.init);
