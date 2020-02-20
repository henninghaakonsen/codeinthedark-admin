import 'moment-duration-format';
import * as React from 'react';
import { Breadcrumb, Grid, Card } from 'semantic-ui-react';
import Preview from '../Preview/Preview';
import { GameStatus, IGamestate, IParticipant } from '../types';
import TimeLeft from './TimeLeft/TimeLeft';

interface IProps {
    gamestate: IGamestate;
}

const Game: React.StatelessComponent<IProps> = ({ gamestate }) => {
    console.log(Object.values(gamestate.participants).length / 2);
    const antallRader = Object.values(gamestate.participants).length / 2;
    return (
        <div className={'game'}>
            <div className={'game__settings'}>
                <Breadcrumb inverted={true} size={'huge'}>
                    <Breadcrumb.Section link={true} href={'/'}>
                        Code in the Dark
                    </Breadcrumb.Section>
                    <Breadcrumb.Divider style={{ color: 'white' }} icon="right chevron" />
                    <Breadcrumb.Section style={{ color: 'white' }} active={true}>
                        {gamestate.gamepin}
                    </Breadcrumb.Section>
                </Breadcrumb>
                <div style={{ flex: 1 }} />
                {gamestate.status === GameStatus.IN_PROGRESS && (
                    <TimeLeft className={'game__countdown'} endTime={gamestate.endTime} />
                )}
                {gamestate.status === GameStatus.FINISHED && 'FINISHED'}
            </div>
            <div className={'previews'}>
                <Card.Group itemsPerRow={3}>
                    {Object.values(gamestate.participants).map((participantData: IParticipant) => {
                        const body = participantData.content.replace(/(\r\n|\n|\r)/gm, '');

                        return (
                            <Preview
                                key={participantData.uuid}
                                html={body}
                                gamepin={gamestate.gamepin}
                                participantData={participantData}
                                tournamentState={gamestate.status}
                            />
                        );
                    })}
                </Card.Group>
            </div>
        </div>
    );
};

export default Game;
