import { GameHistoryForUser } from './game-history';
import { User } from './user';
import { PublicUserStatistics } from './user-statistics';
import { UserAchievement } from './achievement';

export type UserSearchItem = Pick<User, 'username' | 'avatar'>;
export type UserSearchResult = UserSearchItem & {
    gameHistory: GameHistoryForUser[];
    statistics: PublicUserStatistics;
    achievements: UserAchievement[];
};

export type UserSearchQueryResult = {
    query: string;
    results: UserSearchItem[];
};
