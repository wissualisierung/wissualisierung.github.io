/**
 * WissOS 2.0 App SDK
 * ⚡ Standardized Iframe Communication Bridge
 * Concept & Styling by Wolf Sebastian (2026)
 * License: CC-BY-SA 4.0
 */

(function(window) {
  'use strict';

  // Core SDK Object
  const WissOS = {
    version: '2.0',
    theme: 'retro-classic',
    isLoaded: false,
    muted: undefined,
    _stateCallbacks: {},
    _volumeCallbacks: [],
    _themeCallbacks: [],

    // Initialize the SDK and set up event listeners
    init() {
      if (this.isLoaded) return;
      this.isLoaded = true;

      // Listen for events from the OS host window
      window.addEventListener('message', (event) => {
        const message = event.data;
        if (!message || typeof message !== 'object') return;

        switch (message.type) {
          case 'THEME_CHANGED':
            this._handleThemeChange(message.theme);
            break;
          case 'VOLUME_CHANGED':
            this._handleVolumeChange(message.muted);
            break;
          case 'STATE_LOADED':
            this._handleStateLoaded(message.key, message.state !== undefined ? message.state : message.data);
            break;
        }
      });

      // Request current theme and volume settings from the OS on load
      this._sendMessage({ type: 'APP_READY' });

      // CSS Injector: Add a base transition and custom properties mapping
      const style = document.createElement('style');
      style.textContent = `
        /* Transition utility for neobrutalist buttons/cards */
        .neo-btn, .neo-card {
          transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                      box-shadow 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `;
      document.head.appendChild(style);
    },

    // Trigger a sound event through the central OS audio engine
    playSound(soundType) {
      this._sendMessage({
        type: 'PLAY_SOUND',
        sound: soundType
      });
    },

    // Save app state globally in OS localStorage
    saveState(key, data) {
      // Local fallback
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        // Ignored in sandboxed iframes
      }

      // Send to OS
      this._sendMessage({
        type: 'SAVE_STATE',
        key: key,
        state: data,
        data: data // Dual compatibility keys
      });
    },

    // Load app state from OS localStorage asynchronously
    loadState(key, callback) {
      // Setup callback registry
      this._stateCallbacks[key] = callback;

      // Check local storage fallback first
      let localData = null;
      try {
        const raw = localStorage.getItem(key);
        if (raw) localData = JSON.parse(raw);
      } catch (e) {}

      // Query host
      this._sendMessage({
        type: 'LOAD_STATE',
        key: key
      });

      // If local data exists, fire callback immediately as backup
      if (localData !== null && typeof callback === 'function') {
        callback(localData);
      }
    },

    // Send visual notification to OS Desktop with smart argument swap
    notify(first, second, type = 'info') {
      let title = 'Mitteilung';
      let message = '';
      
      if (second === undefined) {
        message = first;
      } else {
        title = first;
        message = second;
        // Swap if first is longer than second (supports both notify(title, msg) and notify(msg, title))
        if (typeof first === 'string' && typeof second === 'string' && first.length > second.length) {
          title = second;
          message = first;
        }
      }

      this._sendMessage({
        type: 'NOTIFY',
        title: title,
        message: message,
        text: message, // Support both 'text' and 'message' keys on host
        notificationType: type
      });
    },

    // Open another registered application by ID
    openProgram(programId, params = '') {
      this._sendMessage({
        type: 'OPEN_PROGRAM',
        programId,
        params
      });
    },

    // Register callback for volume changes
    onVolumeChanged(callback) {
      if (typeof callback === 'function') {
        this._volumeCallbacks.push(callback);
        if (this.muted !== undefined) {
          callback(this.muted);
        }
      }
    },

    // Register callback for theme changes
    onThemeChanged(callback) {
      if (typeof callback === 'function') {
        this._themeCallbacks.push(callback);
        if (this.theme !== undefined) {
          callback(this.theme);
        }
      }
    },

    // Internal helper to post message to parent window
    _sendMessage(data) {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(data, '*');
      }
    },

    // Callback when theme updates
    _handleThemeChange(themeName) {
      this.theme = themeName;
      
      // Update body classes
      document.documentElement.className = '';
      document.body.className = '';
      
      const themeClass = `theme-${themeName}`;
      document.documentElement.classList.add(themeClass);
      document.body.classList.add(themeClass);

      this._themeCallbacks.forEach(cb => {
        try { cb(themeName); } catch (e) { console.error(e); }
      });

      // Trigger custom event for applications to hook into
      const event = new CustomEvent('wissos-theme-changed', { detail: { theme: themeName } });
      window.dispatchEvent(event);
    },

    // Callback when state data returns from host
    _handleStateLoaded(key, data) {
      const callback = this._stateCallbacks[key];
      if (typeof callback === 'function') {
        callback(data);
        delete this._stateCallbacks[key]; // Single shot
      }
    },

    // Volume changed from OS taskbar tray
    _handleVolumeChange(muted) {
      this.muted = muted;
      this._volumeCallbacks.forEach(cb => {
        try { cb(muted); } catch (e) { console.error(e); }
      });

      const event = new CustomEvent('wissos-volume-changed', { detail: { muted } });
      window.dispatchEvent(event);
    }
  };

  // Compatibility namespace for didactical applications (e.g. Flashcard-Engine, Messenger-Engine)
  WissOS.sdk = {
    ready() {
      WissOS.init();
    },
    playSound(soundType) {
      WissOS.playSound(soundType);
    },
    saveState(key, data) {
      WissOS.saveState(key, data);
    },
    loadState(key, callback) {
      WissOS.loadState(key, callback);
    },
    notify(first, second, type) {
      WissOS.notify(first, second, type);
    },
    openProgram(programId, params) {
      WissOS.openProgram(programId, params);
    },
    onVolumeChanged(callback) {
      WissOS.onVolumeChanged(callback);
    },
    onThemeChanged(callback) {
      WissOS.onThemeChanged(callback);
    }
  };

  // Auto-init on script load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    WissOS.init();
  } else {
    window.addEventListener('DOMContentLoaded', () => WissOS.init());
  }

  // Expose to window namespace
  window.WissOS = WissOS;

})(window);
