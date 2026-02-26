/**
 * Punto de entrada principal de la extensión.
 * Importa y arranca cada módulo; el módulo state inicializa
 * la persistencia antes de que los módulos lean sus ajustes.
 */
import State from './modules/state.js';
import { settingsManager } from './modules/settings.js';
import { clockSearchManager } from './modules/clock-search.js';
import { favoritesManager } from './modules/favorites.js';
import { notesManager } from './modules/notes.js';
import { editModeManager } from './modules/edit-mode.js';

State.init();

// Los módulos se auto-inicializan al instanciarse.
// Las referencias se conservan para depuración o acceso global futuro.
export { settingsManager, clockSearchManager, favoritesManager, notesManager, editModeManager };
