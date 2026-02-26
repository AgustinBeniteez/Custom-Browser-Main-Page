/**
 * Storage Utility - Módulo centralizado para manejo de persistencia.
 * Usa localStorage como única fuente de verdad.
 * Las cookies se eliminaron porque no funcionan con file:// ni con
 * extensiones de Chrome, y tienen un límite de 4 KB.
 */
const Storage = {
  /**
   * Lee un valor de localStorage.
   * @param {string} key          - Clave de la configuración
   * @param {*}      defaultValue - Valor por defecto si no existe
   * @returns {string|null}
   */
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      if (val === null) return defaultValue;

      // Intentar limpiar comillas si es un JSON string accidental (compatibilidad con State.js)
      if (val.startsWith('"') && val.endsWith('"') && val.length > 2) {
        try {
          // Intentar parsear; si es un simple string devuelto por JSON.stringify, parse lo devuelve limpio.
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Guarda un valor en localStorage.
   * @param {string} key   - Clave
   * @param {string} value - Valor (se convierte a string automáticamente)
   */
  set(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (e) {
      console.warn(`Storage.set failed for key "${key}":`, e.message);
    }
  },

  /**
   * Guarda un objeto/array como JSON.
   * @param {string} key
   * @param {*}      value
   */
  setJSON(key, value) {
    this.set(key, JSON.stringify(value));
  },

  /**
   * Obtiene un objeto/array desde JSON. Devuelve defaultValue si falla.
   * @param {string} key
   * @param {*}      defaultValue
   * @returns {*}
   */
  getJSON(key, defaultValue = null) {
    const raw = this.get(key);
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  },

  /**
   * Elimina una entrada de localStorage.
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch { /* ignore */ }
  }
};

export default Storage;
