export enum tournamentStates {
    NOT_STARTED,
    IN_PROGRESS,
    FINISHED,
}

export interface IGamestate {
    created: string;
    gameId: string;
    gamepin: string;
    status: tournamentStates;
    endTime: string;
    startTime: string;
    participants: IParticipantData[];
}

export interface IParticipantData {
    animate: boolean;
    animationKey: number;
    content: string;
    exclamation: string;
    name: string;
    powerMode: boolean;
    streak: number;
    uuid: string;
}

export interface IKeyPair {
    [key: string]: IParticipantData;
}
