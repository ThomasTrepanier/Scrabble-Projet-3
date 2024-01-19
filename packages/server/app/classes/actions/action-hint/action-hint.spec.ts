/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Orientation, Position } from '@app/classes/board';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { AbstractWordFinding } from '@app/classes/word-finding';
import { NO_WORDS_FOUND } from '@app/constants/classes-constants';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import { PlacementToString } from '@app/utils/placement-to-string/placement-to-string';
import { UNKOWN_USER } from '@common/models/user';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import ActionHint from './action-hint';

const DEFAULT_PLAYER_1_ID = '1';

describe('ActionHint', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let wordFindingServiceStub: SinonStubbedInstance<WordFindingService>;
    let wordFindingInstanceStub: SinonStubbedInstance<AbstractWordFinding>;
    let action: ActionHint;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService();
        [wordFindingInstanceStub, wordFindingServiceStub] = testingUnit.setStubbedWordFindingService();
    });

    beforeEach(() => {
        gameStub = createStubInstance(Game);
        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, UNKOWN_USER);
        gameStub.dictionarySummary = { id: 'id' } as unknown as DictionarySummary;

        action = new ActionHint(gameStub.player1, gameStub as unknown as Game);
    });

    afterEach(() => {
        sinon.restore();
        testingUnit.restore();
    });

    describe('execute', () => {
        it('should call findWords', () => {
            action.execute();
            expect(wordFindingServiceStub.getWordFindingInstance.called).to.be.true;
            expect(wordFindingInstanceStub.findWords.called).to.be.true;
        });

        it('should set wordsPlacement', () => {
            (action['hintResult'] as unknown) = undefined;
            action.execute();
            expect(action['hintResult']).to.not.be.undefined;
        });
    });

    describe('getMessage', () => {
        it('should return message', () => {
            action['hintResult'] = [];
            expect(action.getMessage().message).to.not.be.undefined;
        });

        it('should return message with content', () => {
            const placementsAmount = 3;
            action['hintResult'] = [];

            for (let i = 0; i < placementsAmount; ++i) {
                action['hintResult'].push({
                    orientation: Orientation.Horizontal,
                    startPosition: new Position(0, 0),
                    tilesToPlace: [],
                    score: 0,
                });
            }

            const wordPlacementToCommandStringSpy = spy(PlacementToString, 'wordPlacementToCommandString');

            action.getMessage();

            expect(wordPlacementToCommandStringSpy.callCount).to.equal(placementsAmount);

            wordPlacementToCommandStringSpy.restore();
        });

        it('should have special message if less than 3 words', () => {
            const placementsAmount = 2;
            action['hintResult'] = [];

            for (let i = 0; i < placementsAmount; ++i) {
                action['hintResult'].push({
                    orientation: Orientation.Horizontal,
                    startPosition: new Position(0, 0),
                    tilesToPlace: [],
                    score: 0,
                });
            }

            const message: FeedbackMessage = action.getMessage();

            expect(message.message).to.include('mot(s) ont été trouvé');
        });

        it('should return no words found if empty', () => {
            const message: FeedbackMessage = action.getMessage();
            expect(message.message).to.equal(NO_WORDS_FOUND);
        });
    });

    describe('getOpponentMessage', () => {
        it('should return undefined', () => {
            expect(action.getOpponentMessage()).to.deep.equal({});
        });
    });
});
