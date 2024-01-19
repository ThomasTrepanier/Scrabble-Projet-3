/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable no-console */
import { ServerSocket } from '@app/classes/communication/socket-type';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { GAME_ROOM_ID_PREFIX } from '@app/constants/classes-constants';
import { SOCKET_CONFIGURE_EVENT_NAME } from '@app/constants/services-constants/socket-consts';
import { INVALID_ID_FOR_SOCKET, NO_TOKEN, SOCKET_SERVICE_NOT_INITIALIZED } from '@app/constants/services-errors';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServerActionService } from '@app/services/server-action-service/server-action.service';
import { env } from '@app/utils/environment/environment';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { ClientEvents, ServerEvents } from '@common/events/events';
import { SocketErrorResponse } from '@common/models/error';
import { ServerActionType } from '@common/models/server-action';
import { EventEmitter } from 'events';
import { NextFunction } from 'express';
import * as http from 'http';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import * as io from 'socket.io';
import { Service } from 'typedi';
import {
    AcceptJoinRequestEmitArgs,
    CancelledGroupEmitArgs,
    CleanupEmitArgs,
    GameUpdateEmitArgs,
    GroupsUpdateEmitArgs,
    HighScoresEmitArgs,
    JoinRequestCancelledEmitArgs,
    JoinRequestEmitArgs,
    NewMessageEmitArgs,
    RejectJoinRequestEmitArgs,
    SocketEmitEvents,
    StartGameEmitArgs,
    TilePlacementEmitArgs,
    UserLeftGroupEmitArgs,
} from './socket-types';

export interface SocketWithInfo {
    socket: io.Socket;
    gameRoom?: string;
}

@Service()
export class SocketService {
    playerDisconnectedEvent: EventEmitter;
    private sio?: io.Server;
    private sockets: Map<string, SocketWithInfo>;
    private configureSocketsEvent: EventEmitter;

    constructor(
        private readonly authentificationService: AuthentificationService,
        private readonly serverActionService: ServerActionService,
        private readonly notificationService: NotificationService,
    ) {
        this.sockets = new Map();
        this.configureSocketsEvent = new EventEmitter();
        this.playerDisconnectedEvent = new EventEmitter();
    }

    static handleError(error: Error, socket: ServerSocket): void {
        const status = error instanceof HttpException ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;

        const response: SocketErrorResponse = {
            message: error.message,
            error: getReasonPhrase(status),
            status,
        };

        if (env.isDev) {
            response.stack = error.stack?.split('\n');
        }

        if (!env.isProd) {
            // eslint-disable-next-line no-console
            console.error(error);
        }

        socket.emit('error', response);
    }

