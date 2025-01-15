// Variables globales
const elementos = {
  reloj: document.getElementById('reloj'),
  decoracionRelojCheckbox: document.getElementById('decoracion-reloj'),
  relojContainer: document.querySelector('.reloj-container h1'),
  searchInput: document.getElementById('search-input'),
  suggestionsContainer: document.getElementById('suggestions'),
  idiomaSelect: document.getElementById('idioma'),
  ajustesBtn: document.getElementById('ajustes-btn'),
  popup: document.getElementById('popup'),
  cerrarPopup: document.getElementById('cerrar-popup'),
  fondoInput: document.getElementById('fondo-url'),
  guardarFondoBtn: document.getElementById('guardar-fondo-url'),
  favoritosContainer: document.getElementById('favoritos-list'),
  agregarFavoritoBtn: document.getElementById('agregar-favorito-btn'),
  cerrarPopupFavorito: document.getElementById('cerrar-popup-favorito'),
  favoritoForm: document.getElementById('favorito-form'),
  tituloFavoritos: document.getElementById('titulo-favoritos'),
  crearNotaBtn: document.getElementById('crear-nota-btn'),
  verNotasBtn: document.getElementById('ver-notas-btn'),
  guardarNotaBtn: document.getElementById('guardar-nota-btn'),
  eliminarNotaBtn: document.getElementById('eliminar-nota-btn'),
  cerrarMenuBtn: document.getElementById('cerrar-menu-btn'),
  tituloNota: document.getElementById('titulo-nota'),
  contenidoNota: document.getElementById('contenido-nota'),
  destacarNotaCheckbox: document.getElementById('destacar-nota'),
  notasDestacadas: document.getElementById('notas-destacadas'),
  notasPestanas: document.getElementById('lista-notas'),
  buscadorSelect: document.getElementById('buscador'),
  modoOscuroCheckbox: document.getElementById('modo-oscuro'),
  colorTemaInput: document.getElementById('color-tema'),
  menuNotas: document.getElementById('menu-notas'),
  fondoPredeterminado: document.querySelectorAll('.fondo-predeterminado img'),
  searchButton: document.getElementById('search-button')
};
// FUNCIONES DE UTILIDAD
const guardarEnLocalStorage = (clave, valor) => localStorage.setItem(clave, JSON.stringify(valor));
const obtenerDeLocalStorage = (clave) => JSON.parse(localStorage.getItem(clave)) || [];

// FUNCIONES PRINCIPALES
function actualizarReloj() {
  const ahora = new Date();
  elementos.reloj.textContent = ahora.toTimeString().slice(0, 5);
}

