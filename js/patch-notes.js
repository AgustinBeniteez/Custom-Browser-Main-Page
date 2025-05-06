fetch("patch-notes.json")
  .then((response) => response.json())
  .then((data) => {
    const main = document.getElementById("main");
    // Update document title with latest version
    data.forEach((nota, index) => {
      if (index === 0) {
        // Use first note's version as latest
        document.title = `Patch Notes | lasted ${nota.version}`;
      }
    });
    let notesHTML = "";

    data.forEach((nota) => {
      notesHTML += `<div id="parche-${nota.version}" class="nota">
            <img src="${nota.image}" alt="${
        nota.title + nota.version + " image"
      }">
            <h1>${nota.title}</h1>
            <p>
              <span class="version">${nota.version}</span> |
              <span class="author">${nota.author}</span> |
              <span class="date">${nota.date}</span>
            </p>
            <hr>
            <div class="contenido">${nota.contenido1}</div>
            <div class="contenido">${nota.contenido2}</div>
            ${Object.keys(nota)
              .filter(
                (key) =>
                  key.startsWith("contenido") &&
                  key !== "contenido1" &&
                  key !== "contenido2"
              )
              .map((key) => `<div class="contenido">${nota[key]}</div>`)
              .join("")}
             <hr>
        </div>
       `;
    });

    main.innerHTML = notesHTML;
  })
  .catch((error) => {
    console.error("Error al cargar las notas:", error);
    main.innerHTML =
      "<p>Error al cargar las notas. Por favor, intente más tarde.</p>";
  });
