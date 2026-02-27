import translationManager from '../translations/translations.js';

class SystemMonitor {
    constructor() {
        this.el = {
            container: document.getElementById('widget-status'),
            cpuBar: document.getElementById('status-cpu-bar'),
            ramBar: document.getElementById('status-ram-bar'),
            temp: document.getElementById('status-temp'),
            condition: document.getElementById('status-condition'),
            icon: document.getElementById('status-weather-icon'),
            city: document.getElementById('status-city'),
            customContainer: null,
            customInput: null,
            customClose: null
        };
        this.cityData = {
            "Madrid, ES": { lat: 40.41, lon: -3.70 },
            "Barcelona, ES": { lat: 41.38, lon: 2.17 },
            "Valencia, ES": { lat: 39.46, lon: -0.37 },
            "Sevilla, ES": { lat: 37.38, lon: -5.98 },
            "Cádiz, ES": { lat: 36.52, lon: -6.28 },
            "Moscow, RU": { lat: 55.75, lon: 37.61 },
            "Saint Petersburg, RU": { lat: 59.93, lon: 30.33 },
            "London, UK": { lat: 51.50, lon: -0.12 },
            "Manchester, UK": { lat: 53.48, lon: -2.24 },
            "Paris, FR": { lat: 48.85, lon: 2.35 },
            "Marseille, FR": { lat: 43.29, lon: 5.36 },
            "New York, US": { lat: 40.71, lon: -74.00 },
            "Los Angeles, US": { lat: 34.05, lon: -118.24 },
            "Miami, US": { lat: 25.76, lon: -80.19 },
            "Mexico City, MX": { lat: 19.43, lon: -99.13 },
            "Cancun, MX": { lat: 21.16, lon: -86.85 },
            "Buenos Aires, AR": { lat: -34.60, lon: -58.38 },
            "Tokyo, JP": { lat: 35.67, lon: 139.65 },
            "Berlin, DE": { lat: 52.52, lon: 13.40 },
            "Rome, IT": { lat: 41.90, lon: 12.49 }
        };
        this.customCoords = JSON.parse(localStorage.getItem('weather-custom-coords') || 'null');
        this.customName = localStorage.getItem('weather-custom-name') || '';
        this._init();
    }

    _init() {
        // Re-buscamos elementos por si acaso se inicializó muy pronto
        this.el.city = document.getElementById('status-city');
        this.el.temp = document.getElementById('status-temp');
        this.el.condition = document.getElementById('status-condition');
        this.el.icon = document.getElementById('status-weather-icon');
        this.el.customContainer = document.getElementById('weather-custom-input-container');
        this.el.customInput = document.getElementById('weather-custom-search');
        this.el.customClose = document.getElementById('weather-custom-close');
        this.el.weatherContent = document.getElementById('status-weather-container');
        this.el.weatherWidget = document.getElementById('widget-weather');

        if (!this.el.city) return;

        // Cargar ciudad guardada
        const savedCity = localStorage.getItem('status-city');

        // Si hay una ciudad personalizada guardada, crear la opción en el select
        if (this.customName && this.customCoords) {
            this._updateCustomOption(this.customName);
        }

        if (savedCity && this.el.city) {
            this.el.city.value = savedCity;
            if (savedCity === 'custom' && this.el.customContainer) {
                this.el.customContainer.style.display = 'flex';
            }
        }

        // Manejar estado inicial de fusión
        const shouldMerge = localStorage.getItem('merge-widgets') === 'true';
        this._handleMerge(shouldMerge);

        this._updateStats();
        this._updateWeather();
        this._bindEvents();

        // Escuchar cambios de idioma para traducir la condición
        document.addEventListener('languageChanged', () => this._updateWeather());
        document.addEventListener('mergeWidgetsChanged', (e) => this._handleMerge(e.detail));

        setInterval(() => this._updateStats(), 5000);
        setInterval(() => this._updateWeather(), 600000); // Cada 10 min
    }

    _handleMerge(merge) {
        if (!this.el.weatherContent || !this.el.container || !this.el.weatherWidget) return;

        const contentArea = this.el.container.querySelector('.status-content');

        if (merge) {
            // Añadir divider si no existe
            let divider = contentArea.querySelector('.status-divider');
            if (!divider) {
                divider = document.createElement('div');
                divider.className = 'status-divider';
                contentArea.appendChild(divider);
            }
            // Mover contenido del tiempo al widget de estado
            contentArea.appendChild(this.el.weatherContent);
            this.el.weatherWidget.style.display = 'none';
            this.el.container.classList.add('is-merged');
        } else {
            // Quitar divider si existe
            const divider = contentArea.querySelector('.status-divider');
            if (divider) divider.remove();

            // Devolver al widget original
            this.el.weatherWidget.appendChild(this.el.weatherContent);
            this.el.weatherWidget.style.display = 'block';
            this.el.container.classList.remove('is-merged');
        }
    }

