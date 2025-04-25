// Módulo de traducciones
class TranslationManager {
    constructor() {
        this.translations = null;
        this.currentLanguage = localStorage.getItem('idioma') || 'en';
        this.init();
    }

    init() {
        this.loadTranslations();
        this.setupLanguageSelector();
    }

    loadTranslations() {
        fetch('./translations/lang.json')
            .then((response) => response.json())
            .then((data) => {
                this.translations = data;
                this.updateLanguage(this.currentLanguage);
            })
            .catch((error) => console.error('Error al cargar las traducciones:', error));
    }

    setupLanguageSelector() {
        const idiomaSelect = document.getElementById('idioma');
        if (idiomaSelect) {
            idiomaSelect.value = this.currentLanguage;
            idiomaSelect.addEventListener('change', (e) => {
                this.updateLanguage(e.target.value);
            });
        }
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

    updateLanguage(language) {
        if (!this.translations || !this.translations[language]) return;
        
        this.currentLanguage = language;
        localStorage.setItem('idioma', language);
        
        // Actualizar título y elementos básicos
        document.title = this.translations[language]?.titulo || 'New Tab';
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = this.translations[language]?.placeholderGoogle || 'Search...';
        }

        const tituloFavoritos = document.getElementById('titulo-favoritos');
        if (tituloFavoritos) {
            tituloFavoritos.textContent = this.translations[language]?.favoritos || 'Favorites';
        }

        // Traducir elementos del menú de notas
        const notatitle = document.querySelector('.notatitle');
        if (notatitle) {
            this.setElementContent(notatitle, this.translations[language]?.verNotas || 'Notes', 'fa-regular fa-note-sticky');
        }

        const noteDetails = document.querySelector('.note-details');
        if (noteDetails) {
            noteDetails.textContent = this.translations[language]?.note_details || 'Note Details';
        }

        const tituloNota = document.getElementById('titulo-nota');
        if (tituloNota) {
            tituloNota.placeholder = this.translations[language]?.tituloNota || 'Title of the Note';
        }

        const contenidoNota = document.getElementById('contenido-nota');
        if (contenidoNota) {
            contenidoNota.placeholder = this.translations[language]?.contenidoNota || 'Content of the Note';
        }

        const destacarNotaCheckboxLabel = document.querySelector('.destacar-notachekbox label');
        if (destacarNotaCheckboxLabel) {
            destacarNotaCheckboxLabel.textContent = '';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'destacar-nota';
            destacarNotaCheckboxLabel.appendChild(checkbox);
            destacarNotaCheckboxLabel.appendChild(this.createIconElement('fa-solid fa-thumbtack'));
            destacarNotaCheckboxLabel.appendChild(document.createTextNode(' ' + (this.translations[language]?.destacarNota || 'Pin Note')));
        }

        const eliminarNotaBtn = document.getElementById('eliminar-nota-btn');
        if (eliminarNotaBtn) {
            this.setElementContent(eliminarNotaBtn, this.translations[language]?.eliminarNota || 'Delete Note', 'fa-solid fa-trash');
        }

        const exportarNotaBtn = document.getElementById('exportar-nota-btn');
        if (exportarNotaBtn) {
            this.setElementContent(exportarNotaBtn, this.translations[language]?.exportarNota || 'Export Note', 'fa-solid fa-file-arrow-down fa-lg');
        }

        const fechaNotaLabel = document.querySelector('label[for="fecha-nota"]');
        if (fechaNotaLabel) {
            fechaNotaLabel.textContent = this.translations[language]?.important_date || 'Important Date (Optional)';
        }

        const guardarNotaBtn = document.getElementById('guardar-nota-btn');
        if (guardarNotaBtn) {
            this.setElementContent(guardarNotaBtn, this.translations[language]?.guardarNota || 'Save Note', 'fa-solid fa-floppy-disk');
        }

        const cerrarMenuBtn = document.getElementById('cerrar-menu-btn');
        if (cerrarMenuBtn) {
            cerrarMenuBtn.textContent = this.translations[language]?.cerrarMenu || 'Close';
        }

        // Traducir elementos del popup agregar-favorito
        const agregarFavoritoTitulo = document.querySelector('#agregar-favorito h3');
        if (agregarFavoritoTitulo) {
            agregarFavoritoTitulo.textContent = this.translations[language]?.agregarFavorito || 'Add to Favorites';
        }

        const nombreFavorito = document.getElementById('nombre-favorito');
        if (nombreFavorito) {
            nombreFavorito.placeholder = this.translations[language]?.nombreFavorito || 'Site Name';
        }

        const urlFavorito = document.getElementById('url-favorito');
        if (urlFavorito) {
            urlFavorito.placeholder = this.translations[language]?.urlFavorito || 'Site URL';
        }

        const agregarBtn = document.getElementById('agregar-btn');
        if (agregarBtn) {
            agregarBtn.textContent = this.translations[language]?.agregarBtn || 'Add';
        }

        const cerrarPopupFavorito = document.getElementById('cerrar-popup-favorito');
        if (cerrarPopupFavorito) {
            cerrarPopupFavorito.textContent = this.translations[language]?.cerrarPopup || 'Close';
        }

        // Traducir elementos del popup de ajustes
        const ajustesTitulo = document.querySelector('#ajustes-titulo');
        if (ajustesTitulo) {
            ajustesTitulo.textContent = this.translations[language]?.ajustes || 'Settings';
        }

        const idiomaLabel = document.querySelector('label[for="idioma"]');
        if (idiomaLabel) {
            idiomaLabel.textContent = this.translations[language]?.idioma || 'Select Language:';
        }

        const buscadorLabel = document.querySelector('label[for="buscador"]');
        if (buscadorLabel) {
            buscadorLabel.textContent = this.translations[language]?.buscador || 'Select Search Engine:';
        }

        const fondoUrlLabel = document.querySelector('label[for="fondo-url"]');
        if (fondoUrlLabel) {
            fondoUrlLabel.textContent = this.translations[language]?.guardarFondo || 'Save Background';
        }

        const modoOscuroLabel = document.querySelector('label[for="modo-oscuro"]');
        if (modoOscuroLabel) {
            modoOscuroLabel.textContent = this.translations[language]?.modoOscuro || 'Dark Mode:';
        }

        const colorTemaLabel = document.querySelector('label[for="color-tema"]');
        if (colorTemaLabel) {
            colorTemaLabel.textContent = this.translations[language]?.colorTema || 'Theme Color:';
        }

        const decoracionRelojLabel = document.querySelector('label[for="decoracion-reloj"]');
        if (decoracionRelojLabel) {
            decoracionRelojLabel.textContent = this.translations[language]?.decoracionReloj || 'Clock Decoration:';
        }

        // Traducir botón ver-notas
        const verNotasBtn = document.getElementById('ver-notas-btn');
        if (verNotasBtn) {
            verNotasBtn.textContent = this.translations[language]?.verNotas || 'Notes';
        }

        // Disparar evento de cambio de idioma
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
    }
}

// Crear y exportar una instancia única del TranslationManager
const translationManager = new TranslationManager();
export default translationManager;