const express = require("express"),
    path = require("path"),
    router = express.Router(),
    tekster = require("./assets/tekster");

let cache = {};

const setupRouter = middleware => {
    router.get("/ressurser", (req, res) => {
        res.status(200).send(tekster.tekster);
    });

    router.post("/text", (req, res) => {
        const body = req.body;

        cache = {
            ...cache,
            [body.uuid]: body
        };
        res.status(200).send();
    });

    router.get("/text", (req, res) => {
        res.status(200).send(cache);
    });

    router.delete("/text", (req, res) => {
        cache = {};
        res.status(200).send(cache);
    });

    router.delete("/text/:uuid", (req, res) => {
        delete cache[req.params.uuid];

        console.log(cache);
        res.status(200).send(cache);
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
