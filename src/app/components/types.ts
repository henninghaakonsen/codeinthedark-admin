export enum GameStatus {
    CREATED = 'CREATED',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
}

export const gamestatusTranslator = {
    CREATED: 'Opprettet',
    FINISHED: 'Ferdig',
    IN_PROGRESS: 'Pågår',
};

export interface IGamestate {
    created: string;
    gameId: string;
    gamepin: string;
    status: GameStatus;
    endTime: string;
    startTime: string;
    participants: {
        [uuid: string]: IParticipant;
    };
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
    winner: boolean;
}

export interface IKeyPair {
    [key: string]: IParticipant;
}
