$(document).ready(function () {
  getAnimeList();

  $("#addAnimeBtn").click(function () {
    $("#addAnimeForm").attr("data-id", 0);
    $("#titleModal").text("Agregar anime");
    $("#saveBtn").text("Guardar");
    $("#addAnimeForm").modal("show");
  });

  $("#filterById").keyup(function () {
    if ($("#filterById").val() !== "") {
      $("#filterByName").prop("disabled", true);
    } else {
      $("#filterByName").prop("disabled", false);
    }
  });

  $("#filterByName").change(function () {
    if ($("#filterByName").val() !== "") {
      $("#filterById").prop("disabled", true);
    } else {
      $("#filterById").prop("disabled", false);
    }
  });

  $("#searchAnimeBtn").click(function () {
    let byId = $("#filterById").val();
    let byName = $("#filterByName").val();

    if ($("#filterById").prop("disabled")) {
      searchAnimeByName(byName);
    } else if ($("#filterByName").prop("disabled")) {
      searchAnimeById(byId);
    } else {
      getAnimeList();
    }
  });

  $("#closeBtn").click(function () {
    $("#addAnimeForm").attr("data-id", 0);
    clearForm();
  });

  $("#cancelBtn").click(function () {
    $("#addAnimeForm").attr("data-id", 0);
    clearForm();
  });

  $("#closeAlertBtn").click(function () {
    $("#textAlert").text("");
    $("#myAlert").addClass("d-none");
  });

  $("#loadList").on("click", "#editBtn", async function () {
    try {
      const id = $(this).data("id");
      await searchAnimeById(id, true);
    } catch (error) {
      console.error(error);
    }
  });

  $("#loadList").on("click", "#deleteBtn", function () {
    const id = $(this).data("id");

    $("#deleteConfirmationModal").modal("show").data("id", id);

    $("#confirmDeleteBtn").click(function () {
      const id = $("#deleteConfirmationModal").data("id");

      deleteAnimeById(id);
    });
  });

  $("#saveBtn").click(function () {
    const id = $("#addAnimeForm").data("id");

    let name = $("#nameAnime").val();
    let genre = $("#genreAnime").val();
    let year = $("#yearAnime").val();
    let author = $("#authorAnime").val();

    // Validar campos vacíos
    let isEmpty = false;
    let isOutRange = false;

    if (name === "") {
      $("#nameHelp").text("Debe ingresar el nombre del anime.");
      isEmpty = true;
    } else {
      $("#nameHelp").text("");
    }

    if (genre === "") {
      $("#genreHelp").text("Debe ingresar el género del anime.");
      isEmpty = true;
    } else {
      $("#genreHelp").text("");
    }

    let currentYear = new Date().getFullYear();

    if (year === "") {
      $("#yearHelp").text("Debe ingresar el año del anime.");
      isEmpty = true;
    } else if (year < 1900 || year > currentYear) {
      $("#yearHelp").text(
        "El año debe ser mayor a 1900 y menor o igual al año actual."
      );
      isOutRange = true;
    } else {
      $("#yearHelp").text("");
    }

    if (author === "") {
      $("#authorHelp").text("Debe ingresar el nombre del autor del anime.");
      isEmpty = true;
    } else {
      $("#authorHelp").text("");
    }

    if (isEmpty || isOutRange) {
      return;
    } else {
      let anime = {
        nombre: name,
        genero: genre,
        año: year,
        autor: author,
      };

      if (id === 0) {
        addAnimeOnList(anime);
      } else {
        editAnimeById(id, anime);
      }
    }
  });
});

async function getAnimeList() {
  try {
    const response = await fetch("/animes");
    if (response.ok) {
      const data = await response.json();
      await showListAnime(data);
    } else {
      throw new Error("Error al obtener la lista de animes");
    }
  } catch (error) {
    console.error(error);
  }
}

