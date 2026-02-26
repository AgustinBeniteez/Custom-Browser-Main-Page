/**
 * Settings Manager — gestiona todos los ajustes de la extensión.
 * Depende del módulo centralizado Storage para la persistencia.
 */
import Storage from './storage.js';

// Detectar idioma del navegador (2 primeros caracteres: es, en, fr, etc.)
const SUPPORTED_LANGS = ['en', 'es', 'val', 'fr', 'ru', 'zh', 'ja', 'ko'];
function detectBrowserLanguage() {
  const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  // Primero intenta coincidencia exacta (e.g. "en", "es", "fr")
  const short = browserLang.split('-')[0];
  if (SUPPORTED_LANGS.includes(short)) return short;
  return 'en';
}

// Valores por defecto de la aplicación
const DEFAULTS = {
  idioma: detectBrowserLanguage(),
  modoOscuro: 'false',
  colorBotones: '#b3336b',
  colorBotonesHover: '#802447',
  decoracionReloj: 'true',
  colorReloj: '#ffffff',
  mostrarReloj: 'true',
  buscadorVisible: 'true',
  posicionFavoritos: 'bottom',
  'fondo-url': 'fondos/background2.png',
  'fuente-pagina': 'Arial, sans-serif',
  'show-favorites-bg': 'false',
  'folder-closed-icon': '',
  'folder-open-icon': '',
};

class SettingsManager {
  constructor() {
    this.debounceTimers = new Map();
    this._ensureDefaults();
    this._initElements();
    this._bindEvents();
    this._loadAllSettings();
  }

  // ─── Privado: utilidades ───────────────────────────────────────────────────

  /** Guarda un ajuste con el módulo Storage centralizado. */
  _save(key, value) {
    Storage.set(key, value);
  }

  /** Lee un ajuste; devuelve el valor por defecto si no existe. */
  _get(key) {
    return Storage.get(key, DEFAULTS[key] ?? null);
  }

  /** Ejecuta una función con debounce identificado por key. */
  _debounce(key, fn, delay = 300) {
    clearTimeout(this.debounceTimers.get(key));
    this.debounceTimers.set(key, setTimeout(fn, delay));
  }

  // ─── Privado: inicialización ───────────────────────────────────────────────

