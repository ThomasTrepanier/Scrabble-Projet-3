import { ClientEvents, ServerEvents } from '@common/events/events';
import { Socket } from 'socket.io-client';

export type ClientSocket = Socket<ServerEvents, ClientEvents>;
