import * as moment from 'moment';
import * as React from 'react';
import { Card, Grid } from 'semantic-ui-react';
import { gamestatusTranslator, IGamestate, IParticipant } from '../types';
import useGamesHook from './gamesOverviewHook';

moment.locale('nb');

const GamesOverview: React.StatelessComponent = () => {
    const ongoingAndCreatedGames = useGamesHook();

    return (
        <div className={'gamesoverview'}>
            <Card.Group itemsPerRow={4}>
                {ongoingAndCreatedGames
                    .sort((a, b) => moment(b.created).diff(moment(a.created)))
                    .map((game: IGamestate) => {
                        return (
                            <Card key={game.gamepin} href={`/game/${game.gamepin}`}>
                                <Card.Content>
                                    <Card.Header>{game.gameId}</Card.Header>
                                    <Card.Meta>{moment(game.created).format('LLL')}</Card.Meta>
                                    <Card.Meta>{gamestatusTranslator[game.status]}</Card.Meta>
                                    <Card.Description>
                                        {Object.values(game.participants).map(
                                            (participant: IParticipant) => {
                                                return (
                                                    <Card.Content
                                                        key={participant.uuid}
                                                        extra={true}
                                                    >
                                                        {participant.name}
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
