import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import Game from './components/Game/Game';
import useGamestate from './components/Services/useGamestate';
import SocketProvider from './components/SocketProvider/SocketProvider';
import StartScreen from './components/StartScreen/StartScreen';
import { tournamentStates } from './components/types';
import WaitingScreen from './components/WaitingScreen/WaitingScreen';
import Winners from './components/Winners/Winners';
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
                        render={({ match }) => <GameStates gamepin={match.params.gamepin} />}
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

const GameStates: React.StatelessComponent<IProps> = ({ gamepin }) => {
    const gamestate = useGamestate(gamepin);

    if (gamestate) {
        switch (gamestate.status) {
            case tournamentStates.NOT_STARTED:
                return <WaitingScreen gamestate={gamestate} />;
            case tournamentStates.IN_PROGRESS:
                return <Game gamestate={gamestate} />;
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
