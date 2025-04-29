// Módulo para manejar los favoritos

class FavoritesManager {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.loadFavorites();
  }

  initializeElements() {
    this.elements = {
      favoritosContainer: document.getElementById('favoritos-list'),
      agregarFavoritoBtn: document.getElementById('agregar-favorito-btn'),
      favoritoPopup: document.getElementById('agregar-favorito'),
      favoritoForm: document.getElementById('favorito-form'),
      cerrarPopupFavorito: document.getElementById('cerrar-popup-favorito')
    };
  }

  bindEvents() {
    this.elements.agregarFavoritoBtn.addEventListener('click', () => this.togglePopup(true));
    this.elements.cerrarPopupFavorito.addEventListener('click', () => this.togglePopup(false));
    this.elements.favoritoForm.addEventListener('submit', (e) => this.handleSubmit(e));

    // Actualizar favoritos cuando cambia el modo oscuro
    document.addEventListener('darkModeChanged', () => this.loadFavorites());
  }

  togglePopup(show) {
    this.elements.favoritoPopup.classList.toggle('oculto', !show);
  }

  handleSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre-favorito').value;
    const url = document.getElementById('url-favorito').value;

    if (nombre && url) {
      const favoritos = this.getFavorites();
      favoritos.push({ nombre, url });
      this.saveFavorites(favoritos);
      this.loadFavorites();
      this.elements.favoritoForm.reset();
      this.togglePopup(false);
    }
  }

  loadFavorites() {
    const favoritos = this.getFavorites();
    this.elements.favoritosContainer.innerHTML = '';
    favoritos.forEach((favorito, index) => this.createFavoriteElement(favorito, index));
  }

  createFavoriteElement(favorito, index) {
    const { nombre, url } = favorito;
    const isDarkMode = localStorage.getItem('modoOscuro') === 'true';

    const item = document.createElement('div');
    item.classList.add('favorito-item');
    Object.assign(item.style, {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: '10px',
      padding: '10px',
      margin: '10px',
      backgroundColor: isDarkMode ? 'var(--color-modelight)' : '#f0f0f0',
      color: isDarkMode ? '#fff' : '#000',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease-in-out'
    });

    const deleteButton = this.createDeleteButton(index);
    const link = this.createFavoriteLink(nombre, url);
    const nameElement = this.createNameElement(nombre);

    item.appendChild(deleteButton);
    item.appendChild(link);
    item.appendChild(nameElement);
    this.elements.favoritosContainer.appendChild(item);
  }

  createDeleteButton(index) {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fa-solid fa-trash"></i>';
    Object.assign(button.style, {
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
      cursor: 'pointer'
    });

    button.addEventListener('click', () => this.deleteFavorite(index));
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.2)';
      button.style.color = '#b30000';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.color = 'red';
    });

    return button;
  }

  createFavoriteLink(nombre, url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.style.display = 'flex';
    link.style.flexDirection = 'column';
    link.style.alignItems = 'center';

    const icon = document.createElement('img');
    icon.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;
    icon.alt = nombre;
    icon.style.borderRadius = '10px';
    icon.style.width = '64px';
    icon.style.height = '64px';

    link.appendChild(icon);
    return link;
  }

  createNameElement(nombre) {
    const nameElement = document.createElement('div');
    nameElement.textContent = nombre;
    nameElement.style.textAlign = 'center';
    nameElement.style.marginTop = '5px';
    return nameElement;
  }

  deleteFavorite(index) {
    const favoritos = this.getFavorites();
    favoritos.splice(index, 1);
    this.saveFavorites(favoritos);
    this.loadFavorites();
  }

  getFavorites() {
    return JSON.parse(localStorage.getItem('favoritos') || '[]');
  }

  saveFavorites(favoritos) {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  }
}

export const favoritesManager = new FavoritesManager();