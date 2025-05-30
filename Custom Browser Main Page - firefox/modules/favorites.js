// Módulo para manejar los favoritos

class FavoritesManager {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.loadFavorites();
  }

  initializeElements() {
    this.elements = {
      favoritosContainer: document.getElementById("favoritos-list"),
      agregarFavoritoBtn: document.getElementById("agregar-favorito-btn"),
      seleccionarTipoPopup: document.getElementById("seleccionar-tipo"),
      crearCarpetaBtn: document.getElementById("crear-carpeta-btn"),
      crearFavoritoBtn: document.getElementById("crear-favorito-btn"),
      cerrarTipoPopup: document.getElementById("cerrar-tipo-popup"),
      favoritoPopup: document.getElementById("agregar-favorito"),
      favoritoForm: document.getElementById("favorito-form"),
      cerrarPopupFavorito: document.getElementById("cerrar-popup-favorito"),
      carpetaPopup: document.getElementById("crear-carpeta"),
      carpetaForm: document.getElementById("carpeta-form"),
      cerrarCarpetaPopup: document.getElementById("cerrar-carpeta-popup"),
      carpetaSelect: document.getElementById("carpeta-favorito"),
      confirmarEliminarPopup: document.getElementById(
        "confirmar-eliminar-favorito"
      ),
      confirmarEliminarBtn: document.getElementById("confirmar-eliminar-btn"),
      cancelarEliminarBtn: document.getElementById("cancelar-eliminar-btn"),
      favoritosList: document.getElementById("favoritos-list"),
    };
    this.favoritoAEliminar = null;
  }

  bindEvents() {
    this.elements.agregarFavoritoBtn.addEventListener("click", () =>
      this.toggleTipoPopup(true)
    );
    this.elements.cerrarTipoPopup.addEventListener("click", () =>
      this.toggleTipoPopup(false)
    );

    this.elements.crearCarpetaBtn.addEventListener("click", () => {
      this.toggleTipoPopup(false);
      this.toggleCarpetaPopup(true);
    });

    this.elements.crearFavoritoBtn.addEventListener("click", () => {
      this.toggleTipoPopup(false);
      this.toggleFavoritoPopup(true);
    });

    this.elements.cerrarPopupFavorito.addEventListener("click", () =>
      this.toggleFavoritoPopup(false)
    );
    this.elements.cerrarCarpetaPopup.addEventListener("click", () =>
      this.toggleCarpetaPopup(false)
    );

    this.elements.favoritoForm.addEventListener("submit", (e) =>
      this.handleFavoritoSubmit(e)
    );
    this.elements.carpetaForm.addEventListener("submit", (e) =>
      this.handleCarpetaSubmit(e)
    );

    this.elements.confirmarEliminarBtn.addEventListener("click", () =>
      this.confirmarEliminarFavorito()
    );
    this.elements.cancelarEliminarBtn.addEventListener("click", () =>
      this.toggleConfirmarEliminar(false)
    );

    // Actualizar favoritos cuando cambia el modo oscuro
    document.addEventListener("darkModeChanged", () => this.loadFavorites());

    // Configurar eventos de arrastre para el contenedor principal de favoritos
    this.elements.favoritosList.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.elements.favoritosList.style.backgroundColor =
        "rgba(255, 255, 255, 0.1)";
    });

    this.elements.favoritosList.addEventListener("dragleave", () => {
      this.elements.favoritosList.style.backgroundColor = "";
    });

    this.elements.favoritosList.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const favoritoId = parseInt(e.dataTransfer.getData("text/plain"));
      const favoritos = this.getFavorites();
      const favoritoIndex = favoritos.findIndex((f) => f.id === favoritoId);

      if (favoritoIndex !== -1 && favoritos[favoritoIndex].carpetaId) {
        favoritos[favoritoIndex].carpetaId = null;
        this.saveFavorites(favoritos);
        this.loadFavorites();
      }

      this.elements.favoritosList.style.backgroundColor = "";
    });
  }

  toggleTipoPopup(show) {
    this.elements.seleccionarTipoPopup.classList.toggle("oculto", !show);
  }

  toggleFavoritoPopup(show) {
    this.elements.favoritoPopup.classList.toggle("oculto", !show);
    if (show) {
      this.actualizarCarpetasSelect();
    }
  }

  toggleCarpetaPopup(show) {
    this.elements.carpetaPopup.classList.toggle("oculto", !show);
  }

  actualizarCarpetasSelect() {
    const carpetas = this.getFolders();
    this.elements.carpetaSelect.innerHTML =
      '<option value="">Sin carpeta</option>';
    carpetas.forEach((carpeta) => {
      const option = document.createElement("option");
      option.value = carpeta.id;
      option.textContent = carpeta.nombre;
      this.elements.carpetaSelect.appendChild(option);
    });
  }

  togglePopup(show) {
    this.elements.favoritoPopup.classList.toggle("oculto", !show);
  }

  handleFavoritoSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre-favorito").value;
    const url = document.getElementById("url-favorito").value;
    const carpetaId = document.getElementById("carpeta-favorito").value;

    if (nombre && url) {
      const favoritos = this.getFavorites();
      const nuevoFavorito = { id: Date.now(), nombre, url, carpetaId };
      favoritos.push(nuevoFavorito);
      this.saveFavorites(favoritos);
      this.loadFavorites();
      this.elements.favoritoForm.reset();
      this.toggleFavoritoPopup(false);
    }
  }

  handleCarpetaSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre-carpeta").value;

    if (nombre) {
      const carpetas = this.getFolders();
      const nuevaCarpeta = { id: Date.now(), nombre };
      carpetas.push(nuevaCarpeta);
      this.saveFolders(carpetas);
      this.loadFavorites();
      this.elements.carpetaForm.reset();
      this.toggleCarpetaPopup(false);
    }
  }

  loadFavorites() {
    const favoritos = this.getFavorites();
    const carpetas = this.getFolders();
    this.elements.favoritosContainer.innerHTML = "";

    // Crear elementos para carpetas primero
    carpetas.forEach((carpeta) => {
      const favoritosCarpeta = favoritos.filter(
        (f) => f.carpetaId === carpeta.id
      );
      this.createFolderElement(carpeta, favoritosCarpeta);
    });

    // Crear elementos para favoritos sin carpeta después
    const favoritosSinCarpeta = favoritos.filter((f) => !f.carpetaId);
    favoritosSinCarpeta.forEach((favorito, index) =>
      this.createFavoriteElement(favorito, index)
    );
  }

  createFolderElement(carpeta, favoritos) {
    const isDarkMode = localStorage.getItem("modoOscuro") === "true";
    const folderDiv = document.createElement("div");
    folderDiv.classList.add("favorito-item");
    folderDiv.classList.add("carpeta-fav");
    folderDiv.dataset.carpetaId = carpeta.id;
    Object.assign(folderDiv.style, {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: "10px",
      padding: "10px",
      margin: "10px",
      backgroundColor: isDarkMode ? "var(--color-modelight)" : "#f0f0f0",
      color: isDarkMode ? "#fff" : "#000",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease-in-out",
      cursor: "pointer",
    });

    // Agregar botón de eliminar carpeta
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    Object.assign(deleteButton.style, {
      position: "absolute",
      top: "5px",
      right: "0px",
      backgroundColor: "transparent",
      color: "red",
      border: "none",
      fontWeight: "bold",
      fontSize: "15px",
      borderRadius: "50%",
      width: "30px",
      height: "30px",
      opacity: "0.2",
      transition:
        "opacity 0.3s ease-in-out, transform 0.3s ease-in-out, color 0.3s ease-in-out",
      cursor: "pointer",
      zIndex: "1",
    });

    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deleteCarpeta(carpeta.id);
    });

    deleteButton.addEventListener("mouseenter", () => {
      deleteButton.style.transform = "scale(1.2)";
      deleteButton.style.color = "#b30000";
    });

    deleteButton.addEventListener("mouseleave", () => {
      deleteButton.style.transform = "scale(1)";
      deleteButton.style.color = "red";
    });

    folderDiv.appendChild(deleteButton);

    folderDiv.addEventListener("dragover", (e) => {
      e.preventDefault();
      folderDiv.style.backgroundColor = isDarkMode
        ? "var(--color-modedark)"
        : "#e0e0e0";
      folderDiv.style.transform = "scale(1.05)";
      folderDiv.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.2)";
      folderIcon.querySelector("i").style.color = "#ffc400";
    });

    folderDiv.addEventListener("dragleave", () => {
      folderDiv.style.backgroundColor = isDarkMode
        ? "var(--color-modelight)"
        : "#f0f0f0";
      folderDiv.style.transform = "scale(1)";
      folderDiv.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      folderIcon.querySelector("i").style.color = "#ffd700";
    });

    folderDiv.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const favoritoId = parseInt(e.dataTransfer.getData("text/plain"));
      const favoritos = this.getFavorites();
      const favoritoIndex = favoritos.findIndex((f) => f.id === favoritoId);

      if (favoritoIndex !== -1) {
        const favoritoActualizado = {
          ...favoritos[favoritoIndex],
          carpetaId: carpeta.id,
        };
        favoritos[favoritoIndex] = favoritoActualizado;
        this.saveFavorites(favoritos);
        this.loadFavorites();

        // Actualizar la vista de la carpeta inmediatamente
        const contenido = folderDiv.querySelector(
          ".favorito-carpeta-contenido"
        );
        if (contenido) {
          const favoritoElement = this.createFavoriteElement(
            favoritoActualizado,
            favoritos.length,
            true
          );
          contenido.appendChild(favoritoElement);
          contenido.style.maxHeight = contenido.scrollHeight + "px";
          contenido.style.display = "block";
        }
      }

      folderDiv.style.backgroundColor = isDarkMode
        ? "var(--color-modelight)"
        : "#f0f0f0";
    });

    const folderIcon = document.createElement("div");
    folderIcon.innerHTML = `<i class="fa-solid fa-folder" style="font-size: 64px; color: #ffd700;"></i>`;

    const folderName = document.createElement("div");
    folderName.textContent = carpeta.nombre;
    folderName.style.textAlign = "center";
    folderName.style.marginTop = "5px";

    const contenido = document.createElement("div");
    contenido.classList.add("favorito-carpeta-contenido");
    contenido.style.display = "none";
    contenido.style.width = "100%";
    contenido.style.maxHeight = "0";
    contenido.style.overflow = "hidden";
    contenido.style.transition = "all 0.3s ease-in-out";
    contenido.style.marginTop = "10px";
    contenido.style.opacity = "0";
    contenido.style.transform = "translateY(-10px)";

    favoritos.forEach((favorito, index) => {
      const favoritoElement = this.createFavoriteElement(favorito, index, true);
      contenido.appendChild(favoritoElement);
    });

    folderDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = contenido.style.display === "block";

      if (isOpen) {
        contenido.style.opacity = "0";
        contenido.style.transform = "translateY(-10px)";
        folderDiv.classList.remove("abierta");
        setTimeout(() => {
          contenido.style.maxHeight = "0";
          contenido.style.display = "none";
        }, 300);
      } else {
        contenido.style.display = "block";
        contenido.style.opacity = "0";
        contenido.style.transform = "translateY(-10px)";
        folderDiv.classList.add("abierta");
        requestAnimationFrame(() => {
          contenido.style.maxHeight = contenido.scrollHeight + "px";
          contenido.style.opacity = "1";
          contenido.style.transform = "translateY(0)";
        });
      }

      folderIcon.querySelector("i").classList.toggle("fa-folder");
      folderIcon.querySelector("i").classList.toggle("fa-folder-open");
    });

    document.addEventListener("click", (e) => {
      if (!folderDiv.contains(e.target)) {
        contenido.style.opacity = "0";
        contenido.style.transform = "translateY(-10px)";
        setTimeout(() => {
          contenido.style.maxHeight = "0px";
          contenido.style.display = "none";
          folderDiv.classList.remove("abierta");
        }, 300);
        folderIcon.querySelector("i").classList.remove("fa-folder-open");
        folderIcon.querySelector("i").classList.add("fa-folder");
      }
    });

    folderDiv.appendChild(folderIcon);
    folderDiv.appendChild(folderName);
    folderDiv.appendChild(contenido);
    this.elements.favoritosContainer.appendChild(folderDiv);
  }

  createFavoriteElement(favorito, index, inFolder = false) {
    const { nombre, url } = favorito;
    const isDarkMode = localStorage.getItem("modoOscuro") === "true";

    const item = document.createElement("div");
    item.classList.add("favorito-item");
    item.draggable = true;
    item.dataset.favoritoId = favorito.id;
    Object.assign(item.style, {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: "10px",
      padding: "10px",
      margin: "10px",
      backgroundColor: isDarkMode ? "var(--color-modelight)" : "#f0f0f0",
      color: isDarkMode ? "#fff" : "#000",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease-in-out",
      cursor: "move",
    });

    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", favorito.id);
      item.style.opacity = "0.5";
    });

    item.addEventListener("dragend", () => {
      item.style.opacity = "1";
    });

    const deleteButton = this.createDeleteButton(index);
    const link = this.createFavoriteLink(nombre, url);
    const nameElement = this.createNameElement(nombre);
    //add class to nameElement
    nameElement.classList.add("nameElement-fav");
    item.appendChild(deleteButton);
    item.appendChild(link);
    item.appendChild(nameElement);

    if (!inFolder) {
      this.elements.favoritosContainer.appendChild(item);
    }

    return item;
  }

  createDeleteButton(index) {
    const button = document.createElement("button");
    button.innerHTML = '<i class="fa-solid fa-trash"></i>';
    Object.assign(button.style, {
      position: "absolute",
      top: "5px",
      right: "0px",
      backgroundColor: "transparent",
      color: "red",
      border: "none",
      fontWeight: "bold",
      fontSize: "15px",
      borderRadius: "50%",
      width: "30px",
      height: "30px",
      opacity: "0.2",
      transition:
        "opacity 0.3s ease-in-out, transform 0.3s ease-in-out, color 0.3s ease-in-out",
      cursor: "pointer",
    });

    button.addEventListener("click", () => this.deleteFavorite(index));
    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.2)";
      button.style.color = "#b30000";
    });
    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)";
      button.style.color = "red";
    });

    return button;
  }

  createFavoriteLink(nombre, url) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.style.display = "flex";
    link.style.flexDirection = "column";
    link.style.alignItems = "center";

    const icon = document.createElement("img");
    icon.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;
    icon.alt = nombre;
    icon.style.borderRadius = "10px";
    icon.style.width = "64px";
    icon.style.height = "64px";

    link.appendChild(icon);
    return link;
  }

  createNameElement(nombre) {
    const nameElement = document.createElement("div");
    nameElement.textContent = nombre;
    nameElement.style.textAlign = "center";
    nameElement.style.marginTop = "5px";
    return nameElement;
  }

  toggleConfirmarEliminar(show, index) {
    this.elements.confirmarEliminarPopup.style.display = show ? "flex" : "none";
    if (show) {
      this.favoritoAEliminar = index;
    } else {
      this.favoritoAEliminar = null;
    }
  }

  confirmarEliminarFavorito() {
    if (this.favoritoAEliminar !== null) {
      const favoritos = this.getFavorites();
      favoritos.splice(this.favoritoAEliminar, 1);
      this.saveFavorites(favoritos);
      this.loadFavorites();
      this.toggleConfirmarEliminar(false);
    }
  }

  deleteFavorite(index) {
    this.toggleConfirmarEliminar(true, index);
  }

  getFavorites() {
    return JSON.parse(localStorage.getItem("favoritos") || "[]");
  }

  getFolders() {
    return JSON.parse(localStorage.getItem("carpetas_favoritos") || "[]");
  }

  saveFavorites(favoritos) {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }

  saveFolders(carpetas) {
    localStorage.setItem("carpetas_favoritos", JSON.stringify(carpetas));
  }

  deleteFavorito(index) {
    const favoritos = this.getFavorites();
    const favoritoAEliminar = favoritos[index];

    if (favoritoAEliminar) {
      favoritos.splice(index, 1);
      this.saveFavorites(favoritos);
      this.loadFavorites();
    }
  }

  deleteCarpeta(carpetaId) {
    const carpetas = this.getFolders();
    const favoritos = this.getFavorites();

    // Eliminar la carpeta
    const carpetaIndex = carpetas.findIndex((c) => c.id === carpetaId);
    if (carpetaIndex !== -1) {
      carpetas.splice(carpetaIndex, 1);
      this.saveFolders(carpetas);
    }

    // Actualizar favoritos que estaban en la carpeta
    const favoritosActualizados = favoritos.map((f) => {
      if (f.carpetaId === carpetaId) {
        return { ...f, carpetaId: null };
      }
      return f;
    });

    this.saveFavorites(favoritosActualizados);
    this.loadFavorites();
  }
}

export const favoritesManager = new FavoritesManager();
