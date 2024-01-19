import { PublicUser } from '@common/models/user';

export interface GroupRequest {
    groupId: string;
    isObserver: boolean;
}

export interface UserRequest {
    publicUser: PublicUser;
    isObserver: boolean;
}
