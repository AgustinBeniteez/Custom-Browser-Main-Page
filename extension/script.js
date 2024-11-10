let toggle = true;
setInterval(() => {
    // Aplicar transiciones directamente en JavaScript
    document.documentElement.style.transition = "background-color 0.5s ease, color 0.5s ease";
    document.body.style.transition = "background-image 0.5s ease-in-out";

    if (toggle) {
        document.documentElement.style.setProperty('--color-modelight', 'var(--color-modedark)');
        document.documentElement.style.setProperty('--color-modelight1', 'var(--color-modedark1)');
        document.documentElement.style.setProperty('--color-letrasdark', 'var(--color-letraswhite)');
        document.body.style.backgroundImage = "url('fondos/background4.png')";
    } else {
        document.documentElement.style.setProperty('--color-modelight', '#fefefecb');
        document.documentElement.style.setProperty('--color-modelight1', '#e2e2e2cc');
        document.documentElement.style.setProperty('--color-letrasdark', '#161616');
        document.body.style.backgroundImage = "url('fondos/background3.png')";
    }
    
    toggle = !toggle;
}, 5000);

// CONSTANTES PARA CUANDO SE CARGA EL TAB NUEVO
const reloj = document.getElementById('reloj');
const decoracionRelojCheckbox = document.getElementById('decoracion-reloj');
const relojContainer = document.querySelector('.reloj-container h1');
const searchInput = document.getElementById('search-input');
const idiomaSelect = document.getElementById('idioma');
const popup = document.getElementById('popup');
const cerrarPopup = document.getElementById('cerrar-popup');
const fondoInput = document.getElementById('fondo-url');
const urlInput = document.getElementById('url-input'); // Input para URL
const guardarFondoBtn = document.getElementById('guardar-fondo-url');
const fondoPredeterminadoImages = document.querySelectorAll('.fondo-predeterminado img');
const tituloFavoritos = document.getElementById('titulo-favoritos');
const crearNotaBtn = document.getElementById('crear-nota-btn');
const verNotasBtn = document.getElementById('ver-notas-btn');
const guardarNotaBtn = document.getElementById('guardar-nota-btn');
const eliminarNotaBtn = document.getElementById('eliminar-nota-btn');
const cerrarMenuBtn = document.getElementById('cerrar-menu-btn');
const tituloNota = document.getElementById('titulo-nota');
const contenidoNota = document.getElementById('contenido-nota');
const destacarNotaCheckbox = document.getElementById('destacar-nota');

