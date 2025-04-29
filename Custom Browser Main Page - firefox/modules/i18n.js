// Módulo de Internacionalización
import State from './state.js';

class I18nManager {
  constructor() {
    this.translations = null;
    this.currentLanguage = State.getState().idioma || 'en';
  }

  async loadTranslations() {
    try {
      const response = await fetch('lang.json');
      this.translations = await response.json();
      return this.translations;
    } catch (error) {
      console.error('Error al cargar las traducciones:', error);
      return null;
    }
  }

  setLanguage(language) {
    this.currentLanguage = language;
    State.setState({ idioma: language });
    this.updateAllTranslations();
  }

  translate(key) {
    if (!this.translations || !this.translations[this.currentLanguage]) {
      return key;
    }
    return this.translations[this.currentLanguage][key] || key;
  }

  updateAllTranslations() {
    // Actualizar título de la página
    document.title = this.translate('titulo');

    // Actualizar elementos de búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.placeholder = this.translate('placeholderGoogle');
    }

    // Actualizar elementos de notas
    this.updateNotesTranslations();

    // Actualizar elementos de favoritos
    this.updateFavoritesTranslations();

    // Actualizar elementos de configuración
    this.updateSettingsTranslations();
  }

  createIconElement(className) {
    const icon = document.createElement('i');
    icon.className = className;
    return icon;
  }

  setElementContent(element, text, iconClass = null) {
    element.textContent = '';
    element.textContent = text;
    if (iconClass) {
      element.appendChild(document.createTextNode(' '));
      element.appendChild(this.createIconElement(iconClass));
    }
  }

  updateNotesTranslations() {
    const elements = {
      notatitle: '.notatitle',
      noteDetails: '.note-details',
      tituloNota: '#titulo-nota',
      contenidoNota: '#contenido-nota',
      destacarNotaLabel: '.destacar-notachekbox label',
      eliminarNotaBtn: '#eliminar-nota-btn',
      exportarNotaBtn: '#exportar-nota-btn',
      fechaNotaLabel: 'label[for="fecha-nota"]',
      guardarNotaBtn: '#guardar-nota-btn',
      cerrarMenuBtn: '#cerrar-menu-btn',
      verNotasBtn: '#ver-notas-btn'
    };

    Object.entries(elements).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (element) {
        switch (key) {
          case 'notatitle':
            this.setElementContent(element, this.translate('verNotas'), 'fa-regular fa-note-sticky');
            break;
          case 'destacarNotaLabel':
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'destacar-nota';
            element.textContent = '';
            element.appendChild(checkbox);
            element.appendChild(this.createIconElement('fa-solid fa-thumbtack'));
            element.appendChild(document.createTextNode(' ' + this.translate('destacarNota')));
            break;
          case 'eliminarNotaBtn':
            this.setElementContent(element, this.translate('eliminarNota'), 'fa-solid fa-trash');
            break;
          case 'exportarNotaBtn':
            this.setElementContent(element, this.translate('exportarNota'), 'fa-solid fa-file-arrow-down fa-lg');
            break;
          case 'guardarNotaBtn':
            this.setElementContent(element, this.translate('guardarNota'), 'fa-solid fa-floppy-disk');
            break;
          default:
            if (element.placeholder !== undefined) {
              element.placeholder = this.translate(key);
            } else {
              element.textContent = this.translate(key);
            }
        }
      }
    });
  }

  updateFavoritesTranslations() {
    const elements = {
      tituloFavoritos: '#titulo-favoritos',
      agregarFavoritoTitulo: '#agregar-favorito h3',
      nombreFavorito: '#nombre-favorito',
      urlFavorito: '#url-favorito',
      agregarBtn: '#agregar-btn',
      cerrarPopupFavorito: '#cerrar-popup-favorito'
    };

    Object.entries(elements).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (element) {
        if (element.placeholder !== undefined) {
          element.placeholder = this.translate(key);
        } else {
          element.textContent = this.translate(key);
        }
      }
    });
  }

  updateSettingsTranslations() {
    const elements = {
      ajustesTitulo: '#ajustes-titulo',
      idiomaLabel: 'label[for="idioma"]',
      buscadorLabel: 'label[for="buscador"]',
      fondoUrlLabel: 'label[for="fondo-url"]',
      modoOscuroLabel: 'label[for="modo-oscuro"]',
      colorTemaLabel: 'label[for="color-tema"]',
      decoracionRelojLabel: 'label[for="decoracion-reloj"]'
    };

    Object.entries(elements).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = this.translate(key.replace('Label', ''));
      }
    });
  }
}

export const i18n = new I18nManager();