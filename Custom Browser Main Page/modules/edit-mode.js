import Storage from './storage.js';
import translationManager from '../translations/translations.js';
import { notesManager } from './notes.js';

class EditModeManager {
    constructor() {
        this.isEditMode = false;
        this.widgets = [
            { id: 'widget-reloj', selector: '.reloj-container', name: 'Reloj', icon: '<i class="fa-solid fa-clock"></i>' },
            { id: 'widget-search', selector: '.search-container', name: 'Buscador', icon: '<i class="fa-solid fa-magnifying-glass"></i>' },
            { id: 'widget-favoritos', selector: '#favoritos-container', name: 'Favoritos', icon: '<i class="fa-solid fa-star"></i>' },
            { id: 'widget-notes', selector: '#widget-notes', name: 'Notas', icon: '<i class="fa-solid fa-note-sticky"></i>' },
            { id: 'widget-calendar', selector: '#widget-calendar', name: 'Calendario', icon: '<i class="fa-solid fa-calendar-days"></i>' },
            { id: 'widget-important-notes', selector: '#widget-important-notes', name: 'Notas Recientes', icon: '<i class="fa-solid fa-envelope-open-text"></i>' },
            { id: 'widget-status', selector: '#widget-status', name: 'Status Sistema', icon: '<i class="fa-solid fa-microchip"></i>' },
            { id: 'widget-weather', selector: '#widget-weather', name: 'Clima', icon: '<i class="fa-solid fa-cloud-sun"></i>' }
        ];
        this.layout = Storage.getJSON('widgetLayout', {});

        // Si no hay layout guardado, aplicamos la distribución por defecto
        if (Object.keys(this.layout).length === 0) {
            this.layout = {
                'widget-reloj': { left: 660, top: 180 },
                'widget-search': { left: 635, top: 480 },
                'widget-favoritos': { left: 610, top: 580, width: 750, height: 320, orientation: 'horizontal' },
                'widget-status': { left: 50, top: 210 },
                'widget-weather': { left: 50, top: 410 },
                'widget-calendar': { left: 1640, top: 100 },
                'widget-important-notes': { left: 1640, top: 380, width: 250, height: 530, orientation: 'vertical' },
                'widget-notes': { left: 1750, top: 820 }
            };
            this._saveLayout();
        }

        this.gridSize = 50; // Snap to 50px grid
        this._initElements();
        this._bindEvents();
        // Wait for other modules to init
        setTimeout(() => this._applyLayout(), 100);
    }

    _initElements() {
        this.btn = document.getElementById('edit-mode-btn');
        if (this.btn) {
            this.btn.title = 'Edit Layout';
        }

        this.widgetsMenuBtn = document.getElementById('widgets-menu-btn');
        this.widgetsMenuPopup = document.getElementById('widgets-menu-popup');
        this.cerrarWidgetsMenuBtn = document.getElementById('cerrar-widgets-menu');
        this.widgetsListEl = document.getElementById('widgets-list');
        this.exportBtn = document.getElementById('export-layout-btn');
        this.importBtn = document.getElementById('import-layout-btn');
        this.importInput = document.getElementById('import-layout-input');
    }

    _bindEvents() {
        this.btn?.addEventListener('click', () => this.toggleEditMode());

        this.widgetsMenuBtn?.addEventListener('click', () => {
            this.widgetsMenuPopup?.classList.toggle('oculto');
            if (!this.widgetsMenuPopup?.classList.contains('oculto')) {
                document.body.classList.add('widgets-menu-open');
                this._renderWidgetsMenu();
            } else {
                document.body.classList.remove('widgets-menu-open');
            }
        });

        this.cerrarWidgetsMenuBtn?.addEventListener('click', () => {
            this.widgetsMenuPopup?.classList.add('oculto');
            document.body.classList.remove('widgets-menu-open');
        });

        // Initialize calendar widget date
        this._initCalendarWidget();

        // Initialize important notes widget
        this._initImportantNotesWidget();

        // Layout Import/Export
        this.exportBtn?.addEventListener('click', () => this.exportLayout());
        this.importBtn?.addEventListener('click', () => this.importInput?.click());
        this.importInput?.addEventListener('change', (e) => this.handleImport(e));
    }

