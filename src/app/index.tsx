import * as React from 'react';
import { render } from 'react-dom';
import App from './components/App';

import "./index.less";

const rootElement = document.getElementById("app");
const renderApp = (Component: React.ComponentType<{}>): void => {
    render(<Component />, rootElement);
};

renderApp(App);

if (module.hot) {
    module.hot.accept("./components/App", () => {
        const NewApp = require("./components/App").default;
        renderApp(NewApp);
    });
}
