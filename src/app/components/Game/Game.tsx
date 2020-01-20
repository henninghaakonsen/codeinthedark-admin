import axios from 'axios';
import * as moment from 'moment';
import 'moment-duration-format';
import * as React from 'react';
import Preview from '../Preview/Preview';
import { IGamestate, IParticipant, GameStates } from '../types';

interface IProps {
    gamestate: IGamestate;
}

const Game: React.StatelessComponent<IProps> = ({ gamestate }) => {
    console.log(gamestate);
    const stopTournament = () => {
        axios.put(`/game/${gamestate.gamepin}/update-state`, {
            gamestatus: 'FINISHED',
        });
    };

    return (
        <div className={'game'}>
            <div className={'game__settings'}>
                <div className={'game__settings--tittel'}>Code in the Dark</div>
                <div style={{ flex: 1 }} />
                {gamestate.status === GameStates.IN_PROGRESS && 0 !== 0 && (
                    <div className={'game__settings--countdown'}>
                        {moment.duration('', 'seconds').format('mm:ss')}
                    </div>
                )}

                {gamestate.status === GameStates.IN_PROGRESS && (
                    <div
                        className={'game__settings--button'}
                        onClick={() => {
                            stopTournament();
                        }}
                        children={'Finish'}
                    />
                )}
            </div>
            <div className={'previews'}>
                {Object.values(gamestate.participants).map((participantData: IParticipant) => {
                    const body = participantData.content.replace(/(\r\n|\n|\r)/gm, '');

                    return (
                        <Preview
                            key={participantData.uuid}
                            html={body}
                            participantData={participantData}
                            numberOfParticipants={Object.values(gamestate.participants).length}
                            tournamentState={gamestate.status}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Game;
