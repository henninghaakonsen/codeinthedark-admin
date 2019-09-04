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
