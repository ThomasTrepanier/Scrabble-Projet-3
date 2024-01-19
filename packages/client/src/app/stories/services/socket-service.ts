import { Injectable } from '@angular/core';
import { ClientSocket } from '@app/classes/communication/socket-type';
import { SocketErrorResponse } from '@common/models/error';
import { Subject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    socket: ClientSocket;
    socketError: Subject<SocketErrorResponse>;
    onConnect: Subject<ClientSocket>;
    onDisconnect: Subject<void>;

    connectSocket(): Observable<boolean> {
        return of(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect(): void {}

    getId(): string {
        return '1';
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    on(): void {}
}
