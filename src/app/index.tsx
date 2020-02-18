import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Game from './components/Game/Game';
import GamesOverview from './components/GamesOverview/GamesOverview';
import useGamestate from './components/Services/useGamestate';
import SocketProvider from './components/SocketProvider/SocketProvider';
import StartScreen from './components/StartScreen/StartScreen';
import { GameStatus } from './components/types';
import WaitingScreen from './components/WaitingScreen/WaitingScreen';
import Winners from './components/Winners/Winners';

import './index.less';

const rootElement = document.getElementById('startscreen');
const renderApp = (): void => {
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
                    <Route exact={true} path={'/'} component={GamesOverview} />
                    <Route exact={true} path={'/start'} component={StartScreen} />
                    <Route exact={true} path={'/game/:gamepin'} component={GameStatuser} />
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

renderApp();

if (module.hot) {
    module.hot.accept('./index', () => {
        renderApp();
    });
}
