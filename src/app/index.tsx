import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Game from './components/Game/Game';
import useGamestate from './components/Services/useGamestate';
import SocketProvider from './components/SocketProvider/SocketProvider';
import StartScreen from './components/StartScreen/StartScreen';
import WaitingScreen from './components/WaitingScreen/WaitingScreen';
import Winners from './components/Winners/Winners';
import { GameStates } from './components/types';
import './index.less';

const rootElement = document.getElementById('startscreen');
const renderApp = (Component: React.ComponentType<{}>): void => {
    render(
        <SocketProvider>
            <Router>
                <Switch>
                    <Route exact={true} path={'/'} component={Component} />
                    <Route
                        exact={true}
                        path={'/game/:gamepin'}
                        render={({ match }) => <GameStatuser gamepin={match.params.gamepin} />}
                    />
                    <Route exact={true} path={'/winners'} component={Winners} />
                </Switch>
            </Router>
        </SocketProvider>,
        rootElement
    );
};

interface IProps {
    gamepin: string;
}

const GameStatuser: React.StatelessComponent<IProps> = ({ gamepin }) => {
    const gamestate = useGamestate(gamepin);

    if (gamestate) {
        switch (gamestate.status) {
            case GameStates.CREATED:
                return <WaitingScreen gamestate={gamestate} />;
            case GameStates.IN_PROGRESS:
                return <Game gamestate={gamestate} />;
            case GameStates.FINISHED:
                return <div style={{ color: 'white' }}>FINISHED!</div>;
            default:
                return <div />;
        }
    } else {
        return <div />;
    }
};

renderApp(StartScreen);

if (module.hot) {
    module.hot.accept('./components/StartScreen/StartScreen', () => {
        const NewApp = require('./components/StartScreen/StartScreen').default;
        renderApp(NewApp);
    });
}
