const express = require("express"),
    path = require("path"),
    fs = require("fs"),
    router = express.Router();

class Cache {
    constructor() {
        this.cache = {};
    }

    updateCache(dirtyCache) {
        this.cache = dirtyCache;
    }

    getCache() {
        return this.cache;
    }

    deleteElement(uuid) {
        delete this.cache[uuid];
    }
}

const cache = new Cache();

const setupRouter = (middleware, io) => {
    router.post("/text", (req, res) => {
        const body = req.body;

        cache.updateCache({
            ...cache.getCache(),
            [body.uuid]: body
        });
        res.status(200).send();

        io.emit("participant-data", body);
    });

    router.get("/text", (req, res) => {
        res.status(200).send(cache);
    });

    router.delete("/text", (req, res) => {
        cache.updateCache({});

        res.status(200).send();
        io.emit("participants-data", cache.getCache());
    });

    router.delete("/text/:uuid", (req, res) => {
        cache.deleteElement(req.params.uuid);

        res.status(200).send();
        io.emit("participants-data", cache.getCache());
    });

    router.get("/result", (req, res) => {
        res.status(200).send(
            fs.readFileSync(
                path.join(__dirname, "./assets/result.html"),
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
exports.cache = cache;
