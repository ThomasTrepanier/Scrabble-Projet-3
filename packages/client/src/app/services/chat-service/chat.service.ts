import { Injectable } from '@angular/core';
import { ClientChannel } from '@app/classes/chat/channel';
import { ClientSocket } from '@app/classes/communication/socket-type';
import SocketService from '@app/services/socket-service/socket.service';
import { UserService } from '@app/services/user-service/user.service';
import { Channel } from '@common/models/chat/channel';
import { ChannelMessage } from '@common/models/chat/chat-message';
import { TypeOfId } from '@common/types/id';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PublicUser } from '@common/models/user';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    ready: Subject<boolean> = new Subject();
    joinedChannel: Subject<ClientChannel>;
    quittedChannel: Subject<ClientChannel>;
    channels: BehaviorSubject<Map<TypeOfId<Channel>, ClientChannel>>;
    joinableChannels: BehaviorSubject<Map<TypeOfId<Channel>, ClientChannel>>;

    constructor(private readonly socketService: SocketService, private readonly userService: UserService) {
        this.channels = new BehaviorSubject(new Map());
        this.joinableChannels = new BehaviorSubject(new Map());
        this.joinedChannel = new Subject();
        this.quittedChannel = new Subject();

        this.socketService.onConnect.subscribe((socket) => {
            this.channels.next(new Map());
            this.joinableChannels.next(new Map());
            this.configureSocket(socket);
            this.ready.next(true);
        });

        this.socketService.onDisconnect.subscribe(() => {
            this.ready.next(false);
            this.channels.next(new Map());
            this.joinableChannels.next(new Map());
        });

        this.userService.user.subscribe((user) => {
            if (user) this.updateUserInfo(user);
        });
    }

    getChannels(): Observable<ClientChannel[]> {
        return this.channels.pipe(map((channels) => [...channels.values()].sort((a, b) => (a.name > b.name ? 1 : -1))));
    }

    getJoinableChannels(): Observable<ClientChannel[]> {
        return this.joinableChannels.pipe(map((channel) => [...channel.values()].sort((a, b) => (a.name > b.name ? 1 : -1))));
    }

    configureSocket(socket: ClientSocket): void {
        socket.on('channel:join', this.handleJoinChannel.bind(this));
        socket.on('channel:quit', this.handleChannelQuit.bind(this));
        socket.on('channel:newMessage', this.handleNewMessage.bind(this));
        socket.on('channel:history', this.handleChannelHistory.bind(this));
        socket.on('channel:joinableChannels', this.handleJoinableChannels.bind(this));
        socket.on('channel:delete', this.handleChannelDelete.bind(this));
        socket.emit('channel:init');
    }

    sendMessage(channel: Channel, content: string): void {
        this.socketService.socket.emit('channel:newMessage', {
            idChannel: channel.idChannel,
            message: {
                content,
                sender: this.userService.getUser(),
                date: new Date(),
            },
        });
    }

    createChannel(channelName: string): void {
        this.socketService.socket.emit('channel:newChannel', { name: channelName });
    }

    joinChannel(idChannel: TypeOfId<Channel>): void {
        this.socketService.socket.emit('channel:join', idChannel);
    }

    quitChannel(idChannel: TypeOfId<Channel>): void {
        this.socketService.socket.emit('channel:quit', idChannel);
    }

    deleteChannel(idChannel: TypeOfId<Channel>): void {
        this.socketService.socket.emit('channel:delete', idChannel);
    }

    handleJoinChannel(channel: Channel): void {
        const newChannel = { ...channel, messages: [] };
        this.channels.value.set(channel.idChannel, newChannel);
        this.channels.next(this.channels.value);
        this.joinedChannel.next(newChannel);
    }

    handleJoinableChannels(channels: Channel[]): void {
        this.joinableChannels.next(new Map(channels.map((channel: Channel) => [channel.idChannel, { ...channel, messages: [] }])));
    }

    handleChannelQuit(channel: Channel): void {
        this.channels.value.delete(channel.idChannel);
        this.channels.next(this.channels.value);
        this.joinableChannels.value.delete(channel.idChannel);
        this.joinableChannels.next(this.joinableChannels.value);
        this.quittedChannel.next({ ...channel, messages: [] });
    }

    handleChannelDelete(channelId: TypeOfId<Channel>): void {
        this.channels.value.delete(channelId);
        this.channels.next(this.channels.value);
        this.joinableChannels.value.delete(channelId);
        this.joinableChannels.next(this.joinableChannels.value);
    }

    handleNewMessage(channelMessage: ChannelMessage): void {
        this.updateUserInfo(channelMessage.message.sender);
        this.addMessageToChannel(channelMessage);
        this.channels.next(this.channels.value);
    }

    handleChannelHistory(channelMessages: ChannelMessage[]): void {
        channelMessages.forEach((channelMessage: ChannelMessage) => this.addMessageToChannel(channelMessage));
    }

    private updateUserInfo(sender: PublicUser): void {
        for (const channel of this.channels.value.values()) {
            for (const message of channel.messages) {
                if (message.sender.email === sender.email) {
                    if (message.sender.username === sender.username && message.sender.avatar === sender.avatar) {
                        return;
                    }

                    message.sender.username = sender.username;
                    message.sender.avatar = sender.avatar;
                }
            }
        }
    }

    private addMessageToChannel(channelMessage: ChannelMessage): void {
        this.channels.value.get(channelMessage.idChannel)?.messages.push({ ...channelMessage.message, date: new Date(channelMessage.message.date) });
        this.joinableChannels.value
            .get(channelMessage.idChannel)
            ?.messages.push({ ...channelMessage.message, date: new Date(channelMessage.message.date) });

        this.channels.next(this.channels.value);
        this.joinableChannels.next(this.joinableChannels.value);
    }
}
