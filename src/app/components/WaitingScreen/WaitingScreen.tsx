import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { useHistory } from 'react-router';
import { GameStatus, IGamestate, IParticipant } from '../types';

interface IProps {
    gamestate: IGamestate;
}

const WaitingScreen: React.FunctionComponent<IProps> = ({ gamestate }) => {
    const history = useHistory();

    return (
        <div className={'waitingscreen'}>
            <h1>{`Gamepin: ${gamestate.gamepin}`}</h1>
            <div className={'waitingscreen__participants'}>
                {Object.values(gamestate.participants).map((participant: IParticipant) => {
                    return (
                        <div key={participant.name} className={'waitingscreen__participants--chip'}>
                            {participant.name}
                        </div>
                    );
                })}
            </div>

            <div className={'waitingscreen__actions'}>
                <button
                    onClick={() => {
                        axios
                            .put(`/game/${gamestate.gamepin}/update-state`, {
                                gamestatus: GameStatus.IN_PROGRESS,
                            })
                            .then((response: AxiosResponse) => {
                                history.push(`/game/${gamestate.gamepin}`);
                            });
                    }}
                >
                    Start
                </button>
            </div>
        </div>
    );
};

export default WaitingScreen;