function configurarFondoGuardado() {
  const fondoAlmacenado = localStorage.getItem('fondo-url');
  if (fondoAlmacenado) {
    document.body.style.backgroundImage = `url(${fondoAlmacenado})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }
}

function cargarTraducciones() {
  fetch('lang.json')
    .then((response) => response.json())
    .then((data) => {
      const idioma = localStorage.getItem('idioma') || 'en';
      actualizarIdioma(idioma, data);
      elementos.idiomaSelect.value = idioma;
    })
    .catch((error) => console.error('Error al cargar las traducciones:', error));
}

function actualizarIdioma(idioma, traducciones) {
  document.title = traducciones[idioma]?.titulo || 'New Tab';
  elementos.searchInput.placeholder = traducciones[idioma]?.placeholderGoogle || 'Search...';
  elementos.tituloFavoritos.textContent = traducciones[idioma]?.favoritos || 'Favorites';
  
  // Traducir elementos del menú de notas
  const notatitle = document.querySelector('.notatitle');
  if (notatitle) {
    notatitle.innerHTML = `${traducciones[idioma]?.verNotas || 'Notes'} <i class="fa-regular fa-note-sticky"></i>`;
  }

  const noteDetails = document.querySelector('.note-details');
  if (noteDetails) {
    noteDetails.textContent = traducciones[idioma]?.note_details || 'Note Details';
  }

  const tituloNota = document.getElementById('titulo-nota');
  if (tituloNota) {
    tituloNota.placeholder = traducciones[idioma]?.tituloNota || 'Title of the Note';
  }

  const contenidoNota = document.getElementById('contenido-nota');
  if (contenidoNota) {
    contenidoNota.placeholder = traducciones[idioma]?.contenidoNota || 'Content of the Note';
  }

  const destacarNotaCheckboxLabel = document.querySelector('.destacar-notachekbox label');
  if (destacarNotaCheckboxLabel) {
    destacarNotaCheckboxLabel.innerHTML = `<input type="checkbox" id="destacar-nota"><i class="fa-solid fa-thumbtack"></i> &nbsp;${traducciones[idioma]?.destacarNota || 'Pin Note'}`;
  }

  const eliminarNotaBtn = document.getElementById('eliminar-nota-btn');
  if (eliminarNotaBtn) {
    eliminarNotaBtn.innerHTML = `${traducciones[idioma]?.eliminarNota || 'Delete Note'} <i class="fa-solid fa-trash"></i>`;
  }

  const exportarNotaBtn = document.getElementById('exportar-nota-btn');
  if (exportarNotaBtn) {
    exportarNotaBtn.innerHTML = `${traducciones[idioma]?.exportarNota || 'Export Note'} &nbsp;<i class="fa-solid fa-file-arrow-down fa-lg"></i>`;
  }

  const fechaNotaLabel = document.querySelector('label[for="fecha-nota"]');
  if (fechaNotaLabel) {
    fechaNotaLabel.innerHTML = traducciones[idioma]?.important_date || 'Important Date (Optional)';
  }

  const guardarNotaBtn = document.getElementById('guardar-nota-btn');
  if (guardarNotaBtn) {
    guardarNotaBtn.innerHTML = `${traducciones[idioma]?.guardarNota || 'Save Note'} <i class="fa-solid fa-floppy-disk"></i>`;
  }

  const cerrarMenuBtn = document.getElementById('cerrar-menu-btn');
  if (cerrarMenuBtn) {
    cerrarMenuBtn.innerHTML = traducciones[idioma]?.cerrarMenu || 'Close';
  }

  // Traducir elementos del popup agregar-favorito
  const agregarFavoritoTitulo = document.querySelector('#agregar-favorito h3');
  if (agregarFavoritoTitulo) {
    agregarFavoritoTitulo.innerHTML = traducciones[idioma]?.agregarFavorito || 'Add to Favorites';
  }

  const nombreFavorito = document.getElementById('nombre-favorito');
  if (nombreFavorito) {
    nombreFavorito.placeholder = traducciones[idioma]?.nombreFavorito || 'Site Name';
  }

  const urlFavorito = document.getElementById('url-favorito');
  if (urlFavorito) {
    urlFavorito.placeholder = traducciones[idioma]?.urlFavorito || 'Site URL';
  }

  const agregarBtn = document.getElementById('agregar-btn');
  if (agregarBtn) {
    agregarBtn.innerHTML = traducciones[idioma]?.agregarBtn || 'Add';
  }

  const cerrarPopupFavorito = document.getElementById('cerrar-popup-favorito');
  if (cerrarPopupFavorito) {
    cerrarPopupFavorito.innerHTML = traducciones[idioma]?.cerrarPopup || 'Close';
  }

  // Traducir elementos del popup de ajustes
  const ajustesTitulo = document.querySelector('#ajustes-titulo');
  if (ajustesTitulo) {
    ajustesTitulo.innerHTML = traducciones[idioma]?.ajustes || 'Settings';
  }

  const idiomaLabel = document.querySelector('label[for="idioma"]');
  if (idiomaLabel) {
    idiomaLabel.innerHTML = traducciones[idioma]?.idioma || 'Select Language:';
  }

  const buscadorLabel = document.querySelector('label[for="buscador"]');
  if (buscadorLabel) {
    buscadorLabel.innerHTML = traducciones[idioma]?.buscador || 'Select Search Engine:';
  }

  const fondoUrlLabel = document.querySelector('label[for="fondo-url"]');
  if (fondoUrlLabel) {
    fondoUrlLabel.innerHTML = traducciones[idioma]?.guardarFondo || 'Save Background';
  }

  const modoOscuroLabel = document.querySelector('label[for="modo-oscuro"]');
  if (modoOscuroLabel) {
    modoOscuroLabel.innerHTML = traducciones[idioma]?.modoOscuro || 'Dark Mode:';
  }

  const colorTemaLabel = document.querySelector('label[for="color-tema"]');
  if (colorTemaLabel) {
    colorTemaLabel.innerHTML = traducciones[idioma]?.colorTema || 'Theme Color:';
  }

  const decoracionRelojLabel = document.querySelector('label[for="decoracion-reloj"]');
  if (decoracionRelojLabel) {
    decoracionRelojLabel.innerHTML = traducciones[idioma]?.decoracionReloj || 'Clock Decoration:';
  }

  // Traducir botón ver-notas
  const verNotasBtn = document.getElementById('ver-notas-btn');
  if (verNotasBtn) {
    verNotasBtn.innerHTML = traducciones[idioma]?.verNotas || 'Notes';
  }
}


function configurarDecoracionReloj() {
  const decoracionActiva = localStorage.getItem('decoracionReloj') !== 'false';
  elementos.decoracionRelojCheckbox.checked = decoracionActiva;
  actualizarDecoracionReloj(decoracionActiva);
}

function actualizarDecoracionReloj(activada) {
  if (activada) {
    elementos.relojContainer.style.animation = 'textGlow 2s ease-in-out infinite alternate';
  } else {
    elementos.relojContainer.style.animation = 'none';
  }
}

function agregarEventoGuardarFondo() {
  elementos.guardarFondoBtn.addEventListener('click', () => {
    const url = elementos.fondoInput.value;
    if (url) {
      document.body.style.backgroundImage = `url(${url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      guardarEnLocalStorage('fondo-url', url);
    }
  });
}
function configurarFavoritos() {
  function mostrarFavoritos() {
    const favoritos = obtenerDeLocalStorage('favoritos');
    elementos.favoritosContainer.innerHTML = '';
    favoritos.forEach(({ nombre, url }, index) => {
      const item = document.createElement('div');
      item.classList.add('favorito-item');
      item.style.position = 'relative';
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.alignItems = 'center';
      item.style.borderRadius = '10px';
      item.style.padding = '10px';
      item.style.margin = '10px';
      item.style.backgroundColor = localStorage.getItem('modoOscuro') === 'true' ? 'var(--color-modelight)' : '#f0f0f0';
      item.style.color = localStorage.getItem('modoOscuro') === 'true' ? '#fff' : '#000';
      item.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      item.style.transition = 'all 0.3s ease-in-out';

      const eliminarBtn = document.createElement('button');
      eliminarBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      eliminarBtn.style.position = 'absolute';
      eliminarBtn.style.top = '5px';
      eliminarBtn.style.right = '0px';
      eliminarBtn.style.backgroundColor = 'transparent';
      eliminarBtn.style.color = 'red';
      eliminarBtn.style.border = 'none';
      eliminarBtn.style.fontWeight = 'bold';
      eliminarBtn.style.fontSize = '15px';
      eliminarBtn.style.borderRadius = '50%';
      eliminarBtn.style.width = '30px';
      eliminarBtn.style.height = '30px';
      eliminarBtn.style.opacity = '0';
      eliminarBtn.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out, color 0.3s ease-in-out';
      eliminarBtn.style.cursor = 'pointer'; // Added cursor: pointer on hover
      eliminarBtn.addEventListener('click', () => {
        favoritos.splice(index, 1);
        guardarEnLocalStorage('favoritos', favoritos);
        mostrarFavoritos();
      });

      eliminarBtn.addEventListener('mouseenter', () => {
        eliminarBtn.style.transform = 'scale(1.2)';
        eliminarBtn.style.color = '#b30000';
      });

      eliminarBtn.addEventListener('mouseleave', () => {
        eliminarBtn.style.transform = 'scale(1)';
        eliminarBtn.style.color = 'red';
      });

      item.addEventListener('mouseenter', () => {
        eliminarBtn.style.opacity = '1';
      });

      item.addEventListener('mouseleave', () => {
        eliminarBtn.style.opacity = '0';
      });

      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.target = '_blank';
      enlace.style.display = 'flex';
      enlace.style.flexDirection = 'column';
      enlace.style.alignItems = 'center';

      const icono = document.createElement('img');
      icono.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;
      icono.alt = nombre;
      icono.style.borderRadius = '10px';
      icono.style.width = '64px';
      icono.style.height = '64px';

      const nombreElem = document.createElement('div');
      nombreElem.textContent = nombre;
      nombreElem.style.textAlign = 'center';
      nombreElem.style.marginTop = '5px';

      enlace.appendChild(icono);
      item.appendChild(eliminarBtn);
      item.appendChild(enlace);
      item.appendChild(nombreElem);
      elementos.favoritosContainer.appendChild(item);
    });
  }

  elementos.favoritoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre-favorito').value;
    const url = document.getElementById('url-favorito').value;
    if (nombre && url) {
      const favoritos = obtenerDeLocalStorage('favoritos');
      favoritos.push({ nombre, url });
      guardarEnLocalStorage('favoritos', favoritos);
      mostrarFavoritos();
      elementos.favoritoForm.reset();
      document.getElementById('agregar-favorito').classList.add('oculto');
    }
  });

  mostrarFavoritos();
}

