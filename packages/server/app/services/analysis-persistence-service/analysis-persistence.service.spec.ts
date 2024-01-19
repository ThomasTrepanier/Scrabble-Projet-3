/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { ScoredWordPlacement } from '@common/models/word-finding';
import {
    ANALYSIS_TABLE,
    CRITICAL_MOMENTS_TABLE,
    GAME_HISTORY_TABLE,
    PLACEMENT_TABLE,
    USER_TABLE,
} from '@app/constants/services-constants/database-const';
import DatabaseService from '@app/services/database-service/database.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { ActionType } from '@common/models/action';
import { Square, Tile, Board } from '@common/models/game';
import { GameHistory } from '@common/models/game-history';
import { Orientation } from '@common/models/position';
import { User } from '@common/models/user';
import { expect } from 'chai';
import { Knex } from 'knex';
import { Container } from 'typedi';
import { AnalysisPersistenceService } from './analysis-persistence.service';
import { PlacementData, CriticalMomentData, AnalysisData, CriticalMoment, Analysis } from '@common/models/analysis';

const USER_1: User = {
    avatar: 'a',
    email: 'a',
    idUser: 1,
    password: 'a',
    username: 'a',
};

const USER_2: User = {
    avatar: 'b',
    email: 'b',
    idUser: 2,
    password: 'b',
    username: 'b',
};
const GAME_HISTORY_1: GameHistory = {
    idGameHistory: 1,
    startTime: new Date(),
    endTime: new Date(),
};

const GAME_HISTORY_2: GameHistory = {
    idGameHistory: 2,
    startTime: new Date(),
    endTime: new Date(),
};

const PLACEMENT_DATA_1: PlacementData = {
    idPlacement: 1,
    tilesToPlace: 'ABC',
    isHorizontal: true,
    score: 10,
    row: 1,
    column: 2,
};

const PLACEMENT_DATA_2: PlacementData = {
    idPlacement: 2,
    tilesToPlace: 'ABCDEf',
    isHorizontal: true,
    score: 40,
    row: 7,
    column: 7,
};

const PLACEMENT_DATA_3: PlacementData = {
    idPlacement: 3,
    tilesToPlace: 'AZx',
    isHorizontal: false,
    score: 30,
    row: 3,
    column: 6,
};

const BOARD_STRING_1 = 'TeSTERA      AAA                                                     ALLO     ';
const BOARD_STRING_2 = 'TeSTERA      AAA                                                              ';

const CRITICAL_MOMENT_DATA_1: CriticalMomentData = {
    idCriticalMoment: 1,
    actionType: ActionType.PASS,
    tiles: 'ABCDE*Z',
    board: BOARD_STRING_1,
    idPlayedPlacement: undefined,
    idBestPlacement: 1,
    idAnalysis: 1,
};

const CRITICAL_MOMENT_DATA_2: CriticalMomentData = {
    idCriticalMoment: 2,
    actionType: ActionType.PLACE,
    tiles: 'BBAAE*Z',
    board: BOARD_STRING_2,
    idPlayedPlacement: 1,
    idBestPlacement: 2,
    idAnalysis: 1,
};

const ANALYSIS_1: AnalysisData = {
    idGameHistory: 1,
    idUser: 1,
    idAnalysis: 1,
};

const ANALYSIS_2: AnalysisData = {
    idGameHistory: 1,
    idUser: 2,
    idAnalysis: 2,
};

const ANALYSIS_3: AnalysisData = {
    idGameHistory: 2,
    idUser: 1,
    idAnalysis: 3,
};

const ANALYSIS_4: AnalysisData = {
    idGameHistory: 2,
    idUser: 2,
    idAnalysis: 4,
};

const TILE_1: Tile = {
    letter: 'A',
    value: 1,
    isBlank: false,
    playedLetter: undefined, // Used when letter is *
};

const TILE_2: Tile = {
    letter: 'X',
    value: 10,
    isBlank: false,
    playedLetter: undefined, // Used when letter is *
};

const TILE_3: Tile = {
    letter: '*',
    value: 0,
    isBlank: true,
    playedLetter: undefined,
};

const TILE_4: Tile = {
    letter: '*',
    value: 0,
    isBlank: true,
    playedLetter: 'C',
};
const TILERACK = [TILE_1, TILE_2, TILE_3];

const SCORED_WORD_PLACEMENT_1: ScoredWordPlacement = {
    tilesToPlace: [TILE_1, TILE_4],
    orientation: Orientation.Horizontal,
    startPosition: { row: 1, column: 1 },
    score: 10,
};

const SCORED_WORD_PLACEMENT_2: ScoredWordPlacement = {
    tilesToPlace: [TILE_1, TILE_2],
    orientation: Orientation.Vertical,
    startPosition: { row: 2, column: 2 },
    score: 2,
};

const BOARD: Board = {
    grid: [
        [{} as unknown as Square, {} as unknown as Square, {} as unknown as Square, {} as unknown as Square, {} as unknown as Square],
        [
            { tile: TILE_1 } as unknown as Square,
            { tile: TILE_2 } as unknown as Square,
            { tile: TILE_4 } as unknown as Square,
            {} as unknown as Square,
            {} as unknown as Square,
        ],
        [{} as unknown as Square, {} as unknown as Square, {} as unknown as Square, {} as unknown as Square, {} as unknown as Square],
        [{ tile: TILE_1 } as unknown as Square, {} as unknown as Square, {} as unknown as Square, {} as unknown as Square, {} as unknown as Square],
        [
            { tile: TILE_1 } as unknown as Square,
            { tile: TILE_2 } as unknown as Square,
            { tile: TILE_2 } as unknown as Square,
            {} as unknown as Square,
            {} as unknown as Square,
        ],
    ],
};

