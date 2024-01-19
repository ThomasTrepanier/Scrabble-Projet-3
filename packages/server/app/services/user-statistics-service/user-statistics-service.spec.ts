/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { UserService } from '@app/services/user-service/user-service';
import { User } from '@common/models/user';
import { PublicUserStatistics, UserGameStatisticInfo, UserStatistics } from '@common/models/user-statistics';
import { expect } from 'chai';
import { Knex } from 'knex';
import { Container } from 'typedi';
import { UserStatisticsService } from './user-statistics-service';

const DEFAULT_USER: User = {
    idUser: 1,
    avatar: 'the-way-of-the-water',
    email: 'me@me.com',
    password: '123',
    username: 'username',
};
const DEFAULT_PUBLIC_STATISTICS: PublicUserStatistics = {
    averagePointsPerGame: 50,
    averageTimePerGame: 300,
    gamesPlayedCount: 4,
    gamesWonCount: 2,
    rating: 1,
    ratingMax: 1,
    bingoCount: 0,
};
const DEFAULT_STATISTICS: UserStatistics = {
    idUser: DEFAULT_USER.idUser,
    ...DEFAULT_PUBLIC_STATISTICS,
};
const DEFAULT_GAME_STATISTICS_INFO: UserGameStatisticInfo = {
    hasWon: true,
    points: 10,
    time: 200,
    ratingDifference: 5,
};

describe('UserStatisticsService', () => {
    let service: UserStatisticsService;
    let userService: UserService;
    let testingUnit: ServicesTestingUnit;
    let userTable: () => Knex.QueryBuilder<User>;
    let statsTable: () => Knex.QueryBuilder<UserStatistics>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(async () => {
        service = Container.get(UserStatisticsService);
        userService = Container.get(UserService);
        userTable = () => userService['table'];
        statsTable = () => service['table'];

        await userTable().insert(DEFAULT_USER);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should exists', () => {
        expect(service).to.exist;
    });

    describe('getStatistics', () => {
        it('should return user statistics', async () => {
            await statsTable().insert(DEFAULT_STATISTICS);

            expect(await service.getStatistics(DEFAULT_USER.idUser)).to.deep.equal(DEFAULT_PUBLIC_STATISTICS);
        });

        it('should create statistics if does not exists', async () => {
            expect(await service.getStatistics(DEFAULT_USER.idUser)).to.not.be.undefined;
        });
    });

    describe('addGameToStatistics', () => {
        it('should increment gamesPlayedCount', async () => {
            await statsTable().insert(DEFAULT_STATISTICS);
            expect((await service.addGameToStatistics(DEFAULT_USER.idUser, DEFAULT_GAME_STATISTICS_INFO)).gamesPlayedCount).to.equal(
                DEFAULT_STATISTICS.gamesPlayedCount + 1,
            );
        });

        it('should increment gamesWonCount if hasWon', async () => {
            await statsTable().insert(DEFAULT_STATISTICS);
            expect((await service.addGameToStatistics(DEFAULT_USER.idUser, DEFAULT_GAME_STATISTICS_INFO)).gamesWonCount).to.equal(
                DEFAULT_STATISTICS.gamesWonCount + 1,
            );
        });

        it('should not increment gamesWonCount if not hasWon', async () => {
            await statsTable().insert(DEFAULT_STATISTICS);
            expect(
                (await service.addGameToStatistics(DEFAULT_USER.idUser, { ...DEFAULT_GAME_STATISTICS_INFO, hasWon: false })).gamesWonCount,
            ).to.equal(DEFAULT_STATISTICS.gamesWonCount);
        });

        it('should update averagePointsPerGame', async () => {
            await statsTable().insert(DEFAULT_STATISTICS);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect((await service.addGameToStatistics(DEFAULT_USER.idUser, DEFAULT_GAME_STATISTICS_INFO)).averagePointsPerGame).to.equal(42);
        });

        it('should update averageTimePerGame', async () => {
            await statsTable().insert(DEFAULT_STATISTICS);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect((await service.addGameToStatistics(DEFAULT_USER.idUser, DEFAULT_GAME_STATISTICS_INFO)).averageTimePerGame).to.equal(280);
        });
    });

    describe('addBingoToStatistics', () => {
        it('should increment bingoCount', async () => {
            await statsTable().insert(DEFAULT_STATISTICS);
            expect((await service.addBingoToStatistics(DEFAULT_USER.idUser)).bingoCount).to.equal(DEFAULT_STATISTICS.bingoCount + 1);
        });

        it('should increment bingoCount 2', async () => {
            const bingoCount = 666;
            await statsTable().insert({ ...DEFAULT_STATISTICS, bingoCount });
            expect((await service.addBingoToStatistics(DEFAULT_USER.idUser)).bingoCount).to.equal(bingoCount + 1);
        });
    });
});
