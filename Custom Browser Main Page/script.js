// Importar módulos
import { settingsManager } from './modules/settings.js';
import { clockSearchManager } from './modules/clock-search.js';
import { favoritesManager } from './modules/favorites.js';
import { notesManager } from './modules/notes.js';

// Clase principal de la aplicación
class App {
  constructor() {
    this.init();
  }

  init() {
    // Los módulos se auto-inicializan al ser importados
    // No se necesita hacer nada más aquí ya que cada módulo maneja su propia inicialización
  }
}

// Iniciar la aplicación
new App();