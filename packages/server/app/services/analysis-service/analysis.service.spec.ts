/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { AnalysisService } from './analysis.service';
import { AnalysisPersistenceService } from '@app/services/analysis-persistence-service/analysis-persistence.service';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import { Tile } from '@app/classes/tile';
import { Square } from '@app/classes/square';
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { WordPlacement } from '@app/classes/word-finding';
import { CompletedRound } from '@app/classes/round/round';
import { CriticalMoment } from '@common/models/analysis';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };

const DEFAULT_PLAYER_1 = new Player('id1', USER1);
const DEFAULT_PLAYER_2 = new Player('id2', USER2);
const DEFAULT_PLAYER_3 = new Player('id3', USER3);
const DEFAULT_PLAYER_4 = new Player('id4', USER4);
const DEFAULT_ID = 'gameId';
const DEFAULT_USER_ID = 69;

const DEFAULT_COMPLETED_ROUNDS = [{ player: DEFAULT_PLAYER_1 }, { player: DEFAULT_PLAYER_2 }, { player: DEFAULT_PLAYER_1 }];
const DEFAULT_GAME_MANAGER = { completedRounds: DEFAULT_COMPLETED_ROUNDS };
const DEFAULT_GAME = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    player3: DEFAULT_PLAYER_3,
    player4: DEFAULT_PLAYER_4,
    id: DEFAULT_ID,
    gameIsOver: false,
    roundManager: DEFAULT_GAME_MANAGER,
    dictionarySummary: { id: '' },
    getId: () => DEFAULT_ID,
    createStartGameData: () => undefined,
    areGameOverConditionsMet: () => true,
    getPlayers: () => [DEFAULT_PLAYER_1, DEFAULT_PLAYER_2, DEFAULT_PLAYER_3, DEFAULT_PLAYER_4],
};

const TILES_1 = [{} as unknown as Tile, {} as unknown as Tile, {} as unknown as Tile];
const DEFAULT_BOARD = [[{} as unknown as Square], [{} as unknown as Square]];

const DEFAULT_PASS_ACTION = {} as unknown as ActionPass;
const DEFAULT_EXCHANGE_ACTION = {} as unknown as ActionExchange;
const DEFAULT_PLACE_ACTION = { scoredPoints: 1, wordPlacement: {} as unknown as WordPlacement } as unknown as ActionPlace;

const CRITICAL_MOMENT_PASS_ROUND = {
    tiles: TILES_1,
    board: DEFAULT_BOARD,
    actionPlayed: DEFAULT_PASS_ACTION,
};

const CRITICAL_MOMENT_EXCHANGE_ROUND = {
    tiles: TILES_1,
    board: DEFAULT_BOARD,
    actionPlayed: DEFAULT_EXCHANGE_ACTION,
};

const CRITICAL_MOMENT_PLACE_ROUND = {
    tiles: TILES_1,
    board: DEFAULT_BOARD,
    actionPlayed: DEFAULT_PLACE_ACTION,
};

