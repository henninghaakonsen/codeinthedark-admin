import * as React from 'react';
import { useSocket } from '../SocketProvider/SocketContext';
import { IGamestate } from '../types';

const useGamestate = (gamepin: string): IGamestate | undefined => {
    const socket = useSocket();
    const [gamestate, setGamestate] = React.useState<IGamestate | undefined>(undefined);

    React.useEffect(() => {
        socket.init(gamepin);
        const receiveGameState = socket.onGameStateData(gamepin);

        receiveGameState.subscribe((newGamestate: IGamestate) => {
            setGamestate(newGamestate);
        });

        return () => socket.disconnect();
    }, [socket]);

    return gamestate;
};

export default useGamestate;
