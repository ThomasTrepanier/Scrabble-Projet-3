import { SocketErrorResponse } from "../models/error";
import { ChatClientEvents, ChatServerEvents } from "./chat.event";

interface ErrorEvents {
  'error': (error: SocketErrorResponse) => void;
}
export type ServerEvents = ErrorEvents & ChatServerEvents;
export type ClientEvents = ChatClientEvents;