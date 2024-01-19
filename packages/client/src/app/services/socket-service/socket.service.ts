import { Injectable } from '@angular/core';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ClientSocket } from '@app/classes/communication/socket-type';
import { AlertService } from '@app/services/alert-service/alert.service';
import { authenticationSettings } from '@app/utils/settings';
import { Observable, Subject } from 'rxjs';
import { SocketErrorResponse } from '@common/models/error';

@Injectable({
    providedIn: 'root',
})
export default class SocketService {
    socket: ClientSocket;
    socketError: Subject<SocketErrorResponse> = new Subject();
    onConnect: Subject<ClientSocket> = new Subject();
    onDisconnect: Subject<void> = new Subject();

    constructor(private alertService: AlertService) {}

    connectSocket(): Observable<boolean> {
        const isReady = new Subject<boolean>();

        this.disconnect();

        this.socket = this.getSocket();

        this.socket.on('connect', () => {
            isReady.next(true);
            this.onConnect.next(this.socket);
        });
        this.socket.on('error', (error: SocketErrorResponse) => {
            this.alertService.error(error.message, { log: `Error ${error.status} ${error.error}: ${error.message}` });
        });
        this.socket.on('connect_error', () => isReady.next(false));

        this.socket.on('error', (error: SocketErrorResponse) => {
            this.socketError.next(error);
            this.alertService.error(error.message, { log: `Error ${error.status}: ${error.message}` });
        });

        return isReady.asObservable();
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.onDisconnect.next();
        }
    }

    getId(): string {
        if (!this.socket) throw new Error(SOCKET_ID_UNDEFINED);

        return this.socket.id;
    }

    on<T>(ev: string, handler: (arg: T) => void): void {
        if (!this.socket) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socket.on(ev as any, handler);
    }

    private getSocket(): ClientSocket {
        // This line cannot be tested since it would connect to the real socket in the tests since it is impossible to mock io()
        return io(environment.serverUrlWebsocket, {
            transports: ['websocket'],
            upgrade: false,
            auth: {
                token: authenticationSettings.getToken(),
            },
        });
    }
}