// Funciones para actualizar el reloj
function actualizarReloj() {
  const ahora = new Date();
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  reloj.textContent = `${horas}:${minutos}`;
}
setInterval(actualizarReloj, 1000);
actualizarReloj();
// Cargar la imagen de fondo almacenada al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const fondoAlmacenado = localStorage.getItem('fondo-url');
  if (fondoAlmacenado) {
    document.body.style.backgroundImage = `url(${fondoAlmacenado})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    
  }
});
  let traducciones = {};
  // Cargar las traducciones desde el archivo JSON
  fetch('lang.json')
    .then(response => response.json())
    .then(data => {
      traducciones = data;
      const idiomaAlmacenado = localStorage.getItem('idioma');
      if (idiomaAlmacenado) {
        idiomaSelect.value = idiomaAlmacenado;
        actualizarIdioma(idiomaAlmacenado);
      }   
      })
    .catch(error => console.error('Error al cargar las traducciones:', error));
  
  // Función para actualizar la interfaz según el idioma
  function actualizarIdioma(idiomaSeleccionado) {
    // Actualiza el título de la pestaña
    document.title = traducciones[idiomaSeleccionado]?.titulo || "New Tab"; // Cambia "New Tab" por el título correspondiente
  
    searchInput.placeholder = traducciones[idiomaSeleccionado]?.placeholderGoogle || "Search..."; // Placeholder del buscador
    document.querySelector('h2').textContent = traducciones[idiomaSeleccionado]?.ajustes || "Settings";
    document.querySelector('label[for="idioma"]').textContent = traducciones[idiomaSeleccionado]?.idioma || "Select Language:";
    guardarFondoBtn.textContent = traducciones[idiomaSeleccionado]?.guardarFondo || "Save Background";
    tituloFavoritos.textContent = traducciones[idiomaSeleccionado]?.favoritos || "Favorites";
    crearNotaBtn.textContent = traducciones[idiomaSeleccionado]?.crearNota || "Create Note";
    verNotasBtn.innerHTML = `<i class="fa-solid fa-thumbtack fa-lg">&nbsp;&nbsp;</i> ${traducciones[idiomaSeleccionado]?.verNotas || "Notes"}`;
    guardarNotaBtn.innerHTML = `${traducciones[idiomaSeleccionado]?.guardarNota || "Save Note"} &nbsp;<i class="fa-solid fa-floppy-disk"></i>`; // Actualiza el texto del botón Guardar Nota
    eliminarNotaBtn.innerHTML = `${traducciones[idiomaSeleccionado]?.eliminarNota || "Delete Note"} &nbsp;<i class="fa-solid fa-trash"></i>`; // Actualiza el texto del botón Eliminar Nota
    cerrarMenuBtn.textContent = traducciones[idiomaSeleccionado]?.cerrarMenu || "Close";
    tituloNota.placeholder = traducciones[idiomaSeleccionado]?.tituloNota || "Note Title";
    contenidoNota.placeholder = traducciones[idiomaSeleccionado]?.contenidoNota || "Note Content";
    destacarNotaCheckbox.textContent = traducciones[idiomaSeleccionado]?.destacarNota || "Pin Note";
    document.querySelector('.note-details').textContent = traducciones[idiomaSeleccionado]?.note_details || "Note Details";
    document.querySelector('label[for="fecha-nota"]').textContent = traducciones[idiomaSeleccionado]?.important_date || "Important Date (Optional)";
    // Favoritos
    document.querySelector('#favoritos-container h3').textContent = traducciones[idiomaSeleccionado]?.tituloFavoritos || "Favorites";
    document.querySelector('#agregar-favorito-btn').textContent = "+"; // Se mantiene el símbolo +
    document.querySelector('#agregar-favorito h3').textContent = traducciones[idiomaSeleccionado]?.agregarFavorito || "Add Favorites";
    document.querySelector('#nombre-favorito').placeholder = traducciones[idiomaSeleccionado]?.nombreFavorito || "Site Name";
    document.querySelector('#url-favorito').placeholder = traducciones[idiomaSeleccionado]?.urlFavorito || "Site URL";
    document.querySelector('.agregar-favorito-btn1').textContent = traducciones[idiomaSeleccionado]?.agregarBtn || "Add";
    document.querySelector('#cerrar-popup-favorito').textContent = traducciones[idiomaSeleccionado]?.cerrarPopup || "Close";
    document.querySelector('#wallpaper-gallery-text').textContent = traducciones[idiomaSeleccionado]?.wallpaperGallery || "Wallpaper Gallery";
    // Actualización del botón exportar
    document.getElementById('exportar-nota-btn').innerHTML = `${traducciones[idiomaSeleccionado]?.exportarNota || "Export Note"} &nbsp;<i class="fa-solid fa-file-arrow-down fa-lg"></i>`;
}
  // Cambiar idioma cuando se selecciona uno nuevo
  idiomaSelect.addEventListener('change', (event) => {
    const idiomaSeleccionado = event.target.value;
    localStorage.setItem('idioma', idiomaSeleccionado);
    actualizarIdioma(idiomaSeleccionado);
    
  });
  // Cargar la configuración de la decoración del reloj
  const decoracionRelojAlmacenada = localStorage.getItem('decoracionReloj');
  if (decoracionRelojAlmacenada === 'false') {
    decoracionRelojCheckbox.checked = false;
    relojContainer.classList.add('reloj-sin-animacion');
    relojContainer.style.animation = 'none'; // Quita la animación
  } else {
    decoracionRelojCheckbox.checked = true; // Por defecto se asume que está activado
    relojContainer.classList.remove('reloj-sin-animacion');
    relojContainer.style.animation = 'textGlow 2s ease-in-out infinite alternate';
  }
// Mostrar y cerrar el popup
// Cerrar el popup
cerrarPopup.addEventListener('click', () => {
  popup.style.display = 'none'; // Ocultar el popup
});

// Abrir el popup de ajustes
ajustesBtn.addEventListener('click', () => {
  popup.style.display = 'block'; // Mostrar el popup
});

// Guardar el fondo personalizado
guardarFondoBtn.addEventListener('click', () => {
  const file = fondoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.body.style.backgroundImage = `url(${e.target.result})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      localStorage.setItem('fondo-url', e.target.result); // Guardar en localStorage
      popup.style.display = 'none'; // Cerrar popup después de guardar
    };
    reader.readAsDataURL(file);
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const favoritosContainer = document.getElementById('favoritos-list');
  const agregarFavoritoBtn = document.getElementById('agregar-favorito-btn');
  const agregarFavoritoDiv = document.getElementById('agregar-favorito');
  const cerrarPopupFavorito = document.getElementById('cerrar-popup-favorito');
  const favoritoForm = document.getElementById('favorito-form');

  // Cargar favoritos desde localStorage
  cargarFavoritos();

  agregarFavoritoBtn.addEventListener('click', () => {
      agregarFavoritoDiv.classList.remove('oculto');
  });

  cerrarPopupFavorito.addEventListener('click', () => {
      agregarFavoritoDiv.classList.add('oculto');
  });

  favoritoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('nombre-favorito').value;
      const url = document.getElementById('url-favorito').value;

      // Agregar favorito
      agregarFavorito(nombre, url);
      agregarFavoritoDiv.classList.add('oculto');
      favoritoForm.reset();
  });

  function cargarFavoritos() {
      const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
      favoritos.forEach(favorito => {
          crearElementoFavorito(favorito.nombre, favorito.url);
      });
  }

  function agregarFavorito(nombre, url) {
      const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
      favoritos.push({ nombre, url });
      localStorage.setItem('favoritos', JSON.stringify(favoritos));
      crearElementoFavorito(nombre, url);
  }

  function eliminarFavorito(nombre, url) {
      let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
      // Filtrar el favorito que se quiere eliminar
      favoritos = favoritos.filter(favorito => favorito.url !== url);
      localStorage.setItem('favoritos', JSON.stringify(favoritos)); // Actualizar el localStorage
  }

  function crearElementoFavorito(nombre, url) {
      const item = document.createElement('div');
      item.classList.add('favoritos-item');

      // Crear el enlace
      const enlace = document.createElement('a');
      enlace.href = url; // Asigna la URL
      enlace.target = "_blank"; // Abrir en nueva pestaña

      const img = document.createElement('img');
      img.src = `https://api.faviconkit.com/${url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`; // URL de la API de favicon
      img.onerror = () => { img.src = 'iconnofound.svg'; }; // Imagen por defecto si falla
      
      // Agregar la imagen al enlace
      enlace.appendChild(img);
      item.appendChild(enlace); // Agregar el enlace al contenedor del favorito

      const texto = document.createElement('span'); // Cambiado a <span>
      texto.textContent = nombre;
      item.appendChild(texto);

      const eliminarBtn = document.createElement('button');
      eliminarBtn.classList.add('boton-eliminar'); // Añadir clase al botón
      eliminarBtn.innerHTML = '&minus;'; // Símbolo de resta
      eliminarBtn.addEventListener('click', () => {
          item.remove();
          eliminarFavorito(nombre, url); // Eliminar del localStorage
      });
      item.appendChild(eliminarBtn);

      favoritosContainer.appendChild(item);
  }

