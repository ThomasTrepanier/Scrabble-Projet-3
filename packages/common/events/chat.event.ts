import { Channel, ChannelCreation } from '../models/chat/channel';
import { ChannelMessage } from '../models/chat/chat-message';
import { TypeOfId } from '../types/id';

export interface ChatServerEvents {
    'channel:newMessage': (message: ChannelMessage) => void;
    'channel:newChannel': (response: Channel) => void;
    'channel:join': (channel: Channel) => void;
    'channel:quit': (channel: Channel) => void;
    'channel:history': (history: ChannelMessage[]) => void;
    'channel:joinableChannels': (channels: Channel[]) => void;
    'channel:delete': (channel: TypeOfId<Channel>) => void;
    'channel:initDone': () => void;
}

export interface ChatClientEvents {
    'channel:newMessage': (message: ChannelMessage) => void;
    'channel:newChannel': (channel: ChannelCreation) => void;
    'channel:join': (idChannel: TypeOfId<Channel>) => void;
    'channel:quit': (idChannel: TypeOfId<Channel>) => void;
    'channel:init': () => void;
    'channel:delete': (idChannel: TypeOfId<Channel>) => void;
}
