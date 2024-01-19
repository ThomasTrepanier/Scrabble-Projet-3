import { GameVisibility } from './game-visibility';
import { PublicUser } from './user';
import { VirtualPlayerLevel } from './virtual-player-level';


export interface Group {
    groupId: string;
    user1: PublicUser;
    user2?: PublicUser;
    user3?: PublicUser;
    user4?: PublicUser;
    maxRoundTime: number;
    gameVisibility: GameVisibility;
    virtualPlayerLevel: VirtualPlayerLevel;
    password: string;
    numberOfObservers: number;
}

export type GroupData = Omit<Group, 'groupId'>;
