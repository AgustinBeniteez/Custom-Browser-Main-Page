// Módulo para manejar notas y favoritos
import State from './state.js';
import { i18n } from './i18n.js';

class FeaturesManager {
  constructor() {
    this.notaEditando = null;
    this.initNotesHandlers();
    this.initFavoritesHandlers();
  }

  // Gestión de Notas
  initNotesHandlers() {
    const elements = {
      tituloNota: document.getElementById('titulo-nota'),
      contenidoNota: document.getElementById('contenido-nota'),
      destacarNotaCheckbox: document.getElementById('destacar-nota'),
      guardarNotaBtn: document.getElementById('guardar-nota-btn'),
      eliminarNotaBtn: document.getElementById('eliminar-nota-btn'),
      verNotasBtn: document.getElementById('ver-notas-btn'),
      cerrarMenuBtn: document.getElementById('cerrar-menu-btn'),
      crearNotaBtn: document.getElementById('crear-nota-btn'),
      exportarNotaBtn: document.getElementById('exportar-nota-btn'),
      menuNotas: document.getElementById('menu-notas'),
      notasPestanas: document.getElementById('lista-notas')
    };

    // Mostrar notas iniciales
    this.mostrarNotas(elements.notasPestanas);

    // Configurar eventos
    elements.guardarNotaBtn?.addEventListener('click', () => this.guardarNota(elements));
    elements.eliminarNotaBtn?.addEventListener('click', () => this.eliminarNota(elements));
    elements.verNotasBtn?.addEventListener('click', () => this.toggleMenuNotas(elements.menuNotas));
    elements.cerrarMenuBtn?.addEventListener('click', () => this.cerrarMenuNotas(elements.menuNotas));
    elements.crearNotaBtn?.addEventListener('click', () => this.prepararNuevaNota(elements));
    elements.exportarNotaBtn?.addEventListener('click', () => this.exportarNota());
  }

  mostrarNotas(container) {
    if (!container) return;

    const notas = State.getState().notas;
    container.innerHTML = '';

    notas.forEach((nota, index) => {
      const notaElem = document.createElement('div');
      notaElem.classList.add('nota-pestana');
      if (nota.destacada) {
        notaElem.classList.add('destacada');
      }
      notaElem.textContent = `${nota.titulo} (${nota.fecha})`;
      notaElem.addEventListener('click', () => this.editarNota(index));
      container.appendChild(notaElem);
    });
  }

  guardarNota(elements) {
    const titulo = elements.tituloNota?.value.trim();
    const contenido = elements.contenidoNota?.value.trim();
    const destacada = elements.destacarNotaCheckbox?.checked;
    const fecha = new Date().toLocaleString();

    if (!titulo) {
      alert('La nota debe tener un título.');
      return;
    }

    const nuevaNota = { titulo, contenido, destacada, fecha };
    const notas = [...State.getState().notas];

    if (this.notaEditando !== null) {
      notas[this.notaEditando] = nuevaNota;
      this.notaEditando = null;
    } else {
      notas.push(nuevaNota);
    }

    State.setState({ notas });
    this.mostrarNotas(elements.notasPestanas);
    this.limpiarFormularioNota(elements);
  }

  editarNota(index) {
    const elements = {
      tituloNota: document.getElementById('titulo-nota'),
      contenidoNota: document.getElementById('contenido-nota'),
      destacarNotaCheckbox: document.getElementById('destacar-nota'),
      eliminarNotaBtn: document.getElementById('eliminar-nota-btn'),
      menuNotas: document.getElementById('menu-notas')
    };

    const notas = State.getState().notas;
    const nota = notas[index];

    if (elements.tituloNota) elements.tituloNota.value = nota.titulo;
    if (elements.contenidoNota) elements.contenidoNota.value = nota.contenido;
    if (elements.destacarNotaCheckbox) elements.destacarNotaCheckbox.checked = nota.destacada;
    if (elements.eliminarNotaBtn) elements.eliminarNotaBtn.classList.remove('oculto');
    if (elements.menuNotas) elements.menuNotas.classList.add('visible');

    this.notaEditando = index;
  }

  eliminarNota(elements) {
    const notas = [...State.getState().notas];
    const index = notas.findIndex(nota => nota.titulo === elements.tituloNota?.value);

    if (index !== -1) {
      notas.splice(index, 1);
      State.setState({ notas });
      this.mostrarNotas(elements.notasPestanas);
      this.limpiarFormularioNota(elements);
    }
  }

