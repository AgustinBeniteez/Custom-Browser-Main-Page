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
        this.updateThemeColor(e.target.value)
      );
    if (this.elements.decoracionRelojCheckbox)
      this.elements.decoracionRelojCheckbox.addEventListener("change", (e) =>
        this.updateClockDecoration(e.target.checked)
      );
    if (this.elements.colorRelojInput)
      this.elements.colorRelojInput.addEventListener("input", (e) =>
        this.updateClockColor(e.target.value)
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
    // Cargar configuraciones guardadas
    this.loadLanguage();
    this.loadDarkMode();
    this.loadThemeColor();
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
    const savedFont = localStorage.getItem("fuente-pagina");
    if (savedFont && this.elements.fuentePaginaSelect) {
      this.elements.fuentePaginaSelect.value = savedFont;
      this.updateFont(savedFont);
    }
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
    this.elements.colorRelojInput.value = savedColor;
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
    const savedPosition =
      localStorage.getItem("posicionFavoritos") || "derecha";
    const radioToSelect = Array.from(
      this.elements.posicionFavoritosRadios
    ).find((radio) => radio.value === savedPosition);
    if (radioToSelect) {
      radioToSelect.checked = true;
    }
    this.updateFavoritesPosition(savedPosition);
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
    this.elements.idiomaSelect.value = language;
    this.updateLanguage(language);
  }

  loadDarkMode() {
    const enabled = localStorage.getItem("modoOscuro") === "true";
    this.elements.modoOscuroCheckbox.checked = enabled;
    this.updateDarkMode(enabled);
  }

  loadThemeColor() {
    const color = localStorage.getItem("colorBotones");
    if (color) {
      this.elements.colorTemaInput.value = color;
      this.updateThemeColor(color);
    }
  }

  loadClockDecoration() {
    const enabled = localStorage.getItem("decoracionReloj") !== "false";
    this.elements.decoracionRelojCheckbox.checked = enabled;
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
    }
  }

  updateClockVisibility(visible) {
    localStorage.setItem("mostrarReloj", visible);
    if (this.elements.relojContainer) {
      this.elements.relojContainer.style.display = visible ? "block" : "none";
    }
  }

  loadClockVisibility() {
    const visible = localStorage.getItem("mostrarReloj") !== "false";
    if (this.elements.mostrarRelojCheckbox) {
      this.elements.mostrarRelojCheckbox.checked = visible;
    }
    this.updateClockVisibility(visible);
  }

  updateSearchVisibility(visible) {
    localStorage.setItem("mostrarBusqueda", visible);
    if (this.elements.searchContainer) {
      this.elements.searchContainer.style.display = visible ? "block" : "none";
    }
  }

  loadSearchVisibility() {
    const visible = localStorage.getItem("mostrarBusqueda") !== "false";
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
