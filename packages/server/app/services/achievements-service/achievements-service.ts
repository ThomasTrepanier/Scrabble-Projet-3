import { Service } from 'typedi';
import { Achievement, AchievementLevel, UserAchievement } from '@common/models/achievement';
import { TypeOfId } from '@common/types/id';
import { User } from '@common/models/user';
import { UserStatisticsService } from '@app/services/user-statistics-service/user-statistics-service';
import { PublicUserStatistics } from '@common/models/user-statistics';
import {
    ACHIEVEMENT_BINGO,
    ACHIEVEMENT_COMPLETED_GAMES,
    ACHIEVEMENT_CONSECUTIVE_DAYS,
    ACHIEVEMENT_ELO,
    ACHIEVEMENT_POINTS,
    ACHIEVEMENT_WON_GAMES,
} from '@app/constants/achievement';
import GameHistoriesService from '@app/services/game-history-service/game-history.service';
import { GameHistoryForUser } from '@common/models/game-history';
import { TIME_24_HOURS } from '@app/constants/time-const';

@Service()
export class AchievementsService {
    constructor(private readonly userStatisticsService: UserStatisticsService, private readonly gameHistoryService: GameHistoriesService) {}

    async getAchievements(idUser: TypeOfId<User>): Promise<UserAchievement[]> {
        const statistics = await this.userStatisticsService.getStatistics(idUser);
        const gameHistory = await this.gameHistoryService.getGameHistory(idUser);

        return [
            this.getCompletedGameAchievement(statistics),
            this.getWonGameAchievement(statistics),
            this.getTotalPointsAchievement(gameHistory),
            this.getConsecutiveDaysAchievement(gameHistory),
            this.getBingoAchievement(statistics),
            this.getEloAchievement(statistics),
        ];
    }

    private getCompletedGameAchievement(statistics: PublicUserStatistics): UserAchievement {
        const { gamesPlayedCount } = statistics;
        const [level, levelIndex] = this.getLevel(ACHIEVEMENT_COMPLETED_GAMES, gamesPlayedCount) ?? [];

        return {
            achievement: ACHIEVEMENT_COMPLETED_GAMES,
            level,
            levelIndex,
            value: gamesPlayedCount,
        };
    }

    private getWonGameAchievement(statistics: PublicUserStatistics): UserAchievement {
        const { gamesWonCount } = statistics;
        const [level, levelIndex] = this.getLevel(ACHIEVEMENT_WON_GAMES, gamesWonCount) ?? [];

        return {
            achievement: ACHIEVEMENT_WON_GAMES,
            level,
            levelIndex,
            value: gamesWonCount,
        };
    }

    private getTotalPointsAchievement(gameHistory: GameHistoryForUser[]): UserAchievement {
        const points = gameHistory.reduce((previous, current) => previous + (current.score > 0 ? current.score : 0), 0);
        const [level, levelIndex] = this.getLevel(ACHIEVEMENT_POINTS, points) ?? [];

        return {
            achievement: ACHIEVEMENT_POINTS,
            level,
            levelIndex,
            value: points,
        };
    }

    private getConsecutiveDaysAchievement(gameHistory: GameHistoryForUser[]): UserAchievement {
        let max = 0;
        gameHistory.reduce<[date: Date, count: number]>(
            ([previousDate, previousCount], current) => {
                const currentDate = new Date(current.endTime.getFullYear(), current.endTime.getMonth(), current.endTime.getDate());
                const isConsecutive = currentDate.getTime() - previousDate.getTime() <= TIME_24_HOURS;
                const isSameDay = currentDate.getTime() === previousDate.getTime();
                const updatedCount = isConsecutive ? previousCount + (isSameDay ? 0 : 1) : 1;

                if (updatedCount > max) max = updatedCount;

                return [currentDate, updatedCount];
            },
            [new Date(0), 0],
        );
        const [level, levelIndex] = this.getLevel(ACHIEVEMENT_CONSECUTIVE_DAYS, max) ?? [];

        return {
            achievement: ACHIEVEMENT_CONSECUTIVE_DAYS,
            level,
            levelIndex,
            value: max,
        };
    }

    private getBingoAchievement(statistics: PublicUserStatistics): UserAchievement {
        const { bingoCount } = statistics;
        const [level, levelIndex] = this.getLevel(ACHIEVEMENT_BINGO, bingoCount) ?? [];

        return {
            achievement: ACHIEVEMENT_BINGO,
            level,
            levelIndex,
            value: bingoCount,
        };
    }

    private getEloAchievement(statistics: PublicUserStatistics): UserAchievement {
        const { ratingMax } = statistics;
        const [level, levelIndex] = this.getLevel(ACHIEVEMENT_ELO, ratingMax) ?? [];

        return {
            achievement: ACHIEVEMENT_ELO,
            level,
            levelIndex,
            value: ratingMax,
        };
    }

    private getLevel(achievement: Achievement, value: number): [level: AchievementLevel, index: number] | undefined {
        return achievement.levels.reduce<[level: AchievementLevel, index: number] | undefined>(
            (previous, current, index) => (value >= current.value ? [current, index] : previous),
            undefined,
        );
    }
}