  exportarNota() {
    if (this.notaEditando === null) {
      alert('Selecciona una nota para exportar.');
      return;
    }

    const nota = State.getState().notas[this.notaEditando];
    const texto = `Título: ${nota.titulo}\n\nContenido:\n${nota.contenido}\n\nFecha: ${nota.fecha}`;
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `${nota.titulo}.txt`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  limpiarFormularioNota(elements) {
    if (elements.tituloNota) elements.tituloNota.value = '';
    if (elements.contenidoNota) elements.contenidoNota.value = '';
    if (elements.eliminarNotaBtn) elements.eliminarNotaBtn.classList.add('oculto');
  }

  toggleMenuNotas(menuNotas) {
    menuNotas?.classList.toggle('visible');
  }

  cerrarMenuNotas(menuNotas) {
    menuNotas?.classList.remove('visible');
  }

  prepararNuevaNota(elements) {
    this.limpiarFormularioNota(elements);
    this.notaEditando = null;
    elements.menuNotas?.classList.add('visible');
  }

  // Gestión de Favoritos
  initFavoritesHandlers() {
    const elements = {
      favoritosContainer: document.getElementById('favoritos-list'),
      favoritoForm: document.getElementById('favorito-form'),
      agregarFavoritoBtn: document.getElementById('agregar-favorito-btn'),
      cerrarPopupFavorito: document.getElementById('cerrar-popup-favorito')
    };

    // Mostrar favoritos iniciales
    this.mostrarFavoritos(elements.favoritosContainer);

    // Configurar eventos
    elements.favoritoForm?.addEventListener('submit', (e) => this.agregarFavorito(e, elements));
    elements.agregarFavoritoBtn?.addEventListener('click', () => this.mostrarPopupFavorito());
    elements.cerrarPopupFavorito?.addEventListener('click', () => this.cerrarPopupFavorito());
  }

  mostrarFavoritos(container) {
    if (!container) return;

    const favoritos = State.getState().favoritos;
    container.innerHTML = '';

    favoritos.forEach(({ nombre, url }, index) => {
      const item = this.crearElementoFavorito(nombre, url, index);
      container.appendChild(item);
    });
  }

  crearElementoFavorito(nombre, url, index) {
    const item = document.createElement('div');
    item.classList.add('favorito-item');
    item.style.cssText = `
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-radius: 10px;
      padding: 10px;
      margin: 10px;
      background-color: ${State.getState().modoOscuro ? 'var(--color-modelight)' : '#f0f0f0'};
      color: ${State.getState().modoOscuro ? '#fff' : '#000'};
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease-in-out;
    `;

    const eliminarBtn = this.crearBotonEliminar(index);
    const enlace = this.crearEnlaceFavorito(nombre, url);
    const nombreElem = this.crearNombreFavorito(nombre);

    item.appendChild(eliminarBtn);
    item.appendChild(enlace);
    item.appendChild(nombreElem);

    return item;
  }

  crearBotonEliminar(index) {
    const eliminarBtn = document.createElement('button');
    eliminarBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    eliminarBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 0px;
      background-color: transparent;
      color: red;
      border: none;
      font-weight: bold;
      font-size: 15px;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      opacity: 0;
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out, color 0.3s ease-in-out;
      cursor: pointer;
    `;

    eliminarBtn.addEventListener('click', () => this.eliminarFavorito(index));
    eliminarBtn.addEventListener('mouseenter', () => {
      eliminarBtn.style.transform = 'scale(1.2)';
      eliminarBtn.style.color = '#b30000';
    });
    eliminarBtn.addEventListener('mouseleave', () => {
      eliminarBtn.style.transform = 'scale(1)';
      eliminarBtn.style.color = 'red';
    });

    return eliminarBtn;
  }

  crearEnlaceFavorito(nombre, url) {
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.target = '_blank';
    enlace.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
    `;

    const icono = document.createElement('img');
    icono.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;
    icono.alt = nombre;
    icono.style.cssText = `
      border-radius: 10px;
      width: 64px;
      height: 64px;
    `;

    enlace.appendChild(icono);
    return enlace;
  }

  crearNombreFavorito(nombre) {
    const nombreElem = document.createElement('div');
    nombreElem.textContent = nombre;
    nombreElem.style.cssText = `
      text-align: center;
      margin-top: 5px;
    `;
    return nombreElem;
  }

  agregarFavorito(e, elements) {
    e.preventDefault();
    const nombre = document.getElementById('nombre-favorito')?.value;
    const url = document.getElementById('url-favorito')?.value;

    if (nombre && url) {
      const favoritos = [...State.getState().favoritos];
      favoritos.push({ nombre, url });
      State.setState({ favoritos });
      this.mostrarFavoritos(elements.favoritosContainer);
      elements.favoritoForm?.reset();
      this.cerrarPopupFavorito();
    }
  }

  eliminarFavorito(index) {
    const favoritos = [...State.getState().favoritos];
    favoritos.splice(index, 1);
    State.setState({ favoritos });
    this.mostrarFavoritos(document.getElementById('favoritos-list'));
  }

  mostrarPopupFavorito() {
    const popup = document.getElementById('agregar-favorito');
    popup?.classList.remove('oculto');
  }

  cerrarPopupFavorito() {
    const popup = document.getElementById('agregar-favorito');
    popup?.classList.add('oculto');
  }
}

export const featuresManager = new FeaturesManager();