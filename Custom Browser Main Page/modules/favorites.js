/**
 * Favorites Manager — gestiona favoritos y carpetas.
 * Usa el módulo Storage centralizado para persistencia.
 */
import Storage from './storage.js';

class FavoritesManager {
  constructor() {
    this._initElements();
    this._bindEvents();
    this.loadFavorites();
  }

  // ─── Inicialización ────────────────────────────────────────────────────────

  _initElements() {
    this.el = {
      favoritosContainer: document.getElementById('favoritos-list'),
      agregarFavoritoBtn: document.getElementById('agregar-favorito-btn'),
      seleccionarTipoPopup: document.getElementById('seleccionar-tipo'),
      crearCarpetaBtn: document.getElementById('crear-carpeta-btn'),
      crearFavoritoBtn: document.getElementById('crear-favorito-btn'),
      cerrarTipoPopup: document.getElementById('cerrar-tipo-popup'),
      favoritoPopup: document.getElementById('agregar-favorito'),
      favoritoForm: document.getElementById('favorito-form'),
      cerrarPopupFavorito: document.getElementById('cerrar-popup-favorito'),
      carpetaPopup: document.getElementById('crear-carpeta'),
      carpetaForm: document.getElementById('carpeta-form'),
      cerrarCarpetaPopup: document.getElementById('cerrar-carpeta-popup'),
      carpetaSelect: document.getElementById('carpeta-favorito'),
      confirmarEliminarPopup: document.getElementById('confirmar-eliminar-favorito'),
      confirmarEliminarBtn: document.getElementById('confirmar-eliminar-btn'),
      cancelarEliminarBtn: document.getElementById('cancelar-eliminar-btn'),
    };
    /** Índice del favorito que se va a eliminar (para confirmar). */
    this._favoritoAEliminar = null;
  }

  _bindEvents() {
    const { el } = this;

    // Botón "+"
    el.agregarFavoritoBtn?.addEventListener('click', () => this._toggleTipoPopup(true));
    el.cerrarTipoPopup?.addEventListener('click', () => this._toggleTipoPopup(false));

    // Crear carpeta
    el.crearCarpetaBtn?.addEventListener('click', () => {
      this._toggleTipoPopup(false);
      this._toggleCarpetaPopup(true);
    });

    // Crear favorito
    el.crearFavoritoBtn?.addEventListener('click', () => {
      this._toggleTipoPopup(false);
      this._toggleFavoritoPopup(true);
    });

    // Cerrar popups
    el.cerrarPopupFavorito?.addEventListener('click', () => this._toggleFavoritoPopup(false));
    el.cerrarCarpetaPopup?.addEventListener('click', () => this._toggleCarpetaPopup(false));

    // Formularios
    el.favoritoForm?.addEventListener('submit', e => this._handleFavoritoSubmit(e));
    el.carpetaForm?.addEventListener('submit', e => this._handleCarpetaSubmit(e));

    // Confirmación de eliminación
    el.confirmarEliminarBtn?.addEventListener('click', () => this._confirmarEliminar());
    el.cancelarEliminarBtn?.addEventListener('click', () => this._toggleConfirmarEliminar(false));

    // Rerender al cambiar el modo oscuro
    document.addEventListener('darkModeChanged', () => this.loadFavorites());

    // Drag-and-drop sobre la lista raíz (sacar de carpeta)
    el.favoritosContainer?.addEventListener('dragover', e => e.preventDefault());
    el.favoritosContainer?.addEventListener('drop', e => this._handleRootDrop(e));
  }

  // ─── Persistencia ──────────────────────────────────────────────────────────

  getFavorites() {
    return Storage.getJSON('favoritos', []);
  }

  _saveFavorites(data) {
    Storage.setJSON('favoritos', data);
  }

  getFolders() {
    return Storage.getJSON('carpetas_favoritos', []);
  }

  _saveFolders(data) {
    Storage.setJSON('carpetas_favoritos', data);
  }