    _bindEvents() {
        if (this.el.city) {
            this.el.city.addEventListener('change', (e) => {
                const isCustom = e.target.value === 'custom';
                if (this.el.customContainer) {
                    this.el.customContainer.style.display = isCustom ? 'flex' : 'none';
                    if (isCustom) this.el.customInput.focus();
                }

                if (e.target.value !== 'custom') {
                    localStorage.setItem('status-city', e.target.value);
                    this._updateWeather();
                }
            });
        }

        if (this.el.customInput) {
            this.el.customInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this._handleCustomSearch(e.target.value);
                }
            });
        }

        if (this.el.customClose) {
            this.el.customClose.addEventListener('click', () => {
                if (this.el.customContainer) this.el.customContainer.style.display = 'none';
                if (this.el.city) {
                    this.el.city.value = "Madrid, ES";
                    localStorage.setItem('status-city', "Madrid, ES");
                    this._updateWeather();
                }
            });
        }
    }

    _updateCustomOption(name) {
        if (!this.el.city) return;

        let customOpt = this.el.city.querySelector('option[value="custom-result"]');
        if (!customOpt) {
            customOpt = document.createElement('option');
            customOpt.value = 'custom-result';
            // Insertar antes de la opción "Custom..."
            const customTrigger = this.el.city.querySelector('option[value="custom"]');
            this.el.city.insertBefore(customOpt, customTrigger);
        }
        customOpt.textContent = name;
        return customOpt;
    }

    async _handleCustomSearch(cityName) {
        if (!cityName.trim()) return;

        try {
            const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=es&format=json`);
            const data = await resp.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                this.customCoords = { lat: result.latitude, lon: result.longitude };
                this.customName = `${result.name}, ${result.country_code}`;

                localStorage.setItem('weather-custom-coords', JSON.stringify(this.customCoords));
                localStorage.setItem('weather-custom-name', this.customName);

                // Actualizar el select y seleccionar la nueva ciudad
                this._updateCustomOption(this.customName);
                this.el.city.value = 'custom-result';
                localStorage.setItem('status-city', 'custom-result');

                // Ocultar el input
                if (this.el.customContainer) this.el.customContainer.style.display = 'none';
                this.el.customInput.value = '';

                this._updateWeather();
            } else {
                this.el.customInput.style.borderColor = "red";
                setTimeout(() => this.el.customInput.style.borderColor = "", 2000);
            }
        } catch (e) {
            console.error("Geocoding Error:", e);
        }
    }

    async _updateStats() {
        try {
            // RAM Real (Chrome Extension API)
            if (window.chrome && chrome.system && chrome.system.memory) {
                const info = await new Promise(resolve => chrome.system.memory.getInfo(resolve));
                const total = info.capacity;
                const available = info.availableCapacity;
                const usedPercent = Math.round(((total - available) / total) * 100);
                this._applyBar('ram', usedPercent);
            } else {
                // Fallback mock
                this._applyBar('ram', Math.floor(Math.random() * 20) + 40);
            }

            // CPU Real (Chrome Extension API)
            if (window.chrome && chrome.system && chrome.system.cpu) {
                const info = await new Promise(resolve => chrome.system.cpu.getInfo(resolve));
                // Promedio de uso de todos los núcleos (simplificado)
                let totalUsage = 0;
                info.processors.forEach(p => {
                    const total = p.usage.user + p.usage.kernel + p.usage.idle;
                    const used = p.usage.user + p.usage.kernel;
                    totalUsage += (used / total) * 100;
                });
                const cpuPercent = Math.round(totalUsage / info.processors.length);
                this._applyBar('cpu', cpuPercent);
            } else {
                // Fallback mock
                this._applyBar('cpu', Math.floor(Math.random() * 15) + 10);
            }
        } catch (e) {
            console.error("Hardware API Error:", e);
        }
    }

    _applyBar(type, percent) {
        const bar = this.el[type + 'Bar'];
        const text = document.getElementById(`status-${type}-text`);
        if (bar) bar.style.width = percent + '%';
        if (text) text.textContent = percent + '%';
    }

    async _updateWeather() {
        if (!this.el.temp || !this.el.city) return;

        const city = this.el.city.value;
        let coords;

        if (city === 'custom' || city === 'custom-result') {
            if (!this.customCoords) return;
            coords = this.customCoords;
        } else {
            coords = this.cityData[city] || { lat: 40.41, lon: -3.70 };
        }

        try {
            const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`);
            const data = await resp.json();
            const weather = data.current_weather;

            this.el.temp.textContent = Math.round(weather.temperature) + '°C';

            const code = weather.weathercode;
            const isNight = weather.is_day === 0;
            let conditionKey = "weather-clear";
            let iconClass = isNight ? "fa-moon" : "fa-sun";

            // Códigos WMO de Open-Meteo
            if (code >= 1 && code <= 3) {
                conditionKey = "weather-clouds";
                iconClass = isNight ? "fa-cloud-moon" : "fa-cloud-sun";
            } else if (code >= 51 && code <= 67) {
                conditionKey = "weather-rain";
                iconClass = "fa-cloud-showers-heavy";
            } else if (code >= 71 && code <= 86) {
                conditionKey = "weather-snow";
                iconClass = "fa-snowflake";
            } else if (code >= 95) {
                conditionKey = "weather-rain";
                iconClass = "fa-bolt";
            } else if (code === 0) {
                conditionKey = isNight ? "weather-clear" : "weather-sunny";
            }

            // Aplicar Icono
            if (this.el.icon) {
                this.el.icon.className = `fa-solid ${iconClass}`;
                if (iconClass === "fa-sun" || iconClass === "fa-cloud-sun") this.el.icon.style.color = "#ff9800";
                else if (iconClass === "fa-snowflake") this.el.icon.style.color = "#00d4ff";
                else if (iconClass === "fa-cloud-showers-heavy" || iconClass === "fa-bolt") this.el.icon.style.color = "#607d8b";
                else if (isNight) this.el.icon.style.color = "#cba6f7";
                else this.el.icon.style.color = "inherit";
            }

            // Aplicar Traducción
            if (this.el.condition) {
                this.el.condition.setAttribute('data-translate', conditionKey);
                const translated = translationManager.get(conditionKey);
                this.el.condition.textContent = translated || conditionKey;
            }

        } catch (e) {
            console.error("Weather API Error:", e);
        }
    }
}

export const systemMonitor = new SystemMonitor();
