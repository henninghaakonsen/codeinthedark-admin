import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { IGamestate } from '../types';

const useGamesHook = () => {
    const [games, setGames] = React.useState<IGamestate[]>([]);
    const [limit, setLimit] = React.useState('30');

    React.useEffect(() => {
        axios.get(`/games?limit=${limit}`).then((response: AxiosResponse<IGamestate[]>) => {
            setGames(response.data);
        });
    }, [limit]);

    return { games, limit, setLimit };
};

export default useGamesHook;
