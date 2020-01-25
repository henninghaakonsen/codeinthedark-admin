import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Game from './components/Game/Game';
import useGamestate from './components/Services/useGamestate';
import SocketProvider from './components/SocketProvider/SocketProvider';
import StartScreen from './components/StartScreen/StartScreen';
import { GameStatus } from './components/types';
import WaitingScreen from './components/WaitingScreen/WaitingScreen';
import Winners from './components/Winners/Winners';
import './index.less';

const rootElement = document.getElementById('startscreen');
const renderApp = (Component: React.ComponentType<{}>): void => {
    render(
        <SocketProvider>
            <audio
                about={'Credit Bensound.com'}
                src={'/assets/soundtrack.mp3'}
                loop={true}
                autoPlay={true}
            />
            <Router>
                <Switch>
                    <Route exact={true} path={'/'} component={Component} />
                    <Route
                        exact={true}
                        path={'/game/:gamepin'}
                        render={({ match }) => <GameStatuser />}
                    />
                    <Route exact={true} path={'/winners'} component={Winners} />
                </Switch>
            </Router>
        </SocketProvider>,
        rootElement
    );
};

const GameStatuser: React.StatelessComponent = () => {
    const gamestate = useGamestate();

    if (gamestate) {
        switch (gamestate.status) {
            case GameStatus.CREATED:
                return <WaitingScreen gamestate={gamestate} />;
            case GameStatus.IN_PROGRESS:
                return <Game gamestate={gamestate} />;
            case GameStatus.FINISHED:
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
