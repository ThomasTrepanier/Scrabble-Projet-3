import { HttpException } from '@app/classes/http-exception/http-exception';
import { USER_STATISTICS_TABLE, USER_TABLE } from '@app/constants/services-constants/database-const';
import { CANNOT_GET_STATISTICS_FOR_USER } from '@app/constants/services-errors';
import DatabaseService from '@app/services/database-service/database.service';
import { RatedUser, User } from '@common/models/user';
import { TypeOfId } from '@common/types/id';
import { Service } from 'typedi';
import { PublicUserStatistics, UserGameStatisticInfo, UserStatistics } from '@common/models/user-statistics';
import { DEFAULT_PLAYER_RATING } from '@common/models/constants';

export const NUMBER_OF_USERS_IN_LEADERBOARD = 10;

@Service()
export class UserStatisticsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async getStatistics(idUser: TypeOfId<User>): Promise<PublicUserStatistics> {
        let statistics = await this.tryGetStatistics(idUser);

        if (!statistics) {
            await this.createStatistics(idUser);
            statistics = await this.tryGetStatistics(idUser);
        }

        if (!statistics) throw new HttpException(CANNOT_GET_STATISTICS_FOR_USER);

        return statistics;
    }

    async getTopRatings(): Promise<RatedUser[]> {
        const topUsers = await this.table
            .select('u.username as username', 'u.avatar as avatar', 'u.email as email', `${USER_STATISTICS_TABLE}.rating`)
            .join(`${USER_TABLE} as u`, 'u.idUser', `${USER_STATISTICS_TABLE}.idUser`)
            .orderBy(`${USER_STATISTICS_TABLE}.rating`, 'desc')
            .limit(NUMBER_OF_USERS_IN_LEADERBOARD);

        return topUsers;
    }

    async addGameToStatistics(idUser: TypeOfId<User>, game: UserGameStatisticInfo): Promise<PublicUserStatistics> {
        const statistics = await this.getStatistics(idUser);

        statistics.averagePointsPerGame = this.calculateNewAveragePointsPerGame(statistics, game);
        statistics.averageTimePerGame = this.calculateNewAverageTimePerGame(statistics, game);
        statistics.gamesPlayedCount++;
        statistics.rating += game.ratingDifference;
        statistics.ratingMax = Math.max(statistics.ratingMax, statistics.rating);
        if (game.hasWon) statistics.gamesWonCount++;

        await this.table.where({ idUser }).update(statistics);

        return statistics;
    }

    async addBingoToStatistics(idUser: TypeOfId<User>): Promise<PublicUserStatistics> {
        const statistics = await this.getStatistics(idUser);
        statistics.bingoCount++;
        await this.table.where({ idUser }).update(statistics);
        return statistics;
    }

    async resetStatistics(idUser: TypeOfId<User>): Promise<void> {
        await this.table.where({ idUser }).update({
            averagePointsPerGame: 0,
            averageTimePerGame: 0,
            gamesPlayedCount: 0,
            gamesWonCount: 0,
            rating: DEFAULT_PLAYER_RATING,
        });
    }

    async createStatistics(idUser: TypeOfId<User>): Promise<void> {
        await this.table.insert({ idUser });
    }

    private async tryGetStatistics(idUser: TypeOfId<User>): Promise<PublicUserStatistics | undefined> {
        return this.table
            .select('averagePointsPerGame', 'averageTimePerGame', 'gamesPlayedCount', 'gamesWonCount', 'rating', 'ratingMax', 'bingoCount')
            .where({ idUser })
            .first();
    }

    private calculateNewAveragePointsPerGame(statistics: PublicUserStatistics, game: UserGameStatisticInfo): number {
        return (statistics.averagePointsPerGame * statistics.gamesPlayedCount + game.points) / (statistics.gamesPlayedCount + 1);
    }

    private calculateNewAverageTimePerGame(statistics: PublicUserStatistics, game: UserGameStatisticInfo): number {
        return (statistics.averageTimePerGame * statistics.gamesPlayedCount + game.time) / (statistics.gamesPlayedCount + 1);
    }

    private get table() {
        return this.databaseService.knex<UserStatistics>(USER_STATISTICS_TABLE);
    }
}
