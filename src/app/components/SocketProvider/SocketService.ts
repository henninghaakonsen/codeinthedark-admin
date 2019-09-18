import { fromEvent, Observable } from "rxjs";
import * as io from "socket.io-client";
import { IKeyPair, IParticipantData } from "../types";

export class SocketService {
    /* tslint:disable */
    private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;
    /* tslint:enable */

    public init(): SocketService {
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

    public onReset(): Observable<IKeyPair> {
        return fromEvent(this.socket, "reset");
    }

    public onUpdatedWinners(): Observable<IKeyPair> {
        return fromEvent(this.socket, "participants-winners");
    }

    // disconnect - used when unmounting
    public disconnect(): void {
        this.socket.disconnect();
    }
}
