/**
 * Notes Manager — IDE Style Overhaul
 */
import { i18n } from './i18n.js';

const STORAGE_KEY = 'notas';

class NotesManager {
  constructor() {
    this._currentIndex = null;
    this._cache = null;
    this._sortOrder = 'desc'; // 'desc' (más nuevas primero) o 'asc'
    this._currentMonth = new Date(); // Para el calendario

    this._initElements();
    this._bindEvents();
    this.loadNotes();
  }

  _getNotes() {
    if (this._cache === null) {
      this._cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }
    return this._cache;
  }

  _saveNotes(notes) {
    this._cache = notes;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  _initElements() {
    this.el = {
      // Botón principal y popup
      verBtn: document.getElementById('ver-notas-btn'),
      popup: document.getElementById('popup-notas'),
      cerrarPopupBtn: document.getElementById('cerrar-notas-popup'),

      // Tabs
      tabs: document.querySelectorAll('#notes-ide-tabs .ide-tab'),
      panels: document.querySelectorAll('.ide-notes-body-wrap .ide-panel'),

      // Sidebar
      listaIde: document.getElementById('lista-notas-ide'),
      crearIdeBtn: document.getElementById('crear-nota-ide-btn'),
      ordenarBtn: document.getElementById('ordenar-notas-btn'),

      // Editor
      tituloIde: document.getElementById('titulo-nota-ide'),
      contenidoIde: document.getElementById('contenido-nota-ide'),
      fechaDisplayIde: document.getElementById('fecha-display-ide'),
      fechaInputIde: document.getElementById('fecha-input-ide'),
      fechaBtnIde: document.getElementById('fecha-btn-ide'),
      destacarIde: document.getElementById('destacar-nota-ide'),
      eliminarIdeBtn: document.getElementById('eliminar-nota-ide-btn'),
      exportarIdeBtn: document.getElementById('exportar-nota-ide-btn'),
      guardarIdeBtn: document.getElementById('guardar-nota-ide-btn'),

      // Calendario
      calMonthYear: document.getElementById('cal-month-year'),
      calGrid: document.getElementById('calendar-grid'),
      calPrev: document.getElementById('cal-prev'),
      calNext: document.getElementById('cal-next'),
      calControls: document.getElementById('calendar-controls-header'),
      calView: document.querySelector('.ide-calendar-view'),
      dayNotesView: document.getElementById('day-notes-view'),
      dayNotesList: document.getElementById('day-notes-list'),
      dayViewBack: document.getElementById('day-view-back'),
      dayViewTitle: document.getElementById('day-view-title'),
    };
  }

  _bindEvents() {
    const { el } = this;

    // Apertura/Cierre
    el.verBtn?.addEventListener('click', () => this.show());
    el.cerrarPopupBtn?.addEventListener('click', () => this.hide());
    window.addEventListener('click', e => { if (e.target === el.popup) this.hide(); });

    // Tabs
    el.tabs.forEach(tab => {
      tab.addEventListener('click', () => this._switchTab(tab.dataset.tab));
    });

    // Acciones Sidebar
    el.crearIdeBtn?.addEventListener('click', () => this._prepareNew());
    el.ordenarBtn?.addEventListener('click', () => this._toggleSort());

    // Acciones Editor
    el.guardarIdeBtn?.addEventListener('click', () => this._save());
    el.eliminarIdeBtn?.addEventListener('click', () => this._delete());
    el.exportarIdeBtn?.addEventListener('click', () => this._export());
    el.fechaBtnIde?.addEventListener('click', () => el.fechaInputIde.showPicker ? el.fechaInputIde.showPicker() : el.fechaInputIde.click());
    el.fechaInputIde?.addEventListener('change', () => {
      const date = new Date(el.fechaInputIde.value);
      el.fechaDisplayIde.textContent = date.toLocaleString();
    });

    // Acciones Calendario
    el.calPrev?.addEventListener('click', () => this._changeMonth(-1));
    el.calNext?.addEventListener('click', () => this._changeMonth(1));
    el.calMonthYear?.addEventListener('click', () => this._toggleMonthPicker());
    el.dayViewBack?.addEventListener('click', () => this._resetCalendarView());

    // Scroll para cambiar de mes
    el.calView?.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY;
      if (Math.abs(delta) < 20) return; // Umbral mínimo para evitar micro-scrolls
      this._changeMonth(delta > 0 ? 1 : -1);
    }, { passive: false });

