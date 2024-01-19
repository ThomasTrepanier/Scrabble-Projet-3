/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import Game from '@app/classes/game/game';
import { AbstractWordFinding, ScoredWordPlacement, WordFindingUseCase } from '@app/classes/word-finding';
import { PLAYER_ID, PLAYER_NAME, TEST_POINT_RANGE } from '@app/constants/virtual-player-tests-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import { createStubInstance } from 'sinon';
import { ExpertVirtualPlayer, MAX_EXPERT_CONSECUTIVE_EXCHANGES } from './expert-virtual-player';
const DEFAULT_GAME_CHANNEL_ID = 1;

describe('ExpertVirtualPlayer', () => {
    let expertVirtualPlayer: ExpertVirtualPlayer;

    beforeEach(async () => {
        expertVirtualPlayer = new ExpertVirtualPlayer(PLAYER_ID, PLAYER_NAME);
        spy.on(ActiveGameService.prototype, 'getGame', () => new Game(DEFAULT_GAME_CHANNEL_ID));
        spy.on(Game.prototype, 'getTotalTilesLeft', () => 5);
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('should create', () => {
        expect(expertVirtualPlayer).to.exist;
    });

    describe('isExchangePossible', () => {
        it('should return true in all cases', () => {
            expect(expertVirtualPlayer['isExchangePossible']()).to.be.true;
        });
    });

    describe('findPointRange', () => {
        it('findPointRange should return the whole positive range', () => {
            const testPointRange = expertVirtualPlayer['findPointRange']();
            expect(testPointRange.min).to.equal(0);
            expect(testPointRange.max).to.equal(Number.MAX_SAFE_INTEGER);
        });
    });

    describe('alternativeMove', () => {
        it('should call ActionExchange and increment exchange counter IF no moves are found and exchange is \
        possible + max exchange count has not been reached', () => {
            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return true;
            });
            expertVirtualPlayer['consecutiveExchangeCount'] = 1;
            const createActionDataSpy = spy.on(ActionExchange, 'createActionData', () => {});

            expertVirtualPlayer['alternativeMove']();
            expect(expertVirtualPlayer['consecutiveExchangeCount']).to.equal(2);
            expect(createActionDataSpy).to.have.been.called();
        });

        it('should call ActionPass and not increment counter if no moves are found and exchange is not possible', () => {
            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return false;
            });
            const createActionDataSpy = spy.on(ActionPass, 'createActionData', () => {});
            expertVirtualPlayer['consecutiveExchangeCount'] = 1;

            expertVirtualPlayer['alternativeMove']();
            expect(expertVirtualPlayer['consecutiveExchangeCount']).to.equal(1);
            expect(createActionDataSpy).to.have.been.called();
        });

        it('should call ActionPass and not increment counter if no moves are found and exchange is not possible', () => {
            const wordFindingInstanceStub = createStubInstance(AbstractWordFinding);
            wordFindingInstanceStub['wordPlacements'] = [];
            expertVirtualPlayer['wordFindingInstance'] = wordFindingInstanceStub as unknown as AbstractWordFinding;
            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return false;
            });
            const createActionDataSpy = spy.on(ActionPass, 'createActionData', () => {});
            expertVirtualPlayer['consecutiveExchangeCount'] = 1;

            expertVirtualPlayer['alternativeMove']();
            expect(expertVirtualPlayer['consecutiveExchangeCount']).to.equal(1);
            expect(createActionDataSpy).to.have.been.called();
        });

        it('should call ActionPass and not increment counter if no moves are found and max exchange count has been reached', () => {
            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return true;
            });
            const createActionDataSpy = spy.on(ActionPass, 'createActionData', () => {});
            expertVirtualPlayer['consecutiveExchangeCount'] = MAX_EXPERT_CONSECUTIVE_EXCHANGES;

            expertVirtualPlayer['alternativeMove']();
            expect(expertVirtualPlayer['consecutiveExchangeCount']).to.equal(MAX_EXPERT_CONSECUTIVE_EXCHANGES);
            expect(createActionDataSpy).to.have.been.called();
        });

        it('should call ActionPlace and reset exchange counter if a moves is found', () => {
            const wordFindingInstanceStub = createStubInstance(AbstractWordFinding);
            wordFindingInstanceStub['wordPlacements'] = [{} as unknown as ScoredWordPlacement];
            expertVirtualPlayer['wordFindingInstance'] = wordFindingInstanceStub as unknown as AbstractWordFinding;
            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return false;
            });
            const createActionDataSpy = spy.on(ActionPlace, 'createActionData', () => {});
            expertVirtualPlayer['consecutiveExchangeCount'] = 2;

            expertVirtualPlayer['alternativeMove']();
            expect(createActionDataSpy).to.have.been.called();
            expect(expertVirtualPlayer['consecutiveExchangeCount']).to.equal(0);
        });
    });

    describe('findAction', () => {
        it('should call computeWordPlacement and ActionPlace.createActionData if there is a placement found', () => {
            const computeWordPlacementSpy = spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return {} as unknown as ScoredWordPlacement;
            });

            const createActionDataSpy = spy.on(ActionPlace, 'createActionData', () => {});
            expertVirtualPlayer['findAction']();
            expect(computeWordPlacementSpy).to.have.been.called();
            expect(createActionDataSpy).to.have.been.called();
        });

        it('should call ActionExchange if no moves are found and exchange is possible', () => {
            const computeWordPlacementSpy = spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return undefined;
            });

            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return true;
            });
            const createActionDataSpy = spy.on(ActionExchange, 'createActionData', () => {});

            expertVirtualPlayer['findAction']();
            expect(computeWordPlacementSpy).to.have.been.called();
            expect(createActionDataSpy).to.have.been.called();
        });

        it('should call ActionPass if no moves are found and exchange is not possible', () => {
            const computeWordPlacementSpy = spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return undefined;
            });

            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return false;
            });
            const createActionDataSpy = spy.on(ActionPass, 'createActionData', () => {});

            expertVirtualPlayer['findAction']();
            expect(computeWordPlacementSpy).to.have.been.called();
            expect(createActionDataSpy).to.have.been.called();
        });
    });

    it('generateWordFindingRequest should call findPointRange method', () => {
        const findPointRangeSpy = spy.on(expertVirtualPlayer, 'findPointRange', () => {
            return;
        });
        expertVirtualPlayer['generateWordFindingRequest']();
        expect(findPointRangeSpy).to.have.been.called();
    });

    it('generateWordFindingRequest should return WordFindingRequest with correct data', () => {
        spy.on(expertVirtualPlayer, 'findPointRange', () => {
            return TEST_POINT_RANGE;
        });
        const testWordFindingRequest = expertVirtualPlayer['generateWordFindingRequest']();
        expect(testWordFindingRequest.useCase).to.equal(WordFindingUseCase.Expert);
        expect(testWordFindingRequest.pointHistory).to.deep.equal(expertVirtualPlayer.pointHistory);
        expect(testWordFindingRequest.pointRange).to.deep.equal(TEST_POINT_RANGE);
    });
});
