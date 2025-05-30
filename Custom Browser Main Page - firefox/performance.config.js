/**
 * Configuración de Rendimiento para Custom Browser Main Page
 * Este archivo contiene configuraciones optimizadas para mejorar el rendimiento
 */

const PerformanceConfig = {
  // Configuración de debouncing
  debounce: {
    colorInputs: 150,     // ms para inputs de color
    textInputs: 300,      // ms para inputs de texto
    resize: 250,          // ms para eventos de resize
    scroll: 100           // ms para eventos de scroll
  },

  // Configuración de cache
  cache: {
    translationsExpiry: 3600000,  // 1 hora en ms
    notesExpiry: 1800000,         // 30 minutos en ms
    settingsExpiry: 600000        // 10 minutos en ms
  },

  // Configuración de animaciones
  animations: {
    fastTransition: '0.2s ease',
    mediumTransition: '0.3s ease',
    slowTransition: '0.5s ease',
    disableOnLowEnd: true         // Deshabilitar en dispositivos de bajo rendimiento
  },

  // Configuración de lazy loading
  lazyLoading: {
    enabled: true,
    threshold: 0.1,               // Cargar cuando esté 10% visible
    rootMargin: '50px'            // Margen de carga anticipada
  },

  // Configuración de imágenes
  images: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,                 // Calidad de compresión
    format: 'webp'                // Formato preferido
  },

  // Configuración de memoria
  memory: {
    maxCacheSize: 50,             // Máximo número de elementos en cache
    cleanupInterval: 300000,      // Limpiar cache cada 5 minutos
    gcThreshold: 0.8              // Umbral para garbage collection
  },

  // Configuración de red
  network: {
    timeout: 10000,               // Timeout de 10 segundos
    retries: 3,                   // Número de reintentos
    retryDelay: 1000              // Delay entre reintentos
  },

  // Configuración de desarrollo
  development: {
    enableProfiling: false,
    enableLogging: true,
    enableMetrics: false
  }
};

// Detectar capacidades del dispositivo
const DeviceCapabilities = {
  // Detectar si es un dispositivo de bajo rendimiento
  isLowEndDevice() {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;
    return memory <= 2 || cores <= 2;
  },

  // Detectar conexión lenta
  isSlowConnection() {
    const connection = navigator.connection;
    if (!connection) return false;
    
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.saveData;
  },

  // Ajustar configuración según capacidades
  adjustConfig() {
    if (this.isLowEndDevice()) {
      PerformanceConfig.animations.disableOnLowEnd = true;
      PerformanceConfig.cache.maxCacheSize = 25;
      PerformanceConfig.debounce.colorInputs = 300;
    }

    if (this.isSlowConnection()) {
      PerformanceConfig.network.timeout = 15000;
      PerformanceConfig.images.quality = 0.6;
      PerformanceConfig.lazyLoading.threshold = 0.3;
    }
  }
};

// Utilidades de rendimiento
const PerformanceUtils = {
  // Medir tiempo de ejecución
  measureTime(name, fn) {
    if (!PerformanceConfig.development.enableProfiling) {
      return fn();
    }

    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  // Throttle para eventos frecuentes
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Debounce mejorado con cancelación
  debounce(func, wait, immediate = false) {
    let timeout;
    const debounced = function() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  },

  // Optimizar imágenes
  optimizeImage(file, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
      const { maxWidth, maxHeight, quality } = PerformanceConfig.images;
      
      let { width, height } = img;
      
      // Redimensionar si es necesario
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(callback, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  },

  // Limpiar memoria
  cleanupMemory() {
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
  }
};

// Inicializar configuración
DeviceCapabilities.adjustConfig();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceConfig, DeviceCapabilities, PerformanceUtils };
} else {
  window.PerformanceConfig = PerformanceConfig;
  window.DeviceCapabilities = DeviceCapabilities;
  window.PerformanceUtils = PerformanceUtils;
}