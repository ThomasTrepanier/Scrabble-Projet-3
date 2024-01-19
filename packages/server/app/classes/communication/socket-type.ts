import { ClientEvents, ServerEvents } from '@common/events/events';
import { Socket } from 'socket.io';

export type ServerSocket = Socket<ClientEvents, ServerEvents>;
