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
            notatitle.innerHTML = `${this.translations[language]?.verNotas || 'Notes'} <i class="fa-regular fa-note-sticky"></i>`;
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
            destacarNotaCheckboxLabel.innerHTML = `<input type="checkbox" id="destacar-nota"><i class="fa-solid fa-thumbtack"></i> &nbsp;${this.translations[language]?.destacarNota || 'Pin Note'}`;
        }

        const eliminarNotaBtn = document.getElementById('eliminar-nota-btn');
        if (eliminarNotaBtn) {
            eliminarNotaBtn.innerHTML = `${this.translations[language]?.eliminarNota || 'Delete Note'} <i class="fa-solid fa-trash"></i>`;
        }

        const exportarNotaBtn = document.getElementById('exportar-nota-btn');
        if (exportarNotaBtn) {
            exportarNotaBtn.innerHTML = `${this.translations[language]?.exportarNota || 'Export Note'} &nbsp;<i class="fa-solid fa-file-arrow-down fa-lg"></i>`;
        }

        const fechaNotaLabel = document.querySelector('label[for="fecha-nota"]');
        if (fechaNotaLabel) {
            fechaNotaLabel.innerHTML = this.translations[language]?.important_date || 'Important Date (Optional)';
        }

        const guardarNotaBtn = document.getElementById('guardar-nota-btn');
        if (guardarNotaBtn) {
            guardarNotaBtn.innerHTML = `${this.translations[language]?.guardarNota || 'Save Note'} <i class="fa-solid fa-floppy-disk"></i>`;
        }

        const cerrarMenuBtn = document.getElementById('cerrar-menu-btn');
        if (cerrarMenuBtn) {
            cerrarMenuBtn.innerHTML = this.translations[language]?.cerrarMenu || 'Close';
        }

        // Traducir elementos del popup agregar-favorito
        const agregarFavoritoTitulo = document.querySelector('#agregar-favorito h3');
        if (agregarFavoritoTitulo) {
            agregarFavoritoTitulo.innerHTML = this.translations[language]?.agregarFavorito || 'Add to Favorites';
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
            agregarBtn.innerHTML = this.translations[language]?.agregarBtn || 'Add';
        }

        const cerrarPopupFavorito = document.getElementById('cerrar-popup-favorito');
        if (cerrarPopupFavorito) {
            cerrarPopupFavorito.innerHTML = this.translations[language]?.cerrarPopup || 'Close';
        }

        // Traducir elementos del popup de ajustes
        const ajustesTitulo = document.querySelector('#ajustes-titulo');
        if (ajustesTitulo) {
            ajustesTitulo.innerHTML = this.translations[language]?.ajustes || 'Settings';
        }

        const idiomaLabel = document.querySelector('label[for="idioma"]');
        if (idiomaLabel) {
            idiomaLabel.innerHTML = this.translations[language]?.idioma || 'Select Language:';
        }

        const buscadorLabel = document.querySelector('label[for="buscador"]');
        if (buscadorLabel) {
            buscadorLabel.innerHTML = this.translations[language]?.buscador || 'Select Search Engine:';
        }

        const fondoUrlLabel = document.querySelector('label[for="fondo-url"]');
        if (fondoUrlLabel) {
            fondoUrlLabel.innerHTML = this.translations[language]?.guardarFondo || 'Save Background';
        }

        const modoOscuroLabel = document.querySelector('label[for="modo-oscuro"]');
        if (modoOscuroLabel) {
            modoOscuroLabel.innerHTML = this.translations[language]?.modoOscuro || 'Dark Mode:';
        }

        const colorTemaLabel = document.querySelector('label[for="color-tema"]');
        if (colorTemaLabel) {
            colorTemaLabel.innerHTML = this.translations[language]?.colorTema || 'Theme Color:';
        }

        const decoracionRelojLabel = document.querySelector('label[for="decoracion-reloj"]');
        if (decoracionRelojLabel) {
            decoracionRelojLabel.innerHTML = this.translations[language]?.decoracionReloj || 'Clock Decoration:';
        }

        // Traducir botón ver-notas
        const verNotasBtn = document.getElementById('ver-notas-btn');
        if (verNotasBtn) {
            verNotasBtn.innerHTML = this.translations[language]?.verNotas || 'Notes';
        }

        // Disparar evento de cambio de idioma
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
    }
}

// Crear y exportar una instancia única del TranslationManager
const translationManager = new TranslationManager();
export default translationManager;