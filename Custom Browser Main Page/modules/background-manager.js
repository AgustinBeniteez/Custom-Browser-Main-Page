/**
 * Background Manager — gestiona el fondo de pantalla y sus optimizaciones.
 * Implementa la pausa activa de GIFs cuando la pestaña está en segundo plano.
 */
import Storage from './storage.js';

class BackgroundManager {
    constructor() {
        this.currentUrl = null;
        this.isGif = false;
        this.fallbackUrl = 'fondos/background2.png';
        this.originalUrl = null;

        this._init();
    }

    _init() {
        this.currentUrl = Storage.get('fondo-url', this.fallbackUrl);
        this.updateBackground(this.currentUrl);
        this._bindEvents();
    }

    _bindEvents() {
        document.addEventListener('visibilitychange', () => this._handleVisibilityChange());

        // Escuchar cambios de configuración para actualizar el fondo
        document.addEventListener('backgroundChanged', (e) => {
            this.updateBackground(e.detail.url);
        });
    }

    _checkIfGif(url) {
        if (!url) return false;
        // Detectar si es un GIF (incluyendo data URLs)
        this.isGif = url.toLowerCase().includes('.gif') || url.startsWith('data:image/gif');
        return this.isGif;
    }

    updateBackground(url) {
        if (!url) return;
        this.currentUrl = url;
        this.originalUrl = url;
        this._checkIfGif(url);

        const cssUrl = this._formatCssUrl(url);
        document.body.style.backgroundImage = cssUrl;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed'; // Mejor para performance al scroll

        // Actualizar preview en ajustes si existe
        const bgPreview = document.getElementById('ide-bg-preview');
        if (bgPreview) bgPreview.style.backgroundImage = cssUrl;
    }

    _formatCssUrl(url) {
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
            return `url("${url}")`;
        } else if (url.startsWith('./') || url.startsWith('../') || url.startsWith('/')) {
            return `url("${url}")`;
        } else {
            return `url("./${url}")`;
        }
    }

    _handleVisibilityChange() {
        if (!this.isGif || !this.currentUrl) return;

        if (document.hidden) {
            this._pauseGif();
        } else {
            this._resumeGif();
        }
    }

    /**
     * "Pausa" el GIF capturando el frame actual y usándolo como imagen estática.
     */
    async _pauseGif() {
        try {
            // Creamos una imagen temporal para capturar el frame
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = this.currentUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Reemplazamos el fondo por la captura estática
            const staticDataUrl = canvas.toDataURL('image/png');
            document.body.style.backgroundImage = `url("${staticDataUrl}")`;

            console.log('GIF background paused (static frame applied)');
        } catch (e) {
            console.warn('Could not pause GIF background:', e);
            // Fallback: simplemente quitar la imagen si falla la captura para ahorrar recursos
            // document.body.style.backgroundImage = 'none';
        }
    }

    _resumeGif() {
        if (this.currentUrl) {
            const cssUrl = this._formatCssUrl(this.currentUrl);
            document.body.style.backgroundImage = cssUrl;
            console.log('GIF background resumed');
        }
    }
}

export const backgroundManager = new BackgroundManager();
export default backgroundManager;
