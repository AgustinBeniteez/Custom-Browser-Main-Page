// Gestor de Estado Centralizado
const State = {
  // Estado inicial
  state: {
    idioma: 'en',
    modoOscuro: false,
    decoracionReloj: true,
    buscadorSeleccionado: 'google',
    favoritos: [],
    notas: [],
    fondoUrl: '',
    colorBotones: '',
    colorBotonesHover: ''
  },

  // Observadores
  observers: [],

  // Suscribir observadores
  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  },

  // Notificar cambios
  notify() {
    this.observers.forEach(callback => callback(this.state));
  },

  // Actualizar estado
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.saveToLocalStorage();
    this.notify();
  },

  // Obtener estado
  getState() {
    return this.state;
  },

  // Persistencia en localStorage
  saveToLocalStorage() {
    Object.entries(this.state).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  },

  // Cargar desde localStorage
  loadFromLocalStorage() {
    const newState = {};
    Object.keys(this.state).forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          newState[key] = JSON.parse(value);
        } catch {
          newState[key] = value;
        }
      }
    });
    this.setState(newState);
  },

  // Inicializar estado
  init() {
    this.loadFromLocalStorage();
  }
};

export default State;