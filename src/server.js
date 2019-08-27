const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const config = require("../webpack.dev"),
    webpack = require("webpack"),
    router = require("./router"),
    webpackDevMiddleware = require("webpack-dev-middleware"),
    webpackHotMiddleware = require("webpack-hot-middleware");

const port = process.env.PORT || 9000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, render"
    );
    next();
});

let middleware;
if (process.env.NODE_ENV === "development") {
    const compiler = webpack(config);
    middleware = webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath
    });

    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
} else {
    app.use(
        "/assets",
        express.static(path.join(__dirname, "..", "production"))
    );
}

app.use("/", router.setupRouter(middleware));

app.listen(port, () => {
    console.log(`Started server on ` + port);
});
