import * as React from 'react';
import { Breadcrumb, Card, Input, InputOnChangeData, SemanticWIDTHS } from 'semantic-ui-react';
import Preview from '../Preview/Preview';
import { GameStatus, IGamestate, IParticipant } from '../types';
import TimeLeft from './TimeLeft/TimeLeft';

interface IProps {
    gamestate: IGamestate;
}

const Game: React.StatelessComponent<IProps> = ({ gamestate }) => {
    const [itemsPerRow, setItemsPerRow] = React.useState('3');

    return (
        <div className={'game'}>
            <div className={'game__settings'}>
                <Breadcrumb size={'huge'}>
                    <Breadcrumb.Section href={'/'}>Code in the Dark</Breadcrumb.Section>
                    <Breadcrumb.Divider style={{ color: 'white' }} icon="right chevron" />
                    <Breadcrumb.Section style={{ color: 'white' }} active={true}>
                        {gamestate.gamepin}
                    </Breadcrumb.Section>
                </Breadcrumb>

                <div style={{ flex: 1 }} />

                <Input
                    style={{ width: '8rem', paddingRight: '1rem', height: '2rem' }}
                    value={itemsPerRow}
                    onChange={(event: any, data: InputOnChangeData) => setItemsPerRow(data.value)}
                />
                {gamestate.status === GameStatus.IN_PROGRESS && (
                    <TimeLeft className={'game__countdown'} endTime={gamestate.endTime} />
                )}
                {gamestate.status === GameStatus.FINISHED && 'FINISHED'}
            </div>
            <div className={'previews'}>
                <Card.Group
                    itemsPerRow={itemsPerRow === '' ? '3' : (itemsPerRow as SemanticWIDTHS)}
                >
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
