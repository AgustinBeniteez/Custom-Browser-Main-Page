/**
 * Notes Manager — gestiona notas del usuario.
 * Persistencia en localStorage (notas no necesitan cookies al no ser compartibles).
 */

const STORAGE_KEY = 'notas';

class NotesManager {
  constructor() {
    /** Índice de la nota que se está editando actualmente, o null si es nueva. */
    this._currentIndex = null;
    /** Caché en memoria para evitar parseos repetidos. */
    this._cache = null;
    this._initElements();
    this._bindEvents();
    this.loadNotes();
  }

  // ─── Persistencia ──────────────────────────────────────────────────────────

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

  _invalidateCache() {
    this._cache = null;
  }

  // ─── Inicialización ────────────────────────────────────────────────────────

  _initElements() {
    this.el = {
      lista: document.getElementById('lista-notas'),
      destacadas: document.getElementById('notas-destacadas'),
      verBtn: document.getElementById('ver-notas-btn'),
      menu: document.getElementById('menu-notas'),
      crearBtn: document.getElementById('crear-nota-btn'),
      cerrarBtn: document.getElementById('cerrar-notas-btn'),
      titulo: document.getElementById('titulo-nota'),
      contenido: document.getElementById('contenido-nota'),
      destacarCheckbox: document.getElementById('destacar-nota'),
      eliminarBtn: document.getElementById('eliminar-nota-btn'),
      exportarBtn: document.getElementById('exportar-nota-btn'),
      guardarBtn: document.getElementById('guardar-nota-btn'),
    };
  }

  _bindEvents() {
    const { el } = this;
    el.verBtn?.addEventListener('click', () => this._toggleMenu());
    el.cerrarBtn?.addEventListener('click', () => this._closeMenu());
    el.crearBtn?.addEventListener('click', () => this._prepareNew());
    el.guardarBtn?.addEventListener('click', () => this._save());
    el.eliminarBtn?.addEventListener('click', () => this._delete());
    el.exportarBtn?.addEventListener('click', () => this._export());

    // Re-renderizar si cambia el modo oscuro
    document.addEventListener('darkModeChanged', () => this.loadNotes());
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  loadNotes() {
    this._invalidateCache();
    const notes = this._getNotes();
    requestAnimationFrame(() => {
      this._renderList(notes);
      this._renderFeatured(notes);
    });
  }

  _renderList(notes) {
    if (!this.el.lista) return;
    this.el.lista.innerHTML = '';
    notes.forEach((note, idx) => {
      const el = document.createElement('div');
      el.classList.add('nota-pestana');
      if (note.destacada) el.classList.add('destacada');
      el.textContent = `${note.titulo} (${note.fecha})`;
      el.addEventListener('click', () => this._edit(idx));
      this.el.lista.appendChild(el);
    });
  }

  _renderFeatured(notes) {
    if (!this.el.destacadas) return;
    this.el.destacadas.innerHTML = '';
    notes
      .filter(n => n.destacada)
      .forEach(note => {
        const wrap = document.createElement('div');
        wrap.classList.add('nota-destacada');
        const title = document.createElement('strong');
        title.textContent = note.titulo;
        const content = document.createElement('p');
        content.textContent = note.contenido;
        const date = document.createElement('span');
        date.textContent = note.fecha;
        wrap.append(title, content, date);
        this.el.destacadas.appendChild(wrap);
      });
  }

  // ─── Acciones ──────────────────────────────────────────────────────────────

  _toggleMenu() {
    this.el.menu?.classList.toggle('visible');
  }

  _closeMenu() {
    this.el.menu?.classList.remove('visible');
  }

  _prepareNew() {
    this._currentIndex = null;
    if (this.el.titulo) this.el.titulo.value = '';
    if (this.el.contenido) this.el.contenido.value = '';
    if (this.el.destacarCheckbox) this.el.destacarCheckbox.checked = false;
    this.el.eliminarBtn?.classList.add('oculto');
    this.el.menu?.classList.add('visible');
  }

  _edit(index) {
    const note = this._getNotes()[index];
    if (!note) return;
    this._currentIndex = index;
    if (this.el.titulo) this.el.titulo.value = note.titulo;
    if (this.el.contenido) this.el.contenido.value = note.contenido;
    if (this.el.destacarCheckbox) this.el.destacarCheckbox.checked = !!note.destacada;
    this.el.eliminarBtn?.classList.remove('oculto');
    this.el.menu?.classList.add('visible');
  }

  _save() {
    const titulo = this.el.titulo?.value.trim() || '';
    const contenido = this.el.contenido?.value.trim() || '';
    const destacada = this.el.destacarCheckbox?.checked ?? false;

    if (!titulo) {
      alert('La nota debe tener un título.');
      return;
    }

    const note = { titulo, contenido, destacada, fecha: new Date().toLocaleString() };
    const notes = this._getNotes();

    if (this._currentIndex !== null) {
      notes[this._currentIndex] = note;
    } else {
      notes.push(note);
    }

    this._saveNotes(notes);
    this.loadNotes();
    this._prepareNew();
  }

  _delete() {
    if (this._currentIndex === null) return;
    const notes = this._getNotes();
    notes.splice(this._currentIndex, 1);
    this._saveNotes(notes);
    this.loadNotes();
    this._prepareNew();
  }

  _export() {
    if (this._currentIndex === null) {
      alert('Selecciona una nota para exportar.');
      return;
    }
    const note = this._getNotes()[this._currentIndex];
    const text = `Título: ${note.titulo}\n\nContenido:\n${note.contenido}\n\nFecha: ${note.fecha}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${note.titulo}.txt` });
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const notesManager = new NotesManager();