import { User } from '@common/models/user';
import { TypeOfId } from '@common/types/id';

export type UserId = TypeOfId<User>;
export type SocketId = string;
