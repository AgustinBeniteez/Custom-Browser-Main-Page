// Módulo para manejar las notas

class NotesManager {
  constructor() {
    this.currentEditingNote = null;
    this.notesCache = null;
    this.initializeElements();
    this.bindEvents();
    this.loadNotes();
  }

  // Validar datos de nota
  validateNote(title, content) {
    return {
      isValid: title.trim().length > 0 && content.trim().length > 0,
      title: title.trim(),
      content: content.trim()
    };
  }

  // Obtener notas con cache
  getNotesFromCache() {
    if (this.notesCache === null) {
      this.notesCache = this.getNotes();
    }
    return this.notesCache;
  }

  // Invalidar cache
  invalidateCache() {
    this.notesCache = null;
  }

  initializeElements() {
    this.elements = {
      notasContainer: document.getElementById('lista-notas'),
      notasDestacadas: document.getElementById('notas-destacadas'),
      verNotasBtn: document.getElementById('ver-notas-btn'),
      menuNotas: document.getElementById('menu-notas'),
      crearNotaBtn: document.getElementById('crear-nota-btn'),
      cerrarMenuBtn: document.getElementById('cerrar-notas-btn'),
      tituloNota: document.getElementById('titulo-nota'),
      contenidoNota: document.getElementById('contenido-nota'),
      destacarNotaCheckbox: document.getElementById('destacar-nota'),
      eliminarNotaBtn: document.getElementById('eliminar-nota-btn'),
      exportarNotaBtn: document.getElementById('exportar-nota-btn'),
      guardarNotaBtn: document.getElementById('guardar-nota-btn')
    };
  }

  bindEvents() {
    this.elements.verNotasBtn.addEventListener('click', () => this.toggleNotesMenu());
    this.elements.cerrarMenuBtn.addEventListener('click', () => this.closeNotesMenu());
    this.elements.crearNotaBtn.addEventListener('click', () => this.prepareNewNote());
    this.elements.guardarNotaBtn.addEventListener('click', () => this.saveNote());
    this.elements.eliminarNotaBtn.addEventListener('click', () => this.deleteNote());
    this.elements.exportarNotaBtn.addEventListener('click', () => this.exportNote());

    // Actualizar notas cuando cambia el modo oscuro
    document.addEventListener('darkModeChanged', () => this.loadNotes());
  }

  toggleNotesMenu() {
    this.elements.menuNotas.classList.toggle('visible');
  }

  closeNotesMenu() {
    this.elements.menuNotas.classList.remove('visible');
  }

  prepareNewNote() {
    this.currentEditingNote = null;
    this.elements.tituloNota.value = '';
    this.elements.contenidoNota.value = '';
    this.elements.destacarNotaCheckbox.checked = false;
    this.elements.eliminarNotaBtn.classList.add('oculto');
    this.elements.menuNotas.classList.add('visible');
  }

  loadNotes() {
    const notes = this.getNotesFromCache();
    
    // Usar requestAnimationFrame para mejor rendimiento
    requestAnimationFrame(() => {
      this.renderNotesList(notes);
      this.renderFeaturedNotes(notes);
    });
  }

  renderNotesList(notes) {
    this.elements.notasContainer.innerHTML = '';
    notes.forEach((note, index) => {
      const noteElement = this.createNoteElement(note, index);
      this.elements.notasContainer.appendChild(noteElement);
    });
  }

  renderFeaturedNotes(notes) {
    this.elements.notasDestacadas.innerHTML = '';
    const featuredNotes = notes.filter(note => note.destacada);
    featuredNotes.forEach(note => {
      const featuredElement = this.createFeaturedNoteElement(note);
      this.elements.notasDestacadas.appendChild(featuredElement);
    });
  }

  createNoteElement(note, index) {
    const noteElement = document.createElement('div');
    noteElement.classList.add('nota-pestana');
    if (note.destacada) {
      noteElement.classList.add('destacada');
    }
    noteElement.textContent = `${note.titulo} (${note.fecha})`;
    noteElement.addEventListener('click', () => this.editNote(index));
    return noteElement;
  }

  createFeaturedNoteElement(note) {
    const featuredElement = document.createElement('div');
    featuredElement.classList.add('nota-destacada');
    
    const titleElement = document.createElement('strong');
    titleElement.textContent = note.titulo;
    
    const contentElement = document.createElement('p');
    contentElement.textContent = note.contenido;
    
    const dateElement = document.createElement('span');
    dateElement.textContent = note.fecha;
    
    featuredElement.appendChild(titleElement);
    featuredElement.appendChild(contentElement);
    featuredElement.appendChild(dateElement);
    
    return featuredElement;
  }

  editNote(index) {
    const note = this.getNotes()[index];
    this.currentEditingNote = index;
    this.elements.tituloNota.value = note.titulo;
    this.elements.contenidoNota.value = note.contenido;
    this.elements.destacarNotaCheckbox.checked = note.destacada;
    this.elements.eliminarNotaBtn.classList.remove('oculto');
  }

  saveNote() {
    const titulo = this.elements.tituloNota.value.trim();
    const contenido = this.elements.contenidoNota.value.trim();
    const destacada = this.elements.destacarNotaCheckbox.checked;
    const fecha = new Date().toLocaleString();

    if (!titulo) {
      alert('La nota debe tener un título.');
      return;
    }

    const newNote = { titulo, contenido, destacada, fecha };
    const notes = this.getNotes();

    if (this.currentEditingNote !== null) {
      notes[this.currentEditingNote] = newNote;
    } else {
      notes.push(newNote);
    }

    this.saveNotes(notes);
    this.loadNotes();
    this.prepareNewNote();
  }

  deleteNote() {
    if (this.currentEditingNote !== null) {
      const notes = this.getNotes();
      notes.splice(this.currentEditingNote, 1);
      this.saveNotes(notes);
      this.loadNotes();
      this.prepareNewNote();
    }
  }

  exportNote() {
    if (this.currentEditingNote !== null) {
      const note = this.getNotes()[this.currentEditingNote];
      const content = `Título: ${note.titulo}\n\nContenido:\n${note.contenido}\n\nFecha: ${note.fecha}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.titulo}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Selecciona una nota para exportar.');
    }
  }

  getNotes() {
    return JSON.parse(localStorage.getItem('notas') || '[]');
  }

  saveNotes(notes) {
    localStorage.setItem('notas', JSON.stringify(notes));
  }
}

export const notesManager = new NotesManager();