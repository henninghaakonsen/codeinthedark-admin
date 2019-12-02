import * as React from 'react';
import { useSocket } from '../SocketProvider/SocketContext';
import { IKeyPair } from '../types';

const useWinnersDataService = (): [IKeyPair, (keypair: IKeyPair) => void] => {
    const socket = useSocket();
    const [winners, setWinners] = React.useState<IKeyPair>({});

    React.useEffect(() => {
        socket.init('');
        const onUpdatedWinners = socket.onUpdatedWinners();

        onUpdatedWinners.subscribe((updatedWinners: IKeyPair) => {
            setWinners(updatedWinners);
        });

        return () => socket.disconnect();
    }, [socket]);

    return [winners, setWinners];
};

export default useWinnersDataService;
