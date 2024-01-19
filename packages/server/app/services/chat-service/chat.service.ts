import { ServerSocket } from '@app/classes/communication/socket-type';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { SocketId, UserId } from '@app/classes/user/connected-user-types';
import { DEFAULT_CHANNELS, GROUP_CHANNEL } from '@app/constants/chat';
import { ALREADY_EXISTING_CHANNEL_NAME, ALREADY_IN_CHANNEL, CHANNEL_DOES_NOT_EXISTS, NOT_IN_CHANNEL } from '@app/constants/services-errors';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { ChatHistoryService } from '@app/services/chat-history/chat-history.service';
import { ChatPersistenceService } from '@app/services/chat-persistence-service/chat-persistence.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { getSocketNameFromChannel } from '@app/utils/socket';
import { Channel, ChannelCreation } from '@common/models/chat/channel';
import { ChannelMessage } from '@common/models/chat/chat-message';
import { User } from '@common/models/user';
import { TypeOfId } from '@common/types/id';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class ChatService {
    private defaultChannels = DEFAULT_CHANNELS;

    constructor(
        private readonly socketService: SocketService,
        private readonly chatPersistenceService: ChatPersistenceService,
        private readonly authentificationService: AuthentificationService,
        private readonly chatHistoryService: ChatHistoryService,
    ) {
        this.socketService.listenToInitialisationEvent(this.configureSocket.bind(this));
    }

    async initialize(): Promise<void> {
        await this.chatPersistenceService.createDefaultChannels(this.defaultChannels);
    }

    configureSocket(socket: ServerSocket): void {
        socket.on('channel:newMessage', async (channelMessage: ChannelMessage) => {
            try {
                await this.handleSendMessage(channelMessage, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:newChannel', async (channel: ChannelCreation) => {
            try {
                await this.handleCreateChannel(channel, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:join', async (idChannel: TypeOfId<Channel>) => {
            try {
                await this.handleJoinChannel(idChannel, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:quit', async (idChannel: TypeOfId<Channel>) => {
            try {
                await this.handleQuitChannel(idChannel, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:init', async () => {
            try {
                await this.initChannelsForSocket(socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
        socket.on('channel:delete', async (idChannel: TypeOfId<Channel>) => {
            try {
                await this.deleteChannel(idChannel, socket);
            } catch (error) {
                SocketService.handleError(error, socket);
            }
        });
    }

    async createChannel(channel: ChannelCreation, userId: UserId): Promise<Channel> {
        const socketId: SocketId = this.authentificationService.connectedUsers.getSocketId(userId);
        const socket: ServerSocket = this.socketService.getSocket(socketId).socket;
        return this.handleCreateChannel(channel, socket);
    }

    // TODO: User userId when playerId has been replaced in requests !153
    async joinChannel(idChannel: TypeOfId<Channel>, playerId: SocketId): Promise<void> {
        const socket: ServerSocket = this.socketService.getSocket(playerId).socket;
        return this.handleJoinChannel(idChannel, socket);
    }

    // TODO: User userId when playerId has been replaced in requests !153
    async quitChannel(idChannel: TypeOfId<Channel>, playerId: SocketId): Promise<void> {
        const socket: ServerSocket = this.socketService.getSocket(playerId).socket;
        return this.handleQuitChannel(idChannel, socket);
    }

    async emptyChannel(idChannel: TypeOfId<Channel>): Promise<void> {
        const playerIdsInChannel: UserId[] = await this.chatPersistenceService.getChannelUserIds(idChannel);
        playerIdsInChannel.forEach((userId) => {
            try {
                const socketId: SocketId = this.authentificationService.connectedUsers.getSocketId(userId);
                const socket: ServerSocket = this.socketService.getSocket(socketId).socket;
                this.handleQuitChannel(idChannel, socket);
            } catch {
                return;
            }
        });
    }

    async deleteChannel(idChannel: TypeOfId<Channel>, socket: ServerSocket): Promise<void> {
        await this.handleDeleteChannel(idChannel, socket);
        await this.updateJoinableChannels();
    }

    private async handleSendMessage(channelMessage: ChannelMessage, socket: ServerSocket): Promise<void> {
        const channel = await this.chatPersistenceService.getChannel(channelMessage.idChannel);

        if (!channel) {
            throw new HttpException(CHANNEL_DOES_NOT_EXISTS, StatusCodes.BAD_REQUEST);
        }

        if (!socket.rooms.has(getSocketNameFromChannel(channel))) {
            throw new HttpException(NOT_IN_CHANNEL, StatusCodes.FORBIDDEN);
        }

        channelMessage = { ...channelMessage, message: { ...channelMessage.message, date: new Date() } };

        await this.chatHistoryService.saveMessage(channelMessage);

        socket.nsp.to(getSocketNameFromChannel(channel)).emit('channel:newMessage', channelMessage);
    }

    private async handleDeleteChannel(idChannel: TypeOfId<Channel>, socket: ServerSocket): Promise<void> {
        socket.nsp.to(getSocketNameFromChannel({ idChannel })).emit('channel:delete', idChannel);
        await this.emptyChannel(idChannel);
        await this.chatPersistenceService.deleteChannel(idChannel);
    }

    private async handleCreateChannel(channel: ChannelCreation, socket: ServerSocket): Promise<Channel> {
        if (!(await this.chatPersistenceService.isChannelNameAvailable(channel))) {
            throw new HttpException(ALREADY_EXISTING_CHANNEL_NAME, StatusCodes.FORBIDDEN);
        }

        const newChannel = await this.chatPersistenceService.saveChannel(channel);

        socket.emit('channel:newChannel', newChannel);
        await this.updateJoinableChannels();

        this.handleJoinChannel(newChannel.idChannel, socket);

        return newChannel;
    }

    private async handleJoinChannel(idChannel: TypeOfId<Channel>, socket: ServerSocket): Promise<void> {
        const user: User = socket.data.user;
        const channel = await this.chatPersistenceService.getChannel(idChannel);
        const channelHistory = await this.chatHistoryService.getChannelHistory(idChannel);

        if (!channel) {
            throw new HttpException(CHANNEL_DOES_NOT_EXISTS, StatusCodes.BAD_REQUEST);
        }

        if (socket.rooms.has(getSocketNameFromChannel(channel))) {
            throw new HttpException(ALREADY_IN_CHANNEL, StatusCodes.BAD_REQUEST);
        }

        // This method is used to subscribe to a channel of join an already subscribed channel.
        // We only need to add to the table if not already there.
        await this.chatPersistenceService.joinChannel(idChannel, user.idUser);

        socket.join(getSocketNameFromChannel(channel));
        socket.emit('channel:join', channel);
        socket.emit('channel:history', channelHistory);

        await this.updateJoinableChannelsForUser(user.idUser);
    }

    private async handleQuitChannel(idChannel: TypeOfId<Channel>, socket: ServerSocket): Promise<void> {
        const user: User = socket.data.user;
        const channel = await this.chatPersistenceService.getChannel(idChannel);

        if (!channel) {
            throw new HttpException(CHANNEL_DOES_NOT_EXISTS, StatusCodes.BAD_REQUEST);
        }

        if (socket.rooms.has(getSocketNameFromChannel(channel))) {
            socket.leave(getSocketNameFromChannel(channel));
        }

        await this.chatPersistenceService.leaveChannel(idChannel, user.idUser);

        socket.emit('channel:quit', channel);

        if (!channel.default) {
            const userCount = await this.chatPersistenceService.getUserCountInChannel(idChannel);

            if (userCount === 0) {
                await this.deleteChannel(idChannel, socket);
            }
        }

        await this.updateJoinableChannelsForUser(user.idUser);
    }

    private async initChannelsForSocket(socket: ServerSocket): Promise<void> {
        const user: User = socket.data.user;

        await Promise.all(
            (
                await this.chatPersistenceService.getChannelIdsWithPropertiesForUserId(GROUP_CHANNEL, user.idUser)
            ).map(async (idChannel) => this.handleQuitChannel(idChannel, socket)),
        );

        await Promise.all(
            (await this.chatPersistenceService.getUserChannelIds(user.idUser)).map(async (idChannel) => this.handleJoinChannel(idChannel, socket)),
        );

        socket.emit('channel:initDone');
    }

    private async updateJoinableChannelsForUser(idUser: TypeOfId<User>): Promise<void> {
        const socketId: SocketId = this.authentificationService.connectedUsers.getSocketId(idUser);
        const socket: ServerSocket = this.socketService.getSocket(socketId).socket;
        const joinableChannels = await this.chatPersistenceService.getJoinableChannels(idUser);
        socket.emit('channel:joinableChannels', joinableChannels);
    }

    private async updateJoinableChannels(): Promise<void> {
        const sockets = this.socketService.getAllSockets();

        sockets.forEach(async (socket) => {
            const user: User = socket.data.user;
            const joinableChannels = await this.chatPersistenceService.getJoinableChannels(user.idUser);
            socket.emit('channel:joinableChannels', joinableChannels);
        });
    }
}
