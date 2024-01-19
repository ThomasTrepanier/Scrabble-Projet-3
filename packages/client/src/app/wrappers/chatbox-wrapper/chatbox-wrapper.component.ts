import { Component } from '@angular/core';
import { ClientChannel } from '@app/classes/chat/channel';
import { ChatService } from '@app/services/chat-service/chat.service';
import { Channel } from '@common/models/chat/channel';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-chatbox-wrapper',
    templateUrl: './chatbox-wrapper.component.html',
    styleUrls: ['./chatbox-wrapper.component.scss'],
})
export class ChatboxWrapperComponent {
    ready: Observable<boolean>;
    channels: Observable<ClientChannel[]>;
    joinedChannel: Observable<ClientChannel>;
    quittedChannel: Observable<ClientChannel>;
    joinableChannels: Observable<ClientChannel[]>;

    constructor(private readonly chatService: ChatService) {
        this.ready = this.chatService.ready;
        this.channels = this.chatService.getChannels();
        this.joinableChannels = this.chatService.getJoinableChannels();
        this.joinedChannel = this.chatService.joinedChannel;
        this.quittedChannel = this.chatService.quittedChannel;
    }

    handleSendMessage([channel, content]: [Channel, string]) {
        this.chatService.sendMessage(channel, content);
    }

    handleCreateChannel(channelName: string): void {
        this.chatService.createChannel(channelName);
    }

    handleQuitChannel(channel: Channel): void {
        this.chatService.quitChannel(channel.idChannel);
    }

    handleJoinChannel(channel: Channel): void {
        this.chatService.joinChannel(channel.idChannel);
    }

    handleDeleteChannel(channel: Channel): void {
        this.chatService.deleteChannel(channel.idChannel);
    }
}