    exportLayout() {
        const data = JSON.stringify(this.layout, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `widget-layout-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedLayout = JSON.parse(e.target.result);
                // Simple validation: check if it's an object
                if (typeof importedLayout !== 'object' || importedLayout === null) {
                    throw new Error("Invalid format");
                }

                this.layout = importedLayout;
                this._saveLayout();
                this._applyLayout();
                this._renderWidgetsMenu();

                // Clear input
                event.target.value = '';

                alert("Distribución importada con éxito.");
                console.log("Layout imported successfully");
            } catch (err) {
                console.error("Error importing layout:", err);
                alert("Error: El archivo no es una distribución de widgets válida.");
            }
        };
        reader.readAsText(file);
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('edit-mode', this.isEditMode);

        // Also toggle a state to make widgets visible for editing
        if (this.isEditMode) {
            this.btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            this.widgetsMenuBtn?.classList.remove('oculto');
            this.widgetsMenuPopup?.classList.remove('oculto');
            document.body.classList.add('widgets-menu-open');
            this._renderWidgetsMenu();
            this._enableEdit();
        } else {
            this.btn.innerHTML = '<i class="fa-solid fa-pen"></i>';
            this.widgetsMenuBtn?.classList.add('oculto');
            this.widgetsMenuPopup?.classList.add('oculto');
            document.body.classList.remove('widgets-menu-open');
            this._disableEdit();
            this._saveLayout();
        }
    }

    _enableEdit() {
        this.widgets.forEach(w => {
            const el = document.querySelector(w.selector);
            if (!el) return;

            // Force absolute positioning if not already
            if (getComputedStyle(el).position !== 'absolute' && getComputedStyle(el).position !== 'fixed') {
                el.style.position = 'absolute';
                const rect = el.getBoundingClientRect();
                el.style.left = Math.round(rect.left / this.gridSize) * this.gridSize + 'px';
                el.style.top = Math.round(rect.top / this.gridSize) * this.gridSize + 'px';
            } else if (getComputedStyle(el).position === 'fixed') {
                // Convert fixed to absolute based on current offset
                const rect = el.getBoundingClientRect();
                el.style.position = 'absolute';
                el.style.transform = 'none'; // remove translateY etc
                el.style.bottom = 'auto';
                el.style.right = 'auto';
                el.style.left = Math.round(rect.left / this.gridSize) * this.gridSize + 'px';
                el.style.top = Math.round(rect.top / this.gridSize) * this.gridSize + 'px';
            }

            el.classList.add('editable-widget');

            const isMerged = Storage.get('merge-widgets') === 'true';
            if (isMerged && w.id === 'widget-weather') {
                el.classList.add('widget-merged-hidden');
            } else {
                el.classList.remove('widget-merged-hidden');
            }

            // Add controls wrapper if not present
            if (!el.querySelector('.widget-controls')) {
                const controls = document.createElement('div');
                controls.className = 'widget-controls';

                // Visibility Toggle Button (Eye)
                const visBtn = document.createElement('button');
                visBtn.className = 'widget-toggle-vis widget-visibility-btn';

                let isHidden = this.layout[w.id]?.hidden;
                if (isHidden === undefined) {
                    isHidden = el.classList.contains('widget-hidden-by-user');
                }

                visBtn.innerHTML = isHidden ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';

                visBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent drag start
                    const isMerged = Storage.get('merge-widgets') === 'true';

                    let currentlyHidden = this.layout[w.id]?.hidden;
                    if (currentlyHidden === undefined) {
                        currentlyHidden = el.classList.contains('widget-hidden-by-user');
                    }

                    const newState = !currentlyHidden;

                    // Si están fusionados, aplicamos el cambio a ambos
                    if (isMerged && (w.id === 'widget-status' || w.id === 'widget-weather')) {
                        ['widget-status', 'widget-weather'].forEach(id => {
                            this.layout[id] = this.layout[id] || {};
                            this.layout[id].hidden = newState;
                            const widgetEl = document.querySelector(this.widgets.find(wid => wid.id === id).selector);
                            if (widgetEl) {
                                if (newState) widgetEl.classList.add('widget-hidden-by-user');
                                else widgetEl.classList.remove('widget-hidden-by-user');

                                // Actualizar el icono del botón de ese widget si existe
                                const otherVisBtn = widgetEl.querySelector('.widget-visibility-btn');
                                if (otherVisBtn) {
                                    otherVisBtn.innerHTML = newState ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
                                }
                            }
                        });
                    } else {
                        this.layout[w.id] = this.layout[w.id] || {};
                        this.layout[w.id].hidden = newState;
                        visBtn.innerHTML = newState ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';

                        if (newState) {
                            el.classList.add('widget-hidden-by-user');
                        } else {
                            el.classList.remove('widget-hidden-by-user');
                        }
                    }

                    this._saveLayout();
                    this._renderWidgetsMenu();
                });

                // Shape Toggle for Favorites
                if (w.id === 'widget-favoritos') {
                    const squareBtn = document.createElement('button');
                    squareBtn.className = 'widget-toggle-vis';

                    const isSquare = Storage.get('square-favorites') === 'true';
                    squareBtn.innerHTML = isSquare ? '<i class="fa-solid fa-rectangle-list"></i>' : '<i class="fa-solid fa-table-cells-large"></i>';
                    squareBtn.title = isSquare ? "Cambiar a modo rectangular" : "Cambiar a modo cuadrado";

                    squareBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const currentSquare = Storage.get('square-favorites') === 'true';
                        const newSquare = !currentSquare;

                        // Guardar en Storage
                        Storage.set('square-favorites', newSquare.toString());

                        // Actualizar UI
                        document.body.classList.toggle('square-favorites-active', newSquare);
                        const container = document.getElementById('favoritos-container');
                        if (container) container.classList.toggle('square-mode', newSquare);

                        // Sincronizar checkbox si existe en Ajustes
                        const checkbox = document.getElementById('square-favorites');
                        if (checkbox) checkbox.checked = newSquare;

                        // Disparar evento para que se vuelva a renderizar la cuadrícula
                        document.dispatchEvent(new Event('favoritesSettingsChanged'));

                        // Re-render controles (para actualizar este mismo botón o redibujar todo)
                        this._disableEdit();
                        this._enableEdit();
                        this._renderWidgetsMenu();
                    });
                    controls.appendChild(squareBtn);
                }

                // Orientation Toggle for Favorites and Important Notes
                if (w.id === 'widget-favoritos' || w.id === 'widget-important-notes') {
                    const dirBtn = document.createElement('button');
                    dirBtn.className = 'widget-toggle-vis'; // reusing the same visual style
                    const isHorizontal = this.layout[w.id]?.orientation === 'horizontal';
                    dirBtn.innerHTML = isHorizontal ? '<i class="fa-solid fa-arrows-up-down"></i>' : '<i class="fa-solid fa-arrows-left-right"></i>';
                    dirBtn.title = "Cambiar orientación";

                    dirBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const currentH = this.layout[w.id]?.orientation === 'horizontal';
                        this.layout[w.id] = this.layout[w.id] || {};
                        this.layout[w.id].orientation = currentH ? 'vertical' : 'horizontal';

                        if (w.id === 'widget-important-notes') {
                            if (!currentH) {
                                this.layout[w.id].width = 600;
                                this.layout[w.id].height = 150;
                            } else {
                                this.layout[w.id].width = 250;
                                this.layout[w.id].height = 400;
                            }
                            el.style.width = this.layout[w.id].width + 'px';
                            el.style.height = this.layout[w.id].height + 'px';
                        } else {
                            // Swap width and height if they exist so it automatically reflects the orientation
                            if (this.layout[w.id].width && this.layout[w.id].height) {
                                const temp = this.layout[w.id].width;
                                this.layout[w.id].width = this.layout[w.id].height;
                                this.layout[w.id].height = temp;
                                el.style.width = this.layout[w.id].width + 'px';
                                el.style.height = this.layout[w.id].height + 'px';
                            } else {
                                // Apply some default swapped dimensions if not set yet
                                if (!currentH) {
                                    // Going to horizontal
                                    el.style.width = '800px';
                                    el.style.height = '150px';
                                } else {
                                    // Going to vertical
                                    el.style.width = '250px';
                                    el.style.height = '600px';
                                }
                            }
                        }

                        dirBtn.innerHTML = this.layout[w.id].orientation === 'horizontal' ? '<i class="fa-solid fa-arrows-up-down"></i>' : '<i class="fa-solid fa-arrows-left-right"></i>';

                        if (this.layout[w.id].orientation === 'horizontal') {
                            el.classList.add('widget-horizontal');
                        } else {
                            el.classList.remove('widget-horizontal');
                        }
                        this._saveLayout();
                    });
                    controls.appendChild(dirBtn);
                }

                if (w.id === 'widget-search') {
                    const shpBtn = document.createElement('button');
                    shpBtn.className = 'widget-toggle-vis';
                    const isSquare = this.layout[w.id]?.shape === 'square';
                    shpBtn.innerHTML = isSquare ? '<i class="fa-solid fa-square"></i>' : '<i class="fa-solid fa-circle"></i>';
                    shpBtn.title = "Cambiar forma";

                    shpBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const currentSquare = this.layout[w.id]?.shape === 'square';
                        this.layout[w.id] = this.layout[w.id] || {};
                        this.layout[w.id].shape = currentSquare ? 'round' : 'square';

                        shpBtn.innerHTML = this.layout[w.id].shape === 'square' ? '<i class="fa-solid fa-square"></i>' : '<i class="fa-solid fa-circle"></i>';

                        if (this.layout[w.id].shape === 'square') {
                            el.classList.add('widget-square');
                        } else {
                            el.classList.remove('widget-square');
                        }
                        this._saveLayout();
                    });
                    controls.appendChild(shpBtn);
                }

                // Link/Unlink Toggle for Status and Weather
                if (w.id === 'widget-status' || w.id === 'widget-weather') {
                    const linkBtn = document.createElement('button');
                    linkBtn.className = 'widget-toggle-vis widget-link-btn';
                    const isMerged = Storage.get('merge-widgets') === 'true';
                    linkBtn.innerHTML = isMerged ? '<i class="fa-solid fa-link"></i>' : '<i class="fa-solid fa-link-slash"></i>';
                    linkBtn.title = isMerged ? "Desvincular widgets" : "Vincular widgets";

                    linkBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const currentMerged = Storage.get('merge-widgets') === 'true';
                        const newMerged = !currentMerged;
                        Storage.set('merge-widgets', newMerged.toString());

                        // Sync with the checkbox in settings if it exists
                        const checkbox = document.getElementById('merge-widgets');
                        if (checkbox) checkbox.checked = newMerged;

                        // Trigger the global event so system-status.js reacts
                        document.dispatchEvent(new CustomEvent('mergeWidgetsChanged', { detail: newMerged }));

                        // Re-enable edit mode to refresh icons and visibility
                        this._disableEdit();
                        this._enableEdit();
                        this._renderWidgetsMenu();
                    });
                    controls.appendChild(linkBtn);
                }

                controls.appendChild(visBtn);
                el.appendChild(controls);

                // Resize Handle
                const resizeHandle = document.createElement('div');
                resizeHandle.className = 'widget-resize-handle';
                resizeHandle.addEventListener('mousedown', (e) => this._startResize(e, el, w.id));
                el.appendChild(resizeHandle);

                // Drag Handle
                const dragHandle = document.createElement('div');
                dragHandle.className = 'widget-drag-handle';
                dragHandle.innerHTML = '<i class="fa-solid fa-arrows-up-down-left-right"></i>';
                dragHandle.title = 'Mover widget';
                dragHandle.addEventListener('mousedown', (e) => this._startDrag(e, el, w.id));
                el.appendChild(dragHandle);
            }

            // Permitir arrastrar haciendo click en cualquier parte del cuerpo del widget
            el.onmousedown = (e) => this._startDrag(e, el, w.id);
        });
    }

    _disableEdit() {
        this.widgets.forEach(w => {
            const el = document.querySelector(w.selector);
            if (!el) return;
            el.classList.remove('editable-widget');
            el.onmousedown = null;

            const controls = el.querySelector('.widget-controls');
            if (controls) controls.remove();

            const resizeHandle = el.querySelector('.widget-resize-handle');
            if (resizeHandle) resizeHandle.remove();

            const dragHandle = el.querySelector('.widget-drag-handle');
            if (dragHandle) dragHandle.remove();
        });
    }

    _startDrag(e, el, id) {
        const isInternalButton = e.target.closest('button') && e.target.closest('button') !== el;
        if (e.target.closest('.widget-controls') || e.target.closest('.widget-resize-handle') || isInternalButton || e.target.closest('input')) return;

        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;

        // Convert to absolute
        if (getComputedStyle(el).position !== 'absolute') {
            el.style.position = 'absolute';
        }

        const startLeft = parseInt(el.style.left) || el.getBoundingClientRect().left;
        const startTop = parseInt(el.style.top) || el.getBoundingClientRect().top;

        // Remove transform just in case
        el.style.transform = 'none';

        const onMouseMove = (moveEvent) => {
            let newLeft = startLeft + (moveEvent.clientX - startX);
            let newTop = startTop + (moveEvent.clientY - startY);

            // Snap to grid
            newLeft = Math.round(newLeft / this.gridSize) * this.gridSize;
            newTop = Math.round(newTop / this.gridSize) * this.gridSize;

            el.style.left = newLeft + 'px';
            el.style.top = newTop + 'px';
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            this.layout[id] = this.layout[id] || {};
            this.layout[id].left = parseInt(el.style.left);
            this.layout[id].top = parseInt(el.style.top);
            this._saveLayout();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    _startResize(e, el, id) {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = el.offsetWidth;
        const startHeight = el.offsetHeight;

        const onMouseMove = (moveEvent) => {
            let newWidth = startWidth + (moveEvent.clientX - startX);
            let newHeight = startHeight + (moveEvent.clientY - startY);

            // Snap to grid for resize too
            newWidth = Math.max(this.gridSize, Math.round(newWidth / this.gridSize) * this.gridSize);
            newHeight = Math.max(this.gridSize, Math.round(newHeight / this.gridSize) * this.gridSize);

            el.style.width = newWidth + 'px';
            el.style.height = newHeight + 'px';
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            this.layout[id] = this.layout[id] || {};
            this.layout[id].width = parseInt(el.style.width);
            this.layout[id].height = parseInt(el.style.height);
            this._saveLayout();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    _saveLayout() {
        Storage.setJSON('widgetLayout', this.layout);
    }

    _applyLayout() {
        this.widgets.forEach(w => {
            const conf = this.layout[w.id];
            if (!conf) return;

            const el = document.querySelector(w.selector);
            if (!el) return;

            if (conf.left !== undefined || conf.top !== undefined || conf.width !== undefined || conf.height !== undefined || conf.hidden !== undefined) {
                el.style.position = 'absolute';
                el.style.transform = 'none'; // Clear translate transforms
                el.style.bottom = 'auto'; // Clear bottom from settings
                el.style.right = 'auto';
                el.style.margin = '0'; // Clear margins that interfere
            }

            if (conf.left !== undefined) el.style.left = conf.left + 'px';
            if (conf.top !== undefined) el.style.top = conf.top + 'px';
            if (conf.width !== undefined) el.style.width = conf.width + 'px';
            if (conf.height !== undefined) el.style.height = conf.height + 'px';

            // Auto-fix layout to match orientation if user is stuck with bad dimensions
            if (w.id === 'widget-important-notes' && conf.width !== undefined) {
                if (conf.orientation === 'horizontal' && conf.width < 400) {
                    conf.width = 600;
                    conf.height = 150;
                    el.style.width = '600px';
                    el.style.height = '150px';
                } else if (conf.orientation !== 'horizontal' && conf.width > 400) {
                    conf.width = 250;
                    conf.height = 400;
                    el.style.width = '250px';
                    el.style.height = '400px';
                }
            }

            if (conf.hidden) {
                el.classList.add('widget-hidden-by-user');
            } else if (conf.hidden === false) {
                el.classList.remove('widget-hidden-by-user');
            }

            if ((w.id === 'widget-favoritos' || w.id === 'widget-important-notes') && conf.orientation === 'horizontal') {
                el.classList.add('widget-horizontal');
            }

            if (w.id === 'widget-search' && conf.shape === 'square') {
                el.classList.add('widget-square');
            }
        });
        this._renderWidgetsMenu();
    }

    _renderWidgetsMenu() {
        if (!this.widgetsListEl) return;
        this.widgetsListEl.innerHTML = '';

        const isMerged = Storage.get('merge-widgets') === 'true';
        let widgetsToRender = [...this.widgets];

        // Si están fusionados, tratamos status y weather como uno solo en el menú
        if (isMerged) {
            widgetsToRender = this.widgets.filter(w => w.id !== 'widget-weather');
        }

        widgetsToRender.forEach(w => {
            const el = document.querySelector(w.selector);
            let isHidden = this.layout[w.id]?.hidden;
            if (isHidden === undefined) {
                isHidden = el ? el.classList.contains('widget-hidden-by-user') : false;
            }
            const currentlyHidden = isHidden;

            const item = document.createElement('div');
            item.className = 'widget-menu-item' + (!currentlyHidden ? ' active' : '');

            // Si es el de status y estamos en modo fusionado, cambiamos el nombre e icono
            let displayName = w.name;
            let displayIcon = w.icon;
            let translateKey = w.id;

            if (isMerged && w.id === 'widget-status') {
                translateKey = 'merge-widgets'; // Usar la clave de traducción de "Sistema y Tiempo"
                displayIcon = '<i class="fa-solid fa-microchip"></i><i class="fa-solid fa-cloud-sun" style="font-size:0.8em; margin-left:-5px;"></i>';
            }

            let iconText = !currentlyHidden ? '<i class="fa-solid fa-check" style="color:var(--color-botones);"></i>' : '<i class="fa-solid fa-plus"></i>';
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    ${displayIcon || ''}
                    <span data-translate="${translateKey}">${displayName || w.id}</span>
                </div>
                ${iconText}
            `;

            item.addEventListener('click', () => {
                // Si están fusionados y es status, también ocultamos/mostramos weather
                if (isMerged && w.id === 'widget-status') {
                    const statusHidden = !currentlyHidden;
                    this.layout['widget-status'] = this.layout['widget-status'] || {};
                    this.layout['widget-status'].hidden = statusHidden;
                    this.layout['widget-weather'] = this.layout['widget-weather'] || {};
                    this.layout['widget-weather'].hidden = statusHidden;

                    const statusEl = document.querySelector('#widget-status');
                    const weatherEl = document.querySelector('#widget-weather');

                    if (statusHidden) {
                        statusEl?.classList.add('widget-hidden-by-user');
                        weatherEl?.classList.add('widget-hidden-by-user');
                    } else {
                        statusEl?.classList.remove('widget-hidden-by-user');
                        // No removemos de weather porque si está fusionado system-status.js lo mantiene oculto (display:none)
                        // pero aquí controlamos la clase del editor que le da opacidad.
                        weatherEl?.classList.remove('widget-hidden-by-user');
                    }
                    this._saveLayout();
                } else {
                    const visBtn = el?.querySelector('.widget-visibility-btn');
                    if (visBtn) {
                        visBtn.click();
                    } else {
                        this.layout[w.id] = this.layout[w.id] || {};
                        let currentH = this.layout[w.id]?.hidden;
                        if (currentH === undefined) {
                            currentH = el ? el.classList.contains('widget-hidden-by-user') : false;
                        }
                        this.layout[w.id].hidden = !currentH;
                        if (this.layout[w.id].hidden) {
                            el?.classList.add('widget-hidden-by-user');
                        } else {
                            el?.classList.remove('widget-hidden-by-user');
                        }
                        this._saveLayout();
                    }
                }
                this._renderWidgetsMenu();
            });

            this.widgetsListEl.appendChild(item);
        });

