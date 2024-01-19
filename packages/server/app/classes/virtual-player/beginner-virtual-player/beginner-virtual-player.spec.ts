/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import Game from '@app/classes/game/game';
import { AbstractWordFinding, ScoredWordPlacement, WordFindingUseCase } from '@app/classes/word-finding';
import {
    HIGH_SCORE_RANGE_MAX,
    HIGH_SCORE_RANGE_MIN,
    LOW_SCORE_RANGE_MAX,
    LOW_SCORE_RANGE_MIN,
    MEDIUM_SCORE_RANGE_MAX,
    MEDIUM_SCORE_RANGE_MIN,
    MINIMUM_TILES_LEFT_FOR_EXCHANGE,
} from '@app/constants/virtual-player-constants';
import {
    EXPECTED_INCREMENT_VALUE,
    PLAYER_ID,
    PLAYER_NAME,
    RANDOM_VALUE_EXCHANGE,
    RANDOM_VALUE_HIGH,
    RANDOM_VALUE_LOW,
    RANDOM_VALUE_MEDIUM,
    RANDOM_VALUE_PASS,
    RANDOM_VALUE_PLACE,
    TEST_COUNT_VALUE,
    TEST_ORIENTATION,
    TEST_POINT_RANGE,
    TEST_SCORE,
    TEST_START_POSITION,
} from '@app/constants/virtual-player-tests-constants';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as sinon from 'sinon';
import { createStubInstance, stub } from 'sinon';
import { BeginnerVirtualPlayer } from './beginner-virtual-player';

const testEvaluatedPlacements: ScoredWordPlacement[] = [
    { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE },
];

const TEST_SELECT_COUNT = 3;

const DEFAULT_GAME_CHANNEL_ID = 1;