// Abrir el popup de ajustes
ajustesBtn.addEventListener('click', () => {
  popup.style.display = 'block'; // Mostrar el popup
});

// Función para buscar utilizando el motor de búsqueda seleccionado
function buscar(event) {
  if (isSearching) return; // Si ya está buscando, no hacer nada
  isSearching = true; // Establecer el bloqueo

  if (event) {
    event.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada
  }

  const valor = searchInput.value.trim(); // Asegúrate de quitar espacios en blanco
  if (!valor) {
    isSearching = false; // Desbloquear si no hay valor
    return; // No hacer nada si el input está vacío
  }

  // Almacenar el valor de búsqueda en localStorage
  localStorage.setItem('valorBusqueda', valor);

  const buscadorSeleccionado = document.getElementById('buscador').value;
  let url;

  switch (buscadorSeleccionado) {
      case 'bing':
          url = `https://www.bing.com/search?q=${encodeURIComponent(valor)}`;
          break;
      case 'yahoo':
          url = `https://search.yahoo.com/search?p=${encodeURIComponent(valor)}`;
          break;
      case 'brave':
          url = `https://search.brave.com/search?q=${encodeURIComponent(valor)}`;
          break;
      case 'duckduckgo':
          url = `https://duckduckgo.com/?q=${encodeURIComponent(valor)}`;
          break;
      case 'google':
      default:
          url = `https://www.google.com/search?q=${encodeURIComponent(valor)}`;
          break;
  }

  window.location.href = url; // Abre la búsqueda en la misma pestaña
  isSearching = false; // Desbloquear después de abrir la pestaña
}

// Asegúrate de que el evento solo se registre una vez
if (buscarBtn) {
  buscarBtn.addEventListener('click', buscar);
}