  /** Garantiza que todos los ajustes tengan valores por defecto en la primera ejecución. */
  _ensureDefaults() {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (Storage.get(key) === null) {
        Storage.set(key, value);
      }
    });

    // Migración: corregir rutas de fondo guardadas con prefijo './' incorrecto
    const savedBg = Storage.get('fondo-url');
    if (savedBg && savedBg.startsWith('./') && !savedBg.startsWith('./http')) {
      Storage.set('fondo-url', savedBg.slice(2)); // elimina el './' inicial
    }
  }

  _initElements() {
    this.el = {
      popup: document.getElementById('popup'),
      ajustesBtn: document.getElementById('ajustes-btn'),
      cerrarPopup: document.getElementById('cerrar-popup'),
      idiomaSelect: document.getElementById('idioma'),
      modoOscuroCheckbox: document.getElementById('modo-oscuro'),
      colorTemaInput: document.getElementById('color-tema'),
      decoracionRelojCheckbox: document.getElementById('decoracion-reloj'),
      colorRelojInput: document.getElementById('color-reloj'),
      mostrarRelojCheckbox: document.getElementById('mostrar-reloj'),
      mostrarBusquedaCheckbox: document.getElementById('mostrar-busqueda'),
      posicionFavoritosRadios: document.getElementsByName('posicion-favoritos'),
      fondoInput: document.getElementById('fondo-url'),
      guardarFondoBtn: document.getElementById('guardar-fondo-url'),
      fondoFileInput: document.getElementById('fondo-file'),
      guardarFondoFileBtn: document.getElementById('guardar-fondo-file'),
      previewContainer: document.getElementById('preview-container'),
      previewImage: document.getElementById('preview-image'),
      relojContainer: document.querySelector('.reloj-container'),
      favoritosContainer: document.getElementById('favoritos-container'),
      searchContainer: document.querySelector('.search-container'),
      fuentePaginaSelect: document.getElementById('fuente-pagina'),
      showFavBgCheckbox: document.getElementById('show-fav-bg'),
      folderClosedFileInput: document.getElementById('folder-closed-file'),
      folderOpenFileInput: document.getElementById('folder-open-file'),
      resetFolderClosedBtn: document.getElementById('reset-folder-closed'),
      resetFolderOpenBtn: document.getElementById('reset-folder-open'),
    };
  }

  _bindEvents() {
    const { el } = this;

    // Popup de ajustes
    el.ajustesBtn?.addEventListener('click', () => this.togglePopup(true));
    el.cerrarPopup?.addEventListener('click', () => this.togglePopup(false));

    // Cerrar al hacer clic fuera del modal (en el overlay)
    el.popup?.addEventListener('click', e => {
      if (e.target === el.popup) this.togglePopup(false);
    });

    // Fuente
    el.fuentePaginaSelect?.addEventListener('change', e => this.updateFont(e.target.value));

    // Idioma
    el.idiomaSelect?.addEventListener('change', e => this.updateLanguage(e.target.value));

    // Modo oscuro
    el.modoOscuroCheckbox?.addEventListener('change', e => this.updateDarkMode(e.target.checked));

    // Color de tema (debounced)
    el.colorTemaInput?.addEventListener('input', e =>
      this._debounce('themeColor', () => this.updateThemeColor(e.target.value), 150)
    );

    // Decoración del reloj
    el.decoracionRelojCheckbox?.addEventListener('change', e =>
      this.updateClockDecoration(e.target.checked)
    );

    // Color del reloj (debounced)
    el.colorRelojInput?.addEventListener('input', e =>
      this._debounce('clockColor', () => this.updateClockColor(e.target.value), 150)
    );

    // Visibilidad del reloj
    el.mostrarRelojCheckbox?.addEventListener('change', e =>
      this.updateClockVisibility(e.target.checked)
    );

    // Visibilidad del buscador
    el.mostrarBusquedaCheckbox?.addEventListener('change', e =>
      this.updateSearchVisibility(e.target.checked)
    );

    // Posición de favoritos
    Array.from(el.posicionFavoritosRadios).forEach(radio =>
      radio.addEventListener('change', e => this.updateFavoritesPosition(e.target.value))
    );

    // Fondo por URL
    el.guardarFondoBtn?.addEventListener('click', () => this.updateBackgroundFromInput());

    // Fondo predeterminado (imágenes)
    document.querySelectorAll('.fondo-predeterminado img').forEach(img => {
      img.addEventListener('error', () => {
        if (img.dataset.fallback) img.src = img.dataset.fallback;
      });
      img.addEventListener('click', () => this.updateBackground(img.dataset.image));
    });

    // Subida de archivo de fondo
    el.fondoFileInput?.addEventListener('change', e => {
      this._handleFileUpload(e);
      // Actualizar nombre del archivo en el botón personalizado
      const nameSpan = document.getElementById('fondo-file-name');
      if (nameSpan && e.target.files[0]) {
        nameSpan.textContent = e.target.files[0].name;
        nameSpan.classList.add('has-file');
      }
    });
    el.guardarFondoFileBtn?.addEventListener('click', () => this._useUploadedBackground());

    // Favoritos
    el.showFavBgCheckbox?.addEventListener('change', e => this.updateShowFavBg(e.target.checked));
    el.folderClosedFileInput?.addEventListener('change', e => this._handleFolderIconUpload(e, 'folder-closed'));
    el.folderOpenFileInput?.addEventListener('change', e => this._handleFolderIconUpload(e, 'folder-open'));
    el.resetFolderClosedBtn?.addEventListener('click', () => this._resetFolderIcon('folder-closed'));
    el.resetFolderOpenBtn?.addEventListener('click', () => this._resetFolderIcon('folder-open'));
  }

  /** Carga todos los ajustes el primer render. */
  _loadAllSettings() {
    this._loadLanguage();
    this._loadDarkMode();
    this._loadThemeColor();
    this._loadThemeHoverColor();
    this._loadClockDecoration();
    this._loadClockColor();
    this._loadClockVisibility();
    this._loadSearchVisibility();
    this._loadFavoritesPosition();
    this._loadBackground();
    this._loadFont();
    this._loadFavoritesSettings();
  }

  // ─── Popup ─────────────────────────────────────────────────────────────────

  togglePopup(show) {
    if (this.el.popup) {
      this.el.popup.style.display = show ? 'block' : 'none';
    }
  }

  // ─── Fuente ────────────────────────────────────────────────────────────────

  updateFont(font) {
    document.documentElement.style.setProperty('--fuente-pagina', font);
    this._save('fuente-pagina', font);
  }

  _loadFont() {
    const font = this._get('fuente-pagina');
    if (this.el.fuentePaginaSelect) this.el.fuentePaginaSelect.value = font;
    this.updateFont(font);
  }

  // ─── Idioma ────────────────────────────────────────────────────────────────

  updateLanguage(language) {
    if (!language) return;
    this._save('idioma', language);

    // Actualizar el select visualmente (por si se llamó desde código)
    if (this.el.idiomaSelect) {
      this.el.idiomaSelect.value = language;
    }

    // Delegar al TranslationManager para actualizar textos en el DOM
    import('../translations/translations.js').then(module => {
      if (module.default) {
        module.default.updateLanguage(language);
      }
    });

    document.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  }

  _loadLanguage() {
    const language = this._get('idioma');
    this.updateLanguage(language);
  }

  // ─── Modo oscuro ───────────────────────────────────────────────────────────

  updateDarkMode(enabled) {
    this._save('modoOscuro', enabled);
    const root = document.documentElement.style;
    root.setProperty('--color-modelight', enabled ? 'var(--color-modedark)' : '#fefefecb');
    root.setProperty('--color-modelight1', enabled ? 'var(--color-modedark1)' : '#e2e2e2cc');
    root.setProperty('--color-letrasdark', enabled ? 'var(--color-letraswhite)' : '#161616');
    // Set data-theme on body for CSS conditional selectors
    document.body.setAttribute('data-theme', enabled ? 'dark' : 'light');
    document.dispatchEvent(new CustomEvent('darkModeChanged', { detail: enabled }));
  }

  _loadDarkMode() {
    const enabled = this._get('modoOscuro') === 'true';
    if (this.el.modoOscuroCheckbox) this.el.modoOscuroCheckbox.checked = enabled;
    this.updateDarkMode(enabled);
  }

  // ─── Color de tema ─────────────────────────────────────────────────────────

  updateThemeColor(color) {
    if (!color || color === 'undefined') return;

    // Limpiar color de posibles comillas accidentales
    const cleanColor = color.replace(/['"]/g, '');

    const hover = this._calcDarkerColor(cleanColor, -0.2);
    const root = document.documentElement.style;

    // Actualizar variables de la página principal
    root.setProperty('--color-botones', cleanColor);
    root.setProperty('--color-botones-hover', hover);

    // Sincronizar con el panel IDE
    root.setProperty('--ide-accent', cleanColor);
    root.setProperty('--ide-accent-bg', `${cleanColor}1A`); // 10% opacidad
    root.setProperty('--ide-accent-bg-hover', `${cleanColor}33`); // 20% opacidad

    this._save('colorBotones', cleanColor);
    this._save('colorBotonesHover', hover);
  }

  _loadThemeColor() {
    const color = this._get('colorBotones');
    if (!color) return;

    // Convertir HSL a hex si es necesario para el input[type=color]
    let displayColor = color.replace(/['"]/g, '');
    if (displayColor.startsWith('hsl')) {
      const m = displayColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (m) displayColor = this._hslToHex(+m[1], +m[2], +m[3]);
    }

    if (this.el.colorTemaInput) {
      this.el.colorTemaInput.value = displayColor;
    }

    // Aplicar sin guardar de nuevo (evitar bucles)
    const cleanColor = color.replace(/['"]/g, '');
    const hover = this._calcDarkerColor(cleanColor, -0.2);
    const root = document.documentElement.style;
    root.setProperty('--color-botones', cleanColor);
    root.setProperty('--color-botones-hover', hover);
    root.setProperty('--ide-accent', cleanColor);
    root.setProperty('--ide-accent-bg', `${cleanColor}1A`);
    root.setProperty('--ide-accent-bg-hover', `${cleanColor}33`);
  }

  _loadThemeHoverColor() {
    const hover = this._get('colorBotonesHover');
    document.documentElement.style.setProperty('--color-botones-hover', hover);
  }

  // ─── Decoración del reloj ──────────────────────────────────────────────────

  updateClockDecoration(enabled) {
    this._save('decoracionReloj', enabled);
    const h1 = document.querySelector('h1');
    if (h1) h1.style.animation = enabled ? 'textGlow 2s ease-in-out infinite alternate' : 'none';
  }

  _loadClockDecoration() {
    const enabled = this._get('decoracionReloj') === 'true';
    if (this.el.decoracionRelojCheckbox) this.el.decoracionRelojCheckbox.checked = enabled;
    this.updateClockDecoration(enabled);
  }

  // ─── Color del reloj ───────────────────────────────────────────────────────

  updateClockColor(color) {
    document.documentElement.style.setProperty('--color-reloj', color);
    this._save('colorReloj', color);
  }

  _loadClockColor() {
    const color = this._get('colorReloj');
    if (this.el.colorRelojInput) this.el.colorRelojInput.value = color;
    document.documentElement.style.setProperty('--color-reloj', color);
  }

  // ─── Visibilidad del reloj ─────────────────────────────────────────────────

  updateClockVisibility(visible) {
    this._save('mostrarReloj', visible);
    if (this.el.relojContainer) {
      this.el.relojContainer.style.display = visible ? 'block' : 'none';
    }
  }

  _loadClockVisibility() {
    const visible = this._get('mostrarReloj') !== 'false';
    if (this.el.mostrarRelojCheckbox) this.el.mostrarRelojCheckbox.checked = visible;
    this.updateClockVisibility(visible);
  }

  // ─── Visibilidad del buscador ──────────────────────────────────────────────

  updateSearchVisibility(visible) {
    this._save('buscadorVisible', visible);
    if (this.el.searchContainer) {
      this.el.searchContainer.style.display = visible ? 'block' : 'none';
    }
  }

  _loadSearchVisibility() {
    const visible = this._get('buscadorVisible') !== 'false';
    if (this.el.mostrarBusquedaCheckbox) this.el.mostrarBusquedaCheckbox.checked = visible;
    this.updateSearchVisibility(visible);
  }

  // ─── Posición de favoritos ─────────────────────────────────────────────────

  updateFavoritesPosition(position) {
    const { favoritosContainer: container, ajustesBtn } = this.el;
    const notasBtn = document.getElementById('ver-notas-btn');

    container?.classList.remove('favoritos-derecha', 'favoritos-izquierda', 'favoritos-oculto', 'favoritos-bottom');
    ajustesBtn?.classList.remove('ajustes-derecha', 'ajustes-izquierda');
    notasBtn?.classList.remove('ajustes-derecha', 'ajustes-izquierda');

    const isLeft = position === 'izquierda';
    const btnSide = isLeft ? 'ajustes-derecha' : 'ajustes-izquierda';

    const classMap = {
      derecha: 'favoritos-derecha',
      izquierda: 'favoritos-izquierda',
      bottom: 'favoritos-bottom',
      oculto: 'favoritos-oculto',
    };

    if (classMap[position]) container?.classList.add(classMap[position]);
    ajustesBtn?.classList.add(btnSide);
    notasBtn?.classList.add(btnSide);

    this._save('posicionFavoritos', position);
  }

  _loadFavoritesPosition() {
    const position = this._get('posicionFavoritos');
    Array.from(this.el.posicionFavoritosRadios).forEach(r => (r.checked = r.value === position));
    this.updateFavoritesPosition(position);
  }

  // ─── Fondo ─────────────────────────────────────────────────────────────────

  updateBackground(url) {
    if (!url) return;
    let cssUrl;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
      // URL externa o datos en base64/blob: usar tal cual
      cssUrl = `url(${url})`;
    } else if (url.startsWith('./') || url.startsWith('../') || url.startsWith('/')) {
      // Ruta relativa ya prefijada: usar tal cual desde newtab.html
      cssUrl = `url(${url})`;
    } else {
      // Ruta relativa simple como "fondos/background2.png"
      cssUrl = `url(./${url})`;
    }
    document.body.style.backgroundImage = cssUrl;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    this._save('fondo-url', url);

    // Actualizar la preview del fondo en ajustes
    const bgPreview = document.getElementById('ide-bg-preview');
    if (bgPreview) bgPreview.style.backgroundImage = cssUrl;
  }

  updateBackgroundFromInput() {
    const url = this.el.fondoInput?.value?.trim();
    if (url) this.updateBackground(url);
  }

  _loadBackground() {
    const url = this._get('fondo-url');
    if (url) this.updateBackground(url);
  }

  // ─── Subida de archivo de fondo ────────────────────────────────────────────

  _handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file?.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target.result;
      if (this.el.previewImage) this.el.previewImage.src = base64;
      if (this.el.previewContainer) this.el.previewContainer.style.display = 'block';
      // Guardar temporalmente hasta que el usuario confirme
      localStorage.setItem('temp-uploaded-background', base64);
    };
    reader.readAsDataURL(file);
  }

  _useUploadedBackground() {
    const base64 = localStorage.getItem('temp-uploaded-background');
    if (!base64) return;
    // Usar updateBackground para que se actualice tanto el body como el preview
    this.updateBackground(base64);
    localStorage.removeItem('temp-uploaded-background');
    if (this.el.previewContainer) this.el.previewContainer.style.display = 'none';
  }

  // ─── Utilidades de color ───────────────────────────────────────────────────

  _hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  _calcDarkerColor(hex, pct) {
    const f = parseInt(hex.slice(1), 16);
    const t = pct < 0 ? 0 : 255;
    const p = Math.abs(pct);
    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;
    return '#' + (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    ).toString(16).slice(1);
  }

  // ─── Favoritos ─────────────────────────────────────────────────────────────

  updateShowFavBg(enabled) {
    this._save('show-favorites-bg', enabled);
    const container = document.getElementById('favoritos-container');
    if (container) {
      container.classList.toggle('no-bg', !enabled);
    }
    // Disparar evento para que favorites.js lo sepa (si es necesario rerender)
    document.dispatchEvent(new CustomEvent('favoritesSettingsChanged'));
  }

  _loadFavoritesSettings() {
    const showBg = this._get('show-favorites-bg') === 'true';
    if (this.el.showFavBgCheckbox) this.el.showFavBgCheckbox.checked = showBg;
    this.updateShowFavBg(showBg);

    // Cargar previews de iconos si existen
    const closedIcon = this._get('folder-closed-icon');
    const openIcon = this._get('folder-open-icon');

    if (closedIcon) {
      const preview = document.getElementById('preview-folder-closed-image');
      const container = document.getElementById('preview-folder-closed-container');
      if (preview && container) {
        preview.src = closedIcon;
        container.style.display = 'block';
      }
    }
    if (openIcon) {
      const preview = document.getElementById('preview-folder-open-image');
      const container = document.getElementById('preview-folder-open-container');
      if (preview && container) {
        preview.src = openIcon;
        container.style.display = 'block';
      }
    }
  }

  _handleFolderIconUpload(event, type) {
    const file = event.target.files[0];
    if (!file?.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target.result;
      const key = type === 'folder-closed' ? 'folder-closed-icon' : 'folder-open-icon';
      this._save(key, base64);

      // Update preview
      const previewId = type === 'folder-closed' ? 'preview-folder-closed-image' : 'preview-folder-open-image';
      const containerId = type === 'folder-closed' ? 'preview-folder-closed-container' : 'preview-folder-open-container';
      const preview = document.getElementById(previewId);
      const container = document.getElementById(containerId);
      if (preview && container) {
        preview.src = base64;
        container.style.display = 'block';
      }

      // Update name
      const nameId = type === 'folder-closed' ? 'folder-closed-file-name' : 'folder-open-file-name';
      const nameSpan = document.getElementById(nameId);
      if (nameSpan) {
        nameSpan.textContent = file.name;
        nameSpan.classList.add('has-file');
      }

      // Notify favorites manager to rerender
      document.dispatchEvent(new CustomEvent('favoritesSettingsChanged'));
    };
    reader.readAsDataURL(file);
  }

  _resetFolderIcon(type) {
    const key = type === 'folder-closed' ? 'folder-closed-icon' : 'folder-open-icon';
    this._save(key, '');

    // Hide preview
    const containerId = type === 'folder-closed' ? 'preview-folder-closed-container' : 'preview-folder-open-container';
    const container = document.getElementById(containerId);
    if (container) container.style.display = 'none';

    // Reset name
    const nameId = type === 'folder-closed' ? 'folder-closed-file-name' : 'folder-open-file-name';
    const nameSpan = document.getElementById(nameId);
    if (nameSpan) {
      nameSpan.textContent = 'No file chosen';
      nameSpan.classList.remove('has-file');
      // Re-translate if possible
      import('../translations/translations.js').then(module => {
        if (module.default) module.default.updateLanguage(this._get('idioma'));
      });
    }

    // Notify favorites manager to rerender
    document.dispatchEvent(new CustomEvent('favoritesSettingsChanged'));
  }
}

export const settingsManager = new SettingsManager();
