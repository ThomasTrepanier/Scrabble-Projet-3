import { Channel } from '@common/models/chat/channel';
import { ChatMessage } from '@common/models/chat/chat-message';

export type ClientChannel = Channel & { messages: ChatMessage[] };

export type ViewClientChannel = ClientChannel & { canOpen: boolean };
