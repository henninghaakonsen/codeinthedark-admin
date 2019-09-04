import { fromEvent, Observable } from "rxjs";
import * as io from "socket.io-client";
import { IKeyPair, IParticipantData } from "../types";

export class SocketService {
    private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

    public init(): SocketService {
        console.log("initiating socket service");
        this.socket = io("/");
        return this;
    }

    // link message event to rxjs data source
    public onParticipantData(): Observable<IParticipantData> {
        return fromEvent(this.socket, "participant-data");
    }

    public onParticipantsData(): Observable<IKeyPair> {
        return fromEvent(this.socket, "participants-data");
    }

    // disconnect - used when unmounting
    public disconnect(): void {
        this.socket.disconnect();
    }
}
