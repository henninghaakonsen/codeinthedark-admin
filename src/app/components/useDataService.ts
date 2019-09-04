import * as React from "react";
import { useSocket } from "./SocketProvider/SocketContext";
import { IKeyPair, IParticipantData } from "./types";

const useDataService = (): [IKeyPair, (keypair: IKeyPair) => void] => {
    const socket = useSocket();
    const [contents, setContents] = React.useState<IKeyPair>({});
    const refContents = React.useRef(contents);
    refContents.current = contents;

    React.useEffect(() => {
        socket.init();
        const receiveParticipantData = socket.onParticipantData();
        const receiveParticipantsData = socket.onParticipantsData();

        receiveParticipantData.subscribe(
            (participantData: IParticipantData) => {
                if (refContents.current) {
                    setContents({
                        ...refContents.current,
                        [participantData.uuid]: participantData
                    });
                }
            }
        );

        receiveParticipantsData.subscribe((participantsData: IKeyPair) => {
            setContents(participantsData);
        });

        return () => socket.disconnect();
    }, [socket]);

    return [contents, setContents];
};

export default useDataService;