    // Atajos
    document.addEventListener('keydown', e => {
      if (el.popup && el.popup.style.display !== 'none' && e.key === 'Escape') this.hide();
    });
  }

  show() {
    if (this.el.popup) {
      this.el.popup.style.display = 'flex';
      this.loadNotes();
      this._resetCalendarView();
      if (this._currentIndex === null && this._getNotes().length > 0) {
        this._edit(0);
      } else if (this._getNotes().length === 0) {
        this._prepareNew();
      }
    }
  }

  hide() {
    if (this.el.popup) this.el.popup.style.display = 'none';
  }

  _switchTab(tabId) {
    this.el.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    this.el.panels.forEach(p => p.classList.toggle('active', p.id === tabId));

    if (tabId === 'tab-calendar') {
      this._resetCalendarView();
      this._renderCalendar();
    }
  }

  _resetCalendarView() {
    const { dayNotesView, calGrid, calControls } = this.el;
    if (dayNotesView) dayNotesView.classList.add('oculto');
    if (calGrid) calGrid.classList.remove('oculto');
    if (calControls) calControls.classList.remove('oculto');
  }

  _toggleSort() {
    this._sortOrder = this._sortOrder === 'desc' ? 'asc' : 'desc';
    this.loadNotes();
  }

  loadNotes() {
    let notes = [...this._getNotes()];

    // Aplicar ordenación
    notes.sort((a, b) => {
      const dateA = new Date(a.fechaFull || a.fecha);
      const dateB = new Date(b.fechaFull || b.fecha);
      return this._sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    this._renderSidebar(notes);
    if (this.el.panels[1].classList.contains('active')) {
      this._renderCalendar();
    }
  }

  _renderSidebar(notes) {
    if (!this.el.listaIde) return;
    this.el.listaIde.innerHTML = '';

    notes.forEach((note, sortedIdx) => {
      // Buscar el índice original en el cache para editar correctamente
      const originalIdx = this._getNotes().findIndex(n => n === note);

      const item = document.createElement('div');
      item.classList.add('ide-note-item');
      if (this._currentIndex === originalIdx) item.classList.add('active');

      const title = document.createElement('span');
      title.classList.add('ide-note-item-title');
      title.textContent = note.titulo || 'Untitled';

      const date = document.createElement('span');
      date.classList.add('ide-note-item-date');
      date.textContent = note.fecha;

      item.append(title, date);
      item.addEventListener('click', () => this._edit(originalIdx));
      this.el.listaIde.appendChild(item);
    });
  }

  _prepareNew() {
    this._currentIndex = null;
    this.el.tituloIde.value = '';
    this.el.contenidoIde.value = '';
    const now = new Date();
    this.el.fechaInputIde.value = this._formatToDateTimeLocal(now);
    this.el.fechaDisplayIde.textContent = now.toLocaleString();
    this.el.destacarIde.checked = false;
    this.el.eliminarIdeBtn.classList.add('oculto');
    this._renderSidebar(this._getNotes());
    this._switchTab('tab-notas-list');
  }

  _edit(index) {
    const note = this._getNotes()[index];
    if (!note) return;

    this._currentIndex = index;
    this.el.tituloIde.value = note.titulo;
    this.el.contenidoIde.value = note.contenido;
    const date = new Date(note.fechaFull || note.fecha);
    this.el.fechaInputIde.value = this._formatToDateTimeLocal(date);
    this.el.fechaDisplayIde.textContent = date.toLocaleString();
    this.el.destacarIde.checked = !!note.destacada;
    this.el.eliminarIdeBtn.classList.remove('oculto');

    this._renderSidebar(this._getNotes());
    this._switchTab('tab-notas-list');
  }

  _save() {
    const titulo = this.el.tituloIde.value.trim();
    if (!titulo) return;

    const notes = this._getNotes();
    const selectedDate = new Date(this.el.fechaInputIde.value);
    const note = {
      titulo,
      contenido: this.el.contenidoIde.value,
      destacada: this.el.destacarIde.checked,
      fecha: selectedDate.toLocaleDateString(),
      fechaFull: selectedDate.toISOString()
    };

    if (this._currentIndex !== null) {
      notes[this._currentIndex] = note;
    } else {
      notes.push(note);
      this._currentIndex = notes.length - 1;
    }

    this._saveNotes(notes);
    this.loadNotes();
  }

  _delete() {
    if (this._currentIndex === null) return;
    const notes = this._getNotes();
    notes.splice(this._currentIndex, 1);
    this._saveNotes(notes);
    this._currentIndex = null;
    this.loadNotes();
    this._prepareNew();
  }

  _export() {
    if (this._currentIndex === null) return;
    const note = this._getNotes()[this._currentIndex];
    const text = `Title: ${note.titulo}\nDate: ${note.fecha}\n\n${note.contenido}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.titulo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Calendario ────────────────────────────────────────────────────────────

  _changeMonth(delta) {
    this._currentMonth.setMonth(this._currentMonth.getMonth() + delta);
    this._renderCalendar();
  }

  _toggleMonthPicker() {
    const { calMonthYear } = this.el;
    if (!calMonthYear) return;

    // Si ya hay selects, cancelamos (o guardamos)
    if (calMonthYear.querySelector('select')) {
      this._renderCalendar();
      return;
    }

    const currentMonth = this._currentMonth.getMonth();
    const currentYear = this._currentMonth.getFullYear();

    calMonthYear.innerHTML = '';

    const monthSelect = document.createElement('select');
    monthSelect.className = 'ide-select ide-cal-select';
    const monthNames = new Array(12).fill(0).map((_, i) =>
      new Intl.DateTimeFormat(navigator.language, { month: 'long' }).format(new Date(2000, i, 1))
    );

    monthNames.forEach((name, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = name;
      if (i === currentMonth) opt.selected = true;
      monthSelect.appendChild(opt);
    });

    const yearSelect = document.createElement('select');
    yearSelect.className = 'ide-select ide-cal-select';
    for (let y = currentYear - 10; y <= currentYear + 10; y++) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      if (y === currentYear) opt.selected = true;
      yearSelect.appendChild(opt);
    }

    const updateDate = () => {
      this._currentMonth.setMonth(parseInt(monthSelect.value));
      this._currentMonth.setFullYear(parseInt(yearSelect.value));

      // Actualizar el texto del encabezado inmediatamente
      calMonthYear.textContent = new Intl.DateTimeFormat(navigator.language, { month: 'long', year: 'numeric' }).format(this._currentMonth);

      this._renderCalendar();
    };

    monthSelect.addEventListener('change', updateDate);
    yearSelect.addEventListener('change', updateDate);

    calMonthYear.append(monthSelect, yearSelect);

    // Auto-enfocar el mes
    monthSelect.focus();
  }

  _renderCalendar() {
    const { calGrid, calMonthYear } = this.el;
    if (!calGrid || !calMonthYear) return;

    // Si estamos en modo edición, no sobreescribir con texto plano
    if (calMonthYear.querySelector('select')) return;

    calGrid.innerHTML = '';
    const year = this._currentMonth.getFullYear();
    const month = this._currentMonth.getMonth();

    calMonthYear.textContent = new Intl.DateTimeFormat(navigator.language, { month: 'long', year: 'numeric' }).format(this._currentMonth);

    // Cabecera días
    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysArr.forEach(d => {
      const h = document.createElement('div');
      h.classList.add('calendar-day-header');
      h.textContent = d;
      calGrid.appendChild(h);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const notes = this._getNotes();
    const today = new Date();

    // Días del mes anterior
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
      const d = prevMonthDays - i + 1;
      const dateStr = new Date(year, month - 1, d).toLocaleDateString();
      const dayNotes = notes.filter(n => n.fecha === dateStr);
      this._createDayCell(d, true, false, dayNotes, new Date(year, month - 1, d));
    }

    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
      const currentDate = new Date(year, month, d);
      const dateStr = currentDate.toLocaleDateString();
      const dayNotes = notes.filter(n => n.fecha === dateStr);
      this._createDayCell(d, false, isToday, dayNotes, currentDate);
    }

    // Rellenar hasta completar 42 celdas (6 semanas)
    const totalCells = calGrid.children.length - 7;
    const remaining = 42 - totalCells;
    for (let i = 1; i <= remaining; i++) {
      const dateStr = new Date(year, month + 1, i).toLocaleDateString();
      const dayNotes = notes.filter(n => n.fecha === dateStr);
      this._createDayCell(i, true, false, dayNotes, new Date(year, month + 1, i));
    }
  }

  _createDayCell(num, otherMonth, isToday = false, dayNotes = [], fullDate) {
    const cell = document.createElement('div');
    cell.classList.add('calendar-day');
    if (otherMonth) cell.classList.add('other-month');
    if (isToday) cell.classList.add('today');

    cell.addEventListener('click', () => {
      if (dayNotes.length > 0) {
        this._showDayNotes(fullDate, dayNotes);
      }
    });

    const numSpan = document.createElement('div');
    numSpan.classList.add('day-number');
    numSpan.textContent = num;
    cell.appendChild(numSpan);

    const notesWrap = document.createElement('div');
    notesWrap.classList.add('day-notes');
    dayNotes.forEach(note => {
      const tag = document.createElement('div');
      tag.classList.add('day-note-dot');
      tag.textContent = note.titulo;
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        const fullIdx = this._getNotes().findIndex(n => n === note);
        this._edit(fullIdx);
      });
      notesWrap.appendChild(tag);
    });

    cell.appendChild(notesWrap);
    this.el.calGrid.appendChild(cell);
  }

  _showDayNotes(date, dayNotes) {
    const { dayNotesView, calGrid, dayNotesList, dayViewTitle } = this.el;
    if (!dayNotesView || !calGrid || !dayNotesList) return;

    dayViewTitle.textContent = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    dayNotesList.innerHTML = '';

    dayNotes.forEach(note => {
      const item = document.createElement('div');
      item.classList.add('ide-note-item');

      const title = document.createElement('span');
      title.classList.add('ide-note-item-title');
      title.textContent = note.titulo;

      const time = document.createElement('span');
      time.classList.add('ide-note-item-date');
      const d = new Date(note.fechaFull || note.fecha);
      time.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      item.append(title, time);
      item.addEventListener('click', () => {
        const originalIdx = this._getNotes().findIndex(n => n === note);
        this._edit(originalIdx);
      });
      dayNotesList.appendChild(item);
    });

    calGrid.classList.add('oculto');
    if (this.el.calControls) this.el.calControls.classList.add('oculto');
    dayNotesView.classList.remove('oculto');
  }

  _formatToDateTimeLocal(date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  }
}

export const notesManager = new NotesManager();