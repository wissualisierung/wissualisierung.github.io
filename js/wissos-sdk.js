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
    _stateCallbacks: {},

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
            this._handleStateLoaded(message.key, message.data);
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
        data: data
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

    // Send visual notification to OS Desktop
    notify(title, message, type = 'info') {
      this._sendMessage({
        type: 'NOTIFY',
        title,
        message,
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
      const event = new CustomEvent('wissos-volume-changed', { detail: { muted } });
      window.dispatchEvent(event);
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
