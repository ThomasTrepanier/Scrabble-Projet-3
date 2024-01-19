import { SOCKET_ID_IS_REQUIRED, USER_ID_IS_REQUIRED } from '@app/constants/controllers-errors';
import { SocketId, UserId } from './connected-user-types';
export class ConnectedUser {
    private socketUserMap: Map<SocketId, UserId>;
    private userSocketMap: Map<UserId, SocketId>;

    constructor() {
        this.socketUserMap = new Map();
        this.userSocketMap = new Map();
    }

    connect(socketId: SocketId, userId: UserId): void {
        if (!socketId) throw new Error(SOCKET_ID_IS_REQUIRED);
        if (!userId) throw new Error(USER_ID_IS_REQUIRED);

        this.socketUserMap.set(socketId, userId);
        this.userSocketMap.set(userId, socketId);
    }

    disconnect(id: SocketId | UserId) {
        const { socketId, userId } = this.resolveIds(id);

        if (socketId) this.socketUserMap.delete(socketId);
        if (userId) this.userSocketMap.delete(userId);
    }

    isConnected(id: SocketId | UserId): boolean {
        const { socketId, userId } = this.resolveIds(id);

        return socketId ? this.socketUserMap.has(socketId) : userId ? this.userSocketMap.has(userId) : false;
    }

    getSocketId(id: SocketId | UserId): SocketId {
        const { socketId, userId } = this.resolveIds(id);

        const foundSocketId = socketId ? socketId : userId ? this.userSocketMap.get(userId) : undefined;

        if (!foundSocketId) throw new Error(`No socket id found for user id "${id}."`);

        return foundSocketId;
    }

    getUserId(id: SocketId | UserId): UserId {
        const { socketId, userId } = this.resolveIds(id);

        const foundUserId = userId ? userId : socketId ? this.socketUserMap.get(socketId) : undefined;

        if (!foundUserId) throw new Error(`No user id found for socket id "${id}."`);

        return foundUserId;
    }

    private resolveIds(id: SocketId | UserId): { socketId: SocketId | undefined; userId: UserId | undefined } {
        let socketId: SocketId | undefined;
        let userId: UserId | undefined;

        if (typeof id === 'string') {
            socketId = id;
            userId = this.socketUserMap.get(socketId);
        } else {
            userId = id;
            socketId = this.userSocketMap.get(userId);
        }

        return { socketId, userId };
    }
}
