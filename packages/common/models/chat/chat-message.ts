import { WithIdOf } from "../../types/id";
import { PublicUser } from "../user";
import { Channel, UserChannel } from "./channel";

export interface MessagePayload {
    content: string;
    date: Date;
}

export interface ChatMessage {
    sender: PublicUser;
    content: string;
    date: Date;
}

export interface ChannelMessage extends WithIdOf<Channel> {
    message: ChatMessage;
}

export interface ChatHistoryMessage extends UserChannel {
    idMessage: number;
    date: Date;
    content: string;
}