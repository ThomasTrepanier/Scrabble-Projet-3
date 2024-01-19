/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Board } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import Range from '@app/classes/range/range';
import { Tile } from '@app/classes/tile';
import { boardFromLetterValues, DEFAULT_WORD_PLACEMENT, lettersToTiles, LetterValues } from '@app/classes/word-finding/helper.spec';
import { HINT_ACTION_NUMBER_OF_WORDS } from '@app/constants/classes-constants';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { WordFindingRequest, WordFindingUseCase } from '..';
import WordFindingHint from './word-finding-hint';
import * as sinon from 'sinon';

const GRID: LetterValues = [
    // 0   1    2    3    4
    [' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', 'X'], // 1
    [' ', ' ', 'A', 'B', 'C'], // 2
    [' ', ' ', ' ', ' ', 'Y'], // 3
    [' ', ' ', ' ', ' ', 'Z'], // 4
];

describe('WordFindingHint', () => {
    let wordFinding: WordFindingHint;
    let board: Board;
    let tiles: Tile[];
    let request: WordFindingRequest;
    let dictionaryStub: SinonStubbedInstance<Dictionary>;
    let scoreCalculatorStub: SinonStubbedInstance<ScoreCalculatorService>;

    beforeEach(() => {
        board = boardFromLetterValues(GRID);
        tiles = lettersToTiles(['L', 'M', 'N']);
        request = {
            useCase: 'none' as unknown as WordFindingUseCase,
            pointRange: new Range(0, 1),
            pointHistory: new Map(),
        };
        dictionaryStub = createStubInstance(Dictionary);
        scoreCalculatorStub = createStubInstance(ScoreCalculatorService, {
            calculatePoints: 0,
        });
        wordFinding = new WordFindingHint(
            board,
            tiles,
            request,
            dictionaryStub as unknown as Dictionary,
            scoreCalculatorStub as unknown as ScoreCalculatorService,
        );
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('handleWordPlacement', () => {
        it('should add to wordPlacements if wordPlacements length is lower than HINT_ACTION_NUMBER_OF_WORDS', () => {
            const wordPlacement = { ...DEFAULT_WORD_PLACEMENT };

            wordFinding['handleWordPlacement'](wordPlacement);

            expect(wordFinding['wordPlacements']).to.deep.equal([wordPlacement]);
        });

        it('should add if wordPlacement is better than already found', () => {
            wordFinding['wordPlacements'] = [];

            for (let i = 0; i < HINT_ACTION_NUMBER_OF_WORDS; ++i) {
                wordFinding['wordPlacements'].push({ ...DEFAULT_WORD_PLACEMENT, score: 0 });
            }

            const placement = { ...DEFAULT_WORD_PLACEMENT, score: 1 };

            wordFinding['handleWordPlacement'](placement);

            expect(wordFinding['wordPlacements']).to.include(placement);
        });

        it('should not add if wordPlacement is not better than already found', () => {
            wordFinding['wordPlacements'] = [];

            for (let i = 0; i < HINT_ACTION_NUMBER_OF_WORDS; ++i) {
                wordFinding['wordPlacements'].push({ ...DEFAULT_WORD_PLACEMENT, score: 1 });
            }

            const placement = { ...DEFAULT_WORD_PLACEMENT, score: 0 };

            wordFinding['handleWordPlacement'](placement);

            expect(wordFinding['wordPlacements']).to.not.include(placement);
        });
    });

    describe('isSearchCompleted', () => {
        it('should return false', () => {
            expect(wordFinding['isSearchCompleted']()).to.be.false;
        });
    });
});
