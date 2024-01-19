/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { Position } from '@app/classes/board';
import { WordPlacement } from '@app/classes/word-finding';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { PuzzleService } from '@app/services/puzzle-service/puzzle.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { Orientation } from '@common/models/position';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { PuzzleController } from './puzzle-controller';

const DEFAULT_ID_USER = 1;
const DEFAULT_WORD_PLACEMENT: WordPlacement = {
    orientation: Orientation.Horizontal,
    startPosition: new Position(0, 1),
    tilesToPlace: [],
};

describe('PuzzleController', () => {
    let expressApp: Express.Application;
    let controller: PuzzleController;
    let puzzleServiceStub: SinonStubbedInstance<PuzzleService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit()
            .withStubbedDictionaryService()
            .withMockedAuthentification()
            .withStubbed(NotificationService, {
                initalizeAdminApp: undefined,
                sendNotification: Promise.resolve(' '),
            });
        await testingUnit.withMockDatabaseService();
        puzzleServiceStub = testingUnit.setStubbed(PuzzleService);
        expressApp = Container.get(Application).app;
        controller = Container.get(PuzzleController);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(controller).to.exist;
    });

    describe('/api/puzzles/start', () => {
        describe('POST', () => {
            it('should return 200', async () => {
                return supertest(expressApp).post('/api/puzzles/start').send({ idUser: DEFAULT_ID_USER }).expect(StatusCodes.OK);
            });

            it('should call startPuzzle', async () => {
                await supertest(expressApp).post('/api/puzzles/start').send({ idUser: DEFAULT_ID_USER });
                expect(puzzleServiceStub.startPuzzle.called).to.be.true;
            });
        });
    });

    describe('/api/puzzles/daily/start', () => {
        describe('POST', () => {
            it('should return 200', async () => {
                return supertest(expressApp).post('/api/puzzles/daily/start').send({ idUser: DEFAULT_ID_USER }).expect(StatusCodes.OK);
            });

            it('should call startPuzzle', async () => {
                await supertest(expressApp).post('/api/puzzles/daily/start').send({ idUser: DEFAULT_ID_USER });
                expect(puzzleServiceStub.startDailyPuzzle.called).to.be.true;
            });
        });
    });

    describe('/api/puzzles/daily/is-completed', () => {
        describe('POST', () => {
            it('should return 200', async () => {
                return supertest(expressApp).post('/api/puzzles/daily/is-completed').send({ idUser: DEFAULT_ID_USER }).expect(StatusCodes.OK);
            });

            it('should call startPuzzle', async () => {
                await supertest(expressApp).post('/api/puzzles/daily/is-completed').send({ idUser: DEFAULT_ID_USER });
                expect(puzzleServiceStub.canDoDailyPuzzle.called).to.be.true;
            });
        });
    });

    describe('/api/puzzles/daily/leaderboard', () => {
        describe('POST', () => {
            it('should return 200', async () => {
                return supertest(expressApp).post('/api/puzzles/daily/leaderboard').send({ idUser: DEFAULT_ID_USER }).expect(StatusCodes.OK);
            });

            it('should call startPuzzle', async () => {
                await supertest(expressApp).post('/api/puzzles/daily/leaderboard').send({ idUser: DEFAULT_ID_USER });
                expect(puzzleServiceStub.getDailyPuzzleLeaderboard.called).to.be.true;
            });
        });
    });

    describe('/api/puzzles/complete', () => {
        describe('POST', () => {
            it('should return 200', async () => {
                return supertest(expressApp)
                    .post('/api/puzzles/complete')
                    .send({ idUser: DEFAULT_ID_USER, wordPlacement: DEFAULT_WORD_PLACEMENT })
                    .expect(StatusCodes.OK);
            });

            it('should call completePuzzle', async () => {
                await supertest(expressApp).post('/api/puzzles/complete').send({ idUser: DEFAULT_ID_USER, wordPlacement: DEFAULT_WORD_PLACEMENT });
                expect(puzzleServiceStub.completePuzzle.called).to.be.true;
            });
        });
    });

    describe('/api/puzzles/abandon', () => {
        describe('POST', () => {
            it('should return 200', async () => {
                return supertest(expressApp).post('/api/puzzles/abandon').send({ idUser: DEFAULT_ID_USER }).expect(StatusCodes.OK);
            });

            it('should call abandonPuzzle', async () => {
                await supertest(expressApp).post('/api/puzzles/abandon').send({ idUser: DEFAULT_ID_USER });
                expect(puzzleServiceStub.abandonPuzzle.called).to.be.true;
            });
        });
    });
});