const REAL_CRITICAL_MOMENT_1: CriticalMoment = {
    tiles: TILERACK,
    actionType: ActionType.PASS,
    playedPlacement: undefined,
    bestPlacement: SCORED_WORD_PLACEMENT_1,
    board: BOARD,
};
const REAL_CRITICAL_MOMENT_2: CriticalMoment = {
    tiles: TILERACK,
    actionType: ActionType.PLACE,
    playedPlacement: SCORED_WORD_PLACEMENT_2,
    bestPlacement: SCORED_WORD_PLACEMENT_1,
    board: BOARD,
};

const REAL_ANALYSIS: Analysis = {
    idGameHistory: 1,
    idUser: 1,
    criticalMoments: [REAL_CRITICAL_MOMENT_1, REAL_CRITICAL_MOMENT_2],
};

describe('AnalysisPersistenceService', () => {
    let service: AnalysisPersistenceService;
    let testingUnit: ServicesTestingUnit;
    let databaseService: DatabaseService;
    let analysisTable: () => Knex.QueryBuilder<AnalysisData>;
    let criticalMomentTable: () => Knex.QueryBuilder<CriticalMomentData>;
    let placementTable: () => Knex.QueryBuilder<PlacementData>;
    let userTable: () => Knex.QueryBuilder<User>;
    let gameHistoryTable: () => Knex.QueryBuilder<GameHistory>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbedPrototypes(Application, { bindRoutes: undefined });
        await testingUnit.withMockDatabaseService();
        databaseService = Container.get(DatabaseService);
        analysisTable = () => databaseService.knex<AnalysisData>(ANALYSIS_TABLE);
        criticalMomentTable = () => databaseService.knex<CriticalMomentData>(CRITICAL_MOMENTS_TABLE);
        placementTable = () => databaseService.knex<PlacementData>(PLACEMENT_TABLE);
        userTable = () => databaseService.knex<User>(USER_TABLE);
        gameHistoryTable = () => databaseService.knex<GameHistory>(GAME_HISTORY_TABLE);
    });

    beforeEach(() => {
        service = Container.get(AnalysisPersistenceService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('requestAnalysis', async () => {
        beforeEach(async () => {
            await userTable().insert(USER_1);
            await userTable().insert(USER_2);
            await gameHistoryTable().insert(GAME_HISTORY_1);
            await gameHistoryTable().insert(GAME_HISTORY_2);

            await analysisTable().insert(ANALYSIS_1);
            await analysisTable().insert(ANALYSIS_2);
            await analysisTable().insert(ANALYSIS_3);
            await analysisTable().insert(ANALYSIS_4);

            await placementTable().insert(PLACEMENT_DATA_1);
            await placementTable().insert(PLACEMENT_DATA_2);
            await placementTable().insert(PLACEMENT_DATA_3);

            await criticalMomentTable().insert(CRITICAL_MOMENT_DATA_1);
            await criticalMomentTable().insert(CRITICAL_MOMENT_DATA_2);
        });

        it('should return the correct analysis', async () => {
            const analysis = await service.requestAnalysis(1, 1);
            expect(analysis.idUser).to.equal(1);
            expect(analysis.idGameHistory).to.equal(1);
            expect(analysis.criticalMoments.length).to.equal(2);
        });

        it('should return the correct critical moments', async () => {
            const analysis = await service.requestAnalysis(1, 1);

            expect(analysis.criticalMoments[0].actionType).to.equal(CRITICAL_MOMENT_DATA_1.actionType);
            expect(analysis.criticalMoments[0].bestPlacement.score).to.equal(PLACEMENT_DATA_1.score);
            expect(analysis.criticalMoments[1].actionType).to.equal(CRITICAL_MOMENT_DATA_2.actionType);
            expect(analysis.criticalMoments[1].bestPlacement.score).to.equal(PLACEMENT_DATA_2.score);
        });
    });

    describe('addAnalysis', async () => {
        beforeEach(async () => {
            await userTable().insert(USER_1);
            await userTable().insert(USER_2);
            await gameHistoryTable().insert(GAME_HISTORY_1);
            await gameHistoryTable().insert(GAME_HISTORY_2);
        });

        it('should add the correct analysis', async () => {
            const initialAnalysisEntries = (await analysisTable().count())[0].count;
            const initialCriticalMomentEntries = (await criticalMomentTable().count())[0].count;
            const initialPlacementEntries = (await placementTable().count())[0].count;
            await service.addAnalysis(1, 1, REAL_ANALYSIS);

            const finalAnalysisEntries = (await analysisTable().count())[0].count;
            const finalCriticalMomentEntries = (await criticalMomentTable().count())[0].count;
            const finalPlacementEntries = (await placementTable().count())[0].count;
            expect(initialAnalysisEntries + 1).to.equal(finalAnalysisEntries);
            expect(initialCriticalMomentEntries + REAL_ANALYSIS.criticalMoments.length).to.equal(finalCriticalMomentEntries);
            expect(initialPlacementEntries + 3).to.equal(finalPlacementEntries);
        });
    });
});
