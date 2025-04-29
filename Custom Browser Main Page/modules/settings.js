// Módulo de configuración para manejar los ajustes de la aplicación

class SettingsManager {
  constructor() {
    this.translations = {};
    this.initializeElements();
    this.bindEvents();
    this.loadSettings();
    this.loadTranslations();
  }

  initializeElements() {
    this.elements = {
      popup: document.getElementById('popup'),
      ajustesBtn: document.getElementById('ajustes-btn'),
      cerrarPopup: document.getElementById('cerrar-popup'),
      idiomaSelect: document.getElementById('idioma'),
      buscadorSelect: document.getElementById('buscador'),
      modoOscuroCheckbox: document.getElementById('modo-oscuro'),
      colorTemaInput: document.getElementById('color-tema'),
      decoracionRelojCheckbox: document.getElementById('decoracion-reloj'),
      colorRelojInput: document.getElementById('color-reloj'),
      mostrarRelojCheckbox: document.getElementById('mostrar-reloj'),
      mostrarBusquedaCheckbox: document.getElementById('mostrar-busqueda'),
      posicionFavoritosSelect: document.getElementById('posicion-favoritos'),
      fondoInput: document.getElementById('fondo-url'),
      guardarFondoBtn: document.getElementById('guardar-fondo-url'),
      relojContainer: document.querySelector('.reloj-container'),
      reloj: document.getElementById('reloj'),
      favoritosContainer: document.getElementById('favoritos-container'),
      searchContainer: document.querySelector('.search-container')
    };
  }

  bindEvents() {
    // Eventos del popup de ajustes
    if (this.elements.ajustesBtn) this.elements.ajustesBtn.addEventListener('click', () => this.togglePopup(true));
    if (this.elements.cerrarPopup) this.elements.cerrarPopup.addEventListener('click', () => this.togglePopup(false));

    // Eventos de configuración
    if (this.elements.idiomaSelect) this.elements.idiomaSelect.addEventListener('change', (e) => this.updateLanguage(e.target.value));
    if (this.elements.buscadorSelect) this.elements.buscadorSelect.addEventListener('change', (e) => this.updateSearchEngine(e.target.value));
    if (this.elements.modoOscuroCheckbox) this.elements.modoOscuroCheckbox.addEventListener('change', (e) => this.updateDarkMode(e.target.checked));
    if (this.elements.colorTemaInput) this.elements.colorTemaInput.addEventListener('input', (e) => this.updateThemeColor(e.target.value));
    if (this.elements.decoracionRelojCheckbox) this.elements.decoracionRelojCheckbox.addEventListener('change', (e) => this.updateClockDecoration(e.target.checked));
    if (this.elements.colorRelojInput) this.elements.colorRelojInput.addEventListener('input', (e) => this.updateClockColor(e.target.value));
    if (this.elements.mostrarRelojCheckbox) this.elements.mostrarRelojCheckbox.addEventListener('change', (e) => this.updateClockVisibility(e.target.checked));
    if (this.elements.mostrarBusquedaCheckbox) this.elements.mostrarBusquedaCheckbox.addEventListener('change', (e) => this.updateSearchVisibility(e.target.checked));
    if (this.elements.posicionFavoritosSelect) this.elements.posicionFavoritosSelect.addEventListener('change', (e) => this.updateFavoritesPosition(e.target.value));
    if (this.elements.guardarFondoBtn) this.elements.guardarFondoBtn.addEventListener('click', () => this.updateBackground());

    // Eventos para fondos predeterminados
    document.querySelectorAll('.fondo-predeterminado img').forEach(img => {
      img.addEventListener('error', () => {
        const fallbackSrc = img.dataset.fallback;
        if (fallbackSrc) {
          img.src = fallbackSrc;
        }
      });
      img.addEventListener('click', () => this.updateBackground(img.dataset.image));
    });
  }

