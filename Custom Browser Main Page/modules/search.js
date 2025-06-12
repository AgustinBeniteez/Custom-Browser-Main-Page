// Módulo para el buscador y temas
import State from './state.js';

class SearchManager {
  constructor() {
    this.initSearchHandlers();
    this.initThemeHandlers();
  }

  initSearchHandlers() {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');

    // Configurar eventos de búsqueda
    searchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.realizarBusqueda();
    });
  }

  realizarBusqueda() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput?.value.trim();
    if (!query) return;

    // USO chrome.search.query que GOOGLE si le gusta porque no hago dos funciones en una misma extensión
    if (chrome.search && chrome.search.query) {
      chrome.search.query({ text: query });
    } else {
      // Fallback a Google si no estamos en una extensión
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
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
    const colorHoverGuardado = State.getState().colorBotonesHover;
    
    if (colorGuardado && colorTemaInput) {
      colorTemaInput.value = colorGuardado;
      document.documentElement.style.setProperty('--color-botones', colorGuardado);
    }
    
    // Siempre aplicar el color hover (por defecto o guardado)
    if (colorHoverGuardado) {
      document.documentElement.style.setProperty('--color-botones-hover', colorHoverGuardado);
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