function configurarBuscador() {
  function realizarBusqueda() {
    const valor = elementos.searchInput.value.trim();
    if (!valor) return;

    const buscador = localStorage.getItem('buscadorSeleccionado') || 'google';
    let url;

    switch (buscador) {
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

    window.location.href = url;
  }

  elementos.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      realizarBusqueda();
    }
  });

  elementos.searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    realizarBusqueda();
  });
}

// Función para cargar las notas
function configurarNotas() {
  let notas = obtenerDeLocalStorage('notas');
  let notaEditando = null;

  function mostrarNotas() {
    elementos.notasPestanas.innerHTML = '';
    notas.forEach((nota, index) => {
      const notaElem = document.createElement('div');
      notaElem.classList.add('nota-pestana');
      if (nota.destacada) {
        notaElem.classList.add('destacada'); // Resaltar las notas destacadas
      }
      notaElem.textContent = nota.titulo;
      notaElem.addEventListener('click', () => editarNota(index));
      elementos.notasPestanas.appendChild(notaElem);
    });
  }

  function editarNota(index) {
    const nota = notas[index];
    elementos.tituloNota.value = nota.titulo;
    elementos.contenidoNota.value = nota.contenido;
    elementos.destacarNotaCheckbox.checked = nota.destacada;  // Sincronizar estado de "destacada"
    elementos.eliminarNotaBtn.classList.remove('oculto');
    notaEditando = index;
  }

  elementos.guardarNotaBtn.addEventListener('click', () => {
    const titulo = elementos.tituloNota.value.trim();
    const contenido = elementos.contenidoNota.value.trim();
    const destacada = elementos.destacarNotaCheckbox.checked;

    if (!titulo) {
      alert('La nota debe tener un título.');
      return;
    }

    const nuevaNota = { titulo, contenido, destacada };

    if (notaEditando !== null) {
      notas[notaEditando] = nuevaNota;
      notaEditando = null;
    } else {
      notas.push(nuevaNota);
    }

    guardarEnLocalStorage('notas', notas);
    mostrarNotas();
    elementos.tituloNota.value = '';
    elementos.contenidoNota.value = '';
    elementos.eliminarNotaBtn.classList.add('oculto');
  });

  elementos.eliminarNotaBtn.addEventListener('click', () => {
    const index = notas.findIndex(nota => nota.titulo === elementos.tituloNota.value);
    if (index !== -1) {
      notas.splice(index, 1);
      guardarEnLocalStorage('notas', notas);
      mostrarNotas();
      elementos.tituloNota.value = '';
      elementos.contenidoNota.value = '';
      elementos.eliminarNotaBtn.classList.add('oculto');
    }
  });

  elementos.verNotasBtn.addEventListener('click', () => {
    elementos.menuNotas.classList.toggle('visible');
  });

  elementos.cerrarMenuBtn.addEventListener('click', () => {
    elementos.menuNotas.classList.remove('visible');
  });

  elementos.crearNotaBtn.addEventListener('click', () => {
    elementos.tituloNota.value = '';
    elementos.contenidoNota.value = '';
    elementos.eliminarNotaBtn.classList.add('oculto');
    elementos.menuNotas.classList.add('visible');
  });

  mostrarNotas();
}

