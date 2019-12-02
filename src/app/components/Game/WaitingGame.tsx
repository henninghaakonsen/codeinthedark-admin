import * as React from 'react';
import { IGamestate } from '../types';

interface IProps {
    gamestate: IGamestate;
}

const WaitingGame: React.StatelessComponent<IProps> = ({ gamestate }) => {
    return <div />;
};

export default WaitingGame;
