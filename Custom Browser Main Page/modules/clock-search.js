// Módulo para manejar el reloj y la búsqueda

class ClockSearchManager {
  constructor() {
    this.initializeElements();
    this.initializeClock();
    this.initializeSearch();
  }

  initializeElements() {
    this.elements = {
      reloj: document.getElementById('reloj'),
      searchForm: document.getElementById('search-form'),
      searchInput: document.getElementById('search-input'),
      searchButton: document.getElementById('search-button')
    };
  }

  initializeClock() {
    // Iniciar el reloj y actualizarlo cada segundo
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  initializeSearch() {
    // Configurar eventos de búsqueda
    this.elements.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.performSearch();
    });

    this.elements.searchButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.performSearch();
    });
  }

  updateClock() {
    const now = new Date();
    this.elements.reloj.textContent = now.toTimeString().slice(0, 5);
  }

  performSearch() {
    const searchTerm = this.elements.searchInput.value.trim();
    if (!searchTerm) return;

    const searchEngine = localStorage.getItem('buscadorSeleccionado') || 'google';
    const searchUrl = this.getSearchUrl(searchEngine, searchTerm);
    
    window.location.href = searchUrl;
  }

  getSearchUrl(engine, query) {
    const encodedQuery = encodeURIComponent(query);
    const searchUrls = {
      google: `https://www.google.com/search?q=${encodedQuery}`,
      bing: `https://www.bing.com/search?q=${encodedQuery}`,
      yahoo: `https://search.yahoo.com/search?p=${encodedQuery}`,
      brave: `https://search.brave.com/search?q=${encodedQuery}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodedQuery}`
    };

    return searchUrls[engine] || searchUrls.google;
  }
}

export const clockSearchManager = new ClockSearchManager();