async function showListAnime(listAnime, id) {
  if (id === undefined || id === "") {
    $("#loadList").html("");
    Object.entries(listAnime).forEach(function ([id, anime]) {
      $("#loadList").append(
        `<tr>
            <th scope="row">${id}</th>
            <td>${anime.nombre}</td>
            <td>${anime.genero}</td>
            <td>${anime.año}</td>
            <td>${anime.autor}</td>
            <td>
              <button type="button" id="editBtn" class="btn btn-primary rounded-circle" data-id="${id}"
                data-bs-toggle="modal" data-bs-target="#addAnimeForm">
                <i class="fas fa-edit"></i>
              </button>
              <button type="button" id="deleteBtn" class="btn btn-danger rounded-circle" data-id="${id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>`
      );
    });
  } else {
    $("#loadList").html("");
    const anime = listAnime;
    $("#loadList").append(
      `<tr>
        <th scope="row">${id}</th>
        <td>${anime.nombre}</td>
        <td>${anime.genero}</td>
        <td>${anime.año}</td>
        <td>${anime.autor}</td>
        <td>
          <button type="button" id="editBtn" class="btn btn-primary rounded-circle" data-id="${id}"
            data-bs-toggle="modal" data-bs-target="#addAnimeForm">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" id="deleteBtn" class="btn btn-danger rounded-circle" data-id="${id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`
    );
  }
}

async function addAnimeOnList(anime) {
  try {
    const response = await fetch("/animes", {
      method: "POST",
      body: JSON.stringify(anime),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      clearForm();
      $("#addAnimeForm").modal("hide");

      showAlert("Anime agregado exitosamente");
      await getAnimeList();
    } else {
      throw new Error("Error al agregar el anime");
    }
  } catch (error) {
    console.error(error);
  }
}

function clearForm() {
  $("#nameAnime").val("");
  $("#genreAnime").val("");
  $("#yearAnime").val("");
  $("#authorAnime").val("");
  $("#nameHelp").text("");
  $("#genreHelp").text("");
  $("#yearHelp").text("");
  $("#authorHelp").text("");
}

async function searchAnimeByName(name) {
  try {
    const response = await fetch(`/animes/buscar-nombre/${name}`);
    if (response.ok) {
      const animeWithId = await response.json();
      const anime = Object.values(animeWithId)[0];
      const id = Object.keys(animeWithId)[0];
      await showListAnime(anime, id);
    } else {
      showError();
      throw new Error("Error al obtener el anime");
    }
  } catch (error) {
    console.error(error);
  }
}

async function searchAnimeById(id, isEdit) {
  try {
    const response = await fetch(`/animes/buscar-id/${id}`);
    if (!response.ok) {
      throw new Error("Error al obtener el anime");
    }
    const anime = await response.json();
    if (isEdit) {
      await setFormAnime(anime, id);
    } else {
      await showListAnime(anime, id);
    }
  } catch (error) {
    showError();
    throw error;
  }
}

async function deleteAnimeById(id) {
  try {
    const response = await fetch(`/animes/${id}`, { method: "DELETE" });
    if (response.ok) {
      $("#deleteConfirmationModal").modal("hide");
      showAlert("Anime eliminado exitosamente");
      getAnimeList();
    } else {
      throw new Error("Error al eliminar el anime");
    }
  } catch (error) {
    console.error(error);
  }
}

async function editAnimeById(id, animeData) {
  try {
    const response = await fetch(`/animes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(animeData),
    });

    if (response.ok) {
      clearForm();
      $("#addAnimeForm").modal("hide");
      showAlert("Anime actualizado exitosamente");
      await getAnimeList();
    } else {
      throw new Error("Error al actualizar el anime");
    }
  } catch (error) {
    console.error(error);
  }
}

function showError() {
  $("#loadList").html("");
  $("#loadList").append(
    `<tr>
      <td class="text-center fw-bold" colspan="6">
        "No hay resultados"
      </td>
    </tr>`
  );
}

async function setFormAnime(anime, id) {
  $("#titleModal").text("Editar anime");
  $("#saveBtn").text("Editar");
  $("#addAnimeForm").attr("data-id", id);
  $("#nameAnime").val(anime.nombre);
  $("#genreAnime").val(anime.genero);
  $("#yearAnime").val(anime.año);
  $("#authorAnime").val(anime.autor);
  $("#addAnimeForm").modal("show");
}

async function showAlert(txtMsg) {
  $("#textAlert").text(txtMsg);
  $("#myAlert").removeClass("d-none");
}
