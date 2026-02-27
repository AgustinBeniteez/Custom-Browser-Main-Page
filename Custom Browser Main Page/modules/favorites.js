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
      expandidoContainer: document.getElementById('favoritos-expandido'),
      rootContainer: document.getElementById('favoritos-container'),
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
      contextMenu: document.getElementById('context-menu'),
    };
    this._favoritoAEliminar = null;
    this._itemEnEdicion = null;
    this._editingItemId = null;
    this._editingType = null;
    this._openFolderId = null;
    this._originalTop = null;
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

    // Rerender al cambiar ajustes de favoritos
    document.addEventListener('favoritesSettingsChanged', () => this.loadFavorites());

    // Click fuera para cerrar context menu
    document.addEventListener('click', () => this._hideContextMenu());
    document.addEventListener('contextmenu', e => {
      if (!el.contextMenu?.contains(e.target)) this._hideContextMenu();
    }, true); // Use capture phase to ensure it runs before others hide it? No, standard is fine.

    // Drag-and-drop sobre la lista raíz
    el.favoritosContainer?.addEventListener('dragover', e => e.preventDefault());
    el.favoritosContainer?.addEventListener('drop', e => this._handleRootDrop(e));

    // Permitir soltar en el contenedor exterior para sacar de carpeta
    el.rootContainer?.addEventListener('dragover', e => {
      e.preventDefault();
      // Solo mostrar feedback si estamos arrastrando un favorito que está dentro de una carpeta
      el.rootContainer.classList.add('drag-root');
    });
    el.rootContainer?.addEventListener('dragleave', () => {
      el.rootContainer.classList.remove('drag-root');
    });
    el.rootContainer?.addEventListener('drop', e => {
      el.rootContainer.classList.remove('drag-root');
      this._handleRootDrop(e);
    });

    // Limpieza global de estados de drag al terminar
    document.addEventListener('dragend', () => {
      el.rootContainer?.classList.remove('drag-root');
      document.body.classList.remove('dragging-folder', 'dragging-favorite');
    });

    // Permitir soltar en cualquier parte del body para sacar de carpeta (eject)
    document.body.addEventListener('dragover', e => {
      if (!e.target.closest('#favoritos-container')) {
        e.preventDefault();
      }
    });
    document.body.addEventListener('drop', e => {
      if (e.target.closest('#favoritos-container')) return;
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const { type, id } = JSON.parse(rawData);
      if (type === 'favorite') {
        this._moveFavoriteToFolder(id, null);
        this.loadFavorites();
      }
    });
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
    if (show) {
      this._syncCarpetaSelect();
      if (!this._editingItemId) {
        const submitBtn = document.getElementById('addbutton');
        const title = document.querySelector('#agregar-favorito h3');
        if (submitBtn) submitBtn.textContent = 'Añadir';
        if (title) title.textContent = 'Añadir a favoritos';
      }
    } else {
      this._editingItemId = null;
      this._editingType = null;
      this.el.favoritoForm?.reset();
    }
  }

  _toggleCarpetaPopup(show) {
    this.el.carpetaPopup?.classList.toggle('oculto', !show);
    if (show) {
      if (!this._editingItemId) {
        const submitBtn = document.getElementById('crear-carpeta-submit');
        const title = document.querySelector('#crear-carpeta h3');
        if (submitBtn) submitBtn.textContent = 'Guardar Carpeta';
        if (title) title.textContent = 'Nueva carpeta';
      }
    } else {
      this._editingItemId = null;
      this._editingType = null;
      this.el.carpetaForm?.reset();
    }
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

    if (this._editingItemId && this._editingType === 'favorite') {
      const idx = favoritos.findIndex(f => f.id === this._editingItemId);
      if (idx !== -1) {
        favoritos[idx] = { ...favoritos[idx], nombre, url, carpetaId };
      }
    } else {
      favoritos.push({ id: Date.now(), nombre, url, carpetaId });
    }

    this._saveFavorites(favoritos);
    this.loadFavorites();
    this.el.favoritoForm?.reset();
    this._toggleFavoritoPopup(false);
    this._editingItemId = null;
    this._editingType = null;
  }

  _handleCarpetaSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre-carpeta')?.value?.trim();
    if (!nombre) return;

    const carpetas = this.getFolders();

    if (this._editingItemId && this._editingType === 'folder') {
      const idx = carpetas.findIndex(c => c.id === this._editingItemId);
      if (idx !== -1) {
        carpetas[idx] = { ...carpetas[idx], nombre };
      }
    } else {
      carpetas.push({ id: Date.now(), nombre });
    }

    this._saveFolders(carpetas);
    this.loadFavorites();
    this.el.carpetaForm?.reset();
    this._toggleCarpetaPopup(false);
    this._editingItemId = null;
    this._editingType = null;
  }

  // ─── Drag & Drop raíz ──────────────────────────────────────────────────────

  _handleRootDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;
    const { type, id } = JSON.parse(rawData);

    if (type === 'favorite') {
      const favoritos = this.getFavorites();
      const idx = favoritos.findIndex(f => f.id === id);
      if (idx !== -1 && favoritos[idx].carpetaId) {
        favoritos[idx] = { ...favoritos[idx], carpetaId: null };
        this._saveFavorites(favoritos);
        this.loadFavorites();
      }
    }
  }

  // ─── Render principal ──────────────────────────────────────────────────────

  loadFavorites() {
    const favoritos = this.getFavorites();
    const carpetas = this.getFolders();

    // Restaurar posición si estaba ajustada
    this._resetPositionAfterExpansion();

    if (this.el.expandidoContainer) this.el.expandidoContainer.innerHTML = '';
    this.el.favoritosContainer.innerHTML = '';
    this.el.rootContainer?.classList.remove('has-expanded-folder');

    // 1. Si hay una carpeta abierta, renderizar su contenido expandido en su propio contenedor ARRIBA
    if (this._openFolderId) {
      const activeFolder = carpetas.find(c => String(c.id) === String(this._openFolderId));
      if (activeFolder) {
        const items = favoritos.filter(f => String(f.carpetaId) === String(activeFolder.id));
        this._renderExpandedFolder(activeFolder, items);
        this.el.rootContainer?.classList.add('has-expanded-folder');

        // Ajustar posición si estamos cerca del fondo
        setTimeout(() => this._adjustPositionForExpansion(), 0);
      }
    }

    // 2. Renderizar todas las carpetas en su posición original
    carpetas.forEach(carpeta => {
      const items = favoritos.filter(f => String(f.carpetaId) === String(carpeta.id));
      const isSource = String(carpeta.id) === String(this._openFolderId);
      this._renderFolder(carpeta, items, isSource);
    });

    // 3. Luego los favoritos sin carpeta
    const favsSinCarpeta = favoritos.filter(f => !f.carpetaId);
    favsSinCarpeta.forEach((fav, idx) => this._createFavoriteElement(fav, idx));

    // Mover el botón "+" al final de la lista
    if (this.el.agregarFavoritoBtn) {
      this.el.favoritosContainer.appendChild(this.el.agregarFavoritoBtn);
    }

    // Si no hay nada, marcamos el contenedor para mostrar siempre el "+"
    const isEmpty = favoritos.length === 0 && carpetas.length === 0;
    this.el.favoritosContainer.parentElement?.classList.toggle('is-empty', isEmpty);
  }

  // ─── Ajuste de Posición para Crecimiento Vertical ──────────────────────────

  _adjustPositionForExpansion() {
    const el = this.el.rootContainer;
    if (!el || el.classList.contains('widget-horizontal') || this._originalTop) return;

    // Solo si está posicionado con top (edit mode o layouts manuales)
    if (!el.style.top || el.style.top === 'auto') return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;

    // Si el centro del widget está en la mitad inferior, o está cerca del fondo
    if (rect.top + rect.height / 2 > vh / 2 || rect.bottom > vh - 100) {
      this._originalTop = el.style.top;
      const currentBottom = vh - rect.bottom;

      // Aseguramos que no quede fuera por abajo si ya lo estaba
      const safeBottom = Math.max(20, currentBottom);

      el.style.top = 'auto';
      el.style.bottom = safeBottom + 'px';
    }
  }

  _resetPositionAfterExpansion() {
    const el = this.el.rootContainer;
    if (!el || !this._originalTop) return;

    el.style.top = this._originalTop;
    el.style.bottom = 'auto';
    this._originalTop = null;
  }

  // ─── Render de carpeta ─────────────────────────────────────────────────────

  _renderExpandedFolder(carpeta, favoritos) {
    const folderDiv = document.createElement('div');
    folderDiv.classList.add('favorito-item', 'abierta');
    folderDiv.dataset.carpetaId = carpeta.id;

    const folderHeader = document.createElement('div');
    folderHeader.classList.add('fav-link');

    const folderIcon = document.createElement('div');
    folderIcon.classList.add('fav-icon');
    const customOpen = Storage.get('folder-open-icon');
    if (customOpen) {
      folderIcon.innerHTML = `<img src="${customOpen}" class="folder-icon-img">`;
    } else {
      folderIcon.innerHTML = '<i class="fa-solid fa-folder-open folder-icon-i"></i>';
    }

    const folderName = document.createElement('div');
    folderName.classList.add('fav-name');
    folderName.textContent = carpeta.nombre;

    folderHeader.appendChild(folderIcon);
    folderHeader.appendChild(folderName);

    const contenido = document.createElement('div');
    contenido.classList.add('favorito-carpeta-contenido');
    contenido.style.display = 'flex';

    favoritos.forEach((fav, idx) => {
      const el = this._createFavoriteElement(fav, idx, true);
      contenido.appendChild(el);
    });

    folderDiv.appendChild(folderHeader);
    folderDiv.appendChild(contenido);

    folderDiv.addEventListener('dragover', e => {
      e.preventDefault();
      folderDiv.classList.add('drag-over-into');
    });
    folderDiv.addEventListener('dragleave', () => {
      folderDiv.classList.remove('drag-over-into');
    });
    folderDiv.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      folderDiv.classList.remove('drag-over-into');
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const { type, id } = JSON.parse(rawData);
      if (type === 'favorite') {
        this._moveFavoriteToFolder(id, carpeta.id);
        this.loadFavorites();
      }
    });

    if (this.el.expandidoContainer) {
      this.el.expandidoContainer.appendChild(folderDiv);
    } else {
      this.el.favoritosContainer.prepend(folderDiv);
    }
  }

  _renderFolder(carpeta, favoritos, isSource = false) {
    const isDark = localStorage.getItem('modoOscuro') === 'true';

    const folderDiv = document.createElement('div');
    folderDiv.classList.add('favorito-item', 'carpeta-fav');
    if (isSource) folderDiv.classList.add('folder-source-open');
    folderDiv.dataset.carpetaId = carpeta.id;

    const showBg = Storage.get('show-favorites-bg') === 'true';
    if (!showBg) {
      folderDiv.classList.add('no-bg');
    }

    // Context menu para carpeta
    folderDiv.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();
      this._showContextMenu(e, { type: 'folder', id: carpeta.id });
    });

    // Cabecera de la carpeta (ícono + nombre)
    const folderHeader = document.createElement('div');
    folderHeader.classList.add('fav-link');

    const folderIcon = document.createElement('div');
    folderIcon.classList.add('fav-icon');

    const customClosed = Storage.get('folder-closed-icon');
    const customOpen = Storage.get('folder-open-icon');

    if (isSource) {
      if (customOpen) {
        folderIcon.innerHTML = `<img src="${customOpen}" class="folder-icon-img">`;
      } else {
        folderIcon.innerHTML = '<i class="fa-solid fa-folder-open folder-icon-i"></i>';
      }
    } else {
      if (customClosed) {
        folderIcon.innerHTML = `<img src="${customClosed}" class="folder-icon-img">`;
      } else {
        folderIcon.innerHTML = '<i class="fa-solid fa-folder folder-icon-i"></i>';
      }
    }

    const folderName = document.createElement('div');
    folderName.classList.add('fav-name');
    folderName.textContent = carpeta.nombre;

    folderHeader.appendChild(folderIcon);
    folderHeader.appendChild(folderName);

    // En el modo "Source", no renderizamos el contenido aquí abajo
    if (!isSource) {
      const contenido = document.createElement('div');
      contenido.classList.add('favorito-carpeta-contenido');
      favoritos.forEach((fav, idx) => {
        const el = this._createFavoriteElement(fav, idx, true);
        contenido.appendChild(el);
      });
      folderDiv.appendChild(contenido);
    }

    // Toggle al hacer clic en la carpeta
    folderDiv.addEventListener('click', e => {
      this._hideContextMenu();
      const currentId = String(carpeta.id);
      if (String(this._openFolderId) === currentId) {
        this._openFolderId = null;
      } else {
        this._openFolderId = currentId;
      }
      this.loadFavorites();
      if (this._openFolderId) {
        this.el.favoritosContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // Cerrar al hacer clic fuera (si está abierta)
    if (isSource) {
      const closeFolderHandler = e => {
        if (!folderDiv.parentElement) {
          document.removeEventListener('click', closeFolderHandler);
          return;
        }
        if (!this.el.favoritosContainer.contains(e.target)) {
          this._openFolderId = null;
          this.loadFavorites();
          document.removeEventListener('click', closeFolderHandler);
        }
      };
      // Usar timeout para evitar cerrar inmediatamente por el mismo clic de apertura
      setTimeout(() => document.addEventListener('click', closeFolderHandler), 10);
    }

    // Drag & drop sobre carpeta
    folderDiv.draggable = true;
    folderDiv.addEventListener('dragstart', e => {
      if (!e.target.classList.contains('carpeta-fav')) return;
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'folder', id: carpeta.id }));
      folderDiv.style.opacity = '0.5';
      document.body.classList.add('dragging-folder');
    });
    folderDiv.addEventListener('dragend', () => {
      folderDiv.style.opacity = '1';
    });

    folderDiv.addEventListener('dragover', e => {
      e.preventDefault();
      const rect = folderDiv.getBoundingClientRect();
      const isVertical = !document.getElementById('favoritos-container').classList.contains('widget-horizontal');

      const mousePos = isVertical ? e.clientY : e.clientX;
      const start = isVertical ? rect.top : rect.left;
      const dimension = isVertical ? rect.height : rect.width;
      const mid = start + dimension / 2;

      folderDiv.classList.remove('drag-over-left', 'drag-over-right', 'drag-over-into');

      // Si es un favorito, el centro permite "meter dentro", los bordes reordenar
      if (document.body.classList.contains('dragging-favorite')) {
        const threshold = dimension * 0.25;
        if (mousePos < start + threshold) {
          folderDiv.classList.add('drag-over-left');
        } else if (mousePos > start + dimension - threshold) {
          folderDiv.classList.add('drag-over-right');
        } else {
          folderDiv.classList.add('drag-over-into');
        }
      } else {
        // Si es carpeta (o el tipo no está claro), siempre reordenar
        if (mousePos < mid) folderDiv.classList.add('drag-over-left');
        else folderDiv.classList.add('drag-over-right');
      }
    });
    folderDiv.addEventListener('dragleave', () => {
      folderDiv.classList.remove('drag-over-left', 'drag-over-right', 'drag-over-into');
    });
    folderDiv.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      const isLeft = folderDiv.classList.contains('drag-over-left');
      const isInto = folderDiv.classList.contains('drag-over-into');
      folderDiv.classList.remove('drag-over-left', 'drag-over-right', 'drag-over-into');

      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const { type, id } = JSON.parse(rawData);

      if (type === 'favorite') {
        if (isInto) {
          this._moveFavoriteToFolder(id, carpeta.id);
        } else {
          // Si cae en el borde de una carpeta, lo sacamos a la raíz
          this._moveFavoriteToFolder(id, null);
        }
      } else if (type === 'folder') {
        this._reorderFolders(id, carpeta.id, isLeft);
      }
      this.loadFavorites();
    });

    folderDiv.appendChild(folderHeader);
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

    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'favorite', id: favorito.id }));
      item.style.opacity = '0.5';
      document.body.classList.add('dragging-favorite');
    });
    item.addEventListener('dragend', () => {
      item.style.opacity = '1';
    });

    item.addEventListener('dragover', e => {
      e.preventDefault();
      const rect = item.getBoundingClientRect();
      const isVertical = !document.getElementById('favoritos-container').classList.contains('widget-horizontal');

      const mousePos = isVertical ? e.clientY : e.clientX;
      const start = isVertical ? rect.top : rect.left;
      const mid = start + (isVertical ? rect.height : rect.width) / 2;

      item.classList.remove('drag-over-left', 'drag-over-right');
      if (mousePos < mid) item.classList.add('drag-over-left');
      else item.classList.add('drag-over-right');
    });
    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over-left', 'drag-over-right');
    });
    item.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      const isLeft = item.classList.contains('drag-over-left');
      item.classList.remove('drag-over-left', 'drag-over-right');

      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const { type, id } = JSON.parse(rawData);

      if (type === 'favorite') {
        this._reorderFavorites(id, favorito.id, isLeft);
        this.loadFavorites();
      }
    });

    // Context menu
    item.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();
      this._showContextMenu(e, { type: 'favorite', id: favorito.id, index });
    });

    const showBg = Storage.get('show-favorites-bg') === 'true';
    if (!showBg) {
      item.classList.add('no-bg');
    }

    const link = this._createLink(favorito.nombre, favorito.url);
    item.appendChild(link);

    if (!inFolder) {
      this.el.favoritosContainer.appendChild(item);
    }

    return item;
  }

  // ─── Sub-elementos ─────────────────────────────────────────────────────────

  _createLink(nombre, url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.classList.add('fav-link');

    const icon = document.createElement('img');
    icon.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;
    icon.alt = nombre;
    icon.classList.add('fav-icon');

    // Si la imagen falla, la ocultamos para que solo se vea el texto
    icon.onerror = () => {
      icon.style.display = 'none';
      link.classList.add('no-icon');
    };

    const nameEl = document.createElement('span');
    nameEl.textContent = nombre;
    nameEl.classList.add('fav-name');

    link.appendChild(icon);
    link.appendChild(nameEl);
    return link;
  }

  // ─── Context Menu ──────────────────────────────────────────────────────────

  _showContextMenu(e, item) {
    const { contextMenu: cm } = this.el;
    if (!cm) return;

    this._itemEnEdicion = item;

    cm.classList.remove('oculto');

    // Position
    const { clientX: x, clientY: y } = e;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const cmW = cm.offsetWidth;
    const cmH = cm.offsetHeight;

    let posX = x;
    let posY = y;

    if (x + cmW > winW) posX = x - cmW;
    if (y + cmH > winH) posY = y - cmH;

    cm.style.left = `${posX}px`;
    cm.style.top = `${posY}px`;

    // Bind actions
    const btnDelete = document.getElementById('cm-delete');
    const btnEdit = document.getElementById('cm-edit');

    // Remove old listeners
    const newDelete = btnDelete.cloneNode(true);
    const newEdit = btnEdit.cloneNode(true);
    btnDelete.parentNode.replaceChild(newDelete, btnDelete);
    btnEdit.parentNode.replaceChild(newEdit, btnEdit);

    newDelete.addEventListener('click', () => {
      if (item.type === 'favorite') {
        this._askDeleteFavorite(item.index);
      } else {
        // Confirmation for folder
        if (confirm('Delete this folder and its favorites?')) {
          this._deleteFolder(item.id);
        }
      }
      this._hideContextMenu();
    });

    newEdit.addEventListener('click', () => {
      this._handleEdit(item);
      this._hideContextMenu();
    });
  }

  _hideContextMenu() {
    const { contextMenu: cm } = this.el;
    if (cm) cm.classList.add('oculto');
  }

  _handleEdit(item) {
    this._editingItemId = item.id;
    this._editingType = item.type;

    if (item.type === 'favorite') {
      const favoritos = this.getFavorites();
      const fav = favoritos.find(f => f.id === item.id);
      if (!fav) return;

      // Fill form
      const nombreInput = document.getElementById('nombre-favorito');
      const urlInput = document.getElementById('url-favorito');
      const carpetaSelect = document.getElementById('carpeta-favorito');
      const submitBtn = document.getElementById('addbutton');
      const title = document.querySelector('#agregar-favorito h3');

      if (nombreInput) nombreInput.value = fav.nombre;
      if (urlInput) urlInput.value = fav.url;
      this._syncCarpetaSelect();
      if (carpetaSelect) carpetaSelect.value = fav.carpetaId || '';

      if (submitBtn) submitBtn.textContent = 'Actualizar';
      if (title) title.textContent = 'Editar Favorito';

      this._toggleFavoritoPopup(true);
    } else {
      const carpetas = this.getFolders();
      const cap = carpetas.find(c => c.id === item.id);
      if (!cap) return;

      // Fill form
      const nombreInput = document.getElementById('nombre-carpeta');
      const submitBtn = document.getElementById('crear-carpeta-submit');
      const title = document.querySelector('#crear-carpeta h3');

      if (nombreInput) nombreInput.value = cap.nombre;

      if (submitBtn) submitBtn.textContent = 'Actualizar';
      if (title) title.textContent = 'Editar Carpeta';

      this._toggleCarpetaPopup(true);
    }
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

  // ─── Reordenación ──────────────────────────────────────────────────────────

  _reorderFavorites(draggedId, targetId, isBefore, targetIsFolder = false) {
    if (draggedId === targetId) return;
    const favoritos = this.getFavorites();
    const fromIdx = favoritos.findIndex(f => f.id === draggedId);

    // Find absolute target index in combined list logic or just simple:
    // We need to handle folders vs items reordering
    if (targetIsFolder) {
      // Reordering a favorite relative to a folder is tricky because they are in different lists
      // For now, let's keep it simple: if dropped on folder edges, put at the start/end of the non-folder list?
      // Better: if dropped on folder edges, we don't reorder between different types for now to keep it sane.
      return;
    }

    const toIdx = favoritos.findIndex(f => f.id === targetId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const [movedItem] = favoritos.splice(fromIdx, 1);
      // Determine final position
      let finalIdx = favoritos.findIndex(f => f.id === targetId);
      if (!isBefore) finalIdx++;

      movedItem.carpetaId = favoritos[toIdx]?.carpetaId || null;
      favoritos.splice(finalIdx, 0, movedItem);
      this._saveFavorites(favoritos);
    }
  }

  _reorderFolders(draggedId, targetId, isBefore) {
    if (draggedId === targetId) return;
    const carpetas = this.getFolders();
    const fromIdx = carpetas.findIndex(c => c.id === draggedId);
    const toIdx = carpetas.findIndex(c => c.id === targetId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const [movedItem] = carpetas.splice(fromIdx, 1);
      let finalIdx = carpetas.findIndex(c => c.id === targetId);
      if (!isBefore) finalIdx++;

      carpetas.splice(finalIdx, 0, movedItem);
      this._saveFolders(carpetas);
    }
  }

  _moveFavoriteToFolder(favId, folderId) {
    const favoritos = this.getFavorites();
    const idx = favoritos.findIndex(f => String(f.id) === String(favId));
    if (idx !== -1) {
      favoritos[idx].carpetaId = folderId || null;
      this._saveFavorites(favoritos);
    }
  }
}

export const favoritesManager = new FavoritesManager();
