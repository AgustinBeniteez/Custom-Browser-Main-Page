// Módulo de configuración para manejar los ajustes de la aplicación

class SettingsManager {
  constructor() {
    this.translations = {};
    this.debounceTimers = new Map();
    this.initializeElements();
    this.bindEvents();
    this.ensureDefaultSettings();
    this.loadSettings();
    this.loadTranslations();
  }

  // Asegurar que todas las configuraciones tengan valores por defecto
  ensureDefaultSettings() {
    const defaultSettings = {
      "idioma": "en",
      "modoOscuro": "false",
      "colorBotones": "#b3336b",
      "colorBotonesHover": "#802447",
      "decoracionReloj": "true",
      "colorReloj": "#ffffff",
      "relojVisible": "true",
      "buscadorVisible": "true",
      "posicionFavoritos": "bottom",
      "fuente-pagina": "Arial, sans-serif",
      "fondo-url": "./fondos/background2.png"
    };

    // Aplicar valores por defecto solo si no existen
    Object.entries(defaultSettings).forEach(([key, defaultValue]) => {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, defaultValue);
      }
    });
  }

  // Método para debouncing de eventos
  debounce(key, func, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    const timer = setTimeout(func, delay);
    this.debounceTimers.set(key, timer);
  }

  initializeElements() {
    this.elements = {
      popup: document.getElementById("popup"),
      ajustesBtn: document.getElementById("ajustes-btn"),
      cerrarPopup: document.getElementById("cerrar-popup"),
      idiomaSelect: document.getElementById("idioma"),
      modoOscuroCheckbox: document.getElementById("modo-oscuro"),
      colorTemaInput: document.getElementById("color-tema"),
      decoracionRelojCheckbox: document.getElementById("decoracion-reloj"),
      colorRelojInput: document.getElementById("color-reloj"),
      mostrarRelojCheckbox: document.getElementById("mostrar-reloj"),
      mostrarBusquedaCheckbox: document.getElementById("mostrar-busqueda"),
      posicionFavoritosRadios: document.getElementsByName("posicion-favoritos"),
      fondoInput: document.getElementById("fondo-url"),
      guardarFondoBtn: document.getElementById("guardar-fondo-url"),
      fondoFileInput: document.getElementById("fondo-file"),
      guardarFondoFileBtn: document.getElementById("guardar-fondo-file"),
      previewContainer: document.getElementById("preview-container"),
      previewImage: document.getElementById("preview-image"),
      relojContainer: document.querySelector(".reloj-container"),
      reloj: document.getElementById("reloj"),
      favoritosContainer: document.getElementById("favoritos-container"),
      searchContainer: document.querySelector(".search-container"),
      fuentePaginaSelect: document.getElementById("fuente-pagina"),
    };
  }

  bindEvents() {
    // Eventos del popup de ajustes
    if (this.elements.ajustesBtn)
      this.elements.ajustesBtn.addEventListener("click", () =>
        this.togglePopup(true)
      );
    if (this.elements.cerrarPopup)
      this.elements.cerrarPopup.addEventListener("click", () =>
        this.togglePopup(false)
      );
    if (this.elements.fuentePaginaSelect)
      this.elements.fuentePaginaSelect.addEventListener("change", (e) =>
        this.updateFont(e.target.value)
      );

    // Eventos de configuración
    if (this.elements.idiomaSelect)
      this.elements.idiomaSelect.addEventListener("change", (e) =>
        this.updateLanguage(e.target.value)
      );

    if (this.elements.modoOscuroCheckbox)
      this.elements.modoOscuroCheckbox.addEventListener("change", (e) =>
        this.updateDarkMode(e.target.checked)
      );
    if (this.elements.colorTemaInput)
      this.elements.colorTemaInput.addEventListener("input", (e) =>
        this.debounce('themeColor', () => this.updateThemeColor(e.target.value), 150)
      );
    if (this.elements.decoracionRelojCheckbox)
      this.elements.decoracionRelojCheckbox.addEventListener("change", (e) =>
        this.updateClockDecoration(e.target.checked)
      );
    if (this.elements.colorRelojInput)
      this.elements.colorRelojInput.addEventListener("input", (e) =>
        this.debounce('clockColor', () => this.updateClockColor(e.target.value), 150)
      );
    if (this.elements.mostrarRelojCheckbox)
      this.elements.mostrarRelojCheckbox.addEventListener("change", (e) =>
        this.updateClockVisibility(e.target.checked)
      );
    if (this.elements.mostrarBusquedaCheckbox)
      this.elements.mostrarBusquedaCheckbox.addEventListener("change", (e) =>
        this.updateSearchVisibility(e.target.checked)
      );
    if (this.elements.posicionFavoritosRadios) {
      Array.from(this.elements.posicionFavoritosRadios).forEach((radio) => {
        radio.addEventListener("change", (e) =>
          this.updateFavoritesPosition(e.target.value)
        );
      });
    }
    if (this.elements.guardarFondoBtn)
      this.elements.guardarFondoBtn.addEventListener("click", () =>
        this.updateBackground()
      );

    // Eventos para subir archivos de fondo
    if (this.elements.fondoFileInput)
      this.elements.fondoFileInput.addEventListener("change", (e) =>
        this.handleFileUpload(e)
      );
    if (this.elements.guardarFondoFileBtn)
      this.elements.guardarFondoFileBtn.addEventListener("click", () =>
        this.useUploadedBackground()
      );

    // Eventos para fondos predeterminados
    document.querySelectorAll(".fondo-predeterminado img").forEach((img) => {
      img.addEventListener("error", () => {
        const fallbackSrc = img.dataset.fallback;
        if (fallbackSrc) {
          img.src = fallbackSrc;
        }
      });
      img.addEventListener("click", () =>
        this.updateBackground(img.dataset.image)
      );
    });
  }

  loadSettings() {
    // Cargar configuraciones guardadas en lote para mejor rendimiento
    const settings = {
      language: localStorage.getItem("idioma"),
      darkMode: localStorage.getItem("modo-oscuro"),
      themeColor: localStorage.getItem("color-tema"),
      clockDecoration: localStorage.getItem("decoracion-reloj"),
      clockColor: localStorage.getItem("color-reloj"),
      clockVisibility: localStorage.getItem("mostrar-reloj"),
      searchVisibility: localStorage.getItem("mostrar-busqueda"),
      favoritesPosition: localStorage.getItem("posicion-favoritos"),
      backgroundUrl: localStorage.getItem("fondo-url"),
      font: localStorage.getItem("fuente-pagina")
    };

    // Aplicar configuraciones
    this.applySettings(settings);
  }

  applySettings(settings) {
    // Cargar todas las configuraciones, usando valores por defecto si no existen
    this.loadLanguage();
    this.loadDarkMode();
    this.loadThemeColor();
    this.loadThemeHoverColor();
    this.loadClockDecoration();
    this.loadClockColor();
    this.loadClockVisibility();
    this.loadSearchVisibility();
    this.loadFavoritesPosition();
    this.loadBackground();
    this.loadFont();
  }

  // Métodos de actualización de configuración
  togglePopup(show) {
    this.elements.popup.style.display = show ? "block" : "none";
  }

  // Métodos para manejar la fuente
  updateFont(font) {
    document.documentElement.style.setProperty("--fuente-pagina", font);
    localStorage.setItem("fuente-pagina", font);
  }

  loadFont() {
    const savedFont = localStorage.getItem("fuente-pagina") || "Arial, sans-serif";
    if (this.elements.fuentePaginaSelect) {
      this.elements.fuentePaginaSelect.value = savedFont;
    }
    this.updateFont(savedFont);
  }

  async loadTranslations() {
    try {
      const response = await fetch("../translations/lang.json");
      this.translations = await response.json();
    } catch (error) {
      console.error("Error al cargar las traducciones:", error);
    }
  }

  updateLanguage(language) {
    localStorage.setItem("idioma", language);
    // Usar TranslationManager para actualizar todos los textos
    import("../translations/translations.js").then((module) => {
      const TranslationManager = module.default;
      TranslationManager.updateLanguage(language);
    });
    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: language })
    );
  }

  applyTranslations(language) {
    if (!this.translations[language]) return;

    const translations = this.translations[language];

    // Actualizar textos de elementos basados en atributos data-translate
    document.querySelectorAll("[data-translate]").forEach((element) => {
      const key = element.getAttribute("data-translate");
      if (translations[key]) {
        if (element.tagName === "INPUT" && element.type === "placeholder") {
          element.placeholder = translations[key];
        } else {
          element.textContent = translations[key];
        }
      }
    });
  }

  updateClockColor(color) {
    document.documentElement.style.setProperty("--color-reloj", color);
    localStorage.setItem("colorReloj", color);
  }

  loadClockColor() {
    const savedColor = localStorage.getItem("colorReloj") || "#ffffff";
    if (this.elements.colorRelojInput) {
      this.elements.colorRelojInput.value = savedColor;
    }
    document.documentElement.style.setProperty("--color-reloj", savedColor);
  }

  updateFavoritesPosition(position) {
    const container = this.elements.favoritosContainer;
    const ajustesBtn = this.elements.ajustesBtn;
    const notasBtn = document.getElementById("ver-notas-btn");

    container.classList.remove(
      "favoritos-derecha",
      "favoritos-izquierda",
      "favoritos-oculto",
      "favoritos-bottom"
    );
    ajustesBtn.classList.remove("ajustes-derecha", "ajustes-izquierda");
    notasBtn.classList.remove("ajustes-derecha", "ajustes-izquierda");

    switch (position) {
      case "derecha":
        container.classList.add("favoritos-derecha");
        ajustesBtn.classList.add("ajustes-izquierda");
        notasBtn.classList.add("ajustes-izquierda");
        break;
      case "izquierda":
        container.classList.add("favoritos-izquierda");
        ajustesBtn.classList.add("ajustes-derecha");
        notasBtn.classList.add("ajustes-derecha");
        break;
      case "bottom":
        container.classList.add("favoritos-bottom");
        ajustesBtn.classList.add("ajustes-izquierda");
        notasBtn.classList.add("ajustes-izquierda");
        break;
      case "oculto":
        container.classList.add("favoritos-oculto");
        ajustesBtn.classList.add("ajustes-izquierda");
        notasBtn.classList.add("ajustes-izquierda");
        break;
    }

    localStorage.setItem("posicionFavoritos", position);
  }

  loadFavoritesPosition() {
    const position = localStorage.getItem("posicionFavoritos") || "bottom";
    if (this.elements.posicionFavoritosSelect) {
      this.elements.posicionFavoritosSelect.value = position;
    }
    this.updateFavoritesPosition(position);
  }

  updateSearchEngine(engine) {
    localStorage.setItem("buscadorSeleccionado", engine);
  }

  updateDarkMode(enabled) {
    localStorage.setItem("modoOscuro", enabled);
    document.documentElement.style.setProperty(
      "--color-modelight",
      enabled ? "var(--color-modedark)" : "#fefefecb"
    );
    document.documentElement.style.setProperty(
      "--color-modelight1",
      enabled ? "var(--color-modedark1)" : "#e2e2e2cc"
    );
    document.documentElement.style.setProperty(
      "--color-letrasdark",
      enabled ? "var(--color-letraswhite)" : "#161616"
    );
    document.dispatchEvent(
      new CustomEvent("darkModeChanged", { detail: enabled })
    );
  }

  updateThemeColor(color) {
    const colorMasOscuro = this.calcularColorMasOscuro(color, -0.2);
    const hoverColor = localStorage.getItem("colorBotonesHover") || "#802447";
    
    document.documentElement.style.setProperty("--color-botones", color);
    document.documentElement.style.setProperty(
      "--color-botones-hover",
      colorMasOscuro
    );
    localStorage.setItem("colorBotones", color);
    localStorage.setItem("colorBotonesHover", colorMasOscuro);
  }

  updateClockDecoration(enabled) {
    localStorage.setItem("decoracionReloj", enabled);
    const relojElement = document.querySelector("h1");
    if (enabled) {
      relojElement.style.animation =
        "textGlow 2s ease-in-out infinite alternate";
    } else {
      relojElement.style.animation = "none";
    }
  }

  updateBackground(url) {
    url = url || this.elements.fondoInput.value;
    if (url) {
      document.body.style.backgroundImage = url.startsWith("http")
        ? `url(${url})`
        : `url(../${url})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      localStorage.setItem("fondo-url", url);
    }
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        // Mostrar preview
        this.elements.previewImage.src = base64Data;
        this.elements.previewContainer.style.display = 'block';
        // Guardar en localStorage temporalmente
        localStorage.setItem('temp-uploaded-background', base64Data);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor selecciona un archivo de imagen válido.');
    }
  }

  useUploadedBackground() {
    const base64Data = localStorage.getItem('temp-uploaded-background');
    if (base64Data) {
      document.body.style.backgroundImage = `url(${base64Data})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      localStorage.setItem("fondo-url", base64Data);
      localStorage.removeItem('temp-uploaded-background');
      // Ocultar preview
      this.elements.previewContainer.style.display = 'none';
    }
  }

  // Métodos de carga de configuración
  loadLanguage() {
    const language = localStorage.getItem("idioma") || "en";
    if (this.elements.idiomaSelect) {
      this.elements.idiomaSelect.value = language;
    }
    this.updateLanguage(language);
  }

  loadDarkMode() {
    const enabled = localStorage.getItem("modoOscuro") === "true";
    if (this.elements.modoOscuroCheckbox) {
      this.elements.modoOscuroCheckbox.checked = enabled;
    }
    this.updateDarkMode(enabled);
  }

  loadThemeColor() {
    const color = localStorage.getItem("colorBotones") || "#b3336b";
    let displayColor = color;
    
    // Convertir HSL a hexadecimal si es necesario para el input de color
    if (color.startsWith('hsl')) {
      const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (hslMatch) {
        const [, h, s, l] = hslMatch.map(Number);
        displayColor = this.hslToHex(h, s, l);
      }
    }
    
    if (this.elements.colorTemaInput) {
      this.elements.colorTemaInput.value = displayColor;
    }
    this.updateThemeColor(color);
  }

  loadThemeHoverColor() {
    const hoverColor = localStorage.getItem("colorBotonesHover") || "#802447";
    document.documentElement.style.setProperty("--color-botones-hover", hoverColor);
  }

  loadClockDecoration() {
    const enabled = localStorage.getItem("decoracionReloj") === "true";
    if (this.elements.decoracionRelojCheckbox) {
      this.elements.decoracionRelojCheckbox.checked = enabled;
    }
    this.updateClockDecoration(enabled);
  }

  loadBackground() {
    const url = localStorage.getItem("fondo-url");
    if (url) {
      if (url.startsWith('data:image/')) {
        // Es una imagen base64
        document.body.style.backgroundImage = `url(${url})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
      } else {
        // Es una URL normal
        this.updateBackground(url);
      }
    } else {
      // Aplicar fondo por defecto si no hay uno guardado
      document.body.style.backgroundImage = "url('./fondos/background2.png')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    }
  }

  updateClockVisibility(visible) {
    localStorage.setItem("mostrarReloj", visible);
    if (this.elements.relojContainer) {
      this.elements.relojContainer.style.display = visible ? "block" : "none";
    }
  }

  loadClockVisibility() {
    const isVisible = localStorage.getItem("relojVisible") !== "false";
    if (this.elements.relojVisibleCheckbox) {
      this.elements.relojVisibleCheckbox.checked = isVisible;
    }
    this.updateClockVisibility(isVisible);
  }

  updateSearchVisibility(isVisible) {
    const searchContainer = document.querySelector(".search-container");
    if (searchContainer) {
      searchContainer.style.display = isVisible ? "block" : "none";
    }
    localStorage.setItem("buscadorVisible", isVisible);
  }

  loadSearchVisibility() {
    const isVisible = localStorage.getItem("buscadorVisible") !== "false";
    if (this.elements.buscadorVisibleCheckbox) {
      this.elements.buscadorVisibleCheckbox.checked = isVisible;
    }
    this.updateSearchVisibility(isVisible);
  }

  // Utilidades
  hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  calcularColorMasOscuro(color, porcentaje) {
    const f = parseInt(color.slice(1), 16);
    const t = porcentaje < 0 ? 0 : 255;
    const p = porcentaje < 0 ? porcentaje * -1 : porcentaje;
    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;
    return (
      "#" +
      (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
      )
        .toString(16)
        .slice(1)
    );
  }
}

export const settingsManager = new SettingsManager();