describe('AnalysisService', () => {
    let analysisService: AnalysisService;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbed(WordFindingService).withStubbed(AnalysisPersistenceService);
    });

    beforeEach(async () => {
        analysisService = Container.get(AnalysisService);

        Sinon.stub(Player.prototype, 'idUser').get(() => 'DEFAULT_USER_ID');
    });

    afterEach(async () => {
        chai.spy.restore();
        Sinon.restore();
        testingUnit.restore();
    });

    it('should create', () => {
        expect(analysisService).to.exist;
    });

    describe('addAnalysis', async () => {
        let spy: unknown;

        it('should call asynchronousAnalysis with the correct parameters', async () => {
            spy = chai.spy.on(analysisService, 'asynchronousAnalysis', async () => Promise.resolve());
            const game = DEFAULT_GAME as unknown as Game;
            const idGameHistory = 1;
            await analysisService.addAnalysis(game, idGameHistory);
            expect(spy).to.have.been.called();
        });
    });

    describe('asynchronousAnalysis', async () => {
        it('should call analyseRound when it is the correct player', async () => {
            const spyAnalyseRound = chai.spy.on(analysisService, 'analyseRound', () => ({} as unknown as CriticalMoment));
            chai.spy.on(analysisService['analysisPersistenceService'], 'addAnalysis', async () => {});

            const game = DEFAULT_GAME as unknown as Game;
            const idGameHistory = 1;
            const playerAnalyses = [{ player: DEFAULT_PLAYER_1, analysis: { idGameHistory, idUser: DEFAULT_USER_ID, criticalMoments: [] } }];
            await analysisService['asynchronousAnalysis'](game, playerAnalyses, idGameHistory);
            expect(spyAnalyseRound).to.have.been.called.twice;
        });

        it('should call addAnalysis for each player', async () => {
            chai.spy.on(analysisService, 'analyseRound', () => ({} as unknown as CriticalMoment));
            const spyAddAnalysis = chai.spy.on(analysisService['analysisPersistenceService'], 'addAnalysis', () => {});

            const game = DEFAULT_GAME as unknown as Game;
            const idGameHistory = 1;
            const playerAnalyses = [{ player: DEFAULT_PLAYER_1, analysis: { idGameHistory, idUser: DEFAULT_USER_ID, criticalMoments: [] } }];
            await analysisService['asynchronousAnalysis'](game, playerAnalyses, idGameHistory);
            expect(spyAddAnalysis).to.have.been.called();
        });
    });

    describe('analyseRound', async () => {
        it('should call findBestPlacement and early return if nothing found ', async () => {
            const spyFindBestPlacement = chai.spy.on(analysisService, 'findBestPlacement', () => undefined);
            const game = DEFAULT_GAME as unknown as Game;

            analysisService['analyseRound'](CRITICAL_MOMENT_PASS_ROUND as unknown as CompletedRound, game);
            expect(spyFindBestPlacement).to.have.been.called();
        });

        it('should return undefined if action place and point difference lower than POINT_DIFFERENCE_CRITICAL_MOMENT_THRESHOLD ', () => {
            chai.spy.on(analysisService, 'findBestPlacement', () => {
                return { score: 10 };
            });
            const game = DEFAULT_GAME as unknown as Game;

            expect(analysisService['analyseRound'](CRITICAL_MOMENT_PLACE_ROUND as unknown as CompletedRound, game)).to.be.undefined;
        });

        it('should return a critical moment if action place and point diff greater than POINT_DIFFERENCE_CRITICAL_MOMENT_THRESHOLD ', () => {
            chai.spy.on(analysisService, 'findBestPlacement', () => {
                return { score: 40 };
            });
            const game = DEFAULT_GAME as unknown as Game;

            expect(analysisService['analyseRound'](CRITICAL_MOMENT_PLACE_ROUND as unknown as CompletedRound, game)).to.be.not.undefined;
        });

        it('should return undefined if action pass or exchange and point difference lower than POINT_DIFFERENCE_CRITICAL_MOMENT_THRESHOLD ', () => {
            chai.spy.on(analysisService, 'findBestPlacement', () => {
                return { score: 10 };
            });
            const game = DEFAULT_GAME as unknown as Game;

            expect(analysisService['analyseRound'](CRITICAL_MOMENT_EXCHANGE_ROUND as unknown as CompletedRound, game)).to.be.undefined;
        });

        it('should return a critical moment if action exchange and point diff greater than POINT_DIFFERENCE_CRITICAL_MOMENT_THRESHOLD ', () => {
            chai.spy.on(analysisService, 'findBestPlacement', () => {
                return { score: 40 };
            });
            const game = DEFAULT_GAME as unknown as Game;

            expect(analysisService['analyseRound'](CRITICAL_MOMENT_EXCHANGE_ROUND as unknown as CompletedRound, game)).to.be.not.undefined;
        });
    });
});
