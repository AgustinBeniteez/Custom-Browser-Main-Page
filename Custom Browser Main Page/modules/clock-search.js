/**
 * Clock & Search Manager — maneja el reloj digital y la búsqueda.
 * La búsqueda usa la API chrome.search si está disponible, con fallback a Google.
 */
import Storage from './storage.js';

/** Motores de búsqueda soportados */
const SEARCH_ENGINES = {
  google: q => `https://www.google.com/search?q=${q}`,
  bing: q => `https://www.bing.com/search?q=${q}`,
  yahoo: q => `https://search.yahoo.com/search?p=${q}`,
  brave: q => `https://search.brave.com/search?q=${q}`,
  duckduckgo: q => `https://duckduckgo.com/?q=${q}`,
};

class ClockSearchManager {
  constructor() {
    this._initElements();
    this._startClock();
    this._bindSearchEvents();
  }

  _initElements() {
    this.el = {
      reloj: document.getElementById('reloj'),
      searchForm: document.getElementById('search-form'),
      searchInput: document.getElementById('search-input'),
      searchButton: document.getElementById('search-button'),
    };
  }

  // ─── Reloj ─────────────────────────────────────────────────────────────────

  _startClock() {
    this._tick();
    setInterval(() => this._tick(), 1000);
  }

  _tick() {
    if (this.el.reloj) {
      this.el.reloj.textContent = new Date().toTimeString().slice(0, 5);
    }
  }

  // ─── Búsqueda ──────────────────────────────────────────────────────────────

  _bindSearchEvents() {
    const doSearch = e => { e.preventDefault(); this._search(); };
    this.el.searchForm?.addEventListener('submit', doSearch);
    this.el.searchButton?.addEventListener('click', doSearch);
  }

  _search() {
    const query = this.el.searchInput?.value.trim();
    if (!query) return;

    // Fallback: redirección directa según motor seleccionado
    const engine = Storage.get('buscadorSeleccionado', 'google');
    const buildUrl = SEARCH_ENGINES[engine] ?? SEARCH_ENGINES.google;
    window.location.href = buildUrl(encodeURIComponent(query));
  }
}

export const clockSearchManager = new ClockSearchManager();