// Agregar un evento de tecla para ejecutar la búsqueda
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
      event.preventDefault(); // Evita el comportamiento predeterminado
      buscar(); // Ejecuta la búsqueda cuando se presiona Enter
  }
});

// Agregar el evento para cambiar el buscador y actualizar el placeholder
document.getElementById('buscador').addEventListener('change', (event) => {
  const buscadorSeleccionado = event.target.value;
  const idiomaSeleccionado = idiomaSelect.value;
  actualizarPlaceholder(buscadorSeleccionado, idiomaSeleccionado); // Actualizar placeholder
});

// Asegúrate de inicializar correctamente las variables
let searchHistory = []; // Asegúrate de inicializar el historial de búsqueda
if (localStorage.getItem('searchHistory')) {
  searchHistory = JSON.parse(localStorage.getItem('searchHistory')); // Cargar historial de búsqueda desde localStorage
}

searchInput.addEventListener('blur', () => {
  const valor = searchInput.value.trim();
  if (valor && !searchHistory.includes(valor)) {
    searchHistory.push(valor); // Agregar nuevo valor al historial
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory)); // Guardar historial en localStorage
  }
});

// Función para establecer el fondo
function setBackground(imagePath) {
  document.body.style.backgroundImage = `url('${imagePath}')`;
  localStorage.setItem('backgroundImage', imagePath); // Guardar en localStorage
}

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si hay un fondo guardado
  const savedBackground = localStorage.getItem('backgroundImage');
  
  if (savedBackground) {
      // Si hay un fondo guardado, usarlo
      setBackground(savedBackground);
  } else {
      // Si no hay un fondo guardado, usar el primero (background1.png)
      setBackground('/fondos/background1.png'); // Ajusta esta línea si es necesario
  }
});

// Función para manejar el clic en las imágenes
const backgroundImages = document.querySelectorAll('.fondo-predeterminado img');
backgroundImages.forEach((img) => {
  img.addEventListener('click', () => {
      const imagePath = img.getAttribute('data-image');
      setBackground(imagePath);
  });
});

// Función para establecer el fondo desde una URL
function setBackground(url) {
  document.body.style.backgroundImage = `url('${url}')`;
  document.body.style.backgroundSize = 'cover'; // Ajustar a pantalla completa
  localStorage.setItem('background', url); // Guardar en localStorage
}

// Al cargar la página, verifica si hay un fondo, idioma o buscador guardado
window.onload = function() {
  const savedBackground = localStorage.getItem('background');
  if (savedBackground) {
    setBackground(savedBackground); // Establece el fondo guardado
  }

  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    document.getElementById('idioma').value = savedLanguage; // Establece el idioma guardado
  }

  const savedSearchEngine = localStorage.getItem('searchEngine');
  if (savedSearchEngine) {
    document.getElementById('buscador').value = savedSearchEngine; // Establece el buscador guardado
  }
};

// Lógica para abrir y cerrar el popup
document.getElementById('ajustes-btn').addEventListener('click', function() {
  document.getElementById('popup').style.display = 'block'; // Muestra el popup
});

document.getElementById('cerrar-popup').addEventListener('click', function() {
  document.getElementById('popup').style.display = 'none'; // Cierra el popup
});

// Cambiar fondo con imágenes predeterminadas
document.querySelectorAll('.fondo-predeterminado img').forEach(img => {
  img.addEventListener('click', function() {
    const backgroundUrl = img.getAttribute('data-image');
    setBackground(backgroundUrl); // Cambiar el fondo y guardar
  });
});

// Cambiar fondo con URL introducida
document.getElementById('guardar-fondo-url').addEventListener('click', function(event) {
  event.preventDefault(); // Prevenir el envío del formulario
  const url = document.getElementById('fondo-url').value; // Obtener la URL del input
  if (url) {
    setBackground(url); // Cambiar el fondo y guardar
  }
});

// Guardar el idioma seleccionado
document.getElementById('idioma').addEventListener('change', function() {
  const selectedLanguage = this.value;
  localStorage.setItem('language', selectedLanguage); // Guardar idioma en localStorage
});

// Guardar el buscador seleccionado
document.getElementById('buscador').addEventListener('change', function() {
  const selectedSearchEngine = this.value;
  localStorage.setItem('searchEngine', selectedSearchEngine); // Guardar buscador en localStorage
});


