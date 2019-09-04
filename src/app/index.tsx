import * as React from "react";
import { render } from "react-dom";
import App from "./components/App";

import SocketProvider from "./components/SocketProvider/SocketProvider";
import "./index.less";

const rootElement = document.getElementById("app");
const renderApp = (Component: React.ComponentType<{}>): void => {
    render(
        <SocketProvider>
            <Component />
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