    initialize(server: http.Server): void {
        this.sio = new io.Server<ClientEvents, ServerEvents>(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        if (this.sio === undefined) {
            console.error(SOCKET_SERVICE_NOT_INITIALIZED);
            return;
        }

        this.sio.use(async (socket: io.Socket, next: NextFunction) => {
            const token = socket.handshake.auth.token ?? socket.handshake.headers.authorization;

            if (token) {
                try {
                    await this.authentificationService.authentificateSocket(socket, token);
                    return next();
                } catch (err) {
                    return next(new Error(err));
                }
            } else {
                SocketService.handleError(new HttpException(NO_TOKEN), socket);
            }
        });

        this.sio.on('error', (error) => {
            // eslint-disable-next-line no-console
            console.error('\x1b[1m\x1b[3m<< !SIO error! >>\x1b[0m', error);
        });

        this.sio.on('connection', (socket) => {
            socket.on('error', (error) => {
                // eslint-disable-next-line no-console
                console.error('\x1b[1m\x1b[3m<< !Socket error! >>\x1b[0m', error);
            });

            this.sockets.set(socket.id, { socket });
            socket.emit('initialization', { id: socket.id });

            const idUser = this.authentificationService.connectedUsers.getUserId(socket.id);
            this.serverActionService.addAction({
                idUser,
                actionType: ServerActionType.LOGIN,
            });
            this.notificationService.removeScheduledNotification(idUser);

            this.configureSocketsEvent.emit(SOCKET_CONFIGURE_EVENT_NAME, socket);

            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    addToRoom(socketId: string, room: string): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        const socket = this.getSocket(socketId);
        if (room.includes(GAME_ROOM_ID_PREFIX)) {
            socket.gameRoom = room;
        }
        socket.socket.join(room);
    }

    removeFromRoom(socketId: string, room: string): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        const socket = this.getSocket(socketId);
        if (socket.gameRoom === room) {
            socket.gameRoom = undefined;
        }
        socket.socket.leave(room);
    }

    deleteRoom(roomName: string): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        this.sio.sockets.in(roomName).socketsLeave(roomName);
    }

    doesRoomExist(roomName: string): boolean {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        return this.sio.sockets.adapter.rooms.get(roomName) !== undefined;
    }

    getSocket(id: string): SocketWithInfo {
        const socket = this.sockets.get(id);
        if (!socket) throw new HttpException(INVALID_ID_FOR_SOCKET, StatusCodes.NOT_FOUND);
        return socket;
    }

    getAllSockets(): io.Socket[] {
        return Array.from(this.sockets.values()).map((socketWithInfo) => socketWithInfo.socket);
    }

    // Required for signature overload. This forces us to use only the correct payload
    // for the current emit and prevents us from emitting incorrect arguments which
    // would cause errors on the client side
    /* eslint-disable no-dupe-class-members */
    emitToRoom(id: string, ev: 'acceptJoinRequest', ...args: AcceptJoinRequestEmitArgs[]): void;
    emitToRoom(id: string, ev: 'cancelledGroup', ...args: CancelledGroupEmitArgs[]): void;
    emitToRoom(id: string, ev: 'userLeftGroup', ...args: UserLeftGroupEmitArgs[]): void;
    emitToRoom(id: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToRoom(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToRoom(id: string, ev: 'groupsUpdate', ...args: GroupsUpdateEmitArgs[]): void;
    emitToRoom(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToRoom(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToRoom(id: string, ev: 'tilePlacement', ...args: TilePlacementEmitArgs[]): void;
    emitToRoom(id: string, ev: 'cleanup', ...args: CleanupEmitArgs[]): void;
    emitToRoom(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToRoom<T>(room: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        this.sio.to(room).emit(ev, ...args);
    }

    emitToSocket(id: string, ev: 'joinRequest', ...args: JoinRequestEmitArgs[]): void;
    emitToSocket(id: string, ev: 'joinRequestCancelled', ...args: JoinRequestCancelledEmitArgs[]): void;
    emitToSocket(id: string, ev: 'acceptJoinRequest', ...args: AcceptJoinRequestEmitArgs[]): void;
    emitToSocket(id: string, ev: 'rejectJoinRequest', ...args: RejectJoinRequestEmitArgs[]): void;
    emitToSocket(id: string, ev: 'cancelledGroup', ...args: CancelledGroupEmitArgs[]): void;
    emitToSocket(id: string, ev: 'userLeftGroup', ...args: UserLeftGroupEmitArgs[]): void;
    emitToSocket(id: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToSocket(id: string, ev: 'groupsUpdate', ...args: GroupsUpdateEmitArgs[]): void;
    emitToSocket(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToSocket(id: string, ev: 'highScoresList', ...args: HighScoresEmitArgs[]): void;
    emitToSocket(id: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToSocket(id: string, ev: 'cleanup', ...args: CleanupEmitArgs[]): void;
    emitToSocket(id: string, ev: '_test_event', ...args: unknown[]): void;
    emitToSocket(id: string, ev: 'replaceVirtualPlayer', ...args: StartGameEmitArgs[]): void;
    emitToSocket<T>(id: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);

        if (isIdVirtualPlayer(id)) return;
        this.getSocket(id).socket.emit(ev, ...args);
    }

    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'acceptJoinRequest', ...args: AcceptJoinRequestEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'cancelledGroup', ...args: CancelledGroupEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'userLeftGroup', ...args: UserLeftGroupEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'gameUpdate', ...args: GameUpdateEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'startGame', ...args: StartGameEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'groupsUpdate', ...args: GroupsUpdateEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'newMessage', ...args: NewMessageEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'tilePlacement', ...args: TilePlacementEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: 'cleanup', ...args: CleanupEmitArgs[]): void;
    emitToRoomNoSender(id: string, socketSenderId: string, ev: '_test_event', ...args: unknown[]): void;
    emitToRoomNoSender<T>(room: string, socketSenderId: string, ev: SocketEmitEvents, ...args: T[]): void {
        if (this.sio === undefined) throw new HttpException(SOCKET_SERVICE_NOT_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        if (isIdVirtualPlayer(socketSenderId)) {
            this.sio.to(room).emit(ev, ...args);
            return;
        }

        this.getSocket(socketSenderId)
            .socket.to(room)
            .emit(ev, ...args);
    }

    listenToInitialisationEvent(callback: (socket: ServerSocket) => void): void {
        this.configureSocketsEvent.addListener(SOCKET_CONFIGURE_EVENT_NAME, callback);
    }

    private handleDisconnect(socket: io.Socket): void {
        const idUser = this.authentificationService.connectedUsers.getUserId(socket.id);
        this.serverActionService.addAction({
            idUser,
            actionType: ServerActionType.LOGOUT,
        });
        this.notificationService.scheduleReminderNotification(idUser);
        const socketInfo = this.getSocket(socket.id);
        if (socketInfo.gameRoom) {
            this.playerDisconnectedEvent.emit('playerDisconnected', socketInfo.gameRoom, socket.id);
        }
        this.authentificationService.disconnectSocket(socket.id);
        this.sockets.delete(socket.id);
    }
}
