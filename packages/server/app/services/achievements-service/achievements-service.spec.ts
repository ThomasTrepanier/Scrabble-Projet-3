/* eslint-disable @typescript-eslint/no-unused-expressions,no-unused-expressions,dot-notation,@typescript-eslint/no-magic-numbers */
import { AchievementsService } from '@app/services/achievements-service/achievements-service';
import DatabaseService from '@app/services/database-service/database.service';
import { Knex } from 'knex';
import { User } from '@common/models/user';
import { UserStatistics } from '@common/models/user-statistics';
import { beforeEach } from 'mocha';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { Container } from 'typedi';
import { expect } from 'chai';
import { USER_TABLE } from '@app/constants/services-constants/database-const';
import { ACHIEVEMENT_COMPLETED_GAMES, ACHIEVEMENT_POINTS, ACHIEVEMENT_WON_GAMES } from '@app/constants/achievement';
import { GameHistoryForUser } from '@common/models/game-history';

const DEFAULT_USER: User = {
    idUser: 1,
    username: 'test',
    password: 'test',
    email: 'test@test.test',
    avatar: '',
};

const DEFAULT_STATISTICS: UserStatistics = {
    idUser: DEFAULT_USER.idUser,
    averagePointsPerGame: 0,
    averageTimePerGame: 0,
    gamesPlayedCount: 0,
    gamesWonCount: 0,
    rating: 0,
    ratingMax: 0,
    bingoCount: 0,
};

const getGameHistoryFromScore = (score: number): GameHistoryForUser => ({
    startTime: new Date(),
    endTime: new Date(),
    score,
    isWinner: false,
    ratingVariation: 0,
    hasAbandoned: false,
    idAnalysis: 0,
});
const getGameHistoryFromDate = (date: Date): GameHistoryForUser => ({
    startTime: new Date(),
    endTime: date,
    score: 0,
    isWinner: false,
    ratingVariation: 0,
    hasAbandoned: false,
    idAnalysis: 0,
});

describe('AchievementsService', () => {
    let testingUnit: ServicesTestingUnit;
    let service: AchievementsService;
    let databaseService: DatabaseService;
    let userTable: () => Knex.QueryBuilder<User>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        service = Container.get(AchievementsService);
        databaseService = Container.get(DatabaseService);
        userTable = () => databaseService.knex(USER_TABLE);
    });

    beforeEach(async () => {
        await userTable().insert(DEFAULT_USER);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should exists', () => {
        expect(service).to.exist;
    });

    describe('getAchievements', () => {
        it('should return an array of achievements', async () => {
            const achievements = await service.getAchievements(DEFAULT_USER.idUser);

            expect(achievements).to.be.an('array');
            expect(achievements).length.to.be.greaterThan(0);
        });
    });

    describe('getCompletedGameAchievements', () => {
        let statistics: UserStatistics;

        beforeEach(async () => {
            statistics = { ...DEFAULT_STATISTICS };
        });

        it('should return games played count', () => {
            const count = 420;
            statistics.gamesPlayedCount = count;

            expect(service['getCompletedGameAchievement'](statistics).value).to.equal(count);
        });

        it('should return level', () => {
            const levelIndex = 2;
            statistics.gamesPlayedCount = ACHIEVEMENT_COMPLETED_GAMES.levels[levelIndex].value + 1;

            const result = service['getCompletedGameAchievement'](statistics);

            expect(result.levelIndex).to.equal(levelIndex);
            expect(result.level).to.equal(ACHIEVEMENT_COMPLETED_GAMES.levels[levelIndex]);
        });
    });

    describe('getWonGameAchievement', () => {
        let statistics: UserStatistics;

        beforeEach(async () => {
            statistics = { ...DEFAULT_STATISTICS };
        });

        it('should return games played count', () => {
            const count = 69;
            statistics.gamesWonCount = count;

            expect(service['getWonGameAchievement'](statistics).value).to.equal(count);
        });

        it('should return level', () => {
            const levelIndex = 2;
            statistics.gamesWonCount = ACHIEVEMENT_WON_GAMES.levels[levelIndex].value + 1;

            const result = service['getWonGameAchievement'](statistics);

            expect(result.levelIndex).to.equal(levelIndex);
            expect(result.level).to.equal(ACHIEVEMENT_WON_GAMES.levels[levelIndex]);
        });
    });

    describe('getTotalPointsAchievement', () => {
        it('should return 0 by default', () => {
            expect(service['getTotalPointsAchievement']([]).value).to.equal(0);
        });

        it('should return total points', () => {
            const points = [1, 2, 3, 4, 5];
            const total = points.reduce((acc, curr) => acc + curr, 0);
            const history = points.map<GameHistoryForUser>(getGameHistoryFromScore);

            const result = service['getTotalPointsAchievement'](history);

            expect(result.value).to.equal(total);
        });

        it('should return level', () => {
            const levelIndex = 2;
            const score = ACHIEVEMENT_POINTS.levels[levelIndex].value + 1;
            const history: GameHistoryForUser[] = [getGameHistoryFromScore(score)];

            const result = service['getTotalPointsAchievement'](history);

            expect(result.levelIndex).to.equal(levelIndex);
            expect(result.level).to.equal(ACHIEVEMENT_POINTS.levels[levelIndex]);
        });
    });

    describe('getConsecutiveDaysAchievement', () => {
        it('should return 0 by default', () => {
            expect(service['getConsecutiveDaysAchievement']([]).value).to.equal(0);
        });

        it('should return 1 if one game is played', () => {
            const history: GameHistoryForUser[] = [getGameHistoryFromDate(new Date(2023, 1, 1))];

            expect(service['getConsecutiveDaysAchievement'](history).value).to.equal(1);
        });

        it('should return consecutive days', () => {
            const history: GameHistoryForUser[] = [
                getGameHistoryFromDate(new Date(2023, 1, 1, 4, 4, 3)), // +1, 1
                getGameHistoryFromDate(new Date(2023, 1, 1, 7, 7, 6)), // +0, 1
                getGameHistoryFromDate(new Date(2023, 1, 2, 1, 3, 3)), // +1, 2

                getGameHistoryFromDate(new Date(2023, 1, 4, 5, 7, 2)), // +1, 1 (reset)
                getGameHistoryFromDate(new Date(2023, 1, 4, 8, 4, 1)), // +0, 1
                getGameHistoryFromDate(new Date(2023, 1, 5, 3, 8, 6)), // +1, 2
                getGameHistoryFromDate(new Date(2023, 1, 6, 2, 2, 1)), // +1, 3
                getGameHistoryFromDate(new Date(2023, 1, 7, 3, 6, 8)), // +1, 4

                getGameHistoryFromDate(new Date(2023, 1, 9, 2, 6, 4)), // +1, 1 (reset)
                getGameHistoryFromDate(new Date(2023, 1, 10, 5, 3, 3)), // +1, 2
                getGameHistoryFromDate(new Date(2023, 1, 11, 7, 8, 1)), // +1, 3
            ];

            expect(service['getConsecutiveDaysAchievement'](history).value).to.equal(4);
        });
    });
});