// Almacenar el buscador seleccionado
document.getElementById('buscador').addEventListener('change', (event) => {
  const buscadorSeleccionado = event.target.value;
  localStorage.setItem('buscadorSeleccionado', buscadorSeleccionado);
  actualizarPlaceholder(buscadorSeleccionado, idiomaSelect.value);
});

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const buscadorAlmacenado = localStorage.getItem('buscadorSeleccionado');
  if (buscadorAlmacenado) {
    document.getElementById('buscador').value = buscadorAlmacenado; // Establecer el valor en el select
    actualizarPlaceholder(buscadorAlmacenado, idiomaSelect.value); // Actualizar el placeholder
  }
});

// Almacenar idioma seleccionado
idiomaSelect.addEventListener('change', () => {
  const idiomaSeleccionado = idiomaSelect.value;
  localStorage.setItem('idioma', idiomaSeleccionado);
  actualizarIdioma(idiomaSeleccionado);
});

// Almacenar fondo seleccionado
fondoPredefinidoSelect.addEventListener('change', () => {
  const fondoSeleccionado = fondoPredefinidoSelect.value;
  document.body.style.backgroundImage = `url("/fondos/${fondoSeleccionado}.png")`; 
  localStorage.setItem('fondoSeleccionado', fondoSeleccionado);
});

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const buscadorAlmacenado = localStorage.getItem('buscadorSeleccionado');
  if (buscadorAlmacenado) {
    document.getElementById('buscador').value = buscadorAlmacenado; // Establecer el valor en el select
    actualizarPlaceholder(buscadorAlmacenado, idiomaSelect.value); // Actualizar el placeholder
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Cargar fondo
  const fondoAlmacenado = localStorage.getItem('fondoSeleccionado');
  if (fondoAlmacenado) {
    document.body.style.backgroundImage = `url("/fondos/${fondoAlmacenado}.png")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  }

  // Cargar idioma
  const idiomaAlmacenado = localStorage.getItem('idioma');
  if (idiomaAlmacenado) {
    idiomaSelect.value = idiomaAlmacenado;
    actualizarIdioma(idiomaAlmacenado);
  }

  // Cargar buscador
  const buscadorAlmacenado = localStorage.getItem('buscadorSeleccionado');
  if (buscadorAlmacenado) {
    document.getElementById('buscador').value = buscadorAlmacenado;
    actualizarPlaceholder(buscadorAlmacenado); // Actualizar el placeholder
  }
});

// Almacenar el buscador seleccionado
document.getElementById('buscador').addEventListener('change', (event) => {
  const buscadorSeleccionado = event.target.value;
  localStorage.setItem('buscadorSeleccionado', buscadorSeleccionado);
  actualizarPlaceholder(buscadorSeleccionado, idiomaSelect.value);
});

// Obtener elementos del DOM
const fondoInput = document.getElementById('fondo-url'); // Input para URL de fondo
const guardarFondoBtn = document.getElementById('guardar-fondo-url'); // Botón para guardar el fondo
const popup = document.getElementById('popup'); // Popup para ajustes

// Guardar el fondo personalizado
guardarFondoBtn.addEventListener('click', (event) => {
  event.preventDefault(); // Prevenir el comportamiento predeterminado del botón (si es un submit)
  
  const url = fondoInput.value; // Obtener la URL del input
  if (url) {
    document.body.style.backgroundImage = `url(${url})`; // Cambiar el fondo
    document.body.style.backgroundSize = "cover"; // Ajustar el fondo
    document.body.style.backgroundPosition = "center"; // Centrar el fondo
    localStorage.setItem('fondo-url', url); // Guardar la URL en localStorage
    popup.style.display = 'none'; // Cerrar popup después de guardar
  } else {
    alert("Por favor, introduce una URL válida."); // Alerta si no hay URL
  }
});

// Al cargar la página, verifica si hay un fondo guardado
window.onload = function() {
  const savedBackground = localStorage.getItem('fondo-url');
  if (savedBackground) {
    document.body.style.backgroundImage = `url(${savedBackground}`; // Establecer el fondo guardado
    document.body.style.backgroundSize = "cover"; // Ajustar el fondo
    document.body.style.backgroundPosition = "center"; // Centrar el fondo
  }
};
});
// cambiar ajustes de Decoracion de animacion de RELOJ, si o no
decoracionRelojCheckbox.addEventListener('change', function() {
  localStorage.setItem('decoracionReloj', this.checked);
  if (this.checked) {
    relojContainer.classList.remove('reloj-sin-animacion');
    relojContainer.style.animation = 'textGlow 2s ease-in-out infinite alternate';
  } else {
    relojContainer.classList.add('reloj-sin-animacion');
    relojContainer.style.animation = 'none';
  }
});


