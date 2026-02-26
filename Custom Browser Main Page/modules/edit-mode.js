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
            { id: 'widget-important-notes', selector: '#widget-important-notes', name: 'Notas Recientes', icon: '<i class="fa-solid fa-envelope-open-text"></i>' }
        ];
        this.layout = Storage.getJSON('widgetLayout', {});
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
                    let currentlyHidden = this.layout[w.id]?.hidden;
                    if (currentlyHidden === undefined) {
                        currentlyHidden = el.classList.contains('widget-hidden-by-user');
                    }

                    this.layout[w.id] = this.layout[w.id] || {};
                    this.layout[w.id].hidden = !currentlyHidden;

                    visBtn.innerHTML = this.layout[w.id].hidden ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';

                    if (this.layout[w.id].hidden) {
                        el.classList.add('widget-hidden-by-user');
                    } else {
                        el.classList.remove('widget-hidden-by-user');
                    }
                    this._saveLayout();
                });

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
    }

    _renderWidgetsMenu() {
        if (!this.widgetsListEl) return;
        this.widgetsListEl.innerHTML = '';

        this.widgets.forEach(w => {
            const el = document.querySelector(w.selector);
            let isHidden = this.layout[w.id]?.hidden;
            if (isHidden === undefined) {
                isHidden = el ? el.classList.contains('widget-hidden-by-user') : false;
            }
            const currentlyHidden = isHidden;

            const item = document.createElement('div');
            item.className = 'widget-menu-item' + (!currentlyHidden ? ' active' : '');

            let iconText = !currentlyHidden ? '<i class="fa-solid fa-check" style="color:var(--color-botones);"></i>' : '<i class="fa-solid fa-plus"></i>';
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    ${w.icon || ''}
                    <span data-translate="${w.id}">${w.name || w.id}</span>
                </div>
                ${iconText}
            `;

            item.addEventListener('click', () => {
                const visBtn = el?.querySelector('.widget-visibility-btn');
                if (visBtn) {
                    visBtn.click(); // Re-use the existing toggle logic on the widget itself
                } else {
                    // Si no tiene el botón de controles instanciado (ej. porque está muy oculto o falló), forzamos
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
                this._renderWidgetsMenu(); // Refresh menu
            });

            this.widgetsListEl.appendChild(item);
        });

        // Trigger dynamic translation for newly added elements
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
