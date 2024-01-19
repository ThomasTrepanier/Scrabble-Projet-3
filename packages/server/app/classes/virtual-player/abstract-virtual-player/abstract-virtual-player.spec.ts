/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionPass } from '@app/classes/actions';
import { Board } from '@app/classes/board';
import { ActionData } from '@app/classes/communication/action-data';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import Game from '@app/classes/game/game';
import Range from '@app/classes/range/range';
import { AbstractWordFinding, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import { GAME_ID, PLAYER_ID, TEST_POINT_RANGE } from '@app/constants/virtual-player-tests-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { Delay } from '@app/utils/delay/delay';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import { createStubInstance, restore, SinonStubbedInstance } from 'sinon';
import { AbstractVirtualPlayer } from './abstract-virtual-player';

class TestClass extends AbstractVirtualPlayer {
    async findAction(): Promise<ActionData> {
        return ActionPass.createActionData();
    }

    generateWordFindingRequest(): WordFindingRequest {
        return {
            pointRange: this.findPointRange(),
            useCase: WordFindingUseCase.Beginner,
            pointHistory: this.pointHistory,
        };
    }

    findPointRange(): Range {
        return TEST_POINT_RANGE;
    }

    alternativeMove(): ActionData {
        return ActionPass.createActionData();
    }

    protected isExchangePossible(): boolean {
        return false;
    }
}

const playerId = 'testPlayerId';
const playerName = 'ElScrabblo';

describe('AbstractVirtualPlayer', () => {
    let abstractPlayer: TestClass;
    let wordFindingInstanceStub: SinonStubbedInstance<AbstractWordFinding>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService().withStubbed(ActiveGameService);
        [wordFindingInstanceStub] = testingUnit.setStubbedWordFindingService();
    });

    beforeEach(async () => {
        abstractPlayer = new TestClass(playerId, playerName);
    });

    afterEach(() => {
        chai.spy.restore();
        restore();
    });

    it('should create', () => {
        expect(abstractPlayer).to.exist;
    });

    it('should return true when getWordFindingService', () => {
        const wordFindingServiceTest = abstractPlayer.getWordFindingService();
        expect(abstractPlayer['wordFindingService']).to.equal(wordFindingServiceTest);
    });

    it('should return true when getActiveGameService', () => {
        const activeGameServiceTest = abstractPlayer.getActiveGameService();
        expect(abstractPlayer['activeGameService']).to.equal(activeGameServiceTest);
    });

    it('should return virtualPlayerService', () => {
        expect(abstractPlayer.getVirtualPlayerService() instanceof VirtualPlayerService).to.be.true;
    });

    describe('playTurn', async () => {
        let actionPassSpy: unknown;
        let sendActionSpy: unknown;
        beforeEach(() => {
            spy.on(Delay, 'for', () => {
                return;
            });
            spy.on(abstractPlayer, 'findAction', () => {
                return;
            });
            actionPassSpy = spy.on(ActionPass, 'createActionData');
            sendActionSpy = spy.on(abstractPlayer['virtualPlayerService'], 'sendAction');
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should send actionPass when no words are found', async () => {
            await abstractPlayer['playTurn']();

            expect(sendActionSpy).to.have.been.called();
            expect(actionPassSpy).to.have.been.called();
        });

        it('should send action returned by findAction when no words are found', async () => {
            spy.on(Promise, 'race', () => {
                return ['testArray'];
            });
            await abstractPlayer['playTurn']();

            expect(sendActionSpy).to.have.been.called();
            expect(actionPassSpy).to.not.have.been.called();
        });
    });

    describe('getGameBoard', () => {
        it('should call getGame', () => {
            const testBoard = {} as unknown as Board;
            const getGameSpy = spy.on(abstractPlayer['activeGameService'], 'getGame', () => {
                return testBoard;
            });
            abstractPlayer['getGameBoard'](GAME_ID, PLAYER_ID);
            expect(getGameSpy).to.have.been.called();
        });
    });

    describe('computeWordPlacement', () => {
        let gameStub: SinonStubbedInstance<Game>;

        beforeEach(() => {
            gameStub = createStubInstance(Game);
            gameStub.dictionarySummary = { id: 'testId' } as unknown as DictionarySummary;
            testingUnit.getStubbedInstance(ActiveGameService).getGame.returns(gameStub as unknown as Game);
            chai.spy.restore();
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should call findWords', () => {
            spy.on(abstractPlayer, 'getGameBoard', () => {
                return;
            });
            spy.on(abstractPlayer, 'generateWordFindingRequest', () => {
                return { useCase: WordFindingUseCase.Expert };
            });
            abstractPlayer['computeWordPlacement']();
            expect(wordFindingInstanceStub['findWords'].called).to.be.true;
        });

        it('should call getGameBoard and generateWord', () => {
            const getGameBoardSpy = spy.on(abstractPlayer, 'getGameBoard', () => {
                return;
            });
            const generateWordSpy = spy.on(abstractPlayer, 'generateWordFindingRequest', () => {
                return { useCase: WordFindingUseCase.Expert };
            });
            abstractPlayer['computeWordPlacement']();

            expect(getGameBoardSpy).to.have.been.called();
            expect(generateWordSpy).to.have.been.called();
        });
    });
});
