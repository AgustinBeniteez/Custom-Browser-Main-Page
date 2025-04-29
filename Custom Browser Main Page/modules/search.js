// Módulo para el buscador y temas
import State from './state.js';

class SearchManager {
  constructor() {
    this.initSearchHandlers();
    this.initThemeHandlers();
  }

  initSearchHandlers() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const buscadorSelect = document.getElementById('buscador');

    // Configurar eventos de búsqueda
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.realizarBusqueda();
      }
    });

    searchButton?.addEventListener('click', (e) => {
      e.preventDefault();
      this.realizarBusqueda();
    });

    // Configurar selector de buscador
    buscadorSelect?.addEventListener('change', (e) => {
      State.setState({ buscadorSeleccionado: e.target.value });
    });

    // Mantener seleccionado el buscador al recargar
    const buscadorSeleccionado = State.getState().buscadorSeleccionado;
    if (buscadorSeleccionado && buscadorSelect) {
      buscadorSelect.value = buscadorSeleccionado;
    }
  }

  realizarBusqueda() {
    const searchInput = document.getElementById('search-input');
    const valor = searchInput?.value.trim();
    if (!valor) return;

    const buscador = State.getState().buscadorSeleccionado || 'google';
    let url;

    switch (buscador) {
      case 'bing':
        url = `https://www.bing.com/search?q=${encodeURIComponent(valor)}`;
        break;
      case 'yahoo':
        url = `https://search.yahoo.com/search?p=${encodeURIComponent(valor)}`;
        break;
      case 'brave':
        url = `https://search.brave.com/search?q=${encodeURIComponent(valor)}`;
        break;
      case 'duckduckgo':
        url = `https://duckduckgo.com/?q=${encodeURIComponent(valor)}`;
        break;
      case 'google':
      default:
        url = `https://www.google.com/search?q=${encodeURIComponent(valor)}`;
        break;
    }

    window.location.href = url;
  }

  initThemeHandlers() {
    const modoOscuroCheckbox = document.getElementById('modo-oscuro');
    const colorTemaInput = document.getElementById('color-tema');

    // Configurar modo oscuro
    modoOscuroCheckbox?.addEventListener('change', (e) => {
      const activar = e.target.checked;
      this.aplicarModoOscuro(activar);
      State.setState({ modoOscuro: activar });
    });

    // Aplicar modo oscuro inicial
    const modoOscuroActivo = State.getState().modoOscuro;
    if (modoOscuroCheckbox) {
      modoOscuroCheckbox.checked = modoOscuroActivo;
      this.aplicarModoOscuro(modoOscuroActivo);
    }

    // Configurar color del tema
    colorTemaInput?.addEventListener('change', (e) => {
      const color = e.target.value;
      const colorMasOscuro = this.calcularColorMasOscuro(color);
      
      document.documentElement.style.setProperty('--color-botones', color);
      document.documentElement.style.setProperty('--color-botones-hover', colorMasOscuro);
      
      State.setState({
        colorBotones: color,
        colorBotonesHover: colorMasOscuro
      });
    });

    // Aplicar color del tema inicial
    const colorGuardado = State.getState().colorBotones;
    if (colorGuardado && colorTemaInput) {
      colorTemaInput.value = colorGuardado;
      document.documentElement.style.setProperty('--color-botones', colorGuardado);
      document.documentElement.style.setProperty('--color-botones-hover', State.getState().colorBotonesHover);
    }
  }

  aplicarModoOscuro(activar) {
    document.documentElement.style.setProperty('--color-modelight', activar ? 'var(--color-modedark)' : '#fefefecb');
    document.documentElement.style.setProperty('--color-modelight1', activar ? 'var(--color-modedark1)' : '#e2e2e2cc');
    document.documentElement.style.setProperty('--color-letrasdark', activar ? 'var(--color-letraswhite)' : '#161616');
  }

  calcularColorMasOscuro(color) {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    
    const factor = 0.8; // Factor de oscurecimiento
    
    const nuevoR = Math.floor(r * factor);
    const nuevoG = Math.floor(g * factor);
    const nuevoB = Math.floor(b * factor);
    
    return `#${((nuevoR << 16) | (nuevoG << 8) | nuevoB).toString(16).padStart(6, '0')}`;
  }
}

export const searchManager = new SearchManager();