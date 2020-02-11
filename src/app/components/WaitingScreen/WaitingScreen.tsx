import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { useHistory } from 'react-router';
import { Button, Label } from 'semantic-ui-react';
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
                <Label.Group circular={true} size="huge">
                    {Object.values(gamestate.participants).map((participant: IParticipant) => {
                        return <Label key={participant.name}>{participant.name}</Label>;
                    })}
                </Label.Group>
            </div>

            <Button
                primary={true}
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
            </Button>
        </div>
    );
};

export default WaitingScreen;