        if (translationManager && translationManager.currentLanguage) {
            translationManager.updateLanguage(translationManager.currentLanguage);
        }
    }

    _initCalendarWidget() {
        const titleEl = document.getElementById('widget-cal-title');
        const gridEl = document.getElementById('widget-cal-days');
        if (!titleEl || !gridEl) return;

        let currentDate = new Date();

        const renderMonth = () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const lang = localStorage.getItem("idioma") || "es";
            let monthName = new Intl.DateTimeFormat(lang, { month: 'long' }).format(new Date(year, month, 1));
            monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            titleEl.textContent = `${monthName} ${year}`;

            gridEl.innerHTML = '';

            // Adjust to start on Monday (Lunes)
            let startDay = firstDay - 1;
            if (startDay < 0) startDay = 6;

            for (let i = 0; i < startDay; i++) {
                const empty = document.createElement('div');
                empty.className = 'cal-day';
                gridEl.appendChild(empty);
            }

            const today = new Date();
            const notasRaw = localStorage.getItem('notas');
            const notas = notasRaw ? JSON.parse(notasRaw) : [];

            for (let day = 1; day <= daysInMonth; day++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'cal-day';
                if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayEl.classList.add('today');
                }
                dayEl.dataset.date = new Date(year, month, day).toISOString();

                dayEl.innerHTML = `<span>${day}</span>`;

                // Search for pinned notes this day
                const currentDayStr = new Date(year, month, day).toLocaleDateString();
                const pinnedNotes = notas.filter(n => n.destacada && n.fecha === currentDayStr);

                if (pinnedNotes.length > 0) {
                    const dotsWrap = document.createElement('div');
                    dotsWrap.className = 'widget-cal-dots';
                    // Show up to 3 dots if multiple notes
                    pinnedNotes.slice(0, 3).forEach(note => {
                        const dot = document.createElement('div');
                        dot.className = 'widget-cal-dot';
                        if (note.color) dot.style.backgroundColor = note.color;
                        dotsWrap.appendChild(dot);
                    });
                    dayEl.appendChild(dotsWrap);
                }

                gridEl.appendChild(dayEl);
            }
        };

        // Window event to refresh calendar if notes change
        window.addEventListener('storage', (e) => {
            if (e.key === 'notas') renderMonth();
        });

        document.getElementById('widget-cal-prev')?.addEventListener('click', (e) => {
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderMonth();
        });

        document.getElementById('widget-cal-next')?.addEventListener('click', (e) => {
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderMonth();
        });

        const widgetCalContainer = document.getElementById('widget-calendar');
        if (widgetCalContainer) {
            widgetCalContainer.addEventListener('click', (e) => {
                // Don't trigger if edit mode is active, or if clicking buttons
                if (this.isEditMode) return;
                if (e.target.closest('#widget-cal-prev') || e.target.closest('#widget-cal-next')) return;

                const dayEl = e.target.closest('.cal-day');
                if (dayEl && dayEl.dataset.date) {
                    if (notesManager && typeof notesManager.openCalendarDay === 'function') {
                        notesManager.openCalendarDay(new Date(dayEl.dataset.date));
                    }
                    return;
                }

                if (notesManager && typeof notesManager.show === 'function') {
                    notesManager.show('tab-calendar');
                }
            });
        }

        renderMonth();
    }

    _initImportantNotesWidget() {
        const gridEl = document.getElementById('important-notes-grid');
        if (!gridEl) return;

        const titleSpan = document.querySelector('#widget-important-notes .important-notes-header span');
        if (titleSpan) {
            titleSpan.setAttribute('data-translate', 'widget-important-notes');
        }

        const renderNotes = () => {
            const notasRaw = localStorage.getItem('notas');
            let notas = notasRaw ? JSON.parse(notasRaw) : [];
            notas.forEach((n, i) => n._originalIndex = i);

            // Sort by pinned first, then by date descending
            notas.sort((a, b) => {
                if (a.destacada && !b.destacada) return -1;
                if (!a.destacada && b.destacada) return 1;
                const dA = a.fechaFull ? new Date(a.fechaFull) : new Date(a.fecha);
                const dB = b.fechaFull ? new Date(b.fechaFull) : new Date(b.fecha);
                return dB - dA;
            });

            // Take top 3
            const topNotes = notas.slice(0, 3);

            gridEl.innerHTML = '';

            if (topNotes.length === 0) {
                gridEl.innerHTML = `<div style="opacity: 0.5; padding: 10px;" data-translate="nothing-recent">Nada reciente</div>`;
                return;
            }

            topNotes.forEach(note => {
                const card = document.createElement('div');
                card.className = 'important-note-card';
                if (note.color) card.style.borderColor = note.color;

                const d = new Date(note.fechaFull || note.fecha);
                const timeStr = d.toLocaleDateString();

                const langCode = translationManager?.currentLanguage || localStorage.getItem("idioma") || 'es';
                const untitledText = translationManager?.translations?.[langCode]?.['untitled'] || 'Sin Título';

                card.innerHTML = `
                    <h4 style="color: ${note.color || 'inherit'};">${note.titulo || untitledText}</h4>
                    <div class="note-date">${timeStr}</div>
                    <div class="note-content">${note.contenido || ''}</div>
                `;

                card.style.cursor = 'pointer';
                card.addEventListener('click', (e) => {
                    if (this.isEditMode) return;
                    if (notesManager && typeof notesManager.openNote === 'function') {
                        notesManager.openNote(note._originalIndex);
                    }
                });

                gridEl.appendChild(card);
            });
        };

        renderNotes();

        window.addEventListener('storage', (e) => {
            if (e.key === 'notas') renderNotes();
        });
    }
}

export const editModeManager = new EditModeManager();
