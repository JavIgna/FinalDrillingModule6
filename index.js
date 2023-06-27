const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Ruta para obtener todos los datos del archivo anime.json
app.get("/animes", (req, res) => {
  fs.readFile("./data/anime.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error en el servidor");
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Ruta para obtener los datos de un anime específico por su id
app.get("/animes/buscar-id/:id", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/anime.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error en el servidor");
    } else {
      const animes = JSON.parse(data);
      const anime = animes[id];
      if (anime) {
        res.json(anime);
      } else {
        res.status(404).send("Anime no encontrado");
      }
    }
  });
});

// Ruta para obtener los datos de un anime específico por su nombre
app.get("/animes/buscar-nombre/:nombre", (req, res) => {
  const nombre = req.params.nombre;

  fs.readFile("./data/anime.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error en el servidor");
    } else {
      const animes = JSON.parse(data);
      const anime = Object.values(animes).find(
        (a) => a.nombre.toLowerCase() === nombre.toLowerCase()
      );
      if (anime) {
        const id = Object.keys(animes).find(
          (key) => animes[key].nombre.toLowerCase() === nombre.toLowerCase()
        );
        const animeWithId = { [id]: anime };
        res.json(animeWithId);
      } else {
        res.status(404).send("Anime no encontrado");
      }
    }
  });
});

// Ruta para agregar un nuevo anime
app.post("/animes", (req, res) => {
  const anime = req.body;

  fs.readFile("./data/anime.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error en el servidor");
    } else {
      const animes = JSON.parse(data);
      let maxId = 0;
      for (const id in animes) {
        if (animes.hasOwnProperty(id)) {
          const currentId = parseInt(id);
          if (currentId > maxId) {
            maxId = currentId;
          }
        }
      }

      const newId = maxId + 1;
      animes[newId.toString()] = { ...anime };

      fs.writeFile(
        "./data/anime.json",
        JSON.stringify(animes, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error en el servidor");
          } else {
            res.send("Anime agregado correctamente");
          }
        }
      );
    }
  });
});

// Ruta para actualizar los datos de un anime por su id
app.put("/animes/:id", (req, res) => {
  const id = req.params.id;
  const animeData = req.body;

  fs.readFile("./data/anime.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error en el servidor");
    } else {
      const animes = JSON.parse(data);
      if (animes[id]) {
        animes[id] = { ...animes[id], ...animeData };

        fs.writeFile(
          "./data/anime.json",
          JSON.stringify(animes, null, 2),
          "utf8",
          (err) => {
            if (err) {
              console.error(err);
              res.status(500).send("Error en el servidor");
            } else {
              res.send("Anime actualizado correctamente");
            }
          }
        );
      } else {
        res.status(404).send("Anime no encontrado");
      }
    }
  });
});

// Ruta para eliminar un anime por su id
app.delete("/animes/:id", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/anime.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error en el servidor");
    } else {
      const animes = JSON.parse(data);
      if (animes[id]) {
        delete animes[id];

        fs.writeFile(
          "./data/anime.json",
          JSON.stringify(animes, null, 2),
          "utf8",
          (err) => {
            if (err) {
              console.error(err);
              res.status(500).send("Error en el servidor");
            } else {
              res.send("Anime eliminado correctamente");
            }
          }
        );
      } else {
        res.status(404).send("Anime no encontrado");
      }
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
