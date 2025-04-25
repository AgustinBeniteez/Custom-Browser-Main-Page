// Módulo de UI para reloj y fondo
import State from './state.js';

class UIManager {
  constructor() {
    this.relojInterval = null;
    this.initClock();
    this.initBackgroundHandlers();
  }

  actualizarUI() {
    const state = State.getState();
    // Actualizar fondo si existe
    if (state.fondoUrl) {
      this.aplicarFondo(state.fondoUrl);
    }
    // Actualizar decoración del reloj
    const relojContainer = document.querySelector('.reloj-container h1');
    if (relojContainer) {
      this.actualizarDecoracionReloj(relojContainer, state.decoracionReloj);
    }
  }

  initClock() {
    const relojElement = document.getElementById('reloj');
    const relojContainer = document.querySelector('.reloj-container h1');
    const decoracionRelojCheckbox = document.getElementById('decoracion-reloj');

    // Iniciar el reloj
    this.actualizarReloj(relojElement);
    this.relojInterval = setInterval(() => this.actualizarReloj(relojElement), 1000);

    // Configurar decoración del reloj
    if (decoracionRelojCheckbox) {
      decoracionRelojCheckbox.addEventListener('change', (e) => {
        const activar = e.target.checked;
        State.setState({ decoracionReloj: activar });
        this.actualizarDecoracionReloj(relojContainer, activar);
      });

      // Aplicar estado inicial
      const decoracionActiva = State.getState().decoracionReloj;
      decoracionRelojCheckbox.checked = decoracionActiva;
      this.actualizarDecoracionReloj(relojContainer, decoracionActiva);
    }
  }

  actualizarReloj(relojElement) {
    if (relojElement) {
      const ahora = new Date();
      relojElement.textContent = ahora.toTimeString().slice(0, 5);
    }
  }

  actualizarDecoracionReloj(container, activada) {
    if (container) {
      container.style.animation = activada ? 'textGlow 2s ease-in-out infinite alternate' : 'none';
    }
  }

  initBackgroundHandlers() {
    const fondoInput = document.getElementById('fondo-url');
    const guardarFondoBtn = document.getElementById('guardar-fondo-url');
    const fondoPredeterminado = document.querySelectorAll('.fondo-predeterminado img');

    // Configurar fondo guardado
    const fondoAlmacenado = State.getState().fondoUrl;
    if (fondoAlmacenado) {
      this.aplicarFondo(fondoAlmacenado);
    }

    // Evento para guardar nuevo fondo
    if (guardarFondoBtn && fondoInput) {
      guardarFondoBtn.addEventListener('click', () => {
        const url = fondoInput.value;
        if (url) {
          State.setState({ fondoUrl: url });
          this.aplicarFondo(url);
        }
      });
    }

    // Eventos para fondos predeterminados
    fondoPredeterminado.forEach(img => {
      img.addEventListener('click', () => {
        const url = img.src;
        State.setState({ fondoUrl: url });
        this.aplicarFondo(url);
        if (fondoInput) {
          fondoInput.value = url;
        }
      });
    });
  }

  aplicarFondo(url) {
    document.body.style.backgroundImage = `url(${url})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }

  destroy() {
    if (this.relojInterval) {
      clearInterval(this.relojInterval);
    }
  }
}

export const uiManager = new UIManager();