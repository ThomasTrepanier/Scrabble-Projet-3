import { IdOf, WithIdOf } from '../types/id';
import { User } from './user';

export enum ServerActionType {
    LOGIN = 'login',
    LOGOUT = 'logout',
}

export interface ServerAction extends WithIdOf<User> {
    timestamp: Date;
    actionType: ServerActionType;
}

export type ServerActionCreation = Omit<ServerAction, 'timestamp'>;

export type PublicServerAction = Omit<ServerAction, IdOf<User>>;