describe('BeginnerVirtualPlayer', () => {
    let beginnerVirtualPlayer: BeginnerVirtualPlayer;

    beforeEach(() => {
        beginnerVirtualPlayer = new BeginnerVirtualPlayer(PLAYER_ID, PLAYER_NAME);
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
    });

    it('should create', () => {
        expect(beginnerVirtualPlayer).to.exist;
    });

    describe('isExchangePossible', () => {
        let TEST_GAME: Game;

        beforeEach(() => {
            TEST_GAME = new Game(DEFAULT_GAME_CHANNEL_ID);
            spy.on(beginnerVirtualPlayer['activeGameService'], 'getGame', () => {
                return TEST_GAME;
            });
        });

        it('should return false when tiles count is below MINIMUM_EXCHANGE_WORD_COUNT', () => {
            spy.on(TEST_GAME, 'getTotalTilesLeft', () => MINIMUM_TILES_LEFT_FOR_EXCHANGE - 3);
            expect(beginnerVirtualPlayer['isExchangePossible']()).to.be.false;
        });

        it('should return true when tiles count is above or equal to MINIMUM_EXCHANGE_WORD_COUNT', () => {
            spy.on(TEST_GAME, 'getTotalTilesLeft', () => MINIMUM_TILES_LEFT_FOR_EXCHANGE + 3);
            expect(beginnerVirtualPlayer['isExchangePossible']()).to.be.true;
        });
    });

    describe('findPointRange', () => {
        it('findPointRange should return low range values', () => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_LOW;
            });

            const testPointRange = beginnerVirtualPlayer['findPointRange']();
            expect(testPointRange.min).to.equal(LOW_SCORE_RANGE_MIN);
            expect(testPointRange.max).to.equal(LOW_SCORE_RANGE_MAX);
        });

        it('findPointRange should return medium range values', () => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_MEDIUM;
            });

            const testPointRange = beginnerVirtualPlayer['findPointRange']();
            expect(testPointRange.min).to.equal(MEDIUM_SCORE_RANGE_MIN);
            expect(testPointRange.max).to.equal(MEDIUM_SCORE_RANGE_MAX);
        });

        it('findPointRange should return high range values', () => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_HIGH;
            });

            const testPointRange = beginnerVirtualPlayer['findPointRange']();
            expect(testPointRange.min).to.equal(HIGH_SCORE_RANGE_MIN);
            expect(testPointRange.max).to.equal(HIGH_SCORE_RANGE_MAX);
        });
    });

    describe('Find Action with RANDOM_VALUE_PASS', () => {
        it('findAction should call ActionPass.createActionData() if random is RANDOM_VALUE_PASS', () => {
            spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return {} as unknown as ScoredWordPlacement;
            });
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_PASS;
            });
            const createActionDataPassSpy = spy.on(ActionPass, 'createActionData', () => {
                return;
            });
            beginnerVirtualPlayer['findAction']();
            expect(createActionDataPassSpy).to.have.been.called();
        });
    });

    describe('Find Action with RANDOM_VALUE_PLACE', () => {
        beforeEach(() => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_PLACE;
            });
            spy.on(beginnerVirtualPlayer, 'isExchangePossible', () => {
                return true;
            });
        });

        it('findAction should call createWordFindingPlacement if random is RANDOM_VALUE_PLACE', () => {
            const createWordSpy = spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return;
            });
            beginnerVirtualPlayer['findAction']();
            expect(createWordSpy).to.have.been.called();
        });

        it('findAction should call ActionPass.createActionData if no possible placements are found', () => {
            const testEmptyEvaluatedPlacement = undefined;
            spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return testEmptyEvaluatedPlacement;
            });
            const createActionDataPassSpy = stub(ActionPass, 'createActionData').returns({} as unknown as ActionData);
            const exchangeActionDataPassSpy = stub(ActionExchange, 'createActionData').returns({} as unknown as ActionData);
            beginnerVirtualPlayer['findAction']();
            expect(createActionDataPassSpy.called || exchangeActionDataPassSpy.called).to.true;
        });

        it('findAction should call ActionPlace.createActionData because possible placement', () => {
            spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return testEvaluatedPlacements;
            });
            const createActionDataPlaceSpy = spy.on(ActionPlace, 'createActionData', () => {
                return;
            });
            beginnerVirtualPlayer['findAction']();
            expect(createActionDataPlaceSpy).to.have.been.called();
        });

        it('findAction should call updateHistory', () => {
            spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return testEvaluatedPlacements;
            });
            spy.on(ActionPlace, 'createActionData', () => {
                return;
            });
            const updateHistorySpy = spy.on(beginnerVirtualPlayer, 'updateHistory', () => {
                return;
            });
            beginnerVirtualPlayer['findAction']();
            expect(updateHistorySpy).to.have.been.called();
        });
    });

    describe('Find Action with RANDOM_VALUE_EXCHANGE', () => {
        it('findAction should call ActionExchange.createActionData()', () => {
            spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return {} as unknown as ScoredWordPlacement;
            });
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_EXCHANGE;
            });
            spy.on(beginnerVirtualPlayer, 'isExchangePossible', () => {
                return true;
            });
            const actionExchangeSpy = spy.on(ActionExchange, 'createActionData', () => {
                return;
            });
            beginnerVirtualPlayer['findAction']();
            expect(actionExchangeSpy).to.have.been.called();
        });
    });

    describe('updateHistory', () => {
        afterEach(() => {
            chai.spy.restore();
        });

        it('should increment value', () => {
            const testEvaluatedPlacement = { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE };
            beginnerVirtualPlayer.pointHistory.set(TEST_SCORE, TEST_COUNT_VALUE);
            beginnerVirtualPlayer['updateHistory'](testEvaluatedPlacement);
            expect(beginnerVirtualPlayer.pointHistory.get(TEST_SCORE)).to.deep.equal(TEST_COUNT_VALUE + EXPECTED_INCREMENT_VALUE);
        });

        it('should set value to 1', () => {
            const testEvaluatedPlacement = { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE };
            beginnerVirtualPlayer['updateHistory'](testEvaluatedPlacement);
            expect(beginnerVirtualPlayer.pointHistory.get(TEST_SCORE)).to.deep.equal(EXPECTED_INCREMENT_VALUE);
        });
    });

    it('generateWordFindingRequest should call findPointRange method', () => {
        const findPointRangeSpy = spy.on(beginnerVirtualPlayer, 'findPointRange', () => {
            return;
        });
        beginnerVirtualPlayer['generateWordFindingRequest']();
        expect(findPointRangeSpy).to.have.been.called();
    });

    it('generateWordFindingRequest should return WordFindingRequest with correct data', () => {
        spy.on(beginnerVirtualPlayer, 'findPointRange', () => {
            return TEST_POINT_RANGE;
        });
        const testWordFindingRequest = beginnerVirtualPlayer['generateWordFindingRequest']();
        expect(testWordFindingRequest.useCase).to.equal(WordFindingUseCase.Beginner);
        expect(testWordFindingRequest.pointHistory).to.deep.equal(beginnerVirtualPlayer.pointHistory);
        expect(testWordFindingRequest.pointRange).to.deep.equal(TEST_POINT_RANGE);
    });

    describe('selectRandomTiles', () => {
        it('should send the specified tile count', () => {
            beginnerVirtualPlayer.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
                { letter: 'D', value: 0 },
                { letter: 'F', value: 0 },
            ];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            stub(beginnerVirtualPlayer, 'isExchangePossible' as any).returns(true);
            const ceilStub = stub(Math, 'ceil').returns(TEST_SELECT_COUNT);
            expect(beginnerVirtualPlayer['selectRandomTiles']().length).to.equal(TEST_SELECT_COUNT);
            ceilStub.restore();
        });
    });

    describe('alternativeMove', () => {
        it('should call ActionPass if no moves are found and exchange is not possible', () => {
            const wordFindingInstanceStub = createStubInstance(AbstractWordFinding);
            wordFindingInstanceStub['wordPlacements'] = [];
            beginnerVirtualPlayer['wordFindingInstance'] = wordFindingInstanceStub as unknown as AbstractWordFinding;
            const createActionDataSpy = spy.on(ActionPass, 'createActionData', () => {});

            beginnerVirtualPlayer['alternativeMove']();
            expect(createActionDataSpy).to.have.been.called();
        });

        it('should call ActionPlace if a moves is found', () => {
            const wordFindingInstanceStub = createStubInstance(AbstractWordFinding);
            wordFindingInstanceStub['wordPlacements'] = [{} as unknown as ScoredWordPlacement];
            beginnerVirtualPlayer['wordFindingInstance'] = wordFindingInstanceStub as unknown as AbstractWordFinding;
            spy.on(beginnerVirtualPlayer, 'isExchangePossible', () => {
                return false;
            });
            const createActionDataSpy = spy.on(ActionPlace, 'createActionData', () => {});
            const updateHistorySpy = spy.on(beginnerVirtualPlayer, 'updateHistory', () => {});

            beginnerVirtualPlayer['alternativeMove']();
            expect(createActionDataSpy).to.have.been.called();
            expect(updateHistorySpy).to.have.been.called();
        });

        it('should ActionPass.createActionData  if no moves are found', () => {
            const createActionDataSpy = chai.spy.on(ActionPass, 'createActionData', () => {});
            beginnerVirtualPlayer['alternativeMove']();
            expect(createActionDataSpy).to.have.been.called();
        });
    });
});