function aplicarModoOscuro() {
  const activar = localStorage.getItem('modoOscuro') === 'true';
  document.documentElement.style.setProperty('--color-modelight', activar ? 'var(--color-modedark)' : '#fefefecb');
  document.documentElement.style.setProperty('--color-modelight1', activar ? 'var(--color-modedark1)' : '#e2e2e2cc');
  document.documentElement.style.setProperty('--color-letrasdark', activar ? 'var(--color-letraswhite)' : '#161616');
  elementos.modoOscuroCheckbox.checked = activar;
  configurarFavoritos(); // Para actualizar los colores de los favoritos
}

function configurarPopups() {
  elementos.ajustesBtn.addEventListener('click', () => {
    elementos.popup.style.display = 'block';
  });

  elementos.cerrarPopup.addEventListener('click', () => {
    elementos.popup.style.display = 'none';
  });

  elementos.agregarFavoritoBtn.addEventListener('click', () => {
    const favoritoPopup = document.getElementById('agregar-favorito');
    favoritoPopup.classList.remove('oculto');
  });

  elementos.cerrarPopupFavorito.addEventListener('click', () => {
    const favoritoPopup = document.getElementById('agregar-favorito');
    favoritoPopup.classList.add('oculto');
  });

  elementos.idiomaSelect.addEventListener('change', (e) => {
    const idiomaSeleccionado = e.target.value;
    localStorage.setItem('idioma', idiomaSeleccionado);
    fetch('lang.json')
      .then((response) => response.json())
      .then((data) => actualizarIdioma(idiomaSeleccionado, data));
  });

  elementos.buscadorSelect.addEventListener('change', (e) => {
    localStorage.setItem('buscadorSeleccionado', e.target.value);
  });

  elementos.modoOscuroCheckbox.addEventListener('change', (e) => {
    const activar = e.target.checked;
    document.documentElement.style.setProperty('--color-modelight', activar ? 'var(--color-modedark)' : '#fefefecb');
    document.documentElement.style.setProperty('--color-modelight1', activar ? 'var(--color-modedark1)' : '#e2e2e2cc');
    document.documentElement.style.setProperty('--color-letrasdark', activar ? 'var(--color-letraswhite)' : '#161616');
    localStorage.setItem('modoOscuro', activar);
    configurarFavoritos(); // Para actualizar los colores de los favoritos
  });

  elementos.colorTemaInput.addEventListener('input', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--color-botones', color);
    guardarEnLocalStorage('colorBotones', color);
  });

  elementos.decoracionRelojCheckbox.addEventListener('change', (e) => {
    const activada = e.target.checked;
    localStorage.setItem('decoracionReloj', activada);
    actualizarDecoracionReloj(activada);
  });

  elementos.fondoPredeterminado.forEach(img => {
    img.addEventListener('click', () => {
      const url = img.src;
      document.body.style.backgroundImage = `url(${url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      guardarEnLocalStorage('fondo-url', url);
    });
  });
}

// INICIALIZACIÓN
function inicializar() {
  setInterval(actualizarReloj, 1000);
  actualizarReloj();
  configurarFondoGuardado();
  cargarTraducciones();
  configurarDecoracionReloj();
  agregarEventoGuardarFondo();
  configurarFavoritos();
  configurarBuscador();
  configurarNotas();
  configurarPopups();
  aplicarModoOscuro(); // Aplicar modo oscuro al cargar la página
}

// EJECUCIÓN
inicializar();