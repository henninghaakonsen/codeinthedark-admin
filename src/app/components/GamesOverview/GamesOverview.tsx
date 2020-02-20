import * as moment from 'moment';
import * as React from 'react';
import { Card, DropdownProps, Label, Select } from 'semantic-ui-react';
import TimeLeft from '../Game/TimeLeft/TimeLeft';
import { GameStatus, gamestatusTranslator, IGamestate, IParticipant } from '../types';
import useGamesHook from './gamesOverviewHook';

moment.locale('nb');

const limitOptions = [
    { key: '10', value: '10', text: '10' },
    { key: '20', value: '20', text: '20' },
    { key: '30', value: '30', text: '30' },
    { key: '40', value: '40', text: '40' },
];

const GamesOverview: React.StatelessComponent = () => {
    const { games, limit, setLimit } = useGamesHook();

    return (
        <div className={'gamesoverview'}>
            <Select
                options={limitOptions}
                value={limit}
                onChange={(event: any, data: DropdownProps) => {
                    setLimit(data.value as string);
                }}
            />
            <Card.Group itemsPerRow={4}>
                {games.map((game: IGamestate) => {
                    return (
                        <Card key={game.gamepin} href={`/game/${game.gamepin}`}>
                            <Card.Content>
                                <Card.Header>{game.gameId}</Card.Header>
                                <Card.Meta>{moment(game.created).format('LLL')}</Card.Meta>
                                <Card.Meta>{gamestatusTranslator[game.status]}</Card.Meta>
                                {game.status === GameStatus.IN_PROGRESS && (
                                    <Card.Meta>
                                        <TimeLeft endTime={game.endTime} />
                                    </Card.Meta>
                                )}
                                <Card.Description>
                                    {Object.values(game.participants).map(
                                        (participant: IParticipant) => {
                                            return (
                                                <Card.Content key={participant.uuid} extra={true}>
                                                    <Label
                                                        color={
                                                            participant.winner ? 'green' : undefined
                                                        }
                                                        image={participant.winner}
                                                    >
                                                        {participant.winner && (
                                                            <img
                                                                src={
                                                                    'https://www.fillmurray.com/400/300'
                                                                }
                                                            />
                                                        )}
                                                        {participant.winner ? (
                                                            <b>{participant.name}</b>
                                                        ) : (
                                                            participant.name
                                                        )}
                                                    </Label>
                                                </Card.Content>
                                            );
                                        }
                                    )}
                                </Card.Description>
                            </Card.Content>
                        </Card>
                    );
                })}
            </Card.Group>
        </div>
    );
};

export default GamesOverview;
