// main.js – entry point for public-facing pages
// Dynamically loads existing legacy app.js to keep behaviour intact while
// providing a stable import path (js/main.js) used across the site.

(function loadLegacyApp() {
  const legacySrc = '../app.js'; // relative to js/ directory => /app.js at root
  if (document.querySelector(`script[src="${legacySrc}"]`)) return; // already loaded

  const s = document.createElement('script');
  s.src = legacySrc;
  s.defer = true;
  document.head.appendChild(s);
})();