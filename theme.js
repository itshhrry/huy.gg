/* ============================================================
   theme.js — site-wide theme manager
   - Default: dark
   - Honors prefers-color-scheme on first visit (no stored choice)
   - Persistent toggle via localStorage('huygg-theme')
   - Injects a small button into .site-nav on every page
   ============================================================ */
(function () {
  'use strict';
  var root = document.documentElement;
  var STORAGE_KEY = 'huygg-theme';

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function writeStored(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }
  function osPref() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
      ? 'light' : 'dark';
  }

  // Resolve initial theme: stored → OS pref (capped to dark default) → dark
  var stored = readStored();
  var initial = stored || osPref();
  root.setAttribute('data-theme', initial);

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    writeStored(mode);
    updateAllToggles(mode);
  }

  function toggleTheme() {
    var current = root.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  function updateAllToggles(mode) {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      // SVG icons: bright filled sun (dark mode → click to go light)
      // and dark contrasted crescent moon (light mode → click to go dark)
      if (mode === 'dark') {
        btn.innerHTML = '<svg class="theme-icon theme-icon-sun" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="4.5" fill="currentColor"/>' +
          '<g stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<line x1="12" y1="2.5" x2="12" y2="5"/>' +
            '<line x1="12" y1="19" x2="12" y2="21.5"/>' +
            '<line x1="2.5" y1="12" x2="5" y2="12"/>' +
            '<line x1="19" y1="12" x2="21.5" y2="12"/>' +
            '<line x1="5.2" y1="5.2" x2="6.9" y2="6.9"/>' +
            '<line x1="17.1" y1="17.1" x2="18.8" y2="18.8"/>' +
            '<line x1="5.2" y1="18.8" x2="6.9" y2="17.1"/>' +
            '<line x1="17.1" y1="6.9" x2="18.8" y2="5.2"/>' +
          '</g>' +
        '</svg>';
      } else {
        btn.innerHTML = '<svg class="theme-icon theme-icon-moon" width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M20.5 14.2A8 8 0 0 1 9.8 3.5a.6.6 0 0 0-.8-.7 9.5 9.5 0 1 0 12.2 12.2.6.6 0 0 0-.7-.8z" fill="currentColor"/>' +
        '</svg>';
      }
    });
  }

  function injectToggle() {
    var navs = document.querySelectorAll('.site-nav');
    navs.forEach(function (nav) {
      // Skip if already injected on this nav
      if (nav.querySelector('.theme-toggle')) return;
      // Add bullet separator
      var sep = document.createElement('strong');
      sep.textContent = '\u2022';
      nav.appendChild(sep);
      // Add button
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-toggle';
      btn.addEventListener('click', toggleTheme);
      nav.appendChild(btn);
    });
    updateAllToggles(root.getAttribute('data-theme') || 'dark');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }

  // Public API for any inline calls
  window.huyggTheme = { set: setTheme, toggle: toggleTheme, current: function () { return root.getAttribute('data-theme'); } };
})();
