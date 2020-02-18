// tslint:disable-next-line: no-var-requires
const sanityClient = require('@sanity/client');

import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

const client = sanityClient({
    dataset: 'production',
    projectId: 'an0jzjry',
    useCdn: true,
});

interface IGame {
    name: string;
    id: string;
    level: string;
    result_html: string;
}

const StartScreen: React.FunctionComponent = () => {
    const history = useHistory();
    const [games, setGames] = React.useState<IGame[]>([]);
    const [chosenIndex, setChosenIndex] = React.useState(0);

    React.useEffect(() => {
        client
            .fetch('*[_type == "game"]')
            .then((fetchedContent: IGame[]) => {
                setGames(fetchedContent);
            })
            .catch((error: Error) => {
                alert(error.message);
            });
    }, []);

    return (
        <div className={'startscreen'}>
            <h1>Code in the Dark, by Bekk</h1>

            <div className={'startscreen__konfigurasjon'}>
                <div className={'startscreen__konfigurasjon--valg'}>
                    <h3>Velg spill og trykk 'Opprett spill'</h3>
                </div>

                <div className={'startscreen__konfigurasjon--carousel'}>
                    <button
                        onClick={() =>
                            setChosenIndex(chosenIndex === 0 ? games.length - 1 : chosenIndex - 1)
                        }
                    >
                        Forrige
                    </button>
                    {games.length > 0 && (
                        <div className={'startscreen__konfigurasjon--carousel-iframecontainer'}>
                            <iframe
                                key={games[chosenIndex].id}
                                srcDoc={games[chosenIndex].result_html}
                            />
                        </div>
                    )}
                    <button
                        onClick={() =>
                            setChosenIndex(chosenIndex === games.length - 1 ? 0 : chosenIndex + 1)
                        }
                    >
                        Neste
                    </button>
                </div>

                <div className={'startscreen__konfigurasjon--start'}>
                    <Button
                        primary={true}
                        onClick={() =>
                            axios
                                .post('/games/create-game', {
                                    gameId: games[chosenIndex].id,
                                })
                                .then((response: AxiosResponse<any>) => {
                                    history.push(`/game/${response.data.gamepin}`);
                                })
                        }
                    >
                        Opprett spill
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;
