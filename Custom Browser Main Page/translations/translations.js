// Módulo de traducciones
class TranslationManager {
  constructor() {
    this.translations = null;
    // Leer idioma guardado; si no existe, detectar del navegador
    const saved = localStorage.getItem("idioma");
    if (saved) {
      this.currentLanguage = saved;
    } else {
      const browserLang = (navigator.language || 'en').split('-')[0].toLowerCase();
      const supported = ['en', 'es', 'val', 'fr', 'ru', 'zh', 'ja', 'ko'];
      this.currentLanguage = supported.includes(browserLang) ? browserLang : 'en';
    }
    this.translationCache = new Map();
    this.isLoading = false;
    this.init();
  }

  init() {
    this.loadTranslations();
  }

  async loadTranslations() {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const response = await fetch("./translations/lang.json");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.translations = data;
      this.updateLanguage(this.currentLanguage);

    } catch (error) {
      console.error("Error al cargar las traducciones:", error);
      // Fallback a inglés si hay error
      this.currentLanguage = "en";
    } finally {
      this.isLoading = false;
    }
  }

  setupLanguageSelector() {
    const idiomaSelect = document.getElementById("idioma");
    if (idiomaSelect) {
      idiomaSelect.value = this.currentLanguage;
      idiomaSelect.addEventListener("change", (e) => {
        this.updateLanguage(e.target.value);
      });
    }
  }

  createIconElement(className) {
    const icon = document.createElement("i");
    icon.className = className;
    return icon;
  }

  setElementContent(element, text, iconClass = null) {
    element.textContent = "";
    element.textContent = text;
    if (iconClass) {
      element.appendChild(document.createTextNode(" "));
      element.appendChild(this.createIconElement(iconClass));
    }
  }

  updateLanguage(language) {
    if (!this.translations || !this.translations[language]) return;

    this.currentLanguage = language;
    localStorage.setItem("idioma", language);

    // Actualizar título y elementos básicos
    document.title = this.translations[language]?.titulo || "New Tab";

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.placeholder =
        this.translations[language]?.placeholderGoogle || "Search...";
    }

    const tituloFavoritos = document.getElementById("titulo-favoritos");
    if (tituloFavoritos) {
      tituloFavoritos.textContent =
        this.translations[language]?.favoritos || "Favorites";
    }

    // Traducir elementos del menú de notas
    const notatitle = document.querySelector(".notatitle");
    if (notatitle) {
      this.setElementContent(
        notatitle,
        this.translations[language]?.verNotas || "Notes",
        "fa-regular fa-note-sticky"
      );
    }

    const noteDetails = document.querySelector(".note-details");
    if (noteDetails) {
      noteDetails.textContent =
        this.translations[language]?.note_details || "Note Details";
    }

    const tituloNota = document.getElementById("titulo-nota");
    if (tituloNota) {
      tituloNota.placeholder =
        this.translations[language]?.tituloNota || "Title of the Note";
    }

    const contenidoNota = document.getElementById("contenido-nota");
    if (contenidoNota) {
      contenidoNota.placeholder =
        this.translations[language]?.contenidoNota || "Content of the Note";
    }

    const destacarNotaCheckboxLabel = document.querySelector(
      ".destacar-notachekbox label"
    );
    if (destacarNotaCheckboxLabel) {
      destacarNotaCheckboxLabel.textContent = "";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "destacar-nota";
      destacarNotaCheckboxLabel.appendChild(checkbox);
      destacarNotaCheckboxLabel.appendChild(
        this.createIconElement("fa-solid fa-thumbtack")
      );
      destacarNotaCheckboxLabel.appendChild(
        document.createTextNode(
          " " + (this.translations[language]?.destacarNota || "Pin Note")
        )
      );
    }

    const eliminarNotaBtn = document.getElementById("eliminar-nota-btn");
    if (eliminarNotaBtn) {
      this.setElementContent(
        eliminarNotaBtn,
        this.translations[language]?.eliminarNota || "Delete Note",
        "fa-solid fa-trash"
      );
    }

    const exportarNotaBtn = document.getElementById("exportar-nota-btn");
    if (exportarNotaBtn) {
      this.setElementContent(
        exportarNotaBtn,
        this.translations[language]?.exportarNota || "Export Note",
        "fa-solid fa-file-arrow-down fa-lg"
      );
    }

    const fechaNotaLabel = document.querySelector('label[for="fecha-nota"]');
    if (fechaNotaLabel) {
      fechaNotaLabel.textContent =
        this.translations[language]?.important_date ||
        "Important Date (Optional)";
    }

    const fontTitle = document.querySelector('h2[for="font-page"]');
    if (fontTitle) {
      fontTitle.textContent =
        this.translations[language]?.fontpage || "Font Page";
    }
    const selecionarfuentepag = document.querySelector(
      'label[for="selecionarfuentepagina"]'
    );
    if (selecionarfuentepag) {
      selecionarfuentepag.textContent =
        this.translations[language]?.selecionarfuentepagina || "Select Font ";
    }

    const guardarNotaBtn = document.getElementById("guardar-nota-btn");
    if (guardarNotaBtn) {
      this.setElementContent(
        guardarNotaBtn,
        this.translations[language]?.guardarNota || "Save Note",
        "fa-solid fa-floppy-disk"
      );
    }

    // Traducir elementos del popup agregar-favorito
    const agregarFavoritoTitulo = document.querySelector(
      "#agregar-favorito h3"
    );
    if (agregarFavoritoTitulo) {
      agregarFavoritoTitulo.textContent =
        this.translations[language]?.agregarFavorito || "Add to Favorites";
    }

    const nombreFavorito = document.getElementById("nombre-favorito");
    if (nombreFavorito) {
      nombreFavorito.placeholder =
        this.translations[language]?.nombreFavorito || "Site Name";
    }

    const urlFavorito = document.getElementById("url-favorito");
    if (urlFavorito) {
      urlFavorito.placeholder =
        this.translations[language]?.urlFavorito || "Site URL";
    }

    const agregar = document.getElementById("addbutton");
    if (agregar) {
      agregar.textContent = this.translations[language]?.addbutton || "Add";
    }

    const cerrarPopupFavorito = document.getElementById(
      "cerrar-popup-favorito"
    );
    if (cerrarPopupFavorito) {
      cerrarPopupFavorito.textContent =
        this.translations[language]?.cerrarPopup || "Close";
    }

    // Traducir elementos del popup de ajustes
    const cerrarPopupSettings = document.getElementById("cerrar-menu-btn");
    if (cerrarPopupSettings) {
      cerrarPopupSettings.textContent =
        this.translations[language]?.cerrarPopup || "Close";
    }
    const cerrarPopupNotas = document.getElementById("cerrar-notas-btn");
    if (cerrarPopupNotas) {
      cerrarPopupNotas.textContent =
        this.translations[language]?.cerrarPopup || "Close";
    }

    const ajustesTitulo = document.querySelector("#ajustes-titulo");
    if (ajustesTitulo) {
      ajustesTitulo.textContent =
        this.translations[language]?.ajustes || "Settings";
    }

    const idiomaLabel = document.querySelector('label[for="idioma"]');
    if (idiomaLabel) {
      idiomaLabel.textContent =
        this.translations[language]?.idioma || "Select Language:";
    }

    const buscadorLabel = document.querySelector('label[for="buscador"]');
    if (buscadorLabel) {
      buscadorLabel.textContent =
        this.translations[language]?.buscador || "Select Search Engine:";
    }

    const fondoUrlLabel = document.querySelector('label[for="fondo-url"]');
    if (fondoUrlLabel) {
      fondoUrlLabel.textContent =
        this.translations[language]?.guardarFondo || "Save Background";
    }

    const fondoTitulo = document.querySelector('h2[for="fondo"]');
    if (fondoTitulo) {
      fondoTitulo.textContent =
        this.translations[language]?.Fondo || "Background";
    }

    const choosebackground = document.querySelector(
      'label[for="choose-background"]'
    );
    if (choosebackground) {
      choosebackground.textContent =
        this.translations[language]?.cambiarfondo || "Choose a background:";
    }

    const usarFondoUrlbtn = document.querySelector(
      'button[id="guardar-fondo-url"]'
    );
    if (usarFondoUrlbtn) {
      usarFondoUrlbtn.textContent =
        this.translations[language]?.usarFondoUrl || "Use Background URL:";
    }

    const backgroundFileLabel = document.querySelector('label[for="fondo-file"]');
    if (backgroundFileLabel) {
      backgroundFileLabel.textContent =
        this.translations[language]?.backgroundFileLabel || "Or upload your own image:";
    }

    const useBackgroundFileBtn = document.querySelector(
      'button[id="guardar-fondo-file"]'
    );
    if (useBackgroundFileBtn) {
      useBackgroundFileBtn.textContent =
        this.translations[language]?.useBackgroundFile || "Use Uploaded Image";
    }

    const settingsTitle = document.querySelector('h2[for="ajustes"]');
    if (settingsTitle) {
      settingsTitle.textContent =
        this.translations[language]?.ajustes || "Settings";
    }

    const modoOscuroLabel = document.querySelector('label[for="modo-oscuro"]');
    if (modoOscuroLabel) {
      modoOscuroLabel.textContent =
        this.translations[language]?.modoOscuro || "Dark Mode:";
    }

    const colorTemaLabel = document.querySelector('label[for="color-tema"]');
    if (colorTemaLabel) {
      colorTemaLabel.textContent =
        this.translations[language]?.colorTema || "Theme Color:";
    }

    const decoracionRelojLabel = document.querySelector(
      'label[for="decoracion-reloj"]'
    );
    if (decoracionRelojLabel) {
      decoracionRelojLabel.textContent =
        this.translations[language]?.decoracionReloj || "Clock Decoration:";
    }

    const colorRelojLabel = document.querySelector('label[for="color-reloj"]');
    if (colorRelojLabel) {
      colorRelojLabel.textContent =
        this.translations[language]?.colorReloj || "Clock Color:";
    }

    const mostrarRelojLabel = document.querySelector(
      'label[for="mostrar-reloj"]'
    );
    if (mostrarRelojLabel) {
      mostrarRelojLabel.textContent =
        this.translations[language]?.mostrarReloj || "Show Clock:";
    }

    const mostrarBusquedaLabel = document.querySelector(
      'label[for="mostrar-busqueda"]'
    );
    if (mostrarBusquedaLabel) {
      mostrarBusquedaLabel.textContent =
        this.translations[language]?.mostrarBusqueda || "Show Search Bar:";
    }

    const posicionFavoritosLabel = document.querySelector(
      'label[for="posicion-favoritos"]'
    );
    if (posicionFavoritosLabel) {
      posicionFavoritosLabel.textContent =
        this.translations[language]?.posicionFavoritos || "Favorites Position:";
    }

    // Traducir opciones de posición de favoritos
    const posicionDerechaRadio = document.querySelector(
      'span[for="posicionDerecha"]'
    );
    if (posicionDerechaRadio) {
      posicionDerechaRadio.textContent =
        this.translations[language]?.posicionDerecha || "Right";
    }

    const posicionIzquierdaRadio = document.querySelector(
      'span[for="posicionIzquierda"]'
    );
    if (posicionIzquierdaRadio) {
      posicionIzquierdaRadio.textContent =
        this.translations[language]?.posicionIzquierda || "Left";
    }

    const posicionOcultaRadio = document.querySelector(
      'span[for="posicionOculta"]'
    );
    if (posicionOcultaRadio) {
      posicionOcultaRadio.textContent =
        this.translations[language]?.ocultar || "Hide";
    }

    // Traducir elementos del popup de carpetas
    const crearCarpetaBtn = document.getElementById("createfolder-span");
    if (crearCarpetaBtn) {
      crearCarpetaBtn.textContent =
        this.translations[language]?.crearCarpeta || "Create Folder";
    }

    const nombreCarpetaInput = document.getElementById("nombre-carpeta");
    if (nombreCarpetaInput) {
      nombreCarpetaInput.placeholder =
        this.translations[language]?.nombreCarpeta || "Folder Name";
    }

    const descripcionCarpetaInput = document.getElementById(
      "descripcion-carpeta"
    );
    if (descripcionCarpetaInput) {
      descripcionCarpetaInput.placeholder =
        this.translations[language]?.descripcionCarpeta ||
        "Folder Description (Optional)";
    }

    const guardarCarpetaBtn = document.getElementById("guardar-carpeta-btn");
    if (guardarCarpetaBtn) {
      guardarCarpetaBtn.textContent =
        this.translations[language]?.guardarCarpeta || "Save Folder";
    }

    const editarCarpetaBtn = document.getElementById("editar-carpeta-btn");
    if (editarCarpetaBtn) {
      editarCarpetaBtn.textContent =
        this.translations[language]?.editarCarpeta || "Edit Folder";
    }

    const eliminarCarpetaBtn = document.getElementById("eliminar-carpeta-btn");
    if (eliminarCarpetaBtn) {
      eliminarCarpetaBtn.textContent =
        this.translations[language]?.eliminarCarpeta || "Delete Folder";
    }

    const moverALabel = document.querySelector('label[for="mover-a"]');
    if (moverALabel) {
      moverALabel.textContent =
        this.translations[language]?.moverA || "Move to";
    }

    const seleccionarCarpetaLabel = document.querySelector(
      'label[for="seleccionar-carpeta"]'
    );
    if (seleccionarCarpetaLabel) {
      seleccionarCarpetaLabel.textContent =
        this.translations[language]?.seleccionarCarpeta || "Select Folder";
    }

    const sinCarpetaOption = document.querySelector(
      'option[value="sin-carpeta"]'
    );
    if (sinCarpetaOption) {
      sinCarpetaOption.textContent =
        this.translations[language]?.sinCarpeta || "No Folder";
    }

    // Traducir elementos del popup de selección de tipo
    const selectTypeTitle = document.querySelector(
      '[data-translate="select-type-title"]'
    );
    if (selectTypeTitle) {
      selectTypeTitle.textContent =
        this.translations[language]?.selectTypeTitle || "¿Qué deseas crear?";
    }

    const favoritoTipoBtn = document.querySelector("#crear-favorito-btn-span");
    if (favoritoTipoBtn) {
      favoritoTipoBtn.textContent =
        this.translations[language]?.favoritos || "Favorito";
    }

    const cerrarTipoPopup = document.getElementById("cerrar-tipo-popup");
    if (cerrarTipoPopup) {
      cerrarTipoPopup.textContent =
        this.translations[language]?.cerrarPopup || "Close";
    }

    const addFolderTitle = document.querySelector(
      '[data-translate="add-folder-title"]'
    );
    if (addFolderTitle) {
      addFolderTitle.textContent =
        this.translations[language]?.addFolderTitle || "Nueva carpeta";
    }

    // ── Generic data-translate handler ──
    // Automatically translate all elements with [data-translate] attribute
    const lang = this.translations[language];
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (lang[key]) {
        // Only update text nodes, preserve child elements (icons)
        const hasChildElements = el.querySelector('i, svg, img');
        if (hasChildElements) {
          // Find text nodes and update them
          for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              node.textContent = lang[key];
              break;
            }
          }
        } else {
          el.textContent = lang[key];
        }
      }
    });

    // Disparar evento de cambio de idioma
    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: language })
    );
  }
}

// Crear y exportar una instancia única del TranslationManager
const translationManager = new TranslationManager();
export default translationManager;
