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
      fondoInput: document.getElementById('fondo-url'),
      guardarFondoBtn: document.getElementById('guardar-fondo-url'),
      relojContainer: document.querySelector('.reloj-container')
    };
  }

  bindEvents() {
    // Eventos del popup de ajustes
    this.elements.ajustesBtn.addEventListener('click', () => this.togglePopup(true));
    this.elements.cerrarPopup.addEventListener('click', () => this.togglePopup(false));

    // Eventos de configuración
    this.elements.idiomaSelect.addEventListener('change', (e) => this.updateLanguage(e.target.value));
    this.elements.buscadorSelect.addEventListener('change', (e) => this.updateSearchEngine(e.target.value));
    this.elements.modoOscuroCheckbox.addEventListener('change', (e) => this.updateDarkMode(e.target.checked));
    this.elements.colorTemaInput.addEventListener('input', (e) => this.updateThemeColor(e.target.value));
    this.elements.decoracionRelojCheckbox.addEventListener('change', (e) => this.updateClockDecoration(e.target.checked));
    this.elements.guardarFondoBtn.addEventListener('click', () => this.updateBackground());

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
    this.elements.relojContainer.style.animation = enabled ? 'textGlow 2s ease-in-out infinite alternate' : 'none';
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