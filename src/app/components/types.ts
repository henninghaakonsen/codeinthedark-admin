export enum tournamentStates {
    CANCELLED = 'CANCELLED',
    FINISHED = 'FINISHED',
    IN_PROGRESS = 'IN_PROGRESS',
    NOT_STARTED = 'NOT_STARTED',
}

export interface IGamestate {
    created: string;
    gameId: string;
    gamepin: string;
    status: tournamentStates;
    endTime: string;
    startTime: string;
    participants: IParticipant[];
}

export interface IParticipant {
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
    [key: string]: IParticipant;
}
