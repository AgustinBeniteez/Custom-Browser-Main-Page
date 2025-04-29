// Función para obtener el idioma preferido del usuario
function getUserLanguage() {
    // Primero intentar obtener el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('userLanguage');
    if (savedLanguage) return savedLanguage;

    // Si no hay idioma guardado, detectar el idioma del navegador
    const browserLang = navigator.language.split('-')[0];
    // Verificar si el idioma del navegador está soportado
    const supportedLanguages = ['en', 'es', 'fr', 'ko'];
    return supportedLanguages.includes(browserLang) ? browserLang : 'en';
}

// Variable global para almacenar las traducciones
let translations = {};

// Función para cargar las traducciones
async function loadTranslations() {
    try {
        const response = await fetch('translations.json');
        translations = await response.json();
        applyTranslations();
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Función para aplicar las traducciones
function applyTranslations() {
    const currentLang = getUserLanguage();
    const currentTranslations = translations[currentLang];
    
    // Sincronizar el selector de idioma con el idioma actual
    document.querySelector('.language-selector select').value = currentLang;

    // Traducir la navegación
    document.querySelector('nav a:first-child div').textContent = 'Home';  // Mantenemos "Home" fijo
    document.querySelector('nav div:nth-child(2)').textContent = currentTranslations.nav.download;
    document.querySelector('nav a:nth-child(3) div').textContent = currentTranslations.nav.aboutMe;
    document.querySelector('nav div:last-child').textContent = currentTranslations.nav.contact;

    // Traducir la sección hero
    const titleParts = document.querySelector('.title').innerHTML.split('<br>');
    document.querySelector('.title').innerHTML = `${currentTranslations.hero.title}<br><span class="main_page_txt">${currentTranslations.hero.mainPage}</span>`;
    document.querySelector('.signature').textContent = currentTranslations.hero.signature;
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.textContent = currentTranslations.hero.downloadBtn;
    });

    // Traducir las características
    const featureTitles = document.querySelectorAll('.feature-title');
    const featureDescriptions = document.querySelectorAll('.feature-description');
    
    // Mapeo de índices a claves de características
    const featureKeys = ['customization', 'theme', 'favorites', 'clock', 'fonts', 'notes', 'download'];
    
    featureTitles.forEach((title, index) => {
        if (featureKeys[index]) {
            title.textContent = currentTranslations.features[featureKeys[index]].title;
        }
    });

    featureDescriptions.forEach((desc, index) => {
        if (featureKeys[index]) {
            desc.textContent = currentTranslations.features[featureKeys[index]].description;
        }
    });

    // Traducir popups
    document.querySelector('.download-popup h2').textContent = currentTranslations.download_popup.title;
    document.querySelector('.popup h2').textContent = currentTranslations.contact_popup.title;

    // Traducir sidebar
    document.querySelectorAll('.sidebar-item span').forEach((item, index) => {
        const keys = ['notes', 'clock', 'settings', 'favorites'];
        item.textContent = currentTranslations.sidebar[keys[index]];
    });

    // Traducir tooltips
    document.getElementById('notes-tooltip').textContent = currentTranslations.sidebar.tooltips.notes;
    document.getElementById('clock-tooltip').innerHTML = `${currentTranslations.sidebar.tooltips.clock}<div id="tooltip-clock" class="tooltip-clock"></div>`;
    document.getElementById('settings-tooltip').textContent = currentTranslations.sidebar.tooltips.settings;
    document.getElementById('favorites-tooltip').textContent = currentTranslations.sidebar.tooltips.favorites;
}

// Función para cambiar el idioma manualmente
function changeLanguage(lang) {
    localStorage.setItem('userLanguage', lang);
    // Actualizar el selector de idioma
    document.querySelector('.language-selector select').value = lang;
    applyTranslations();
}

// Cargar traducciones cuando se carga la página
document.addEventListener('DOMContentLoaded', loadTranslations);