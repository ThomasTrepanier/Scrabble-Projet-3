/* eslint-disable dot-notation */
import { expect } from 'chai';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import GameHistoriesService from './game-history.service';
import { Container } from 'typedi';
import { GameHistory, GameHistoryPlayerCreation } from '@common/models/game-history';
import { DEFAULT_USER_1, DEFAULT_USER_2 } from '@app/constants/test/user';
import { UserService } from '@app/services/user-service/user-service';

const DEFAULT_PLAYER_1: GameHistoryPlayerCreation = {
    idUser: DEFAULT_USER_1.idUser,
    score: 1,
    isVirtualPlayer: false,
    isWinner: false,
    ratingVariation: 1,
    hasAbandoned: false,
};
const DEFAULT_PLAYER_2: GameHistoryPlayerCreation = {
    idUser: DEFAULT_USER_2.idUser,
    score: 2,
    isVirtualPlayer: true,
    isWinner: true,
    ratingVariation: 1,
    hasAbandoned: true,
};
const DEFAULT_GAME_HISTORY: GameHistory = {
    idGameHistory: 1,
    startTime: new Date(),
    endTime: new Date(),
};

describe('GameHistoriesService', () => {
    let testingUnit: ServicesTestingUnit;
    let gameHistoriesService: GameHistoriesService;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(async () => {
        gameHistoriesService = Container.get(GameHistoriesService);

        const userTable = () => Container.get(UserService)['table'];
        await userTable().insert(DEFAULT_USER_1);
        await userTable().insert(DEFAULT_USER_2);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    describe('addGameHistory', () => {
        it('should insert data for GameHistory table', async () => {
            await gameHistoriesService.addGameHistory({ gameHistory: DEFAULT_GAME_HISTORY, players: [DEFAULT_PLAYER_1, DEFAULT_PLAYER_2] });

            expect((await gameHistoriesService['table'].select('*')).length).to.equal(1);
        });

        it('should insert data for GameHistoryPlayer table', async () => {
            await gameHistoriesService.addGameHistory({ gameHistory: DEFAULT_GAME_HISTORY, players: [DEFAULT_PLAYER_1, DEFAULT_PLAYER_2] });

            expect((await gameHistoriesService['tableHistoryPlayer'].select('*')).length).to.equal(2);
        });
    });

    describe('resetGameHistories', () => {
        it('should delete entries from GameHistory table', async () => {
            await gameHistoriesService.addGameHistory({ gameHistory: DEFAULT_GAME_HISTORY, players: [DEFAULT_PLAYER_1, DEFAULT_PLAYER_2] });
            await gameHistoriesService.resetGameHistories();

            expect((await gameHistoriesService['table'].select('*')).length).to.equal(0);
        });

        it('should delete entries from GameHistoryPlayer table', async () => {
            await gameHistoriesService.addGameHistory({ gameHistory: DEFAULT_GAME_HISTORY, players: [DEFAULT_PLAYER_1, DEFAULT_PLAYER_2] });
            await gameHistoriesService.resetGameHistories();

            expect((await gameHistoriesService['tableHistoryPlayer'].select('*')).length).to.equal(0);
        });
    });
});
