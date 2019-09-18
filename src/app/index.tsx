import { createBrowserHistory } from "history";
import * as React from "react";
import { render } from "react-dom";
import App from "./components/App";

import { Route, Router, Switch } from "react-router";
import SocketProvider from "./components/SocketProvider/SocketProvider";
import Winners from "./components/Winners/Winners";
import "./index.less";

const rootElement = document.getElementById("app");
const renderApp = (Component: React.ComponentType<{}>): void => {
    render(
        <SocketProvider>
            <Router history={createBrowserHistory()}>
                <Switch>
                    <Route exact={true} path={"/"} component={Component} />
                    <Route exact={true} path={"/winners"} component={Winners} />
                </Switch>
            </Router>
        </SocketProvider>,
        rootElement
    );
};

renderApp(App);

if (module.hot) {
    module.hot.accept("./components/App", () => {
        const NewApp = require("./components/App").default;
        renderApp(NewApp);
    });
}