  loadSettings() {
    // Cargar configuraciones guardadas
    this.loadLanguage();
    this.loadSearchEngine();
    this.loadDarkMode();
    this.loadThemeColor();
    this.loadClockDecoration();
    this.loadClockColor();
    this.loadClockVisibility();
    this.loadSearchVisibility();
    this.loadFavoritesPosition();
    this.loadBackground();
  }

  // Métodos de actualización de configuración
  togglePopup(show) {
    this.elements.popup.style.display = show ? 'block' : 'none';
  }

  async loadTranslations() {
    try {
      const response = await fetch('../translations/lang.json');
      this.translations = await response.json();
    } catch (error) {
      console.error('Error al cargar las traducciones:', error);
    }
  }

  updateLanguage(language) {
    localStorage.setItem('idioma', language);
    // Usar TranslationManager para actualizar todos los textos
    import('../translations/translations.js').then(module => {
      const TranslationManager = module.default;
      TranslationManager.updateLanguage(language);
    });
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  }

  applyTranslations(language) {
    if (!this.translations[language]) return;
    
    const translations = this.translations[language];
    
    // Actualizar textos de elementos basados en atributos data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      if (translations[key]) {
        if (element.tagName === 'INPUT' && element.type === 'placeholder') {
          element.placeholder = translations[key];
        } else {
          element.textContent = translations[key];
        }
      }
    });
  }

  updateClockColor(color) {
    document.documentElement.style.setProperty('--color-reloj', color);
    localStorage.setItem('colorReloj', color);
  }

  loadClockColor() {
    const savedColor = localStorage.getItem('colorReloj') || '#ffffff';
    this.elements.colorRelojInput.value = savedColor;
    document.documentElement.style.setProperty('--color-reloj', savedColor);
  }

  updateFavoritesPosition(position) {
    const container = this.elements.favoritosContainer;
    const ajustesBtn = this.elements.ajustesBtn;
    const notasBtn = document.getElementById('ver-notas-btn');
    const popup = this.elements.popup;
    
    container.classList.remove('favoritos-derecha', 'favoritos-izquierda', 'favoritos-oculto');
    ajustesBtn.classList.remove('ajustes-derecha', 'ajustes-izquierda');
    notasBtn.classList.remove('ajustes-derecha', 'ajustes-izquierda');
    popup.classList.remove('popup-derecha', 'popup-izquierda');
    
    switch(position) {
      case 'derecha':
        container.classList.add('favoritos-derecha');
        ajustesBtn.classList.add('ajustes-izquierda');
        notasBtn.classList.add('ajustes-izquierda');
        popup.classList.add('popup-izquierda');
        break;
      case 'izquierda':
        container.classList.add('favoritos-izquierda');
        ajustesBtn.classList.add('ajustes-derecha');
        notasBtn.classList.add('ajustes-derecha');
        popup.classList.add('popup-derecha');
        break;
      case 'oculto':
        container.classList.add('favoritos-oculto');
        ajustesBtn.classList.add('ajustes-izquierda');
        notasBtn.classList.add('ajustes-izquierda');
        popup.classList.add('popup-izquierda');
        break;
    }
    
    localStorage.setItem('posicionFavoritos', position);
  }

  loadFavoritesPosition() {
    const savedPosition = localStorage.getItem('posicionFavoritos') || 'derecha';
    this.elements.posicionFavoritosSelect.value = savedPosition;
    this.updateFavoritesPosition(savedPosition);
  }
      

  updateSearchEngine(engine) {
    localStorage.setItem('buscadorSeleccionado', engine);
  }

  updateDarkMode(enabled) {
    localStorage.setItem('modoOscuro', enabled);
    document.documentElement.style.setProperty('--color-modelight', enabled ? 'var(--color-modedark)' : '#fefefecb');
    document.documentElement.style.setProperty('--color-modelight1', enabled ? 'var(--color-modedark1)' : '#e2e2e2cc');
    document.documentElement.style.setProperty('--color-letrasdark', enabled ? 'var(--color-letraswhite)' : '#161616');
    document.dispatchEvent(new CustomEvent('darkModeChanged', { detail: enabled }));
  }

  updateThemeColor(color) {
    const colorMasOscuro = this.calcularColorMasOscuro(color, -0.2);
    document.documentElement.style.setProperty('--color-botones', color);
    document.documentElement.style.setProperty('--color-botones-hover', colorMasOscuro);
    localStorage.setItem('colorBotones', color);
    localStorage.setItem('colorBotonesHover', colorMasOscuro);
  }

  updateClockDecoration(enabled) {
    localStorage.setItem('decoracionReloj', enabled);
    const relojElement = document.querySelector('h1');
    if (enabled) {
      relojElement.style.animation = 'textGlow 2s ease-in-out infinite alternate';
    } else {
      relojElement.style.animation = 'none';
    }
  }

  updateBackground(url) {
    url = url || this.elements.fondoInput.value;
    if (url) {
      document.body.style.backgroundImage = url.startsWith('http') ? `url(${url})` : `url(../${url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      localStorage.setItem('fondo-url', url);
    }
  }

  // Métodos de carga de configuración
  loadLanguage() {
    const language = localStorage.getItem('idioma') || 'en';
    this.elements.idiomaSelect.value = language;
    this.updateLanguage(language);
  }

  loadSearchEngine() {
    const engine = localStorage.getItem('buscadorSeleccionado') || 'google';
    this.elements.buscadorSelect.value = engine;
  }

  loadDarkMode() {
    const enabled = localStorage.getItem('modoOscuro') === 'true';
    this.elements.modoOscuroCheckbox.checked = enabled;
    this.updateDarkMode(enabled);
  }

  loadThemeColor() {
    const color = localStorage.getItem('colorBotones');
    if (color) {
      this.elements.colorTemaInput.value = color;
      this.updateThemeColor(color);
    }
  }

  loadClockDecoration() {
    const enabled = localStorage.getItem('decoracionReloj') !== 'false';
    this.elements.decoracionRelojCheckbox.checked = enabled;
    this.updateClockDecoration(enabled);
  }

  loadBackground() {
    const url = localStorage.getItem('fondo-url');
    if (url) {
      this.updateBackground(url);
    }
  }

  updateClockVisibility(visible) {
    localStorage.setItem('mostrarReloj', visible);
    if (this.elements.relojContainer) {
      this.elements.relojContainer.style.display = visible ? 'block' : 'none';
    }
  }

  loadClockVisibility() {
    const visible = localStorage.getItem('mostrarReloj') !== 'false';
    if (this.elements.mostrarRelojCheckbox) {
      this.elements.mostrarRelojCheckbox.checked = visible;
    }
    this.updateClockVisibility(visible);
  }

  updateSearchVisibility(visible) {
    localStorage.setItem('mostrarBusqueda', visible);
    if (this.elements.searchContainer) {
      this.elements.searchContainer.style.display = visible ? 'block' : 'none';
    }
  }

  loadSearchVisibility() {
    const visible = localStorage.getItem('mostrarBusqueda') !== 'false';
    if (this.elements.mostrarBusquedaCheckbox) {
      this.elements.mostrarBusquedaCheckbox.checked = visible;
    }
    this.updateSearchVisibility(visible);
  }

  // Utilidades
  calcularColorMasOscuro(color, porcentaje) {
    const f = parseInt(color.slice(1), 16);
    const t = porcentaje < 0 ? 0 : 255;
    const p = porcentaje < 0 ? porcentaje * -1 : porcentaje;
    const R = f >> 16;
    const G = (f >> 8) & 0x00FF;
    const B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 +
                   (Math.round((t - G) * p) + G) * 0x100 +
                   (Math.round((t - B) * p) + B)).toString(16).slice(1);
  }
}

export const settingsManager = new SettingsManager();