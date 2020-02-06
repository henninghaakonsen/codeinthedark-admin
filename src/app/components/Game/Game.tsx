import 'moment-duration-format';
import * as React from 'react';
import Preview from '../Preview/Preview';
import { GameStatus, IGamestate, IParticipant } from '../types';
import TimeLeft from './TimeLeft/TimeLeft';

interface IProps {
    gamestate: IGamestate;
}

const Game: React.StatelessComponent<IProps> = ({ gamestate }) => {
    return (
        <div className={'game'}>
            <div className={'game__settings'}>
                <div className={'game__settings--tittel'}>Code in the Dark</div>
                <div style={{ flex: 1 }} />
                {gamestate.status === GameStatus.IN_PROGRESS && (
                    <TimeLeft endTime={gamestate.endTime} />
                )}
                {gamestate.status === GameStatus.FINISHED && 'FINISHED'}
            </div>
            <div className={'previews'}>
                {Object.values(gamestate.participants).map((participantData: IParticipant) => {
                    const body = participantData.content.replace(/(\r\n|\n|\r)/gm, '');

                    return (
                        <Preview
                            key={participantData.uuid}
                            html={body}
                            gamepin={gamestate.gamepin}
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
