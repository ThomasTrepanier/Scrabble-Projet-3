/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Board } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import { Tile } from '@app/classes/tile';
import { boardFromLetterValues, DEFAULT_WORD_PLACEMENT, lettersToTiles, LetterValues } from '@app/classes/word-finding/helper.spec';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { WordFindingRequest, WordFindingUseCase } from '..';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-finding-types';
import Range from '@app/classes/range/range';
import WordFindingExpert from './word-finding-expert';

const GRID: LetterValues = [
    // 0   1    2    3    4
    [' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', 'X'], // 1
    [' ', ' ', 'A', 'B', 'C'], // 2
    [' ', ' ', ' ', ' ', 'Y'], // 3
    [' ', ' ', ' ', ' ', 'Z'], // 4
];

describe('WordFindingExpert', () => {
    let wordFinding: WordFindingExpert;
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
        wordFinding = new WordFindingExpert(
            board,
            tiles,
            request,
            dictionaryStub as unknown as Dictionary,
            scoreCalculatorStub as unknown as ScoreCalculatorService,
        );
    });

    describe('handleWordPlacement', () => {
        let wordPlacement: ScoredWordPlacement;

        beforeEach(() => {
            wordPlacement = { ...DEFAULT_WORD_PLACEMENT, score: 46 };
        });

        it('should not update values if the score is lower than the actual highest score', () => {
            wordFinding['wordPlacements'] = [{ score: 100 } as unknown as ScoredWordPlacement];

            wordFinding['handleWordPlacement'](wordPlacement);

            expect(wordFinding['wordPlacements']).to.deep.equal([{ score: 100 } as unknown as ScoredWordPlacement]);
        });

        it('should update values if the score is higher than the actual highest score', () => {
            wordFinding['wordPlacements'] = [{ score: 10 } as unknown as ScoredWordPlacement];

            wordFinding['handleWordPlacement'](wordPlacement);

            expect(wordFinding['wordPlacements']).to.deep.equal([wordPlacement]);
        });

        it('should update values if it is the first move found', () => {
            wordFinding['wordPlacements'] = [];

            wordFinding['handleWordPlacement'](wordPlacement);

            expect(wordFinding['wordPlacements']).to.deep.equal([wordPlacement]);
        });
    });

    describe('isSearchCompleted', () => {
        it('should return false', () => {
            expect(wordFinding['isSearchCompleted']()).to.be.false;
        });
    });
});
