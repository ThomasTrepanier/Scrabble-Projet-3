/* eslint-disable no-unused-expressions,@typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Board, Orientation, Position } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import { PuzzleGenerator } from '@app/classes/puzzle/puzzle-generator/puzzle-generator';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { expect } from 'chai';
import { Container } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { PuzzleService } from './puzzle.service';
import WordFindingPuzzle from '@app/classes/word-finding/word-finding-puzzle/word-finding-puzzle';
import { WordPlacement } from '@app/classes/word-finding';
import { PuzzleResultStatus } from '@common/models/puzzle';
import { beforeEach } from 'mocha';
import DatabaseService from '@app/services/database-service/database.service';
import { User } from '@common/models/user';
import { Knex } from 'knex';
import { USER_TABLE } from '@app/constants/services-constants/database-const';

const DEFAULT_ID_USER = 1;

const WORDS = ['a', 'aa'];

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 1 };
const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const BOARD: Square[][] = [
    [
        { ...DEFAULT_SQUARE_1, position: new Position(0, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(0, 1), tile: DEFAULT_TILE_A },
    ],
    [
        { ...DEFAULT_SQUARE_1, position: new Position(1, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(1, 1) },
    ],
];

describe('PuzzleService', () => {
    let service: PuzzleService;
    let testingUnit: ServicesTestingUnit;
    let databaseService: DatabaseService;
    let userTable: () => Knex.QueryBuilder<User>;

    beforeEach(async () => {
        const dictionary = new Dictionary({ title: '', description: '', id: 'test', isDefault: true, words: WORDS });

        testingUnit = new ServicesTestingUnit()
            .withStubbed(DictionaryService, {
                getDefaultDictionary: dictionary,
                getDictionary: dictionary,
            })
            .withStubbedPrototypes(PuzzleGenerator, {
                generate: { board: new Board(BOARD), tiles: [DEFAULT_TILE_A] },
            })
            .withStubbedPrototypes(WordFindingPuzzle, { getRequiredTilesToPlace: 1 });
        await testingUnit.withMockDatabaseService();

        service = Container.get(PuzzleService);
        service.tilesToPlaceForBingo = 2;

        databaseService = Container.get(DatabaseService);
        userTable = () => databaseService.knex<User>(USER_TABLE);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('startPuzzle', () => {
        it('should return a puzzle', () => {
            expect(service.startPuzzle(DEFAULT_ID_USER)).to.exist;
        });
    });

    describe('startDailyPuzzle', () => {
        it('should return a puzzle', async () => {
            await userTable().insert({ idUser: DEFAULT_ID_USER, username: '', password: '', email: '' });
            expect(await service.startDailyPuzzle(DEFAULT_ID_USER)).to.exist;
        });

        it('should throw if already played', async () => {
            await userTable().insert({ idUser: DEFAULT_ID_USER, username: '', password: '', email: '' });
            await service.startDailyPuzzle(DEFAULT_ID_USER);
            expect(service.startDailyPuzzle(DEFAULT_ID_USER)).to.eventually.throw();
        });
    });

    describe('getDailyPuzzleLeaderboard', () => {
        beforeEach(async () => {
            const date = service['getDateForDailyPuzzle']();

            for (let i = 1; i <= 6; ++i) {
                await userTable().insert({ idUser: i, username: i.toString(), password: i.toString(), email: i.toString() });
                await service['table'].insert({ idUser: i, date, score: i * 10 });
            }

            const previousDate = new Date(date);
            previousDate.setDate(previousDate.getDate() - 1);

            for (let i = 1; i <= 3; ++i) {
                await service['table'].insert({ idUser: i, date: previousDate, score: i * 2 });
            }
        });

        it('should return top 5', async () => {
            const result = await service.getDailyPuzzleLeaderboard(DEFAULT_ID_USER);

            expect(result.leaderboard).to.have.lengthOf(5);
            expect(result.leaderboard[0].score).to.equal(60);
            expect(result.leaderboard[1].score).to.equal(50);
            expect(result.leaderboard[2].score).to.equal(40);
            expect(result.leaderboard[3].score).to.equal(30);
            expect(result.leaderboard[4].score).to.equal(20);
        });

        it('should return user rank', async () => {
            const result = await service.getDailyPuzzleLeaderboard(3);

            expect(result.userRank).to.equal(2);
        });

        it('should return user score', async () => {
            const result = await service.getDailyPuzzleLeaderboard(3);

            expect(result.userScore).to.equal(30);
        });
    });

    describe('completePuzzle', () => {
        it('should check placement', async () => {
            service.startPuzzle(DEFAULT_ID_USER);
            const result = await service.completePuzzle(DEFAULT_ID_USER, {
                orientation: Orientation.Horizontal,
                startPosition: new Position(0, 0),
                tilesToPlace: [DEFAULT_TILE_A],
            });

            expect(result).to.exist;
            expect(result.targetPlacement).to.exist;
            expect(result.result).to.equal(PuzzleResultStatus.Valid);
        });

        it('should return won if bingo', async () => {
            service.startPuzzle(DEFAULT_ID_USER);
            const result = await service.completePuzzle(DEFAULT_ID_USER, {
                orientation: Orientation.Vertical,
                startPosition: new Position(0, 0),
                tilesToPlace: [DEFAULT_TILE_A, DEFAULT_TILE_A],
            });

            expect(result.result).to.equal(PuzzleResultStatus.Won);
        });

        it('should throw if no game', () => {
            expect(service.completePuzzle(DEFAULT_ID_USER, {} as WordPlacement)).to.eventually.throw();
        });

        it('should throw if placement is invalid', async () => {
            service.startPuzzle(DEFAULT_ID_USER);
            const result = await service.completePuzzle(DEFAULT_ID_USER, {
                orientation: Orientation.Horizontal,
                startPosition: new Position(0, 0),
                tilesToPlace: [DEFAULT_TILE_B],
            });

            expect(result.result).to.equal(PuzzleResultStatus.Invalid);
        });
    });

    describe('abandonPuzzle', () => {
        it('should return abandoned', async () => {
            service.startPuzzle(DEFAULT_ID_USER);
            const result = await service.abandonPuzzle(DEFAULT_ID_USER);

            expect(result.result).to.equal(PuzzleResultStatus.Abandoned);
        });
    });
});
