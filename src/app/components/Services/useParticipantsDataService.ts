import * as React from "react";
import { tournamentStates } from "../App";
import { useSocket } from "../SocketProvider/SocketContext";
import { IKeyPair, IParticipantData } from "../types";

const useParticipantsDataService = (): [
    IKeyPair,
    (keypair: IKeyPair) => void,
    tournamentStates,
    (tournamentState: tournamentStates) => void
] => {
    const socket = useSocket();
    const [contents, setContents] = React.useState<IKeyPair>({});
    const refContents = React.useRef(contents);
    refContents.current = contents;

    const [tournamentState, setTournamentState] = React.useState(
        tournamentStates.NOT_STARTED
    );
    const refTournamentState = React.useRef(tournamentState);
    refTournamentState.current = tournamentState;

    React.useEffect(() => {
        socket.init();
        const receiveParticipantData = socket.onParticipantData();
        const receiveParticipantsData = socket.onParticipantsData();
        const reset = socket.onReset();

        receiveParticipantData.subscribe(
            (participantData: IParticipantData) => {
                if (
                    refContents.current &&
                    refTournamentState.current === tournamentStates.IN_PROGRESS
                ) {
                    setContents({
                        ...refContents.current,
                        [participantData.uuid]: participantData
                    });
                }
            }
        );

        receiveParticipantsData.subscribe((participantsData: IKeyPair) => {
            if (refTournamentState.current === tournamentStates.IN_PROGRESS) {
                setContents(participantsData);
            }
        });

        reset.subscribe((participantsData: IKeyPair) => {
            setContents(participantsData);
        });

        return () => socket.disconnect();
    }, [socket]);

    return [contents, setContents, tournamentState, setTournamentState];
};

export default useParticipantsDataService;
