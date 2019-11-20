const express = require("express"),
  path = require("path"),
  fs = require("fs"),
  router = express.Router();
const DatabaseService = require("./services/databaseService");
const database = new DatabaseService();

const setupRouter = (middleware, io) => {
  router.post("/participant-data", (req, res) => {
    const body = req.body;

    database.updateGamestate({
      [body.uuid]: body
    });
    res.status(200).send();

    io.emit("participant-data", body);
  });

  router.get("/participant-data", (req, res) => {
    res.status(200).send(database);
  });

  router.delete("/participant-data", (req, res) => {
    database.updateCache({});

    res.status(200).send();
    io.emit("reset", database.getCache());
  });

  router.delete("/participant-data/:uuid", (req, res) => {
    database.deleteElement(req.params.uuid);

    res.status(200).send();
    io.emit("participants-data", database.getCache());
  });

  router.post("/new-winner", async (req, res) => {
    const body = req.body;

    database.updateWinners({
      ...database.getWinners(),
      [body.uuid]: body
    });

    const winners = await database.getWinners();

    res.status(200).send();
    io.emit("participants-winners", winners);
  });

  router.delete("/winners/:uuid", (req, res) => {
    database.deleteWinner(req.params.uuid);

    res.status(200).send();
    io.emit("participants-winners", database.getWinners());
  });

  router.get("/:arrangement/:pulje", (req, res) => {
    res
      .status(200)
      .send(
        fs.readFileSync(
          path.join(
            __dirname,
            `./assets/${req.params.arrangement}/${req.params.pulje}.html`
          ),
          "UTF-8"
        )
      );
  });

  router.get("/ressurshjelp/:arrangement/:pulje", (req, res) => {
    res
      .status(200)
      .send(
        fs.readFileSync(
          path.join(
            __dirname,
            `./assets/${req.params.arrangement}/${req.params.pulje}.json`
          ),
          "UTF-8"
        )
      );
  });

  if (process.env.NODE_ENV === "development") {
    router.get("*", (req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(
        middleware.fileSystem.readFileSync(
          path.join(__dirname, `../development/index.html`)
        )
      );
      res.end();
    });
  } else {
    router.get("*", (req, res) => {
      res.sendFile("index.html", {
        root: path.join(__dirname, "../production")
      });
    });
  }

  return router;
};

exports.setupRouter = setupRouter;
exports.cache = database;
