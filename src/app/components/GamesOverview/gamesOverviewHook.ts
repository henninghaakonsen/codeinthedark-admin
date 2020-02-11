import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { IGamestate } from '../types';

const useGamesHook = () => {
    const [ongoingOrCreatedGames, setOngoingOrCreatedGames] = React.useState<IGamestate[]>([]);

    React.useEffect(() => {
        axios.get('/ongoing-or-created-games').then((response: AxiosResponse<IGamestate[]>) => {
            setOngoingOrCreatedGames(response.data);
        });
    }, []);

    return ongoingOrCreatedGames;
};

export default useGamesHook;