  // ─── Popups ────────────────────────────────────────────────────────────────

  _toggleTipoPopup(show) {
    this.el.seleccionarTipoPopup?.classList.toggle('oculto', !show);
  }

  _toggleFavoritoPopup(show) {
    this.el.favoritoPopup?.classList.toggle('oculto', !show);
    if (show) this._syncCarpetaSelect();
  }

  _toggleCarpetaPopup(show) {
    this.el.carpetaPopup?.classList.toggle('oculto', !show);
  }

  _toggleConfirmarEliminar(show, index = null) {
    const popup = this.el.confirmarEliminarPopup;
    if (!popup) return;
    popup.style.display = show ? 'flex' : 'none';
    this._favoritoAEliminar = show ? index : null;
  }

  /** Sincroniza el <select> de carpetas en el popup de agregar favorito. */
  _syncCarpetaSelect() {
    const select = this.el.carpetaSelect;
    if (!select) return;
    select.innerHTML = '<option value="">Sin carpeta</option>';
    this.getFolders().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      select.appendChild(opt);
    });
  }

  // ─── Handlers de formulario ────────────────────────────────────────────────

  _handleFavoritoSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre-favorito')?.value?.trim();
    const url = document.getElementById('url-favorito')?.value?.trim();
    const carpetaId = document.getElementById('carpeta-favorito')?.value || null;

    if (!nombre || !url) return;

    const favoritos = this.getFavorites();
    favoritos.push({ id: Date.now(), nombre, url, carpetaId });
    this._saveFavorites(favoritos);
    this.loadFavorites();
    this.el.favoritoForm?.reset();
    this._toggleFavoritoPopup(false);
  }

  _handleCarpetaSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre-carpeta')?.value?.trim();
    if (!nombre) return;

    const carpetas = this.getFolders();
    carpetas.push({ id: Date.now(), nombre });
    this._saveFolders(carpetas);
    this.loadFavorites();
    this.el.carpetaForm?.reset();
    this._toggleCarpetaPopup(false);
  }

  // ─── Drag & Drop raíz ──────────────────────────────────────────────────────

  _handleRootDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const id = parseInt(e.dataTransfer.getData('text/plain'));
    const favoritos = this.getFavorites();
    const idx = favoritos.findIndex(f => f.id === id);
    if (idx !== -1 && favoritos[idx].carpetaId) {
      favoritos[idx] = { ...favoritos[idx], carpetaId: null };
      this._saveFavorites(favoritos);
      this.loadFavorites();
    }
  }

  // ─── Render principal ──────────────────────────────────────────────────────

  loadFavorites() {
    const favoritos = this.getFavorites();
    const carpetas = this.getFolders();
    if (!this.el.favoritosContainer) return;
    this.el.favoritosContainer.innerHTML = '';

    // Primero las carpetas
    carpetas.forEach(carpeta => {
      const items = favoritos.filter(f => f.carpetaId === String(carpeta.id) || f.carpetaId === carpeta.id);
      this._renderFolder(carpeta, items);
    });

    // Luego los favoritos sin carpeta
    favoritos
      .filter(f => !f.carpetaId)
      .forEach((fav, idx) => this._createFavoriteElement(fav, idx));
  }

  // ─── Render de carpeta ─────────────────────────────────────────────────────

  _renderFolder(carpeta, favoritos) {
    const isDark = localStorage.getItem('modoOscuro') === 'true';

    const folderDiv = document.createElement('div');
    folderDiv.classList.add('favorito-item', 'carpeta-fav');
    folderDiv.dataset.carpetaId = carpeta.id;
    Object.assign(folderDiv.style, {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: '10px',
      padding: '10px',
      margin: '10px',
      backgroundColor: isDark ? 'var(--color-modelight)' : '#f0f0f0',
      color: isDark ? '#fff' : '#000',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease-in-out',
      cursor: 'pointer',
    });

    // Botón de eliminar carpeta
    const deleteBtn = this._createDeleteFolderButton(carpeta.id);
    folderDiv.appendChild(deleteBtn);

    // Ícono de carpeta
    const folderIcon = document.createElement('div');
    folderIcon.innerHTML = '<i class="fa-solid fa-folder" style="font-size:64px;color:#ffd700;"></i>';

    // Nombre de la carpeta
    const folderName = document.createElement('div');
    folderName.textContent = carpeta.nombre;
    folderName.style.textAlign = 'center';
    folderName.style.marginTop = '5px';

    // Contenido (favoritos dentro de la carpeta — ocultable)
    const contenido = document.createElement('div');
    contenido.classList.add('favorito-carpeta-contenido');
    Object.assign(contenido.style, {
      display: 'none',
      width: '100%',
      maxHeight: '0',
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
      marginTop: '10px',
      opacity: '0',
      transform: 'translateY(-10px)',
    });

    favoritos.forEach((fav, idx) => {
      const el = this._createFavoriteElement(fav, idx, true);
      contenido.appendChild(el);
    });

    // Toggle al hacer clic en la carpeta
    folderDiv.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = contenido.style.display === 'block';
      if (isOpen) {
        contenido.style.opacity = '0';
        contenido.style.transform = 'translateY(-10px)';
        folderDiv.classList.remove('abierta');
        setTimeout(() => {
          contenido.style.maxHeight = '0';
          contenido.style.display = 'none';
        }, 300);
      } else {
        contenido.style.display = 'block';
        folderDiv.classList.add('abierta');
        requestAnimationFrame(() => {
          contenido.style.maxHeight = `${contenido.scrollHeight}px`;
          contenido.style.opacity = '1';
          contenido.style.transform = 'translateY(0)';
        });
      }
      folderIcon.querySelector('i').classList.toggle('fa-folder');
      folderIcon.querySelector('i').classList.toggle('fa-folder-open');
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', e => {
      if (!folderDiv.contains(e.target)) {
        contenido.style.opacity = '0';
        contenido.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          contenido.style.maxHeight = '0';
          contenido.style.display = 'none';
          folderDiv.classList.remove('abierta');
        }, 300);
        const icon = folderIcon.querySelector('i');
        icon.classList.remove('fa-folder-open');
        icon.classList.add('fa-folder');
      }
    });

    // Drag & drop sobre carpeta
    folderDiv.addEventListener('dragover', e => {
      e.preventDefault();
      folderDiv.style.transform = 'scale(1.05)';
      folderDiv.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
      folderIcon.querySelector('i').style.color = '#ffc400';
    });
    folderDiv.addEventListener('dragleave', () => {
      folderDiv.style.transform = 'scale(1)';
      folderDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      folderIcon.querySelector('i').style.color = '#ffd700';
    });
    folderDiv.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      folderDiv.style.transform = 'scale(1)';
      folderDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      folderIcon.querySelector('i').style.color = '#ffd700';
      const favId = parseInt(e.dataTransfer.getData('text/plain'));
      const favoritos = this.getFavorites();
      const idx = favoritos.findIndex(f => f.id === favId);
      if (idx !== -1) {
        favoritos[idx] = { ...favoritos[idx], carpetaId: carpeta.id };
        this._saveFavorites(favoritos);
        this.loadFavorites();
      }
    });

    folderDiv.appendChild(folderIcon);
    folderDiv.appendChild(folderName);
    folderDiv.appendChild(contenido);
    this.el.favoritosContainer.appendChild(folderDiv);
  }

  // ─── Render de favorito individual ─────────────────────────────────────────

  /**
   * Crea el elemento DOM para un favorito.
   * @param {object}  favorito
   * @param {number}  index    - Posición en el array global de favoritos
   * @param {boolean} inFolder - true = sólo retorna el elemento, sin añadir al DOM raíz
   * @returns {HTMLElement}
   */
  _createFavoriteElement(favorito, index, inFolder = false) {
    const isDark = localStorage.getItem('modoOscuro') === 'true';

    const item = document.createElement('div');
    item.classList.add('favorito-item');
    item.draggable = true;
    item.dataset.favoritoId = favorito.id;
    Object.assign(item.style, {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: '10px',
      padding: '10px',
      margin: '10px',
      backgroundColor: isDark ? 'var(--color-modelight)' : '#f0f0f0',
      color: isDark ? '#fff' : '#000',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease-in-out',
      cursor: 'move',
    });

    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', favorito.id);
      item.style.opacity = '0.5';
    });
    item.addEventListener('dragend', () => { item.style.opacity = '1'; });

    const deleteBtn = this._createDeleteButton(index);
    const link = this._createLink(favorito.nombre, favorito.url);
    const nameEl = this._createNameEl(favorito.nombre);
    nameEl.classList.add('nameElement-fav');

    item.append(deleteBtn, link, nameEl);

    if (!inFolder) {
      this.el.favoritosContainer.appendChild(item);
    }

    return item;
  }

  // ─── Sub-elementos ─────────────────────────────────────────────────────────

  _createDeleteButton(index) {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    Object.assign(btn.style, {
      position: 'absolute',
      top: '5px',
      right: '0px',
      backgroundColor: 'transparent',
      color: 'red',
      border: 'none',
      fontWeight: 'bold',
      fontSize: '15px',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      opacity: '0.2',
      transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out, color 0.3s ease-in-out',
      cursor: 'pointer',
    });
    btn.addEventListener('click', () => this._askDeleteFavorite(index));
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.2)'; btn.style.color = '#b30000'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; btn.style.color = 'red'; });
    return btn;
  }

  _createDeleteFolderButton(carpetaId) {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    Object.assign(btn.style, {
      position: 'absolute',
      top: '5px',
      right: '0px',
      backgroundColor: 'transparent',
      color: 'red',
      border: 'none',
      fontWeight: 'bold',
      fontSize: '15px',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      opacity: '0.2',
      transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out, color 0.3s ease-in-out',
      cursor: 'pointer',
      zIndex: '1',
    });
    btn.addEventListener('click', e => { e.stopPropagation(); this._deleteFolder(carpetaId); });
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.2)'; btn.style.color = '#b30000'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; btn.style.color = 'red'; });
    return btn;
  }

  _createLink(nombre, url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.style.cssText = 'display:flex;flex-direction:column;align-items:center;';

    const icon = document.createElement('img');
    icon.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;
    icon.alt = nombre;
    icon.style.cssText = 'border-radius:10px;width:64px;height:64px;';

    link.appendChild(icon);
    return link;
  }

  _createNameEl(nombre) {
    const el = document.createElement('div');
    el.textContent = nombre;
    el.style.textAlign = 'center';
    el.style.marginTop = '5px';
    return el;
  }

  // ─── Eliminación ───────────────────────────────────────────────────────────

  _askDeleteFavorite(index) {
    this._toggleConfirmarEliminar(true, index);
  }

  _confirmarEliminar() {
    if (this._favoritoAEliminar === null) return;
    const favoritos = this.getFavorites();
    favoritos.splice(this._favoritoAEliminar, 1);
    this._saveFavorites(favoritos);
    this.loadFavorites();
    this._toggleConfirmarEliminar(false);
  }

  _deleteFolder(carpetaId) {
    // Eliminar la carpeta
    const carpetas = this.getFolders().filter(c => c.id !== carpetaId);
    this._saveFolders(carpetas);

    // Mover sus favoritos fuera de la carpeta
    const favoritos = this.getFavorites().map(f =>
      (f.carpetaId === carpetaId || f.carpetaId === String(carpetaId))
        ? { ...f, carpetaId: null }
        : f
    );
    this._saveFavorites(favoritos);
    this.loadFavorites();
  }
}

export const favoritesManager = new FavoritesManager();
