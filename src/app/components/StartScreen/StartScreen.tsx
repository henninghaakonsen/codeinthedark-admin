import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

interface IGame {
    displayName: string;
    id: string;
}

const StartScreen: React.FunctionComponent = () => {
    const history = useHistory();
    const [games, setGames] = React.useState<IGame[]>([]);
    const [chosenIndex, setChosenIndex] = React.useState(0);

    React.useEffect(() => {
        axios
            .get('/games')
            .then((response: AxiosResponse<{ gamesConfig: IGame[] }>) => {
                setGames(response.data.gamesConfig);
            })
            .catch((error: any) => {
                alert(error);
            });
    }, []);

    return (
        <div className={'startscreen'}>
            <h1 children={'Code in the Dark, by Bekk'} />

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
                                src={`/games/${games[chosenIndex].id}`}
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
                    <button
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
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;
